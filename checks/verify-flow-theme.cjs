const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1288,height:1041}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});
 await page.evaluate(()=>{signed=true;document.querySelector('.brand-guide')?.remove()});
 const dataBefore=await page.evaluate(()=>JSON.stringify(data));
 assert.equal(await page.locator('.flow-copy h1').innerText(),'让灵感，\n自在流动。');assert.equal(await page.locator('.flow-canvas').getAttribute('data-active'),'true');
 await page.mouse.move(150,620);await page.mouse.move(980,730,{steps:28});await page.mouse.move(450,620,{steps:18});await page.mouse.down();await page.mouse.up();await page.waitForTimeout(700);await page.screenshot({path:'checks/flow-motion.png'});
 for(const [name,width,height]of [['light',1288,1041],['wide',2560,1440],['short',1288,650],['mobile',390,844]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(350);
   assert.deepEqual(await page.locator('.flow-cover').boundingBox(),{x:0,y:0,width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const copy=await page.locator('.flow-copy').boundingBox(),dock=await page.locator('.dock-trigger').boundingBox();assert(copy.y>80&&copy.y+copy.height<dock.y,'copy does not overlap controls at '+name);
   const particles=Number(await page.locator('.flow-canvas').getAttribute('data-particles'));assert(particles>=190&&particles<=1150);await page.screenshot({path:`checks/flow-${name}.png`});
 }
 await page.setViewportSize({width:1288,height:1041});await page.locator('[data-action=settings]').click();await page.locator('#settings[open]').waitFor();await page.waitForFunction(()=>document.querySelector('.flow-canvas').dataset.active==='false');assert.equal(await page.locator('[data-v2-theme=flow]').count(),1);assert.equal(await page.locator('[data-v2-theme=flow] .theme-preview svg').count(),1);await page.screenshot({path:'checks/flow-settings.png'});await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('.flow-canvas').dataset.active==='true');
 await page.keyboard.press('Slash');await page.locator('#quick-search[open]').waitFor();await page.waitForFunction(()=>document.querySelector('.flow-canvas').dataset.active==='false');await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.flow-canvas').dataset.active==='false');
 const still=await page.locator('.flow-canvas').evaluate(e=>e.toDataURL());await page.mouse.move(120,600);await page.mouse.move(1000,500,{steps:10});await page.waitForTimeout(100);assert.equal(await page.locator('.flow-canvas').evaluate(e=>e.toDataURL()),still,'reduced motion is static');
 for(const [mode,color,name]of [['light','#e9e9e1','pale'],['light','#48614c','green'],['dark','#4d60d6','dark']]){
   await page.evaluate(({mode,color})=>{prefs.mode=mode;prefs.color=color;persist();render();document.querySelector('.brand-guide')?.remove()},{mode,color});await page.waitForTimeout(160);
   const ink=await page.evaluate(()=>document.body.style.getPropertyValue('--flow-ink'));assert.equal(ink,name==='pale'?'#172539':'#f5f7ff');await page.screenshot({path:`checks/flow-${name}.png`});
 }
 await page.evaluate(()=>{prefs.sharedHomeCopy={mode:'custom',title:'让好奇心流动',intro:'收下每一次灵感'};persist();applyHomeCopy()});assert.equal(await page.locator('[data-flow-title]').innerText(),'让好奇心流动');
 await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});assert.equal(await page.locator('.flow-cover').count(),1,'remembered theme loads without query');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.querySelector('.flow-canvas').dataset.active==='true');await page.locator('.scroll-invitation').click();await page.locator('.workspace').waitFor();assert.equal(await page.locator('.flow-cover').count(),0);assert.equal(await page.evaluate(()=>JSON.stringify(data)),dataBefore);assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'cards');
 await page.evaluate(()=>{view='home';render();scope='global';changeTheme('reading')});await page.waitForTimeout(300);assert.equal(await page.locator('.flow-cover').count(),0);assert.equal(await page.locator('.reading-gallery').count(),1);assert.deepEqual(errors,[]);
 await context.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await mobile.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});assert(await mobile.locator('.flow-touch-hint').isVisible());await mobile.touchscreen.tap(120,520);await mobile.waitForTimeout(500);assert.equal(await mobile.locator('.flow-canvas').getAttribute('data-active'),'true');await mobile.close();
 const local=await browser.newPage();await local.goto('file:///D:/系统文件/文档/ChatGPT/导航站/dist/index.html?theme=flow');await local.locator('.flow-canvas').waitFor();assert.equal(await local.locator('.flow-canvas').getAttribute('data-active'),'true');await local.close();
 console.log('PASS: flow cover in 4 sizes, palette/contrast and dark mode, pointer/touch, reduced motion, theme entry/thumbnail, settings/search pause and resume, custom copy, persisted reload, workspace navigation/data, old-theme cleanup, file:// preview.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
