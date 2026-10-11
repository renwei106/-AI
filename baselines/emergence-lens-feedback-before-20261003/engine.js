import { SCENES, sanitize } from './scenes.js';

const TAU = Math.PI * 2;
const COSMIC_CHARGE = 1.2, COSMIC_EXPANSION = 4.8;
const smooth = t => t * t * (3 - 2 * t);
// Visual size only: keep the full-screen world and simulation distances unchanged.
const BODY_SCALE_2D = .7, BODY_SCALE_3D = .22;
// Abstract predator silhouettes follow the existing shape setting, without changing hunting bounds.
const PREDATOR_MESHES = {
  bird: {
    vertices: [[2,0,0],[.15,.35,0],[-1.3,1.65,.15],[-.65,0,.3],[-1.3,-1.65,.15],[.15,-.35,0]],
    faces: [[0,1,3],[1,2,3],[0,3,5],[3,4,5]],
  },
  fish: {
    // A tapered body, dorsal fin, paired pectoral fins and an asymmetric forked tail.
    vertices: [[2,0,0],[.5,.45,0],[.5,0,.38],[.5,-.45,0],[.5,0,-.3],[-1.2,0,0],[-.25,0,1.25],[-.65,1.05,-.1],[-.65,-1.05,-.1],[-2,0,1],[-1.7,0,0],[-2,0,-.7]],
    faces: [[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,2,1],[5,3,2],[5,4,3],[5,1,4],[2,6,5],[1,7,5],[3,5,8],[5,9,10],[5,10,11]],
  },
};
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const wrap = (value, length) => ((value % length) + length) % length;
const shortest = (value, length) => value - Math.round(value / length) * length;
const axisDelta = (value, length, threeD) => threeD ? value : shortest(value, length);
const boundCoordinate = (value, length, threeD) => threeD ? clamp(value, 0, length) : wrap(value, length);
const difference = (from, to, world) => ({ x: axisDelta(to.x - from.x, world.width, world.bounded), y: axisDelta(to.y - from.y, world.height, world.bounded) });
function advance(p, step, world) {
  const x = p.x + p.vx * step, y = p.y + p.vy * step;
  if(world.bounded){p.x=x;p.y=y;return false;}
  p.x = wrap(x, world.width); p.y = wrap(y, world.height);
  return x < 0 || x >= world.width || y < 0 || y >= world.height;
}
function periodicCopies(p, world, padding, draw) {
  if(world.bounded||p.incoming){draw(p.x,p.y);return;}
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
  if (!m.active || !['repel', 'attract'].includes(engine.config.pointer)) return { x: 0, y: 0 };
  const { x: dx, y: dy } = difference(m, p, engine.world), d = Math.hypot(dx, dy);
  if (d > 145 || d < .01) return { x: 0, y: 0 };
  const f = (1 - d / 145) * strength * (engine.config.pointer === 'attract' ? -.55 : 1);
  return { x: dx / d * f, y: dy / d * f };
}

const flock = {
  create(e, i, edge = false) {
    const x = Math.random() * e.world.width, y = Math.random() * e.world.height, angle = Math.random() * TAU;
    return seed3(e, { x, y, vx: Math.cos(angle) * 1.45, vy: Math.sin(angle) * 1.45, size: 2 + Math.random() * 1.2, phase: Math.random() * TAU, z: Math.random(), age: edge ? 0 : 1 });
  },
  update(e, step) {
    const c = e.config, fish = c.shape === 'fish', radius = c.perception;
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
        hunter.vx += (delta.x / d * 2.7 * c.huntSpeed - hunter.vx) * .019 * step;
        hunter.vy += (delta.y / d * 2.7 * c.huntSpeed - hunter.vy) * .019 * step;
        if (d < c.captureRadius) { eaten.add(target); hunter.rest = c.huntRest * 60; hunter.meals++; e.captured++; e.fades.push({ x: target.x, y: target.y, life: 1 }); if (c.replenish === 'yes') e.respawns.push(e.time + 2.5); }
      } else { hunter.vx *= .99; hunter.vy *= .99; }
      for (const other of e.predators) if (other !== hunter) {
        const { x: dx, y: dy } = difference(other, hunter, e.world), d = Math.hypot(dx, dy);
        if (d < 40 && d > .01) { hunter.vx += dx / d * .04 * step; hunter.vy += dy / d * .04 * step; }
      }
      limit(hunter, .25, 2.7 * c.huntSpeed); advance(hunter, step, e.world);
    }
    if (eaten.size) e.particles = e.particles.filter(p => !eaten.has(p));
    e.respawns = e.respawns.filter(at => {
      if (at > e.time) return true;
      if (c.replenish === 'yes' && e.particles.length < c.count) e.particles.push(this.create(e, e.particles.length, true));
      return false;
    });
    e.breedPopulation(step / 60);
  },
  draw(e, ctx) {
    const c = e.config;
    for (const p of e.particles) {
      const depth = c.depth === 'depth', size = p.size * BODY_SCALE_2D * (depth ? .65 + p.z * .8 : 1);
      periodicCopies(p, e.world, 14, (x, y) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.vy, p.vx));
      ctx.globalAlpha = (depth ? .3 + p.z * .65 : .76) * p.age;
      ctx.fillStyle = e.palette.particle;
      if (c.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, size * .7, 0, TAU); ctx.fill(); }
      else if (c.shape === 'line') { ctx.strokeStyle = e.palette.particle; ctx.lineWidth = 1.1 * BODY_SCALE_2D; ctx.beginPath(); ctx.moveTo(-size * 1.7, 0); ctx.lineTo(size, 0); ctx.stroke(); }
      else if (c.shape === 'bird') {
        const wing=.75+Math.sin(e.time*6+p.phase)*.3;
        ctx.beginPath();ctx.moveTo(size*1.7,0);ctx.lineTo(0,-size*.4);ctx.lineTo(-size*1.6,-size*2*wing);ctx.lineTo(-size*.7,0);ctx.lineTo(-size*1.6,size*2*wing);ctx.lineTo(0,size*.4);ctx.closePath();ctx.fill();
      } else if (c.shape === 'fish') {
        ctx.beginPath(); ctx.ellipse(0, 0, size * 1.7, size * .65, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-size * 1.4, 0); ctx.lineTo(-size * 2.5, -size * .8); ctx.lineTo(-size * 2.5, size * .8); ctx.closePath(); ctx.fill();
      } else { ctx.beginPath(); ctx.moveTo(size * 1.9, 0); ctx.lineTo(-size, size * .85); ctx.lineTo(-size * .4, 0); ctx.lineTo(-size, -size * .85); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      });
    }
    for (const p of e.predators) {
      periodicCopies(p, e.world, 14, (x, y) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = e.palette.predator;
      ctx.globalAlpha = .95;
      ctx.scale(BODY_SCALE_2D, BODY_SCALE_2D);
      ctx.beginPath();
      if (c.shape === 'bird') {
        ctx.moveTo(11,0); ctx.lineTo(1,-2); ctx.lineTo(-8,-10); ctx.lineTo(-4,0); ctx.lineTo(-8,10); ctx.lineTo(1,2);
      } else if (c.shape === 'fish') {
        ctx.moveTo(12,0); ctx.quadraticCurveTo(7,-3,3,-3);
        ctx.lineTo(0,-8); ctx.lineTo(-2,-3); ctx.lineTo(-7,-1);
        ctx.lineTo(-12,-6); ctx.lineTo(-10,0); ctx.lineTo(-12,5); ctx.lineTo(-7,1);
        ctx.lineTo(-2,2.5); ctx.lineTo(1,6); ctx.lineTo(.5,2.8); ctx.quadraticCurveTo(7,3,12,0);
      } else {
        ctx.moveTo(11,0); ctx.lineTo(-8,6); ctx.lineTo(-3,0); ctx.lineTo(-8,-6);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
      });
    }
  },
};

