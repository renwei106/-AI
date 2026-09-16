const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const {PNG}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});const shots=[];
 for(const baseline of [true,false]){
   const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
   if(baseline)await context.route('http://127.0.0.1:4318/**',route=>{const file=({'/':'index.html','/app.js':'app.js','/v4.js':'v4.js'})[new URL(route.request().url()).pathname];return file?route.fulfill({path:path.resolve('baselines/v190-before-reading-room',file),contentType:file.endsWith('.js')?'text/javascript':'text/html'}):route.continue();});
   const page=await context.newPage();await page.clock.setFixedTime(new Date('2026-09-15T10:00:00+08:00'));await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});const results=[];
   for(const theme of ['base','poly'])for(const mode of ['light','dark']){
     await page.evaluate(({theme,mode})=>{view='home';scope='global';prefs.mode=mode;changeTheme(theme);document.querySelectorAll('.brand-guide,#toast').forEach(e=>e.style.display='none');document.activeElement.blur()}, {theme,mode});await page.mouse.move(20,750);await page.waitForTimeout(400);results.push(await page.screenshot({animations:'disabled'}));
     await page.evaluate(()=>{signed=true;goSpace(data[0].id);scope='global';styles[currentGroup().id]='cards';prefs.spaceDisplayRules={};prefs.sceneDisplayRules={};render();document.querySelectorAll('.brand-guide,#toast').forEach(e=>e.style.display='none');document.activeElement.blur()});await page.mouse.move(20,750);await page.waitForTimeout(400);results.push(await page.screenshot({animations:'disabled'}));
   }
   shots.push(results);await context.close();
 }
 shots[0].forEach((before,i)=>{const a=PNG.sync.read(before),b=PNG.sync.read(shots[1][i]);let changed=0;for(let k=0;k<a.data.length;k++)if(Math.abs(a.data[k]-b.data[k])>1)changed++;assert.equal(changed,0,`existing screen ${i} stays identical`);});
 console.log('PASS: base and poly home/workspace match pre-reading baseline at identical viewport in light/dark (8 screenshots).');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
