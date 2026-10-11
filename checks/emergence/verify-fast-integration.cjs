const fs=require('fs'),{chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
for(const width of [390,2066]){
 const p=await b.newPage({viewport:{width,height:1070}});
 await p.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\nwindow.__units={cosmicSeedSpeed,cosmicMetersPerUnit,cosmicReach,collideCosmos,attractPair,cosmicG};'}));
 await p.goto('http://127.0.0.1:4327');await p.waitForFunction(()=>window.__emergence);
 console.log(await p.evaluate(()=>{const e=__emergence.engine,out=[];e.setPaused(true);
 const check=(ok,m)=>{if(!ok)throw Error(m)},near=(a,b)=>Math.abs(a-b)<1e-8;
 for(const depth of ['flat','depth']){
  e.setScene('cosmos',{depth,count:100,mutualGravity:.7,collisions:'auto',influx:'no',pointer:'none'});e.reset(false);e.setPaused(true);
  const u=__units.cosmicMetersPerUnit(e),v=__units.cosmicSeedSpeed(e);check(near(v*u*9,.15),'seed units');
  const make=(mass,speed)=>({...e.model.create(e),mass,x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2,vx:speed/u/9,vy:0,vz:0,ax:0,ay:0,az:0,radius:.01/u,trail:[]});
  const a=make(128,0),q=make(1,0);q.x+=2/u;
  __units.attractPair(a,q,e.world,__units.cosmicG(e)*.7,e.is3D,8/u,.216/u);
  check(near(-q.ax*u*81,.0001*128/4),'Newton m/s2');check(near(a.ax*128+q.ax,0),'equal opposite momentum');
  check(near(__units.cosmicReach(e,1)*u,.8),'meter reach');
  for(const [m,n,va,vb] of [[100,1,.1,-1],[100,1,.1,1],[128,129,.2,-.3]]){
   const a=make(m,va),q=make(n,vb);for(const x of [a,q]){x.px=x.x;x.py=x.y;x.pz=x.z3;}
   e.particles=[a,q];__units.collideCosmos(e,.001,e.is3D);
   check(e.particles.length===1,'contact merge');const merged=e.particles[0];
   check(near(merged.mass,m+n)&&near(merged.vx*u*9,(m*va+n*vb)/(m+n)),'mass and momentum');
  }
  e.particles=[make(2000,0)];e.cosmicBirth=null;e.step();check(!e.cosmicBirth,'no forced terminal restart');
  const radius=.5,orbital=Math.sqrt(.0001*129/radius),star=make(128,0),satellite=make(1,0);
  satellite.x+=radius/u;star.vy=-orbital/129/u/9;satellite.vy=orbital*128/129/u/9;e.particles=[star,satellite];
  let lo=radius,hi=radius;
  for(let i=0;i<Math.ceil(2*Math.PI*radius/orbital*2*12);i++){
    e.step(1/12);const d=Math.hypot(star.x-satellite.x,star.y-satellite.y,star.z3-satellite.z3)*u;lo=Math.min(lo,d);hi=Math.max(hi,d);
  }
  check(e.particles.length===2&&lo>radius*.99&&hi<radius*1.01,'Newton orbit remains stable without scripted path');
  out.push({width:e.width,depth,baselineMetersPerSecond:.15,accelerationMetersPerSecondSquared:-q.ax*u*81});
 }return out;}));await p.close();
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
