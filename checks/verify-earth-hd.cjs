/* Mock private APIs; inspect the real WebGL scene in the local preview. */
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'earth-hd');
const inspect=p=>p.evaluate(()=>{const s=window.__earthTest(),t=s.earth.mesh.material.map;return {texture:[t.image.naturalWidth,t.image.naturalHeight],colorSpace:t.colorSpace,anisotropy:t.anisotropy,ratio:s.renderer.getPixelRatio(),buffer:[s.canvas.width,s.canvas.height],rotation:s.controls.getAzimuthalAngle(),visible:s.earth.mesh.visible,autoRotate:s.controls.autoRotate,zoom:s.controls.enableZoom};});
async function still(p){await p.evaluate(()=>{const s=window.__earthTest();s.controls.autoRotate=false;s.camera.position.set(0,0,6.45);s.controls.update();s.renderer.render(s.scene,s.camera);});}
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const rows=[],layouts=[];
 for(const baseline of [true,false]){
  const f=await fixture(browser),p=f.page;
  p.on('pageerror',error=>console.error('PAGE',error.message));p.on('requestfailed',request=>{if(/earth|three|Orbit/.test(request.url()))console.error('REQUEST',request.url(),request.failure());});
  await f.context.route('**/earth-theme.js*',route=>{const source=fs.readFileSync(path.join(root,baseline?'baselines/earth-hd-before-20261001/earth-theme.js':'dist/earth-theme.js'),'utf8');return route.fulfill({contentType:'text/javascript',body:source+'\nwindow.__earthTest=()=>state;'});});
  if(baseline){
   await f.context.route('**/earth-source.js*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'baselines/earth-hd-before-20261001/earth-source.js'),'utf8')}));
   await f.context.route('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(root,'baselines/earth-hd-before-20261001/earth_atmos_2048.jpg'))}));
  }
  await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
  await p.evaluate(()=>{prefs.theme='globe';prefs.mode='dark';prefs.color='#237c76';render()});
  await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.material.map.image?.complete,{},{timeout:30000}).catch(async error=>{console.error(await p.evaluate(()=>({theme:document.body.dataset.theme,loader:document.querySelector('[data-globe-loading]')?.outerHTML,source:window.__earthTest?.()?.earth.textureURL,errors:performance.getEntriesByType('resource').filter(r=>r.name.includes('earth')).map(r=>({url:r.name,size:r.transferSize}))})));throw error;});
  rows.push({baseline,...await inspect(p)});assert.deepEqual(rows.at(-1).texture,baseline?[2048,1024]:[8192,4096]);
  assert(rows.at(-1).autoRotate&&!rows.at(-1).zoom);await still(p);
  layouts.push(await p.locator('.globe-stage,.globe-copy,body>header').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})));
  await p.screenshot({path:path.join(out,baseline?'before.png':'after.png')});
  if(!baseline){
   assert.equal(rows.at(-1).colorSpace,'srgb');assert(rows.at(-1).anisotropy>1);assert(rows.at(-1).visible);
   const rotation=(await inspect(p)).rotation;await p.mouse.move(1080,500);await p.mouse.down();await p.mouse.move(1350,540,{steps:12});await p.mouse.up();assert(Math.abs((await inspect(p)).rotation-rotation)>.1,'drag still rotates the globe');
   await p.evaluate(()=>{const s=window.__earthTest();s.controls.autoRotate=true;});
   const angle=(await inspect(p)).rotation;await p.waitForFunction(angle=>Math.abs(window.__earthTest().controls.getAzimuthalAngle()-angle)>.005,angle);
   await p.evaluate(()=>{prefs.mode='light';render()});await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.material.map.image?.complete);await still(p);await p.screenshot({path:path.join(out,'after-light.png')});
   await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{prefs.mode='dark';render()});await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.material.map.image?.complete);
   assert.deepEqual((await inspect(p)).texture,[4096,2048]);await p.screenshot({path:path.join(out,'after-mobile.png')});
   await p.evaluate(()=>{prefs.theme='paper';render()});await p.waitForFunction(()=>window.__earthTest()===null);
   await p.evaluate(()=>{prefs.theme='globe';render()});await p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.material.map.image?.complete);
   assert((await inspect(p)).visible,'texture reloads after changing themes');
  }
  assert.deepEqual(f.errors,[]);await f.context.close();
 }
 assert.deepEqual(layouts[0],layouts[1],'page geometry is unchanged');fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2));console.log('PASS original 2K -> NASA 8K; local 4K mobile texture; sRGB and filtering; drag/auto rotation; theme lifecycle; unchanged layout');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
