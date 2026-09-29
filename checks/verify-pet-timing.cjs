/* API responses and account operations are isolated by the shared local fixture. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const {fixture}=require('./verify-desktop-pet.cjs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const f=await fixture(browser,true,false,false),p=f.page,pet=p.locator('#desktop-pet');
  const timing=(group,gap,state)=>Object.fromEntries(['quiet','lively','excited'].map(key=>[key,{idle:{group,gap,state},hover:{group:2000,gap:1300,state}}]));
  f.operations.petTiming=timing(1200,800,6500);
  await p.clock.install();await p.reload({waitUntil:'networkidle'});
  async function trace(){await p.evaluate(()=>{window.__timingObserver?.disconnect();window.__timing=[];window.__timingObserver=new MutationObserver(records=>{const d=document.querySelector('#desktop-pet').dataset;window.__timing.push({time:performance.now(),state:d.petState,action:d.petActionId,frame:Number(d.girlFrame),vector:d.vectorAction,attributes:records.map(r=>r.attributeName)});});window.__timingObserver.observe(document.querySelector('#desktop-pet'),{attributes:true,attributeFilter:['data-pet-action-id','data-girl-frame','data-vector-action']});});}
  const groups=async()=>p.evaluate(()=>window.__timing.filter(row=>row.attributes.includes('data-pet-action-id')));
  await trace();await p.clock.runFor(14000);
  let rows=await groups();assert(rows.length>=5,'short configured cycles reach the frontend');
  for(let i=1;i<rows.length;i++)assert(rows[i].time-rows[i-1].time>=1900&&rows[i].time-rows[i-1].time<2400,'idle group duration plus rest follows API settings');
  assert(new Set(rows.map(row=>row.state)).size>1,'configured state interval changes resting states');
  await pet.locator('.pet-character').hover();await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.petState==='stand');
  await trace();await p.clock.runFor(11000);rows=await groups();
  assert(rows.length>=2&&rows.every(row=>row.state==='stand'),'hover holds the interaction state while changing groups');
  for(let i=1;i<rows.length;i++)assert(rows[i].time-rows[i-1].time>=3300&&rows[i].time-rows[i-1].time<3800,'hover has its own group and gap timings');
  await p.mouse.move(20,20);await p.clock.runFor(4500);
  f.operations.petTiming=timing(3000,1500,20000);await p.evaluate(()=>ShiyuFeatureConfig.refresh());
  await trace();await p.clock.runFor(16000);rows=await groups();
  for(let i=2;i<rows.length;i++)assert(rows[i].time-rows[i-1].time>=4500,'updated timing applies to complete subsequent groups');
  for(const skin of ['cat','bird','sprout','line']){
   await p.evaluate(()=>ShiyuDesktopPet.mount({}).close());await pet.locator('.pet-character').click();await pet.locator('[data-pet-action="settings"]').click();
   await p.locator(`#settings [data-pet-pref="skin"][data-value="${skin}"]`).click();await p.waitForFunction(value=>ShiyuDesktopPet.read().skin===value,skin);
   await p.locator('#settings .dialog-heading [data-action="close"]').click();await p.mouse.move(20,20);await p.clock.runFor(1000);
   await trace();await p.clock.runFor(13000);
   const starts=await p.evaluate(()=>window.__timing.filter((row,i,all)=>['idle-a','idle-b'].includes(row.vector)&&(i===0||all[i-1].vector!==row.vector)).map(row=>row.time));
   assert(starts.length>=2,`${skin} uses global gesture timing`);
   for(let i=1;i<starts.length;i++)assert(starts[i]-starts[i-1]>=4400&&starts[i]-starts[i-1]<=4650,`${skin} shares the configured group and gap`);
  }
  assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS API timing, independent hover cycles, state timing, live updates and all five companions');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
