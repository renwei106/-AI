const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
const p=await b.newPage();await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
for(const depth of ['flat','depth'])console.log(await p.evaluate(depth=>{
 const e=__emergence.engine;e.setPaused(true);e.setScene('cosmos',{depth,count:100,collisions:'off',mutualGravity:0,influx:'no',edgeWrap:'yes'});e.reset(true);e.setPaused(true);
 let q,previous,minRatio=1,early,late;
 for(let i=0;i<1800;i++){
  e.step();q=q||e.particles.find(p=>p.burstFloor!==undefined);if(!q)continue;
  // Keep the probe clear of boundaries to isolate the launch/slowdown behavior.
  q.x=e.world.width/2;q.y=e.world.height/2;q.z3=e.world.depth/2;
  const speed=Math.hypot(q.vx,q.vy,q.vz);
  if(previous)minRatio=Math.min(minRatio,speed/previous);previous=speed;
  if(i===180)early=speed;if(i===1799)late=speed;
 }
 if(minRatio<.98||!(late>0&&late<early))throw Error('discontinuous opening velocity');
 if(e.particles.length!==100||!e.particles.some(p=>p.revealAt!==undefined))throw Error('background seeds missing');
 e.config.influx='yes';e.cosmicEdgeReached=true;e.particles=e.particles.slice(0,50);
 for(let i=0;i<240;i++)e.step();
 if(!e.arrived||!e.particles.some(p=>p.revealAt>25))throw Error('ongoing background supply missing');
 return {depth,minStepSpeedRatio:minRatio,early,late,arrived:e.arrived};
},depth));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
