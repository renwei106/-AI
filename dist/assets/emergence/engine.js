import { SCENES, sanitize } from './scenes.js';

const TAU = Math.PI * 2;
const COSMIC_CHARGE = 3, COSMIC_EXPANSION = 9.6;
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
  if (!m.active || !['repel', 'attract'].includes(engine.pointerMode)) return { x: 0, y: 0 };
  const { x: dx, y: dy } = difference(m, p, engine.world), d = Math.hypot(dx, dy);
  if (d > 145 || d < .01) return { x: 0, y: 0 };
  const f = (1 - d / 145) * strength * (engine.pointerMode === 'attract' ? -.55 : 1);
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
      ctx.fillStyle = e.particleTint(p,e.palette.particle);
      if (c.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, size * .7, 0, TAU); ctx.fill(); }
      else if (c.shape === 'line') { ctx.strokeStyle = e.particleTint(p,e.palette.particle); ctx.lineWidth = 1.1 * BODY_SCALE_2D; ctx.beginPath(); ctx.moveTo(-size * 1.7, 0); ctx.lineTo(size, 0); ctx.stroke(); }
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
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = e.particleTint(p,e.palette.predator);
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

const COSMIC_STAGES = [
  {name:'尘埃',key:null,mass:0,radius:.55,color:0},
  {name:'碎片',key:'fragmentMass',mass:2,radius:1.15,color:3},
  {name:'碎石',key:'rockMass',mass:8,radius:1.5225,color:6},
  {name:'小行星',key:'satelliteMass',mass:32,radius:3.045,color:9},
  {name:'行星',key:'planetMass',mass:128,radius:6.09,color:12},
  {name:'星系源',key:'sourceMass',mass:4096,radius:12.18,color:14},
  {name:'黑洞',key:'blackHoleMass',mass:65536,radius:3.4,color:16},
];
const cosmicStage = (e,p) => {
  let stage=0;
  for(let i=1;i<COSMIC_STAGES.length;i++){
    if(i===6&&e.config.blackHoles==='no')break;
    if(p.mass>=(e.config[COSMIC_STAGES[i].key]??COSMIC_STAGES[i].mass))stage=i;
  }
  return stage;
};
const cosmosRadius = (p = {}) => COSMIC_STAGES[p.stage??0].radius;
const cosmicVisualRadius = p => cosmosRadius(p);
// Visual tier sizes are independent of contact distances and force softening.
const cosmicContactRadius = p => [1,1.25,1.5,1.8,2.1,2.45,2.8][p.stage??0];
const COSMIC_GRAVITY = .0001, COSMIC_RATE = .15, COSMIC_LIMIT = 4000;
const cosmicVisibleSpan = e => Math.min(e.width,e.height)/(e.is3D?e.projection3.focal/e.projection3.distance:e.scale);
// Express gravity, contact distances and seed velocities in the same spatial units.
// 3D uses a closer camera; it must not accelerate a smaller world with the 2D G.
const cosmicUnit = e => .06/cosmicMetersPerUnit(e);
// kg, meters and simulation seconds. Integration uses h=9*dt internally;
// convert both distance cubed and time squared, independently of viewport shape.
const cosmicG = e => COSMIC_GRAVITY/(cosmicMetersPerUnit(e)**3*(60*COSMIC_RATE)**2*.7);
// One viewport width at the center plane represents 100 meters.
// At playback 1x, orbit=1 means a baseline of 0.15 meters/simulation-second.
// Keep integration in render-world coordinates; this is a unit conversion,
// not an SI calibration of masses or the theme's gravitational constant.
const cosmicMetersPerUnit = e => 100*cosmicViewScale(e)/e.width;
const cosmicSeedSpeed = e => .15*e.config.orbit/(cosmicMetersPerUnit(e)*60*COSMIC_RATE);
// A 2D universe is a single XY plane, including a scene switched from 3D mid-birth.
function flattenCosmos(e) {
  const flatten=p=>{p.z3=e.world.depth/2;p.pz=p.z3;p.vz=0;p.az=0;};
  for(const p of [...e.particles,...e.fades,...(e.cosmicBirth?.packets||[])]){
    flatten(p);
    if(p.birthTarget)flatten(p.birthTarget);
    for(const sample of p.trail||[])sample[2]=e.world.depth/2;
  }
  if(e.cosmicBirth?.center)flatten(e.cosmicBirth.center);
}
// A visual cutoff for negligible distant forces, not a physical limit of gravity.
const cosmicLensRadius = e => Math.min(150,e.width*.23,e.height*.23);
const cosmicViewScale = e => e.is3D?e.projection3.focal/e.projection3.distance:e.scale;
// Equal radius bands for successive mass doublings: 1, 2, 4 ... 512 unit masses.
const cosmicReach = (e,mass,blackHoleLevel=0) => {
  const ordinary=Math.min(8,.8*Math.cbrt(Math.max(.001,mass)));
  return (ordinary+(12-ordinary)*clamp(blackHoleLevel,0,1))/cosmicMetersPerUnit(e);
};
// Sparse local queries for dense star fields. Flock neighbourhoods stay independent.
class CosmicIndex {
  constructor(e,threeD,size,previous=false) {
    this.threeD=threeD;this.periodic=!threeD&&!e.world.bounded;this.cells=new Map();
    this.n=[e.world.width,e.world.height,e.world.depth].map(length=>Math.max(1,Math.floor(length/size)));
    this.s=[e.world.width,e.world.height,e.world.depth].map((length,i)=>length/this.n[i]);
    this.previous=previous;
  }
  key(x,y,z){if(this.periodic){x=wrap(x,this.n[0]);y=wrap(y,this.n[1]);}return (x+32768)*4294967296+(y+32768)*65536+(this.threeD?z+32768:0);}
  add(p,value){const x=Math.floor((this.previous?p.px:p.x)/this.s[0]),y=Math.floor((this.previous?p.py:p.y)/this.s[1]),z=this.threeD?Math.floor((this.previous?p.pz:p.z3)/this.s[2]):0,key=this.key(x,y,z);let cell=this.cells.get(key);if(!cell){cell=[];cell.x=x;cell.y=y;cell.z=z;this.cells.set(key,cell);}cell.push(value);}
  visit(p,r,fn){
    const px=this.previous?p.px:p.x,py=this.previous?p.py:p.y,pz=this.previous?p.pz:p.z3;
    const x0=Math.floor((px-r)/this.s[0]),y0=Math.floor((py-r)/this.s[1]),z0=this.threeD?Math.floor((pz-r)/this.s[2]):0;
    let x1=Math.floor((px+r)/this.s[0]),y1=Math.floor((py+r)/this.s[1]);const z1=this.threeD?Math.floor((pz+r)/this.s[2]):0;
    if(this.periodic){x1=Math.min(x1,x0+this.n[0]-1);y1=Math.min(y1,y0+this.n[1]-1);}
    // Large 3D ranges mostly cover empty cells. Query occupied cells instead of
    // walking hundreds of thousands of empty coordinates; retain exact pairs.
    if(!this.periodic&&(x1-x0+1)*(y1-y0+1)*(z1-z0+1)>this.cells.size*2){
      for(const cell of this.cells.values())if(cell.x>=x0&&cell.x<=x1&&cell.y>=y0&&cell.y<=y1&&cell.z>=z0&&cell.z<=z1)for(const item of cell)fn(item);
      return;
    }
    for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++){
      const cell=this.cells.get(this.key(x,y,z));if(cell)for(const item of cell)fn(item);
    }
  }
}
function cosmicPointer(e,p,threeD) {
  if(!e.pointer.active||e.orbitDrag||!['attract','repel'].includes(e.pointerMode))return;
  // A cursor source at each body's screen depth keeps intervention local and visible.
  const s=threeD?volume.project(e,p):{x:p.x*e.scale,y:p.y*e.scale,k:e.scale};
  const px=e.pointer.x*e.scale+e.origin.x,py=e.pointer.y*e.scale+e.origin.y;
  const dx=px-s.x,dy=py-s.y,d=Math.hypot(dx,dy),radius=cosmicLensRadius(e);
  if(d>=radius||d<.1)return;
  const sign=e.pointerMode==='attract'?1:-1;
  const force=sign*.18*cosmicUnit(e)*(1-d/radius)**2*Math.min(1,d/12);
  const ax=dx/d*force,ay=dy/d*force;
  if(threeD){
    const {yaw,pitch}=e.camera,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    p.ax+=cy*ax+sy*sp*ay;p.ay+=cp*ay;p.az+=sy*ax-cy*sp*ay;
  }else {p.ax+=ax;p.ay+=ay;}
}
function evolveBlackHoles(e,step) {
  const enabled=e.config.blackHoles==='yes';
  for(const p of e.particles){
    // A theme rule based on the mass currently present, including incoming dust.
    // Once formed, a hole stays one until reset or the rule is switched off.
    p.stage=cosmicStage(e,p);
    p.blackHole=enabled&&p.stage===6;
    const target=p.blackHole?1:0;
    p.blackHoleLevel=enabled?(p.blackHoleLevel||0)+(target-(p.blackHoleLevel||0))*(1-Math.exp(-step/45)):0;
  }
}
// Keep the existing trail setting; each increment retains 25 ms of playback time.
const cosmicTrailDuration = e => e.config.trail / 40;
function recordCosmicTrail(e,p) {
  const duration=cosmicTrailDuration(e);
  if(!duration||p.mass<e.config.fragmentMass){p.trail.length=0;return;}
  if(!p.trail.length||e.trailTime-p.trail.at(-1)[3]>=1/60)p.trail.push([p.x,p.y,p.z3,e.trailTime]);
  const cutoff=e.trailTime-duration;
  // Retain one older sample to interpolate the exact start of the time window.
  while(p.trail.length>1&&p.trail[1][3]<=cutoff)p.trail.shift();
}
function drawCosmicTrails(e,ctx,project,world,threeD=false) {
  // Batch similar opacities: a soft fade without thousands of gradient objects.
  const bands=Array.from({length:24},()=>[]),opacityStep=.26/bands.length;
  const minLength=.35/(Math.abs(ctx.getTransform().a)/e.dpr);
  for(const p of e.particles){
    if(p.releaseAt>e.time)continue;
    const duration=cosmicTrailDuration(e);
    if(!duration||!p.trail.length)continue;
    const cutoff=e.trailTime-duration;
    const history=[...p.trail,[p.x,p.y,p.z3,e.trailTime]];
    const points=history.map(([x,y,z3,time])=>{const point=project({x,y,z3});point.time=time;return point;});
    // Subpixel trails are already covered by the stellar dot; magnification lowers
    // this threshold so those same trails remain visible through the lens.
    let length=0;for(let i=1;i<points.length;i++)length+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
    if(length<minLength)continue;
    for(let i=1;i<points.length;i++){
      let a=points[i-1];const b=points[i];
      if(b.time<=cutoff)continue;
      if(a.time<cutoff){const t=(cutoff-a.time)/(b.time-a.time);a={...a,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,time:cutoff};}
      const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d<.001)continue;
      if(Math.abs(dx)>world.width/2||Math.abs(dy)>world.height/2)continue;
      // Smooth the sampled path, without connecting across a wrapped boundary.
      const nearby=(q,r)=>q&&Math.abs(q.x-r.x)<=world.width/2&&Math.abs(q.y-r.y)<=world.height/2;
      const before=nearby(points[i-2],a)?points[i-2]:a,after=nearby(points[i+1],b)?points[i+1]:b;
      const tangent=(x,y)=>{const factor=Math.min(1,d/3/(Math.hypot(x,y)||1));return {x:x*factor,y:y*factor};};
      const t1=tangent((b.x-before.x)/6,(b.y-before.y)/6),t2=tangent((after.x-a.x)/6,(after.y-a.y)/6);
      const fade=clamp(((a.time+b.time)/2-cutoff)/duration,0,1)**1.6;
      const reveal=p.revealAt===undefined?1:smooth(clamp((e.time-p.revealAt)/1.6,0,1));
      const alpha=.18*fade*(threeD?.95-(a.depth+b.depth)*.3:.72)*reveal;
      const band=Math.round(alpha/opacityStep)-1;
      if(band<0)continue;
      const midpoint={incoming:p.incoming,x:world.bounded||p.incoming?(a.x+b.x)/2:wrap((a.x+b.x)/2,world.width),y:world.bounded||p.incoming?(a.y+b.y)/2:wrap((a.y+b.y)/2,world.height)};
      periodicCopies(midpoint,world,Math.max(Math.abs(dx),Math.abs(dy))/2+d/3+1,(x,y)=>bands[Math.min(band,bands.length-1)].push([x-dx/2,y-dy/2,x-dx/2+t1.x,y-dy/2+t1.y,x+dx/2-t2.x,y+dy/2-t2.y,x+dx/2,y+dy/2]));
    }
  }
  ctx.save();ctx.lineWidth=threeD?.7:.65;ctx.lineCap='round';ctx.strokeStyle=e.palette.particle;
  for(let i=0;i<bands.length;i++){
    if(!bands[i].length)continue;
    ctx.globalAlpha=(i+1)*opacityStep;ctx.beginPath();
    for(const [x1,y1,c1x,c1y,c2x,c2y,x2,y2] of bands[i]){ctx.moveTo(x1,y1);ctx.bezierCurveTo(c1x,c1y,c2x,c2y,x2,y2);}
    ctx.stroke();
  }
  ctx.restore();
}
function drawCosmicBody(e,ctx,p,x,y,k=1,alpha=.8) {
  if(p.releaseAt>e.time)return;
  alpha*=p.revealAt===undefined?1:smooth(clamp((e.time-p.revealAt)/1.6,0,1));
  p.stage=cosmicStage(e,p);
  const level=p.stage/6,color=e.particleTint(p,e.palette.mass[COSMIC_STAGES[p.stage].color]);
  const radius=Math.max(.2,(p.visualRadius ?? cosmicVisualRadius(p))*k);
  ctx.save();
  if(p.mass>1.5){
    const halo=Math.max(radius*2,cosmosRadius(p)*k*4),g=ctx.createRadialGradient(x,y,0,x,y,halo);
    g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.globalAlpha=alpha*(.12+level*.2);ctx.beginPath();ctx.arc(x,y,halo,0,TAU);ctx.fill();
  }
  ctx.globalAlpha=alpha*(.75+level*.25);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();ctx.restore();
  if(p.blackHoleLevel>.001){
    const t=p.blackHoleLevel,r=Math.max(.55,COSMIC_STAGES[6].radius*k)+Math.min(4,3*k);
    const growth=clamp(Math.log2(Math.max(1,p.mass/(e.config.blackHoleMass||65536)))/5,0,1);
    const core=r*(.65+.32*growth);
    ctx.save();ctx.globalAlpha=alpha*t;
    const glow=ctx.createRadialGradient(x,y,r*.8,x,y,r*4);
    glow.addColorStop(0,e.palette.particle);glow.addColorStop(.3,e.palette.glow);glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r*4,0,TAU);ctx.fill();
    ctx.strokeStyle=e.palette.particle;ctx.lineWidth=Math.max(.65,k*.55);
    ctx.beginPath();
    if(e.is3D)ctx.ellipse(x,y,r*2.1,r*.7,-.35,0,TAU);else ctx.arc(x,y,r*2.1,0,TAU);
    ctx.stroke();
    ctx.fillStyle='#06080c';ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
    ctx.globalAlpha=alpha*t*.75;ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.stroke();ctx.restore();
  }
}
function drawCosmicImpact(e,ctx,p,x,y,k=1) {
  const t=1-p.life,major=p.impact==='burst',quiet=p.impact==='absorb';
  const radius=(major?5+t*22:quiet?2+t*4:2+t*7)*k;
  ctx.save();
  const glow=ctx.createRadialGradient(x,y,0,x,y,radius);
  glow.addColorStop(0,e.palette.center);glow.addColorStop(.25,e.palette.impact);glow.addColorStop(1,'transparent');
  ctx.globalAlpha=p.life*p.life*(major?.85:quiet?.16:.3);ctx.fillStyle=glow;
  ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();
  if(major){
    ctx.globalAlpha=p.life*p.life*.9;ctx.fillStyle=e.palette.center;
    ctx.beginPath();ctx.arc(x,y,Math.max(.2,(1-t)*3*k),0,TAU);ctx.fill();
    ctx.globalAlpha=p.life*.24;ctx.strokeStyle=e.palette.impact;ctx.lineWidth=.7*k;
    ctx.beginPath();ctx.arc(x,y,radius*.8,0,TAU);ctx.stroke();
  }
  ctx.restore();
}
function collideCosmos(e,step,threeD) {
  const w=e.world,particles=e.particles,used=new Set(),born=[];
  const travel=particles.map(p=>Math.hypot(p.vx,p.vy,threeD?p.vz:0)*step);
  const index=new CosmicIndex(e,threeD,12*cosmicUnit(e),true);
  let maxReach=0;
  for(let i=0;i<particles.length;i++){index.add(particles[i],i);maxReach=Math.max(maxReach,particles[i].radius+travel[i]);}
  for(let i=0;i<particles.length;i++){
    const a=particles[i];if(used.has(a)||a.collisionAt>e.time)continue;
    const candidates=[];index.visit(a,a.radius+travel[i]+maxReach,j=>{if(j>i)candidates.push(j);});candidates.sort((a,b)=>a-b);
    for(const j of candidates){
      const b=particles[j];if(used.has(b)||b.collisionAt>e.time)continue;
      // Planets entering a black hole are disrupted before accretion, even
      // when the particle budget temporarily has no room for new debris.
      if(!a.tidalDebris&&!b.tidalDebris&&((cosmicStage(e,a)===6&&cosmicStage(e,b)===4)||(cosmicStage(e,b)===6&&cosmicStage(e,a)===4)))continue;
      const dx=axisDelta(b.px-a.px,w.width,threeD||w.bounded),dy=axisDelta(b.py-a.py,w.height,threeD||w.bounded),dz=threeD?b.pz-a.pz:0;
      const vx=b.vx-a.vx,vy=b.vy-a.vy,vz=threeD?b.vz-a.vz:0,contact=a.radius+b.radius;
      const v2=vx*vx+vy*vy+vz*vz,t=v2?clamp(-(dx*vx+dy*vy+dz*vz)/v2,0,step):0;
      if((dx+vx*t)**2+(dy+vy*t)**2+(dz+vz*t)**2>contact*contact)continue;
      const large=a.mass>=b.mass?a:b,mass=a.mass+b.mass;
      // Passive dust/fragment accretion adds mass without kicking the host.
      const passive=cosmicStage(e,large)>=3&&cosmicStage(e,large===a?b:a)<=1;
      const velocity=key=>passive?large[key]:(a.mass*a[key]+b.mass*b[key])/mass;
      const remnant={...large,mass,vx:velocity('vx'),vy:velocity('vy'),vz:threeD?velocity('vz'):0,trail:[],collisionAt:0,mergeAt:0};
      remnant.stage=cosmicStage(e,remnant);remnant.blackHole=e.config.blackHoles==='yes'&&remnant.stage===6;
      if(cosmicStage(e,a)===6&&cosmicStage(e,b)===6){
        const capacity=Math.min(COSMIC_LIMIT,Math.max(100,e.config.count));
        const slots=capacity-(particles.length-used.size+born.length-2);
        const debris=explodeBlackHole(e,remnant,Math.max(1,Math.min(256,slots)),threeD);
        born.push(...debris);used.add(a);used.add(b);e.merged++;
        if(e.followTarget===a||e.followTarget===b)e.followTarget=debris[0];
        e.fades.push({x:large.x,y:large.y,z3:large.z3,life:1,impact:'burst',duration:1.2});break;
      }
      born.push(remnant);used.add(a);used.add(b);e.merged++;
      if(e.followTarget===a||e.followTarget===b)e.followTarget=remnant;
      const low=Math.min(cosmicStage(e,a),cosmicStage(e,b)),high=Math.max(cosmicStage(e,a),cosmicStage(e,b));
      const impact=low>=4?'burst':low===0&&high>0?'absorb':'dust';
      e.fades.push({x:large.x,y:large.y,z3:large.z3,life:1,impact,duration:impact==='burst'?.85:.45});break;
    }
  }
  if(used.size)e.particles=particles.filter(p=>!used.has(p)).concat(born);
  if(e.fades.length>80)e.fades=e.fades.slice(-80);
}
function explodeBlackHole(e,center,count,threeD) {
  const debris=[],unit=cosmicUnit(e),speed=cosmicSeedSpeed(e)*5;
  // Paired opposite impulses conserve the merged body's vector momentum.
  for(let i=0;i<count;i++){
    const paired=i%2===1,previous=debris[i-1];
    const angle=Math.random()*TAU,z=threeD?Math.random()*2-1:0,r=Math.sqrt(1-z*z);
    const d=paired?previous.blastDirection.map(v=>-v):[Math.cos(angle)*r,Math.sin(angle)*r,z];
    if(i===count-1&&count%2)d.fill(0);
    const p={...center,mass:center.mass/count,blackHole:false,blackHoleLevel:0,trail:[],collisionAt:e.time+1.2,blastDirection:d};
    delete p.captureTarget;delete p.captureDistance2;delete p.burstFloor;
    p.x=center.x+d[0]*unit*3;p.y=center.y+d[1]*unit*3;p.z3=center.z3+d[2]*unit*3;
    p.vx=center.vx+d[0]*speed;p.vy=center.vy+d[1]*speed;p.vz=threeD?center.vz+d[2]*speed:0;
    p.px=p.x;p.py=p.y;p.pz=p.z3;p.stage=cosmicStage(e,p);p.visualRadius=cosmicVisualRadius(p);
    debris.push(p);
  }
  for(const p of debris)delete p.blastDirection;
  return debris;
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
  const softening=3.6*cosmicUnit(e),grid=new CosmicIndex(e,threeD,18*cosmicUnit(e));
  const items=e.particles.map((p,index)=>({p,index,stage:cosmicStage(e,p),reach:cosmicReach(e,p.mass,p.blackHoleLevel||0)}));
  for(const item of items)grid.add(item.p,item);
  for(const a of items)if(a.stage>1)grid.visit(a.p,a.reach,b=>{
    // Let newly emitted debris leave the tiny emission core before self-gravity.
    if(a.p.collisionAt>e.time&&b.p.collisionAt>e.time)return;
    if(b.stage<=1&&!b.p.tidalDebris){
      if(a.stage<3)return;
      const dx=axisDelta(a.p.x-b.p.x,w.width,threeD||w.bounded),dy=axisDelta(a.p.y-b.p.y,w.height,threeD||w.bounded),dz=threeD?a.p.z3-b.p.z3:0;
      const distance2=dx*dx+dy*dy+dz*dz;
      if(distance2<a.reach*a.reach&&distance2<(b.p.captureDistance2??Infinity)){
        b.p.captureTarget=a.p;b.p.captureDistance2=distance2;
      }
      return;
    }
    if(a===b||b.reach>a.reach||b.reach===a.reach&&b.index<a.index)return;
    attractPair(a.p,b.p,w,strength,threeD,a.reach,softening);
  });
}

