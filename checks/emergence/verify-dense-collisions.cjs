const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await b.newPage();
 const old=fs.readFileSync('baselines/emergence-dense-gravity-before-20261003/engine.js','utf8');
 const oracle=old.slice(old.indexOf('function collideCosmos('),old.indexOf('function attractPair(')).replace('function collideCosmos(','function collisionOracle(');
 await page.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\n'+oracle+'\nwindow.__collisionTest={collideCosmos,collisionOracle};'}));
 await page.goto('http://127.0.0.1:4327');await page.waitForFunction(()=>window.__emergence);
 console.log(await page.evaluate(()=>{
  const e=__emergence.engine,T=__collisionTest;let trials=0,seed=947;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};Math.random=random;
  for(const depth of ['flat','depth'])for(const bounded of [true,false])for(let run=0;run<12;run++){
   e.setScene('cosmos',{count:100,depth,influx:'no'});e.setPaused(true);e.time=10;e.world.bounded=bounded;
   const w=e.world,particles=Array.from({length:150},(_,i)=>{
    const p=e.model.create(e),x=(random()<.5?0:w.width)+random()*12-6,y=w.height/2+random()*15,z3=w.depth/2+(depth==='depth'?random()*12:0),vx=(random()-.5)*15,vy=(random()-.5)*15,vz=depth==='depth'?(random()-.5)*15:0;
    return {...p,x:x+vx,y:y+vy,z3:z3+vz,px:x,py:y,pz:z3,vx,vy,vz,mass:.3+random()*8,radius:1,collisionAt:i%5===0?11:0,mergeAt:i%7===0?11:0,blackHole:run%3===0&&i===0,blackHoleLevel:0};
   });
   const result=fn=>{e.particles=structuredClone(particles);e.fades=[];e.merged=e.shattered=0;seed=123;fn(e,1,e.is3D);return JSON.stringify({p:e.particles,merged:e.merged,shattered:e.shattered});};
   const a=result(T.collisionOracle),b=result(T.collideCosmos);if(a!==b)throw Error('collision mismatch '+depth+' '+bounded+' '+run);trials++;
  }
  return {trials,exactCollisionParity:true};
 }));
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