// Mass adds at most 20% to visual radius; collision reach stays fixed.
const cosmosRadius = (p = {}) => 1.8 * clamp(Math.cbrt(p.mass || 1), .35, 1);
const cosmicVisualRadius = p => cosmosRadius(p) * (1 + .2 * (1 - 1 / Math.sqrt(Math.max(1, p.mass || 1))));
const COSMIC_GRAVITY = .6, COSMIC_RATE = .3;
const cosmicVisibleSpan = e => Math.min(e.width,e.height)/(e.is3D?e.projection3.focal/e.projection3.distance:e.scale);
// Express gravity, contact distances and seed velocities in the same spatial units.
// 3D uses a closer camera; it must not accelerate a smaller world with the 2D G.
const cosmicUnit = e => cosmicVisibleSpan(e)/900;
const cosmicG = e => COSMIC_GRAVITY * cosmicUnit(e)**3;
// A visual cutoff for negligible distant forces, not a physical limit of gravity.
const cosmicReach = (e,mass) => cosmicVisibleSpan(e)*.024*Math.sqrt(Math.max(.001,mass)*e.config.mutualGravity/.7);
function evolveBlackHoles(e,step) {
  const total=e.particles.reduce((sum,p)=>sum+p.mass,0),enabled=e.config.blackHoles==='yes';
  for(const p of e.particles){
    // A theme rule based on the mass currently present, including incoming dust.
    // Once formed, a hole stays one until reset or the rule is switched off.
    p.blackHole=enabled&&(p.blackHole||total>0&&p.mass/total>=e.config.blackHoleThreshold/100);
    const target=p.blackHole?1:0;
    p.blackHoleLevel=enabled?(p.blackHoleLevel||0)+(target-(p.blackHoleLevel||0))*(1-Math.exp(-step/45)):0;
  }
}
// Keep the existing trail setting; each increment retains 25 ms of playback time.
const cosmicTrailDuration = e => e.config.trail / 40;
function recordCosmicTrail(e,p) {
  const duration=cosmicTrailDuration(e);
  if(!duration){p.trail.length=0;return;}
  if(!p.trail.length||e.trailTime-p.trail.at(-1)[3]>=.02)p.trail.push([p.x,p.y,p.z3,e.trailTime]);
  const cutoff=e.trailTime-duration;
  // Retain one older sample to interpolate the exact start of the time window.
  while(p.trail.length>1&&p.trail[1][3]<=cutoff)p.trail.shift();
}
function drawCosmicTrails(e,ctx,project,world,threeD=false) {
  // Batch similar opacities: a soft fade without thousands of gradient objects.
  const bands=Array.from({length:24},()=>[]),opacityStep=.26/bands.length;
  for(const p of e.particles){
    const duration=cosmicTrailDuration(e);
    if(!duration||!p.trail.length)continue;
    const cutoff=e.trailTime-duration;
    const history=[...p.trail,[p.x,p.y,p.z3,e.trailTime]];
    const points=history.map(([x,y,z3,time])=>({...project({x,y,z3}),time}));
    const segments=[];
    for(let i=1;i<points.length;i++){
      let a=points[i-1];const b=points[i];
      if(b.time<=cutoff)continue;
      if(a.time<cutoff){const t=(cutoff-a.time)/(b.time-a.time);a={...a,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,time:cutoff};}
      const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d<.001)continue;
      if(Math.abs(dx)>world.width/2||Math.abs(dy)>world.height/2)continue;
      segments.push({a,b,dx,dy});
    }
    const peak=.18;
    for(const {a,b,dx,dy} of segments){
      const fade=clamp(((a.time+b.time)/2-cutoff)/duration,0,1)**1.6;
      const alpha=peak*fade*(threeD?.95-(a.depth+b.depth)*.3:.72);
      const band=Math.round(alpha/opacityStep)-1;
      if(band<0)continue;
      const midpoint={incoming:p.incoming,x:world.bounded||p.incoming?(a.x+b.x)/2:wrap((a.x+b.x)/2,world.width),y:world.bounded||p.incoming?(a.y+b.y)/2:wrap((a.y+b.y)/2,world.height)};
      periodicCopies(midpoint,world,Math.max(Math.abs(dx),Math.abs(dy))/2+1,(x,y)=>bands[Math.min(band,bands.length-1)].push([x-dx/2,y-dy/2,x+dx/2,y+dy/2]));
    }
  }
  ctx.save();ctx.lineWidth=threeD?.7:.65;ctx.strokeStyle=e.palette.particle;
  for(let i=0;i<bands.length;i++){
    if(!bands[i].length)continue;
    ctx.globalAlpha=(i+1)*opacityStep;ctx.beginPath();
    for(const [x1,y1,x2,y2] of bands[i]){ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}
    ctx.stroke();
  }
  ctx.restore();
}
function drawCosmicBody(e,ctx,p,x,y,k=1,alpha=.8) {
  const level=clamp(Math.log2(Math.max(1,p.mass||1))/8,0,1),color=e.palette.mass[Math.round(level*16)];
  const radius=Math.max(.55,(p.visualRadius ?? cosmicVisualRadius(p))*k);
  ctx.save();
  if(p.mass>1.5){
    const halo=Math.max(radius*2,cosmosRadius(p)*k*4),g=ctx.createRadialGradient(x,y,0,x,y,halo);
    g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.globalAlpha=alpha*(.12+level*.2);ctx.beginPath();ctx.arc(x,y,halo,0,TAU);ctx.fill();
  }
  ctx.globalAlpha=alpha*(.75+level*.25);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();ctx.restore();
  if(p.blackHoleLevel>.001){
    const t=p.blackHoleLevel,r=radius+Math.min(4,3*k)*t;
    ctx.save();ctx.globalAlpha=alpha*t;
    const glow=ctx.createRadialGradient(x,y,r*.8,x,y,r*4);
    glow.addColorStop(0,e.palette.particle);glow.addColorStop(.3,e.palette.glow);glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r*4,0,TAU);ctx.fill();
    ctx.strokeStyle=e.palette.particle;ctx.lineWidth=Math.max(.65,k*.55);
    ctx.beginPath();ctx.ellipse(x,y,r*2.1,r*.7,-.35,0,TAU);ctx.stroke();
    ctx.fillStyle='#06080c';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();
    ctx.globalAlpha=alpha*t*.75;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.restore();
  }
}
function collideCosmos(e,step,threeD) {
  const c=e.config,w=e.world,particles=e.particles,used=new Set(),removed=new Set(),born=[];
  const travel=particles.map(p=>Math.hypot(p.vx,p.vy,threeD?p.vz:0)*step);
  let population=particles.length;
  for(let i=0;i<particles.length;i++){
    const a=particles[i];if(used.has(a))continue;
    for(let j=i+1;j<particles.length;j++){
      const b=particles[j];if(used.has(b))continue;
      const swallowing=a.blackHole||b.blackHole;
      if(!swallowing&&(a.collisionAt>e.time||b.collisionAt>e.time))continue;
      const contact=a.radius+b.radius,reach=contact+travel[i]+travel[j],dx=axisDelta(b.px-a.px,w.width,threeD||w.bounded);
      if(Math.abs(dx)>reach)continue;
      const dy=axisDelta(b.py-a.py,w.height,threeD||w.bounded);if(Math.abs(dy)>reach)continue;
      const dz=threeD?b.pz-a.pz:0;if(Math.abs(dz)>reach)continue;
      const vx=b.vx-a.vx,vy=b.vy-a.vy,vz=threeD?b.vz-a.vz:0,travel2=(vx*vx+vy*vy+vz*vz)*step*step;
      const t=travel2?clamp(-(dx*vx+dy*vy+dz*vz)*step/travel2,0,1):0;
      if((dx+vx*step*t)**2+(dy+vy*step*t)**2+(dz+vz*step*t)**2>contact*contact)continue;
      const speed2=vx*vx+vy*vy+vz*vz,approach=dx*vx+dy*vy+dz*vz;
      // Already separating bodies and cooling remnants keep their trajectory; no elastic bounce.
      if(!swallowing&&(approach>=0||(a.mergeAt||0)>e.time||(b.mergeAt||0)>e.time))continue;
      const closest2=speed2>1e-10?Math.max(0,dx*dx+dy*dy+dz*dz-approach*approach/speed2):dx*dx+dy*dy+dz*dz;
      const overlap=clamp(1-Math.sqrt(closest2)/contact,0,1);
      const mass=a.mass+b.mass,weight=b.mass/mass;
      const center={x:boundCoordinate(a.x+axisDelta(b.x-a.x,w.width,threeD||w.bounded)*weight,w.width,threeD||w.bounded),y:boundCoordinate(a.y+axisDelta(b.y-a.y,w.height,threeD||w.bounded)*weight,w.height,threeD||w.bounded),z3:threeD?a.z3+(b.z3-a.z3)*weight:wrap(a.z3+shortest(b.z3-a.z3,w.depth)*weight,w.depth)};
      const velocity={vx:(a.mass*a.vx+b.mass*b.vx)/mass,vy:(a.mass*a.vy+b.mass*b.vy)/mass,vz:(a.mass*a.vz+b.mass*b.vz)/mass};
      const impact2=4*a.mass*b.mass/(mass*mass)*(vx*vx+vy*vy+vz*vz);
      // Compare impact energy with local binding energy, including mass ratio.
      const escape=Math.sqrt(2*cosmicG(e)*Math.max(.1,c.mutualGravity)*mass/Math.max(3.6*cosmicUnit(e),contact));
      const threshold=c.fragmentSpeed*escape;
      // A slow, gravitationally bound contact accretes even when it grazes.
      // Fast or unbound encounters still use depth/energy to shed debris.
      const gentle=c.collisions==='auto'&&speed2<escape*escape*.5;
      const merge=swallowing||gentle||overlap>=c.mergeOverlap/100&&(c.collisions==='merge'||Math.sqrt(impact2)<=threshold*.65);
      if(!merge&&c.collisions==='merge')continue;
      const severity=clamp(Math.sqrt(impact2)/Math.max(.01,threshold),0,1);
      const debris=merge?0:Math.min(mass*(.015+.22*severity*severity+.06*(1-overlap)),Math.min(a.mass,b.mass)*(1+severity));
      const seed={...a,...center,...velocity,blackHole:!!swallowing,blackHoleLevel:Math.max(a.blackHoleLevel||0,b.blackHoleLevel||0),trail:[],age:1,mass,visualRadius:Math.max(a.visualRadius??cosmicVisualRadius(a),b.visualRadius??cosmicVisualRadius(b)),collisionAt:e.time+.12,mergeAt:e.time+c.mergeCooldown};
      const remnantIndex=born.length;
      if(debris>=.08){
        // One fused remnant and unequal smaller fragments. Subtract the mass-weighted
        // kick so the outcome preserves momentum without reflecting the incoming bodies.
        const angle=Math.random()*TAU,tilt=threeD?(Math.random()-.5)*Math.PI:0;
        const masses=population<1200&&debris>=.35&&severity>.8?[mass-debris,debris*.6,debris-debris*.6]:[mass-debris,debris];
        const directions=masses.map((_,n)=>{const phase=angle+(n-1)*2.5;return n?[Math.cos(phase),Math.sin(phase)*Math.cos(tilt),Math.sin(phase)*Math.sin(tilt)]:[0,0,0];});
        const mean=[0,1,2].map(axis=>masses.reduce((sum,m,n)=>sum+m*directions[n][axis],0)/mass);
        const kicks=directions.map(d=>d.map((v,axis)=>v-mean[axis]));
        const energy=masses.reduce((sum,m,n)=>sum+m*kicks[n].reduce((a,v)=>a+v*v,0),0);
        const kick=Math.sqrt((a.mass*b.mass/mass)*speed2*.05/Math.max(energy,1e-10));
        for(let n=0;n<masses.length;n++){
          const [ux,uy,uz]=kicks[n],piece={...seed,mass:masses[n]};
          born.push({...piece,visualRadius:n?cosmicVisualRadius(piece):seed.visualRadius,x:boundCoordinate(center.x+ux*contact*1.1,w.width,threeD||w.bounded),y:boundCoordinate(center.y+uy*contact*1.1,w.height,threeD||w.bounded),z3:boundCoordinate(center.z3+uz*contact*1.1,w.depth,threeD),vx:velocity.vx+ux*kick,vy:velocity.vy+uy*kick,vz:velocity.vz+uz*kick,trail:[],collisionAt:e.time+c.fragmentGrace});
        }
        population+=masses.length-2;e.merged++;e.shattered++;
      }else{born.push(seed);population--;e.merged++;}
      if(e.followTarget===a||e.followTarget===b)e.followTarget=born[remnantIndex];
      used.add(a);used.add(b);removed.add(a);removed.add(b);e.fades.push({...center,life:1});break;
    }
  }
  if(removed.size)e.particles=particles.filter(p=>!removed.has(p)).concat(born);
  if(e.fades.length>80)e.fades=e.fades.slice(-80);
}
function attractPair(a,b,w,strength,threeD,reach,softening) {
  const dx=axisDelta(b.x-a.x,w.width,threeD||w.bounded),dy=axisDelta(b.y-a.y,w.height,threeD||w.bounded),dz=threeD?b.z3-a.z3:0;
  const distance2=dx*dx+dy*dy+dz*dz;
  if(distance2>=reach*reach)return;
  const distance=Math.sqrt(distance2),taper=1-smooth(clamp((distance/reach-.65)/.35,0,1));
  // Exact inverse-square force outside the tiny contact core. A symmetric cutoff
  // preserves action/reaction when a large body reaches a much smaller one.
  const soft=Math.max(softening,a.radius+b.radius),r2=Math.max(distance2,soft*soft),f=strength*taper/(r2*Math.sqrt(r2));
  a.ax+=dx*f*b.mass;a.ay+=dy*f*b.mass;a.az+=dz*f*b.mass;
  b.ax-=dx*f*a.mass;b.ay-=dy*f*a.mass;b.az-=dz*f*a.mass;
}
function mutualAttraction(e,threeD) {
  const w=e.world,strength=cosmicG(e)*e.config.mutualGravity;
  const habitat=Math.hypot(w.width,w.height,threeD?w.depth:0),softening=3.6*cosmicUnit(e),periodic=!threeD&&!w.bounded;
  // Exact local pairs, indexed along x. Large bodies query their own larger
  // reach; each pair is evaluated once, without inventing distant point masses.
  const sorted=e.particles.map((p,index)=>{
    const local=cosmicReach(e,p.mass);
    return {p,index,x:periodic?wrap(p.x,w.width):p.x,reach:local+(Math.max(local,habitat)-local)*(p.blackHoleLevel||0)};
  }).sort((a,b)=>a.x-b.x);
  const lower=x=>{let lo=0,hi=sorted.length;while(lo<hi){const mid=(lo+hi)>>>1;if(sorted[mid].x<x)lo=mid+1;else hi=mid;}return lo;};
  for(const a of sorted){
    const visit=(left,right)=>{
      for(let i=lower(left);i<sorted.length&&sorted[i].x<=right;i++){
        const b=sorted[i];
        if(a===b||b.reach>a.reach||b.reach===a.reach&&b.index<a.index)continue;
        attractPair(a.p,b.p,w,strength,threeD,a.reach,softening);
      }
    };
    if(periodic&&a.reach>=w.width/2)visit(0,w.width);
    else {
      visit(a.x-a.reach,a.x+a.reach);
      if(periodic&&a.x<a.reach)visit(w.width+a.x-a.reach,w.width);
      if(periodic&&a.x+a.reach>w.width)visit(0,a.x+a.reach-w.width);
    }
  }
}

