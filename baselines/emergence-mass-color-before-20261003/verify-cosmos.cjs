const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4327');await page.waitForFunction(()=>window.__emergence);
 const result=await page.evaluate(()=>{
  const e=__emergence.engine,check=(v,m)=>{if(!v)throw Error(m);},near=(a,b)=>Math.abs(a-b)<1e-8;
  const totals=()=>e.particles.reduce((s,p)=>({mass:s.mass+p.mass,x:s.x+p.mass*p.vx,y:s.y+p.mass*p.vy,z:s.z+p.mass*p.vz}),{mass:0,x:0,y:0,z:0});
  const seed=(depth,config={})=>{e.setScene('cosmos',{depth,centers:0,mutualGravity:0,collisions:'auto',...config});e.setPaused(true);};
  const body=values=>({...e.model.create(e),x:500,y:450,z3:300,vx:0,vy:0,vz:0,...values});
  const reports=[];
  for(const depth of ['flat','depth']){
   seed(depth,{mutualGravity:1,collisions:'off'});e.particles=[body({mass:1}),body({mass:4,x:530})];e.step();check(e.particles[0].vx>0&&e.particles[1].vx<0,'mutual attraction '+depth);check(near(totals().x,0),'equal opposite forces');check(near(e.particles[0].vx,-e.particles[1].vx*4),'mass changes acceleration');
   seed(depth);e.particles=[body({mass:3,x:499,vx:.1}),body({mass:7,x:501,vx:-.1})];const before=totals();e.step();check(e.particles.length===1&&e.merged===1,'slow collision merges');check(near(totals().mass,before.mass)&&near(totals().x,before.x),'merge mass and momentum');check(near(e.particles[0].mass,10),'mass accumulates');
   seed(depth);e.particles=[body({mass:3,x:499,vx:1.5}),body({mass:3,x:501,vx:-1.5})];e.step();check(e.particles.length===3&&e.shattered===1,'fast collision fragments');check(near(totals().mass,6)&&near(totals().x,0)&&near(totals().y,0)&&near(totals().z,0),'fragment conservation');check(e.particles.every(p=>p.collisionAt>e.time),'fragment immunity');e.step();check(e.particles.length===3,'no immediate recollision');
   seed(depth);e.particles=[body({x:498,vx:.8}),body({x:502,y:453,vx:-.8})];e.step(1/30);check(e.particles.length===2&&e.deflected===1,'grazing contact deflects');check(near(totals().x,0)&&near(totals().y,0),'deflection conserves momentum');check(e.particles[0].vy<0&&e.particles[1].vy>0,'grazing bodies separate sideways');
   seed(depth);e.particles=[body({x:499,vx:-.1}),body({x:501,vx:.1})];e.step();check(e.merged===0&&e.deflected===1,'separating contact cannot merge');
   seed(depth);e.particles=[body({mass:2,x:499,vx:.1,mergeAt:10}),body({mass:2,x:501,vx:-.1})];e.step();check(e.merged===0&&e.deflected===1,'merge cooldown bounces rather than swallowing');
   seed(depth,{mergeOverlap:90});e.particles=[body({x:498,vx:.2}),body({x:502,y:1+450,vx:-.2})];for(let i=0;i<4;i++)e.step();check(e.merged===0,'stricter overlap rejects off-axis contact');
   seed(depth,{mergeOverlap:30});e.particles=[body({x:498,vx:.2}),body({x:502,y:1+450,vx:-.2})];for(let i=0;i<4;i++)e.step();check(e.merged===1,'configured overlap allows deeper collision');
   seed(depth,{collisions:'merge'});e.particles=[body({vx:3}),body({x:502,vx:-3})];e.step();check(e.particles.length===1,'merge-only policy');
   seed(depth);e.particles=[body({mass:50,vx:2}),body({mass:50,x:502,vx:-2})];e.step();check(e.merged===0&&e.deflected===1,'fast massive bodies deflect instead of accreting');
   seed(depth,{collisions:'off'});e.particles=[body({}),body({x:501})];e.step();check(e.particles.length===2,'disabled collisions');
   seed(depth);e.particles=[body({x:500,vx:4}),body({x:506,vx:-4})];e.step(1/30);check(e.shattered===1,'swept collision avoids tunneling');
   seed(depth,{collisions:'merge'});e.particles=[body({x:e.world.width-1,vx:.1}),body({x:1,vx:-.1})];e.step();if(depth==='flat'){check(e.particles.length===1,'2d seam collision');check(e.particles[0].x<5||e.particles[0].x>e.world.width-5,'seam barycenter');}else check(e.particles.length===2,'3d opposite faces are not adjacent');
   seed(depth);e.particles=[body({mass:100,vx:.01}),body({mass:1,x:502,vx:-3})];e.step();check(e.merged===0&&e.deflected===1,'fast small impact is deflected');
   seed(depth);e.particles=[body({mass:.2,vx:2}),body({mass:.2,x:501,vx:-2})];e.step();check(e.deflected===1&&near(totals().mass,.4),'tiny fragments deflect without losing mass');
   seed(depth,{count:1200});e.particles=[body({vx:2}),body({x:502,vx:-2}),...Array.from({length:1198},()=>body({x:100,y:100,collisionAt:Infinity}))];e.step();check(e.shattered===0&&e.merged===0&&e.deflected===1&&e.particles.length===1200,'population cap deflects without forced merging');check(near(totals().mass,1200),'cap mass preserved');
   seed(depth,{count:650,mutualGravity:2,fragmentSpeed:.5});const initial=totals().mass,start=performance.now();for(let i=0;i<600;i++)e.step();check(e.snapshot().finite,'long run finite');check(near(totals().mass,initial),'long run conserved');check(e.particles.length<=1200,'bounded population');check(e.particles.every(p=>p.mass>0),'positive mass');
   reports.push({depth,count:e.particles.length,merged:e.merged,shattered:e.shattered,mass:totals().mass,msPerStep:(performance.now()-start)/600});
   const mass=e.particles.map(p=>p.mass);e.setConfig({...e.config,depth:depth==='flat'?'depth':'flat'});check(mass.every((m,i)=>m===e.particles[i].mass),'dimension switch retains mass');e.setConfig({...e.config,count:100});check(e.particles.length===100&&totals().mass===100&&e.merged===0,'explicit count edit resets world');
   seed(depth,{count:650,mutualGravity:1,collisions:'off'});for(const p of e.particles){if(depth==='depth'){p.x=e.world.width*.2+p.x*.6;p.y=e.world.height*.2+p.y*.6;p.z3=e.world.depth*.2+p.z3*.6;}p.vx=0;p.vy=0;p.vz=0;p.mass=.5+Math.random()*3;}e.step();const momentum=totals();check(near(momentum.x,0)&&near(momentum.y,0)&&near(momentum.z,0),'aggregate far-field momentum');
  }
  seed('depth');e.particles=[body({z3:100}),body({z3:160})];e.step();check(e.particles.length===2,'3d depth prevents false collision');
  seed('depth',{mutualGravity:1,collisions:'off'});e.particles=[body({z3:100}),body({z3:160})];e.step();check(e.particles[0].vz>0&&e.particles[1].vz<0,'3d depth gravity');
  seed('flat',{count:1200,mutualGravity:2});const start=performance.now();for(let i=0;i<120;i++)e.step();reports.push({maxPopulationMsPerStep:(performance.now()-start)/120});return reports;
 });
 assert.deepEqual(errors,[]);fs.writeFileSync('checks/emergence/cosmos-physics-results.json',JSON.stringify(result,null,2));console.log('PASS mutual gravity, mass, merge/fragment conservation, cooldown, swept and periodic collisions, 3D, limits, reset',result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
