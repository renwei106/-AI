const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});const p=await browser.newPage({viewport:{width:1440,height:1040},reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4318/?theme=poly');
 for(const mode of ['light','dark']){await p.evaluate(mode=>{prefs.mode=mode;apply();document.querySelectorAll('.brand-guide,#toast').forEach(e=>e.style.display='none')},mode);await p.screenshot({path:`checks/poly-wallpaper-${mode}.png`});}
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{prefs.mode='light';apply()});await p.screenshot({path:'checks/poly-wallpaper-mobile.png'});
 console.log(JSON.stringify({errors,size:await p.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,svg:document.querySelector('.poly-art svg').getBoundingClientRect().toJSON()}))}));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
