import { SCENES, sanitize } from './scenes.js';

const TAU = Math.PI * 2;
// Visual size only: keep the full-screen world and simulation distances unchanged.
const BODY_SCALE_2D = .7, BODY_SCALE_3D = .22;
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
      ctx.scale(BODY_SCALE_2D, BODY_SCALE_2D);
      ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-8, 6); ctx.lineTo(-3, 0); ctx.lineTo(-8, -6); ctx.closePath(); ctx.fill(); ctx.restore();
      });
    }
  },
};

const cosmosRadius = p => 1.8 * Math.cbrt(p.mass || 1);
function drawCosmicBody(e,ctx,p,x,y,k=1,alpha=.8) {
  const level=clamp(Math.log2(Math.max(1,p.mass||1))/8,0,1),color=e.palette.mass[Math.round(level*16)];
  const radius=Math.max(.55,(e.config.massAppearance==='color'?1.8:cosmosRadius(p))*k);
  ctx.save();
  if(p.mass>1.5){
    const halo=Math.max(radius*2,cosmosRadius(p)*k*4),g=ctx.createRadialGradient(x,y,0,x,y,halo);
    g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.globalAlpha=alpha*(.12+level*.2);ctx.beginPath();ctx.arc(x,y,halo,0,TAU);ctx.fill();
  }
  ctx.globalAlpha=alpha*(.75+level*.25);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();ctx.restore();
}
function collideCosmos(e,step,threeD) {
  const c=e.config,w=e.world,particles=e.particles,used=new Set(),born=[];
  let population=particles.length;
  for(let i=0;i<particles.length;i++){
    const a=particles[i];if(used.has(a)||a.collisionAt>e.time)continue;
    for(let j=i+1;j<particles.length;j++){
      const b=particles[j];if(used.has(b)||b.collisionAt>e.time)continue;
      const contact=a.radius+b.radius,reach=contact+8*step,dx=shortest(b.px-a.px,w.width);
      if(Math.abs(dx)>reach)continue;
      const dy=shortest(b.py-a.py,w.height);if(Math.abs(dy)>reach)continue;
      const dz=threeD?shortest(b.pz-a.pz,w.depth):0;if(Math.abs(dz)>reach)continue;
      const vx=b.vx-a.vx,vy=b.vy-a.vy,vz=threeD?b.vz-a.vz:0,travel2=(vx*vx+vy*vy+vz*vz)*step*step;
      const t=travel2?clamp(-(dx*vx+dy*vy+dz*vz)*step/travel2,0,1):0;
      if((dx+vx*step*t)**2+(dy+vy*step*t)**2+(dz+vz*step*t)**2>contact*contact)continue;
      const mass=a.mass+b.mass,weight=b.mass/mass;
      const center={x:wrap(a.x+shortest(b.x-a.x,w.width)*weight,w.width),y:wrap(a.y+shortest(b.y-a.y,w.height)*weight,w.height),z3:wrap(a.z3+shortest(b.z3-a.z3,w.depth)*weight,w.depth)};
      const velocity={vx:(a.mass*a.vx+b.mass*b.vx)/mass,vy:(a.mass*a.vy+b.mass*b.vy)/mass,vz:(a.mass*a.vz+b.mass*b.vz)/mass};
      const impact2=4*a.mass*b.mass/(mass*mass)*(vx*vx+vy*vy+vz*vz);
      const threshold=c.fragmentSpeed*Math.cbrt(Math.max(1,mass/2));
      const fragment=c.collisions==='auto'&&impact2>threshold*threshold&&mass>=.6&&population<1200;
      const seed={...a,...center,...velocity,trail:[],age:1,mass,collisionAt:e.time+.12};
      if(fragment){
        // Three equal fragments conserve mass and momentum; retain only part of the relative kinetic energy.
        const angle=Math.random()*TAU,tilt=threeD?(Math.random()-.5)*Math.PI:0;
        const spread=cosmosRadius({mass:mass/3})*2.5,kick=Math.sqrt(impact2*.35)/2;
        for(let n=0;n<3;n++){
          const phase=angle+n*TAU/3,ux=Math.cos(phase),uy=Math.sin(phase)*Math.cos(tilt),uz=Math.sin(phase)*Math.sin(tilt);
          born.push({...seed,mass:n===2?mass-2*(mass/3):mass/3,x:wrap(center.x+ux*spread,w.width),y:wrap(center.y+uy*spread,w.height),z3:wrap(center.z3+uz*spread,w.depth),vx:velocity.vx+ux*kick,vy:velocity.vy+uy*kick,vz:velocity.vz+uz*kick,trail:[],collisionAt:e.time+c.fragmentGrace});
        }
        population++;e.shattered++;
      }else{born.push(seed);population--;e.merged++;}
      used.add(a);used.add(b);e.fades.push({...center,life:1});break;
    }
  }
  if(used.size)e.particles=particles.filter(p=>!used.has(p)).concat(born);
  if(e.fades.length>80)e.fades=e.fades.slice(-80);
}
function attractPair(a,b,w,strength,threeD) {
  const dx=shortest(b.x-a.x,w.width),dy=shortest(b.y-a.y,w.height),dz=threeD?shortest(b.z3-a.z3,w.depth):0;
  const soft=12+a.radius+b.radius,r2=dx*dx+dy*dy+dz*dz+soft*soft,f=strength/(r2*Math.sqrt(r2));
  a.ax+=dx*f*b.mass;a.ay+=dy*f*b.mass;a.az+=dz*f*b.mass;
  b.ax-=dx*f*a.mass;b.ay-=dy*f*a.mass;b.az-=dz*f*a.mass;
}
function mutualAttraction(e,threeD) {
  const particles=e.particles,w=e.world,strength=10*e.config.mutualGravity;
  if(particles.length<=200){for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++)attractPair(particles[i],particles[j],w,strength,threeD);return;}
  // Nearby bodies stay exact; distant cells act through their mass-weighted centers.
  // Symmetric cell forces preserve momentum without a quadratic all-body calculation.
  const size=Math.max(w.width,w.height,threeD?w.depth:0)/(threeD?9:12);
  const nx=Math.max(1,Math.floor(w.width/size)),ny=Math.max(1,Math.floor(w.height/size)),nz=threeD?Math.max(1,Math.floor(w.depth/size)):1,cells=new Map();
  for(const p of particles){
    const ix=Math.min(nx-1,Math.floor(p.x/w.width*nx)),iy=Math.min(ny-1,Math.floor(p.y/w.height*ny)),iz=threeD?Math.min(nz-1,Math.floor(p.z3/w.depth*nz)):0,key=(ix*ny+iy)*nz+iz;
    let cell=cells.get(key);if(!cell){cell={ix,iy,iz,x:0,y:0,z3:0,mass:0,radius:0,ax:0,ay:0,az:0,items:[]};cells.set(key,cell);}
    cell.items.push(p);cell.mass+=p.mass;cell.x+=p.x*p.mass;cell.y+=p.y*p.mass;cell.z3+=p.z3*p.mass;cell.radius=Math.max(cell.radius,p.radius);
  }
  const groups=[...cells.values()];for(const g of groups){g.x/=g.mass;g.y/=g.mass;g.z3/=g.mass;}
  for(let i=0;i<groups.length;i++){
    const a=groups[i];
    for(let j=0;j<a.items.length;j++)for(let k=j+1;k<a.items.length;k++)attractPair(a.items[j],a.items[k],w,strength,threeD);
    for(let j=i+1;j<groups.length;j++){
      const b=groups[j];
      const close=Math.abs(shortest(a.ix-b.ix,nx))<=1&&Math.abs(shortest(a.iy-b.iy,ny))<=1&&Math.abs(shortest(a.iz-b.iz,nz))<=1;
      if(close){for(const p of a.items)for(const q of b.items)attractPair(p,q,w,strength,threeD);}
      else attractPair(a,b,w,strength,threeD);
    }
  }
  for(const g of groups)for(const p of g.items){p.ax+=g.ax;p.ay+=g.ay;p.az+=g.az;}
}
function updateCosmos(e,step,threeD=false) {
  const w=e.world,c=e.config,particles=e.particles,centers=threeD?volume.centers(e):gravity.centers(e);
  for(const p of particles){
    p.mass=p.mass||1;p.radius=cosmosRadius(p);p.ax=0;p.ay=0;p.az=0;p.px=p.x;p.py=p.y;p.pz=p.z3;
    for(const center of centers){
      const dx=shortest(center.x-p.x,w.width),dy=shortest(center.y-p.y,w.height),dz=threeD?shortest(center.z3-p.z3,w.depth):0;
      const f=240*c.gravity/centers.length/Math.pow(dx*dx+dy*dy+dz*dz+784,1.5);
      p.ax+=dx*f;p.ay+=dy*f;p.az+=dz*f;
    }
    if(!threeD){const pointer=projectPointer(e,p,.008);p.ax+=pointer.x;p.ay+=pointer.y;}
  }
  if(c.mutualGravity>0)mutualAttraction(e,threeD);
  for(const p of particles){
    p.vx+=p.ax*step;p.vy+=p.ay*step;if(threeD)p.vz+=p.az*step;
    if(threeD)limit3(p,0,4);else limit(p,0,4);
    if(threeD?advance3(p,step,w):advance(p,step,w))p.trail.length=0;
    if(e.tick%3===0)p.trail.push(threeD?[p.x,p.y,p.z3]:[p.x,p.y]);
    if(p.trail.length>c.trail)p.trail.splice(0,p.trail.length-c.trail);
  }
  if(c.collisions!=='off')collideCosmos(e,step,threeD);
}

