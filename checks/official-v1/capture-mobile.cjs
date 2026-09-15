const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:680},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
 await page.evaluate(()=>{document.querySelector('[data-dismiss-guide]')?.click()});
 for(const theme of ['cinema','music','paper','cosmos','flip','base']){
   await page.evaluate(theme=>{view='home';scope='global';changeTheme(theme)},theme);
   await page.waitForTimeout(900);
   await sharp(await page.screenshot()).resize(780,1360).webp({quality:87}).toFile(path.resolve(__dirname,'../../dist/official/assets',theme+'-mobile.webp'));
 }
 await browser.close();console.log('Captured 6 real mobile themes');
})().catch(e=>{console.error(e);process.exit(1)});
