const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4327');await page.waitForFunction(()=>window.__emergence);
 const report=await page.evaluate(()=>{
  const e=__emergence.engine,check=(ok,message)=>{if(!ok)throw Error(message)},reports=[];
  for(const depth of ['flat','depth']){
   e.setScene('cosmos',{depth,trail:10,mutualGravity:0,collisions:'off'});e.setPaused(true);e.camera.yaw=0;e.camera.pitch=0;
   const sample=mass=>({...e.model.create(e),x:e.world.width*.4,y:e.world.height*.5,z3:e.world.depth*.5,vx:.8,vy:0,vz:0,mass});
   e.particles=[.25,1,8,64].map(sample);for(let i=0;i<100;i++)e.step();
   const lengths=e.particles.map(p=>p.trail.length);check(lengths.every((n,i)=>!i||n>lengths[i-1]),'larger masses retain longer histories');
   const record=p=>{
    e.particles=[p];const alphas=[],positions=[],stroke=e.ctx.stroke,line=e.ctx.lineTo;
    e.ctx.lineTo=function(x,y){positions.push({x,alpha:this.globalAlpha});return line.call(this,x,y)};
    e.ctx.stroke=function(...args){alphas.push(this.globalAlpha);return stroke.apply(this,args)};
    try{e.draw()}finally{e.ctx.lineTo=line;e.ctx.stroke=stroke}
    return {alphas,positions,alpha:alphas.at(-1)};
   };
   const particles=e.particles.slice(),light=record(particles[0]),heavy=record(particles[3]);
   check(heavy.alpha>light.alpha&&heavy.alpha<.26,'heavy trails are stronger but remain subtle');
   for(const r of [light,heavy]){
    check(r.alphas.length>0,'trail renders');check(r.alphas[0]<.035,'oldest visible tail is faint');
    check(r.alphas.at(-1)>r.alphas[0]*3,'newest segment is visibly stronger');
    check(r.positions.every((v,i)=>!i||v.x>=r.positions[i-1].x-1e-6),'opacity increases along trajectory toward the body');
   }
   if(depth==='depth'){
    const near=sample(64),far=sample(64);near.z3=e.world.depth*.25;far.z3=e.world.depth*.75;
    for(const p of [near,far])p.trail=Array.from({length:12},(_,i)=>[p.x-36+i*3,p.y,p.z3]);
    check(record(near).alpha>record(far).alpha,'farther 3D trails are dimmer');
   }
   e.config.trail=0;check(record(particles[3]).alphas.length===0,'zero hides existing trails immediately');e.step();check(e.particles[0].trail.length===0,'zero clears stored trail');
   reports.push({depth,lengths,lightAlpha:light.alpha,heavyAlpha:heavy.alpha});
  }
  e.setScene('cosmos',{count:650,trail:24,collisions:'off'});e.setPaused(true);
  for(const p of e.particles)p.mass=64;
  for(let i=0;i<125;i++)e.step();const start=performance.now();for(let i=0;i<20;i++)e.draw();const drawMs=(performance.now()-start)/20;check(drawMs<45,'maximum trail drawing should stay responsive');reports.push({maxTrailDrawMs:drawMs});
  return reports;
 });
 assert.equal(report.length,3);console.log('PASS mass-scaled length/opacity, continuous fade, 3D distance, trail-off, bounded render cost',report);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
