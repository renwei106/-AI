const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1040},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4318/?theme=poly',{waitUntil:'networkidle'});
 await page.evaluate(()=>{prefs.mode='light';apply()});
 await page.screenshot({path:'checks/poly-home-light.png',fullPage:true});
 console.log(JSON.stringify({errors,title:await page.locator('.poly-reading h1').allTextContents(),size:await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})),html:await page.locator('.poly-reading #search-form').innerHTML()}));
 await page.locator('.poly-change').click();
 await page.screenshot({path:'checks/poly-picker.png',fullPage:true});
 console.log('picker',await page.locator('#poly-scene-picker').isVisible());
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
