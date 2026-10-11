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
 const light=make(.05,0),host=make(32,1);e.particles=[light,host];__test.mutualAttraction(e,e.is3D);check(light.captureTarget===host,'outer range gently attracts dust');host.x-=.5/u;__test.mutualAttraction(e,e.is3D);check(light.captureTarget===host,'inner capture');
 const a=make(65536,0),q=make(65536,0),other=make(128,20);for(const x of [a,q,other]){x.px=x.x;x.py=x.y;x.pz=x.z3;}
 e.particles=[a,q,other];__test.collideCosmos(e,.001,e.is3D);
 check(e.particles.includes(other),'other systems unchanged');check(e.particles.length===257,'bounded local debris');
 const debris=e.particles.filter(x=>x!==other);check(Math.abs(debris.reduce((s,x)=>s+x.mass,0)-131072)<1e-6,'mass conserved');
 check(Math.abs(debris.reduce((s,x)=>s+x.mass*x.vx,0)-131072*.01)<1e-6,'momentum conserved');
 check(debris.every(x=>Math.hypot(x.x-a.x,x.y-a.y,x.z3-a.z3)*u<.181),'explodes at collision');
 if(depth==='flat')check(debris.every(x=>x.vz===0&&x.z3===a.z3),'planar blast');else check(debris.some(x=>x.vz!==0),'spherical blast');
 for(let i=0;i<6;i++)e.step(1/12);check(e.particles.length===257,'debris escapes before remerging');
}
return 'PASS new thresholds, inner capture, local 2D/3D blast, mass/momentum, unaffected neighbors';}));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
