const fs=require('fs'),{chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage();
 await p.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\nwindow.__capture={cosmicMetersPerUnit,mutualAttraction,collideCosmos};'}));
 await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 console.log(await p.evaluate(()=>{const e=__emergence.engine,check=(x,m)=>{if(!x)throw Error(m)};e.setPaused(true);
 for(const depth of ['flat','depth']){
  e.setScene('cosmos',{depth,count:100,mutualGravity:.7,collisions:'auto',influx:'no',pointer:'none'});e.reset(false);e.cosmicBirth=null;e.setPaused(true);
  const u=__capture.cosmicMetersPerUnit(e);
  const make=(mass,x,v=0)=>({...e.model.create(e),mass,x:e.world.width/2+x/u,y:e.world.height/2,z3:e.world.depth/2,vx:v/u/9,vy:0,vz:0,ax:0,ay:0,az:0,radius:.01/u,trail:[]});
  for(const mass of [1,3]){
   const dust=make(mass,0,-.2),near=make(32,1.8),far=make(128,-2.2);e.particles=[dust,near,far];
   __capture.mutualAttraction(e,e.is3D);check(dust.captureTarget===near,'nearest eligible host');
   const host=make(32,1.8);e.particles=[dust,host];delete dust.captureTarget;delete dust.captureDistance2;
   for(let i=0;i<12*30&&e.particles.length>1;i++)e.step(1/12);
   check(e.particles.length===1,'light matter absorbed');check(Math.abs(e.particles[0].mass-32-mass)<1e-8,'mass conserved');check(Math.abs(e.particles[0].vx)<1e-8,'host inertia unchanged');
  }
  const dust=make(1,0),fragment=make(3,.2),rock=make(8,.4);e.particles=[dust,fragment,rock];
  __capture.mutualAttraction(e,e.is3D);check(e.particles.every(p=>!p.captureTarget&&p.ax===0&&p.ay===0),'no dust gravity or sub-asteroid capture');
  const a=make(32,0),q=make(128,1);e.particles=[a,q];__capture.mutualAttraction(e,e.is3D);
  check(a.ax>0&&q.ax<0&&Math.abs(a.ax*32+q.ax*128)<1e-8,'massive Newton pair unchanged');
 }
 return 'PASS 2D/3D outer-zone approach and nearest capture, absorption, mass conservation, passive host velocity, massive-body gravity';}));
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
