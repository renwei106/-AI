const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth']){
  console.log(await page.evaluate(depth=>{
   const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(depth+': '+m)},near=(a,b,t=1e-7)=>Math.abs(a-b)<t;
   let random=947;Math.random=()=>{random=(1664525*random+1013904223)>>>0;return random/4294967296};
   const setup=(extra={})=>{e.setScene('cosmos',{depth,collisions:'off',influx:'no',mutualGravity:.7,edgeWrap:'yes',...extra});e.reset(false);e.setPaused(true);e.camera={yaw:0,pitch:0};};setup();
   const unit=Math.min(e.width,e.height)/(e.is3D?e.projection3.focal/e.projection3.distance:e.scale),reach=m=>unit*.024*Math.sqrt(m);
   const center={x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2};
   const body=o=>({...e.model.create(e),...center,mass:1,vx:0,vy:0,vz:0,...o});
   const accel=(mass,d)=>{e.particles=[body({mass}),body({x:center.x+d,mass:.001})];e.step();return -e.particles[1].ax};
   const r=reach(100)*.22,a=accel(100,r),b=accel(100,r*2);
   check(near(a/b,4),'inverse square');check(near(a,.6*.7*100/r**2),'Newton acceleration');
   check(accel(1,reach(1)*1.2)===0&&accel(100,reach(1)*1.2)>0,'mass-dependent reach');
   check(accel(100,reach(100)*1.01)===0,'outside cutoff no attraction');
   check(accel(100,reach(100)*.999)<accel(100,reach(100)*.98)*.01,'smooth cutoff');
   e.particles=[body({mass:100}),body({x:center.x+r,mass:3})];e.step();check(near(e.particles.reduce((s,p)=>s+p.mass*p.vx,0),0),'momentum symmetry');
   // Bound Newtonian pair in the unmodified inner region.
   const radius=reach(80)*.35,mass=80,v=Math.sqrt(.6*.7*(mass+1)/radius);
   const star=body({mass,vy:-v/(mass+1)}),planet=body({x:center.x+radius,vy:v*mass/(mass+1)});e.particles=[star,planet];
   let min=radius,max=radius,angle=0,last=0;
   const steps=Math.ceil(2*Math.PI*radius/v/.45*2.2);
   for(let i=0;i<steps;i++){e.step();const d=Math.hypot(planet.x-star.x,planet.y-star.y),t=Math.atan2(planet.y-star.y,planet.x-star.x);angle+=Math.atan2(Math.sin(t-last),Math.cos(t-last));last=t;min=Math.min(min,d);max=Math.max(max,d)}
   check(angle>4*Math.PI,'completes two orbits');check(min>radius*.96&&max<radius*1.04,'orbit radial error below 4 percent');
   // Isolated flybys: static mass recovers incoming speed; moving mass exchanges energy.
   const flyby=(drift,side)=>{
    const R=reach(100),offset=R*.5,speed=Math.sqrt(.6*.7*100/R)*1.5;
    const a=body({mass:100,y:center.y-R*.6,vy:drift}),q=body({mass:.001,x:center.x-R*1.08,y:a.y+side*offset,vx:speed,vy:drift});e.particles=[a,q];
    const initial=Math.hypot(q.vx,q.vy);let peak=initial,minimum=Infinity,entered=false;
    for(let i=0;i<4000;i++){e.step();const d=Math.hypot(q.x-a.x,q.y-a.y);peak=Math.max(peak,Math.hypot(q.vx,q.vy));minimum=Math.min(minimum,d);if(d<R*.9)entered=true;if(entered&&d>R*1.06)return {initial,final:Math.hypot(q.vx,q.vy),peak,minimum}}
    throw Error('flyby did not leave');
   };
   const stationary=flyby(0,-1),gain=flyby(.25,-1),loss=flyby(.25,1);
   check(stationary.peak>stationary.initial*1.1,'accelerates approaching');check(Math.abs(stationary.final-stationary.initial)<.015,'decelerates departing static body');
   check(gain.final>gain.initial+.03&&loss.final<loss.initial-.03,'moving mass gives positive and negative gravity assists');
   setup({collisions: 'auto',edgeWrap:'no'});e.reset();for(let i=0;i<1800;i++)e.step();const total=e.particles.reduce((s,p)=>s+p.mass,0),heavy=e.particles.filter(p=>p.mass>30);
   check(near(total,650,1e-5)&&e.snapshot().finite,'default evolution finite and conserves mass');check(heavy.length>=2,'multiple local systems survive');
   return {depth,range1:reach(1),range100:reach(100),orbit:{min,max,radius},stationary,gain,loss,after30s:{count:e.particles.length,heavy:heavy.map(p=>p.mass)}};
  },depth));
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});







