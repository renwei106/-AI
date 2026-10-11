const fs=require('fs'),{chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage();
await p.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\nwindow.__test={collideCosmos,cosmicMetersPerUnit,mutualAttraction,disruptPlanets};'}));
await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
console.log(await p.evaluate(()=>{const e=__emergence.engine,check=(v,s)=>{if(!v)throw Error(s)};e.setPaused(true);
for(const depth of ['flat','depth']){
 e.setScene('cosmos',{depth,count:300,pointer:'none',influx:'no'});e.reset(false);e.cosmicBirth=null;e.setPaused(true);
 check(e.config.sourceMass===4096&&e.config.blackHoleMass===65536,'new defaults');
 const u=__test.cosmicMetersPerUnit(e);
 const make=(mass,x)=>({...e.model.create(e),mass,x:e.world.width/2+x/u,y:e.world.height/2,z3:e.world.depth/2,vx:.01,vy:0,vz:0,ax:0,ay:0,az:0,radius:.01/u,trail:[],collisionAt:0});

 const hole=make(65536,0),planet=make(128,2);hole.blackHoleLevel=1;hole.vx=0;planet.vx=0;planet.vy=Math.sqrt(.0001*65536/2)/u/9;
 e.particles=[hole,planet];__test.disruptPlanets(e,e.is3D);
 const debris=e.particles.filter(p=>p!==hole);check(debris.length===32,'planet torn into stream');
 check(debris.reduce((s,p)=>s+p.mass,0)===128,'mass preserved');check(debris.every(p=>p.vy===planet.vy&&p.vx===planet.vx),'velocity inherited');
 __test.mutualAttraction(e,e.is3D);check(debris.every(p=>!p.captureTarget&&p.ax<0),'debris feels gravity without direct suction');
 for(let i=0;i<60;i++)e.step(1/12);
 check(e.particles.filter(p=>p!==hole).length>4,'orbiting debris persists');
 check(hole.mass===65536,'not immediately swallowed');e.draw();

}
return 'PASS 2D/3D tidal stream, mass and velocity inheritance, five seconds of orbiting debris';}));
await p.screenshot({path:'checks/emergence/tidal-stream.png'}); }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
