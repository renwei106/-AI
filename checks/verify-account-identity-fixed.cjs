const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',async r=>{if(r.request().url().includes('theme-access'))await new Promise(resolve=>setTimeout(resolve,1100));return r.fulfill({json:r.request().url().includes('theme-access')?{items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:{}})});
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1200);
 await page.evaluate(()=>{signed=true;prefs.accountProfile={id:'menu-check',name:'测试用户'};updateHeader();});

 for(const completed of [undefined,false,true]){
  await page.evaluate(completed=>{prefs.accountProfile={id:'menu-check',name:'测试用户',profileCompleted:completed};updateHeader();document.querySelector('[data-menu-identity]').click();},completed);
  const d=page.locator('#account-center');assert.equal(await d.locator('h2').textContent(),'个人中心');assert.equal(await d.locator('[data-profile-avatar-open]').count(),1);assert.equal(await d.locator('[data-security-item]').count(),4);assert.equal(await d.locator('[data-account-cancel]').count(),1);assert.equal(await d.locator('#profile-name').count(),0);
  await d.locator('[data-local-close]').click();
 }
 await page.evaluate(()=>{prefs.accountProfile={id:'menu-check',name:'测试用户',profileCompleted:false};accountOnboarding=true;openAccountCenter();});
 assert.equal(await page.locator('#account-center h2').textContent(),'完善个人资料');
 console.log('PASS avatar identity always opens general center for missing/false/true profileCompleted; onboarding remains setup.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
