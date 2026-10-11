import { SCENES, sanitize } from './scenes.js';

const TAU = Math.PI * 2;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const wrap = (value, length) => ((value % length) + length) % length;
const shortest = (value, length) => value - Math.round(value / length) * length;
const difference = (from, to, world) => ({ x: shortest(to.x - from.x, world.width), y: shortest(to.y - from.y, world.height) });
function advance(p, step, world) {
  const x = p.x + p.vx * step, y = p.y + p.vy * step;
  p.x = wrap(x, world.width); p.y = wrap(y, world.height);
  return x < 0 || x >= world.width || y < 0 || y >= world.height;
}
function periodicCopies(p, world, padding, draw) {
  const xs = [0], ys = [0];
  if (p.x < padding) xs.push(world.width);
  if (p.x > world.width - padding) xs.push(-world.width);
  if (p.y < padding) ys.push(world.height);
  if (p.y > world.height - padding) ys.push(-world.height);
  for (const x of xs) for (const y of ys) draw(p.x + x, p.y + y);
}

class Neighborhood {
  constructor(size = 75) { this.size = size; this.cells = new Map(); }
  build(particles, world) {
    this.cells.clear();
    this.cols = Math.max(1, Math.floor(world.width / this.size)); this.rows = Math.max(1, Math.floor(world.height / this.size));
    this.cellWidth = world.width / this.cols; this.cellHeight = world.height / this.rows;
    for (const p of particles) {
      const key = `${Math.floor(p.x / this.cellWidth)},${Math.floor(p.y / this.cellHeight)}`;
      if (!this.cells.has(key)) this.cells.set(key, []);
      this.cells.get(key).push(p);
    }
  }
  visit(p, radius, visit) {
    const nx = Math.ceil(radius / this.cellWidth), ny = Math.ceil(radius / this.cellHeight), cx = Math.floor(p.x / this.cellWidth), cy = Math.floor(p.y / this.cellHeight);
    for (let ix = 0; ix < Math.min(this.cols, nx * 2 + 1); ix++) for (let iy = 0; iy < Math.min(this.rows, ny * 2 + 1); iy++) {
      const cell = this.cells.get(`${wrap(cx - nx + ix, this.cols)},${wrap(cy - ny + iy, this.rows)}`);
      if (cell) for (const q of cell) if (p !== q) visit(q);
    }
  }
}

function limit(p, min, max) {
  const speed = Math.hypot(p.vx, p.vy);
  if (speed < .00001) { p.vx = min; p.vy = 0; return; }
  const factor = clamp(speed, min, max) / speed;
  p.vx *= factor; p.vy *= factor;
}
function projectPointer(engine, p, strength = .2) {
  const m = engine.pointer;
  if (!m.active || engine.config.pointer === 'none') return { x: 0, y: 0 };
  const { x: dx, y: dy } = difference(m, p, engine.world), d = Math.hypot(dx, dy);
  if (d > 145 || d < .01) return { x: 0, y: 0 };
  const f = (1 - d / 145) * strength * (engine.config.pointer === 'attract' ? -.55 : 1);
  return { x: dx / d * f, y: dy / d * f };
}

