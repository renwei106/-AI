const fs=require('fs'),{chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const width of [390,2066]){
 const p=await b.newPage({viewport:{width,height:1070}});
 await p.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\nwindow.__units={cosmicSeedSpeed,cosmicLightYearsPerUnit,cosmicViewScale};'}));
 await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 console.log(await p.evaluate(()=>{const e=__emergence.engine,out=[];e.setPaused(true);
 for(const depth of ['flat','depth'])for(const orbit of [.5,1,1.4]){
  e.setScene('cosmos',{depth,count:100,orbit,mutualGravity:0,collisions:'off',influx:'no',pointer:'none'});e.reset(false);e.setPaused(true);
  const u=__units.cosmicLightYearsPerUnit(e),k=__units.cosmicViewScale(e);
  if(Math.abs(e.width/k*u-100)>1e-9)throw Error('distance mapping');
  const q=e.particles[0];Object.assign(q,{x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2,vx:__units.cosmicSeedSpeed(e),vy:0,vz:0});e.particles=[q];
  const x=q.x;for(let i=0;i<48;i++)e.step();const travelled=(q.x-x)*u;
  if(Math.abs(travelled-orbit)>1e-8)throw Error('speed mapping '+travelled);
  out.push({width:e.width,depth,orbit,lightYearsPerSecond:+travelled.toFixed(2)});
 }return out;}));await p.close();
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
