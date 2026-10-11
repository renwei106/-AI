const {fixture,base}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),before=await fixture(browser),after=await fixture(browser);
 for(const file of ['desktop-pet.js','desktop-pet-host.js','desktop-pet.css'])await before.context.route('**/'+file,route=>route.fulfill({contentType:file.endsWith('.css')?'text/css':'text/javascript',body:fs.readFileSync('baselines/keyboard-shortcuts-before-20261008/'+file,'utf8')}));
 await before.page.goto(base,{waitUntil:'networkidle'});
 for(const mode of ['light','dark']){
  const captures=[];
  for(const [label,f]of [['before',before],['after',after]]){
   await f.page.evaluate(mode=>{prefs.theme='base';prefs.mode=mode;view='home';render();},mode);
   await f.page.addStyleTag({content:'#desktop-pet{visibility:hidden!important}'});await f.page.evaluate(()=>document.fonts.ready);
   const png=await f.page.screenshot({animations:'disabled'});fs.writeFileSync('checks/keyboard-shortcuts/home-'+mode+'-'+label+'.png',png);captures.push(await sharp(png).ensureAlpha().raw().toBuffer());
  }
  let changed=0;for(let i=0;i<captures[0].length;i+=4)if([0,1,2].some(k=>Math.abs(captures[0][i+k]-captures[1][i+k])>15))changed++;
  assert(changed/(1440*960)<.002,mode+' home differs outside companion');console.log('PASS '+mode+' home baseline: '+changed+' changed pixels');
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
