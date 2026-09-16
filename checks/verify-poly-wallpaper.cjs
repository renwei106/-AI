const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4318/?theme=poly');
 await page.evaluate(()=>{prefs.mode='light';apply();document.querySelector('.brand-guide')?.remove()});
 for(const preset of ['mountain','ocean','dunes','fox','deer','portrait']){
   await page.locator('.poly-change').click();await page.locator(`[data-poly-preset=${preset}]`).click();await page.locator('[data-poly-save]').click();
   assert.equal(await page.locator('.home-poly #search-form,.poly-reading,.poly-favorites').count(),0);
   await page.evaluate(()=>document.querySelector('#toast').style.display='none');await page.screenshot({path:`checks/poly-wallpaper-${preset}.png`});
 }
 for(const [w,h] of [[3440,1440],[1920,1080],[1288,1041],[390,844]]){
   await page.setViewportSize({width:w,height:h});
   const size=await page.locator('.poly-art svg').boundingBox();assert.equal(size.width,w);assert.equal(size.height,h);assert.equal(size.x,0);assert.equal(size.y,0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth&&document.documentElement.scrollHeight===innerHeight),'wallpaper does not add scrollbars');
   await page.locator('.poly-change').click();await page.locator('[data-poly-preset=deer]').click();await page.locator('[data-poly-save]').click();
   if(w===390)await page.screenshot({path:'checks/poly-wallpaper-deer-mobile.png'});
 }
 // The previous poly workspace is pixel-identical in each light mode.
 const shots=[];
 for(const baseline of [true,false]){
   const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
   if(baseline)await context.route(/\/poly-theme\.(js|css)$/,r=>{const name=new URL(r.request().url()).pathname.slice(1);return r.fulfill({path:path.resolve('baselines/v188-before-poly-wallpaper',name),contentType:name.endsWith('.js')?'text/javascript':'text/css'});});
   const p=await context.newPage();await p.goto('http://127.0.0.1:4318/?theme=poly',{waitUntil:'networkidle'});const pair=[];
   for(const mode of ['light','dark']){
     await p.evaluate(mode=>{signed=true;prefs.mode=mode;goSpace(data[0].id);scope='global';changeTheme('poly');document.querySelectorAll('.brand-guide,#toast').forEach(e=>e.style.display='none')},mode);
     await p.mouse.move(600,800);await p.waitForFunction(()=>[...document.querySelectorAll('.workspace img')].every(i=>i.complete));pair.push(await p.screenshot({path:'checks/poly-space-isolation-'+baseline+'-'+mode+'.png',animations:'disabled'}));
   }shots.push(pair);await context.close();
 }
 const {PNG}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
 assert(shots[0].every((shot,i)=>{const a=PNG.sync.read(shot),b=PNG.sync.read(shots[1][i]);return a.width===b.width&&a.height===b.height&&a.data.every((v,j)=>Math.abs(v-b.data[j])<=1)}),'poly workspace remains unchanged (one channel level for raster rounding)');assert.deepEqual(errors,[]);
 console.log('PASS: 6 full-bleed wallpapers, 390–3440 px viewports, no extra scrolling, poly workspace unchanged in light/dark');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
