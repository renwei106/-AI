const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const width of [390,2066]){
 const p=await b.newPage({viewport:{width,height:1070}});await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 console.log(await p.evaluate(()=>{
  const e=__emergence.engine,results=[];e.setPaused(true);
  for(const depth of ['flat','depth']){
   e.setScene('cosmos',{depth,count:100,collisions:'off',influx:'no',mutualGravity:0,pointer:'none',orbit:1,speed:.8});e.reset(false);e.setPaused(true);
   const k=e.is3D?e.projection3.focal/e.projection3.distance:e.scale;
   // Birth packets and incoming particles use this same initial speed calibration.
   e.reset(true);e.time=e.cosmicBirth.startedAt+1.21;e.advanceCosmicBirth(0);
   const times=e.cosmicBirth.packets.map(q=>e.width/(Math.hypot(q.vx,q.vy,q.vz)*k*60*.15*.8));
   const min=Math.min(...times),max=Math.max(...times);
   if(min<16.66||max>25.01)throw Error('crossing time outside calibrated range '+depth+': '+min+' '+max);
   e.cosmicBirth=null;const q=e.model.create(e),v=e.width/k/(20*60*.15*.8);
   Object.assign(q,{x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2,vx:v,vy:0,vz:0,incoming:true});e.particles=[q];
   // Short free flight, away from boundaries: one second must cover 1/20 screen.
   const start=q.x;for(let i=0;i<48;i++)e.step();
   const pixels=(q.x-start)*k;if(Math.abs(pixels-e.width/20)>1e-5)throw Error('drift calibration '+pixels);
   results.push({width:e.width,depth,min,max,pixelsPerSecond:pixels});
  }return results;
 }));await p.close();
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
