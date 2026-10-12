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

 const wheel=delta=>frame.evaluate(delta=>document.querySelector('canvas').dispatchEvent(new WheelEvent('wheel',{deltaY:delta,bubbles:true,cancelable:true})),delta);
 await page.evaluate(()=>{signed=true;prefs.accountProfile={id:'wheel-check',name:'测试用户',profileCompleted:true};persist();prefs.homeEntryGesture='click';prefs.worldEntryGesture='click';downArmedAt=0;gestureTotal=0;lastWheelAt=0;});await wheel(120);assert.equal(await page.evaluate(()=>downArmedAt),0);
 await page.evaluate(()=>{prefs.homeEntryGesture='double';gestureTotal=0;lastWheelAt=0;wheelBurstHandled=false;});await wheel(120);assert.ok(await page.evaluate(()=>downArmedAt>0));assert.equal(await page.evaluate(()=>view),'home');
 await page.waitForTimeout(500);await wheel(120);await page.waitForTimeout(1500);assert.equal(await page.locator('#login').evaluate(d=>d.open),true);
 console.log('PASS embedded wheel obeys click-only setting, prompts on first downward gesture, reaches existing space login gate on second.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
