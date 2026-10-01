/* Local fixture only: no live account requests. */
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'bookmark-drag');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;await p.setViewportSize({width:1772,height:1015});
 async function setup(mode='shelf',browse='continuous',extra={}){await p.evaluate(({mode,browse,extra})=>{
  const item=n=>[n,'https://example.test/'+n,'用于核对拖动后内容保持完整',n[0]],group=(id,names)=>({id,name:id,items:names.map(item)});
  data=[{id:'work',name:'工作空间',scenes:[{id:'daily',name:'办公协作',groups:[group('one',['A','B','C']),group('two',['D','E','F']),group('empty',[])]},{id:'other',name:'知识阅读',groups:[group('three',['G','H','I']),group('four',[])]}]}];
  spaceId='work';sceneId='daily';activeGroups.daily='one';activeGroups.other='three';view='space';filter='';bookmarkPages={};
  prefs.theme='base';prefs.mode='dark';prefs.color='#237c76';prefs.width='wide';prefs.groupBrowseMode=browse;prefs.sceneDisplayRules={daily:{style:mode},other:{style:mode}};Object.assign(prefs,extra);render();window.scrollTo(0,0);
 },{mode,browse,extra});await p.waitForTimeout(80);}
 const card=n=>p.locator('#groups .group:not([hidden]) .bookmark').filter({has:p.locator(`a[href="https://example.test/${n}"]`)});
 async function start(n){const b=await card(n).boundingBox();await p.mouse.move(b.x+b.width*.4,b.y+b.height*.45);await p.mouse.down();await p.waitForTimeout(470);assert.equal(await p.locator('.bookmark-drag-ghost').count(),1,'long press starts '+JSON.stringify(await p.evaluate(()=>({signed,state:bookmarkDrag&&{active:bookmarkDrag.active,item:bookmarkDrag.item},errors:[],html:document.querySelector('#groups .bookmark')?.outerHTML})))+f.errors.join('\n'));}
 async function over(n,after=true){for(let i=0;i<2;i++){const b=await card(n).boundingBox();await p.mouse.move(b.x+b.width*(after?.85:.15),b.y+b.height*.55,{steps:i?1:8});await p.waitForTimeout(50);}}
 async function stop(){await p.mouse.up();await p.waitForTimeout(100);assert.equal(await p.locator('.bookmark-drag-ghost,.bookmark-drop-slot').count(),0);}
 async function names(id){return p.evaluate(id=>data[0].scenes.flatMap(c=>c.groups).find(g=>g.id===id).items.map(i=>i[0]),id);}
 const modes=process.argv.includes('--focused')?[]:await p.evaluate(()=>Object.keys(LINK_VIEWS).filter(m=>m!=='follow'));
 for(const m of modes){
  await setup(m);await start('A');await over('C');await stop();assert.deepEqual(await names('one'),['B','C','A'],m+' in-group');
  await start('B');await over('E',false);await stop();assert.deepEqual(await names('one'),['C','A']);assert.deepEqual(await names('two'),['D','B','E','F'],m+' cross-group');
  console.log('PASS',m,'sort and continuous cross-group');
 }
 await setup();await p.screenshot({path:path.join(out,'before.png')});await start('B');await over('E',false);await p.screenshot({path:path.join(out,'continuous-drag.png')});await stop();
 // A cancelled preview never mutates either group.
 await start('A');await over('D');await p.keyboard.press('Escape');await p.mouse.up();assert.deepEqual(await names('one'),['A','C']);assert.deepEqual(await names('two'),['D','B','E','F']);
 // Group tabs open on hover and the pointer remains captured across the render.
 await setup('paper','tabs');await start('A');await p.locator('[data-group-tab=two]').hover();await p.waitForTimeout(480);
 assert.equal(await p.evaluate(()=>currentGroup().id),'two');assert.equal(await p.locator('.bookmark-drag-ghost').count(),1);await over('E',false);await stop();assert.deepEqual(await names('two'),['D','A','E','F']);
 // Scene hover visibly arms before navigating, without moving data yet.
 await setup('shelf','tabs');await start('B');await p.locator('.scene-button[data-scene=other]').hover();
 assert.equal(await p.locator('.scene-button[data-scene=other]').evaluate(el=>el.classList.contains('bookmark-drag-hover')),true);
 await p.screenshot({path:path.join(out,'scene-hover.png')});await p.waitForTimeout(650);assert.equal(await p.evaluate(()=>sceneId),'other');assert.deepEqual(await names('one'),['A','B','C']);
 await over('H',false);await p.screenshot({path:path.join(out,'scene-drop.png')});await stop();assert.deepEqual(await names('one'),['A','C']);assert.deepEqual(await names('three'),['G','B','H','I']);
 const stored=await p.evaluate(()=>JSON.parse(localStorage.getItem('yiyu-prototype-v1')).data);assert.deepEqual(stored[0].scenes[1].groups[0].items.map(i=>i[0]),['G','B','H','I']);
 // Empty group and cancellation after scene navigation.
 await start('G');await p.locator('[data-group-tab=four]').hover();await p.waitForTimeout(470);await p.locator('.group:not([hidden]) .cards').hover();await stop();assert.deepEqual(await names('four'),['G']);
 await start('G');await p.locator('.scene-button[data-scene=daily]').hover();await p.waitForTimeout(640);await p.keyboard.press('Escape');await p.mouse.up();assert.equal(await p.evaluate(()=>sceneId),'other');assert.deepEqual(await names('four'),['G']);
 // Same-group sorting leaves search-hidden items in their original slots.
 await setup('cards','tabs');await p.evaluate(()=>{currentGroup().items[1][2]='hidden';currentGroup().items[0][2]='match';currentGroup().items[2][2]='match';filter='match';renderGroups()});await start('A');await over('C');await stop();assert.deepEqual(await names('one'),['C','B','A']);
 // Fast movement before the hold threshold does not start a drag or mutate data.
 await setup();const b=await card('A').boundingBox();await p.mouse.move(b.x+20,b.y+20);await p.mouse.down();await p.mouse.move(b.x+80,b.y+20);await p.waitForTimeout(440);await p.mouse.up();assert.equal(await p.locator('.bookmark-drag-ghost').count(),0);assert.deepEqual(await names('one'),['A','B','C']);
 // An invalid release restores the original collection.
 await setup();await start('A');await p.mouse.move(1750,600);await stop();assert.deepEqual(await names('one'),['A','B','C']);
 // Edge scrolling continues while the pointer is stationary, and cancels safely.
 await setup('cards');await p.evaluate(()=>{currentGroup().items.push(...Array.from({length:75},(_,i)=>['Extra'+i,'https://example.test/extra'+i,'test','E']));renderGroups()});
 await start('A');await p.mouse.move(1000,1000);await p.waitForFunction(()=>Math.max(scrollY,document.querySelector('#groups').scrollTop)>100,null,{timeout:4000});await p.keyboard.press('Escape');await p.mouse.up();assert.equal((await names('one')).length,78);assert.equal((await names('one'))[0],'A');console.log('PASS stationary edge scroll');
 // Normal animation settings use the same ordering and retain an empty-group target.
 await p.emulateMedia({reducedMotion:'no-preference'});await setup('shelf');await start('A');await p.locator('[data-stream-group=empty] .shelf-add').hover();await p.waitForTimeout(300);await stop();assert.deepEqual(await names('empty'),['A']);console.log('PASS animated empty group');
 // A short click still opens the link normally.
 await p.waitForTimeout(550);await p.evaluate(()=>{window.__bookmarkClick=null;document.addEventListener('click',e=>{if(e.target.closest('.bookmark a')){window.__bookmarkClick={prevented:e.defaultPrevented};e.preventDefault()}},{once:true})});await card('B').locator('a').click({timeout:5000});assert.deepEqual(await p.evaluate(()=>window.__bookmarkClick),{prevented:false});
 assert.deepEqual(f.errors,[]);console.log('PASS tabs, scenes, empty targets, cancellation, persistence, filtering, auto-scroll, animation and ordinary clicks');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
