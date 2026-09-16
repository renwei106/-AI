const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1040},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
 await page.goto('http://127.0.0.1:4318/?theme=poly',{waitUntil:'networkidle'});
 await page.evaluate(()=>{prefs.mode='light';apply();document.querySelector('.brand-guide')?.remove()});
 await page.locator('.poly-art svg').waitFor();
 assert.equal(await page.locator('.home-poly #search-form,.poly-reading,.poly-quick-links').count(),0);
 await page.screenshot({path:'checks/poly-home-light.png',fullPage:true});
 await page.keyboard.press('Slash');await page.locator('#quick-search[open]').waitFor();assert.equal(await page.locator('#search-input').evaluate(el=>el===document.activeElement),true);
 await page.locator('#quick-search [data-search=saved]').click();await page.locator('#quick-search #search-input').fill('Figma');
 assert.match(await page.locator('#quick-search #search-results').innerText(),/Figma/);
 await page.keyboard.press('Escape');
 // Preview does not apply until saved, and the initial image remains after cancellation.
 await page.locator('.poly-change').click();
 for(const preset of ['ocean','dunes','fox','deer','portrait']){await page.locator(`[data-poly-preset=${preset}]`).click();assert(await page.locator('.poly-editor-preview polygon').count()>5);}
 await page.screenshot({path:'checks/poly-portrait-preview.png'});
 await page.locator('[data-poly-cancel]').last().click();
 assert.equal(await page.locator('[data-poly-caption]').innerText(),'山岚');
 await page.locator('.poly-change').click();await page.locator('[data-poly-preset=fox]').click();await page.locator('[data-poly-save]').click();
 assert.equal(await page.locator('[data-poly-caption]').innerText(),'狐影');
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-poly-caption]').innerText(),'狐影');
 // Process a local fixture; no image upload request is made.
 await page.locator('.poly-change').click();const requestStart=requests.length;
 await page.locator('[data-poly-upload]').setInputFiles(path.resolve('checks/poly-home-light.png'));
 await page.waitForFunction(()=>document.querySelector('.poly-progress').textContent.includes('已生成'));
 const balanced=await page.locator('.poly-editor-preview path').count();assert(balanced>1000);
 await page.locator('[data-poly-detail=simple]').click();await page.waitForFunction(()=>document.querySelector('.poly-progress').textContent.includes('已生成'));
 const simple=await page.locator('.poly-editor-preview path').count();assert(simple<balanced);
 await page.locator('[data-poly-tone=theme]').click();await page.waitForFunction(()=>document.querySelector('.poly-progress').textContent.includes('已生成'));
 await page.locator('[data-poly-compare]').click();assert.equal(await page.locator('.poly-editor-preview img').count(),1);
 await page.locator('[data-poly-compare]').click();assert(await page.locator('.poly-editor-preview path').count()>0);
 await page.locator('[data-poly-save]').click();await page.locator('#poly-scene-picker').waitFor({state:'hidden'});
 assert.equal(await page.locator('[data-poly-caption]').innerText(),'私藏风景');
 assert(!requests.slice(requestStart).some(r=>r.method!=='GET'||(/^https?:/.test(r.url)&&!r.url.startsWith('http://127.0.0.1:4318/'))),'conversion never uploads images or calls a remote service');
 await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('[data-poly-caption]').textContent==='私藏风景');
 await page.locator('.poly-change').click();await page.locator('[data-poly-remove]').click();await page.locator('[data-poly-cancel]').last().click();assert.equal(await page.locator('[data-poly-caption]').innerText(),'私藏风景');
 await page.locator('.poly-change').click();await page.locator('[data-poly-remove]').click();await page.locator('[data-poly-save]').click();assert.equal(await page.locator('[data-poly-caption]').innerText(),'山岚');
 // New-theme settings and inherited workspace cards stay functional.
 await page.evaluate(()=>{scope='global';settingsTab='themes';renderSettings();document.querySelector('#settings').showModal()});
 assert.equal(await page.locator('#settings [data-v2-theme=poly]').count(),1);
 await page.locator('#settings .poly-settings-entry').click();assert(await page.locator('#poly-scene-picker').isVisible());
 await page.keyboard.press('Escape');await page.keyboard.press('Escape');
 await page.evaluate(()=>{signed=true;prefs.spaceThemePolicy='last';goSpace(data[0].id);scope='global';changeTheme('poly')});
 await page.locator('.workspace .bookmark').first().waitFor();
 await page.screenshot({path:'checks/poly-space-light.png',fullPage:true});
 const cards=await page.locator('.workspace .cards').first().getAttribute('data-display');assert.equal(cards,'cards');
 assert(await page.locator('.workspace .bookmark-logo-image').count()>=3);
 await page.evaluate(()=>{prefs.mode='dark';apply()});await page.screenshot({path:'checks/poly-space-dark.png',fullPage:true});
 await page.evaluate(()=>{view='home';render()});await page.screenshot({path:'checks/poly-home-dark.png',fullPage:true});
 await page.locator('.poly-change').click();await page.screenshot({path:'checks/poly-picker-dark.png'});await page.keyboard.press('Escape');
 for(const [width,height] of [[1920,1080],[1288,1041],[768,1024],[390,844]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>{prefs.mode='light';apply()});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow at '+width);
   const visible=await page.locator('.poly-change').boundingBox();assert(visible&&visible.x>=0&&visible.x+visible.width<=width);
   if(width===390)await page.screenshot({path:'checks/poly-home-mobile.png',fullPage:true});
   await page.locator('.poly-change').click();assert(await page.locator('[data-poly-save]').isVisible());
   if(width===390)await page.screenshot({path:'checks/poly-picker-mobile.png'});
   await page.keyboard.press('Escape');
 }
 await page.evaluate(()=>{scope='global';changeTheme('base')});assert.equal(await page.locator('.poly-wallpaper').count(),0);assert.equal(await page.locator('.home-base .base-composition').count(),1);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',checks:['preset preview / cancel / apply / reload','local conversion, detail, tone and original comparison','local storage persistence and cancellable deletion','wallpaper-only home, shortcut search, theme settings and real bookmark logos','light / dark / 390–1920 px layout','switching back to existing theme'],triangles:{balanced,simple}},null,2));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
