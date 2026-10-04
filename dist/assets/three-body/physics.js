/* Exact three-body Newtonian gravity. No particle framework or external runtime. */
(function(root){
 'use strict';
 const initial=[[-.97000436,.24308753,.466203685,.43236573],[.97000436,-.24308753,.466203685,.43236573],[0,0,-.93240737,-.86473146]];
 const defaults=()=>({gravity:1,speed:1,trail:12,bodies:initial.map(([x,y,vx,vy])=>({mass:1,x,y,vx,vy}))});
 const finite=(v,d,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):d;
 function normalize(value){const d=defaults(),s=value&&typeof value==='object'?value:{};return {gravity:finite(s.gravity,d.gravity,.1,3),speed:finite(s.speed,d.speed,.1,3),trail:finite(s.trail,d.trail,0,24),bodies:d.bodies.map((b,i)=>Object.fromEntries(Object.keys(b).map(k=>[k,finite(s.bodies?.[i]?.[k],b[k],k==='mass'?.1:-3,k==='mass'?5:3)])))};}
 function create(config){const c=normalize(config);return {bodies:c.bodies.map(b=>({...b})),time:0,gravity:c.gravity};}
 function forces(b,g){const a=b.map(()=>({x:0,y:0}));for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){const dx=b[j].x-b[i].x,dy=b[j].y-b[i].y,r2=dx*dx+dy*dy+.0001,k=g/(r2*Math.sqrt(r2));a[i].x+=dx*k*b[j].mass;a[i].y+=dy*k*b[j].mass;a[j].x-=dx*k*b[i].mass;a[j].y-=dy*k*b[i].mass;}return a;}
 function step(s,dt){const b=s.bodies,a=forces(b,s.gravity);for(let i=0;i<3;i++){b[i].vx+=a[i].x*dt/2;b[i].vy+=a[i].y*dt/2;b[i].x+=b[i].vx*dt;b[i].y+=b[i].vy*dt;}const next=forces(b,s.gravity);for(let i=0;i<3;i++){b[i].vx+=next[i].x*dt/2;b[i].vy+=next[i].y*dt/2;}s.time+=dt;}
 function advance(s,duration){const requested=Math.min(.1,Math.max(0,duration));let remaining=requested,count=0;while(remaining>1e-10&&count++<1000){let dt=1/720;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){const a=s.bodies[i],b=s.bodies[j],r=Math.hypot(a.x-b.x,a.y-b.y),v=Math.hypot(a.vx-b.vx,a.vy-b.vy);dt=Math.min(dt,.025*Math.sqrt((r*r+.0001)**1.5/(s.gravity*(a.mass+b.mass))),.04*Math.max(.01,r)/Math.max(.01,v));}dt=Math.min(remaining,dt);step(s,dt);remaining-=dt;}return requested-remaining;}
 function invariants(s){let energy=0,px=0,py=0;for(const b of s.bodies){energy+=b.mass*(b.vx*b.vx+b.vy*b.vy)/2;px+=b.mass*b.vx;py+=b.mass*b.vy;}for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){const a=s.bodies[i],b=s.bodies[j];energy-=s.gravity*a.mass*b.mass/Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+.0001);}return {energy,px,py};}
 const api={defaults,normalize,create,advance,invariants};root.ShiyuThreeBodyPhysics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
