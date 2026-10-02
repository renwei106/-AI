const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const origin=process.env.FOREST_PREVIEW_ORIGIN||'http://127.0.0.1:64559',out=path.join(__dirname,'forest-companion');
fs.mkdirSync(out,{recursive:true});
const results={}, end=5.088005-1/30, center=end/2;
const rights=enabled=>({items:[{id:'base',enabled:true,memberOnly:false,allowed:true},{id:'forestCompanion',enabled,memberOnly:false,allowed:enabled}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}});
async function fixture(context,{enabled=true}={}){
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  await context.route('**/api/shiyu/auth/wechat/qr**',route=>route.fulfill({json:{}}));
  // Entitlement fixture is confined to this browser; no account or plan changes.
  await context.route('**/api/shiyu/theme-access**',route=>route.fulfill({json:rights(enabled)}));
  await context.addInitScript(()=>{if(!sessionStorage.getItem('forest-fixture-seeded')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'forestCompanion',mode:'light',brandGuideDismissed:true},signed:false}));sessionStorage.setItem('forest-fixture-seeded','1')}});
}
async function load(context){const page=await context.newPage();await page.goto(origin,{waitUntil:'domcontentloaded'});await page.waitForSelector('.home-forestCompanion');return page}
async function settled(page,time){await page.waitForFunction(t=>{const v=document.querySelector('.forest-video');return v&&!v.seeking&&Math.abs(v.currentTime-t)<.035},time)}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}});await fixture(context);
  const page=await load(context),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.waitForSelector('.forest-video.is-ready');await settled(page,center);
  const flags=await page.locator('video.forest-video').evaluate(v=>({paused:v.paused,muted:v.muted,inline:v.playsInline,autoplay:v.autoplay,loop:v.loop,controls:v.controls,preload:v.preload}));
  assert.deepEqual(flags,{paused:true,muted:true,inline:true,autoplay:false,loop:false,controls:false,preload:'auto'});results.flags=flags;
  await page.screenshot({path:path.join(out,'desktop-center-light.png')});
  await page.mouse.move(0,450);await settled(page,end);await page.screenshot({path:path.join(out,'desktop-left.png')});
  await page.mouse.move(1439,450);await settled(page,0);await page.screenshot({path:path.join(out,'desktop-right.png')});
  const stopped=await page.locator('video.forest-video').evaluate(v=>v.currentTime);await page.waitForTimeout(300);assert.equal(await page.locator('video.forest-video').evaluate(v=>v.currentTime),stopped);
  await page.evaluate(()=>{window.__forestSeeks=[];const v=document.querySelector('.forest-video');v.addEventListener('seeking',()=>window.__forestSeeks.push(v.currentTime));for(let i=0;i<500;i++)window.dispatchEvent(new MouseEvent('mousemove',{clientX:i%2?0:1440}));window.dispatchEvent(new MouseEvent('mousemove',{clientX:720}))});
  await settled(page,center);results.burstSeeks=await page.evaluate(()=>window.__forestSeeks.length);assert(results.burstSeeks<10);
  await page.setViewportSize({width:1200,height:800});await settled(page,end*.4); // last x=720 -> 60%
  await page.mouse.move(600,400);await settled(page,center);
  await page.evaluate(()=>{document.querySelector('.home-forestCompanion').style.transform='translateY(200vh)'});await page.waitForTimeout(150);
  await page.mouse.move(0,400);await page.waitForTimeout(150);assert(Math.abs(await page.locator('video.forest-video').evaluate(v=>v.currentTime)-center)<.001);
  await page.evaluate(()=>{document.querySelector('.home-forestCompanion').style.transform=''});await settled(page,end);results.viewportSuspension=true;
  await page.evaluate(()=>{window.__testHidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__testHidden});document.dispatchEvent(new Event('visibilitychange'))});await page.mouse.move(1199,400);await page.waitForTimeout(150);assert(Math.abs(await page.locator('video.forest-video').evaluate(v=>v.currentTime)-end)<.001);
  await page.evaluate(()=>{window.__testHidden=false;document.dispatchEvent(new Event('visibilitychange'))});await settled(page,0);results.visibilitySuspension=true;
  await page.setViewportSize({width:1440,height:900});await page.mouse.move(720,450);await settled(page,center);
  await page.evaluate(()=>{prefs.mode='dark';render()});await page.waitForSelector('.forest-video.is-ready');await page.screenshot({path:path.join(out,'desktop-center-dark.png')});
  // No inline search on this theme; use the unchanged shared bottom-right entry.
  assert.equal(await page.locator('.home-forestCompanion input:not([type=file]),.home-forestCompanion .search-tabs').count(),0);
  await page.locator('.utility-search button').click();await page.waitForSelector('#quick-search[open]');await page.locator('#quick-search [data-search="saved"]').click();await page.locator('#quick-search #search-input').fill('Notion');await page.waitForSelector('#quick-search #search-results .result');
  assert(await page.locator('#quick-search #search-results').innerText().then(t=>t.includes('Notion')));await page.locator('#quick-search [aria-label="关闭搜索"]').click();results.sharedCornerSearch=true;
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.home-forestCompanion').dataset.forestState==='static');
  assert.equal(await page.locator('.forest-video').getAttribute('src'),null);await page.screenshot({path:path.join(out,'reduced-motion.png')});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForSelector('.forest-video.is-ready');
  await page.evaluate(()=>{window.__oldForestVideo=document.querySelector('.forest-video');prefs.theme='base';prefs.mode='light';render()});
  assert.equal(await page.locator('.forest-video').count(),0);assert.equal(await page.evaluate(()=>window.__oldForestVideo.hasAttribute('src')),false);
  await page.screenshot({path:path.join(out,'base-after.png')});results.cleanup=true;
  await page.evaluate(()=>changeTheme('forestCompanion'));await page.waitForSelector('.forest-video.is-ready');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yiyu-prototype-v1')).prefs.theme),'forestCompanion');await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('.forest-video.is-ready');results.savedSelection=true;
  assert.deepEqual(errors,[]);await context.close();
  for(const mode of ['light','dark']){
    const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await fixture(mobile);let requests=0;mobile.on('request',r=>{if(r.url().endsWith('/forest.mp4'))requests++});const m=await load(mobile);await m.evaluate(mode=>{prefs.mode=mode;render()},mode);await m.waitForTimeout(250);
    assert.equal(await m.locator('.forest-video').getAttribute('src'),null);assert.equal(requests,0);assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await m.screenshot({path:path.join(out,'mobile-'+mode+'.png')});await mobile.close();
  }results.mobileStatic=true;
  const delayed=await browser.newContext({viewport:{width:1440,height:900}});await fixture(delayed);await delayed.route('**/api/shiyu/forest-assets/forest.mp4',async r=>{await new Promise(resolve=>setTimeout(resolve,1000));await r.continue().catch(()=>{})});const slow=await load(delayed);await slow.mouse.move(0,450);assert.equal(await slow.locator('.forest-video.is-ready').count(),0);await slow.waitForSelector('.forest-video.is-ready');await settled(slow,end);await delayed.close();results.delayedMetadata=true;
  const broken=await browser.newContext({viewport:{width:1440,height:900}});await fixture(broken);await broken.route('**/api/shiyu/forest-assets/forest.mp4',r=>r.abort());const brokenPage=await load(broken);await brokenPage.waitForFunction(()=>document.querySelector('.home-forestCompanion').dataset.forestState==='fallback');assert(await brokenPage.locator('.forest-poster').evaluate(i=>i.complete&&i.naturalWidth>0));await broken.close();results.failurePoster=true;
  const disabled=await browser.newContext();await fixture(disabled,{enabled:false});const d=await disabled.newPage();await d.goto(origin,{waitUntil:'domcontentloaded'});await d.waitForFunction(()=>document.body.dataset.theme==='base');assert.equal(await d.locator('[data-brand-theme="forestCompanion"]').count(),0);assert.equal(await d.locator('.forest-video').count(),0);await disabled.close();results.backendDisable=true;
  const source=await fetch(origin+'/api/shiyu/themes').then(r=>r.json());assert.equal(source.items.find(t=>t.id==='forestCompanion').enabled,true);results.realCatalog=true;
  const range=await fetch(origin+'/assets/forest-companion/look.mp4',{headers:{Range:'bytes=100-199'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,100);const invalid=await fetch(origin+'/assets/forest-companion/look.mp4',{headers:{Range:'bytes=99999999-'}});assert.equal(invalid.status,416);results.byteRanges=true;
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(results);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