const flock = {
  create(e, i, edge = false) {
    const x = Math.random() * e.world.width, y = Math.random() * e.world.height, angle = Math.random() * TAU;
    return { x, y, vx: Math.cos(angle) * 1.45, vy: Math.sin(angle) * 1.45, size: 2 + Math.random() * 1.2, phase: Math.random() * TAU, z: Math.random(), age: edge ? 0 : 1 };
  },
  update(e, step) {
    const c = e.config, fish = e.scene.id === 'fish', radius = c.perception;
    e.grid.build(e.particles, e.world);
    // Calculate from a single snapshot before integrating, avoiding array-order bias.
    for (const p of e.particles) {
      let count = 0, sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0;
      e.grid.visit(p, radius, q => {
        const { x: dx, y: dy } = difference(p, q, e.world), d2 = dx * dx + dy * dy;
        if (d2 > radius * radius || d2 < .0001) return;
        count++; ax += q.vx; ay += q.vy; cx += dx; cy += dy;
        if (d2 < 20 * 20) { sx -= dx / d2; sy -= dy / d2; }
      });
      let fx = sx * c.separation * .9, fy = sy * c.separation * .9;
      if (count) { fx += (ax / count - p.vx) * .047 * c.alignment + cx / count * .0008 * c.cohesion; fy += (ay / count - p.vy) * .047 * c.alignment + cy / count * .0008 * c.cohesion; }
      for (const hunter of e.predators) {
        const { x: dx, y: dy } = difference(hunter, p, e.world), distance = Math.hypot(dx, dy);
        if (distance < 115 && distance > .01) { fx += dx / distance * (1 - distance / 115) * .65; fy += dy / distance * (1 - distance / 115) * .65; }
      }
      const pointer = projectPointer(e, p);
      fx += pointer.x; fy += pointer.y;
      if (fish) { fx += Math.cos(p.y / e.world.height * TAU + e.time * .16) * c.current * .019; fy += Math.sin(p.x / e.world.width * TAU + e.time * .16) * c.current * .032; }
      // Tiny individual perturbations keep perfectly aligned packs from freezing.
      fx += Math.cos(p.phase + e.time * .7) * .0018;
      fy += Math.sin(p.phase + e.time * .7) * .0018;
      const force = Math.hypot(fx, fy), scale = force > .25 ? .25 / force : 1;
      p.ax = fx * scale; p.ay = fy * scale;
    }
    for (const p of e.particles) {
      p.vx += p.ax * step; p.vy += p.ay * step; limit(p, fish ? .75 : 1.15, fish ? 1.8 : 2.35);
      advance(p, step, e.world);
      p.age = Math.min(1, p.age + step / 90);
    }
    e.syncPredators();
    const eaten = new Set();
    for (const hunter of e.predators) {
      hunter.rest = Math.max(0, hunter.rest - step);
      let target = null, nearest = Infinity;
      for (const p of e.particles) {
        if (eaten.has(p)) continue;
        const delta = difference(hunter, p, e.world), d = delta.x ** 2 + delta.y ** 2;
        if (d < nearest) { target = p; nearest = d; }
      }
      if (target && !hunter.rest) {
        const d = Math.sqrt(nearest) || 1;
        const delta = difference(hunter, target, e.world);
        hunter.vx += (delta.x / d * 2.7 - hunter.vx) * .019 * step;
        hunter.vy += (delta.y / d * 2.7 - hunter.vy) * .019 * step;
        if (d < 10) { eaten.add(target); hunter.rest = 110; e.captured++; e.fades.push({ x: target.x, y: target.y, life: 1 }); if (c.replenish === 'yes') e.respawns.push(e.time + 2.5); }
      } else { hunter.vx *= .99; hunter.vy *= .99; }
      for (const other of e.predators) if (other !== hunter) {
        const { x: dx, y: dy } = difference(other, hunter, e.world), d = Math.hypot(dx, dy);
        if (d < 40 && d > .01) { hunter.vx += dx / d * .04 * step; hunter.vy += dy / d * .04 * step; }
      }
      limit(hunter, .25, 2.7); advance(hunter, step, e.world);
    }
    if (eaten.size) e.particles = e.particles.filter(p => !eaten.has(p));
    e.respawns = e.respawns.filter(at => {
      if (at > e.time) return true;
      if (c.replenish === 'yes' && e.particles.length < c.count) e.particles.push(this.create(e, e.particles.length, true));
      return false;
    });
  },
  draw(e, ctx) {
    const c = e.config;
    for (const p of e.particles) {
      const depth = c.depth === 'depth', size = p.size * (depth ? .65 + p.z * .8 : 1);
      periodicCopies(p, e.world, 14, (x, y) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.vy, p.vx));
      ctx.globalAlpha = (depth ? .3 + p.z * .65 : .76) * p.age;
      ctx.fillStyle = e.palette.particle;
      if (c.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, size * .7, 0, TAU); ctx.fill(); }
      else if (c.shape === 'line') { ctx.strokeStyle = e.palette.particle; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-size * 1.7, 0); ctx.lineTo(size, 0); ctx.stroke(); }
      else if (c.shape === 'fish') {
        ctx.beginPath(); ctx.ellipse(0, 0, size * 1.7, size * .65, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-size * 1.4, 0); ctx.lineTo(-size * 2.5, -size * .8); ctx.lineTo(-size * 2.5, size * .8); ctx.closePath(); ctx.fill();
      } else { ctx.beginPath(); ctx.moveTo(size * 1.9, 0); ctx.lineTo(-size, size * .85); ctx.lineTo(-size * .4, 0); ctx.lineTo(-size, -size * .85); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      });
    }
    for (const p of e.predators) {
      periodicCopies(p, e.world, 14, (x, y) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = e.palette.predator;
      ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-8, 6); ctx.lineTo(-3, 0); ctx.lineTo(-8, -6); ctx.closePath(); ctx.fill(); ctx.restore();
      });
    }
  },
};

