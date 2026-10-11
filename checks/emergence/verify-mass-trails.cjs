const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4327',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__emergence);
 const report=await page.evaluate(()=>{
  const e=__emergence.engine,check=(ok,message)=>{if(!ok)throw Error(message)},reports=[];
  const record=p=>{
   e.particles=[p];const alphas=[],positions=[],stroke=e.ctx.stroke,line=e.ctx.lineTo;
   e.ctx.lineTo=function(x,y){positions.push({x,alpha:this.globalAlpha});return line.call(this,x,y)};
   e.ctx.stroke=function(...args){alphas.push(this.globalAlpha);return stroke.apply(this,args)};
   try{e.draw()}finally{e.ctx.lineTo=line;e.ctx.stroke=stroke}
   return {alphas,positions,alpha:alphas.at(-1)};
  };
  for(const depth of ['flat','depth']){
   const setup=(speed=.8)=>{e.setScene('cosmos',{depth,trail:10,speed,blackHoles:'no',mutualGravity:0,collisions:'off',influx:'no'});e.reset(false);e.setPaused(true);e.camera.yaw=0;e.camera.pitch=0};
   setup();
   const sample=(mass,vx=.8)=>({...e.model.create(e),x:e.world.width*.45,y:e.world.height*.5,z3:e.world.depth*.5,vx,vy:0,vz:0,mass});
   e.particles=[sample(.25),sample(64),sample(1,.4),sample(1,1.2)];for(let i=0;i<100;i++)e.step();
   const particles=e.particles.slice(),light=record(particles[0]),heavy=record(particles[1]);
   check(JSON.stringify(light)===JSON.stringify(heavy),'mass cannot affect trail geometry or opacity');
   const extent=p=>p.x-p.trail[0][0],slow=extent(particles[2]),fast=extent(particles[3]);
   check(Math.abs(fast/slow-3)<1e-6,'triple velocity leaves triple distance over same time');
   for(const p of particles){check(e.trailTime-p.trail[0][3]>=.25-1e-8&&e.trailTime-p.trail[1][3]<=.25+1e-8,'timestamp window brackets 0.25 seconds');}
   for(const r of [light,heavy]){
    check(r.alphas.length>0,'trail renders');check(r.alphas[0]<.035,'oldest tail is faint');
    check(r.alphas.at(-1)>r.alphas[0]*3,'fresh segment stronger');
    check(r.positions.every((v,i)=>!i||v.x>=r.positions[i-1].x-1e-6),'time fade follows trajectory');
   }
   if(depth==='depth'){
    const near=sample(64),far=sample(64);near.z3=e.world.depth*.25;far.z3=e.world.depth*.75;
    for(const p of [near,far])p.trail=Array.from({length:12},(_,i)=>[p.x-36+i*3,p.y,p.z3,e.trailTime-.25+i*.25/12]);
    check(record(near).alpha>record(far).alpha,'depth dimming is preserved');
   }
   const extents=[];
   for(const speed of [1,2]){setup(speed);e.particles=[sample(1)];for(let i=0;i<120;i++)e.step();extents.push(extent(e.particles[0]));}
   check(extents[1]/extents[0]>1.75&&extents[1]/extents[0]<2.25,'playback speed stretches the same real-time window');
   const stopped=e.particles[0];stopped.vx=0;for(let i=0;i<80;i++)e.step();check(record(stopped).alphas.length===0,'stopped motion loses old trail');
   e.config.trail=0;check(record(stopped).alphas.length===0,'zero hides immediately');e.step();check(stopped.trail.length===0,'zero clears storage');
   reports.push({depth,slow,fast,lightAlpha:light.alpha,heavyAlpha:heavy.alpha,playbackExtents:extents});
  }
  e.setScene('cosmos',{count:650,trail:24,collisions:'off',influx:'no'});e.setPaused(true);for(let i=0;i<420;i++)e.step();
  check(e.particles.every(p=>p.trail.length<=40),'history bounded by time-based sampling');
  const start=performance.now();for(let i=0;i<20;i++)e.draw();const drawMs=(performance.now()-start)/20;check(drawMs<45,'drawing stays responsive');reports.push({maxTrailDrawMs:drawMs});
  return reports;
 });
 const before=await page.evaluate(()=>__emergence.engine.trailTime);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__emergence.engine.trailTime),before);
 console.log('PASS time-window trails, mass independence, velocity/playback scaling, age fade, stationary decay, pause, 3D depth and render budget',report);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
