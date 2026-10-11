const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth']){
  console.log(await p.evaluate(depth=>{const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m)};e.setScene('cosmos',{count:6000,depth,influx:'no'});e.reset();e.setPaused(true);while(e.time<1)e.step();check(!e.particles.length,'charging is single point');while(e.time<1.35)e.step();check(e.particles.length===6000&&e.particles.every(q=>q.releaseAt<=e.time),'first blast reveals all dust');check(new Set(e.particles.map(q=>q.x.toFixed(4)+','+q.y.toFixed(4))).size>5700,'first blast not packets');const secondary=e.cosmicBirth.packets.filter(q=>q.secondary).length;check(secondary<30,'few secondary bursts');while(e.time<3)e.step();e.draw();return {depth,count:e.particles.length,secondary};},depth));
  await p.screenshot({path:`checks/emergence/primary-dust-${depth}.png`});
  console.log(await p.evaluate(()=>{const e=__emergence.engine;while(e.time<6.02)e.step();if(e.cosmicBirth||!e.snapshot().finite||Math.abs(e.particles.reduce((s,q)=>s+q.mass,0)-6000)>1e-6)throw Error('birth completion');return {remaining:e.particles.length,mass:6000}}));

  console.log(await p.evaluate(()=>{
   const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m)},unit=Math.min(e.width,e.height)/(e.is3D?e.projection3.focal/e.projection3.distance:e.scale)/900;
   check(e.particles.some(q=>Math.hypot(q.vx,q.vy,q.vz)>.1),'inertia retained');
   const make=(mass,x,vx)=>({...e.model.create(e),mass,x,y:e.world.height/2,z3:e.world.depth/2,vx,vy:0,vz:0,trail:[]});
   e.setConfig({...e.config,collisions:'auto',pointer:'none',influx:'no'});e.cosmicBirth=null;
   e.particles=[make(8,e.world.width/2,0),make(1,e.world.width/2+.2*unit,-.1)];e.step();
   check(e.particles.length===1&&e.particles[0].mass===9,'any contact merges small into large');
   e.cosmicBirth=null;e.config.collisions='off';
   e.particles=[make(1,e.world.width/2,0),make(1,e.world.width/2+5*unit,0)];e.step();check(e.particles[0].vx>0&&e.particles[1].vx<0,'nearby dust attracts');
   e.particles=[0.5,2,8,32,128,512,2048].map((m,i)=>make(m,e.world.width*(i+1)/8,0));e.step();
   check(e.particles.every((q,i)=>q.stage===i),'seven mass stages');check(e.particles[6].blackHole,'mass creates black hole');
   return {inertia:true,contactMerge:true,dustGravity:true,sevenStages:true};
  }));
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
