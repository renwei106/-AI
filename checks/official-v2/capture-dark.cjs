const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path=require('node:path');
const assets=path.resolve(__dirname,'../../dist/official/v2/assets');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.querySelector('[data-dismiss-guide]')?.click());
 for(const theme of ['music','cinema','cosmos','paper','flip','base']){
   await page.evaluate(theme=>{view='home';scope='global';changeTheme(theme);prefs.mode='dark';render()},theme);
   await page.waitForTimeout(950);
   await sharp(await page.screenshot()).webp({quality:90}).toFile(path.join(assets,theme+'-dark.webp'));
   if(theme==='music'){
     console.log('music elements',await page.locator('.vinyl,.record-player,.music-composition,.vinyl-scene').evaluateAll(es=>es.map(e=>({class:e.className,rect:e.getBoundingClientRect().toJSON()}))));
     await sharp(await page.screenshot({clip:{x:60,y:150,width:520,height:540}})).webp({quality:93}).toFile(path.join(assets,'record-detail.webp'));
   }
   if(theme==='cosmos')await sharp(await page.screenshot({clip:{x:200,y:190,width:1050,height:575}})).webp({quality:92}).toFile(path.join(assets,'cosmos-detail.webp'));
 }
 await browser.close();console.log('Dark product images ready');
})().catch(e=>{console.error(e);process.exit(1)});