const fluid = {
  create(e, i) {
    const angle = Math.random() * TAU;
    return { x: Math.random() * e.world.width, y: Math.random() * e.world.height, vx: Math.cos(angle) * .24, vy: Math.sin(angle) * .24, z: Math.random(), phase: Math.random() * TAU, size: 1, age: 1 };
  },
  update(e, step) {
    const c = e.config, radius = c.radius * 2;
    e.grid.build(e.particles, e.world);
    for (const p of e.particles) {
      let fx = 0, fy = 0, vx = 0, vy = 0, n = 0;
      e.grid.visit(p, 78, q => {
        const { x: dx, y: dy } = difference(p, q, e.world), d = Math.hypot(dx, dy);
        if (d < .001 || d > 78) return;
        const force = d < radius ? -(1 - d / radius) * .095 * c.pressure : (1 - d / 78) * .0017 * c.tension;
        fx += dx / d * force; fy += dy / d * force;
        if (d < radius * 1.5) { vx += q.vx; vy += q.vy; n++; }
      });
      if (n) { fx += (vx / n - p.vx) * .025 * c.viscosity; fy += (vy / n - p.vy) * .025 * c.viscosity; }
      const pointer = projectPointer(e, p, .16);
      // Weak ambient agitation keeps the desktop scene alive after settling.
      p.ax = fx + pointer.x + Math.sin(e.time * .32 + p.y / e.world.height * TAU) * .002;
      p.ay = fy + pointer.y + Math.cos(e.time * .27 + p.x / e.world.width * TAU) * .002;
    }
    for (const p of e.particles) {
      p.vx = (p.vx + p.ax * step) * Math.pow(1 - c.viscosity * .007, step);
      p.vy = (p.vy + p.ay * step) * Math.pow(1 - c.viscosity * .007, step);
      limit(p, 0, 2.5); advance(p, step, e.world);
    }
  },
  draw(e, ctx) {
    // A small implicit surface joins neighboring microdrops visually. The
    // particles remain the simulation units; this is not a full fluid solver.
    if (!e.fluidSurface) {
      const surface = document.createElement('canvas');
      const ratio = 500 / Math.max(e.world.width, e.world.height);
      surface.width = Math.max(1, Math.round(e.world.width * ratio)); surface.height = Math.max(1, Math.round(e.world.height * ratio));
      e.fluidSurface = { surface, s: surface.getContext('2d'), pixels: new ImageData(surface.width, surface.height), field: new Float32Array(surface.width * surface.height), radius: 0, ratio };
    }
    const cache = e.fluidSurface, { field, s, surface, pixels } = cache;
    const width = surface.width, height = surface.height;
    if (cache.radius !== e.config.radius) {
      cache.radius = e.config.radius;
      const sigma = Math.max(.8, cache.radius * 1.3 * cache.ratio), extent = Math.ceil(sigma * 3), size = extent * 2 + 1;
      cache.extent = extent; cache.kernelSize = size; cache.kernel = new Float32Array(size * size);
      for (let y = -extent; y <= extent; y++) for (let x = -extent; x <= extent; x++) cache.kernel[(y + extent) * size + x + extent] = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
    }
    field.fill(0);
    const { extent, kernel, kernelSize } = cache;
    for (const p of e.particles) {
      const px = Math.round(p.x / e.world.width * width), py = Math.round(p.y / e.world.height * height);
      for (let y = py - extent; y <= py + extent; y++) {
        const row = wrap(y, height) * width, kernelRow = (y - py + extent) * kernelSize;
        for (let x = px - extent; x <= px + extent; x++) field[row + wrap(x, width)] += kernel[kernelRow + x - px + extent];
      }
    }
    const output = pixels.data;
    const rgb = [1, 3, 5].map(i => parseInt(e.color.slice(i, i + 2), 16));
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const index = y * width + x, i = index * 4, value = field[index];
      if (value < .64) { output[i + 3] = 0; continue; }
      const nx = field[y * width + wrap(x + 1, width)] - field[y * width + wrap(x - 1, width)], ny = field[wrap(y + 1, height) * width + x] - field[wrap(y - 1, height) * width + x];
      const light = clamp((e.dark ? .12 : .63) + (nx + ny) * .9 * Math.max(0, 1.5 - value), e.dark ? .02 : .15, .96);
      for (let channel = 0; channel < 3; channel++) output[i + channel] = rgb[channel] * (1 - light) + (e.dark ? 210 : 246) * light;
      output[i + 3] = Math.min(225, (value - .64) * 650);
    }
    s.putImageData(pixels, 0, 0); ctx.drawImage(surface, 0, 0, e.world.width, e.world.height);
  },
};