function captureLightMatter(e,p,h,threeD) {
  const target=p.captureTarget;if(!target)return;
  const w=e.world,dx=axisDelta(target.x-p.x,w.width,threeD||w.bounded),dy=axisDelta(target.y-p.y,w.height,threeD||w.bounded),dz=threeD?target.z3-p.z3:0;
  const distance=Math.hypot(dx,dy,dz);if(!distance)return;
  // Passive matter drifts toward the nearest host across the outer zone,
  // smoothly joining the existing direct accretion inside one third radius.
  const reach=cosmicReach(e,target.mass,target.blackHoleLevel||0);
  const approach=smooth(clamp((1-distance/reach)*1.5,0,1));
  const speed=Math.max(cosmicSeedSpeed(e)*2,distance/18)*Math.sqrt(e.config.mutualGravity/.7)*(.12+.88*approach);
  const dust=cosmicStage(e,p)===0;
  const blend=dust&&approach===1?1:1-Math.exp(-h/(9*((dust?.08:.35)+(1-approach)*1.2)));
  p.vx+=(target.vx+dx/distance*speed-p.vx)*blend;
  p.vy+=(target.vy+dy/distance*speed-p.vy)*blend;
  p.vz=threeD?p.vz+(target.vz+dz/distance*speed-p.vz)*blend:0;
  delete p.burstFloor;
}

