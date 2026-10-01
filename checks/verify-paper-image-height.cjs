/* Local API fixtures only: compare the same photo before, during and after editing. */
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'paper-image-height');
// Ignore scrolling caused by focusing the image chooser on narrow screens.
const measure=p=>p.locator('.paper-lead .paper-cover').evaluate(img=>{const r=img.getBoundingClientRect(),s=getComputedStyle(img);return {x:r.x,y:r.y+document.querySelector('.edition-content').scrollTop,width:r.width,height:r.height,fit:s.objectFit,position:s.objectPosition,filter:s.filter,src:img.src}});
const same=(a,b,label)=>{for(const k of ['x','y','width','height'])assert(Math.abs(a[k]-b[k])<1,`${label}: ${k} ${a[k]} -> ${b[k]}`);for(const k of ['fit','position','filter','src'])assert.equal(a[k],b[k],`${label}: ${k}`)};
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;let record={cover:{},edition:{}};
 await f.context.route('**/api/shiyu/auth/newspaper',route=>{if(route.request().method()==='PUT')require('./paper-record-fixture.cjs')(record,route.request().postDataJSON());return route.fulfill({json:{userId:'pet-local-check',newspaper:record}})});
 const rows=[];
 for(const mode of ['light','dark'])for(const size of [{width:1772,height:1015},{width:1440,height:900},{width:1366,height:768},{width:390,height:844}]){
  await p.setViewportSize(size);await p.evaluate(mode=>{prefs.theme='paper';prefs.mode=mode;render()},mode);
  if(await p.locator('.edition-cover').isVisible())await p.locator('.edition-cover').click({position:{x:100,y:150}});
  await p.waitForFunction(()=>{const img=document.querySelector('.paper-lead .paper-cover');return img?.complete&&img.naturalWidth>0});
  const before=await measure(p);
  if(size.width===1772){assert(before.height>300);await p.screenshot({path:path.join(out,`${mode}-read.png`)})}
  await p.locator('.newspaper [data-paper-edit]').click();await p.locator('.newspaper.paper-editing').waitFor();
  same(before,await measure(p),'enter editor');
  if(size.width===1772)await p.screenshot({path:path.join(out,`${mode}-edit.png`)});
  await p.locator('.newspaper .paper-upload-cover').click();await p.locator('[data-paper-image="reading"]').click();
  await p.waitForFunction(()=>!document.querySelector('.paper-image-picker').matches(':popover-open'));
  const preview=await measure(p);
  await p.locator('[data-paper-save]').click();await p.locator('.newspaper.paper-editing').waitFor({state:'detached'});
  await p.waitForFunction(()=>document.querySelector('.paper-lead .paper-cover')?.complete);
  same(preview,await measure(p),'save preset');
  await p.locator('.newspaper [data-paper-edit]').click();await p.locator('.newspaper.paper-editing').waitFor();
  same(preview,await measure(p),'reopen editor');
  await p.locator('[data-paper-cancel]').click();await p.locator('.newspaper.paper-editing').waitFor({state:'detached'});
  same(preview,await measure(p),'cancel');
  rows.push({mode,...size,height:preview.height,width:preview.width});
 }
 await p.setViewportSize({width:1772,height:1015});await p.evaluate(()=>{prefs.mode='light';render()});
 await p.locator('.newspaper [data-paper-edit]').click();await p.locator('.newspaper.paper-editing').waitFor();
 await p.locator('.paper-lead input[type=file]').setInputFiles(path.join(__dirname,'../dist/assets/site-icons/pet-girl-frame-0.png'));
 await p.waitForFunction(()=>document.querySelector('.paper-lead img')?.src.startsWith('data:image/png'));
 const upload=await measure(p);await p.locator('[data-paper-save]').click();await p.locator('.newspaper.paper-editing').waitFor({state:'detached'});
 same(upload,await measure(p),'save uploaded image with different aspect ratio');
 await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>{prefs.theme='paper';prefs.mode='light';render()});await p.locator('.edition-cover').click({position:{x:100,y:150}});
 await p.waitForFunction(()=>document.querySelector('.paper-lead .paper-cover')?.complete);
 same(upload,await measure(p),'reload saved upload');
 assert.deepEqual(f.errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2));
 console.log('PASS same image size, crop and filter before/edit/save/cancel across 8 layouts, uploaded image and reload');await f.context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