function updateCosmos(e,step,threeD=false) {
  const w=e.world,c=e.config,unit=cosmicUnit(e);
  evolveBlackHoles(e,step);
  const forces=()=>{
    for(const p of e.particles){
      p.mass=p.mass||1;p.radius=cosmosRadius(p)*.55*unit+3*unit*(p.blackHoleLevel||0);
      p.ax=0;p.ay=0;p.az=0;
      if(!threeD){const pointer=projectPointer(e,p,.008*unit);p.ax+=pointer.x;p.ay+=pointer.y;}
    }
    if(c.mutualGravity>0)mutualAttraction(e,threeD);
  };
  // Kick-drift-kick leapfrog. Resolve close approaches with shorter steps;
  // quiet orbital motion does not need the extra full gravity evaluation.
  forces();
  const acceleration=e.particles.reduce((peak,p)=>Math.max(peak,Math.hypot(p.ax,p.ay,p.az)),1e-9);
  const maxStep=Math.min(.3,.2*Math.sqrt(3.6*unit/acceleration));
  const slices=Math.max(1,Math.ceil(step/maxStep)),h=step/slices;
  for(let n=0;n<slices;n++){
    for(const p of e.particles){
      p.px=p.x;p.py=p.y;p.pz=p.z3;
      p.vx+=p.ax*h/2;p.vy+=p.ay*h/2;if(threeD)p.vz+=p.az*h/2;
      if(p.incoming){
        p.x+=p.vx*h;p.y+=p.vy*h;p.z3+=p.vz*h;
        const screen=threeD?volume.project(e,p):{x:p.x*e.scale,y:p.y*e.scale};
        if(screen.x>12&&screen.x<e.width-12&&screen.y>12&&screen.y<e.height-12)p.incoming=false;
      }else if(threeD?advance3(p,h,w):advance(p,h,w))p.trail.length=0;
    }
    if(c.collisions!=='off')collideCosmos(e,h,threeD);
    forces();
    for(const p of e.particles){p.vx+=p.ax*h/2;p.vy+=p.ay*h/2;if(threeD)p.vz+=p.az*h/2;}
  }
  for(const p of e.particles){
    const targetRadius=cosmicVisualRadius(p);
    p.visualRadius=(p.visualRadius??targetRadius)+(targetRadius-(p.visualRadius??targetRadius))*(1-Math.exp(-.08*step));
    recordCosmicTrail(e,p);
  }
}

const gravity = {
  create(e) {
    const x = Math.random() * e.world.width, y = Math.random() * e.world.height;
    const dx=x-e.world.width/2,dy=y-e.world.height/2,r=Math.max(28,Math.hypot(dx,dy));
    const enclosed=clamp((r/(Math.min(e.world.width,e.world.height)*.5))**2,0,1);
    const pull=cosmicG(e)*e.config.mutualGravity*e.config.count*enclosed;
    // Keep enough initial drift for flybys even without an external attractor.
    const v=clamp(Math.sqrt(Math.max(12,pull)/r),.08,1.2)*e.config.orbit;
    // Scattered positions with mostly tangential motion avoid immediate radial collapse.
    const direction=Math.random()<.03?-1:1,a=Math.atan2(dy,dx)+direction*Math.PI/2+(Math.random()-.5)*.5;
    const p=seed3(e, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, size: 1.8, mass:1, collisionAt:0, z: Math.random(), trail: [], age: 1 });
    p.vz*=v*.35;return p;
  },
  update(e, step) {
    updateCosmos(e,step);
  },
  draw(e, ctx) {
    const c = e.config;
    drawCosmicTrails(e,ctx,q=>q,e.world);
    for (const p of e.particles) {
      const alpha = c.depth === 'depth' ? .25 + p.z * .7 : .72;
      periodicCopies(p, e.world, cosmosRadius(p)*4, (x, y) => drawCosmicBody(e,ctx,p,x,y,BODY_SCALE_2D,alpha));
    }
    ctx.globalAlpha = 1;
  },
};

function drawCosmicBirth(e,ctx,view) {
  if(!e.cosmicBirth)return;
  const birth=e.cosmicBirth,elapsed=e.time-birth.startedAt;
  const charging=!birth.born,t=charging?clamp(elapsed/COSMIC_CHARGE,0,1):clamp((elapsed-COSMIC_CHARGE)/.65,0,1);
  if(!charging&&t>=1)return;
  ctx.save();ctx.setTransform(e.dpr*view.zoom,0,0,e.dpr*view.zoom,e.dpr*view.x,e.dpr*view.y);
  const screen=birth.center?(e.is3D?volume.project(e,birth.center):{x:birth.center.x*e.scale,y:birth.center.y*e.scale}):{x:e.width/2,y:e.height/2};
  const x=e.world.bounded?screen.x:wrap(screen.x,e.width),y=e.world.bounded?screen.y:wrap(screen.y,e.height);
  const radius=charging?14+20*t+Math.sin(t*Math.PI*6)*2:14+100*(1-(1-t)**3);
  const glow=ctx.createRadialGradient(x,y,0,x,y,radius);
  glow.addColorStop(0,e.palette.center);glow.addColorStop(.18,e.palette.glow);glow.addColorStop(1,'transparent');
  ctx.globalAlpha=charging?.4+.5*t:(1-t)**2;ctx.fillStyle=glow;
  ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();
  ctx.fillStyle=e.palette.center;ctx.globalAlpha=charging?.65+.35*t:(1-t)**3;
  const core=birth.recycling?birth.radius*(t<.5?1-.3*smooth(t*2):.7+.45*smooth((t-.5)*2)):2+2*t;
  ctx.beginPath();ctx.arc(x,y,charging?core:4+8*t,0,TAU);ctx.fill();
  ctx.restore();
}

