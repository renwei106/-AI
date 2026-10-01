/* Every account write is intercepted; no real account data is read or changed. */
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const saveRecord=require('./paper-record-fixture.cjs');
const out=path.join(__dirname,'paper-independent');
const legacy={cover:{title:'封面自己的头条'},edition:{quote:'今日社论\n已有的社论内容',dailyTitle0:'已保存的快讯',sideBody2:'已保存的副刊正文',editionMasthead2:'心情副刊'}};
const values=p=>p.locator('.newspaper [data-paper-life]').evaluateAll(els=>Object.fromEntries(els.filter(e=>!e.closest('.edition-page')?.hidden).map(e=>[e.dataset.paperLife,e.textContent])));
async function open(p){await p.locator('.edition-cover').click({position:{x:100,y:150}});await p.locator('.newspaper').waitFor();await p.evaluate(()=>document.fonts.ready);}
async function go(p,index){await p.locator('[data-edition-front]').click();for(let i=0;i<index;i++)await p.locator('[data-edition-next]').click();}
async function edit(p){await p.locator('[data-paper-edit]').click();await p.locator('.newspaper.paper-editing').waitFor();}
async function save(p){await p.locator('[data-paper-save]').click();await p.locator('.paper-editing').waitFor({state:'detached'});}
async function snapshots(p){const result=[];for(let i=0;i<3;i++){await go(p,i);result.push(await values(p));}return result;}
async function geometry(p){return p.locator('.masthead,.paper-newsline,.edition-page:not([hidden]),.edition-page:not([hidden]) [data-paper-life],.edition-nav').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {key:e.dataset.paperLife||e.className,text:e.dataset.paperLife?e.textContent:'',x:r.x,y:r.y,width:r.width,height:r.height,font:s.fontFamily,color:s.color,background:s.backgroundColor};}));}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  // Same viewport, theme and saved content: compare with the pre-change rendering.
  const layouts=[];
  for(const baseline of [true,false]){
   const f=await fixture(browser),p=f.page;
   if(baseline)await f.context.route('**/paper-edition.js*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(__dirname,'../baselines/paper-independent-before-20261001/paper-edition.js'),'utf8')}));
   await f.context.route('**/api/shiyu/auth/newspaper',route=>route.fulfill({json:{userId:'pet-local-check',newspaper:legacy}}));
   await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
   const rows=[];
   for(const mode of ['light','dark']){
    await p.evaluate(mode=>{prefs.theme='paper';prefs.mode=mode;render()},mode);
    if(await p.locator('.edition-cover').isVisible())await open(p);
    for(let i=0;i<3;i++){await go(p,i);await p.waitForFunction(()=>[...document.querySelectorAll('.newspaper img')].every(img=>img.complete));rows.push(await geometry(p));await p.screenshot({path:path.join(out,`${baseline?'before':'after'}-${mode}-${i}.png`)});}
   }
   layouts.push(rows);assert.deepEqual(f.errors,[]);await f.context.close();
  }
  assert.deepEqual(layouts[1],layouts[0],'existing page geometry, typography, colors and content remain unchanged');
  const f=await fixture(browser),p=f.page;let record=structuredClone(legacy),puts=[],failSave=false;
  await f.context.route('**/api/shiyu/auth/newspaper',route=>{
   if(route.request().method()==='PUT'){
    const body=route.request().postDataJSON();
    if(failSave)return route.fulfill({status:503,json:{message:'测试保存失败'}});
    assert.equal(body.userId,'pet-local-check');saveRecord(record,body);puts.push(body);
   }
   return route.fulfill({json:{userId:'pet-local-check',newspaper:record}});
  });
  await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
  await p.evaluate(()=>{prefs.theme='paper';prefs.mode='dark';render()});await open(p);
  const initial=await snapshots(p),expected=structuredClone(initial),initialCover=structuredClone(record.cover);
  // Reproduce the reported bug by changing only page 3's editorial first.
  await edit(p);assert.equal(await p.locator('.edition-page[hidden] [contenteditable]').count(),0);
  assert.equal(await p.locator('.newspaper .paper-upload-cover').count(),0,'no hidden head-page image editor on page 3');
  await p.locator('.edition-personal [data-paper-life="quote"]').fill('今日社论\n只属于心情副刊');
  await save(p);expected[2].quote='今日社论\n只属于心情副刊';
  assert.deepEqual(await snapshots(p),expected);assert.deepEqual(record.cover,initialCover);
  const covered=[];
  // Enumerate actual editable DOM fields: none may save into another edition.
  for(const index of [0,1,2]){
   await go(p,index);await edit(p);
   assert.equal(await p.locator('.edition-page[hidden] [contenteditable]').count(),0);
   const fields=p.locator('.newspaper [contenteditable="plaintext-only"]');
   const keys=await fields.evaluateAll(els=>els.map(e=>e.dataset.paperLife));
   assert.deepEqual([...keys].sort(),Object.keys(expected[index]).sort());
   for(let i=0;i<keys.length;i++){
    const value=keys[i]==='strip'?'':`第${index+1}版 · ${keys[i]}\n独立保存`;
    await fields.nth(i).fill(value);expected[index][keys[i]]=value;
   }
   await save(p);const payload=puts.at(-1);
   assert.equal(payload.editionIndex,index);
   assert.deepEqual(Object.keys(payload.fields).sort(),[...keys,...(index===0?['cover']:[])].sort());
   assert.deepEqual(await snapshots(p),expected);assert.deepEqual(record.cover,initialCover);
   covered.push({index,keys});
  }
  await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>{prefs.theme='paper';render()});await open(p);
  assert.deepEqual(await snapshots(p),expected,'all edition fields including empty strings survive reload');
  await go(p,1);await edit(p);const beforeCancel=JSON.stringify(record),count=puts.length;
  await p.locator('.edition-daily [data-paper-life="quote"]').fill('不会保存');
  failSave=true;await p.locator('[data-paper-save]').click();await p.waitForFunction(()=>!document.querySelector('[data-paper-save]').disabled);
  assert.equal(JSON.stringify(record),beforeCancel);assert.equal(await p.locator('.paper-editing').count(),1);
  await p.locator('[data-paper-cancel]').click();assert.equal(puts.length,count);assert.deepEqual(await snapshots(p),expected);
  failSave=false;
  await p.locator('[data-edition-back]').click();await p.locator('.edition-cover-edit').click();await p.locator('.edition-cover.paper-editing').waitFor();
  const coverFields=p.locator('.edition-cover [contenteditable="plaintext-only"]'),coverExpected={};
  for(let i=0;i<await coverFields.count();i++){const key=await coverFields.nth(i).getAttribute('data-paper-life');coverExpected[key]='独立封面 · '+key;await coverFields.nth(i).fill(coverExpected[key]);}
  await save(p);assert.equal(puts.at(-1).editionIndex,undefined);
  await open(p);assert.deepEqual(await snapshots(p),expected,'editing every cover field preserves all editions');
  await p.locator('[data-edition-back]').click();await p.locator('.edition-cover-edit').click();await p.locator('.edition-cover.paper-editing').waitFor();
  assert.deepEqual(await coverFields.evaluateAll(els=>Object.fromEntries(els.map(e=>[e.dataset.paperLife,e.textContent]))),coverExpected);
  await p.locator('[data-paper-cancel]').click();
  assert.deepEqual(f.errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({covered,coverFields:Object.keys(coverExpected),layoutsCompared:6},null,2));
  await f.context.close();console.log('PASS all editable fields isolated across 3 editions and cover; legacy migration, reload, empty text, failed save/cancel; 6 unchanged light/dark layouts');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
