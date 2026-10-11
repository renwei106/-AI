const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth']){
  console.log(await page.evaluate(depth=>{
   const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(depth+': '+m)},near=(a,b,t=1e-7)=>Math.abs(a-b)<t;
   let random=947;Math.random=()=>{random=(1664525*random+1013904223)>>>0;return random/4294967296};
   const setup=(extra={})=>{e.setScene('cosmos',{depth,count:650,collisions:'off',influx:'no',mutualGravity:.7,blackHoles:'no',edgeWrap:'yes',...extra});e.reset(false);e.setPaused(true);e.camera={yaw:0,pitch:0};};setup();
   const scale=e.is3D?e.projection3.focal/e.projection3.distance:e.scale,unit=Math.min(e.width,e.height)/scale,reach=m=>Math.min(150,e.width*.23,e.height*.23)/scale*(m<1?.16*Math.cbrt(Math.max(.001,m)):Math.min(1,.16+.084*Math.log2(m))),G=.6*(unit/900)**3;
   const center={x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2};
   const body=o=>({...e.model.create(e),...center,mass:1,vx:0,vy:0,vz:0,...o});
   const accel=(mass,d)=>{e.particles=[body({mass}),body({x:center.x+d,mass:.001})];e.step(1e-8);return -e.particles[1].ax};
   const r=reach(100)*.22,a=accel(100,r),b=accel(100,r*2);
   check(near(a/b,4),'inverse square');check(near(a,G*.7*100/r**2),'Newton acceleration');
   check(accel(1,reach(1)*1.2)===0&&accel(100,reach(1)*1.2)>0,'mass-dependent reach');
   check(accel(100,reach(100)*1.01)===0,'outside cutoff no attraction');
   check(accel(100,reach(100)*.999)<accel(100,reach(100)*.98)*.01,'smooth cutoff');
   e.particles=[body({mass:100}),body({x:center.x+r,mass:3})];e.step();check(near(e.particles.reduce((s,p)=>s+p.mass*p.vx,0),0),'momentum symmetry');
   // Bound Newtonian pair in the unmodified inner region.
   const radius=reach(80)*.35,mass=80,v=Math.sqrt(G*.7*(mass+1)/radius);
   const star=body({mass,vy:-v/(mass+1)}),planet=body({x:center.x+radius,vy:v*mass/(mass+1)});e.particles=[star,planet];
   let min=radius,max=radius,angle=0,last=0;
   const steps=Math.ceil(2*Math.PI*radius/v/.3*2.2);
   for(let i=0;i<steps;i++){e.step();const d=Math.hypot(planet.x-star.x,planet.y-star.y),t=Math.atan2(planet.y-star.y,planet.x-star.x);angle+=Math.atan2(Math.sin(t-last),Math.cos(t-last));last=t;min=Math.min(min,d);max=Math.max(max,d)}
   check(angle>4*Math.PI,'completes two orbits');check(min>radius*.96&&max<radius*1.04,'orbit radial error below 4 percent');
   // Isolated flybys: static mass recovers incoming speed; moving mass exchanges energy.
   const flyby=(drift,side)=>{
    const R=reach(100),offset=R*.5,speed=Math.sqrt(G*.7*100/R)*1.5;
    const a=body({mass:100,y:center.y-R*.6,vy:drift}),q=body({mass:.001,x:center.x-R*1.08,y:a.y+side*offset,vx:speed,vy:drift});e.particles=[a,q];
    const initial=Math.hypot(q.vx,q.vy);let peak=initial,minimum=Infinity,entered=false;
    for(let i=0;i<4000;i++){e.step();const d=Math.hypot(q.x-a.x,q.y-a.y);peak=Math.max(peak,Math.hypot(q.vx,q.vy));minimum=Math.min(minimum,d);if(d<R*.9)entered=true;if(entered&&d>R*1.06)return {initial,final:Math.hypot(q.vx,q.vy),peak,minimum}}
    throw Error('flyby did not leave');
   };
   const stationary=flyby(0,-1),gain=flyby(.25,-1),loss=flyby(.25,1);
   check(stationary.peak>stationary.initial*1.1,'accelerates approaching');check(Math.abs(stationary.final-stationary.initial)<.015,'decelerates departing static body');
   check(gain.final>gain.initial+.03&&loss.final<loss.initial-.03,'moving mass gives positive and negative gravity assists');
   // Check the same orbit with actual contact fusion enabled, without scene rebirth.
   setup({collisions:'auto',edgeWrap:'no'});
   const R=reach(128)*.4,M=128,small=32,speed=Math.sqrt(G*.7*(M+small)/R);
   const primary=body({mass:M,vy:-speed*small/(M+small)}),satellite=body({mass:small,x:center.x+R,vy:speed*M/(M+small)});
   // A remote body keeps the 99% scene-rebirth rule out of this pair fixture.
   e.particles=[primary,satellite,body({mass:1,x:5,y:5})];
   let lo=R,hi=R,rotation=0,previous=0;
   for(let i=0;i<Math.ceil(2*Math.PI*R/speed/.3*3);i++){
    e.step();check(e.particles.includes(primary)&&e.particles.includes(satellite),'orbit does not merge at a distance');
    const d=Math.hypot(satellite.x-primary.x,satellite.y-primary.y),angle=Math.atan2(satellite.y-primary.y,satellite.x-primary.x);
    rotation+=Math.atan2(Math.sin(angle-previous),Math.cos(angle-previous));previous=angle;lo=Math.min(lo,d);hi=Math.max(hi,d);
   }
   check(rotation>5.9*Math.PI&&lo>R*.97&&hi<R*1.03,'three stable orbits with collisions enabled');
   return {depth,flyby:{stationary,gain,loss},orbit:{R,lo,hi,rotation},inertiaPreserved:true};
  },depth));
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});









