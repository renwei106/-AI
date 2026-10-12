const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',async r=>{if(r.request().url().includes('theme-access'))await new Promise(resolve=>setTimeout(resolve,1100));return r.fulfill({json:r.request().url().includes('theme-access')?{items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:{}})});
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 const trigger=page.locator('.brand-demo4-entry'),stage=page.locator('.brand-demo4-stage');await trigger.waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('.brand-demo4-card img')].every(i=>i.complete&&i.naturalWidth));

 await page.waitForTimeout(1400);await page.evaluate(()=>{prefs.theme='starlink';render();});
 await page.frameLocator('iframe.starlink-stage').locator('canvas').waitFor();

 const frame=page.frames().find(f=>f.url().includes('/assets/starlink/frame.html'));
 for(const dark of [false,true,false]){
  await page.evaluate(dark=>document.body.dataset.dark=String(dark),dark);await page.waitForTimeout(50);
  const color=await frame.evaluate(()=>{const p=pJSDom[0].pJS;return {setting:p.particles.color.value,point:p.particles.array[0].color.rgb,line:p.particles.line_linked.color,lineRGB:p.particles.line_linked.color_rgb_line};});
  assert.equal(color.line,dark?'#f0f0f0':'#242424');assert.deepEqual(color.lineRGB,{r:dark?240:36,g:dark?240:36,b:dark?240:36});assert.equal(color.setting,dark?'#f0f0f0':'#242424');assert.equal(color.point.r,dark?240:36);assert.equal(color.point.r,color.point.g);assert.equal(color.point.g,color.point.b);
 }
 assert.deepEqual(errors,[]);console.log('PASS monochrome points in light/dark appearances; particle engine preserved.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
