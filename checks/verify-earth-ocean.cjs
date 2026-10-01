/* Mock private APIs; inspect the real WebGL scene in the local preview. */
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'earth-ocean');
async function verifyWaterBoundaries(){
 for(const width of [8192,4096]){
  const {data,info}=await sharp(path.join(root,`dist/assets/site-icons/earth-water-mask-${width}.png`)).raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,width);assert.equal(info.height,width/2);
  for(const [name,lon,lat,water] of [['Black Sea',34,43,true],['Hormuz',56.5,26.6,true],['Persian Gulf',52,26,true],['Red Sea',38,20,true],['Mediterranean',18,35,true],['Caspian',51,41,true],['Turkey',33,39,false],['Iran',54,32,false],['Arabia',45,23,false]]){
   const x=Math.floor((lon+180)/360*width),y=Math.floor((90-lat)/180*info.height);
   assert.equal(data[(y*width+x)*info.channels],water?255:0,`${width}: ${name} geographic classification`);
  }
 }
}
const inspect=p=>p.evaluate(()=>{const s=window.__earthTest(),t=s.earth.mesh.material.map;return {texture:[t.image.naturalWidth,t.image.naturalHeight],colorSpace:t.colorSpace,anisotropy:t.anisotropy,ratio:s.renderer.getPixelRatio(),buffer:[s.canvas.width,s.canvas.height],rotation:s.controls.getAzimuthalAngle(),visible:s.earth.mesh.visible,autoRotate:s.controls.autoRotate,zoom:s.controls.enableZoom};});
async function still(p){await p.evaluate(()=>{const s=window.__earthTest();s.controls.autoRotate=false;s.camera.position.set(0,0,6.45);s.controls.update();s.renderer.render(s.scene,s.camera);});}
(async()=>{await verifyWaterBoundaries();fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const rows=[],layouts=[];
 for(const baseline of [true,false]){
  const f=await fixture(browser),p=f.page;
  const shaderErrors=[];p.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|Shader/i.test(m.text()))shaderErrors.push(m.text())});p.on('pageerror',error=>console.error('PAGE',error.message));p.on('requestfailed',request=>{if(/earth|three|Orbit/.test(request.url()))console.error('REQUEST',request.url(),request.failure());});
  await f.context.route('**/earth-theme.js*',route=>{const source=fs.readFileSync(path.join(root,baseline?'baselines/earth-ocean-before-20261001/earth-theme.js':'dist/earth-theme.js'),'utf8');return route.fulfill({contentType:'text/javascript',body:source+'\nwindow.__earthTest=()=>state;'});});
  if(baseline){
   await f.context.route('**/earth-source.js*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'baselines/earth-ocean-before-20261001/earth-source.js'),'utf8')}));
  }
  await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
  await p.evaluate(()=>{prefs.theme='globe';prefs.mode='dark';prefs.color='#237c76';render()});
  await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible,{},{timeout:30000}).catch(async error=>{console.error(await p.evaluate(()=>({theme:document.body.dataset.theme,loader:document.querySelector('[data-globe-loading]')?.outerHTML,source:window.__earthTest?.()?.earth.textureURL,errors:performance.getEntriesByType('resource').filter(r=>r.name.includes('earth')).map(r=>({url:r.name,size:r.transferSize}))})));throw error;});
  rows.push({baseline,...await inspect(p)});assert.deepEqual(rows.at(-1).texture,[8192,4096]);
  assert(rows.at(-1).autoRotate&&!rows.at(-1).zoom);await still(p);
  layouts.push(await p.locator('.globe-stage,.globe-copy,body>header').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})));
  await p.screenshot({path:path.join(out,baseline?'before.png':'after.png')});
  if(!baseline){
   for(const [name,angle] of [['americas',Math.PI/2],['asia',-Math.PI/2],['pacific',Math.PI],['inland-seas',-Math.PI/4]]){await p.evaluate(angle=>{const s=window.__earthTest();s.earth.mesh.rotation.y=-Math.PI/2+angle;s.renderer.render(s.scene,s.camera)},angle);await p.screenshot({path:path.join(out,'after-'+name+'.png')});}
   assert.equal(rows.at(-1).colorSpace,'srgb');assert(rows.at(-1).anisotropy>1);assert(rows.at(-1).visible);
   const rotation=(await inspect(p)).rotation;await p.mouse.move(1080,500);await p.mouse.down();await p.mouse.move(1350,540,{steps:12});await p.mouse.up();assert(Math.abs((await inspect(p)).rotation-rotation)>.1,'drag still rotates the globe');
   await p.evaluate(()=>{const s=window.__earthTest();s.controls.autoRotate=true;});
   const angle=(await inspect(p)).rotation;await p.waitForFunction(angle=>Math.abs(window.__earthTest().controls.getAzimuthalAngle()-angle)>.005,angle);
   await p.evaluate(()=>{const s=window.__earthTest();s.controls.autoRotate=false;s.camera.position.set(0,0,-6.45);s.controls.update();s.renderer.render(s.scene,s.camera)});await p.screenshot({path:path.join(out,'after-orbit-back.png')});
   await p.evaluate(()=>{prefs.mode='light';render()});await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible);await still(p);await p.screenshot({path:path.join(out,'after-light.png')});
   await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{prefs.mode='dark';render()});await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible);
   assert.deepEqual((await inspect(p)).texture,[4096,2048]);await p.screenshot({path:path.join(out,'after-mobile.png')});
   await p.evaluate(()=>{prefs.theme='paper';render()});await p.waitForFunction(()=>window.__earthTest()===null);
   await p.evaluate(()=>{prefs.theme='globe';render()});await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible);
   assert((await inspect(p)).visible,'texture reloads after changing themes');
  }
  assert.deepEqual(shaderErrors,[]);assert.deepEqual(f.errors,[]);await f.context.close();
 }
 assert.deepEqual(layouts[0],layouts[1],'page geometry is unchanged');fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2));console.log('PASS ocean: unchanged 8K/4K texture, layout, rotation and lifecycle; captured Africa, Americas, Asia, Pacific and mobile');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
