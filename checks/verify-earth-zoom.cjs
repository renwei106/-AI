process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'earth-zoom');
const ready=p=>p.waitForFunction(()=>window.__earthTest?.()?.earth.mesh.visible);
const settled=p=>p.waitForFunction(()=>{const z=window.__earthTest()?.zoom;return z&&Math.abs(z.current-z.target)<.001});
const read=p=>p.evaluate(()=>{const s=window.__earthTest();return {scale:s.zoom.current,target:s.zoom.target,stars:s.stars.mesh.geometry.drawRange.count,starSize:s.stars.material.uniforms.pointSize.value,view,scroll:scrollY,armed:downArmedAt,background:getComputedStyle(document.body).backgroundImage};});
async function center(p){const r=await p.locator('#earth-theme-canvas').boundingBox();return {x:r.x+r.width/2,y:r.y+r.height/2};}
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page,shaderErrors=[];
 p.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|Shader/i.test(m.text()))shaderErrors.push(m.text())});
 await f.context.route('**/earth-theme.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'dist/earth-theme.js'),'utf8')+'\nwindow.__earthTest=()=>state;'}));
 await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
 await p.evaluate(()=>{prefs.theme='globe';prefs.mode='light';prefs.color='#237c76';prefs.homeEntryGesture='scroll';render()});await ready(p);
 const initial=await read(p);assert.equal(initial.stars,900);assert.equal(await p.locator('.account-menu-wrap>.account-entry').first().evaluate(e=>getComputedStyle(e).getPropertyValue('--surface').trim()),'#1b2832');await p.screenshot({path:path.join(out,'light-default.png')});
 const c=await center(p);await p.mouse.move(c.x,c.y);
 await p.mouse.wheel(0,160);await settled(p);const smaller=await read(p);assert(smaller.scale<1&&smaller.stars>900&&smaller.starSize>3);
 for(let i=0;i<7;i++)await p.mouse.wheel(0,160);await settled(p);const small=await read(p);
 assert(Math.abs(small.scale-.4)<.001);assert(small.stars>2590);assert.equal(small.view,'home');assert.equal(small.scroll,0);assert.equal(small.armed,0);
 await p.screenshot({path:path.join(out,'zoom-out.png')});
 for(let i=0;i<10;i++)await p.mouse.wheel(0,-160);await settled(p);const large=await read(p);
 assert(Math.abs(large.scale-1.22)<.001);assert(large.stars<355&&large.starSize<3);assert.equal(large.view,'home');assert.equal(large.armed,0);
 await p.screenshot({path:path.join(out,'zoom-in.png')});
 const angle=await p.evaluate(()=>window.__earthTest().controls.getAzimuthalAngle());await p.mouse.down();await p.mouse.move(c.x+130,c.y+20,{steps:10});await p.mouse.up();assert(Math.abs(await p.evaluate(()=>window.__earthTest().controls.getAzimuthalAngle())-angle)>.1,'drag rotation still works while zoomed');await p.mouse.move(c.x,c.y);
 // Both limits still consume the gesture; pixel/line/page deltas share the same bounds.
 for(const deltaMode of [0,1,2])await p.evaluate(({x,y,deltaMode})=>document.querySelector('#earth-theme-canvas').dispatchEvent(new WheelEvent('wheel',{clientX:x,clientY:y,deltaY:-100,deltaMode,bubbles:true,cancelable:true})),{...c,deltaMode});
 await settled(p);assert.equal((await read(p)).view,'home');
 // Resize must not reset the selected zoom.
 await p.setViewportSize({width:1440,height:900});await settled(p);assert.equal((await read(p)).target,large.target);
 // A burst begun at the limb stays captured while the globe shrinks away.
 await p.evaluate(()=>{prefs.theme='globe';render()});await ready(p);const edge=await center(p);edge.x+=230;await p.mouse.move(edge.x,edge.y);
 for(let i=0;i<8;i++){await p.mouse.wheel(0,160);await p.waitForTimeout(65)}await settled(p);
 assert.equal((await read(p)).view,'home');assert.equal((await read(p)).armed,0);
 // Moving away from Earth keeps the site's existing page navigation gesture.
 await p.mouse.move(300,140);await p.waitForTimeout(350);await p.mouse.wheel(0,160);await p.waitForTimeout(200);assert((await read(p)).armed>0);
 await p.mouse.wheel(0,160);await p.waitForFunction(()=>view==='space');await p.waitForFunction(()=>window.__earthTest()===null);
 await p.evaluate(()=>{view='home';prefs.theme='globe';render()});await ready(p);assert.equal((await read(p)).target,1);
 const backgrounds=[];
 for(const color of ['#237c76','#ffffff','#ffdd88'])for(const mode of ['light','dark']){
  await p.evaluate(({color,mode})=>{prefs.color=color;prefs.mode=mode;render()},{color,mode});await ready(p);await p.waitForTimeout(350);
  const img=await p.screenshot();const sample=await sharp(img).extract({left:8,top:300,width:1,height:1}).removeAlpha().raw().toBuffer();assert([...sample].every(v=>v<80),`background stays dark: ${color} ${mode} ${sample}`);
  backgrounds.push({color,mode,background:(await read(p)).background});
 }
 for(let i=0;i<backgrounds.length;i+=2)assert.equal(backgrounds[i].background,backgrounds[i+1].background);
 assert.notEqual(backgrounds[0].background,backgrounds[2].background,'background follows accent');
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{prefs.color='#237c76';prefs.mode='light';render()});await ready(p);await p.screenshot({path:path.join(out,'mobile-light.png')});
 await p.evaluate(()=>{prefs.theme='base';prefs.mode='light';render()});await p.waitForFunction(()=>window.__earthTest()===null);await p.waitForTimeout(350);
 const other=await sharp(await p.screenshot()).extract({left:8,top:300,width:1,height:1}).removeAlpha().raw().toBuffer();assert([...other].every(v=>v>150),'another theme still uses its light background');
 assert.deepEqual(shaderErrors,[]);assert.deepEqual(f.errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({initial,smaller,small,large,backgrounds},null,2));await f.context.close();
 console.log('PASS hover wheel zoom, limits, burst capture, no page scroll, outside navigation, resize/lifecycle, star count/size, accent-tinted dark background in both modes and untouched other theme');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