const gravity = {
  centers(e) {
    const n = e.config.centers;
    const cx = e.world.width / 2, cy = e.world.height / 2, spread = Math.min(115, cx * .3, cy * .3);
    return Array.from({ length: n }, (_, i) => n === 1 ? { x: cx, y: cy } : { x: cx + Math.cos(i / n * TAU - .4) * spread, y: cy + Math.sin(i / n * TAU - .4) * spread });
  },
  create(e) {
    const x = Math.random() * e.world.width, y = Math.random() * e.world.height, a = Math.random() * TAU;
    const r = Math.max(28, Math.hypot(x - e.world.width / 2, y - e.world.height / 2)), v = Math.sqrt(240 * e.config.gravity / r) * e.config.orbit;
    return seed3(e, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, size: 1.8, mass:1, collisionAt:0, z: Math.random(), trail: [], age: 1 });
  },
  update(e, step) {
    updateCosmos(e,step);
  },
  draw(e, ctx) {
    const c = e.config;
    for (const p of e.particles) {
      const alpha = c.depth === 'depth' ? .25 + p.z * .7 : .72;
      if (p.trail.length > 1) {
        ctx.beginPath(); ctx.moveTo(...p.trail[0]); for (let i = 1; i < p.trail.length; i++) ctx.lineTo(...p.trail[i]);
        ctx.strokeStyle = e.palette.particle; ctx.globalAlpha = alpha * .23; ctx.lineWidth = .65; ctx.stroke();
      }
      periodicCopies(p, e.world, cosmosRadius(p)*4, (x, y) => drawCosmicBody(e,ctx,p,x,y,BODY_SCALE_2D,alpha));
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

// Three-dimensional simulation in a periodic volume. Coordinates and velocities
// include z; camera movement changes only the projection, never the simulation.
const delta3 = (a, b, w) => ({x:shortest(b.x-a.x,w.width),y:shortest(b.y-a.y,w.height),z:shortest(b.z3-a.z3,w.depth)});
const norm3 = v => Math.hypot(v.x,v.y,v.z);
function limit3(p,min,max) { const v=Math.hypot(p.vx,p.vy,p.vz)||1, f=clamp(v,min,max)/v;p.vx*=f;p.vy*=f;p.vz*=f; }
function advance3(p,step,w) { const x=p.x+p.vx*step,y=p.y+p.vy*step,z=p.z3+p.vz*step; p.x=wrap(x,w.width);p.y=wrap(y,w.height);p.z3=wrap(z,w.depth);return x<0||x>=w.width||y<0||y>=w.height||z<0||z>=w.depth; }
function seed3(e,p,parent) { p.z3=parent?wrap(parent.z3+(Math.random()-.5)*20,e.world.depth):Math.random()*e.world.depth;p.vz=parent?parent.vz:(Math.random()-.5)*2;return p; }
class Neighborhood3 {
  build(particles,w,radius) {
    this.w=w;this.n=[w.width,w.height,w.depth].map(v=>Math.max(1,Math.floor(v/radius)));this.size=[w.width,w.height,w.depth].map((v,i)=>v/this.n[i]);this.cells=new Map();
    for(const p of particles){const key=this.key(...this.cell(p));if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(p);}
  }
  cell(p){return [p.x,p.y,p.z3].map((v,i)=>Math.floor(v/this.size[i]));}
  key(x,y,z){return (x*this.n[1]+y)*this.n[2]+z;}
  visit(p,fn){const c=this.cell(p),n=this.n;for(let x=0;x<Math.min(3,n[0]);x++)for(let y=0;y<Math.min(3,n[1]);y++)for(let z=0;z<Math.min(3,n[2]);z++){const cell=this.cells.get(this.key(wrap(c[0]-1+x,n[0]),wrap(c[1]-1+y,n[1]),wrap(c[2]-1+z,n[2])));if(cell)for(const q of cell)if(q!==p)fn(q);}}
}
const volume = {
  centers(e) { return gravity.centers(e).map((p,i)=>({...p,z3:e.world.depth/2+(e.config.centers>1?Math.sin(i*TAU/e.config.centers)*80:0)})); },
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
    return {x:e.width/2+u*k,y:e.height/2+yy*k,z:zz,k};
  },
  draw(e,ctx,view) {
    ctx.setTransform(e.dpr*view.zoom,0,0,e.dpr*view.zoom,e.dpr*view.x,e.dpr*view.y);
    const project=p=>this.project(e,p),cosmos=e.scene.model==='gravity';
    const items=[...e.particles.map(p=>({p,type:'particle'})),...e.predators.map(p=>({p,type:'predator'})),...e.fades.map(p=>({p,type:'fade'})),...(cosmos?this.centers(e).map(p=>({p,type:'center'})):[])].map(item=>({...item,screen:project(item.p)})).sort((a,b)=>b.screen.z-a.screen.z);
    for(const {p,type,screen:s} of items){
      const predator=type==='predator',alpha=clamp(.8-s.z/Math.hypot(e.world.width,e.world.height,e.world.depth),.3,1);
      ctx.globalAlpha=alpha*(p.age??1);ctx.fillStyle=predator?e.palette.predator:e.palette.particle;
      if(type==='center'){const radius=40*s.k,g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,radius);g.addColorStop(0,e.palette.center);g.addColorStop(.15,e.palette.glow);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,radius,0,TAU);ctx.fill();continue;}
      if(type==='fade'){ctx.globalAlpha=p.life*.4;ctx.strokeStyle=e.palette.predator;ctx.beginPath();ctx.arc(s.x,s.y,(3+(1-p.life)*8)*s.k,0,TAU);ctx.stroke();continue;}
      if(cosmos||(!predator&&e.config.shape==='dot')){
        if(p.trail?.length>1){ctx.beginPath();p.trail.forEach(([x,y,z3],i)=>{const t=project({x,y,z3});if(i)ctx.lineTo(t.x,t.y);else ctx.moveTo(t.x,t.y);});ctx.strokeStyle=e.palette.particle;ctx.lineWidth=.7;ctx.globalAlpha=alpha*.24;ctx.stroke();ctx.globalAlpha=alpha;}
        if(cosmos)drawCosmicBody(e,ctx,p,s.x,s.y,s.k*BODY_SCALE_3D,alpha);
        else {ctx.beginPath();ctx.arc(s.x,s.y,Math.max(.55,p.size*s.k*BODY_SCALE_3D),0,TAU);ctx.fill();}continue;
      }
      // A small faceted body oriented along its full 3D velocity.
      const speed=Math.hypot(p.vx,p.vy,p.vz)||1,f={x:p.vx/speed,y:p.vy/speed,z:p.vz/speed};
      const r=Math.hypot(f.x,f.z),side=r>.001?{x:-f.z/r,y:0,z:f.x/r}:{x:1,y:0,z:0};
      const up={x:f.y*side.z-f.z*side.y,y:f.z*side.x-f.x*side.z,z:f.x*side.y-f.y*side.x};
      const size=(predator?7:p.size*1.5)*BODY_SCALE_3D;
      const vertex=(a,b,c)=>project({x:p.x+size*(f.x*a+side.x*b+up.x*c),y:p.y+size*(f.y*a+side.y*b+up.y*c),z3:p.z3+size*(f.z*a+side.z*b+up.z*c)});
      if(!predator&&e.config.shape==='line'){const a=vertex(-2,0,0),b=vertex(2,0,0);ctx.strokeStyle=e.palette.particle;ctx.lineWidth=Math.max(.7,s.k*BODY_SCALE_3D);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();continue;}
      const fish=!predator&&e.config.shape==='fish',bird=!predator&&e.config.shape==='bird',vertices=bird?[[2,0,0],[0,.4,0],[-1.6,2,Math.sin(e.time*6+p.phase)*.8],[-.6,0,.3],[-1.6,-2,Math.sin(e.time*6+p.phase)*.8],[0,-.4,0]]:fish?[[2,0,0],[0,.65,0],[0,0,.65],[0,-.65,0],[0,0,-.65],[-1.8,0,0],[-2.6,1,0],[-2.6,-1,0]]:[[2,0,0],[-1,1,0],[-.4,0,.5],[-1,-1,0]];
      const faces=bird?[[0,1,3],[1,2,3],[0,3,5],[3,4,5]]:fish?[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,2,1],[5,3,2],[5,4,3],[5,1,4],[5,6,7]]:[[0,1,2],[0,2,3],[1,3,2]];
      const points=vertices.map(v=>vertex(...v));
      faces.map(face=>({face,z:face.reduce((v,i)=>v+points[i].z,0)/3})).sort((a,b)=>b.z-a.z).forEach(({face},i)=>{ctx.globalAlpha=alpha*(p.age??1)*(.65+i/faces.length*.35);ctx.beginPath();face.forEach((index,j)=>{const q=points[index];if(j)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.fill();});
    }ctx.globalAlpha=1;
  },
};

