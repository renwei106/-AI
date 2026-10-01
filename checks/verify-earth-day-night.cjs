process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'earth-day-night');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page,shaderErrors=[];
 p.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|Shader/i.test(m.text()))shaderErrors.push(m.text())});
 await f.context.route('**/earth-theme.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(__dirname,'../dist/earth-theme.js'),'utf8')+'\nwindow.__earthTest=()=>state;'}));
 await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
 await p.clock.setFixedTime(new Date('2026-03-20T00:00:00Z'));
 await p.evaluate(()=>{prefs.theme='globe';prefs.mode='dark';prefs.color='#237c76';render()});
 await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible);
 await p.waitForFunction(()=>window.__earthTest().earth.nightLightsReady.value===1);
 await p.evaluate(()=>{const s=window.__earthTest();s.controls.autoRotate=false;s.camera.position.set(0,0,6.45);s.controls.update()});
 const coords=await p.evaluate(async()=>{const {solarDirection}=await import('/earth-source.js');return ['2026-03-20T12:00:00Z','2026-06-21T12:00:00Z','2026-12-21T12:00:00Z','2028-02-29T12:00:00Z'].map(date=>({date,vector:solarDirection(new Date(date)).toArray()}))});
 assert(Math.abs(coords[0].vector[1])<.025,'equinox close to equator');
 assert(coords[1].vector[1]>.39&&coords[1].vector[1]<.41,'June Sun above northern tropic');
 assert(coords[2].vector[1]<-.39&&coords[2].vector[1]>-.41,'December Sun above southern tropic');
 for(const c of coords)assert(Math.abs(Math.hypot(...c.vector)-1)<1e-10);
 const r=await p.locator('#earth-theme-canvas').boundingBox(),luminance=[];
 for(const hour of [0,6,12,18]){
  await p.clock.setFixedTime(new Date(`2026-03-20T${String(hour).padStart(2,'0')}:00:00Z`));await p.waitForTimeout(160);
  const state=await p.evaluate(()=>{const s=window.__earthTest();return {sun:s.sun.position.toArray(),parent:s.sun.parent===s.scene,lights:s.scene.children.filter(c=>c.isDirectionalLight).length,atmosphere:s.earth.atmosphere.material.uniforms.sunDirection.value.toArray()}});
  assert(state.parent&&state.lights===1,'one Sun independent of camera');
  for(let i=0;i<3;i++)assert(Math.abs(state.sun[i]/100-state.atmosphere[i])<1e-10);
  const image=await p.screenshot({path:path.join(out,`${hour}-utc.png`)});
  const crop=await sharp(image).extract({left:Math.round(r.x+r.width/2-45),top:Math.round(r.y+r.height/2-45),width:90,height:90}).toBuffer();const stats=await sharp(crop).stats();
  luminance.push({hour,value:stats.channels.slice(0,3).reduce((sum,c)=>sum+c.mean,0)/3,sun:state.sun});
  if(hour===0||hour===12){
   // Paris lies well inside the day/night hemisphere at these UTC times.
   const point=await p.evaluate(()=>{const s=window.__earthTest(),lat=48.86*Math.PI/180,lon=2.35*Math.PI/180,v=s.camera.position.clone().set(Math.sin(lon)*Math.cos(lat),Math.sin(lat),Math.cos(lon)*Math.cos(lat)).multiplyScalar(s.earth.radius).project(s.camera),r=s.canvas.getBoundingClientRect();return {x:r.x+(v.x+1)/2*r.width,y:r.y+(1-v.y)/2*r.height}});
   const area={left:Math.round(point.x)-15,top:Math.round(point.y)-15,width:30,height:30};
   const on=await sharp(image).extract(area).removeAlpha().raw().toBuffer();
   await p.evaluate(()=>{window.__earthTest().earth.nightLightsReady.value=0});await p.waitForTimeout(100);
   const off=await sharp(await p.screenshot()).extract(area).removeAlpha().raw().toBuffer();
   const change=on.reduce((total,value,i)=>total+Math.abs(value-off[i]),0)/on.length;
   assert(hour===0?change>1:change<.1,`city lights appear only at night: ${hour} UTC, delta ${change}`);
   await p.evaluate(()=>{window.__earthTest().earth.nightLightsReady.value=1});
  }
 }
 assert(luminance[2].value>luminance[0].value*2,'same ground is bright at noon and dark at midnight');
 assert(luminance[0].value>15&&luminance[0].value<80,'night ocean remains readable, not black');
 assert(luminance[1].sun[0]>99&&luminance[3].sun[0]<-99,'Sun moves east to west in Earth coordinates');
 const before=await p.evaluate(()=>window.__earthTest().sun.position.toArray());
 await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(r.x+r.width/2+250,r.y+r.height/2+30,{steps:10});await p.mouse.up();
 assert.deepEqual(await p.evaluate(()=>window.__earthTest().sun.position.toArray()),before,'dragging does not move Sun');
 await p.evaluate(()=>{window.__earthTest().controls.autoRotate=true});
 const angle=await p.evaluate(()=>window.__earthTest().controls.getAzimuthalAngle());
 await p.waitForFunction(angle=>Math.abs(window.__earthTest().controls.getAzimuthalAngle()-angle)>.005,angle);
 await p.clock.setFixedTime(new Date());await p.waitForTimeout(160);await p.screenshot({path:path.join(out,'current-time.png')});
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>render());await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible);
 assert.equal(await p.evaluate(()=>window.__earthTest().earth.mesh.material.map.image.width),4096);
 await p.screenshot({path:path.join(out,'mobile.png')});
 assert.deepEqual(f.errors,[]);assert.deepEqual(shaderErrors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({coords,luminance},null,2));await f.context.close();
 console.log('PASS UTC daylight/night, seasonal declination, leap year, camera-independent Sun, atmosphere, auto rotation and mobile');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
