/* Published names are supplied by local API fixtures; no backend data is modified. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const {fixture}=require('./verify-desktop-pet.cjs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const f=await fixture(browser),p=f.page,core=p.locator('#desktop-pet .pet-character');
  const names={cat:'后台小猫',bird:'后台纸雀',sprout:'后台芽芽',line:'后台线条伙伴',paper:'后台小姑娘'};
  f.operations.personalization={pet:{enabled:true,order:Object.keys(names),options:Object.fromEntries(Object.entries(names).map(([id,name])=>[id,{enabled:true,name}]))}};
  await p.evaluate(()=>ShiyuFeatureConfig.refresh());
  await p.waitForFunction(()=>document.querySelector('#desktop-pet .pet-character').getAttribute('aria-label').startsWith('后台小姑娘'));
  await core.click();await p.locator('#desktop-pet [data-pet-action="settings"]').click();
  await p.locator('#settings [data-pet-pref="skin"]').first().waitFor();
  for(const [id,name]of Object.entries(names))assert.equal(await p.locator(`#settings [data-pet-pref="skin"][data-value="${id}"] b`).textContent(),name);
  const renamed='新的伙伴 <小满>';
  f.operations.personalization.pet.options.paper.name=renamed;
  await p.evaluate(()=>ShiyuFeatureConfig.refresh());
  assert.equal(await p.locator('#settings [data-pet-pref="skin"][data-value="paper"] b').textContent(),renamed,'an open settings panel receives the updated name as text');
  await p.locator('#settings .dialog-heading [data-action="close"]').click();await core.waitFor();
  const box=await core.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(700,400,{steps:8});await p.mouse.up();
  assert((await core.getAttribute('aria-label')).startsWith(renamed),'dragging never restores a hard-coded name');
  await p.reload({waitUntil:'networkidle'});await core.waitFor();
  assert((await core.getAttribute('aria-label')).startsWith(renamed),'reload reads the published name');
  f.operations.personalization.pet.options.paper.name='';await p.evaluate(()=>ShiyuFeatureConfig.refresh());
  await p.waitForFunction(()=>document.querySelector('#desktop-pet .pet-character').getAttribute('aria-label').startsWith('小满'));
  assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS all five configured names, live rename, safe text, drag, reload and missing-name fallback');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
