const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const results=[];
 for(const source of ['baselines/emergence-spatial-scale-before-20261003/engine.js','dist/assets/emergence/engine.js']){
  const page=await browser.newPage({viewport:{width:1600,height:1000}});
  await page.route('**/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(source,'utf8')}));
  await page.goto('http://127.0.0.1:4327');await page.waitForFunction(()=>window.__emergence);
  results.push(await page.evaluate(()=>{
   const e=__emergence.engine,out={};e.setPaused(true);
   for(const depth of ['flat','depth']){
    e.setScene('cosmos',{depth,count:650,collisions:'off',influx:'no',mutualGravity:.7,blackHoles:'no',pointer:'none',edgeWrap:'no'});e.reset(false);e.setPaused(true);
    const center={x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2};
    const body=o=>({...e.model.create(e),...center,vx:0,vy:0,vz:0,mass:1,...o});
    const scale=e.is3D?e.projection3.focal/e.projection3.distance:e.scale;
    const a=body({mass:128}),b=body({x:center.x+20/scale});e.particles=[a,b];e.step(1e-9);
    const acceleration=-b.ax,symmetry=a.ax*128+b.ax;
    const p=body({vx:.5});e.particles=[p];const x=p.x;for(let i=0;i<60;i++)e.step();
    out[depth]={acceleration,symmetry,drift:p.x-x,velocity:p.vx};
   }
   return out;
  }));await page.close();
 }
 for(const depth of ['flat','depth']){
  const before=results[0][depth],after=results[1][depth];
  assert(Math.abs(after.acceleration/before.acceleration-1/125)<1e-8);
  assert(Math.abs(after.drift/before.drift-.5)<1e-8);
  assert(Math.abs(after.symmetry)<1e-9);assert.equal(after.velocity,.5);
  console.log('PASS',depth,'distance conversion 5x; screen drift 0.5x; inertial velocity and symmetric gravity preserved',after);
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
