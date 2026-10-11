const fs=require('fs'),{chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
const p=await b.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
for(const depth of ['flat','depth']){
 const result=await p.evaluate(depth=>{
  const e=__emergence.engine;e.setPaused(true);let seed=987;Math.random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  e.setScene('cosmos',{depth,count:2500,collisions:'auto',influx:'yes',pointer:'none'});e.reset(true);e.setPaused(true);
  const snapshots=[],cost=[];let firstMerge=null;
  for(let i=0;i<1440;i++){
   const start=performance.now();e.step();if(i%2===0)e.draw();cost.push(performance.now()-start);
   if(e.merged&&firstMerge===null)firstMerge=e.time/.8;
   if(i%240===239)snapshots.push({seconds:+(e.time/.8).toFixed(1),count:e.particles.length,merged:e.merged,largest:Math.max(...e.particles.map(q=>q.mass)),pending:e.cosmicBirth?.pending?.length-(e.cosmicBirth?.next||0)||0});
  }
  const u=100*(e.is3D?e.projection3.focal/e.projection3.distance:e.scale)/e.width;const speeds=e.particles.map(q=>Math.hypot(q.vx,q.vy,q.vz)*u*9);cost.sort((a,b)=>a-b);return {depth,firstMerge,snapshots,meanSpeed:speeds.reduce((a,b)=>a+b,0)/speeds.length,maxSpeed:Math.max(...speeds),mean:cost.reduce((a,b)=>a+b,0)/cost.length,p95:cost[Math.floor(cost.length*.95)]};
 },depth);console.log(JSON.stringify(result));await p.screenshot({path:'checks/emergence/evolution-'+depth+'.png'});
 if(!result.firstMerge||result.firstMerge>6)throw Error('no early physical merging');
 
 if(result.snapshots.some(q=>q.count>4000))throw Error('population budget');
}
if(errors.length)throw Error(errors.join('\n'));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
