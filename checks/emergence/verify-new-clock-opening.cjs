const fs=require('fs'),{chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage();
await p.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\nwindow.__test={collideCosmos,cosmicMetersPerUnit,mutualAttraction};'}));
await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
console.log(await p.evaluate(()=>{const e=__emergence.engine,check=(v,s)=>{if(!v)throw Error(s)};e.setPaused(true);
for(const depth of ['flat','depth']){
 e.setScene('cosmos',{depth,count:300,pointer:'none',influx:'no'});e.reset(false);e.cosmicBirth=null;e.setPaused(true);
 check(e.config.sourceMass===4096&&e.config.blackHoleMass===65536,'new defaults');
 const u=__test.cosmicMetersPerUnit(e);
 const make=(mass,x)=>({...e.model.create(e),mass,x:e.world.width/2+x/u,y:e.world.height/2,z3:e.world.depth/2,vx:.01,vy:0,vz:0,ax:0,ay:0,az:0,radius:.01/u,trail:[],collisionAt:0});

 for(const speed of [.8,10]){
 e.setScene('cosmos',{depth,count:300,speed,timeScale:10,collisions:'off',mutualGravity:0,pointer:'none',influx:'no'});e.setPaused(true);e.reset(true);
 for(let i=0;i<174;i++)e.step(e.playbackRate/60);
 check(e.particles.length===0&&!e.cosmicBirth.born,'only charging point before three seconds');
 for(let i=0;i<9;i++)e.step(e.playbackRate/60);
 check(e.cosmicBirth.born&&e.particles.length>0,'burst after three seconds');
 check(e.particles.every(p=>p.mass<2),'first emission only dust');
 const release=e.cosmicBirth.startedAt+3,expansionStart=e.time;
 for(let i=0;i<165;i++)e.step(e.playbackRate/60);
 check(Math.abs(e.time-expansionStart-2.75)<.03,'three-second expansion independent of speed');
 for(let i=0;i<90;i++)e.step(e.playbackRate/60);
 check(e.openingExpansionTime===null,'returns smoothly to selected speed');
 const resumed=e.time;for(let i=0;i<60;i++)e.step(e.playbackRate/60);
 check(Math.abs(e.time-resumed-speed*10)<1e-6,'selected speed restored');
 
 while(e.time<release+9)e.step(1/60);
 
 while(e.time<release+15)e.step(1/60);
 check(!e.cosmicBirth&&e.particles.length===300,'smoothly joins full population');
 check(e.particles.some(p=>p.mass>=2),'background fragments appear later');
 check(e.particles.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.vx)),'finite motion');
 }

}
return 'PASS 2D/3D three-second charge at 0.8x/10x, dust first, delayed background, full handoff';}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
