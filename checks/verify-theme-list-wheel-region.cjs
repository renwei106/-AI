const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',async r=>{if(r.request().url().includes('theme-access'))await new Promise(resolve=>setTimeout(resolve,1100));return r.fulfill({json:r.request().url().includes('theme-access')?{items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:{}})});
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 const trigger=page.locator('.brand-demo4-entry'),stage=page.locator('.brand-demo4-stage');await trigger.waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('.brand-demo4-card img')].every(i=>i.complete&&i.naturalWidth));

 await page.waitForTimeout(1400);
 const guide=show=>stage.evaluate((el,show)=>el.dispatchEvent(new CustomEvent('shiyu-theme-guide',{detail:show})),show);
 await page.evaluate(()=>{prefs.homeEntryGesture='double';prefs.worldEntryGesture='double';});
 await guide(true);await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-settled'));
 const list=page.locator('.brand-demo4-scroll'),rect=await list.boundingBox();
 await page.mouse.move(rect.x+rect.width+12,rect.y+160);await page.mouse.wheel(0,400);await page.waitForTimeout(300);
 assert.ok(await list.evaluate(el=>el.scrollTop>0));assert.equal(await page.evaluate(()=>downArmedAt),0);
 await list.evaluate(el=>el.scrollTop=0);await page.mouse.wheel(0,-150);await page.waitForTimeout(300);await page.mouse.wheel(0,-150);await page.waitForTimeout(300);
 assert.equal(await page.locator('dialog[open]').count(),0);assert.equal(await page.evaluate(()=>document.body.classList.contains('world-active')),false);
 await list.evaluate(el=>el.scrollTop=el.scrollHeight);await page.mouse.wheel(0,150);await page.waitForTimeout(300);await page.mouse.wheel(0,150);assert.equal(await page.evaluate(()=>downArmedAt),0);
 assert.deepEqual(errors,[]);console.log('PASS guide opens theme cards and restores prior open/closed state.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
