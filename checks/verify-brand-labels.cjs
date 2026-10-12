const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',async r=>{if(r.request().url().includes('theme-access'))await new Promise(resolve=>setTimeout(resolve,1100));return r.fulfill({json:r.request().url().includes('theme-access')?{items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:!['threeBody','starlink'].includes(id),memberOnly:['emergence','threeBody','starlink'].includes(id),limitedFree:id==='emergence'})),fallback:'base',member:false}:{}})});
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 const trigger=page.locator('.brand-demo4-entry'),stage=page.locator('.brand-demo4-stage');await trigger.waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('.brand-demo4-card img')].every(i=>i.complete&&i.naturalWidth));
 await page.waitForTimeout(1400);await trigger.click();
 await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage')?.classList.contains('is-settled'));
 assert.equal(await stage.locator('[data-brand-theme=emergence] .theme-member-badge').textContent(),'限免');
 assert.equal(await stage.locator('[data-brand-theme=threeBody] .theme-member-badge').getAttribute('aria-label'),'会员主题');
 assert.equal(await stage.locator('[data-brand-theme=base] .theme-member-badge').count(),0);
 assert.notEqual(await stage.locator('[data-brand-theme=threeBody] .theme-member-badge').evaluate(e=>getComputedStyle(e).display),'none');
 assert.equal(await stage.locator('.brand-demo4-card').first().evaluate(e=>getComputedStyle(e).counterIncrement),'brand-theme-number 1');
 assert.deepEqual(errors,[]);console.log('PASS theme free/member badges and numbering.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
