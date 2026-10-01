/* Account writes are intercepted locally; this never changes real user data. */
process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=path.join(__dirname,'paper-images');
async function ready(p,selector){await p.waitForFunction(selector=>{const i=document.querySelector(selector);return i&&i.complete&&i.naturalWidth>0},selector)}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const f=await fixture(browser),p=f.page;let record={cover:{},edition:{}},puts=0;
  await f.context.route('**/api/shiyu/auth/newspaper',async route=>{
   if(route.request().method()==='PUT'){
    const body=route.request().postDataJSON();assert.equal(body.userId,'pet-local-check');assert(['cover','edition'].includes(body.section));
    for(const [key,value] of Object.entries(body.fields)){
     assert(/^(masthead|editionMasthead[0-2]|tagline|leadLabel|strip|title|intro|cover|quote|dailyLabel|sideLabel|dailyTitle[0-3]|dailyBody[0-3]|sideTitle[0-2]|sideBody[0-2])$/.test(key));
     assert.equal(typeof value,'string');assert(value.length<=(key==='cover'?4500000:2000));
     if(key==='cover'&&value)assert(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value));
    }
    require('./paper-record-fixture.cjs')(record,body);puts++;
   }
   await route.fulfill({json:{userId:'pet-local-check',newspaper:record}});
  });
  await p.reload({waitUntil:'networkidle'});await p.setViewportSize({width:1772,height:1015});
  await p.evaluate(()=>{prefs.theme='paper';prefs.mode='light';render()});
  await ready(p,'.edition-cover-art img');assert((await p.locator('.edition-cover-art img').getAttribute('src')).includes('paper-photo-mist'));
  await p.screenshot({path:path.join(out,'default-cover.png')});
  await p.locator('.edition-cover-edit').click();await p.locator('.edition-cover .paper-upload-cover').click();
  await p.locator('.paper-image-picker:popover-open').waitFor();assert.equal(await p.locator('[data-paper-image]').count(),3);
  await p.screenshot({path:path.join(out,'cover-picker.png')});
  await p.locator('[data-paper-image="reading"]').click();await p.waitForFunction(()=>!document.querySelector('.paper-image-picker').matches(':popover-open'));
  await ready(p,'.edition-cover-art img');assert.equal(puts,0,'selecting a preset only previews');
  await p.locator('[data-paper-cancel]').click();assert((await p.locator('.edition-cover-art img').getAttribute('src')).includes('paper-photo-mist'));
  await p.locator('.edition-cover').click({position:{x:160,y:150}});await ready(p,'.paper-lead .paper-cover');
  await p.screenshot({path:path.join(out,'default-frontpage.png')});
  await p.locator('.newspaper [data-paper-edit]').click();await p.locator('.newspaper .paper-upload-cover').click();
  await p.locator('[data-paper-image="breakfast"]').click();await p.waitForFunction(()=>document.querySelector('.paper-lead img').src.startsWith('data:image/webp'));
  await p.locator('[data-paper-save]').click();await p.locator('.newspaper.paper-editing').waitFor({state:'detached'});
  assert.equal(puts,1);assert(record.editions[0].cover.startsWith('data:image/webp'));assert.equal(record.cover.cover,undefined);
  const saved=record.editions[0].cover;assert.equal(await p.locator('.paper-lead img').getAttribute('src'),saved);
  await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>{prefs.theme='paper';render()});
  await p.locator('.edition-cover').click({position:{x:160,y:150}});await ready(p,'.paper-lead .paper-cover');
  assert.equal(await p.locator('.paper-lead img').getAttribute('src'),saved,'saved account photo survives reload');
  // Keep a separate choice on the folded cover and verify upload compatibility.
  await p.locator('[data-edition-back]').click();await p.locator('.edition-cover-edit').click();
  await p.locator('.edition-cover .paper-upload-cover').click();
  const chooser=p.waitForEvent('filechooser');await p.locator('.paper-image-upload').click();
  await (await chooser).setFiles(path.join(__dirname,'../dist/assets/site-icons/paper-photo-reading-v1.webp'));
  await p.waitForFunction(()=>document.querySelector('.edition-cover-art img').src.startsWith('data:image/webp'));
  await p.locator('[data-paper-save]').click();await p.locator('.edition-cover.paper-editing').waitFor({state:'detached'});
  assert.equal(puts,2);assert.notEqual(record.cover.cover,saved);assert.equal(record.editions[0].cover,saved);
  for(const mode of ['light','dark']){
   await p.evaluate(mode=>{prefs.mode=mode;render()},mode);
   await p.locator('.edition-cover').click({position:{x:160,y:150}});
   await p.locator('[data-edition-next]').click();
   const colors=await p.locator('.edition-daily .paper-editor-note').evaluate(e=>({background:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color,ink:getComputedStyle(document.body).getPropertyValue('--news-ink').trim()}));
   assert.equal(colors.background,'rgba(0, 0, 0, 0)','editorial uses the underlying paper in both lighting modes');
   await p.screenshot({path:path.join(out,`editorial-${mode}.png`)});
   await p.locator('[data-edition-back]').click();
  }
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{prefs.mode='light';render()});
  await p.locator('.edition-cover-edit').click();await p.locator('.edition-cover .paper-upload-cover').click();
  const bounds=await p.locator('.paper-image-picker').boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=390&&bounds.y+bounds.height<=844);
  await p.screenshot({path:path.join(out,'mobile-picker.png')});
  await p.keyboard.press('Escape');assert.equal(await p.locator('.paper-image-picker:popover-open').count(),0);
  await p.locator('[data-paper-cancel]').click();assert.equal(await p.locator('[data-paper-image-picker]').count(),0);
  assert.deepEqual(f.errors,[]);console.log('PASS default photos, 3 presets, preview/cancel, account persistence, separate cover, upload, light/dark paper, mobile picker and Escape');
  await f.context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
