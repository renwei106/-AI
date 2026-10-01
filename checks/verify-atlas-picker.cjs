process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'atlas-picker'),baseline=process.argv.includes('--baseline');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser),p=f.page;
 await p.setViewportSize({width:1772,height:1015});
 await p.evaluate(()=>{view='space';prefs.theme='base';prefs.mode='dark';prefs.color='#237c76';render()});
 await p.locator('[data-link-settings]').first().click();await p.locator('#link-view-settings[open]').waitFor();
 await p.waitForTimeout(250);await p.screenshot({path:path.join(out,baseline?'before-styles.png':'after-styles.png')});
 const order=await p.locator('#link-view-settings .style-scroll-body>.link-view-grid>[data-link-view]').evaluateAll(nodes=>nodes.map(n=>n.dataset.linkView));
 console.log('Style order',order);
 if(!baseline)assert.deepEqual(order,['follow','cards','paper','record','film','planet','calendar','poly','shelf']);
 await p.locator('#link-view-settings').evaluate(d=>d.close());
 await p.locator('.workspace .space-mode-entry').click();await p.locator('#space-atlas[open]').waitFor();
 await p.locator('.at-view-current').hover();await p.locator('#at-view-dialog').waitFor();await p.waitForTimeout(300);
 await p.screenshot({path:path.join(out,baseline?'before-picker.png':'after-picker.png')});
 console.log('Modes',await p.locator('[data-at-view]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.atView,visible:!!n.getClientRects().length,badge:!!n.querySelector('[data-entitlement-badge]')}))));
 if(!baseline){
  const current=()=>p.locator('[data-at-view][aria-pressed=true]').getAttribute('data-at-view');
  const expected=['radial','organization','mindmap','spatial','solar'];
  assert.deepEqual(await p.locator('[data-at-view]').evaluateAll(ns=>ns.filter(n=>!!n.getClientRects().length).map(n=>n.dataset.atView)),expected);
  assert.equal(await p.locator('.at-view-picker [role=tab]').count(),0);
  assert.equal(await p.locator('.at-view-picker>.at-quiet button').count(),1);
  assert.equal(await p.locator('.at-view-picker>.at-quiet [data-entitlement-badge]').count(),0);
  assert.equal(await p.locator('[data-at-view-panel="3d"] [data-entitlement-badge]').count(),2);
  for(const id of [...expected.slice(1),'radial']){await p.locator('.at-view-current').click();assert.equal(await current(),id,'bottom button cycles through both dimensions');}
  await p.locator('[data-at-view=solar]').click();assert.equal(await current(),'solar','last option is directly selectable');
  await p.locator('.at-view-current').hover();await p.locator('[data-at-view=radial]').click();assert.equal(await current(),'radial');
  await p.locator('.at-view-current').focus();await p.keyboard.press('End');assert.equal(await p.evaluate(()=>document.activeElement.dataset.atView),'solar');
  await p.keyboard.press('Enter');assert.equal(await current(),'solar');
  await p.keyboard.press('Escape');await p.locator('#at-view-dialog').waitFor({state:'hidden'});
  await p.locator('.at-view-current').hover();await p.locator('#at-view-dialog').waitFor();
  await p.screenshot({path:path.join(out,'after-3d.png')});
  // Badge is driven by the public backend plans, not hardcoded for all 3D modes.
  await p.evaluate(()=>{const plans=ShiyuEntitlements.plans(),free=plans.find(p=>p.id==='free');window.__pickerFreeBefore=structuredClone(free.entitlements);const b=free.entitlements.find(b=>b.key==='atlas-3d');b.enabled=true;ShiyuEntitlements.decorate()});
  assert.equal(await p.locator('[data-at-view-panel="3d"] [data-entitlement-badge]').count(),0);
  await p.evaluate(()=>{ShiyuEntitlements.plans().find(p=>p.id==='free').entitlements=window.__pickerFreeBefore;ShiyuEntitlements.decorate()});
  assert.equal(await p.locator('[data-at-view-panel="3d"] [data-entitlement-badge]').count(),2);
  await p.setViewportSize({width:390,height:844});await p.locator('.at-view-current').hover();await p.waitForTimeout(150);
  const menu=await p.locator('#at-view-dialog').boundingBox();assert(menu.x>=0&&menu.y>=0&&menu.x+menu.width<=390&&menu.y+menu.height<=844);
  assert(await p.locator('[data-at-view]').evaluateAll(ns=>ns.every(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})),'mobile menu options must not be covered by header actions');
  await p.screenshot({path:path.join(out,'mobile.png')});
  // Removing the user's server-owned 3D entitlement must still block selection.
  await p.evaluate(()=>{window.__shiyuUserEntitlements={...window.__shiyuUserEntitlements,entitlements:window.__shiyuUserEntitlements.entitlements.filter(b=>b.key!=='atlas-3d')};dispatchEvent(new Event('shiyu-user-entitlements'))});
  await p.locator('.at-view-current').hover();await p.locator('[data-at-view=radial]').click();
  for(const id of ['organization','mindmap','radial','organization','mindmap','radial']){await p.locator('.at-view-current').click();assert.equal(await current(),id,'free-user cycle skips paid modes');assert.equal(await p.locator('#member-gate[open]').count(),0,'cycling must not prompt for membership');}
  await p.locator('.at-view-current').hover();await p.locator('[data-at-view=spatial]').click();
  assert.equal(await p.locator('.at-shell').getAttribute('data-mode'),'2d');await p.locator('#member-gate[open]').waitFor();
  await p.locator('#member-gate').evaluate(d=>d.close());
  // Backend-disabled modes are absent from the unified picker and cycle.
  f.operations.spaceViews={graph:{twoD:{enabled:true,radial:true,organization:false,mindmap:true},threeD:{enabled:false,micro:true,galaxy:true}}};
  await p.setViewportSize({width:1772,height:1015});await p.reload({waitUntil:'networkidle'});
  await p.evaluate(()=>{view='space';render()});
  if(!await p.locator('#space-atlas[open]').count())await p.locator('.workspace .space-mode-entry').click();
  await p.locator('.at-view-current').hover();assert.deepEqual(await p.locator('[data-at-view]').evaluateAll(ns=>ns.map(n=>n.dataset.atView)),['radial','mindmap']);
  await p.locator('.at-view-current').hover();await p.locator('[data-at-view=radial]').click();await p.locator('.at-view-current').click();assert.equal(await current(),'mindmap');await p.locator('.at-view-current').click();assert.equal(await current(),'radial');
  // Only one accessible option, with paid options still visible in the popup.
  f.operations.spaceViews.graph.twoD.mindmap=false;f.operations.spaceViews.graph.threeD.enabled=true;
  await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>{view='space';render()});
  if(!await p.locator('#space-atlas[open]').count())await p.locator('.workspace .space-mode-entry').click();
  await p.evaluate(()=>{window.__shiyuUserEntitlements={...window.__shiyuUserEntitlements,entitlements:window.__shiyuUserEntitlements.entitlements.filter(b=>b.key!=='atlas-3d')};dispatchEvent(new Event('shiyu-user-entitlements'));window.__cycleButton=document.querySelector('.at-view-current')});
  for(let i=0;i<3;i++)await p.locator('.at-view-current').click();
  assert.equal(await current(),'radial');assert(await p.evaluate(()=>window.__cycleButton===document.querySelector('.at-view-current')),'single choice must not rerender or reset graph');
  assert.equal(await p.locator('#member-gate[open]').count(),0);
  assert.equal(await p.locator('[data-at-view]').count(),3,'paid options stay in popup');
  // A catalog with just one total option also keeps the current graph untouched.
  f.operations.spaceViews.graph.threeD.enabled=false;
  await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>{view='space';render()});
  if(!await p.locator('#space-atlas[open]').count())await p.locator('.workspace .space-mode-entry').click();
  await p.evaluate(()=>{window.__cycleButton=document.querySelector('.at-view-current')});await p.locator('.at-view-current').click();
  assert.equal(await p.locator('[data-at-view]').count(),1);assert(await p.evaluate(()=>window.__cycleButton===document.querySelector('.at-view-current')));
 }
 assert.deepEqual(f.errors,[]);await f.context.close();
 console.log(baseline?'Captured baseline':'PASS style order and picker');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
