const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {PNG}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const assert=require('node:assert/strict'),path=require('node:path');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});const shots=[];
 for(const baseline of [true,false]){
   const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
   if(baseline)await context.route('http://127.0.0.1:4318/**',r=>{const file=({'/':'index.html','/app.js':'app.js','/v4.js':'v4.js'})[new URL(r.request().url()).pathname];return file?r.fulfill({path:path.resolve('baselines/v194-before-floating-theme',file),contentType:file.endsWith('.js')?'text/javascript':'text/html'}):r.continue();});
   const page=await context.newPage();await page.clock.setFixedTime(new Date('2026-09-16T10:00:00+08:00'));await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});const screens=[];
   for(const theme of ['base','poly','reading'])for(const mode of ['light','dark']){
     await page.evaluate(({theme,mode})=>{signed=true;view='home';scope='global';prefs.mode=mode;changeTheme(theme);document.querySelectorAll('.brand-guide,#toast,[data-space-inbox]').forEach(e=>e.style.display='none');document.activeElement.blur()},{theme,mode});await page.mouse.move(5,750);await page.waitForTimeout(200);screens.push(await page.screenshot({animations:'disabled'}));
     await page.evaluate(()=>{goSpace(data[0].id);scope='global';prefs.spaceDisplayRules={};prefs.sceneDisplayRules={};styles[currentGroup().id]='follow';render();document.querySelectorAll('.brand-guide,#toast,[data-space-inbox]').forEach(e=>e.style.display='none');document.activeElement.blur()});await page.waitForTimeout(200);screens.push(await page.screenshot({animations:'disabled'}));
   }
   shots.push(screens);await context.close();
 }
 shots[0].forEach((buf,i)=>{const a=PNG.sync.read(buf),b=PNG.sync.read(shots[1][i]);let changed=0;for(let k=0;k<a.data.length;k++)if(Math.abs(a.data[k]-b.data[k])>1)changed++;assert.equal(changed,0,'existing screen '+i+' remains identical');});
 console.log('PASS: 12 unchanged baseline screenshots for base/poly/reading homepage and workspace, light and dark.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