// A bounded 3D habitat. World coordinates stay continuous; only the projected
// screen edges repeat, so orbiting cannot expose an interior teleport seam.
const delta3 = (a, b) => ({x:b.x-a.x,y:b.y-a.y,z:b.z3-a.z3});
const norm3 = v => Math.hypot(v.x,v.y,v.z);
function limit3(p,min,max) { const v=Math.hypot(p.vx,p.vy,p.vz)||1, f=clamp(v,min,max)/v;p.vx*=f;p.vy*=f;p.vz*=f; }
function advance3(p,step,w) {
  for(const [position,velocity,length] of [['x','vx',w.width],['y','vy',w.height],['z3','vz',w.depth]]){
    const margin=Math.min(100,length*.18),value=p[position];
    if(value<margin&&p[velocity]<0)p[velocity]+=(1-value/margin)*.09*step;
    else if(value>length-margin&&p[velocity]>0)p[velocity]-=(1-(length-value)/margin)*.09*step;
    const next=value+p[velocity]*step;
    // Reflect rare overshoots locally instead of moving to the opposite face.
    if(next<0){p[position]=clamp(-next,0,length);p[velocity]=Math.abs(p[velocity]);}
    else if(next>length){p[position]=clamp(2*length-next,0,length);p[velocity]=-Math.abs(p[velocity]);}
    else p[position]=next;
  }
  return false;
}
function seed3(e,p,parent) { p.z3=parent?boundCoordinate(parent.z3+(Math.random()-.5)*20,e.world.depth,e.is3D):Math.random()*e.world.depth;p.vz=parent?parent.vz:(Math.random()-.5)*2;return p; }
class Neighborhood3 {
  build(particles,w,radius) {
    this.w=w;this.n=[w.width,w.height,w.depth].map(v=>Math.max(1,Math.floor(v/radius)));this.size=[w.width,w.height,w.depth].map((v,i)=>v/this.n[i]);this.cells=new Map();
    for(const p of particles){const key=this.key(...this.cell(p));if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(p);}
  }
  cell(p){return [p.x,p.y,p.z3].map((v,i)=>clamp(Math.floor(v/this.size[i]),0,this.n[i]-1));}
  key(x,y,z){return (x*this.n[1]+y)*this.n[2]+z;}
  visit(p,fn){const c=this.cell(p),n=this.n;for(let x=Math.max(0,c[0]-1);x<=Math.min(n[0]-1,c[0]+1);x++)for(let y=Math.max(0,c[1]-1);y<=Math.min(n[1]-1,c[1]+1);y++)for(let z=Math.max(0,c[2]-1);z<=Math.min(n[2]-1,c[2]+1);z++){const cell=this.cells.get(this.key(x,y,z));if(cell)for(const q of cell)if(q!==p)fn(q);}}
}
const volume = {
  update(e,step) {
    const c=e.config,w=e.world;
    if(e.scene.model==='gravity'){updateCosmos(e,step,true);return;}
    const fish=c.shape==='fish',radius=c.perception;
    e.grid3.build(e.particles,w,radius);
    for(const p of e.particles){
      let count=0,sx=0,sy=0,sz=0,ax=0,ay=0,az=0,cx=0,cy=0,cz=0;
      e.grid3.visit(p,q=>{const d=delta3(p,q,w),d2=d.x*d.x+d.y*d.y+d.z*d.z;if(d2>radius*radius||d2<.0001)return;count++;ax+=q.vx;ay+=q.vy;az+=q.vz;cx+=d.x;cy+=d.y;cz+=d.z;if(d2<400){sx-=d.x/d2;sy-=d.y/d2;sz-=d.z/d2;}});
      let fx=sx*c.separation*.9,fy=sy*c.separation*.9,fz=sz*c.separation*.9;
      if(count){fx+=(ax/count-p.vx)*.047*c.alignment+cx/count*.0008*c.cohesion;fy+=(ay/count-p.vy)*.047*c.alignment+cy/count*.0008*c.cohesion;fz+=(az/count-p.vz)*.047*c.alignment+cz/count*.0008*c.cohesion;}
      for(const h of e.predators){const d=delta3(h,p,w),r=norm3(d);if(r<115&&r>.01){const f=(1-r/115)*.65/r;fx+=d.x*f;fy+=d.y*f;fz+=d.z*f;}}
      if(fish){fx+=Math.cos(p.y/w.height*TAU+e.time*.16)*c.current*.019;fy+=Math.sin(p.x/w.width*TAU+e.time*.16)*c.current*.032;fz+=Math.sin(p.z3/w.depth*TAU+e.time*.12)*c.current*.025;}
      fx+=Math.cos(p.phase+e.time*.7)*.0018;fy+=Math.sin(p.phase+e.time*.7)*.0018;fz+=Math.sin(p.phase+e.time*.5)*.0018;
      const force=Math.hypot(fx,fy,fz),f=force>.25?.25/force:1;p.ax=fx*f;p.ay=fy*f;p.az=fz*f;
    }
    for(const p of e.particles){p.vx+=p.ax*step;p.vy+=p.ay*step;p.vz+=p.az*step;limit3(p,fish?.75:1.15,fish?1.8:2.35);advance3(p,step,w);p.age=Math.min(1,p.age+step/90);}
    e.syncPredators();const eaten=new Set();
    for(const h of e.predators){
      h.rest=Math.max(0,h.rest-step);let target,nearest=Infinity;
      for(const p of e.particles){if(eaten.has(p))continue;const d=delta3(h,p,w),r=norm3(d);if(r<nearest){nearest=r;target=p;}}
      if(target&&!h.rest){const d=delta3(h,target,w),r=nearest||1;h.vx+=(d.x/r*2.7*c.huntSpeed-h.vx)*.019*step;h.vy+=(d.y/r*2.7*c.huntSpeed-h.vy)*.019*step;h.vz+=(d.z/r*2.7*c.huntSpeed-h.vz)*.019*step;
        if(nearest<c.captureRadius){eaten.add(target);h.rest=c.huntRest*60;h.meals++;e.captured++;e.fades.push({x:target.x,y:target.y,z3:target.z3,life:1});if(c.replenish==='yes')e.respawns.push(e.time+2.5);}
      }else {h.vx*=.99;h.vy*=.99;h.vz*=.99;}
      for(const other of e.predators)if(other!==h){const d=delta3(other,h,w),r=norm3(d);if(r<40&&r>.01){h.vx+=d.x/r*.04*step;h.vy+=d.y/r*.04*step;h.vz+=d.z/r*.04*step;}}
      limit3(h,.25,2.7*c.huntSpeed);advance3(h,step,w);
    }
    if(eaten.size)e.particles=e.particles.filter(p=>!eaten.has(p));
    e.respawns=e.respawns.filter(at=>{if(at>e.time)return true;if(c.replenish==='yes'&&e.particles.length<c.count)e.particles.push(e.model.create(e,e.particles.length,true));return false;});
    e.breedPopulation(step/60);
  },
  project(e,p) {
    const w=e.world,c=e.camera,x=p.x-w.width/2,y=p.y-w.height/2,z=p.z3-w.depth/2;
    const u=x*Math.cos(c.yaw)+z*Math.sin(c.yaw),v=-x*Math.sin(c.yaw)+z*Math.cos(c.yaw);
    const yy=y*Math.cos(c.pitch)-v*Math.sin(c.pitch),zz=y*Math.sin(c.pitch)+v*Math.cos(c.pitch);
    const {distance,focal}=e.projection3,k=focal/(distance+zz);
    const depth=clamp(.5+zz/Math.hypot(w.width,w.height,w.depth),0,1);
    const sizeK=e.scale*2*clamp(k/(focal/distance),.65,1.3);
    return {x:e.width/2+u*k,y:e.height/2+yy*k,z:zz,k,sizeK,depth};
  },
  draw(e,ctx,view) {
    ctx.setTransform(e.dpr*view.zoom,0,0,e.dpr*view.zoom,e.dpr*view.x,e.dpr*view.y);
    const project=p=>this.project(e,p),cosmos=e.scene.model==='gravity';
    const screenWorld={width:e.width,height:e.height,bounded:e.world.bounded};
    if(cosmos)drawCosmicTrails(e,ctx,project,screenWorld,true);
    const items=[];
    for(const item of [...e.particles.map(p=>({p,type:'particle'})),...e.predators.map(p=>({p,type:'predator'})),...e.fades.map(p=>({p,type:'fade'}))]){
      const raw=project(item.p);
      const padding=Math.max(18,(cosmos?cosmosRadius(item.p)*4:14)*raw.sizeK);
      periodicCopies({incoming:item.p.incoming,x:screenWorld.bounded||item.p.incoming?raw.x:wrap(raw.x,e.width),y:screenWorld.bounded||item.p.incoming?raw.y:wrap(raw.y,e.height)},screenWorld,padding,(x,y)=>items.push({...item,screen:{...raw,rawX:raw.x,rawY:raw.y,x,y}}));
    }
    items.sort((a,b)=>b.screen.z-a.screen.z);
    for(const {p,type,screen:s} of items){
      const predator=type==='predator',alpha=predator?1-s.depth*.25:.95-s.depth*.6;
      ctx.globalAlpha=alpha*(p.age??1);ctx.fillStyle=predator?e.palette.predator:e.palette.particle;
      if(type==='fade'){ctx.globalAlpha=p.life*.4;ctx.strokeStyle=e.palette.impact;ctx.beginPath();ctx.arc(s.x,s.y,(3+(1-p.life)*8)*s.sizeK,0,TAU);ctx.stroke();continue;}
      if(cosmos||(!predator&&e.config.shape==='dot')){
        if(cosmos)drawCosmicBody(e,ctx,p,s.x,s.y,s.sizeK*BODY_SCALE_3D,alpha);
        else {ctx.beginPath();ctx.arc(s.x,s.y,Math.max(.55,p.size*s.sizeK*BODY_SCALE_3D),0,TAU);ctx.fill();}continue;
      }
      // A small faceted body oriented along its full 3D velocity.
      const speed=Math.hypot(p.vx,p.vy,p.vz)||1,f={x:p.vx/speed,y:p.vy/speed,z:p.vz/speed};
      const r=Math.hypot(f.x,f.z),side=r>.001?{x:-f.z/r,y:0,z:f.x/r}:{x:1,y:0,z:0};
      const up={x:f.y*side.z-f.z*side.y,y:f.z*side.x-f.x*side.z,z:f.x*side.y-f.y*side.x};
      const size=(predator?7:p.size*1.5)*BODY_SCALE_3D;
      const vertex=(a,b,c)=>{const q=project({x:p.x+size*(f.x*a+side.x*b+up.x*c),y:p.y+size*(f.y*a+side.y*b+up.y*c),z3:p.z3+size*(f.z*a+side.z*b+up.z*c)});return {...q,x:s.x+(q.x-s.rawX)*s.sizeK/s.k,y:s.y+(q.y-s.rawY)*s.sizeK/s.k};};
      if(!predator&&e.config.shape==='line'){const a=vertex(-2,0,0),b=vertex(2,0,0);ctx.strokeStyle=e.palette.particle;ctx.lineWidth=Math.max(.7,s.sizeK*BODY_SCALE_3D);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();continue;}
      const fish=!predator&&e.config.shape==='fish',bird=!predator&&e.config.shape==='bird',vertices=bird?[[2,0,0],[0,.4,0],[-1.6,2,Math.sin(e.time*6+p.phase)*.8],[-.6,0,.3],[-1.6,-2,Math.sin(e.time*6+p.phase)*.8],[0,-.4,0]]:fish?[[2,0,0],[0,.65,0],[0,0,.65],[0,-.65,0],[0,0,-.65],[-1.8,0,0],[-2.6,1,0],[-2.6,-1,0]]:[[2,0,0],[-1,1,0],[-.4,0,.5],[-1,-1,0]];
      const faces=bird?[[0,1,3],[1,2,3],[0,3,5],[3,4,5]]:fish?[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,2,1],[5,3,2],[5,4,3],[5,1,4],[5,6,7]]:[[0,1,2],[0,2,3],[1,3,2]];
      const mesh=predator&&PREDATOR_MESHES[e.config.shape],bodyFaces=mesh?mesh.faces:faces;
      const points=(mesh?mesh.vertices:vertices).map(v=>vertex(...v));
      bodyFaces.map(face=>({face,z:face.reduce((v,i)=>v+points[i].z,0)/3})).sort((a,b)=>b.z-a.z).forEach(({face},i)=>{ctx.globalAlpha=alpha*(p.age??1)*(predator?.85+i/bodyFaces.length*.15:.65+i/bodyFaces.length*.35);ctx.beginPath();face.forEach((index,j)=>{const q=points[index];if(j)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.fill();});
    }ctx.globalAlpha=1;
  },
};

export const MODELS = Object.freeze({ flock, gravity });

export class EmergenceEngine {
  constructor(canvas, { scene = 'birds', config, color = '#48614c', predatorColor, dark = false } = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: true });
    this.grid3 = new Neighborhood3(); this.camera = {yaw:-.25,pitch:.15};
    this.grid = new Neighborhood(); this.pointer = { active: false, x: 0, y: 0 };
    this.paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.time = 0; this.tick = 0; this.lastFrame = 0; this.accumulator = 0; this.destroyed = false; this.boost = 1;
    this.setPalette(color, dark, predatorColor); this.resize(); this.setScene(scene, config);
    this.onResize = () => this.resize(); this.onVisibility = () => { this.lastFrame = 0; this.accumulator = 0; };
    window.addEventListener('resize', this.onResize); document.addEventListener('visibilitychange', this.onVisibility);
    this.resizeObserver=new ResizeObserver(()=>{const box=this.canvas.getBoundingClientRect();if(box.width!==this.width||box.height!==this.height)this.resize();});
    this.resizeObserver.observe(this.canvas);
    // Capture the object at press time: it may move before click/double-click resolves.
    this.followDown=event=>{
      if(event.button!==0||!event.isPrimary||this.config.pointer!=='magnify')return;
      this.followGesture={x:event.clientX,y:event.clientY,at:performance.now(),moved:false,target:this.pickParticle(event.clientX,event.clientY)};
    };
    this.followMove=event=>{const g=this.followGesture;if(g&&Math.hypot(event.clientX-g.x,event.clientY-g.y)>6)g.moved=true;};
    this.followClick=event=>{
      if(event.button!==0||this.config.pointer!=='magnify')return;
      if(event.detail>1)return;
      this.followPrevious=this.followTarget||null;
      const g=this.followGesture;
      if(!g||g.moved||performance.now()-g.at>280||!g.target)return;
      clearTimeout(this.followTimer);
      this.followTimer=setTimeout(()=>{
        this.followTimer=null;
        if(!this.destroyed&&this.config.pointer==='magnify'&&this.hasParticle(g.target)){this.followTarget=g.target;this.draw();}
      },350);
    };
    this.followDouble=()=>{
      clearTimeout(this.followTimer);this.followTimer=null;
      if(this.followPrevious!==undefined){this.followTarget=this.followPrevious;this.followPrevious=undefined;this.draw();}
    };
    this.followEscape=event=>{
      if(event.key==='Escape'&&(this.followTarget||this.followTimer)){
        event.preventDefault();event.stopImmediatePropagation();this.clearFollow();this.draw();
      }
    };
    this.canvas.addEventListener('pointerdown',this.followDown,true);
    window.addEventListener('pointermove',this.followMove,true);
    this.canvas.addEventListener('click',this.followClick);
    this.canvas.addEventListener('dblclick',this.followDouble);
    window.addEventListener('keydown',this.followEscape,true);
    this.orbitDown = event => {
      if (!this.is3D || !event.isPrimary || event.button !== 0) return;
      event.preventDefault(); event.stopImmediatePropagation(); this.setBoost(false); this.pointer.active=false;
      this.orbitDrag={id:event.pointerId,x:event.clientX,y:event.clientY}; this.canvas.setPointerCapture(event.pointerId); this.canvas.style.cursor='grabbing';
    };
    this.orbitMove = event => { const d=this.orbitDrag;if(!d||d.id!==event.pointerId)return;event.preventDefault();event.stopImmediatePropagation();this.rotateCamera((event.clientX-d.x)/this.width*TAU,(event.clientY-d.y)/this.height*Math.PI);d.x=event.clientX;d.y=event.clientY; };
    this.orbitUp = event => {if(this.orbitDrag?.id!==event.pointerId)return;event.stopImmediatePropagation();this.endOrbit();};
    this.orbitBlur = () => this.endOrbit();
    this.canvas.addEventListener('pointerdown',this.orbitDown,true);
    this.canvas.addEventListener('lostpointercapture',this.orbitBlur);
    window.addEventListener('pointermove',this.orbitMove,{capture:true,passive:false});
    window.addEventListener('pointerup',this.orbitUp,true);window.addEventListener('pointercancel',this.orbitUp,true);
    window.addEventListener('blur',this.orbitBlur);document.addEventListener('visibilitychange',this.orbitBlur);
    this.frame = this.frame.bind(this); this.raf = requestAnimationFrame(this.frame);
  }
  get is3D() { return this.config?.depth === 'depth'; }
  rotateCamera(yaw,pitch) {this.camera.yaw=wrap(this.camera.yaw+yaw,TAU);this.camera.pitch=clamp(this.camera.pitch+pitch,-Math.PI*.47,Math.PI*.47);this.containEdges();this.draw();}
  containEdges(step=0,rebase=false) {
    const w=this.world;if(!w)return;
    w.bounded=this.config?.edgeWrap==='no';
    if(!w.bounded||!this.width||!this.height)return;
    const cy=Math.cos(this.camera.yaw),sy=Math.sin(this.camera.yaw),cp=Math.cos(this.camera.pitch),sp=Math.sin(this.camera.pitch);
    const right=[cy,0,sy],up=[sy*sp,cp,-cy*sp],forward=[-sy*cp,sp,cy*cp];
    const dot=(p,b)=>p.vx*b[0]+p.vy*b[1]+p.vz*b[2];
    const turn=(position,velocity,inset,length,k)=>{
      if(position<=inset&&velocity<0||position>=length-inset&&velocity>0)return -velocity;
      const zone=Math.min(60,length*.12),gap=velocity<0?position-inset:length-inset-position;
      return gap<zone?velocity-Math.sign(velocity)*Math.min(Math.abs(velocity)+k*.3,k*.18*step*(1-Math.max(0,gap)/zone)**2):velocity;
    };
    for(const [items,predator] of [[this.particles||[],false],[this.predators||[],true]])for(const p of items){
      if(p.incoming)continue;
      if(!this.is3D){
        const inset=Math.min(Math.min(this.width,this.height)*.08,2+(predator?11:this.scene.model==='gravity'?1.8:p.size*2.8)*BODY_SCALE_2D*this.scale);
        p.vx=turn(p.x*this.scale,p.vx*this.scale,inset,this.width,this.scale)/this.scale;
        p.vy=turn(p.y*this.scale,p.vy*this.scale,inset,this.height,this.scale)/this.scale;
        const x=clamp(p.x,inset/this.scale,w.width-inset/this.scale),y=clamp(p.y,inset/this.scale,w.height-inset/this.scale);
        if((x!==p.x||y!==p.y)&&p.trail)p.trail=[];
        p.x=x;p.y=y;continue;
      }
      const screen=volume.project(this,p),k=screen.k;
      const inset=Math.min(Math.min(this.width,this.height)*.08,2+(predator?18:this.scene.model==='gravity'?1.8:p.size*4)*BODY_SCALE_3D*screen.sizeK);
      // On enabling the boundary, retain the currently visible periodic image.
      const x=clamp(rebase?wrap(screen.x,this.width):screen.x,inset,this.width-inset),y=clamp(rebase?wrap(screen.y,this.height):screen.y,inset,this.height-inset);
      const u=(screen.x-this.width/2)/k,v=(screen.y-this.height/2)/k,vz=dot(p,forward),distance=this.projection3.distance+screen.z;
      const vx=(dot(p,right)-u*vz/distance)*k,vy=(dot(p,up)-v*vz/distance)*k;
      const dx=(turn(screen.x,vx,inset,this.width,k)-vx)/k,dy=(turn(screen.y,vy,inset,this.height,k)-vy)/k;
      p.vx+=right[0]*dx+up[0]*dy;p.vy+=right[1]*dx+up[1]*dy;p.vz+=right[2]*dx+up[2]*dy;
      if(x!==screen.x||y!==screen.y){
        const ax=(x-screen.x)/k,ay=(y-screen.y)/k;
        p.x+=right[0]*ax+up[0]*ay;p.y+=right[1]*ax+up[1]*ay;p.z3+=right[2]*ax+up[2]*ay;
        // Stay inside the depth habitat too. Radial contraction keeps the screen projection inside its edges.
        const rx=p.x-w.width/2,ry=p.y-w.height/2,rz=p.z3-w.depth/2;
        const fit=Math.min(1,w.width/2/(Math.abs(rx)||1),w.height/2/(Math.abs(ry)||1),w.depth/2/(Math.abs(rz)||1));
        p.x=w.width/2+rx*fit;p.y=w.height/2+ry*fit;p.z3=w.depth/2+rz*fit;
        if(p.trail)p.trail=[];
      }
    }
  }
  endOrbit() {const d=this.orbitDrag;this.orbitDrag=null;if(d&&this.canvas.hasPointerCapture(d.id))this.canvas.releasePointerCapture(d.id);this.canvas.style.cursor=this.is3D?'grab':'';}
  setPalette(color, dark, predatorColor = this.predatorColor) {
    this.predatorColor = /^#[a-f0-9]{6}$/i.test(predatorColor) ? predatorColor : undefined;
    this.color = /^#[a-f0-9]{6}$/i.test(color) ? color : '#48614c'; this.dark = dark;
    const rgb = [1, 3, 5].map(i => parseInt(this.color.slice(i, i + 2), 16));
    const max = Math.max(...rgb), delta = max - Math.min(...rgb);
    const hue = !delta ? 0 : max === rgb[0] ? (rgb[1]-rgb[2])/delta : max === rgb[1] ? (rgb[2]-rgb[0])/delta+2 : (rgb[0]-rgb[1])/delta+4;
    const mix = (target, amount, alpha = 1) => `rgba(${rgb.map((v, i) => Math.round(v * (1 - amount) + target[i] * amount)).join(',')},${alpha})`;
    this.palette = {
      particle: mix(dark ? [228, 238, 216] : [20, 42, 30], dark ? .72 : .15),
      mass:Array.from({length:17},(_,i)=>mix(dark?[255,241,202]:[20,42,30],dark?.2+i/16*.75:.15+i/16*.65)),
      // The theme host supplies its next palette color; standalone engines retain their fallback.
      predator: this.predatorColor || `hsl(${(hue*60+540)%360}, 80%, ${dark?66:35}%)`,
      impact: dark ? '#d6b690' : '#967451',




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
    this.world = { width: box.width / this.scale, height: box.height / this.scale, depth: Math.min(box.width,box.height) / this.scale * .85, bounded:this.config?.edgeWrap==='no' };
    // Frame an interior region, rather than fitting the entire periodic box on screen.
    // The viewport fits inside the projected inscribed sphere at every camera angle,
    // so all four edges (including corners) extend into the surrounding 3D space.
    const radius=Math.min(this.world.width,this.world.height,this.world.depth)/2;
    const distance=Math.hypot(this.world.width,this.world.height,this.world.depth)*1.3;
    this.projection3={distance,focal:Math.hypot(box.width,box.height)*Math.sqrt(distance*distance-radius*radius)/(2*radius)*1.08};
    if (previous) {
      const birthCenter=this.cosmicBirth?.born&&this.cosmicBirth.center?[this.cosmicBirth.center]:[];
      for (const p of [...(this.particles || []), ...(this.predators || []), ...(this.fades || []), ...birthCenter]) {
        if(p.birthTarget)for(const [axis,velocity,length] of [['x','vx','width'],['y','vy','height'],['z3','vz','depth']]){
          const ratio=this.world[length]/previous[length];p.birthTarget[axis]*=ratio;p.birthTarget[velocity]*=ratio;
        }
        p.x = boundCoordinate(p.x / previous.width * this.world.width, this.world.width, this.is3D||this.world.bounded); p.y = boundCoordinate(p.y / previous.height * this.world.height, this.world.height, this.is3D||this.world.bounded);
        p.z3 = boundCoordinate(p.z3 / previous.depth * this.world.depth, this.world.depth, this.is3D);
        if (p.trail) p.trail.length = 0;
      }
    }
    this.pointer.active = false;
    this.containEdges();
    if (this.scene) this.draw();
  }
  setScene(id, config) {
    this.scene = SCENES[id] || SCENES.birds; this.model = MODELS[this.scene.model];
    this.config = sanitize(this.scene.id, config); this.pointer.active = false; this.reset();
    this.canvas.dataset.scene = this.scene.id;
  }
  reset(opening = true) {
    this.clearFollow();
    this.endOrbit(); this.canvas.dataset.dimension=this.is3D?'3d':'2d';
    this.setBoost(false);
    this.time = 0; this.trailTime = 0; this.tick = 0; this.accumulator = 0; this.lastFrame = 0; this.captured = 0;
    this.predators = []; this.respawns = []; this.fades = [];
    this.merged=0;this.shattered=0;this.deflected=0;this.influxClock=0;this.incomingMass=0;this.arrived=0;
    this.birthClock = 0; this.predatorBirthClock = 0; this.born = 0; this.predatorBorn = 0;
    this.cosmicBirth = opening&&this.scene.model==='gravity'?{born:false,startedAt:0}:null;
    this.particles = this.scene.model==='gravity'?[]:Array.from({ length: this.config.count }, (_, i) => this.model.create(this, i));
    if(this.scene.model==='gravity'&&!opening){
      // Changing the count uses the same bound initial state, without replaying the flash.
      this.cosmicBirth={born:false,startedAt:-COSMIC_CHARGE-COSMIC_EXPANSION};this.advanceCosmicBirth(0);
    }
    this.syncPredators(true); this.containEdges(0,true); this.draw();
  }
  advanceCosmicBirth(step) {
    if(!this.cosmicBirth)return false;
    const birth=this.cosmicBirth,elapsed=this.time-birth.startedAt;
    if(elapsed<COSMIC_CHARGE){
      if(birth.recycling){
        const p=birth.center,drag=Math.exp(-.055*step);p.vx*=drag;p.vy*=drag;p.vz*=drag;
        if(this.is3D)advance3(p,step,this.world);else advance(p,step,this.world);
        this.containEdges();
      }
      return true;
    }
    if(!this.cosmicBirth.born){
      const w=this.world,center=birth.center||{x:w.width/2,y:w.height/2,z3:w.depth/2,vx:0,vy:0,vz:0};
      const count=this.config.count,total=birth.recycling?center.mass:count,birthGravity=cosmicG(this)*(this.config.mutualGravity||.7);
      const k=this.is3D?volume.project(this,{x:w.width/2,y:w.height/2,z3:w.depth/2}).k:this.scale;
      const unit=Math.min(this.width,this.height)/k,cloudRadius=unit*.07;
      // Rotating density peaks are a birth preset, not fixed gravity sources.
      // A freely moving massive seed represents each dense core; the disc has
      // coherent angular momentum. Several cold overlapping cores instead form
      // hard binaries, ejecting the disc before it can settle.
      const clouds=[0,1,2].map(i=>{
        const a=i*TAU/3-.5,r=unit*.29;
        const v=.015*cosmicUnit(this); // Local systems drift gently; distant systems no longer bind each other.
        return {x:w.width/2+Math.cos(a)*r,y:w.height/2+Math.sin(a)*r,z3:w.depth/2,
          vx:-Math.sin(a)*v,vy:Math.cos(a)*v,mass:total/3,tilt:this.is3D?(i-1)*.45:0,spin:i===1?-1:1};
      });
      const sizes=clouds.map((_,j)=>Math.floor((count+2-j)/3));
      this.particles=Array.from({length:count},(_,i)=>{
        const j=i%3,n=Math.floor(i/3),cloud=clouds[j],core=n===0;
        const mass=cloud.mass*(core?.8:.2/(sizes[j]-1));
        const a=n*2.399963229728653+j*1.7,r=core?0:cloudRadius*(.48+.52*Math.sqrt(Math.random()));
        const enclosed=cloud.mass*(.8+.04*(r/cloudRadius)**2);
        const v=Math.sqrt(birthGravity*enclosed/Math.max(4*cosmicUnit(this),r))*this.config.orbit*(core?0:.95);
        const dx=Math.cos(a),dy=Math.sin(a),ct=Math.cos(cloud.tilt),st=Math.sin(cloud.tilt);
        const target={x:cloud.x+dx*r,y:cloud.y+dy*r*ct,z3:cloud.z3+dy*r*st,
          vx:cloud.vx-dy*v*cloud.spin,vy:cloud.vy+dx*v*ct*cloud.spin,vz:dx*v*st*cloud.spin};
        const p=this.model.create(this,i);
        Object.assign(p,{mass,x:center.x,y:center.y,z3:center.z3,vx:0,vy:0,vz:0,
          collisionAt:birth.startedAt+COSMIC_CHARGE+COSMIC_EXPANSION,mergeAt:birth.startedAt+COSMIC_CHARGE+COSMIC_EXPANSION,trail:[],birthTarget:target});
        return p;
      });
      birth.center={...center};birth.born=true;
    }
    const t=clamp((elapsed-COSMIC_CHARGE)/COSMIC_EXPANSION,0,1),frames=COSMIC_EXPANSION*60*COSMIC_RATE;
    // Hermite expansion joins continuously to each cloud's tangential velocity.
    for(const p of this.particles){
      const target=p.birthTarget;if(!target)continue;
      for(const [axis,velocity] of [['x','vx'],['y','vy'],['z3','vz']]){
        const delta=target[axis]-birth.center[axis],tangent=target[velocity]*frames,initial=delta*2.4;
        p[axis]=birth.center[axis]+(t*t*t-2*t*t+t)*initial+smooth(t)*delta+(t*t*t-t*t)*tangent;
        p[velocity]=((3*t*t-4*t+1)*initial+(6*t-6*t*t)*delta+(3*t*t-2*t)*tangent)/frames;
      }
      recordCosmicTrail(this,p);
      if(t===1)delete p.birthTarget;
    }
    if(t<1)return true;
    this.cosmicBirth=null;
    return false;
  }
  replenishCosmos(dt) {
    if(this.scene.model!=='gravity'||this.cosmicBirth||this.config.influx!=='yes'){this.influxClock=0;return;}
    this.influxClock+=dt;
    if(this.influxClock<this.config.influxInterval)return;
    this.influxClock=0;
    const w=this.world,cy=Math.cos(this.camera.yaw),sy=Math.sin(this.camera.yaw),cp=Math.cos(this.camera.pitch),sp=Math.sin(this.camera.pitch);
    const right=[cy,0,sy],up=[sy*sp,cp,-cy*sp];
    const k=this.is3D?this.projection3.focal/this.projection3.distance:this.scale;
    for(let i=0;i<this.config.influxBatch&&this.particles.length<1200;i++){
      const edge=Math.floor(Math.random()*4),offset=.15+Math.random()*.7;
      const x=edge===0?-6:edge===1?this.width+6:this.width*offset;
      const y=edge===2?-6:edge===3?this.height+6:this.height*offset;
      const u=(x-this.width/2)/k,v=(y-this.height/2)/k;
      const a=Math.atan2(this.height*(.3+Math.random()*.4)-y,this.width*(.3+Math.random()*.4)-x);
      const speed=(.15+Math.random()*.15)*cosmicUnit(this),vx=Math.cos(a)*speed,vy=Math.sin(a)*speed;
      const p=this.model.create(this),mass=.2+Math.random()*.6;
      Object.assign(p,{mass,incoming:true,trail:[],collisionAt:this.time+1,mergeAt:this.time+1});
      if(this.is3D)Object.assign(p,{x:w.width/2+right[0]*u+up[0]*v,y:w.height/2+right[1]*u+up[1]*v,z3:w.depth/2+right[2]*u+up[2]*v,
        vx:right[0]*vx+up[0]*vy,vy:right[1]*vx+up[1]*vy,vz:right[2]*vx+up[2]*vy});
      else Object.assign(p,{x:x/k,y:y/k,vx,vy,vz:0});
      this.particles.push(p);this.arrived++;this.incomingMass+=mass;
    }
  }
  setConfig(config) {
    const old = this.config, oldCount = old.count, oldReplenish = old.replenish;
    this.config = sanitize(this.scene.id, config);
    if(this.config.blackHoles==='no')for(const p of this.particles){p.blackHole=false;p.blackHoleLevel=0;}
    if(this.config.pointer!=='magnify')this.clearFollow();
    this.world.bounded=this.config.edgeWrap==='no';
    if(old.edgeWrap!==this.config.edgeWrap)for(const p of this.particles){if(p.trail)p.trail=[];}
    if(old.pointer!==this.config.pointer)this.pointer.active=false;
    if(old.depth!==this.config.depth){this.endOrbit();this.setBoost(false);this.pointer.active=false;this.fades=[];for(const p of this.particles){if(p.trail)p.trail=[];}this.canvas.dataset.dimension=this.is3D?'3d':'2d';}
    if (this.config.count !== oldCount) {
      if(this.scene.model==='gravity'){if(!this.cosmicBirth||this.cosmicBirth.born)this.reset(false);return;}
      this.particles.length = Math.min(this.particles.length, this.config.count);
      while (this.particles.length < this.config.count) this.particles.push(this.model.create(this, this.particles.length));
      this.respawns = [];
    }
    if (this.scene.model === 'flock') {
      this.particles.length = Math.min(this.particles.length, this.config.populationCap);
      if (old.breeding !== this.config.breeding || old.birthInterval !== this.config.birthInterval) this.birthClock = 0;
      if (old.predatorBreeding !== this.config.predatorBreeding || old.predatorBirthInterval !== this.config.predatorBirthInterval || old.predators !== this.config.predators) this.predatorBirthClock = 0;
    }
    if (this.config.replenish === 'no') this.respawns = [];
    else if (oldReplenish === 'no' && this.config.replenish === 'yes') this.respawns = Array.from({ length: Math.max(0, this.config.count - this.particles.length) }, (_, i) => this.time + 1 + i * .06);
    this.syncPredators(old.predators !== this.config.predators); this.containEdges(0,old.edgeWrap!==this.config.edgeWrap||old.depth!==this.config.depth); this.draw();
  }
  createPredator(parent) {
    const angle = Math.random() * TAU;
    return seed3(this, { x: parent ? boundCoordinate(parent.x + Math.cos(angle) * 20, this.world.width, this.is3D||this.world.bounded) : Math.random() * this.world.width, y: parent ? boundCoordinate(parent.y + Math.sin(angle) * 20, this.world.height, this.is3D||this.world.bounded) : Math.random() * this.world.height, vx: Math.cos(angle) * .8, vy: Math.sin(angle) * .8, rest: 0, meals: 0 }, parent);
  }
  syncPredators(resetCount = false) {
    const target = this.config.predators || 0;
    this.predators.length = Math.min(target === 0 ? 0 : resetCount ? target : this.config.predatorCap, this.predators.length);
    if (resetCount) while (this.predators.length < target) this.predators.push(this.createPredator());
  }
  breedPopulation(dt) {
    const c = this.config;
    if (c.breeding === 'yes' && this.particles.length) {
      this.birthClock += dt;
      if (this.birthClock + 1e-9 >= c.birthInterval) {
        this.birthClock = 0;
        const parents = this.particles.length, count = Math.min(c.birthBatch, c.populationCap - parents);
        for (let i = 0; i < count; i++) {
          const parent = this.particles[Math.floor(Math.random() * parents)], newborn = this.model.create(this, this.particles.length, true), angle = Math.random() * TAU;
          newborn.x = boundCoordinate(parent.x + Math.cos(angle) * 15, this.world.width, this.is3D||this.world.bounded); newborn.y = boundCoordinate(parent.y + Math.sin(angle) * 15, this.world.height, this.is3D||this.world.bounded);
          newborn.vx = parent.vx; newborn.vy = parent.vy; seed3(this,newborn,parent);
          this.particles.push(newborn); this.born++;
        }
      }
    } else this.birthClock = 0;
    if (c.predatorBreeding === 'yes' && this.predators.length) {
      this.predatorBirthClock = Math.min(c.predatorBirthInterval, this.predatorBirthClock + dt);
      if (this.predatorBirthClock + 1e-9 >= c.predatorBirthInterval && this.predators.length < c.predatorCap && this.particles.length) {
        const parent = this.predators.find(hunter => hunter.meals >= c.birthMeals);
        if (parent) {
          parent.meals -= c.birthMeals;
          this.predators.push(this.createPredator(parent)); this.predatorBorn++; this.predatorBirthClock = 0;
        }
      }
    } else this.predatorBirthClock = 0;
  }
  setPointer(x, y, active = true) {
    if(this.is3D&&this.config.pointer!=='magnify'){this.pointer.active=false;return;}
    const box=this.canvas.getBoundingClientRect();
    this.pointer = { x: (x-box.left-this.origin.x)/this.scale, y: (y-box.top-this.origin.y)/this.scale, active };
    if(this.paused&&this.config.pointer==='magnify')this.draw();
  }
  clearPointer() {
    const wasActive=this.pointer.active;this.pointer.active=false;
    if(wasActive&&this.paused&&this.config.pointer==='magnify')this.draw();
  }
  // Pointer events can cancel a hold every few milliseconds. They must not reset simulation time.
  setBoost(active) { this.boost = active && !this.paused && !this.is3D ? 2 : 1; }
  setPaused(value) {
    if (this.paused === value) return;
    this.paused = value; this.setBoost(false); this.lastFrame = 0; this.accumulator = 0;
  }
  step(dt = 1 / 60) {
    const step = dt * 60 * (this.scene.model==='gravity'?COSMIC_RATE:1); this.time += dt; this.trailTime+=dt/(this.config.speed*this.boost); this.tick++;
    if(this.advanceCosmicBirth(step))return;
    this.containEdges(step);
    (this.is3D ? volume : this.model).update(this, step);
    this.containEdges();
    for (const fade of this.fades) fade.life -= dt * 2;
    this.fades = this.fades.filter(fade => fade.life > 0);
    if(this.scene.model==='gravity'&&!this.cosmicBirth&&this.particles.length&&this.config.collisions!=='off'){
      const total=this.particles.reduce((sum,p)=>sum+p.mass,0);
      const center=this.particles.reduce((largest,p)=>p.mass>largest.mass?p:largest);
      // Recycle at 99% of the mass currently present, before adding new dust.
      // Gather the small remainder without losing its mass or momentum.
      if(center.mass>=total*.99){
        const momentum=this.particles.reduce((sum,p)=>[sum[0]+p.mass*p.vx,sum[1]+p.mass*p.vy,sum[2]+p.mass*p.vz],[0,0,0]);
        const k=this.is3D?volume.project(this,center).sizeK*BODY_SCALE_3D:this.scale*BODY_SCALE_2D;
        this.cosmicBirth={born:false,startedAt:this.time,recycling:true,center,radius:Math.max(1,cosmicVisualRadius(center)*k)};
        center.mass=total;[center.vx,center.vy,center.vz]=momentum.map(v=>v/total);
        if(this.followTarget&&this.particles.includes(this.followTarget))this.followTarget=center;
        this.particles=[center];center.trail=[];this.fades=[];
      }
    }
    this.replenishCosmos(dt);
  }
  frame(now) {
    if (this.destroyed) return;
    if (!document.hidden && !this.paused) {
      const elapsed = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, .06) : 0;
      this.accumulator += elapsed * this.config.speed * this.boost;
      let iterations = 0;
      while (this.accumulator >= 1 / 60 && iterations++ < 16) { this.step(); this.accumulator -= 1 / 60; }
      this.draw();
    }
    this.lastFrame = now; this.raf = requestAnimationFrame(this.frame);
  }
  draw() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawWorld(ctx);this.drawMagnifier();
  }
  drawWorld(ctx,view={zoom:1,x:0,y:0}) {
    if(this.cosmicBirth?.recycling&&!this.cosmicBirth.born){drawCosmicBirth(this,ctx,view);return;}
    ctx.setTransform(this.dpr*this.scale*view.zoom,0,0,this.dpr*this.scale*view.zoom,this.dpr*(this.origin.x*view.zoom+view.x),this.dpr*(this.origin.y*view.zoom+view.y));
    if(this.is3D){volume.draw(this,ctx,view);drawCosmicBirth(this,ctx,view);return;}
    this.model.draw(this, ctx);
    for (const fade of this.fades) { ctx.globalAlpha = fade.life * .35; ctx.strokeStyle = this.palette.impact; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(fade.x, fade.y, 3 + (1 - fade.life) * 8, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
    drawCosmicBirth(this,ctx,view);
  }
  hasParticle(p) { return !!p&&(this.particles?.includes(p)||this.predators?.includes(p)); }
  clearFollow() {
    clearTimeout(this.followTimer);this.followTimer=null;this.followTarget=null;this.followPrevious=undefined;this.followGesture=null;
  }
  particleScreen(p) {
    const point=this.is3D?volume.project(this,p):{x:p.x*this.scale+this.origin.x,y:p.y*this.scale+this.origin.y};
    if(!this.world.bounded&&!p.incoming){point.x=wrap(point.x,this.width);point.y=wrap(point.y,this.height);}
    return point;
  }
  magnifierView() {
    if(this.followTarget&&!this.hasParticle(this.followTarget))this.clearFollow();
    const point=this.followTarget?this.particleScreen(this.followTarget):{
      x:this.pointer.active?this.pointer.x*this.scale+this.origin.x:this.width/2,
      y:this.pointer.active?this.pointer.y*this.scale+this.origin.y:this.height/2,
    };
    return {...point,zoom:2.5,radius:Math.min(150,this.width*.23,this.height*.23)};
  }
  pickParticle(clientX,clientY) {
    if(this.config.pointer!=='magnify')return null;
    const box=this.canvas.getBoundingClientRect(),x=clientX-box.left,y=clientY-box.top,lens=this.magnifierView();
    const inLens=Math.hypot(x-lens.x,y-lens.y)<=lens.radius;
    const world={width:this.width,height:this.height,bounded:this.world.bounded};
    let target=null,best=10;
    for(const p of [...this.particles,...this.predators]){
      const point=this.particleScreen(p);
      periodicCopies({...point,incoming:p.incoming},world,lens.radius,(px,py)=>{
        const sx=inLens?lens.x+(px-lens.x)*lens.zoom:px,sy=inLens?lens.y+(py-lens.y)*lens.zoom:py;
        if(inLens&&Math.hypot(sx-lens.x,sy-lens.y)>lens.radius)return;
        const distance=Math.hypot(sx-x,sy-y);
        if(distance<best){best=distance;target=p;}
      });
    }
    return target;
  }
  drawMagnifier() {
    if(this.config.pointer!=='magnify'||!this.width||!this.height)return;
    const ctx=this.ctx,{x,y,zoom,radius}=this.magnifierView();
    // Render the same world again at lens resolution: crisp shapes, no physics updates or image feedback.
    const side=Math.ceil(radius*2*this.dpr);
    if(!this.lensCanvas){this.lensCanvas=document.createElement('canvas');this.lensContext=this.lensCanvas.getContext('2d');}
    if(this.lensCanvas.width!==side||this.lensCanvas.height!==side){this.lensCanvas.width=side;this.lensCanvas.height=side;}
    this.lensContext.setTransform(1,0,0,1,0,0);this.lensContext.clearRect(0,0,side,side);
    this.drawWorld(this.lensContext,{zoom,x:radius-x*zoom,y:radius-y*zoom});
    ctx.save();ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.globalAlpha=1;
    ctx.save();ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.clip();
    ctx.clearRect(x-radius-1,y-radius-1,radius*2+2,radius*2+2);
    ctx.drawImage(this.lensCanvas,x-radius,y-radius,radius*2,radius*2);ctx.restore();
    ctx.strokeStyle=this.palette.particle;ctx.globalAlpha=.22;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.stroke();
    ctx.globalAlpha=.6;ctx.fillStyle=this.palette.particle;ctx.font='11px system-ui, sans-serif';ctx.textAlign='center';
    ctx.fillText('2.5×',x,y+radius-14);ctx.restore();
  }
  snapshot() {
    return { dimension:this.is3D?'3d':'2d', camera:{...this.camera}, scene: this.scene.id, model: this.scene.model, world: { ...this.world }, boundary: this.world.bounded?'screen-contained':this.is3D?'screen-periodic-bounded-depth':'periodic', count: this.particles.length, target: this.config.count, populationLimit: this.config.populationCap || this.config.count, predators: this.predators.length, predatorLimit: this.config.predatorCap || 0, born: this.born, predatorBorn: this.predatorBorn, birthClock: this.birthClock, predatorBirthClock: this.predatorBirthClock, captured: this.captured, pending: this.respawns.length, time: this.time, paused: this.paused, finite: this.particles.every(p => [p.x, p.y, p.z3, p.vx, p.vy, p.vz].every(Number.isFinite)), particles: this.particles.slice(0, 12).map(p => ({ x: p.x, y: p.y, z: p.z3, vx: p.vx, vy: p.vy, vz:p.vz })) };
  }
  destroy() {
    this.clearFollow();
    this.canvas.removeEventListener('pointerdown',this.followDown,true);
    window.removeEventListener('pointermove',this.followMove,true);
    this.canvas.removeEventListener('click',this.followClick);
    this.canvas.removeEventListener('dblclick',this.followDouble);
    window.removeEventListener('keydown',this.followEscape,true);
    this.destroyed = true; this.endOrbit(); cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.lensCanvas=null;this.lensContext=null;
    this.canvas.removeEventListener('pointerdown',this.orbitDown,true);this.canvas.removeEventListener('lostpointercapture',this.orbitBlur);
    window.removeEventListener('pointermove',this.orbitMove,true);window.removeEventListener('pointerup',this.orbitUp,true);window.removeEventListener('pointercancel',this.orbitUp,true);
    window.removeEventListener('blur',this.orbitBlur);document.removeEventListener('visibilitychange',this.orbitBlur);
    window.removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
