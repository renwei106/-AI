const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4327');await page.waitForFunction(()=>window.__emergence);
 const report=[];
 for(const depth of ['flat','depth']){
  await page.evaluate(depth=>{let seed=123;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);__emergence.engine.setScene('cosmos',{depth});},depth);
  for(let chunk=1;chunk<=12;chunk++){
   const result=await page.evaluate(chunk=>{
    const e=__emergence.engine,start=performance.now();for(let i=0;i<600;i++)e.step();
    const w=e.world,cells=new Set(e.particles.map(p=>`${Math.floor(p.x/w.width*8)},${Math.floor(p.y/w.height*6)}`));
    const mass=e.particles.reduce((sum,p)=>sum+p.mass,0),core=e.particles.reduce((sum,p)=>sum+(Math.hypot(p.x-w.width/2,p.y-w.height/2)<Math.min(w.width,w.height)*.1?p.mass:0),0);
    return {seconds:chunk*10,count:e.particles.length,mass,maxMass:Math.max(...e.particles.map(p=>p.mass)),coreMassFraction:core/mass,cells:cells.size,merged:e.merged,shattered:e.shattered,deflected:e.deflected,msPerStep:(performance.now()-start)/600,finite:e.snapshot().finite};
   },chunk);
   assert(result.finite);assert(Math.abs(result.mass-650)<1e-7);assert(result.count>=200&&result.count<=1200,'default scene should retain a visible population');assert(result.maxMass<130,'no single body swallows most of the scene');
   assert(result.coreMassFraction<.65&&result.cells>=12,'population must remain spread out, not just an unmerged central dot');
   if([1,3,6,12].includes(chunk)){console.log(depth,result);report.push({depth,...result});}
  }
 }
 fs.writeFileSync('checks/emergence/cosmos-balance-results.json',JSON.stringify(report,null,2));
 console.log('PASS 120 simulated seconds in each dimension: mass, population, largest body, spatial spread');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
