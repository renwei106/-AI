/* Local fixtures only; no production settings or account writes. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {fixture}=require('./verify-desktop-pet.cjs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const f=await fixture(browser,true,false,false),p=f.page,pet=p.locator('#desktop-pet');
  f.operations.personalization={pet:{enabled:true,order:['paper','swordswoman'],options:{paper:{enabled:true,name:'小满'},swordswoman:{enabled:true,name:'听风女侠'}}}};
  f.operations.petTiming={lively:{idle:{group:1200,gap:800,state:6500},hover:{group:1400,gap:600,state:6500}}};
  await p.clock.install();await p.reload({waitUntil:'networkidle'});
  assert.equal(await pet.getAttribute('data-skin'),'paper','new companion does not change the default');
  await pet.locator('.pet-character').click();await pet.locator('[data-pet-action="settings"]').click();
  const option=p.locator('#settings [data-pet-pref="skin"][data-value="swordswoman"]');assert((await option.innerText()).includes('听风女侠'));
  await option.click();await p.locator('#settings .dialog-heading [data-action="close"]').click();await p.mouse.move(20,20);
  await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.skin==='swordswoman');
  await p.evaluate(()=>{window.__frames=[];new MutationObserver(()=>{const d=document.querySelector('#desktop-pet').dataset;window.__frames.push({state:d.petState,id:d.petActionId,frame:d.girlFrame,time:performance.now()})}).observe(document.querySelector('#desktop-pet'),{attributes:true,attributeFilter:['data-girl-frame','data-pet-action-id']});});
  await p.clock.runFor(16000);const rows=await p.evaluate(()=>window.__frames);assert(rows.some(r=>r.state==='sit')&&rows.some(r=>r.state==='lie'),JSON.stringify({rows,dataset:await pet.evaluate(el=>({...el.dataset})),errors:f.errors}));
  assert(rows.every(r=>r.id.startsWith('swordswoman-')),'independent action IDs');
  await pet.locator('.pet-character').hover();await p.clock.runFor(300);assert.equal(await pet.getAttribute('data-pet-state'),'stand');assert.equal(await pet.getAttribute('data-open'),'true');
  f.operations.petActions={'swordswoman-stand-draw':false,'swordswoman-stand-guard':false};await p.evaluate(()=>ShiyuFeatureConfig.refresh());await p.clock.runFor(2500);assert.equal(await pet.getAttribute('data-pet-action-id'),'swordswoman-stand-practice');
  for(const [phase,state] of [['walk','jog'],['run','sprint'],['jump','jump'],['flight','flight']]){
   await pet.evaluate((el,phase)=>el.dataset.roamPhase=phase,phase);await p.clock.runFor(60);assert.equal(await pet.getAttribute('data-pet-state'),state);
   const src=await pet.locator('.pet-girl-cutout').getAttribute('src');assert(src.includes('pet-swordswoman-frame-'));
  }
  await pet.evaluate(el=>el.dataset.roamPhase='idle');await p.clock.runFor(60);
  const out=path.join(__dirname,'swordswoman-source');await p.screenshot({path:path.join(out,'frontend.png')});
  await p.clock.resume();await p.reload({waitUntil:'networkidle'});assert.equal(await pet.getAttribute('data-skin'),'swordswoman','account remembers selected skin');
  f.operations.personalization.pet.options.swordswoman.enabled=false;await p.evaluate(()=>ShiyuFeatureConfig.refresh());assert.notEqual(await pet.getAttribute('data-skin'),'swordswoman','backend switch hides disabled companion');
  assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS swordswoman default preservation, backend name/switch/actions, all states, timing and account persistence');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
