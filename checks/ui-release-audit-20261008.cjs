const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {fixture}=require('./verify-desktop-pet.cjs');
const out='checks/ui-release-audit-20261008';
function colorHex(color){const srgb=color.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/),rgb=color.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);assert(srgb||rgb,'unexpected computed CSS color '+color);return '#'+(srgb?srgb.slice(1,4).map(v=>Math.round(Number(v)*255)):rgb.slice(1,4).map(Number)).map(v=>v.toString(16).padStart(2,'0')).join('');}
function matchesSurface(s){assert.equal(s.meta,colorHex(s.bg==='rgba(0, 0, 0, 0)'?s.rootColor:s.bg));}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const newContext=browser.newContext.bind(browser);
 browser.newContext=async options=>{const context=await newContext(options);const newPage=context.newPage.bind(context);context.newPage=async()=>{const page=await newPage();for(const method of ['goto','reload']){const fn=page[method].bind(page);page[method]=method==='goto'?(url,options={})=>fn(url,{...options,waitUntil:'commit'}):(options={})=>fn({...options,waitUntil:'commit'});}return page;};return context;};
 try{
  const f=await fixture(browser),p=f.page,results=[];
  const snap=async(label,selector='body')=>{
   await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const value=await p.evaluate(selector=>{const probe=document.createElement('i');probe.style.backgroundColor=getComputedStyle(document.querySelector(selector)).getPropertyValue('--bg').trim();document.body.append(probe);const rootColor=getComputedStyle(probe).backgroundColor;probe.remove();return {meta:document.querySelector('meta[name="theme-color"]')?.content,bg:getComputedStyle(document.querySelector(selector)).backgroundColor,body:getComputedStyle(document.body).backgroundColor,rootColor,theme:document.body.dataset.theme,mode:document.body.dataset.dark}},selector);
   results.push({label,...value});console.log(label,JSON.stringify(value));return value;
  };
  for(const theme of ['base','globe','music'])for(const mode of ['light','dark']){
   await p.evaluate(({theme,mode})=>{prefs.theme=theme;prefs.mode=mode;view='home';render();},{theme,mode});
   const s=await snap('home '+theme+' '+mode);matchesSurface(s);
  }
  await p.evaluate(()=>{prefs.theme='base';prefs.mode='dark';goSpace('work');});
  let s=await snap('space dark');matchesSurface(s);
  await p.evaluate(()=>{transitionUntil=0;changeView('home');window.ShiyuWorld.resume();});
  await p.waitForFunction(()=>document.body.classList.contains('world-active'));
  s=await snap('world dark','#world-page');matchesSurface(s);
  await p.evaluate(()=>openMemberCenter());
  s=await snap('membership from world','#member-center');matchesSurface(s);
  await p.evaluate(()=>document.querySelector('#member-center').close());
  s=await snap('world after membership close','#world-page');matchesSurface(s);
  await p.evaluate(()=>window.ShiyuWorld.leaveForPet());
  s=await snap('home after world close');matchesSurface(s);
  await p.evaluate(()=>{prefs.explicitColor='#8755c7';});
  for(const id of ['toolbox','common','memo','todo']){
   await p.evaluate(id=>window.ShiyuCorner.openModule(id,document.querySelector('.pet-character')),id);
   await p.waitForSelector('#my-corner[open]');
   matchesSurface(await snap(id,'#my-corner'));
   console.log('corner surface',id,JSON.stringify(await p.evaluate(()=>{const d=document.querySelector('#my-corner'),s=d.querySelector('.corner-fullscreen-shell');return {dialogBg:getComputedStyle(d).backgroundColor,dialogVar:getComputedStyle(d).getPropertyValue('--bg'),shellBg:getComputedStyle(s).backgroundColor,backdropBg:getComputedStyle(d,'::backdrop').backgroundColor,shellVar:getComputedStyle(s).getPropertyValue('--bg')};})));
   if(id==='toolbox')await p.screenshot({path:out+'/toolbox-dark.png'});
   if(id==='common'){await p.evaluate(()=>openMemberCenter());matchesSurface(await snap('membership from common','#member-center'));await p.evaluate(()=>document.querySelector('#member-center').close());matchesSurface(await snap('common after membership close','#my-corner'));}
   await p.evaluate(()=>document.querySelector('#my-corner').close());
   matchesSurface(await snap('home after '+id));
  }
  await p.goto('http://127.0.0.1:4318/extension/start.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>!document.documentElement.classList.contains('font-pending'));
  s=await snap('quick-start dark');assert.equal(s.meta,s.bg);
  await p.locator('#copy-homepage').click();await p.waitForTimeout(1100);
  const geometry=await p.evaluate(()=>[...document.querySelectorAll('.quick-start-card')].map(card=>{
   const box=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
   return {title:box(card.querySelector('h2')),screen:box(card.querySelector('.visual-screen,.visual-browser')),button:box(card.querySelector('.primary')),guide:box(card.querySelector('.browser-guide')),fallback:card.querySelector('.homepage-fallback')?box(card.querySelector('.homepage-fallback')):null,status:box(card.querySelector('.quick-start-status'))};
  }));
  console.log('quick-start geometry',JSON.stringify(geometry));
  for(const g of geometry){assert(Math.abs(g.title.y-g.screen.y)<=1);assert(Math.abs(g.button.bottom-g.screen.bottom)<=1);assert(g.guide.bottom<=g.button.y);if(g.fallback)assert(g.fallback.bottom<=g.status.y);}
  await p.screenshot({path:out+'/quick-start-copy-desktop.png',fullPage:true});
  await p.evaluate(()=>scrollTo(0,800));assert.equal(await p.locator('.site-header').evaluate(n=>Math.round(n.getBoundingClientRect().top)),0);
  await p.reload({waitUntil:'networkidle'});assert.equal(await p.evaluate(()=>scrollY),0);
  await p.waitForFunction(()=>!document.documentElement.classList.contains('font-pending'));
  await p.setViewportSize({width:390,height:844});await p.locator('#copy-homepage').click();await p.waitForTimeout(1100);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:out+'/quick-start-copy-mobile.png',fullPage:true});
  await p.setViewportSize({width:1450,height:1014});await p.goto('http://127.0.0.1:4318/extension/',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>!document.documentElement.classList.contains('font-pending'));
  s=await snap('extension dark');assert.equal(s.meta,s.bg);
  await p.evaluate(()=>scrollTo(0,800));assert.equal(await p.locator('.site-header').evaluate(n=>Math.round(n.getBoundingClientRect().top)),0);
  await p.reload({waitUntil:'networkidle'});assert.equal(await p.evaluate(()=>scrollY),0);
  const data=await(await p.request.get('http://127.0.0.1:4318/install/manifest.webmanifest')).json();assert.deepEqual(data.icons.map(x=>x.sizes),['192x192','512x512']);
  for(const size of [192,512]){const bytes=fs.readFileSync('dist/install/icon-'+size+'.png');assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[size,size]);assert(data.icons.find(x=>x.sizes===size+'x'+size).src.includes('brand4'));}
  fs.writeFileSync(out+'/results.json',JSON.stringify({results,geometry,errors:f.errors,manifest:data},null,2));
  assert.deepEqual(f.errors,[]);console.log('PASS UI color, alignment, copy fallback, sticky, refresh, PWA icons');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
