/* Character regression uses only the same intercepted local APIs as the pet suite. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {fixture,out,base}=require('./verify-desktop-pet.cjs');
const pet=p=>p.locator('#desktop-pet');const core=p=>pet(p).locator('.pet-character');
async function configure(p,patch){await p.evaluate(patch=>{const value={...ShiyuDesktopPet.read(),...patch,updated:Date.now()+20};localStorage.setItem('shiyu-desktop-pet-v1',JSON.stringify(value));window.dispatchEvent(new StorageEvent('storage',{key:'shiyu-desktop-pet-v1'}));},patch);}
async function settings(p){await core(p).click();await p.locator('#desktop-pet [data-pet-action="settings"]').click();await p.locator('#settings[open] .pet-preferences').waitFor();}
async function closeSettings(p){await p.locator('#settings .dialog-heading [data-action="close"]').click();await core(p).waitFor();await p.mouse.move(600,400);}
async function idleExcursion(p,skin){return p.evaluate(skin=>{
 const root=document.querySelector('#desktop-pet');root.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=0});
 const head=root.querySelector('.pet-human-head-nod'),feet=root.querySelector('.pet-human-feet'),a=root.querySelector('.pet-human-balance').getAnimations()[0];
 const point=()=>{const p=new DOMPoint(skin==='paper'?512:48,skin==='paper'?160:22).matrixTransform(head.getScreenCTM());return {x:p.x,y:p.y};};
 const first=point(),feetBefore=feet.getBoundingClientRect().toJSON();a.currentTime=a.effect.getTiming().duration/2;
 return {distance:Math.abs(point().x-first.x),feetBefore,feetAfter:feet.getBoundingClientRect().toJSON()};
 },skin);}
function oldArtworkUnchanged(){
 const before=path.join(out,'human-baseline/desktop-pet.js');if(!fs.existsSync(before))return;
 const getArt=file=>{const w={};vm.runInNewContext(fs.readFileSync(file,'utf8'),{window:w,document:{currentScript:{src:base+'desktop-pet.js'},cookie:''},location:{href:base},URL,localStorage:{getItem:()=>null}});return w.ShiyuDesktopPet.art;};
 const original=getArt(before),current=getArt(path.join(__dirname,'../dist/desktop-pet.js'));
 for(const skin of ['cat','bird','sprout'])assert.equal(current(skin),original(skin),`${skin} artwork stays byte-for-byte unchanged`);
}
(async()=>{
 oldArtworkUnchanged();fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({channel:'msedge',headless:true,args:['--disable-lcd-text']});
 try{
  const f=await fixture(b),p=f.page;await p.emulateMedia({reducedMotion:'no-preference'});
  await configure(p,{position:{x:1180,y:765,width:1440,height:960}});
  const anchor=await pet(p).boundingBox();const main=await p.locator('#main').boundingBox();
  for(const skin of ['line','paper']){
   await settings(p);assert.equal(await p.locator('[data-pet-pref="skin"]').count(),5);
   await p.locator(`[data-pet-pref="skin"][data-value="${skin}"]`).click();await p.waitForFunction(s=>ShiyuDesktopPet.read().skin===s,skin);
   await p.screenshot({path:path.join(out,`human-settings-${skin}.png`)});await closeSettings(p);
   assert.deepEqual(await pet(p).boundingBox(),anchor,'changing the figure keeps the saved anchor');
   const normal=await idleExcursion(p,skin);assert(normal.distance>=3&&normal.distance<=7,`${skin} normal sway is perceptible: ${normal.distance}`);assert.deepEqual(normal.feetBefore,normal.feetAfter,'feet stay planted');
   await p.screenshot({path:path.join(out,`human-home-${skin}-light.png`)});
   await configure(p,{motion:'gentle'});const gentle=await idleExcursion(p,skin);assert(gentle.distance>0&&gentle.distance<normal.distance,`${skin} gentle reduces amplitude`);
   await configure(p,{motion:'off'});assert.equal(await pet(p).evaluate(n=>n.getAnimations({subtree:true}).length),0);
   await core(p).hover();await p.waitForTimeout(200);assert.equal(await pet(p).evaluate(n=>n.querySelector('.pet-human').getAnimations({subtree:true}).length),0,'off also disables hover gestures');await p.mouse.click(600,400);
   await configure(p,{motion:'normal'});await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await pet(p).evaluate(n=>n.getAnimations({subtree:true}).length),0,'system reduced motion stops all gestures');
   await p.evaluate(()=>{prefs.theme='music';prefs.mode='dark';render()});await p.waitForFunction(()=>document.body.dataset.dark==='true');
   await p.screenshot({path:path.join(out,`human-home-${skin}-dark.png`)});
   if(skin==='line')assert.equal(await pet(p).locator('.pet-human-line').evaluate(n=>getComputedStyle(n).stroke),'rgb(243, 238, 223)');
   await p.reload({waitUntil:'networkidle'});await core(p).waitFor();assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().skin),skin);assert.deepEqual(await pet(p).boundingBox(),anchor);
   await p.evaluate(()=>{prefs.theme='base';prefs.mode='light';render()});await p.emulateMedia({reducedMotion:'no-preference'});
   await core(p).hover();await p.waitForTimeout(400);assert(await pet(p).locator('.pet-human-arm-wave').evaluate(n=>n.getAnimations().length>0),'hover greets once');await p.mouse.click(600,400);
   await configure(p,{position:{x:48,y:48,width:1440,height:960}});await core(p).click();assert.equal(await pet(p).getAttribute('data-compact'),'false','new figures retain the corner fan');
   await p.waitForTimeout(650);await p.screenshot({path:path.join(out,`human-corner-${skin}.png`)});await p.mouse.click(600,400);
   await configure(p,{position:{x:1180,y:765,width:1440,height:960}});
   const r=await core(p).boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.waitForTimeout(300);await p.mouse.move(1100,720,{steps:5});assert.equal(await pet(p).getAttribute('data-open'),'false');assert.equal(await pet(p).getAttribute('data-dragging'),'true');await p.mouse.up();await p.waitForTimeout(450);
   assert.deepEqual(await p.locator('#main').boundingBox(),main,'dragging leaves the homepage untouched');
   assert.equal((await p.evaluate(()=>ShiyuDesktopPet.read())).position.x,1100);
   await configure(p,{position:{x:1180,y:765,width:1440,height:960}});
  }
  const image=await p.request.get(new URL('assets/desktop-pet/paper-person.webp',base).href);assert.equal(image.status(),200);assert.match(image.headers()['content-type'],/image\/webp/);
  // The portable frontend must resolve its own copy, including after a refresh.
  const tool=await f.context.newPage();await tool.goto('http://127.0.0.1:4173/#home',{waitUntil:'networkidle'});await core(tool).waitFor();assert.equal(await tool.evaluate(()=>ShiyuDesktopPet.read().skin),'paper');
  const url=await pet(tool).locator('image').first().getAttribute('href');assert.equal(new URL(url).origin,'http://127.0.0.1:4173');const asset=await tool.request.get(url);assert.equal(asset.status(),200);assert.equal((await asset.body()).subarray(8,12).toString(),'WEBP');
  assert.equal(await tool.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();return img.naturalWidth;},url),1024,'the independent browser decodes the actual image');
  await tool.screenshot({path:path.join(out,'human-paper-independent-app.png')});await tool.close();
  await p.setViewportSize({width:390,height:844});await settings(p);await p.screenshot({path:path.join(out,'human-settings-mobile.png')});
  assert(await p.locator('[data-pet-pref="skin"][data-value="paper"]').isVisible());
  // Opening the panel earlier must not authorize later writes after session expiry.
  f.authenticated=false;await p.locator('[data-pet-pref="skin"][data-value="line"]').click();await p.locator('#login[open]').waitFor();assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().skin),'paper');
  assert.deepEqual(f.errors,[]);await f.context.close();
  console.log('PASS two human skins, stationary feet and perceptible idle motion, motion settings, light/dark, persistence, dragging, corner fan, independent assets, mobile and fresh session checks; original figures unchanged');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
