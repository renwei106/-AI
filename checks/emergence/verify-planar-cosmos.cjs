const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__emergence);
 console.log(await page.evaluate(()=>{
  const e=__emergence.engine,check=(ok,message)=>{if(!ok)throw Error(message)};
  const planar=label=>{for(const p of [...e.particles,...e.fades,...(e.cosmicBirth?.center?[e.cosmicBirth.center]:[])]){
   check(Math.abs(p.z3-e.world.depth/2)<1e-8,label+' position');
   check(!p.vz&&!p.az,label+' velocity/force');
   if(p.birthTarget){check(p.birthTarget.z3===e.world.depth/2&&!p.birthTarget.vz,label+' target');}
   for(const t of p.trail||[])check(Math.abs(t[2]-e.world.depth/2)<1e-8,label+' trail');
  }};
  const setup=depth=>{e.setScene('cosmos',{depth,pointer:'none',influx:'yes',influxInterval:3,blackHoles:'no'});e.setPaused(true)};
  setup('flat');const newborn=e.model.create(e);check(newborn.z3===e.world.depth/2&&newborn.vz===0,'new 2D body');
  for(let i=0;i<1100;i++){e.step();planar('birth/evolution/influx');}
  check(e.arrived>0,'external dust tested');
  // Flatten both the current coordinates and still-pending birth trajectory.
  setup('depth');for(let i=0;i<140;i++)e.step();check(e.cosmicBirth?.born,'3D expansion underway');
  check(e.particles.some(p=>Math.abs(p.z3-e.world.depth/2)>1),'3D actually has depth');
  const original=e.particles.map(p=>[p.x,p.y,p.vx,p.vy,p.mass]);
  e.setConfig({...e.config,depth:'flat'});planar('paused 3D to 2D');
  check(e.particles.every((p,i)=>[p.x,p.y,p.vx,p.vy,p.mass].every((v,j)=>Math.abs(v-original[i][j])<1e-8)),'preserve XY state and mass');
  for(let i=0;i<400;i++){e.step();planar('remaining expansion');}
  e.resize();planar('resize');
  // Established 3D systems also flatten without restarting their evolution.
  setup('depth');e.reset(false);for(let i=0;i<20;i++)e.step();const time=e.time,count=e.particles.length;
  e.setConfig({...e.config,depth:'flat'});planar('established system');check(e.time===time&&e.particles.length===count,'no reset');
  for(let i=0;i<120;i++)e.step();planar('continued orbit');
  // A violent collision leaves all remnants and fragments in the same plane.
  e.setScene('cosmos',{depth:'flat',pointer:'none',influx:'no',blackHoles:'no',mutualGravity:0});e.reset(false);
  const u=Math.min(e.width,e.height)/e.scale/900,cx=e.world.width/2,cy=e.world.height/2;
  const body=(mass,dx,vx)=>({...e.model.create(e),mass,x:cx+dx*u,y:cy,vx:vx*u,vy:0,collisionAt:0,mergeAt:0});
  e.particles=[body(3,-.6,3),body(7,.6,-3),body(1,100,0)];e.step();check(e.shattered===1,'fragmentation exercised');planar('fragments');
  // 2D rendering must never use the 3D camera, including its magnifier.
  e.setConfig({...e.config,pointer:'magnify'});
  const before=e.particles.map(p=>e.particleScreen(p));e.camera={yaw:2,pitch:1};
  check(e.particles.every((p,i)=>{const s=e.particleScreen(p);return s.x===before[i].x&&s.y===before[i].y}),'2D screen ignores orbit camera');
  let ellipses=0;const ellipse=e.ctx.ellipse.bind(e.ctx);e.ctx.ellipse=(...args)=>{ellipses++;ellipse(...args)};
  e.particles[0].blackHoleLevel=1;e.draw();check(ellipses===0,'2D black hole has planar circular halo');e.ctx.ellipse=ellipse;
  setup('depth');e.reset(false);check(e.particles.some(p=>Math.abs(p.z3-e.world.depth/2)>1&&Math.abs(p.vz)>0),'3D spatial motion retained');
  e.setScene('birds',{depth:'flat'});check(e.particles.some(p=>p.vz!==0),'flock untouched');
  return 'PASS strict XY plane: creation, expansion, paused/live dimension switch, birth targets, trails, external dust, fragments, resize, camera independence and black-hole ring; 3D and flock preserved';
 }));
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exit(1)});

