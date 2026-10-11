const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth']){
  console.log(await p.evaluate(depth=>{const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m)};e.setScene('cosmos',{count:24000,depth,influx:'no'});e.reset();e.setPaused(true);while(e.time<1)e.step();check(!e.particles.length,'charging is single point');while(e.time<1.35)e.step();check(e.particles.length===24000&&e.particles.every(q=>q.releaseAt<=e.time),'first blast reveals all dust');check(new Set(e.particles.map(q=>q.x.toFixed(4)+','+q.y.toFixed(4))).size>23000,'first blast not packets');const secondary=e.cosmicBirth.packets.filter(q=>q.secondary).length;check(secondary<40,'few secondary bursts');while(e.time<3)e.step();e.draw();return {depth,count:e.particles.length,secondary};},depth));
  await p.screenshot({path:`checks/emergence/primary-dust-${depth}.png`});
  console.log(await p.evaluate(()=>{const e=__emergence.engine;while(e.time<6.02)e.step();if(e.cosmicBirth||!e.snapshot().finite||Math.abs(e.particles.reduce((s,q)=>s+q.mass,0)-24000)>1e-6)throw Error('birth completion');const start=performance.now();for(let i=0;i<12;i++)e.step();const stepMs=(performance.now()-start)/12;const draw=performance.now();e.draw();return {remaining:e.particles.length,mass:24000,stepMs,drawMs:performance.now()-draw}}));
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
