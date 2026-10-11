const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth']){
  console.log(await p.evaluate(depth=>{const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m)};e.setScene('cosmos',{count:6000,depth,influx:'no'});e.reset();e.setPaused(true);while(e.time<1)e.step();check(!e.particles.length,'charging is single point');while(e.time<1.35)e.step();check(e.particles.length===6000&&e.particles.every(q=>q.releaseAt<=e.time),'first blast reveals all dust');check(new Set(e.particles.map(q=>q.x.toFixed(4)+','+q.y.toFixed(4))).size>5700,'first blast not packets');const secondary=e.cosmicBirth.packets.filter(q=>q.secondary).length;check(secondary<30,'few secondary bursts');while(e.time<3)e.step();e.draw();return {depth,count:e.particles.length,secondary};},depth));
  await p.screenshot({path:`checks/emergence/primary-dust-${depth}.png`});
  console.log(await p.evaluate(()=>{const e=__emergence.engine;while(e.time<6.02)e.step();if(e.cosmicBirth||!e.snapshot().finite||Math.abs(e.particles.reduce((s,q)=>s+q.mass,0)-6000)>1e-6)throw Error('birth completion');return {remaining:e.particles.length,mass:6000}}));

  console.log(await p.evaluate(()=>{
   const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m)};
   e.reset();while(e.time<1.5)e.step();const c=e.cosmicBirth.center,packets=e.cosmicBirth.packets;
   const variance=['x','y',...(e.is3D?['z3']:[])].map(k=>packets.reduce((s,q)=>s+(q[k]-c[k])**2,0)/packets.length);
   check(Math.max(...variance)/Math.min(...variance)<1.15,'isotropic circle/sphere');
   while(e.time<6.1)e.step();e.config.influx='yes';e.config.influxInterval=3;e.config.influxBatch=120;
   const count=e.particles.length,mass=e.particles.reduce((s,q)=>s+q.mass,0),arrived=e.arrived;
   for(let i=0;i<180;i++)e.replenishCosmos(1/60);
   check(e.arrived-arrived>=119&&e.arrived-arrived<=120,'continuous configured supply');
   check(e.particles.length-count===e.arrived-arrived,'each arrival accounted');
   check(e.particles.slice(count).every(q=>q.incoming&&q.mass<1),'fine external dust');
   const delta=e.particles.reduce((s,q)=>s+q.mass,0)-mass;check(delta>20,'mass supply');
   e.config.influx='no';const n=e.particles.length;e.replenishCosmos(5);check(e.particles.length===n,'supply switch');
   return {variance,arrivals:e.arrived-arrived,addedMass:delta};
  }));
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
