const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('../verify-desktop-pet.cjs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const f=await fixture(browser),p=f.page;
  await p.setViewportSize({width:1440,height:900});
  await p.evaluate(()=>{prefs.theme='paper';render()});
  console.log(await p.evaluate(()=>({url:location.href,theme:effective().theme,view,body:document.body.className,paper:!!document.querySelector('.newspaper'),scripts:[...document.scripts].map(s=>s.src).filter(s=>s.includes('paper'))})));
  await p.locator('.edition-cover').click({position:{x:200,y:180}});
  await p.waitForTimeout(500);
  await p.screenshot({path:path.join(__dirname,process.argv[2]||'before.png')});
  console.log(await p.evaluate(()=>Object.fromEntries(['.edition-stage','.newspaper','.masthead','.paper-columns','.edition-nav','body>header','#dock','.site-filing','.scroll-invitation'].map(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return [s,r?{x:r.x,y:r.y,width:r.width,height:r.height,scroll:e.scrollHeight,display:getComputedStyle(e).display}:null]}))));
  console.log('errors',f.errors);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