const gravity = {
  centers(e) {
    const n = e.config.centers;
    const cx = e.world.width / 2, cy = e.world.height / 2, spread = Math.min(115, cx * .3, cy * .3);
    return Array.from({ length: n }, (_, i) => n === 1 ? { x: cx, y: cy } : { x: cx + Math.cos(i / n * TAU - .4) * spread, y: cy + Math.sin(i / n * TAU - .4) * spread });
  },
  create(e) {
    const x = Math.random() * e.world.width, y = Math.random() * e.world.height, a = Math.random() * TAU;
    const r = Math.max(28, Math.hypot(x - e.world.width / 2, y - e.world.height / 2)), v = Math.sqrt(240 * e.config.gravity / r) * e.config.orbit;
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, size: .65 + Math.random() * 1.15, z: Math.random(), trail: [], age: 1 };
  },
  update(e, step) {
    const centers = this.centers(e), c = e.config;
    for (const p of e.particles) {
      let ax = 0, ay = 0;
      for (const center of centers) {
        const { x: dx, y: dy } = difference(p, center, e.world), d2 = dx * dx + dy * dy + 28 * 28;
        const f = 240 * c.gravity / centers.length / Math.pow(d2, 1.5);
        ax += dx * f; ay += dy * f;
      }
      const pointer = projectPointer(e, p, .008);
      p.vx += (ax + pointer.x) * step; p.vy += (ay + pointer.y) * step;
      limit(p, 0, 4);
      if (advance(p, step, e.world)) p.trail.length = 0;
      if (e.tick % 3 === 0) p.trail.push([p.x, p.y]);
      if (p.trail.length > c.trail) p.trail.splice(0, p.trail.length - c.trail);
    }
  },
  draw(e, ctx) {
    const c = e.config;
    for (const p of e.particles) {
      const alpha = c.depth === 'depth' ? .25 + p.z * .7 : .72;
      if (p.trail.length > 1) {
        ctx.beginPath(); ctx.moveTo(...p.trail[0]); for (let i = 1; i < p.trail.length; i++) ctx.lineTo(...p.trail[i]);
        ctx.strokeStyle = e.palette.particle; ctx.globalAlpha = alpha * .23; ctx.lineWidth = .65; ctx.stroke();
      }
      ctx.globalAlpha = alpha; ctx.fillStyle = e.palette.particle;
      periodicCopies(p, e.world, 4, (x, y) => { ctx.beginPath(); ctx.arc(x, y, p.size * (c.depth === 'depth' ? .6 + p.z : 1), 0, TAU); ctx.fill(); });
    }
    ctx.globalAlpha = 1;
    for (const p of this.centers(e)) {
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 35);
      glow.addColorStop(0, e.palette.center); glow.addColorStop(.13, e.palette.glow); glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, 35, 0, TAU); ctx.fill();
      ctx.fillStyle = e.palette.center; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, TAU); ctx.fill();
    }
  },
};

