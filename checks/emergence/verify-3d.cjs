const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4327/');await p.waitForFunction(()=>window.__emergence);
 const results=await p.evaluate(async()=>{
  const e=window.__emergence.engine,{defaultsFor}=await import('./scenes.js'),check=(v,m)=>{if(!v)throw Error(m);},report={};
  for(const id of ['birds','cosmos']){
   e.setScene(id,{...defaultsFor(id),depth:'depth',predators:id==='cosmos'?0:2});
   const p=e.particles[0],before=p.z3;e.step();check(p.z3!==before,id+' z motion');e.setBoost(true);check(e.boost===1,'3d never boosts');
   for(let i=0;i<600;i++)e.step();check(e.snapshot().finite,id+' stable');check(e.particles.every(p=>p.z3>=0&&p.z3<e.world.depth),'periodic depth');report[id]=e.snapshot().count;
   e.setConfig({...e.config,depth:'flat'});check(!e.is3D,'return to 2d');check(e.snapshot().finite,'2d finite after conversion');
  }
  e.setScene('birds',{...defaultsFor('birds'),depth:'depth',predators:1,replenish:'no',breeding:'no'});
  const bird=e.particles[0],h=e.predators[0];e.particles=[bird];Object.assign(bird,{x:500,y:500,z3:100,vx:0,vy:0,vz:0});Object.assign(h,{x:500,y:500,z3:400,vx:0,vy:0,vz:0});e.step();check(e.captured===0,'no capture across depth');
  Object.assign(h,{x:bird.x,y:bird.y,z3:bird.z3});e.step();check(e.captured===1,'3d capture');
  e.setScene('birds',{...defaultsFor('birds'),depth:'depth',predators:0});const parent=e.particles[0];e.particles=[parent];e.breedPopulation(20);check(e.particles.length===4,'3d breeding');check(e.particles.slice(1).every(p=>Math.abs(p.z3-parent.z3)<11||Math.abs(p.z3-parent.z3)>e.world.depth-11),'offspring near parent depth');
  e.setScene('cosmos',{...defaultsFor('cosmos'),depth:'depth'});const star=e.particles[0];e.particles=[star];Object.assign(star,{z3:e.world.depth-.01,vz:3,trail:[]});e.step();check(star.z3>e.world.depth-5&&star.vz<0,'depth edge turns back without teleport');
  e.setScene('birds',{...defaultsFor('birds'),depth:'depth',predators:0});const a=e.particles[0],b=e.particles[1];e.particles=[a,b];Object.assign(a,{x:500,y:500,z3:100,vx:1,vy:0,vz:0});Object.assign(b,{x:500,y:500,z3:400,vx:-1,vy:0,vz:0});e.step();const distant=a.ax;Object.assign(a,{x:500,y:500,z3:100,vx:1,vy:0,vz:0});Object.assign(b,{x:500,y:500,z3:120,vx:-1,vy:0,vz:0});e.step();check(Math.abs(a.ax-distant)>.02,'neighbors use depth');
  return {...report,depthCapture:true,depthBreeding:true,depthBoundary:true,depthNeighbors:true};
 });
 // Use the real prototype controls and pointer capture, including paused orbit.
 await p.locator('button[data-field="depth"][data-value="depth"]').click();await p.locator('#close-panel').click();await p.waitForTimeout(350);
 const initial=await p.evaluate(()=>({camera:{...__emergence.engine.camera},positions:__emergence.engine.particles.map(p=>[p.x,p.y,p.z3]),speed:__emergence.engine.config.speed}));
 await p.mouse.move(850,480);await p.mouse.down();await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>__emergence.engine.boost),1);await p.mouse.move(500,560,{steps:12});await p.mouse.up();
 const after=await p.evaluate(()=>({camera:{...__emergence.engine.camera},positions:__emergence.engine.particles.map(p=>[p.x,p.y,p.z3]),speed:__emergence.engine.config.speed}));assert.notDeepEqual(initial.camera,after.camera);assert.deepEqual(initial.positions,after.positions);assert.equal(initial.speed,after.speed);
 const round=await p.evaluate(()=>{const e=__emergence.engine,old={...e.camera};e.rotateCamera(Math.PI*2,0);return {old,next:e.camera}});assert(Math.abs(round.old.yaw-round.next.yaw)<1e-8);
 await p.mouse.down();await p.mouse.move(750,500);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await p.evaluate(()=>__emergence.engine.orbitDrag),null);await p.mouse.up();
 for(const id of ['birds','cosmos']){
  await p.locator('#open-panel').click();await p.locator(`button[data-scene="${id}"]`).click();await p.locator('button[data-field="depth"][data-value="depth"]').click();await p.locator('#close-panel').click();await p.waitForTimeout(350);
  await p.evaluate(()=>{for(let i=0;i<240;i++)__emergence.engine.step();__emergence.engine.draw();});
  await p.screenshot({path:`checks/emergence/3d-${id}.png`});
 }
 await p.reload();await p.waitForFunction(()=>window.__emergence);assert.equal(await p.evaluate(()=>__emergence.engine.is3D),true);assert.equal(await p.evaluate(()=>__emergence.engine.scene.id),'cosmos');await p.locator('#close-panel').click();
 await p.locator('#open-panel').click();await p.locator('button[data-field="depth"][data-value="flat"]').click();await p.locator('#close-panel').click();await p.waitForTimeout(350);await p.evaluate(()=>__emergence.engine.setPaused(false));await p.mouse.move(850,480);await p.mouse.down();await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>__emergence.engine.boost),2);await p.mouse.up();assert.equal(await p.evaluate(()=>__emergence.engine.boost),1);
 assert.deepEqual(errors,[]);Object.assign(results,{orbitWhilePaused:true,fullTurn:true,dragDoesNotBoost:true,blurCleanup:true,restored2dHold:true});fs.writeFileSync('checks/emergence/3d-results.json',JSON.stringify(results,null,2));console.log(results);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
