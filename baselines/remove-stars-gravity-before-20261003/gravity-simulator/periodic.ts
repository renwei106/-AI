// Local adapter: minimum-image (toroidal) gravity, without altering upstream src.
import {Vector2D} from './src/Vector2D';
import {QuadTree} from './src/quadtree';
import {sweptContactTime} from './src/collisions';

export const periodicDelta=(d:number,span:number)=>d-span*Math.floor(d/span+.5);

export function periodicTree(particles:any[],bounds:any,positions=particles.map(p=>p.position)) {
 const {width:w,height:h}=bounds;
 const bodies=particles.map((p,i)=>({x:periodicDelta(positions[i].x,w),y:periodicDelta(positions[i].y,h),mass:p.mass,radius:p.radius,vx:p.velocity.x,vy:p.velocity.y}));
 const tree:any=QuadTree.build(bodies);
 function sample(x:number,y:number,radius:number,skip:number,G:number,theta:number,range:number,potential=false){
  x=periodicDelta(x,w);y=periodicDelta(y,h);
  let ax=0,ay=0,value=0;
  const add=(dx:number,dy:number,mass:number,r:number)=>{
   const d2=dx*dx+dy*dy;if(d2>range*range)return;
   if(potential){value-=G*mass/Math.max(Math.sqrt(d2),r,1e-9);return;}
   if(!d2)return;const f=G*mass/(Math.max(d2,(r+radius)**2)*Math.sqrt(d2));ax+=dx*f;ay+=dy*f;
  };
  function visit(node:any){
   if(!node.mass)return;
   if(!node.children){for(const i of node.bodies){if(i!==skip){const b=bodies[i];add(periodicDelta(b.x-x,w),periodicDelta(b.y-y,h),b.mass,b.radius);}}return;}
   const dx=periodicDelta(node.comX-x,w),dy=periodicDelta(node.comY-y,h),d2=dx*dx+dy*dy;
   // Never approximate a cell straddling a nearest-image discontinuity.
   const cx=periodicDelta(node.cx-x,w),cy=periodicDelta(node.cy-y,h);
   const coherent=Math.abs(cx)+node.half<w/2&&Math.abs(cy)+node.half<h/2;
   const containsSelf=skip>=0&&Math.abs(bodies[skip].x-node.cx)<=node.half&&Math.abs(bodies[skip].y-node.cy)<=node.half;
   if(coherent&&!containsSelf&&4*node.half**2<theta*theta*d2&&Math.hypot(cx,cy)+Math.SQRT2*node.half<=range){add(dx,dy,node.mass,node.maxRadius);return;}
   for(const child of node.children)visit(child);
  }
  visit(tree.root);return potential?value:new Vector2D(ax,ay);
 }
 tree.accelerationOn=(i:number,G:number,theta=.5)=>sample(bodies[i].x,bodies[i].y,bodies[i].radius,i,G,theta,Infinity);
 tree.accelerationAt=(x:number,y:number,G:number,theta=.5,range=Infinity)=>sample(x,y,0,-1,G,theta,range);
 tree.potentialAt=(x:number,y:number,G:number,theta=.5)=>sample(x,y,0,-1,G,theta,Infinity,true);
 // Also inspect a shifted chart for close encounters straddling either seam.
 const shortest=tree.shortestInteractionTime.bind(tree);
 tree.shortestInteractionTime=(G:number)=>Math.min(shortest(G),QuadTree.build(bodies.map(b=>({...b,x:periodicDelta(b.x+w/2,w),y:periodicDelta(b.y+h/2,h)}))).shortestInteractionTime(G));
 return tree;
}

export function installPeriodicPhysics(physics:any,getBounds:()=>any){
 const theta=()=>physics.forceMode==='exact'||physics.particles.length<128?0:physics.theta;
 physics.computeForces=()=>{
  physics.forcesDirty=false;physics.tree=periodicTree(physics.particles,getBounds());
  for(let i=0;i<physics.particles.length;i++){
   const p=physics.particles[i];p.acceleration=physics.tree.accelerationOn(i,physics.G,theta());p.netForce=p.acceleration.mult(p.mass);
  }
 };
 physics.accelerationsAt=(positions:any[])=>{const tree=periodicTree(physics.particles,getBounds(),positions);return positions.map((_,i)=>tree.accelerationOn(i,physics.G,theta()));};
 physics.updateField=(view:any)=>{const tree=periodicTree(physics.particles,getBounds());physics.vectorField.update(physics.particles,physics.G,view,tree,theta());};
 const resolve=physics.resolveCollisions.bind(physics);
 physics.resolveCollisions=(previous?:any[])=>{
  let events=resolve(previous);
  const ps=physics.particles,{width:w,height:h}=getBounds();
  const tree=QuadTree.build(ps.map((p:any,i:number)=>{
   const a=previous?.[i]||p.position,dx=p.position.x-a.x,dy=p.position.y-a.y;
   return {x:a.x+dx/2,y:a.y+dy/2,mass:p.mass,radius:p.radius+Math.hypot(dx,dy)/2,vx:p.velocity.x,vy:p.velocity.y};
  }));
  const consumed=new Set<number>();
  for(let i=0;i<ps.length;i++){
   if(consumed.has(i))continue;const a=ps[i],start=previous?.[i]||a.position;
   const centre=start.add(a.position).div(2),reach=a.radius+a.position.sub(start).magnitude()/2;
   const candidates:number[]=[];
   for(const sx of [-w,0,w])for(const sy of [-h,0,h])if(sx||sy)tree.withinContact(centre.x+sx,centre.y+sy,reach,candidates);
   for(const j of new Set(candidates)){
    if(j<=i||consumed.has(j))continue;const b=ps[j];
    const dx=periodicDelta(b.position.x-a.position.x,w),dy=periodicDelta(b.position.y-a.position.y,h);
    const shift=new Vector2D(a.position.x+dx-b.position.x,a.position.y+dy-b.position.y);
    if(!shift.x&&!shift.y)continue;
    const original=b.position;b.position=b.position.add(shift);
    const contact=a.radius+b.radius;
    const hit=dx*dx+dy*dy<contact*contact||(previous&&sweptContactTime(a,previous[i],b,previous[j].add(shift))!==null);
    if(!hit){b.position=original;continue;}
    const heavy=a.mass>=b.mass?i:j,light=heavy===i?j:i;
    ps[heavy].absorb(ps[light]);
    const p=ps[heavy];p.position=new Vector2D(periodicDelta(p.position.x,w),periodicDelta(p.position.y,h));
    if(previous)previous[heavy]=p.position.copy();
    consumed.add(light);physics.collisionCount++;events++;
    if(light===i)break;
   }
  }
  for(const i of [...consumed].sort((a,b)=>b-a)){ps.splice(i,1);previous?.splice(i,1);}
  if(consumed.size){physics.tree=null;physics.forcesDirty=true;}
  return events;
 };
}
