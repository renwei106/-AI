const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.MEMO_TEST_ORIGIN||'http://127.0.0.1:4330',dir='.local/paper-reference/qa';fs.mkdirSync(dir,{recursive:true});
const notes=p=>p.evaluate(()=>structuredClone(prefs.cornerModules['archive-qa'].memo.notes));
async function open(p){await p.waitForFunction(()=>window.ShiyuCornerModules);await p.evaluate(()=>{signed=true});await p.frameLocator('#corner-orbit-preview').locator('#orbit').evaluate(el=>el._shiyuOpenOrbitModule(1));await p.waitForSelector('canvas[data-paper-count]');await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));}
async function setup(p){
 await p.route('**/api/shiyu/auth/**',r=>r.fulfill({status:r.request().url().includes('/wechat/')?200:503,json:{}}));await p.route('**/api/shiyu/operations',r=>r.fulfill({json:{corner:{modules:['common','memo','todo'].map(id=>({id,enabled:true}))}}}));
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'archive-qa'};prefs.mode='light';prefs.theme='base';prefs.brandGuideDismissed=true;localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));persist();render()});await open(p);
}

const ids=p=>p.locator('.memo-cover[data-note-id]:not(.memo-add-cover)').evaluateAll(els=>els.map(el=>el.dataset.noteId));
const center=async el=>{const r=await el.boundingBox();return{x:r.x+r.width/2,y:r.y+r.height/2}};
async function settle(p){await p.waitForFunction(()=>!document.querySelector('.memo-paper-app.is-busy'));await p.waitForTimeout(500)}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await setup(p);await p.waitForTimeout(850);const initial=await ids(p),first=p.locator('[data-note-id="'+initial[0]+'"]'),second=p.locator('[data-note-id="'+initial[1]+'"]');
 const from=await center(first),to=await center(second);await p.mouse.move(from.x,from.y);await p.mouse.down();await p.waitForTimeout(350);assert.equal(await p.locator('.memo-sort-flight').count(),1);
 const a=await center(p.locator('.memo-sort-flight'));await p.mouse.move(from.x+60,from.y+32);const b=await center(p.locator('.memo-sort-flight'));assert(Math.abs(b.x-a.x-60)<1&&Math.abs(b.y-a.y-32)<1,'drag follows pointer exactly');
 await p.mouse.move(to.x,to.y,{steps:12});assert.deepEqual(await ids(p),[initial[1],initial[0],...initial.slice(2)]);await p.waitForTimeout(180);const moving=await center(second);assert(moving.x<to.x&&moving.x>from.x-2,'neighbor slides into vacated slot');await p.screenshot({path:dir+'/memo-reorder-mid.png'});await p.mouse.up();await settle(p);assert.equal(await p.locator('.memo-paper-editor').count(),0);assert.equal(await p.locator('.memo-add-cover').count(),1);assert.equal(await p.locator('.memo-cover').first().getAttribute('data-note-id'),'');
 let saved=await ids(p);await p.reload({waitUntil:'domcontentloaded'});await open(p);await p.waitForTimeout(850);assert.deepEqual(await ids(p),saved);

 // Move the displaced note back to the preceding slot, then test edge scrolling.
 const backFrom=await center(p.locator('[data-note-id="'+initial[0]+'"]')),backTo=await center(p.locator('[data-note-id="'+initial[1]+'"]'));
 await p.mouse.move(backFrom.x,backFrom.y);await p.mouse.down();await p.waitForTimeout(350);await p.mouse.move(backTo.x,backTo.y,{steps:10});await p.mouse.up();await settle(p);assert.deepEqual(await ids(p),initial,'sort works toward the preceding slot');saved=await ids(p);
 const edgeStart=await center(p.locator('.memo-cover.is-active'));await p.mouse.move(edgeStart.x,edgeStart.y);await p.mouse.down();await p.waitForTimeout(350);await p.mouse.move(1420,700);await p.waitForTimeout(1000);assert(Number(await p.locator('.memo-paper-app').getAttribute('data-active-card'))>1,'edge scroll exposes further slots');await p.keyboard.press('Escape');await p.mouse.up();await settle(p);assert.deepEqual(await ids(p),saved);
 const active=p.locator('.memo-cover.is-active');const point=await center(active);await p.mouse.move(point.x,point.y);await p.mouse.down();await p.waitForTimeout(350);await p.mouse.move(point.x+170,point.y+55);await p.keyboard.press('Escape');await p.mouse.up();await settle(p);assert.deepEqual(await ids(p),saved,'Escape cancels order');
 await p.locator('.memo-paper-app').dispatchEvent('keydown',{key:'Home'});await p.waitForTimeout(850);await p.locator('[data-memo-new]').click();await p.waitForSelector('[data-memo-title]');await p.locator('[data-memo-title]').fill('独立新增');await p.locator('[data-memo-close]').click();await settle(p);assert.equal((await notes(p))[0].title,'独立新增');assert.equal((await ids(p)).length,5);
 assert.equal(await p.locator('.memo-archive-spine').count(),3);await p.locator('.memo-archive-dock').hover();await p.waitForTimeout(400);await p.screenshot({path:dir+'/memo-archive-bookshelf.png'});await p.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await setup(mobile);await mobile.screenshot({path:dir+'/memo-archive-bookshelf-mobile.png'});await mobile.close();assert.deepEqual(errors,[]);console.log('PASS long press / pointer tracking / neighbor displacement / persistence / cancel / independent add / archive bookshelf');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