export const MODELS = Object.freeze({ flock, fluid, gravity });

export class EmergenceEngine {
  constructor(canvas, { scene = 'birds', config, color = '#48614c', dark = false } = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: true });
    this.grid = new Neighborhood(); this.pointer = { active: false, x: 0, y: 0 };
    this.paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.time = 0; this.tick = 0; this.lastFrame = 0; this.accumulator = 0; this.destroyed = false;
    this.setPalette(color, dark); this.resize(); this.setScene(scene, config);
    this.onResize = () => this.resize(); this.onVisibility = () => { this.lastFrame = 0; this.accumulator = 0; };
    window.addEventListener('resize', this.onResize); document.addEventListener('visibilitychange', this.onVisibility);
    this.frame = this.frame.bind(this); this.raf = requestAnimationFrame(this.frame);
  }
  setPalette(color, dark) {
    this.color = /^#[a-f0-9]{6}$/i.test(color) ? color : '#48614c'; this.dark = dark;
    const rgb = [1, 3, 5].map(i => parseInt(this.color.slice(i, i + 2), 16));
    const mix = (target, amount, alpha = 1) => `rgba(${rgb.map((v, i) => Math.round(v * (1 - amount) + target[i] * amount)).join(',')},${alpha})`;
    this.palette = {
      particle: mix(dark ? [228, 238, 216] : [20, 42, 30], dark ? .72 : .15),
      predator: dark ? '#d6b690' : '#967451',
      water: mix(dark ? [125, 184, 172] : [216, 232, 219], dark ? .45 : .62, .76),
      waterLight: dark ? 'rgba(190,221,206,.9)' : 'rgba(255,255,252,.94)',
      waterEdge: mix(dark ? [63, 119, 108] : [112, 155, 138], .6, .56),
      waterStroke: mix([107, 149, 132], .5, .2), highlight: dark ? 'rgba(223,245,230,.44)' : 'rgba(255,255,255,.8)',
      center: dark ? '#e2d8ad' : '#688674', glow: dark ? 'rgba(212,204,159,.18)' : 'rgba(78,112,84,.12)',
    };
    if (this.scene) this.draw();
  }
  resize() {
    const previous = this.world;
    const box = this.canvas.getBoundingClientRect(); this.width = box.width; this.height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, 2); this.dpr = dpr;
    this.canvas.width = Math.round(box.width * dpr); this.canvas.height = Math.round(box.height * dpr);
    this.scale = Math.min(box.width / (box.width > 700 ? 1500 : 900), box.height / 1000) * 1.1;
    this.origin = { x: 0, y: 0 };
    this.world = { width: box.width / this.scale, height: box.height / this.scale };
    if (previous) {
      for (const p of [...(this.particles || []), ...(this.predators || []), ...(this.fades || [])]) {
        p.x = wrap(p.x / previous.width * this.world.width, this.world.width); p.y = wrap(p.y / previous.height * this.world.height, this.world.height);
        if (p.trail) p.trail.length = 0;
      }
    }
    this.fluidSurface = null; this.pointer.active = false;
    if (this.scene) this.draw();
  }
  setScene(id, config) {
    this.scene = SCENES[id] || SCENES.birds; this.model = MODELS[this.scene.model];
    this.config = sanitize(this.scene.id, config); this.pointer.active = false; this.reset();
    this.canvas.dataset.scene = this.scene.id;
  }
  reset() {
    this.time = 0; this.tick = 0; this.accumulator = 0; this.lastFrame = 0; this.captured = 0;
    this.predators = []; this.respawns = []; this.fades = [];
    this.particles = Array.from({ length: this.config.count }, (_, i) => this.model.create(this, i));
    this.syncPredators(); this.draw();
  }
  setConfig(config) {
    const oldCount = this.config.count, oldReplenish = this.config.replenish;
    this.config = sanitize(this.scene.id, config);
    if (this.config.count !== oldCount) {
      this.particles.length = Math.min(this.particles.length, this.config.count);
      while (this.particles.length < this.config.count) this.particles.push(this.model.create(this, this.particles.length));
      this.respawns = [];
    }
    if (this.config.replenish === 'no') this.respawns = [];
    else if (oldReplenish === 'no' && this.config.replenish === 'yes') this.respawns = Array.from({ length: Math.max(0, this.config.count - this.particles.length) }, (_, i) => this.time + 1 + i * .06);
    this.syncPredators(); this.draw();
  }
  syncPredators() {
    const target = this.config.predators || 0;
    this.predators.length = Math.min(target, this.predators.length);
    while (this.predators.length < target) {
      const angle = Math.random() * TAU;
      this.predators.push({ x: Math.random() * this.world.width, y: Math.random() * this.world.height, vx: Math.cos(angle) * .8, vy: Math.sin(angle) * .8, rest: 0 });
    }
  }
  setPointer(x, y, active = true) { this.pointer = { x: (x - this.origin.x) / this.scale, y: (y - this.origin.y) / this.scale, active }; }
  setPaused(value) { this.paused = value; this.lastFrame = 0; this.accumulator = 0; }
  step(dt = 1 / 60) {
    const step = dt * 60; this.time += dt; this.tick++;
    this.model.update(this, step);
    for (const fade of this.fades) fade.life -= dt * 2;
    this.fades = this.fades.filter(fade => fade.life > 0);
  }
  frame(now) {
    if (this.destroyed) return;
    if (!document.hidden && !this.paused) {
      const elapsed = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, .06) : 0;
      this.accumulator += elapsed * this.config.speed;
      let iterations = 0;
      while (this.accumulator >= 1 / 60 && iterations++ < 8) { this.step(); this.accumulator -= 1 / 60; }
      this.draw();
    }
    this.lastFrame = now; this.raf = requestAnimationFrame(this.frame);
  }
  draw() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, this.dpr * this.origin.x, this.dpr * this.origin.y);
    this.model.draw(this, ctx);
    for (const fade of this.fades) { ctx.globalAlpha = fade.life * .35; ctx.strokeStyle = this.palette.predator; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(fade.x, fade.y, 3 + (1 - fade.life) * 8, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  snapshot() {
    return { scene: this.scene.id, model: this.scene.model, world: { ...this.world }, boundary: 'periodic', count: this.particles.length, target: this.config.count, predators: this.predators.length, captured: this.captured, pending: this.respawns.length, time: this.time, paused: this.paused, finite: this.particles.every(p => [p.x, p.y, p.vx, p.vy].every(Number.isFinite)), particles: this.particles.slice(0, 12).map(p => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy })) };
  }
  destroy() {
    this.destroyed = true; cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