function disruptPlanets(e,threeD) {
  if(e.config.collisions==='off'||e.config.mutualGravity<=0)return;
  const holes=e.particles.filter(p=>cosmicStage(e,p)===6);
  if(!holes.length)return;
  const w=e.world,unit=cosmicUnit(e),born=[],removed=new Set();
  let slots=Math.min(COSMIC_LIMIT,Math.max(100,e.config.count))-e.particles.length;
  for(const p of e.particles){
    if(p.tidalDebris||cosmicStage(e,p)!==4||slots<1)continue;
    let host=null,best=Infinity,radial;
    for(const hole of holes){
      const d=[axisDelta(p.x-hole.x,w.width,threeD||w.bounded),axisDelta(p.y-hole.y,w.height,threeD||w.bounded),threeD?p.z3-hole.z3:0],distance=Math.hypot(...d);
      const reach=cosmicReach(e,hole.mass,hole.blackHoleLevel||0)*.24;
      if(distance<reach&&distance<best){host=hole;best=distance;radial=d;}
    }
    if(!host||best<1e-8)continue;
    const n=radial.map(v=>v/best),relative=[p.vx-host.vx,p.vy-host.vy,threeD?p.vz-host.vz:0];
    const dot=relative.reduce((s,v,i)=>s+v*n[i],0),tangent=relative.map((v,i)=>v-dot*n[i]);
    let length=Math.hypot(...tangent);
    if(length<1e-8){tangent[0]=-n[1];tangent[1]=n[0];tangent[2]=0;length=Math.hypot(...tangent);if(length<1e-8){tangent[0]=1;length=1;}}
    const count=Math.min(32,slots+1),spread=Math.min(best*.12,unit*5);
    for(let i=0;i<count;i++){
      const offset=(i/(count-1)-.5)*2;
      const q={...p,mass:p.mass/count,tidalDebris:true,trail:[],collisionAt:e.time+2,blackHole:false,blackHoleLevel:0};
      delete q.captureTarget;delete q.captureDistance2;delete q.burstFloor;
      // A short stream in the original orbital plane, not a prescribed ring.
      q.x=p.x+tangent[0]/length*offset*spread;q.y=p.y+tangent[1]/length*offset*spread;q.z3=p.z3+tangent[2]/length*offset*spread;
      q.vx=p.vx;q.vy=p.vy;q.vz=threeD?p.vz:0;
      q.px=q.x;q.py=q.y;q.pz=q.z3;q.stage=cosmicStage(e,q);q.visualRadius=cosmicVisualRadius(q);born.push(q);
    }
    slots-=count-1;removed.add(p);e.shattered++;
    if(e.followTarget===p)e.followTarget=born[born.length-count];
    e.fades.push({x:p.x,y:p.y,z3:p.z3,life:1,impact:'absorb',duration:.65});
  }
  if(removed.size)e.particles=e.particles.filter(p=>!removed.has(p)).concat(born);
}