export const MODELS = Object.freeze({ flock, gravity });

export class EmergenceEngine {
  constructor(canvas, { scene = 'birds', config, color = '#48614c', dark = false } = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: true });
    this.grid3 = new Neighborhood3(); this.camera = {yaw:-.25,pitch:.15};
    this.grid = new Neighborhood(); this.pointer = { active: false, x: 0, y: 0 };
    this.paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.time = 0; this.tick = 0; this.lastFrame = 0; this.accumulator = 0; this.destroyed = false; this.boost = 1;
    this.setPalette(color, dark); this.resize(); this.setScene(scene, config);
    this.onResize = () => this.resize(); this.onVisibility = () => { this.lastFrame = 0; this.accumulator = 0; };
    window.addEventListener('resize', this.onResize); document.addEventListener('visibilitychange', this.onVisibility);
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
  rotateCamera(yaw,pitch) {this.camera.yaw=wrap(this.camera.yaw+yaw,TAU);this.camera.pitch=clamp(this.camera.pitch+pitch,-Math.PI*.47,Math.PI*.47);this.draw();}
  endOrbit() {const d=this.orbitDrag;this.orbitDrag=null;if(d&&this.canvas.hasPointerCapture(d.id))this.canvas.releasePointerCapture(d.id);this.canvas.style.cursor=this.is3D?'grab':'';}
  setPalette(color, dark) {
    this.color = /^#[a-f0-9]{6}$/i.test(color) ? color : '#48614c'; this.dark = dark;
    const rgb = [1, 3, 5].map(i => parseInt(this.color.slice(i, i + 2), 16));
    const mix = (target, amount, alpha = 1) => `rgba(${rgb.map((v, i) => Math.round(v * (1 - amount) + target[i] * amount)).join(',')},${alpha})`;
    this.palette = {
      particle: mix(dark ? [228, 238, 216] : [20, 42, 30], dark ? .72 : .15),
      mass:Array.from({length:17},(_,i)=>mix(dark?[255,241,202]:[20,42,30],dark?.72+i/16*.23:.15+i/16*.6)),
      predator: dark ? '#d6b690' : '#967451',




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
    this.world = { width: box.width / this.scale, height: box.height / this.scale, depth: Math.min(box.width,box.height) / this.scale * .85 };
    // Frame an interior region, rather than fitting the entire periodic box on screen.
    // The viewport fits inside the projected inscribed sphere at every camera angle,
    // so all four edges (including corners) extend into the surrounding 3D space.
    const radius=Math.min(this.world.width,this.world.height,this.world.depth)/2;
    const distance=Math.hypot(this.world.width,this.world.height,this.world.depth)*1.3;
    this.projection3={distance,focal:Math.hypot(box.width,box.height)*Math.sqrt(distance*distance-radius*radius)/(2*radius)*1.08};
    if (previous) {
      for (const p of [...(this.particles || []), ...(this.predators || []), ...(this.fades || [])]) {
        p.x = wrap(p.x / previous.width * this.world.width, this.world.width); p.y = wrap(p.y / previous.height * this.world.height, this.world.height);
        p.z3 = wrap(p.z3 / previous.depth * this.world.depth, this.world.depth);
        if (p.trail) p.trail.length = 0;
      }
    }
    this.pointer.active = false;
    if (this.scene) this.draw();
  }
  setScene(id, config) {
    this.scene = SCENES[id] || SCENES.birds; this.model = MODELS[this.scene.model];
    this.config = sanitize(this.scene.id, config); this.pointer.active = false; this.reset();
    this.canvas.dataset.scene = this.scene.id;
  }
  reset() {
    this.endOrbit(); this.canvas.dataset.dimension=this.is3D?'3d':'2d';
    this.setBoost(false);
    this.time = 0; this.tick = 0; this.accumulator = 0; this.lastFrame = 0; this.captured = 0;
    this.predators = []; this.respawns = []; this.fades = [];
    this.merged=0;this.shattered=0;
    this.birthClock = 0; this.predatorBirthClock = 0; this.born = 0; this.predatorBorn = 0;
    this.particles = Array.from({ length: this.config.count }, (_, i) => this.model.create(this, i));
    this.syncPredators(true); this.draw();
  }
  setConfig(config) {
    const old = this.config, oldCount = old.count, oldReplenish = old.replenish;
    this.config = sanitize(this.scene.id, config);
    if(old.pointer!==this.config.pointer)this.pointer.active=false;
    if(old.depth!==this.config.depth){this.endOrbit();this.setBoost(false);this.pointer.active=false;this.fades=[];for(const p of this.particles){if(p.trail)p.trail=[];}this.canvas.dataset.dimension=this.is3D?'3d':'2d';}
    if (this.config.count !== oldCount) {
      if(this.scene.model==='gravity'){this.reset();return;}
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
    this.syncPredators(old.predators !== this.config.predators); this.draw();
  }
  createPredator(parent) {
    const angle = Math.random() * TAU;
    return seed3(this, { x: parent ? wrap(parent.x + Math.cos(angle) * 20, this.world.width) : Math.random() * this.world.width, y: parent ? wrap(parent.y + Math.sin(angle) * 20, this.world.height) : Math.random() * this.world.height, vx: Math.cos(angle) * .8, vy: Math.sin(angle) * .8, rest: 0, meals: 0 }, parent);
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
          newborn.x = wrap(parent.x + Math.cos(angle) * 15, this.world.width); newborn.y = wrap(parent.y + Math.sin(angle) * 15, this.world.height);
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
  setBoost(active) { this.boost = active && !this.paused && !this.is3D ? 2 : 1; this.lastFrame = 0; this.accumulator = 0; }
  setPaused(value) { this.paused = value; this.setBoost(false); }
  step(dt = 1 / 60) {
    const step = dt * 60; this.time += dt; this.tick++;
    (this.is3D ? volume : this.model).update(this, step);
    for (const fade of this.fades) fade.life -= dt * 2;
    this.fades = this.fades.filter(fade => fade.life > 0);
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
    ctx.setTransform(this.dpr*this.scale*view.zoom,0,0,this.dpr*this.scale*view.zoom,this.dpr*(this.origin.x*view.zoom+view.x),this.dpr*(this.origin.y*view.zoom+view.y));
    if(this.is3D){volume.draw(this,ctx,view);return;}
    this.model.draw(this, ctx);
    for (const fade of this.fades) { ctx.globalAlpha = fade.life * .35; ctx.strokeStyle = this.palette.predator; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(fade.x, fade.y, 3 + (1 - fade.life) * 8, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  drawMagnifier() {
    if(this.config.pointer!=='magnify'||!this.width||!this.height)return;
    const ctx=this.ctx,zoom=2.5,radius=Math.min(150,this.width*.23,this.height*.23);
    const x=clamp(this.pointer.active?this.pointer.x*this.scale+this.origin.x:this.width/2,radius+8,this.width-radius-8);
    const y=clamp(this.pointer.active?this.pointer.y*this.scale+this.origin.y:this.height/2,radius+8,this.height-radius-8);
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
    return { dimension:this.is3D?'3d':'2d', camera:{...this.camera}, scene: this.scene.id, model: this.scene.model, world: { ...this.world }, boundary: 'periodic', count: this.particles.length, target: this.config.count, populationLimit: this.config.populationCap || this.config.count, predators: this.predators.length, predatorLimit: this.config.predatorCap || 0, born: this.born, predatorBorn: this.predatorBorn, birthClock: this.birthClock, predatorBirthClock: this.predatorBirthClock, captured: this.captured, pending: this.respawns.length, time: this.time, paused: this.paused, finite: this.particles.every(p => [p.x, p.y, p.z3, p.vx, p.vy, p.vz].every(Number.isFinite)), particles: this.particles.slice(0, 12).map(p => ({ x: p.x, y: p.y, z: p.z3, vx: p.vx, vy: p.vy, vz:p.vz })) };
  }
  destroy() {
    this.destroyed = true; this.endOrbit(); cancelAnimationFrame(this.raf);
    this.lensCanvas=null;this.lensContext=null;
    this.canvas.removeEventListener('pointerdown',this.orbitDown,true);this.canvas.removeEventListener('lostpointercapture',this.orbitBlur);
    window.removeEventListener('pointermove',this.orbitMove,true);window.removeEventListener('pointerup',this.orbitUp,true);window.removeEventListener('pointercancel',this.orbitUp,true);
    window.removeEventListener('blur',this.orbitBlur);document.removeEventListener('visibilitychange',this.orbitBlur);
    window.removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
