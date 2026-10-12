const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',async r=>{if(r.request().url().includes('theme-access'))await new Promise(resolve=>setTimeout(resolve,1100));return r.fulfill({json:r.request().url().includes('theme-access')?{items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:{}})});
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 const trigger=page.locator('.brand-demo4-entry'),stage=page.locator('.brand-demo4-stage');await trigger.waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('.brand-demo4-card img')].every(i=>i.complete&&i.naturalWidth));

 await page.waitForTimeout(1400);await trigger.click();await page.waitForTimeout(1300);
 const next=page.locator('[data-theme-step="1"]'),prev=page.locator('[data-theme-step="-1"]');
 await next.click();assert.equal(await page.evaluate(()=>effective().theme),'poly');assert.equal(await trigger.getAttribute('aria-expanded'),'true');
 await prev.click();assert.equal(await page.evaluate(()=>effective().theme),'base');
 await prev.click();assert.equal(await page.evaluate(()=>effective().theme),'starlink');await page.waitForTimeout(900);const visible=await page.locator('[data-brand-theme=starlink]').evaluate(e=>{const r=e.getBoundingClientRect(),p=e.closest('.brand-demo4-scroll').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom;});assert.equal(visible,true);const alignment=await page.evaluate(()=>{const n=document.querySelector('.brand-demo4-navigation').getBoundingClientRect(),b=document.querySelector('.brand-demo4-entry').getBoundingClientRect(),c=document.querySelector('.brand-demo4-card').getBoundingClientRect();return {width:Math.abs(n.width-c.width),center:Math.abs(n.left+n.width/2-b.left-b.width/2)};});assert.ok(alignment.width<1);assert.ok(alignment.center<1);
 await next.click();assert.equal(await page.evaluate(()=>effective().theme),'base');
 const before=await next.boundingBox();await page.locator('.brand-demo4-scroll').evaluate(e=>e.scrollTop=500);const after=await next.boundingBox();assert.equal(before.y,after.y);
 assert.deepEqual(errors,[]);console.log('PASS previous/next, both wrap directions, stays open, fixed controls while scrolling.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
