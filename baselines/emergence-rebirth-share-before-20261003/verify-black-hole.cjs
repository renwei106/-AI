const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth'])console.log(await page.evaluate(depth=>{
  const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(depth+': '+m)};
  e.setScene('cosmos',{depth,collisions:'off',influx:'no'});e.reset(false);e.setPaused(true);e.camera={yaw:0,pitch:0};
  const x=e.world.width/2,y=e.world.height/2,z3=e.world.depth/2;
  const body=(mass,dx=0)=>({...e.model.create(e),x:x+dx,y,z3,mass,vx:0,vy:0,vz:0});
  let a=body(89),b=body(11,10);e.particles=[a,b];e.step();check(!a.blackHole,'89 percent does not form');
  a=body(90);b=body(10,10);e.particles=[a,b];e.step();check(a.blackHole&&!b.blackHole,'90 percent forms on the actual dominant body');check(a.blackHoleLevel>0&&a.blackHoleLevel<.05,'gradual transition');
  const unit=Math.min(e.width,e.height)/(e.is3D?e.projection3.focal/e.projection3.distance:e.scale),distance=unit*.4;
  a=body(90);b=body(10,distance);e.particles=[a,b];e.step();check(b.ax===0,'normal range excludes remote particle');
  a.blackHoleLevel=1;e.step();check(b.ax<0,'hole reaches remote particle');check(a.radius<6,'small capture core');
  e.particles.push(body(100,-distance));e.step();check(a.blackHole,'incoming matter does not flicker existing hole');
  e.setConfig({...e.config,blackHoles:'no'});check(!a.blackHole&&a.blackHoleLevel===0,'off clears immediately');e.step();check(b.ax===0,'off restores local range');
  e.setConfig({...e.config,blackHoles:'yes',blackHoleThreshold:80});e.particles=[body(80),body(20,distance)];e.step();check(e.particles[0].blackHole,'configurable 80 percent');
  e.setConfig({...e.config,blackHoleThreshold:90,mutualGravity:0});a=body(90);b=body(10,1);e.particles=[a,b];e.step();check(e.particles.length===2&&b.ax===0,'disabled gravity and collisions respected');
  e.setConfig({...e.config,collisions:'auto'});a=body(90);a.blackHole=true;a.blackHoleLevel=1;a.mergeAt=e.time+100;a.collisionAt=e.time+100;
  b=body(9,1);b.vx=-.1;b.mergeAt=e.time+100;b.collisionAt=e.time+100;const q=body(1,distance);e.particles=[b,a,q];e.followTarget=a;
  e.step();check(e.particles.length===2,'absorption bypasses collision cooldown without debris');const hole=e.particles.find(p=>p.blackHole);
  check(hole.mass===99&&e.particles.reduce((s,p)=>s+p.mass,0)===100,'mass conserved');check(Math.abs(hole.vx*hole.mass+.9)<1e-8,'momentum conserved');check(e.followTarget===hole,'follow transfers to black hole remnant');
  q.x=hole.x+1;q.y=hole.y;q.z3=hole.z3;q.vx=0;q.vy=0;q.vz=0;e.step();check(e.cosmicBirth?.recycling,'final absorption starts existing cycle at remnant');
  check(Math.abs(e.cosmicBirth.center.x-x)<3,'cycle stays near original position');for(let i=0;i<400;i++)e.step();
  check(!e.cosmicBirth&&e.particles.length>1&&Math.abs(e.particles.reduce((s,p)=>s+p.mass,0)-100)<1e-6,'rebirth preserves total mass');check(!e.particles.some(p=>p.blackHole),'new generation clears hole state');
  e.reset();check(e.particles.length===0&&e.cosmicBirth,'restart begins normal charge');
  return 'PASS '+depth+' threshold, range, switches, absorption, follow, mass/momentum and rebirth';
 },depth));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
