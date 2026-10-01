process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'space-menu-view');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;
 await p.setViewportSize({width:1772,height:1015});
 await p.evaluate(()=>{view='space';prefs.theme='base';prefs.mode='dark';prefs.color='#237c76';render()});
 const trigger=p.locator('.workspace [data-corner-switch]');await trigger.click();
 const menu=p.locator('#corner-space-menu'),toggle=p.locator('[data-corner-view=work]');
 await menu.waitFor();const original=await menu.boundingBox();
 await p.screenshot({path:path.join(out,'before.png')});
 for(let i=0;i<6;i++){
  await toggle.click();const graph=i%2===0;
  await p.waitForFunction(graph=>!!document.querySelector('#space-atlas[open]')===graph&&document.body.classList.contains('atlas-active')===graph,graph);
  await p.waitForTimeout(220);
  assert(await menu.isVisible(),'space menu must remain visible in both view directions');
  assert.deepEqual(await menu.boundingBox(),original,'menu position stays stable');
  assert.match(await toggle.getAttribute('aria-label'),new RegExp(graph?'图谱视图':'宫格视图'));
  assert.equal(await p.evaluate(()=>document.activeElement?.dataset.cornerView),'work','focus remains on the row view toggle');
  assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  if(i<2)await p.screenshot({path:path.join(out,graph?'after-graph.png':'after-grid.png')});
 }
 // Changing a different space's saved view keeps this space and menu in place.
 await p.locator('[data-corner-view=life]').click();assert(await menu.isVisible());assert.equal(await p.evaluate(()=>spaceId),'work');
 await p.locator('[data-corner-view=life]').click();assert(await menu.isVisible());
 await p.mouse.click(900,750);await menu.waitFor({state:'hidden'});
 await trigger.click();await p.locator('[data-corner-space=life]').click();await menu.waitFor({state:'hidden'});assert.equal(await p.evaluate(()=>spaceId),'life');
 await trigger.click();await p.locator('#corner-space-menu [data-organize=space]').click();await menu.waitFor({state:'hidden'});
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await trigger.click();await p.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS repeated grid/graph toggles preserve menu, position and focus; other-space preferences, outside clicks, selection, management and Escape work');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