function updateCosmos(e,step,threeD=false) {
  const w=e.world,c=e.config,unit=cosmicUnit(e);
  // Only the opening impulse relaxes toward the existing slow drift; there is
  // no radius-triggered stop and no damping on background or later particles.
  for(const p of e.particles)if(p.burstFloor!==undefined){
    const speed=Math.hypot(p.vx,p.vy,p.vz),floor=p.burstFloor;
    if(speed>floor){const next=floor+(speed-floor)*Math.exp(-step/(60*COSMIC_RATE*3));const ratio=next/speed;p.vx*=ratio;p.vy*=ratio;p.vz*=ratio;}
    if(e.time-p.burstStart>24)delete p.burstFloor;
  }
  evolveBlackHoles(e,step);
  disruptPlanets(e,threeD);
  const forces=()=>{
    for(const p of e.particles){
      p.mass=p.mass||1;p.radius=cosmicContactRadius(p)*.24*unit+3*unit*(p.blackHoleLevel||0);
      p.ax=0;p.ay=0;p.az=0;
      delete p.captureTarget;delete p.captureDistance2;
      cosmicPointer(e,p,threeD);
    }
    if(c.mutualGravity>0)mutualAttraction(e,threeD);
  };
  // Kick-drift-kick leapfrog. Resolve close approaches with shorter steps;
  // quiet orbital motion does not need the extra full gravity evaluation.
  forces();
  let remaining=step;
  while(remaining>1e-10){
    const acceleration=e.particles.reduce((peak,p)=>Math.max(peak,Math.hypot(p.ax,p.ay,p.az)),1e-9);
    // Re-evaluate after every substep: a flyby can enter the strong-force core
    // mid-frame. Resolve its curve without replacing or damping its velocity.
    const h=Math.min(remaining,.9,.1*Math.sqrt(3.6*unit/acceleration));
    for(const p of e.particles){
      p.px=p.x;p.py=p.y;p.pz=p.z3;
      captureLightMatter(e,p,h,threeD);
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
    remaining-=h;
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
    const dx=x-e.world.width/2,dy=y-e.world.height/2;
    // Keep enough initial drift for flybys even without an external attractor.
    const v=cosmicSeedSpeed(e)*(.8+Math.random()*.4);
    // Scattered positions with mostly tangential motion avoid immediate radial collapse.
    const direction=Math.random()<.03?-1:1,a=Math.atan2(dy,dx)+direction*Math.PI/2+(Math.random()-.5)*.5;
    const p=seed3(e, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, size: 1.8, mass:1, collisionAt:0, z: Math.random(), trail: [], age: 1 });
    if(e.is3D)p.vz*=v*.35;else {p.z3=e.world.depth/2;p.vz=0;}
    return p;
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
  const birth=e.cosmicBirth,elapsed=birth.born?e.time-birth.startedAt:(birth.chargeElapsed??e.time-birth.startedAt);
  const charging=!birth.born,t=charging?clamp(elapsed/COSMIC_CHARGE,0,1):clamp((elapsed-COSMIC_CHARGE)/3,0,1);
  ctx.save();ctx.setTransform(e.dpr*view.zoom,0,0,e.dpr*view.zoom,e.dpr*view.x,e.dpr*view.y);
  if(!charging&&t>=1){ctx.restore();return;}
  const screen=birth.center?(e.is3D?volume.project(e,birth.center):{x:birth.center.x*e.scale,y:birth.center.y*e.scale}):{x:e.width/2,y:e.height/2};
  const x=e.world.bounded?screen.x:wrap(screen.x,e.width),y=e.world.bounded?screen.y:wrap(screen.y,e.height);
  const radius=charging?3+31*smooth(t):34+80*(1-(1-t)**3);
  const glow=ctx.createRadialGradient(x,y,0,x,y,radius);
  glow.addColorStop(0,e.palette.center);glow.addColorStop(.18,e.palette.glow);glow.addColorStop(1,'transparent');
  ctx.globalAlpha=charging?.4+.5*t:(1-t)**2;ctx.fillStyle=glow;
  ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();
  ctx.fillStyle=e.palette.center;ctx.globalAlpha=charging?.65+.35*t:(1-t)**3;
  const core=birth.recycling?birth.radius*(t<.5?1-.3*smooth(t*2):.7+.45*smooth((t-.5)*2)):.8+4.2*smooth(t);
  ctx.beginPath();ctx.arc(x,y,charging?core:5+8*t,0,TAU);ctx.fill();
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
      ctx.globalAlpha=alpha*(p.age??1);ctx.fillStyle=e.particleTint(p,predator?e.palette.predator:e.palette.particle);
      if(type==='fade'){if(p.impact){drawCosmicImpact(e,ctx,p,s.x,s.y,s.sizeK*BODY_SCALE_3D);continue;}ctx.globalAlpha=p.life*.4;ctx.strokeStyle=e.palette.impact;ctx.beginPath();ctx.arc(s.x,s.y,(3+(1-p.life)*8)*s.sizeK,0,TAU);ctx.stroke();continue;}
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
      if(!predator&&e.config.shape==='line'){const a=vertex(-2,0,0),b=vertex(2,0,0);ctx.strokeStyle=e.particleTint(p,e.palette.particle);ctx.lineWidth=Math.max(.7,s.sizeK*BODY_SCALE_3D);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();continue;}
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
      if(event.button!==0||!event.isPrimary)return;
      this.lensPointer={x:event.clientX,y:event.clientY};
      this.followGesture={x:event.clientX,y:event.clientY,at:performance.now(),moved:false,target:this.pickParticle(event.clientX,event.clientY,true)};
    };
    this.followMove=event=>{
      const g=this.followGesture;if(g&&Math.hypot(event.clientX-g.x,event.clientY-g.y)>6)g.moved=true;
      this.lensPointer=event.target===this.canvas?{x:event.clientX,y:event.clientY}:null;
      if(this.followTarget){
        if(!this.pointerInLens()){this.followHintUntil=0;clearTimeout(this.followHintTimer);}
        if(this.paused)this.draw();
      }
    };
    this.followClick=event=>{
      if(event.button!==0)return;
      if(event.detail>1)return;
      this.followPrevious=this.followTarget||null;
      const g=this.followGesture;
      if(!g||g.moved||performance.now()-g.at>280||!g.target)return;
      clearTimeout(this.followTimer);
      this.followTimer=setTimeout(()=>{
        this.followTimer=null;
        if(!this.destroyed&&this.hasParticle(g.target)){
          this.setMagnifier(true);
          this.followTarget=g.target;this.followHintUntil=performance.now()+1800;
          clearTimeout(this.followHintTimer);
          this.followHintTimer=setTimeout(()=>{this.followHintUntil=0;if(!this.destroyed&&this.paused)this.draw();},1800);
          this.draw();
        }
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
    this.followContext=event=>{
      if(this.pointerMode!=='magnify'||!(this.followTarget||this.followTimer))return;
      event.preventDefault();event.stopPropagation();this.clearFollow();
      this.setPointer(event.clientX,event.clientY);this.draw();
    };
    this.canvas.addEventListener('contextmenu',this.followContext);
    this.lensZoom=2.5;
    this.lensWheel=event=>{
      if(this.destroyed||this.pointerMode!=='magnify'||event.ctrlKey)return false;
      const lens=this.magnifierView(),box=this.canvas.getBoundingClientRect();
      if(Math.hypot(event.clientX-box.left-lens.x,event.clientY-box.top-lens.y)>lens.radius)return false;
      event.preventDefault();event.stopImmediatePropagation();
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?this.height:1);
      this.lensZoom=clamp(this.lensZoom*Math.exp(-clamp(delta,-240,240)*.002),2.5,10);
      this.draw();return true;
    };
    // The home navigation capture handler offers the lens its wheel event first.
    this.canvas.consumeMagnifierWheel=this.lensWheel;
    this.canvas.addEventListener('wheel',this.lensWheel,{passive:false});
    this.canvas.addEventListener('pointerdown',this.followDown,true);
    window.addEventListener('pointermove',this.followMove,true);
    this.canvas.addEventListener('click',this.followClick);
    this.canvas.addEventListener('dblclick',this.followDouble);
    window.addEventListener('keydown',this.followEscape,true);
    this.orbitDown = event => {
      if (!this.is3D || !event.isPrimary || event.button !== 0) return;
      event.preventDefault(); event.stopImmediatePropagation(); this.setBoost(false); this.pointer.active=false;
      this.orbitDrag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY}; this.canvas.setPointerCapture(event.pointerId); this.canvas.style.cursor='grabbing';
      clearTimeout(this.orbitHoldTimer);
      this.orbitHoldTimer=setTimeout(()=>{if(this.orbitDrag&&!this.orbitDrag.moved&&!document.hidden&&!this.destroyed)this.setBoost(true);},280);
    };
    this.orbitMove = event => { const d=this.orbitDrag;if(!d||d.id!==event.pointerId)return;event.preventDefault();event.stopImmediatePropagation();if(Math.hypot(event.clientX-d.startX,event.clientY-d.startY)>5){d.moved=true;clearTimeout(this.orbitHoldTimer);this.setBoost(false);}this.rotateCamera((event.clientX-d.x)/this.width*TAU,(event.clientY-d.y)/this.height*Math.PI);d.x=event.clientX;d.y=event.clientY; };
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
    const turn=(position,velocity,inset,length,k,predator=false)=>{
      if(position<=inset&&velocity<0||position>=length-inset&&velocity>0)return -velocity;
      if(predator)return velocity;
      const zone=Math.min(60,length*.12),gap=velocity<0?position-inset:length-inset-position;
      return gap<zone?velocity-Math.sign(velocity)*Math.min(Math.abs(velocity)+k*.3,k*.18*step*(1-Math.max(0,gap)/zone)**2):velocity;
    };
    for(const [items,predator] of [[this.particles||[],false],[this.predators||[],true]])for(const p of items){
      if(p.incoming)continue;
      if(!this.is3D){
        const inset=predator?0:Math.min(Math.min(this.width,this.height)*.08,2+(this.scene.model==='gravity'?1.8:p.size*2.8)*BODY_SCALE_2D*this.scale);
        p.vx=turn(p.x*this.scale,p.vx*this.scale,inset,this.width,this.scale,predator)/this.scale;
        p.vy=turn(p.y*this.scale,p.vy*this.scale,inset,this.height,this.scale,predator)/this.scale;
        const x=clamp(p.x,inset/this.scale,w.width-inset/this.scale),y=clamp(p.y,inset/this.scale,w.height-inset/this.scale);
        if((x!==p.x||y!==p.y)&&p.trail)p.trail=[];
        p.x=x;p.y=y;continue;
      }
      const screen=volume.project(this,p),k=screen.k;
      const inset=predator?0:Math.min(Math.min(this.width,this.height)*.08,2+(this.scene.model==='gravity'?1.8:p.size*4)*BODY_SCALE_3D*screen.sizeK);
      // On enabling the boundary, retain the currently visible periodic image.
      const x=clamp(rebase?wrap(screen.x,this.width):screen.x,inset,this.width-inset),y=clamp(rebase?wrap(screen.y,this.height):screen.y,inset,this.height-inset);
      const u=(screen.x-this.width/2)/k,v=(screen.y-this.height/2)/k,vz=dot(p,forward),distance=this.projection3.distance+screen.z;
      const vx=(dot(p,right)-u*vz/distance)*k,vy=(dot(p,up)-v*vz/distance)*k;
      const dx=(turn(screen.x,vx,inset,this.width,k,predator)-vx)/k,dy=(turn(screen.y,vy,inset,this.height,k,predator)-vy)/k;
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
  endOrbit() {clearTimeout(this.orbitHoldTimer);if(this.orbitDrag)this.setBoost(false);const d=this.orbitDrag;this.orbitDrag=null;if(d&&this.canvas.hasPointerCapture(d.id))this.canvas.releasePointerCapture(d.id);this.canvas.style.cursor=this.is3D?'grab':'';}
  setPalette(color, dark, predatorColor = this.predatorColor) {
    this.predatorColor = /^#[a-f0-9]{6}$/i.test(predatorColor) ? predatorColor : undefined;
    this.color = /^#[a-f0-9]{6}$/i.test(color) ? color : '#48614c'; this.dark = dark;
    const rgb = [1, 3, 5].map(i => parseInt(this.color.slice(i, i + 2), 16));
    const max = Math.max(...rgb), delta = max - Math.min(...rgb);
    const hue = !delta ? 0 : max === rgb[0] ? (rgb[1]-rgb[2])/delta : max === rgb[1] ? (rgb[2]-rgb[0])/delta+2 : (rgb[0]-rgb[1])/delta+4;
    const mix = (target, amount, alpha = 1) => `rgba(${rgb.map((v, i) => Math.round(v * (1 - amount) + target[i] * amount)).join(',')},${alpha})`;
    this.palette = {
      particle: mix(dark ? [228, 238, 216] : [20, 42, 30], dark ? .72 : .15),
      focus: mix(dark ? [255,255,255] : [0,0,0], dark ? .42 : .28),
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
    const previousMeters=previous&&this.scene?.model==='gravity'?cosmicMetersPerUnit(this):null;
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
      const ratio=previousMeters?previousMeters/cosmicMetersPerUnit(this):null;
      const birthCenter=this.cosmicBirth?.born&&this.cosmicBirth.center?[this.cosmicBirth.center]:[];
      for (const p of [...(this.particles || []), ...(this.predators || []), ...(this.fades || []), ...(this.cosmicBirth?.packets||[]), ...birthCenter]) {
        if(p.birthTarget)for(const [axis,velocity,length] of [['x','vx','width'],['y','vy','height'],['z3','vz','depth']]){
          const ratio=this.world[length]/previous[length];p.birthTarget[axis]*=ratio;p.birthTarget[velocity]*=ratio;
        }
        p.x = boundCoordinate(ratio?(p.x-previous.width/2)*ratio+this.world.width/2:p.x / previous.width * this.world.width, this.world.width, this.is3D||this.world.bounded); p.y = boundCoordinate(ratio?(p.y-previous.height/2)*ratio+this.world.height/2:p.y / previous.height * this.world.height, this.world.height, this.is3D||this.world.bounded);
        p.z3 = boundCoordinate(ratio?(p.z3-previous.depth/2)*ratio+this.world.depth/2:p.z3 / previous.depth * this.world.depth, this.world.depth, this.is3D);
        if(ratio)for(const key of ['vx','vy','vz'])if(Number.isFinite(p[key]))p[key]*=ratio;
        if (p.trail) p.trail.length = 0;
      }
      if(ratio&&this.cosmicBirth?.pending){
        const groups=new Set();for(const seed of this.cosmicBirth.pending.slice(this.cosmicBirth.next)){
          seed.spread*=ratio;seed.jitter*=ratio;groups.add(seed.group);
        }
        for(const group of groups){group.radius*=ratio;group.speed*=ratio;
          if(group.position)for(const [axis,length] of [['x','width'],['y','height'],['z3','depth']])group.position[axis]=(group.position[axis]-previous[length]/2)*ratio+this.world[length]/2;
        }
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
    this.cosmicEdgeReached=false;this.merged=0;this.shattered=0;this.deflected=0;this.influxClock=0;this.incomingMass=0;this.arrived=0;
    this.birthClock = 0; this.predatorBirthClock = 0; this.born = 0; this.predatorBorn = 0;
    this.cosmicBirth = opening&&this.scene.model==='gravity'?{born:false,startedAt:0,chargeElapsed:0}:null;
    this.openingExpansionTime=this.cosmicBirth?0:null;
    this.particles = this.scene.model==='gravity'?[]:Array.from({ length: this.config.count }, (_, i) => this.model.create(this, i));
    if(this.scene.model==='gravity'&&!opening){
      // Changing the count uses the same bound initial state, without replaying the flash.
      this.cosmicBirth={born:false,startedAt:-COSMIC_CHARGE-COSMIC_EXPANSION};this.advanceCosmicBirth(0);
    }
    this.syncPredators(true); this.containEdges(0,true); this.draw();
  }
  advanceCosmicBirth(step) {
    if(!this.cosmicBirth)return false;
    const birth=this.cosmicBirth;
    if(!birth.born&&birth.chargeElapsed!==undefined){
      // Three seconds of visible charging, regardless of the evolution multiplier.
      birth.chargeElapsed+=step/(60*COSMIC_RATE*this.playbackRate);
      if(birth.chargeElapsed<COSMIC_CHARGE)return true;
      birth.startedAt=this.time-COSMIC_CHARGE;
    }
    const elapsed=this.time-birth.startedAt;
    if(elapsed<COSMIC_CHARGE){
      if(birth.recycling){
        const p=birth.center,drag=Math.exp(-.055*step);p.vx*=drag;p.vy*=drag;p.vz*=drag;
        if(this.is3D)advance3(p,step,this.world);else advance(p,step,this.world);
        this.containEdges();
      }
      return true;
    }
    if(!birth.born){
      const w=this.world,center=birth.center||{x:w.width/2,y:w.height/2,z3:w.depth/2};
      const count=this.config.count,unit=cosmicUnit(this),span=cosmicVisibleSpan(this);
      const direction=()=>{const a=Math.random()*TAU,z=this.is3D?Math.random()*2-1:0,r=Math.sqrt(1-z*z);return {x:Math.cos(a)*r,y:Math.sin(a)*r,z3:z};};
      const groupSize=10,groups=Array.from({length:Math.ceil(count/groupSize)},()=>{
        const d=direction(),speed=cosmicSeedSpeed(this)*(.15+Math.random()*.95);
        const k=cosmicViewScale(this),x=(Math.random()-.5)*this.width*.92/k,y=(Math.random()-.5)*this.height*.92/k;
        const yaw=this.is3D?this.camera.yaw:0,pitch=this.is3D?this.camera.pitch:0,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
        const z=this.is3D?(Math.random()-.5)*Math.min(span,w.depth)*.2:0;
        return {d,radius:0,speed,position:{x:center.x+cy*x+sy*sp*y-sy*cp*z,y:center.y+cp*y+sp*z,z3:center.z3+sy*x-cy*sp*y+cy*cp*z}};
      });
      const weights=Array.from({length:count},()=>.02+Math.random()*.06),sum=weights.reduce((a,b)=>a+b,0);
      birth.center={...center};birth.born=true;birth.pending=[];birth.next=0;
      // Every released body is physical immediately. Pending dust has no trails,
      // forces, draw calls or collision work until its release time.
      for(let i=0;i<count;i++){
        const group=groups[Math.floor(i/groupSize)],d=direction();
        const burst=i%3===0,delay=burst?Math.random()*.35:COSMIC_EXPANSION+Math.random()*5;
        const spread=unit*(this.is3D?.7:2),jitter=cosmicSeedSpeed(this)*.1;
        // Background matter has a small random upper tail. No planets, fixed
        // centers or extra particle budget; only dust receives the opening blast.
        const mix=burst?1:Math.random();
        const mass=mix<.006?this.config.satelliteMass*(1+Math.random()*.4):mix<.05?this.config.rockMass*(1+Math.random()*.5):mix<.23?this.config.fragmentMass*(1+Math.random()*1.5):weights[i]*Math.min(1,this.config.fragmentMass*.9);
        birth.pending.push({delay,burst,group,d,spread,jitter,mass:birth.recycling?center.mass*weights[i]/sum:mass});
      }
      birth.pending.sort((a,b)=>a.delay-b.delay);this.particles=[];
    }
    const age=elapsed-COSMIC_CHARGE;
    while(birth.next<birth.pending.length&&birth.pending[birth.next].delay<=age){
      const seed=birth.pending[birth.next++],{group:g,d,spread,jitter}=seed;
      const p=this.model.create(this),distance=g.speed*age*60*COSMIC_RATE;
      Object.assign(p,{mass:seed.mass,trail:[],releaseAt:0,revealAt:this.time-.1});
      for(const [axis,v] of [['x','vx'],['y','vy'],['z3','vz']]){
        p[axis]=g.position[axis]+g.d[axis]*distance+d[axis]*spread;
        p[v]=g.d[axis]*g.speed+d[axis]*jitter;
      }
      if(!this.is3D){p.z3=this.world.depth/2;p.vz=0;}
      if(seed.burst){
        const r=Math.random()**(this.is3D?1/3:1/2),impulse=Math.hypot(this.width,this.height)/cosmicViewScale(this)*.52*r/(3*60*COSMIC_RATE);
        p.burstFloor=g.speed;p.burstStart=this.time;p.revealAt=undefined;
        for(const [axis,v] of [['x','vx'],['y','vy'],['z3','vz']]){
          p[axis]=birth.center[axis]+d[axis]*cosmicUnit(this)*3;
          p[v]=d[axis]*(impulse+g.speed);
        }
        if(!this.is3D){p.z3=this.world.depth/2;p.vz=0;}
      }
      p.px=p.x;p.py=p.y;p.pz=p.z3;this.particles.push(p);
    }
    if(birth.next===birth.pending.length){this.cosmicBirth=null;this.cosmicEdgeReached=true;}
    // Unlike the old scripted expansion, this does not bypass gravity/collisions.
    return false;
  }

  detectCosmicEdge(step=0) {
    if(this.scene.model!=='gravity'||this.cosmicEdgeReached)return;
    for(const p of this.particles){
      if(p.incoming)continue;
      const q={x:p.x+p.vx*step,y:p.y+p.vy*step,z3:p.z3+p.vz*step};
      const screen=this.is3D?volume.project(this,q):{x:q.x*this.scale,y:q.y*this.scale};
      const inset=this.is3D?2+1.8*BODY_SCALE_3D*screen.sizeK:2+1.8*BODY_SCALE_2D*this.scale;
      if(screen.x<=inset||screen.x>=this.width-inset||screen.y<=inset||screen.y>=this.height-inset){this.cosmicEdgeReached=true;return;}
    }
  }
  replenishCosmos(dt) {
    if(this.scene.model!=='gravity'||this.cosmicBirth||!this.cosmicEdgeReached||this.config.influx!=='yes'){this.influxClock=0;return;}
    this.influxClock+=dt;
    const interval=this.config.influxInterval/this.config.influxBatch;
    const capacity=Math.min(COSMIC_LIMIT,Math.max(100,this.config.count));
    if(this.particles.length>=capacity){this.influxClock=0;return;}
    const births=Math.min(12,capacity-this.particles.length,Math.floor((this.influxClock+1e-9)/interval));
    if(!births)return;
    this.influxClock=Math.max(0,this.influxClock-births*interval);
    const w=this.world,cy=Math.cos(this.camera.yaw),sy=Math.sin(this.camera.yaw),cp=Math.cos(this.camera.pitch),sp=Math.sin(this.camera.pitch);
    const right=[cy,0,sy],up=[sy*sp,cp,-cy*sp];
    const k=this.is3D?this.projection3.focal/this.projection3.distance:this.scale;
    for(let i=0;i<births&&this.particles.length<COSMIC_LIMIT;i++){
      const edge=Math.floor(Math.random()*4),offset=.15+Math.random()*.7;
      const background=Math.random()<.75;
      const x=background?this.width*(.04+Math.random()*.92):edge===0?-6:edge===1?this.width+6:this.width*offset;
      const y=background?this.height*(.04+Math.random()*.92):edge===2?-6:edge===3?this.height+6:this.height*offset;
      const u=(x-this.width/2)/k,v=(y-this.height/2)/k;
      // Offset streams carry angular momentum instead of all aiming at the core.
      const aim=Math.atan2(this.height/2-y,this.width/2-x);
      const a=background?Math.random()*TAU:aim+(Math.random()<.5?-1:1)*(.35+Math.random()*.35);
      const speed=(.8+Math.random()*.4)*cosmicSeedSpeed(this),vx=Math.cos(a)*speed,vy=Math.sin(a)*speed;
      const p=this.model.create(this),mass=.02+Math.random()*.06;
      Object.assign(p,{mass,incoming:!background,revealAt:background?this.time:undefined,trail:[],collisionAt:this.time+1,mergeAt:this.time+1});
      if(this.is3D)Object.assign(p,{x:w.width/2+right[0]*u+up[0]*v,y:w.height/2+right[1]*u+up[1]*v,z3:w.depth/2+right[2]*u+up[2]*v,
        vx:right[0]*vx+up[0]*vy,vy:right[1]*vx+up[1]*vy,vz:right[2]*vx+up[2]*vy});
      else Object.assign(p,{x:x/k,y:y/k,vx,vy,vz:0});
      this.particles.push(p);this.arrived++;this.incomingMass+=mass;
    }
  }
  get pointerMode(){return this.magnifierActive?'magnify':this.config.pointer;}
  setMagnifier(active){
    this.magnifierActive=!!active;
    if(!active)this.clearFollow();
    this.canvas.dispatchEvent(new CustomEvent('emergence-magnifier-change',{detail:{active:this.magnifierActive}}));
    this.draw();
  }
  setConfig(config) {
    const old = this.config, oldCount = old.count, oldReplenish = old.replenish;
    this.config = sanitize(this.scene.id, config);
    if(this.config.blackHoles==='no')for(const p of this.particles){p.blackHole=false;p.blackHoleLevel=0;}
    if(this.pointerMode!=='magnify')this.clearFollow();
    this.world.bounded=this.config.edgeWrap==='no';
    if(old.edgeWrap!==this.config.edgeWrap)for(const p of this.particles){if(p.trail)p.trail=[];}
    if(old.pointer!==this.config.pointer)this.pointer.active=false;
    if(old.depth!==this.config.depth){
      this.endOrbit();this.setBoost(false);this.pointer.active=false;this.fades=[];
      for(const p of this.particles){if(p.trail)p.trail=[];}
      if(this.scene.model==='gravity'&&!this.is3D)flattenCosmos(this);
      this.canvas.dataset.dimension=this.is3D?'3d':'2d';
    }
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
    if(this.is3D&&this.scene.model!=='gravity'&&this.pointerMode!=='magnify'){this.pointer.active=false;return;}
    const box=this.canvas.getBoundingClientRect();
    this.pointer = { x: (x-box.left-this.origin.x)/this.scale, y: (y-box.top-this.origin.y)/this.scale, active };
    this.lastLensPosition={x:x-box.left,y:y-box.top};
    if(this.paused&&(this.pointerMode==='magnify'||this.scene.model==='gravity'))this.draw();
  }
  clearPointer() {
    const wasActive=this.pointer.active;this.pointer.active=false;
    this.lensPointer=null;this.followHintUntil=0;clearTimeout(this.followHintTimer);
    if((wasActive||this.followTarget)&&this.paused&&(this.pointerMode==='magnify'||this.scene.model==='gravity'))this.draw();
  }
  // Pointer events can cancel a hold every few milliseconds. They must not reset simulation time.
  setBoost(active) { this.boost = active && !this.paused ? 2 : 1; }
  get playbackRate() { return this.config.speed*this.boost*(this.scene.model==='gravity'?10:1); }
  setPaused(value) {
    if (this.paused === value) return;
    this.paused = value; this.setBoost(false); this.lastFrame = 0; this.accumulator = 0; this.draw();
  }
  step(dt = 1 / 60) {
    const playback=this.playbackRate,visibleDt=dt/playback;
    if(this.openingExpansionTime!==null&&this.openingExpansionTime!==undefined&&(!this.cosmicBirth||this.cosmicBirth.born)){
      // Keep the dust expansion readable for three visible seconds, then
      // blend back to the selected evolution speed over one more second.
      const progress=smooth(clamp((this.openingExpansionTime+visibleDt/2-3),0,1));
      dt=visibleDt*(1+(playback-1)*progress);
      this.openingExpansionTime+=visibleDt;
      if(this.openingExpansionTime>=4)this.openingExpansionTime=null;
    }
    const step = dt * 60 * (this.scene.model==='gravity'?COSMIC_RATE:1); this.time += dt; this.trailTime+=visibleDt; this.tick++;
    if(this.advanceCosmicBirth(step))return;
    this.detectCosmicEdge(step);
    this.containEdges(step);
    (this.is3D ? volume : this.model).update(this, step);
    this.containEdges();
    for (const fade of this.fades) fade.life -= dt / (fade.duration||.5);
    this.fades = this.fades.filter(fade => fade.life > 0);
    this.replenishCosmos(dt);
  }
  frame(now) {
    if (this.destroyed) return;
    if (!document.hidden && !this.paused) {
      const cosmos=this.scene.model==='gravity';
      const elapsed = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, cosmos?.25:.06) : 0;
      this.accumulator += elapsed * this.playbackRate;
      // Batch high-speed time advancement. Adaptive force steps get shorter
      // on close approaches; swept contacts still cover fast motion.
      const quantum=cosmos?Math.min(1/3,Math.max(1/60,this.playbackRate/120)):1/60;
      let iterations = 0;
      const deadline=performance.now()+24;
      while (this.accumulator >= quantum && iterations++ < 16) {
        this.step(quantum);this.accumulator-=quantum;
        if(cosmos&&performance.now()>deadline)break;
      }
      this.draw();
    } else if(!document.hidden&&this.paused&&this.gravityInspection()?.reach){
      // Hover ripples remain animated while the simulation itself is paused.
      this.draw();
    }
    this.lastFrame = now; this.raf = requestAnimationFrame(this.frame);
  }
  draw() {
    this.hoverTarget=null;
    if((this.pointerMode==='magnify'||this.scene.model==='gravity')&&this.pointer.active&&!this.orbitDrag){
      const box=this.canvas.getBoundingClientRect();
      this.hoverTarget=this.pickParticle(box.left+this.pointer.x*this.scale+this.origin.x,box.top+this.pointer.y*this.scale+this.origin.y);
    }
    this.canvas.style.cursor=this.orbitDrag?'grabbing':this.paused&&this.hoverTarget?'pointer':this.is3D?'grab':'';
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawWorld(ctx);this.drawMagnifier();this.drawGravityLabel(ctx);
  }
  drawWorld(ctx,view={zoom:1,x:0,y:0}) {
    if(this.cosmicBirth?.recycling&&!this.cosmicBirth.born){drawCosmicBirth(this,ctx,view);return;}
    ctx.setTransform(this.dpr*this.scale*view.zoom,0,0,this.dpr*this.scale*view.zoom,this.dpr*(this.origin.x*view.zoom+view.x),this.dpr*(this.origin.y*view.zoom+view.y));
    if(this.is3D){volume.draw(this,ctx,view);drawCosmicBirth(this,ctx,view);this.drawGravityField(ctx,view);return;}
    this.model.draw(this, ctx);
    for (const fade of this.fades) { if(fade.impact){drawCosmicImpact(this,ctx,fade,fade.x,fade.y);continue;}ctx.globalAlpha = fade.life * .35; ctx.strokeStyle = this.palette.impact; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(fade.x, fade.y, 3 + (1 - fade.life) * 8, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
    drawCosmicBirth(this,ctx,view);
    this.drawGravityField(ctx,view);
  }
  gravityInspection() {
    if(this.scene.model!=='gravity'||this.orbitDrag)return null;
    const target=this.hoverTarget||(this.paused?this.followTarget:null);
    if(!target||!this.hasParticle(target)||target.releaseAt>this.time)return null;
    if(!this.paused&&cosmicStage(this,target)<4)return null;
    return {target,reach:this.config.mutualGravity>0&&cosmicStage(this,target)>1?cosmicReach(this,target.mass,target.blackHoleLevel||0):0,strength:cosmicStage(this,target)>1?target.mass*this.config.mutualGravity/.7:0};
  }
  drawGravityField(ctx,view) {
    const info=this.gravityInspection();if(!info||!info.reach)return;
    const {target:p,reach}=info;
    const project=q=>this.is3D?volume.project(this,q):{x:q.x*this.scale+this.origin.x,y:q.y*this.scale+this.origin.y};
    const center=project(p),screen=this.particleScreen(p),dx=screen.x-center.x,dy=screen.y-center.y;
    ctx.save();ctx.setTransform(this.dpr*view.zoom,0,0,this.dpr*view.zoom,this.dpr*view.x,this.dpr*view.y);
    ctx.strokeStyle=this.palette.focus;ctx.lineWidth=.8/view.zoom;
    // Three projected great circles describe the real 3D influence sphere.
    // Staggered wavefronts travel outward; fading at both ends hides the wrap.
    // Use display time so playback speed does not turn the light into a flash.
    const phase=performance.now()/3200;
    for(let layer=0;layer<5;layer++){
    const fraction=layer===0?1:(phase+(layer-1)/4)%1;
    const opacity=layer===0?.07:Math.sin(Math.PI*fraction)**2*.34;
    ctx.shadowColor=this.palette.focus;ctx.shadowBlur=layer===0?0:5*view.zoom;
    for(let plane=0;plane<(this.is3D?3:1);plane++){
      ctx.globalAlpha=opacity*(plane===0?1:.45);ctx.beginPath();
      for(let i=0;i<=96;i++){
        const a=i/96*TAU,u=Math.cos(a)*reach*fraction,v=Math.sin(a)*reach*fraction;
        const q=project({x:p.x+(plane===2?0:u),y:p.y+(plane===1?0:plane===2?u:v),z3:p.z3+(plane===0?0:v)});
        if(i===0)ctx.moveTo(q.x+dx,q.y+dy);else ctx.lineTo(q.x+dx,q.y+dy);
      }
      ctx.stroke();
    }
    }
    ctx.restore();
  }
  drawGravityLabel(ctx) {
    const info=this.gravityInspection();if(!info)return;
    const p=this.particleScreen(info.target),lens=this.magnifierView();
    const inLens=this.pointerMode==='magnify'&&Math.hypot(p.x-lens.x,p.y-lens.y)<lens.radius/lens.zoom;
    const px=inLens?lens.x+(p.x-lens.x)*lens.zoom:p.x,py=inLens?lens.y+(p.y-lens.y)*lens.zoom:p.y;
    const reach=Number((info.reach*cosmicMetersPerUnit(this)).toFixed(2));
    const speed=Math.hypot(info.target.vx,info.target.vy,info.target.vz||0)*cosmicMetersPerUnit(this)*60*COSMIC_RATE;
    const label=`范围 ${reach} m · 质量 ${info.target.mass.toFixed(1)} kg · 速度 ${speed.toFixed(2)} m/s`;
    ctx.save();ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.font='10px system-ui, sans-serif';ctx.textAlign='left';
    const width=ctx.measureText(label).width,x=clamp(px+14,8,Math.max(8,this.width-width-8)),y=clamp(py-18,18,this.height-12);
    ctx.globalAlpha=.8;ctx.fillStyle=this.palette.focus;ctx.fillText(label,x,y);ctx.restore();
  }
  particleTint(p,base) {
    return (this.pointerMode==='magnify'||this.scene.model==='gravity'&&(this.paused||cosmicStage(this,p)>=4))&&(p===this.hoverTarget||p===this.followTarget)?this.palette.focus:base;
  }
  hasParticle(p) { return !!p&&(this.particles?.includes(p)||this.predators?.includes(p)); }
  clearFollow() {
    clearTimeout(this.followTimer);this.followTimer=null;this.followTarget=null;this.followPrevious=undefined;this.followGesture=null;this.hoverTarget=null;
    clearTimeout(this.followHintTimer);this.followHintUntil=0;
  }
  particleScreen(p) {
    const point=this.is3D?volume.project(this,p):{x:p.x*this.scale+this.origin.x,y:p.y*this.scale+this.origin.y};
    if(!this.world.bounded&&!p.incoming){point.x=wrap(point.x,this.width);point.y=wrap(point.y,this.height);}
    return point;
  }
  drawMassLegend(container) {
    container.replaceChildren();
    for(const stage of [...COSMIC_STAGES].reverse()){
      const item=document.createElement('span'),canvas=document.createElement('canvas'),label=document.createElement('span');
      label.textContent=stage.name;canvas.width=104;canvas.height=104;canvas.style.width='36px';canvas.style.height='36px';canvas.setAttribute('aria-hidden','true');
      const ctx=canvas.getContext('2d');ctx.scale(2,2);
      const mass=stage.key?(this.config[stage.key]??stage.mass):.5;
      const sample={mass,stage:COSMIC_STAGES.indexOf(stage),visualRadius:stage.radius,blackHoleLevel:stage.name==='黑洞'?1:0};
      drawCosmicBody(this,ctx,sample,26,26,1,1);
      item.append(canvas,label);container.append(item);
    }
  }
  magnifierView() {
    if(this.followTarget&&!this.hasParticle(this.followTarget))this.clearFollow();
    const point=this.followTarget?this.particleScreen(this.followTarget):{
      x:this.pointer.active?this.pointer.x*this.scale+this.origin.x:(this.lastLensPosition?.x??this.width/2),
      y:this.pointer.active?this.pointer.y*this.scale+this.origin.y:(this.lastLensPosition?.y??this.height/2),
    };
    return {...point,zoom:this.lensZoom||2.5,radius:Math.min(150,this.width*.23,this.height*.23)};
  }
  pointerInLens(lens=this.magnifierView()) {
    if(!this.lensPointer)return false;
    const box=this.canvas.getBoundingClientRect();
    return Math.hypot(this.lensPointer.x-box.left-lens.x,this.lensPointer.y-box.top-lens.y)<=lens.radius;
  }
  pickParticle(clientX,clientY,select=false) {
    if(!select&&this.pointerMode!=='magnify'&&this.scene.model!=='gravity')return null;
    const box=this.canvas.getBoundingClientRect(),x=clientX-box.left,y=clientY-box.top,lens=this.magnifierView();
    const inLens=this.pointerMode==='magnify'&&Math.hypot(x-lens.x,y-lens.y)<=lens.radius;
    const world={width:this.width,height:this.height,bounded:this.world.bounded};
    let target=null,best=10;
    for(const p of [...this.particles,...this.predators]){
      if(p.releaseAt>this.time)continue;
      if(this.scene.model==='gravity'&&cosmicStage(this,p)<2)continue;
      if(!select&&this.scene.model==='gravity'&&!this.paused&&this.pointerMode!=='magnify'&&cosmicStage(this,p)<4)continue;
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
    if(this.pointerMode!=='magnify'||!this.width||!this.height)return;
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
    // A very narrow, low-opacity blurred rim keeps the centre optically crisp.
    ctx.save();ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.arc(x,y,radius-10,0,TAU,true);ctx.clip('evenodd');
    ctx.filter='blur(1.2px)';ctx.globalAlpha=.24;
    ctx.drawImage(this.lensCanvas,x-radius,y-radius,radius*2,radius*2);ctx.restore();
    const rim=ctx.createRadialGradient(x,y,radius-12,x,y,radius+3);
    rim.addColorStop(0,'transparent');rim.addColorStop(.72,this.palette.particle);rim.addColorStop(1,'transparent');
    ctx.globalAlpha=.07;ctx.fillStyle=rim;ctx.beginPath();ctx.arc(x,y,radius+3,0,TAU);ctx.fill();
    ctx.strokeStyle=this.palette.particle;ctx.globalAlpha=.22;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.stroke();
    // Mark the exact same target used by click hit-testing, including periodic copies.
    const target=this.hoverTarget||this.followTarget;
    if(target){
      const point=this.particleScreen(target),world={width:this.width,height:this.height,bounded:this.world.bounded};
      ctx.save();ctx.beginPath();ctx.arc(x,y,radius-3,0,TAU);ctx.clip();
      periodicCopies({...point,incoming:target.incoming},world,radius,(px,py)=>{
        const sx=x+(px-x)*zoom,sy=y+(py-y)*zoom;
        ctx.strokeStyle=this.palette.focus;ctx.globalAlpha=.85;ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(sx,sy,7,0,TAU);ctx.stroke();
      });ctx.restore();
    }
    const canFocus=this.paused&&this.hoverTarget&&this.hoverTarget!==this.followTarget;
    const showExit=this.followTarget&&(performance.now()<this.followHintUntil||this.pointerInLens({x,y,radius}));
    const hints=canFocus?['点击聚焦']:[];
    ctx.globalAlpha=.72;ctx.fillStyle=this.palette.particle;ctx.font='10px system-ui, sans-serif';ctx.textAlign='center';
    const hintInset=showExit?16:0;
    ctx.fillText(`${Number(zoom.toFixed(1))}×`,x,y+radius-16-hints.length*16-hintInset);
    hints.forEach((hint,i)=>ctx.fillText(hint,x,y+radius-16-(hints.length-1-i)*16-hintInset));
    if(this.pointerInLens({x,y,radius})){
      ctx.save();ctx.font='10px system-ui, sans-serif';ctx.globalAlpha=.48;ctx.textBaseline='middle';
      const arcRadius=radius-15,glyphs=[...'滚轮缩放 · 2.5–10×'];
      const widths=glyphs.map(char=>ctx.measureText(char).width+.8),total=widths.reduce((a,b)=>a+b,0);
      let offset=-total/2;
      for(let i=0;i<glyphs.length;i++){
        const angle=-Math.PI/2+(offset+widths[i]/2)/arcRadius;
        ctx.save();ctx.translate(x+Math.cos(angle)*arcRadius,y+Math.sin(angle)*arcRadius);ctx.rotate(angle+Math.PI/2);
        ctx.fillText(glyphs[i],0,0);ctx.restore();offset+=widths[i];
      }
      ctx.restore();
    }
    if(showExit){
      ctx.save();ctx.font='9px system-ui, sans-serif';ctx.globalAlpha=.4;ctx.textBaseline='middle';
      const arcRadius=radius-13,glyphs=[...'右键 / Esc 退出跟随'];
      const widths=glyphs.map(char=>ctx.measureText(char).width+.6),total=widths.reduce((a,b)=>a+b,0);
      let offset=-total/2;
      for(let i=0;i<glyphs.length;i++){
        const angle=Math.PI/2-(offset+widths[i]/2)/arcRadius;
        ctx.save();ctx.translate(x+Math.cos(angle)*arcRadius,y+Math.sin(angle)*arcRadius);ctx.rotate(angle-Math.PI/2);
        ctx.fillText(glyphs[i],0,0);ctx.restore();offset+=widths[i];
      }
      ctx.restore();
    }
    ctx.restore();
  }
  snapshot() {
    return { dimension:this.is3D?'3d':'2d', camera:{...this.camera}, scene: this.scene.id, model: this.scene.model, world: { ...this.world }, boundary: this.world.bounded?'screen-contained':this.is3D?'screen-periodic-bounded-depth':'periodic', count: this.particles.length, target: this.config.count, populationLimit: this.config.populationCap || this.config.count, predators: this.predators.length, predatorLimit: this.config.predatorCap || 0, born: this.born, predatorBorn: this.predatorBorn, birthClock: this.birthClock, predatorBirthClock: this.predatorBirthClock, captured: this.captured, pending: this.respawns.length, time: this.time, paused: this.paused, finite: this.particles.every(p => [p.x, p.y, p.z3, p.vx, p.vy, p.vz].every(Number.isFinite)), particles: this.particles.slice(0, 12).map(p => ({ x: p.x, y: p.y, z: p.z3, vx: p.vx, vy: p.vy, vz:p.vz })) };
  }
  destroy() {
    this.clearFollow();
    this.canvas.removeEventListener('wheel',this.lensWheel);
    delete this.canvas.consumeMagnifierWheel;
    this.canvas.removeEventListener('contextmenu',this.followContext);
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



