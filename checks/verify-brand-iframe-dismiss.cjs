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
 await trigger.click();await page.waitForTimeout(1300);assert.equal(await trigger.getAttribute('aria-expanded'),'true');
 await page.mouse.click(250,210);assert.equal(await trigger.getAttribute('aria-expanded'),'true');
 await page.frameLocator('iframe.starlink-stage').locator('canvas').click({position:{x:900,y:700}});
 assert.equal(await trigger.getAttribute('aria-expanded'),'false');
 await page.waitForTimeout(1000);await page.evaluate(()=>{view='space';render();});await page.waitForTimeout(100);await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());view='home';render();});
 await trigger.click();await page.waitForTimeout(1300);await page.frameLocator('iframe.starlink-stage').locator('canvas').click({position:{x:1000,y:600}});assert.equal(await trigger.getAttribute('aria-expanded'),'false');
 assert.deepEqual(errors,[]);console.log('PASS iframe blank click closes, list safe area stays open, workspace return preserves dismissal.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
