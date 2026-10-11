const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1600,height:1000}});await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth'])for(const speed of [1,3,10]){
  await p.evaluate(({depth,speed})=>{const e=__emergence.engine;e.setPaused(true);let s=123;Math.random=()=>((s=(1664525*s+1013904223)>>>0)/4294967296);e.setScene('cosmos',{depth,speed,timeScale:10,pointer:'none'});e.reset(false);while(e.cosmicBirth)e.step(1/60);window.__simStart=e.time;e.setPaused(false);window.__start=performance.now()},{depth,speed});
  await p.waitForTimeout(3000);
  console.log(await p.evaluate(()=>{const e=__emergence.engine;e.setPaused(true);const wall=(performance.now()-__start)/1000;return {speed:e.config.speed,depth:e.config.depth,wall,simulationSeconds:e.time-__simStart,actualMultiplier:(e.time-__simStart)/wall,count:e.particles.length,merged:e.merged,maxMass:Math.max(...e.particles.map(p=>p.mass))}}));
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
