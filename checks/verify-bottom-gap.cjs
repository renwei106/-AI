require('node:fs').mkdirSync('.local/checks/bottom-fixed.pn',{recursive:true});
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',async r=>{if(r.request().url().includes('theme-access'))await new Promise(resolve=>setTimeout(resolve,1100));return r.fulfill({json:r.request().url().includes('theme-access')?{items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:{}})});
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1200);

 await page.evaluate(()=>{prefs.theme='cosmos';render();});
 await page.waitForFunction(()=>window.ShiyuThreeBodyScene?.snapshot().loaded);
await page.screenshot({path:'.local/checks/bottom-fixed.png'});assert.ok(await page.evaluate(()=>document.body.getBoundingClientRect().bottom>=innerHeight));console.log(await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight,elements:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>innerWidth*.8&&r.bottom>=innerHeight-20&&r.top<innerHeight}).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,cls:e.className,top:r.top,bottom:r.bottom,height:r.height,bg:s.backgroundColor,border:s.borderBottom,shadow:s.boxShadow}})})));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});