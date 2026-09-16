const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const captures=[];
 for(const baseline of [true,false]){
   const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
   if(baseline)await context.route('http://127.0.0.1:4318/**',route=>{
     const name=new URL(route.request().url()).pathname;
     const file=({'/':'index.html','/app.js':'app.js','/v4.js':'v4.js'})[name];
     return file?route.fulfill({path:path.resolve('baselines/v187-before-low-poly-theme',file),contentType:file.endsWith('.js')?'text/javascript':'text/html'}):route.continue();
   });
   const page=await context.newPage();await page.clock.setFixedTime(new Date('2026-09-15T10:00:00+08:00'));
   await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
   const shots=[];
   for(const mode of ['light','dark']){
     await page.evaluate(mode=>{scope='global';prefs.mode=mode;changeTheme('base');view='home';render();document.querySelectorAll('.brand-guide,#toast').forEach(el=>el.style.display='none');document.activeElement.blur()},mode);
     await page.mouse.move(600,780);shots.push(await page.screenshot({animations:'disabled'}));
     await page.evaluate(()=>{signed=true;goSpace(data[0].id);scope='global';changeTheme('base');document.querySelectorAll('.brand-guide,#toast').forEach(el=>el.style.display='none')});
     await page.mouse.move(600,780);shots.push(await page.screenshot({animations:'disabled'}));
   }
   captures.push(shots);await context.close();
 }
 assert(captures[0].every((shot,i)=>shot.equals(captures[1][i])),'existing base home and workspace screenshots match the saved baseline');
 // A remembered theme loads even without the preview query parameter.
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4318/?theme=poly');await page.goto('http://127.0.0.1:4318/');
 assert.equal(await page.locator('.poly-wallpaper').count(),1);assert.deepEqual(errors,[]);
 const local=await browser.newPage();
 await local.goto(require('node:url').pathToFileURL(path.resolve('dist/index.html')).href+'?theme=poly');
 await local.locator('.poly-change').click();await local.locator('[data-poly-upload]').setInputFiles(path.resolve('checks/poly-home-light.png'));
 await local.waitForFunction(()=>document.querySelector('.poly-progress').textContent.includes('已生成'));
 assert(await local.locator('.poly-editor-preview path').count()>500);
 console.log('PASS: baseline pixel match (home / workspace, light / dark), remembered theme startup, file:// local conversion fallback');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
