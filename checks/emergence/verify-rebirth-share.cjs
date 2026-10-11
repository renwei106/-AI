const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth'])console.log(await p.evaluate(depth=>{
  const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(depth+': '+m)},near=(a,b)=>Math.abs(a-b)<1e-7;
  const setup=(extra={})=>{e.setScene('cosmos',{depth,influx:'yes',influxInterval:3,mutualGravity:0,collisions:'auto',...extra});e.reset(false);e.setPaused(true);e.camera={yaw:0,pitch:0};};setup();
  const x=e.world.width/2,y=e.world.height/2,z3=e.world.depth/2;
  const body=(mass,dx=0)=>({...e.model.create(e),mass,x:x+dx,y,z3,vx:.01,vy:0,vz:0,collisionAt:e.time+100,mergeAt:e.time+100});
  let star=body(98.99);e.particles=[star,body(1.01,30)];e.step();check(!e.cosmicBirth,'98.99 percent waits');
  star=body(99);e.particles=[star,body(1,30),{...body(1,-30),incoming:true}];e.step();check(!e.cosmicBirth,'incoming mass counts in denominator');
  star=body(99);const dust=body(1,30);dust.vx=-.1;e.particles=[dust,star];e.followTarget=dust;e.influxClock=3;e.step();
  check(e.cosmicBirth?.recycling&&!e.cosmicBirth.born,'99 percent restarts with particles still separate');
  check(e.particles.length===1&&e.particles[0]===star&&e.followTarget===star,'remainder and follow gather into dominant body');
  check(near(star.mass,100)&&near(star.vx*100,.89),'gather conserves mass and momentum');check(Math.abs(star.x-x)<1,'no teleport to another center');
  check(e.arrived===0&&e.influxClock===0,'threshold checked before scheduled influx');
  for(let i=0;i<60;i++)e.step();check(e.cosmicBirth&&!e.cosmicBirth.born&&e.arrived===0,'condenses without influx');e.draw();
  for(let i=0;i<340;i++)e.step();check(!e.cosmicBirth&&e.particles.length>1,'burst completed');
  check(near(e.particles.reduce((s,q)=>s+q.mass,0),100)&&e.arrived===0,'rebirth retains remainder mass');
  for(let i=0;i<200;i++)e.step();check(e.arrived>0,'influx resumes after cycle');check(near(e.particles.reduce((s,q)=>s+q.mass,0),100+e.incomingMass),'post-cycle supply mass accounted');
  setup({collisions:'off'});e.particles=[body(99),body(1,30)];e.step();check(!e.cosmicBirth,'collisions disabled still prevents recycling');
  setup({blackHoles:'no',influx:'no'});e.particles=[body(99.99),body(.01,30)];e.step();check(e.cosmicBirth?.recycling,'99.99 percent works without requiring black hole switch');
  e.reset(false);e.particles=[body(100)];e.step();check(e.cosmicBirth?.recycling,'legacy single body still cycles');
  e.reset();check(e.time===0&&e.particles.length===0&&!e.cosmicBirth.recycling,'manual reset clears cycle');
  return 'PASS '+depth+' 99% threshold, live mass denominator, remainder conservation, supply pause/resume, follow and switches';
 },depth));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
