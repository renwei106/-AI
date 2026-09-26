const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('.local/home-semicircle-20260926/selection');fs.mkdirSync(out,{recursive:true});
const frame=p=>p.frameLocator('#corner-orbit-demo');
async function open(p){await p.mouse.move(30,180);await p.waitForTimeout(200);const r=await frame(p).locator('.core').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2,{steps:5});await frame(p).locator('.stage.is-filled').waitFor();await p.waitForTimeout(750);}
async function snapshot(p){return frame(p).locator('.stage').evaluate(stage=>{const s=stage.getBoundingClientRect(),item=stage.querySelector('.menu-item.is-selected'),r=item.getBoundingClientRect(),css=getComputedStyle(item);return {id:item.dataset.shiyuModuleIcon,selected:stage.querySelectorAll('.menu-item.is-selected').length,x:r.x+r.width/2-s.x-s.width/2,y:r.y+r.height/2-s.y-s.height/2,background:css.backgroundColor,color:getComputedStyle(item.querySelector('span')).color,other:[...stage.querySelectorAll('.menu-item:not([hidden]):not(.is-selected)')].map(el=>getComputedStyle(el).backgroundColor)}});}
async function setup(b,reducedMotion='no-preference'){
 const p=await b.newPage({viewport:{width:1440,height:960},reducedMotion});p.setDefaultTimeout(10000);
 await p.route('**/api/shiyu/**',r=>r.fulfill({status:200,json:r.request().url().endsWith('/operations')?{corner:{modules:['common','memo','todo'].map(id=>({id,enabled:true}))}}:{}}));
 await p.goto('http://127.0.0.1:4336/',{waitUntil:'domcontentloaded'});await p.evaluate(()=>{prefs.theme='base';prefs.mode='light';prefs.brandGuideDismissed=true;render()});await p.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');await open(p);return p;
}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const errors=[];b.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));try{
 const p=await setup(b);let state=await snapshot(p);assert.equal(state.id,'common-line');assert.equal(state.selected,1);assert(Math.abs(state.x)<1&&state.y<-90);assert(state.other.every(bg=>bg!==state.background));
 await p.screenshot({path:path.join(out,'selected-light.png')});
 await p.mouse.wheel(0,120);await p.waitForTimeout(550);state=await snapshot(p);assert.equal(state.id,'memo-line');assert.equal(state.selected,1);assert(Math.abs(state.x)<1&&state.y<-90);assert.equal(await p.locator('#my-corner[open]').count(),0,'wheel selects without opening');
 await p.mouse.wheel(0,-120);await p.waitForTimeout(550);
 await p.evaluate(()=>{
   signed=true;prefs.accountProfile={id:'selection-qa'};window.__activation=null;
   const observer=new MutationObserver(()=>{const dialog=document.querySelector('#my-corner[open]');if(!dialog)return;const doc=document.querySelector('#corner-orbit-demo').contentDocument,stage=doc.querySelector('.stage').getBoundingClientRect(),item=doc.querySelector('.is-selected'),rect=item.getBoundingClientRect();window.__activation={module:dialog.dataset.cornerModule,id:item.dataset.shiyuModuleIcon,x:rect.x+rect.width/2-stage.x-stage.width/2,y:rect.y+rect.height/2-stage.y-stage.height/2};observer.disconnect()});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
 });
 const todo=frame(p).locator('[data-shiyu-module-icon="todo-line"]'),r=await todo.boundingBox();await p.mouse.click(r.x+r.width/2,r.y+r.height/2);await p.waitForTimeout(100);
 assert.equal(await p.locator('#my-corner[open]').count(),0,'side click waits for travel');
 await frame(p).locator('.stage').dispatchEvent('wheel',{deltaY:120});await frame(p).locator('[data-shiyu-module-icon="common-line"]').dispatchEvent('click');
 assert.equal((await snapshot(p)).id,'todo-line','pending activation keeps its clicked target');
 await p.waitForSelector('#my-corner[open][data-corner-module="todo"]');const activated=await p.evaluate(()=>__activation);assert.equal(activated.module,'todo');assert.equal(activated.id,'todo-line');assert(Math.abs(activated.x)<1&&activated.y<-90,'module opens after selected item arrives above center');
 await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#my-corner').open);await open(p);assert.equal((await snapshot(p)).id,'todo-line');
 console.log('PASS side click arrives before module activation');
 await p.evaluate(()=>signed=true);const core=await frame(p).locator('.core-hit').boundingBox();await p.mouse.click(core.x+core.width/2,core.y+core.height/2);await p.waitForSelector('#my-corner[open][data-corner-module="todo"]');await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#my-corner').open);
 await p.evaluate(()=>signed=false);await open(p);const common=await frame(p).locator('[data-shiyu-module-icon="common-line"]').boundingBox();await p.mouse.click(common.x+common.width/2,common.y+common.height/2);await p.waitForSelector('#login[open]');assert.equal(await p.locator('#my-corner[open]').count(),0);assert.equal((await snapshot(p)).id,'common-line');await p.evaluate(()=>document.querySelector('#login').close());
 console.log('PASS fixed top selection, strong highlight, wheel selects only, clicked item arrives before opening, repeated input retains target, core opens selected module and guest login is preserved');
 for(const [mode,color,name] of [['dark','#ad704b','dark'],['light','#ffffff','white-accent']]){
   await p.mouse.move(30,180);await p.evaluate(({mode,color})=>{prefs.mode=mode;prefs.explicitColor=color;prefs.color=color;apply()},{mode,color});await open(p);state=await snapshot(p);assert.notEqual(state.background,state.color);assert(state.other.every(bg=>bg!==state.background));await p.screenshot({path:path.join(out,'selected-'+name+'.png')});
 }
 await p.setViewportSize({width:390,height:844});await open(p);const box=await frame(p).locator('.is-selected').boundingBox();assert(box.x>=0&&box.x+box.width<=390&&box.y>=0);await p.screenshot({path:path.join(out,'selected-mobile.png')});await p.close();
 const reduced=await setup(b,'reduce');await reduced.evaluate(()=>{signed=true;prefs.accountProfile={id:'selection-qa'}});await frame(reduced).locator('[data-shiyu-module-icon="todo-line"]').click();await reduced.waitForSelector('#my-corner[open][data-corner-module="todo"]');await reduced.close();
 assert.deepEqual(errors,[]);console.log('PASS dark/light/white accent contrast, mobile bounds, reduced motion and no browser errors');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
