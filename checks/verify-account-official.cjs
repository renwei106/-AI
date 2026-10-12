const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',async r=>{if(r.request().url().includes('theme-access'))await new Promise(resolve=>setTimeout(resolve,1100));return r.fulfill({json:r.request().url().includes('theme-access')?{items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:{}})});
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1200);
 await page.evaluate(()=>{signed=true;prefs.accountProfile={id:'menu-check',name:'测试用户'};updateHeader();});
 for(const target of ['home','space']){
   await page.evaluate(target=>{view=target;updateHeader();},target);
   const menu=page.locator('.account-menu');assert.equal(await menu.locator('[data-account-signout]').count(),0);assert.equal(await menu.locator('[data-menu-official]').count(),1);assert.equal(await menu.locator('button').last().textContent(),'拾隅官网');
 }
 await page.evaluate(()=>{document.body.classList.add('world-active');updateHeader();});
 assert.equal(await page.locator('.account-menu [data-account-signout]').count(),0);assert.equal(await page.locator('.account-menu button').last().textContent(),'拾隅官网');
 let destination='';await page.route('https://www.shiyubox.com/**',r=>{destination=r.request().url();return r.fulfill({status:200,body:'official destination verified'});});
 await page.locator('[data-menu-official]').evaluate(e=>e.click());await page.waitForURL('https://www.shiyubox.com/');assert.equal(destination,'https://www.shiyubox.com/');assert.deepEqual(errors,[]);
 console.log('PASS shared menu official entry, last position across home/space/world states, official navigation.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
