/* Only local pages and mocked APIs; no production content is read or changed. */
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=path.join(__dirname,'paper-pet-offline'),base=process.env.SHIYU_PREVIEW_URL;
const healthy=()=>{const img=document.querySelector('#desktop-pet .pet-girl-cutout');return img&&!img.hidden&&img.complete&&img.naturalWidth>0;};
async function newspaper(browser){
 const f=await fixture(browser),p=f.page;
 await f.context.route('**/api/shiyu/auth/newspaper',route=>route.fulfill({json:{userId:'pet-local-check',newspaper:{cover:{},edition:{}}}}));
 const results=[];
 for(const mode of ['light','dark'])for(const size of [{width:1440,height:900},{width:1366,height:768},{width:1920,height:1080},{width:390,height:844}]){
  await p.setViewportSize(size);await p.evaluate(mode=>{prefs.mode=mode;prefs.theme='paper';render()},mode);
  await p.locator('.edition-cover').click({position:{x:100,y:160}});
  for(let edition=0;edition<3;edition++){
   await p.waitForFunction(n=>document.querySelector('.newspaper')?.dataset.edition===String(n),edition);
   const metrics=await p.evaluate(()=>{
    const paper=document.querySelector('.newspaper'),r=paper.getBoundingClientRect(),content=paper.querySelector('.edition-content'),nav=paper.querySelector('.edition-nav'),n=nav.getBoundingClientRect();
    return {x:r.x,y:r.y,width:r.width,height:r.height,screenWidth:innerWidth,screenHeight:innerHeight,navBottom:n.bottom,navTop:n.top,overflowX:content.scrollWidth-content.clientWidth,scroll:content.scrollHeight-content.clientHeight,bodyOverflow:document.documentElement.scrollWidth-innerWidth,head:document.querySelector('body>header').getBoundingClientRect().bottom};
   });
   assert.equal(metrics.x,0);assert.equal(metrics.y,0);assert.equal(metrics.width,size.width);assert.equal(metrics.height,size.height);
   assert(metrics.navBottom<=size.height-30);assert(metrics.navTop>metrics.head);assert(metrics.overflowX<=2,JSON.stringify(metrics));assert(metrics.bodyOverflow<=1);
   assert.equal(await p.locator('.newspaper>.edition-nav').count(),1);
   await p.screenshot({path:path.join(out,`${mode}-${size.width}-${edition+1}.png`)});
   results.push({mode,...size,edition,...metrics});
   if(edition<2)await p.locator('[data-edition-next]').click();
  }
  await p.locator('[data-edition-front]').click();await p.waitForFunction(()=>document.querySelector('.newspaper').dataset.edition==='0');
  await p.locator('[data-edition-prev]').isDisabled().then(v=>assert(v));
  await p.locator('[data-edition-back]').click();assert(await p.locator('.edition-cover').isVisible());
 }
 await p.setViewportSize({width:1440,height:900});
 await p.locator('.edition-cover').click({position:{x:100,y:160}});
 await p.locator('.newspaper [data-paper-edit]').click();await p.locator('.newspaper.paper-editing').waitFor();
 await p.locator('[data-edition-next]').click();assert.equal(await p.locator('.newspaper').getAttribute('data-edition'),'0');
 await p.locator('[data-paper-cancel]').click();assert.equal(await p.locator('.paper-editing').count(),0);
 await p.locator('[data-edition-next]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.newspaper').getAttribute('data-edition'),'1');
 await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('.newspaper').getAttribute('data-edition'),'0');
 assert.deepEqual(f.errors,[]);fs.writeFileSync(path.join(out,'layout-results.json'),JSON.stringify(results,null,2));
 await f.context.close();console.log('PASS newspaper: 24 full-bleed layouts, navigation, keyboard and local editing');
}
async function pet(browser){
 const f=await fixture(browser,true,false,false),p=f.page;
 await p.clock.install();
 await p.waitForFunction(healthy);
 await p.waitForFunction(async()=>{const cache=await caches.open('shiyu-desktop-pet-frames-v1');return (await cache.keys()).filter(r=>r.url.includes('pet-girl-frame')).length===32});
 await p.locator('#desktop-pet .pet-character').click();await p.locator('#desktop-pet [data-pet-action="settings"]').click();
 await p.waitForFunction(()=>{const image=document.querySelector('[data-pet-pref="skin"][data-value="swordswoman"] img');return image&&!image.hidden&&image.naturalWidth>0});
 await p.locator('[data-pet-pref="skin"][data-value="swordswoman"]').click();
 await p.locator('[data-pet-pref="roaming"][data-value="roam"]').click();
 await p.locator('#settings .dialog-heading [data-action="close"]').click();await p.mouse.move(15,15);
 await p.waitForFunction(healthy);
 await p.waitForFunction(async()=>{const cache=await caches.open('shiyu-desktop-pet-frames-v1');return (await cache.keys()).length===60});
 await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));await p.clock.runFor(60000);
 for(let i=0;i<100&&(await p.locator('#desktop-pet').getAttribute('data-roam-phase'))==='idle';i++)await p.clock.runFor(50);
 assert.notEqual(await p.locator('#desktop-pet').getAttribute('data-roam-phase'),'idle','interrupt an actual roaming movement');
 await f.context.setOffline(true);await p.clock.runFor(100);
 const stopped=await p.locator('#desktop-pet').boundingBox();
 assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'false');assert.equal(await p.locator('#desktop-pet').getAttribute('data-roam-phase'),'idle');
 assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().roaming),'roam','offline does not overwrite preference');
 await p.clock.runFor(90000);assert.deepEqual(await p.locator('#desktop-pet').boundingBox(),stopped);assert(await p.evaluate(healthy));
 let offlineFrames=0;p.on('request',r=>{if(/pet-(girl|swordswoman)-frame/.test(r.url()))offlineFrames++});
 for(const theme of ['base','paper','music','cinema','cosmos','globe','flip','rain','poly','flow']){
  await p.evaluate(theme=>{prefs.theme=theme;render()},theme);await p.clock.runFor(150);
  assert(await p.evaluate(healthy),theme);assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'false',theme);
 }
 assert.equal(offlineFrames,0,'theme changes offline never request image frames');
 await f.context.setOffline(false);await p.clock.runFor(200);assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'true');
 await p.clock.resume();assert.deepEqual(f.errors,[]);await f.context.close();
 console.log('PASS pet: both sprite caches, settings previews, interrupted roam, ten themes offline and reconnection');
}
async function cacheRecovery(browser){
 const context=await browser.newContext({viewport:{width:900,height:700}}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 const html='<html><body><div id="settings"></div><script src="/desktop-pet.js"></script><script>window.pet=ShiyuDesktopPet.mount({accountKey:()=>"offline-fixture",context:()=>({area:"home"}),authorize:async()=>true});pet.bindSettings(document.querySelector("#settings"));</script></body></html>';
 await context.route('**/__pet-cache-test',r=>r.fulfill({contentType:'text/html',body:html}));
 await context.route('**/desktop-pet.js',r=>r.fulfill({path:path.join(__dirname,'../dist/desktop-pet.js'),contentType:'text/javascript'}));
 await p.goto(base+'__pet-cache-test');await p.waitForFunction(healthy);
 await p.waitForFunction(async()=>{const c=await caches.open('shiyu-desktop-pet-frames-v1');return (await c.keys()).filter(r=>r.url.includes('pet-girl-frame')).length===32});
 await context.setOffline(true);await p.waitForTimeout(200);const requests=[];
 p.on('request',r=>{if(/pet-(girl|swordswoman)-frame/.test(r.url()))requests.push(r.url())});
 await p.reload();await p.waitForFunction(healthy);assert.deepEqual(requests,[],'new page restores images directly from persistent cache offline');
 assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'false');
 await context.setOffline(false);await p.evaluate(async()=>{await caches.delete('shiyu-desktop-pet-frames-v1')});
 await context.route('**/assets/site-icons/pet-*-frame-*.png',r=>r.abort());
 await p.reload();await p.waitForTimeout(500);assert.equal(await p.locator('#desktop-pet [data-pet-frame-fallback]').count(),1);assert.equal(await p.locator('#desktop-pet img:not([hidden])').count(),0,'failed loads never replace the fallback with a broken image');
 await context.unroute('**/assets/site-icons/pet-*-frame-*.png');await p.evaluate(()=>dispatchEvent(new Event('online')));await p.waitForFunction(healthy);
 await context.route('**/assets/site-icons/pet-girl-frame-1.png',r=>r.fulfill({contentType:'image/png',body:'invalid-image'}));
 await p.evaluate(async()=>{await caches.delete('shiyu-desktop-pet-frames-v1')});
 await context.addInitScript(()=>{Object.defineProperty(window,'caches',{value:{open:async()=>{throw Error('storage unavailable')}}})});
 await p.reload();await p.waitForFunction(healthy);await p.waitForTimeout(1200);assert(await p.evaluate(healthy),'storage errors and an invalid frame leave a decoded frame on screen');
 assert.deepEqual(errors,[]);await context.close();console.log('PASS pet: persistent offline reload, unavailable assets, recovery, denied cache and invalid frame');
}
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{const section=process.argv[2];if(!section||section==='paper')await newspaper(browser);if(!section||section==='pet')await pet(browser);if(!section||section==='cache')await cacheRecovery(browser)}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
