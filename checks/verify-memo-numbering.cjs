const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.MEMO_TEST_ORIGIN||'http://127.0.0.1:4330';
const artifacts='.local/paper-reference/qa';fs.mkdirSync(artifacts,{recursive:true});
async function open(p){
 await p.waitForFunction(()=>window.ShiyuCornerModules);
 await p.evaluate(()=>{signed=true});
 await p.frameLocator('#corner-orbit-preview').locator('#orbit').evaluate(el=>el._shiyuOpenOrbitModule(1));
 await p.waitForSelector('#my-corner[open][data-corner-module=memo] .memo-cover');
 await p.waitForFunction(()=>document.querySelector('canvas[data-paper-count]'));
}
async function close(p){await p.locator('.corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);}
const stored=p=>p.evaluate(()=>structuredClone(prefs.cornerModules['numbering-qa'].memo));
const order=p=>p.locator('.memo-cover:not(.memo-add-cover)').evaluateAll(els=>els.map(el=>el.dataset.noteId));
const identities=library=>Object.fromEntries(library.notes.map(n=>[n.id,n.number]));
async function expectDeck(p,ids){
 assert.deepEqual(await order(p),ids);
 const numbers=await p.locator('.memo-cover:not(.memo-add-cover) .memo-cover-foot').evaluateAll(els=>els.map(el=>Number(el.firstChild.textContent.match(/\d+/)[0])));
 assert.deepEqual(numbers,ids.map((_,i)=>ids.length-i),'visible ordinals stay continuous, with 01 on the last card');
 assert.equal(await p.locator('[data-memo-position]').innerText(),`共 ${ids.length} 则`);
 assert.equal(await p.locator('[data-memo-count=notes]').innerText(),String(ids.length));
}
async function discard(p,id){await p.locator(`[data-memo-discard="${id}"]`).evaluate(el=>el.click());await p.waitForFunction(()=>!document.querySelector('.memo-paper-app.is-busy'));}
async function restore(p,id){await p.locator('[data-memo-view=trash]').click();await p.locator(`.memo-paper-access [data-memo-open="${id}"]`).evaluate(el=>el.click());await p.waitForSelector('[data-memo-restore]');await p.locator('[data-memo-restore]').click();}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/api/shiyu/auth/**',r=>r.fulfill({status:r.request().url().includes('/wechat/')?200:503,json:{}}));
 await p.route('**/api/shiyu/operations',r=>r.fulfill({json:{corner:{modules:['common','memo','todo'].map(id=>({id,enabled:true}))}}}));
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.ShiyuCornerModules);
 // Imported records need not be stored chronologically; edits are not creation dates.
 await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'numbering-qa'};prefs.mode='light';prefs.theme='base';prefs.brandGuideDismissed=true;
  prefs.cornerModules??={};prefs.cornerModules['numbering-qa']={memo:{groups:[],notes:[
   {id:'middle',title:'第二则',content:'中间添加的小记',createdAt:2000,updatedAt:6000},
   {id:'oldest',title:'最早的小记',content:'创建最早，后来修改过',createdAt:1000,updatedAt:9000},
   {id:'newest',title:'最新的小记',content:'最新添加',createdAt:3000,updatedAt:3000}
  ]}};localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));persist();render();});
 await open(p);
 assert.deepEqual(identities(await stored(p)),{oldest:1,middle:2,newest:3},'assign legacy numbers by creation time, independently of storage / edit order');
 assert.deepEqual(await order(p),['newest','middle','oldest']);
 assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-note-id'),'newest');
 assert.match(await p.locator('.memo-cover.is-active .memo-cover-foot').innerText(),/03/);
 assert.match(await p.locator('[data-note-id=oldest] .memo-cover-foot').innerText(),/01/);
 await expectDeck(p,['newest','middle','oldest']);
 const positions=await p.locator('.memo-cover:not(.memo-add-cover)').evaluateAll(els=>els.map(el=>Number(el.style.getPropertyValue('--active'))));
 assert(positions[0]<positions[1]&&positions[1]<positions[2],'newest cards lead left; oldest card is at the right of the deck');
 await p.screenshot({path:artifacts+'/memo-numbering-latest-first.png'});
 // Walk to 01: the count is the current number of cards, not that card's index.
 await p.locator('[data-memo-step="1"]').click();await p.locator('[data-memo-step="1"]').click();
 assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-note-id'),'oldest');
 await expectDeck(p,['newest','middle','oldest']);
 await p.locator('.is-active [data-memo-card]').click();await p.locator('[data-memo-content]').fill('编辑最早的小记，编号仍为 01');await p.locator('[data-memo-close]').click();
 assert.equal((await stored(p)).notes.find(n=>n.id==='oldest').number,1);assert.deepEqual(await order(p),['newest','middle','oldest']);
 await close(p);await p.evaluate(()=>{prefs.cornerModules['numbering-qa'].memo.notes.reverse();persist()});await p.reload({waitUntil:'domcontentloaded'});await open(p);
 assert.deepEqual(identities(await stored(p)),{oldest:1,middle:2,newest:3});assert.deepEqual(await order(p),['newest','middle','oldest']);
 // Discard the middle / oldest card: no holes, and the last card becomes 01.
 await discard(p,'middle');await expectDeck(p,['newest','oldest']);await restore(p,'middle');await expectDeck(p,['newest','middle','oldest']);
 await discard(p,'oldest');await expectDeck(p,['newest','middle']);await restore(p,'oldest');await expectDeck(p,['newest','middle','oldest']);
 // Adding, discarding and restoring update the current count immediately.
 await p.locator('[data-memo-new]').evaluate(el=>el.click());await p.locator('[data-memo-title]').fill('第四则');await p.locator('[data-memo-close]').click();
 const added=(await stored(p)).notes.find(n=>n.title==='第四则');await expectDeck(p,[added.id,'newest','middle','oldest']);
 await discard(p,added.id);await expectDeck(p,['newest','middle','oldest']);await restore(p,added.id);await expectDeck(p,[added.id,'newest','middle','oldest']);
 await discard(p,added.id);await discard(p,'newest');await discard(p,'middle');await discard(p,'oldest');await expectDeck(p,[]);
 await p.locator('[data-memo-view=trash]').click();await p.locator('[data-memo-pour]').click();await p.locator('[data-memo-confirm-pour]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-app.is-busy'));await p.locator('[data-memo-view=notes]').click();
 await p.locator('[data-memo-new]').click();await p.locator('[data-memo-title]').fill('重新开始');await p.locator('[data-memo-close]').click();const restarted=(await stored(p)).notes[0];await expectDeck(p,[restarted.id]);
 await close(p);await p.evaluate(()=>{prefs.cornerModules['numbering-qa'].memo={groups:[],notes:[{id:'legacy-new',title:'旧版新记录',updatedAt:1000},{id:'legacy-old',title:'旧版最早记录',updatedAt:9000}]};persist()});await open(p);
 assert.deepEqual(identities(await stored(p)),{'legacy-new':2,'legacy-old':1},'records without creation dates preserve their original insertion order');
 await expectDeck(p,['legacy-new','legacy-old']);
 assert.deepEqual(errors,[]);console.log('PASS continuous reverse ordinals / current count, middle / oldest discard and restore, empty deck / purge / add restarts at 01, editing / reload / legacy order');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
