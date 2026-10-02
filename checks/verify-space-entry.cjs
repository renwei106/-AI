process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;
 await p.setViewportSize({width:1317,height:1015});
 await p.evaluate(()=>{prefs.spaceEntryPolicy='last';view='space';spaceId='life';sceneId=data.find(s=>s.id==='life').scenes[0].id;render();view='home';render();spaceId=data[0].id;});
 // Reload simulates a new visit: the app's initial work-space ID must not override remembered life.
 await p.reload();await p.waitForFunction(()=>window.ShiyuSpaceViews&&window.__shiyuMemberCatalog?.ready);
 await p.evaluate(()=>{prefs.spaceEntryPolicy='last';view='space';render()});assert.equal(await p.evaluate(()=>spaceId),'life');
 await p.evaluate(()=>{view='home';render();prefs.spaceEntryPolicy='first';view='space';render()});assert.equal(await p.evaluate(()=>spaceId),await p.evaluate(()=>data[0].id));
 await p.evaluate(()=>{view='home';render();goSpace('life')});await p.waitForTimeout(500);assert.equal(await p.evaluate(()=>spaceId),'life','explicit space choice must win');
 await p.evaluate(()=>{prefs.spaceThemePolicy='default';prefs.spaceEntryPolicy='first';changeTheme('base');view='home';render();view='space';render();scope='global';settingsTab='space-entry';renderSettings();document.querySelector('#settings').showModal()});
 assert.equal(await p.locator('[data-pref="spaceEntryPolicy"]').count(),2);assert.equal(await p.locator('[data-pref="spaceThemePolicy"]').count(),0);
 fs.mkdirSync('.local/space-entry-qa',{recursive:true});await p.screenshot({path:'.local/space-entry-qa/settings.png'});
 await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());prefs.spaceEntryPolicy='first';prefs.spaceThemePolicy='default';window.ShiyuSpaceViews.toggle(document.createElement('button'),spaceId)});
 await p.waitForSelector('#space-atlas[open]');
 await p.evaluate(()=>{view='home';render()});await p.waitForTimeout(100);
 await p.evaluate(()=>{view='space';render()});await p.waitForSelector('#space-atlas[open]');
 assert.equal(await p.evaluate(()=>spaceId),await p.evaluate(()=>data[0].id));
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS first/last space, reload persistence, explicit selection and updated settings');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
