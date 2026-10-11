const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await b.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
 await page.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('prototypes/emergence/engine.js','utf8')+'\nwindow.__cosmicTest={cosmicReach,cosmicViewScale,cosmicPointer,mutualAttraction,attractPair,cosmicG,cosmicUnit,collideCosmos};'}));
 await page.goto('http://127.0.0.1:4327');await page.waitForFunction(()=>window.__emergence);
 for(const depth of ['flat','depth']) console.log(await page.evaluate(depth=>{
  const e=__emergence.engine,T=__cosmicTest,check=(ok,msg)=>{if(!ok)throw Error(depth+': '+msg)};
  let seed=947;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
  e.setScene('cosmos',{depth,count:6000,influx:'no',blackHoles:'no',pointer:'none'});e.setPaused(true);
  const scale=T.cosmicViewScale(e),lens=Math.min(150,e.width*.23,e.height*.23);
  for(let n=0;n<10;n++)check(Math.abs(T.cosmicReach(e,2**n)*scale-lens*(n+1)/10)<1e-8,'equal mass bands');
  check(T.cosmicReach(e,.25)<T.cosmicReach(e,.5)&&T.cosmicReach(e,.5)<T.cosmicReach(e,1),'fine dust has smaller reach');
  check(T.cosmicReach(e,1e9)*scale===lens,'ordinary cap');check(Math.abs(T.cosmicReach(e,1e9,1)*scale-lens*1.5)<1e-8,'black hole cap');
  // Exact all-pairs force oracle, including wrapped edges and unequal reaches.
  e.reset(false);e.particles=e.particles.slice(0,90);e.particles.forEach((p,i)=>{p.mass=2**(i%10);p.radius=.5;p.ax=p.ay=p.az=0;p.x=i%3===0?e.world.width-2:p.x;p.blackHoleLevel=i===0?1:0});
  for(const bounded of [true,false]){
   e.world.bounded=bounded;for(const p of e.particles)p.ax=p.ay=p.az=0;
   const oracle=e.particles.map(p=>({...p}));T.mutualAttraction(e,e.is3D);
   for(let i=0;i<oracle.length;i++)for(let j=i+1;j<oracle.length;j++)T.attractPair(oracle[i],oracle[j],e.world,T.cosmicG(e)*e.config.mutualGravity,e.is3D,Math.max(T.cosmicReach(e,oracle[i].mass,oracle[i].blackHoleLevel),T.cosmicReach(e,oracle[j].mass,oracle[j].blackHoleLevel)),3.6*T.cosmicUnit(e));
   check(e.particles.every((p,i)=>['ax','ay','az'].every(k=>Math.abs(p[k]-oracle[i][k])<1e-8)),'spatial grid equals pair oracle');
  }
  // Cursor acceleration follows screen axes even with rotated 3D cameras.
  e.pointer={active:true,x:(e.width/2-e.origin.x)/e.scale,y:(e.height/2-e.origin.y)/e.scale};
  for(const pointer of ['attract','repel'])for(const yaw of [0,.8]){
   e.camera={yaw,pitch:.4};e.config.pointer=pointer;
   const p={...e.model.create(e),x:e.world.width/2+10,y:e.world.height/2,z3:e.world.depth/2,ax:0,ay:0,az:0};
   T.cosmicPointer(e,p,e.is3D);const screenAx=e.is3D?Math.cos(yaw)*p.ax+Math.sin(yaw)*p.az:p.ax;
   check(pointer==='attract'?screenAx<0:screenAx>0,'cursor '+pointer+' sign');
  }
  e.config.pointer='none';e.pointer.active=false;
  const reports=[];
  for(const count of [6000,12000]){
   e.setScene('cosmos',{depth,count,influx:'no',blackHoles:'no',pointer:'none'});e.reset();e.setPaused(true);
   while(e.time<6.01)e.step();const started=e.particles.length;
   const start=performance.now();for(let i=0;i<120;i++)e.step();const stepMs=(performance.now()-start)/120;
   const draw=performance.now();for(let i=0;i<6;i++)e.draw();const drawMs=(performance.now()-draw)/6;
   check(e.snapshot().finite,'finite dense simulation');check(Math.abs(e.particles.reduce((s,p)=>s+p.mass,0)-count)<1e-5,'mass conserved');check(e.particles.length>count*.8,'retains dust');
   reports.push({count,started,remaining:e.particles.length,stepMs,drawMs});
  }
  return {depth,reports};
 },depth));
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
