const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base='http://127.0.0.1:4330',artifacts='.local/paper-reference/qa';fs.mkdirSync(artifacts,{recursive:true});
async function open(p){await p.waitForFunction(()=>window.ShiyuCornerModules);await p.frameLocator('#corner-orbit-preview').locator('#orbit').evaluate(el=>el._shiyuOpenOrbitModule(1));await p.waitForSelector('#my-corner[open][data-corner-module=memo]');await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));await p.waitForFunction(()=>document.querySelector('canvas[data-paper-count]'));await p.waitForTimeout(750);}
const notes=p=>p.evaluate(()=>structuredClone(prefs.cornerModules['theme-paper-qa'].memo.notes));
async function closeEdit(p){await p.locator('[data-memo-close]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));}
async function discard(p,id){await p.locator('[data-memo-discard]').evaluateAll((els,id)=>els.find(el=>el.dataset.memoDiscard===id).click(),id);await p.waitForFunction(()=>!document.querySelector('.memo-paper-app.is-busy'));}
async function paperHit(p,id){
 const pos=await p.evaluate(id=>__memoScene.paperPosition(id),id);
 for(const [dx,dy]of[[0,0],[0,16],[16,0],[-16,0],[0,-16],[24,24],[-24,24]]){
  const point={x:pos.x+dx,y:pos.y+dy};await p.mouse.move(point.x,point.y);
  if(await p.locator('canvas[data-paper-count]').evaluate(el=>el.style.cursor==='grab'))return point;
 }
 throw Error('No paper surface at '+JSON.stringify(pos));
}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:960}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/api/shiyu/auth/**',r=>r.fulfill({status:r.request().url().includes('/wechat/')?200:503,json:{}}));
 await p.route('**/api/shiyu/operations',r=>r.fulfill({json:{corner:{modules:['common','memo','todo'].map(id=>({id,enabled:true}))}}}));
 // Capture the public scene API in this isolated test page only.
 await p.route('**/assets/memo-paper/engine.js',async r=>{const response=await r.fetch();const source=await response.text();const body=source.replace(/export\{(\w+) as createPaperScene\};/,(_,fn)=>`export async function createPaperScene(...args){const scene=await ${fn}(...args);window.__memoScene=scene;return scene;}`);await r.fulfill({response,body});});
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.ShiyuCornerModules);
 await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'theme-paper-qa'};prefs.mode='light';prefs.theme='base';prefs.brandGuideDismissed=true;localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));persist();render()});await open(p);
 const initial=await notes(p);assert.deepEqual(initial.map(n=>n.number),[4,3,2,1]);assert.equal(await p.locator('[data-memo-position]').innerText(),'共 4 则');assert.match(await p.locator('.memo-cover').last().locator('.memo-cover-foot').innerText(),/01/);
 await p.locator('.is-active [data-memo-card]').click();assert.equal(await p.evaluate(()=>document.activeElement.tagName),'SECTION');await p.keyboard.type('不应自动输入');assert.equal(await p.locator('[data-memo-title]').inputValue(),initial[0].title);await closeEdit(p);
 await p.locator('.is-active [data-memo-color-trigger]').hover();assert.deepEqual(await p.locator('button[data-memo-color]').evaluateAll(els=>els.map(e=>e.dataset.memoColor)),['theme','gray','red','green','orange','blue','purple']);
 const ys=await p.locator('button[data-memo-color]').evaluateAll(els=>els.map(e=>Math.round(e.getBoundingClientRect().y)));assert.equal(new Set(ys).size,1);assert.equal(await p.locator('button[data-memo-color=theme] svg').count(),1);assert.equal(await p.locator('button[data-memo-color=theme]').getAttribute('aria-pressed'),'true');await p.screenshot({path:artifacts+'/theme-paper-palette.png'});
 await p.mouse.move(1250,240);await p.waitForTimeout(200);const bg=await p.locator('.is-active .memo-cover-inner').evaluate(e=>getComputedStyle(e).backgroundColor);await p.locator('[data-corner-cord=color]').click();await p.waitForTimeout(600);assert.notEqual(await p.locator('.is-active .memo-cover-inner').evaluate(e=>getComputedStyle(e).backgroundColor),bg);
 await p.locator('.is-active [data-memo-color-trigger]').hover();await p.locator('button[data-memo-color=red]').click();await p.mouse.move(1250,240);await p.waitForTimeout(300);const red=await p.locator('.is-active').evaluate(e=>e.style.getPropertyValue('--memo-tint'));await p.locator('[data-corner-cord=color]').click();await p.waitForTimeout(600);assert.equal(await p.locator('.is-active').evaluate(e=>e.style.getPropertyValue('--memo-tint')),red);
 await discard(p,initial[0].id);await discard(p,initial[1].id);await discard(p,initial[2].id);
 await p.locator('.corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);await open(p);
 await p.locator('[data-memo-view=trash]').click();await p.mouse.move(1150,350);await p.waitForTimeout(1800);
 const paperIds=initial.slice(0,3).map(n=>n.id),positions=()=>p.evaluate(ids=>ids.map(id=>__memoScene.paperPosition(id)),paperIds),resting=await positions();
 const bounds=await p.locator('.memo-paper-canvas').boundingBox(),tabs=await p.locator('.memo-view-tabs').boundingBox();assert(bounds.y<=tabs.y-64,'render the whole ball above the tabs without cropping it');assert.equal(Math.round(bounds.width),1440);
 for(const [x,y]of[[60,tabs.y+2],[1380,tabs.y+2],[720,690],[1150,350]])await p.mouse.move(x,y,{steps:8});
 (await positions()).forEach((pos,i)=>assert(Math.hypot(pos.x-resting[i].x,pos.y-resting[i].y)<5,'hover does not move any paper'));
 await p.mouse.move(1360,230);await p.mouse.down();await p.waitForTimeout(300);await p.mouse.move(resting[0].x,resting[0].y,{steps:8});await p.waitForTimeout(100);await p.mouse.up();
 (await positions()).forEach((pos,i)=>assert(Math.hypot(pos.x-resting[i].x,pos.y-resting[i].y)<5,'pressing blank space cannot pick up a paper later'));
 assert.equal(await p.locator('.memo-paper-editor').count(),0);
 // Hold a non-first paper, drag it to the upper edge, then release it.
 const heldId=initial[1].id;await paperHit(p,heldId);await p.mouse.down();await p.waitForTimeout(80);
 const earlyPaper=await p.evaluate(id=>__memoScene.paperPosition(id),heldId);assert(Math.hypot(earlyPaper.x-resting[1].x,earlyPaper.y-resting[1].y)<5,'a short press does not drag');
 await p.waitForTimeout(240);await p.mouse.move(1250,tabs.y+12,{steps:20});
 await p.waitForFunction(({id,y})=>{const pos=__memoScene.paperPosition(id);return Math.hypot(pos.x-1250,pos.y-y)<25},{id:heldId,y:tabs.y+12},{timeout:7000});
 await p.screenshot({path:artifacts+'/paper-held-at-tab-height.png'});await p.mouse.up();await p.mouse.move(60,tabs.y+12,{steps:8});await p.waitForTimeout(120);
 const released=await p.evaluate(id=>__memoScene.paperPosition(id),heldId);assert(released.x>700,'after release, mouse movement no longer drags the paper');assert.equal(await p.locator('.memo-paper-editor').count(),0);
 await p.screenshot({path:artifacts+'/colored-folded-titles.png'});
 // A short click still unfolds the paper into a read-only preview.
 const clickPoint=await paperHit(p,initial[0].id);await p.mouse.click(clickPoint.x,clickPoint.y);await p.waitForSelector('.memo-paper-editor.is-preview');assert.equal(await p.locator('.memo-paper-editor input').count(),0);await p.locator('[data-memo-close]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));await p.waitForTimeout(950);
 const card=p.locator('.memo-cover.is-active'),from=await card.boundingBox();await p.locator('[data-memo-view=notes]').click();const animated=await card.evaluate(el=>el.getAnimations().map(a=>a.effect.getKeyframes()));assert(animated.some(frames=>frames[0].transform.includes('matrix')));await card.evaluate(el=>{for(const a of el.getAnimations()){a.pause();a.currentTime=0;}});const early=await card.boundingBox();assert(Math.abs(early.x-from.x)<1&&Math.abs(early.y-from.y)<1,JSON.stringify({from,early}));await card.evaluate(el=>el.getAnimations().forEach(a=>a.play()));await p.waitForTimeout(850);const after=await card.boundingBox();assert(after.width>from.width*2);await p.screenshot({path:artifacts+'/deck-after-stack-return.png'});
 // Sorting and restoring must not renumber existing records.
 await p.locator('.corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);await p.evaluate(()=>{prefs.cornerModules['theme-paper-qa'].memo.notes.reverse();persist()});await open(p);assert.deepEqual((await notes(p)).map(n=>[n.id,n.number]).sort(),initial.map(n=>[n.id,n.number]).sort());
 await p.locator('[data-memo-new]').evaluate(el=>el.click());assert.equal(await p.evaluate(()=>document.activeElement.tagName),'SECTION');await p.locator('[data-memo-title]').fill('第五则小记');await closeEdit(p);let latest=(await notes(p))[0];assert.equal(latest.number,5);assert.equal(latest.color,'theme');assert.equal(await p.locator('[data-memo-position]').innerText(),'共 2 则');
 await p.locator('[data-memo-view=trash]').click();await p.waitForTimeout(850);await p.locator('.memo-paper-access [data-memo-open]').evaluateAll((els,id)=>els.find(el=>el.dataset.memoOpen===id).click(),initial[0].id);await p.waitForSelector('[data-memo-restore]');await p.locator('[data-memo-restore]').click();assert.equal((await notes(p)).find(n=>n.id===initial[0].id).number,4);await p.waitForTimeout(850);
 await p.locator('[data-memo-view=trash]').click();await p.locator('[data-memo-pour]').click();await p.locator('[data-memo-confirm-pour]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-app.is-busy'));await p.locator('[data-memo-view=notes]').click();await p.waitForTimeout(850);await p.locator('[data-memo-new]').evaluate(el=>el.click());await closeEdit(p);assert.equal((await notes(p))[0].number,6);
 assert.deepEqual(errors,[]);console.log('PASS no initial caret, theme / fixed colors, current totals, hover / blank press do not drag, hold a non-first paper / release / click preview, full-width high canvas, stack-to-deck continuity');await p.close();
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
