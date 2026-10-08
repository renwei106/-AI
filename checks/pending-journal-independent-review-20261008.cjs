/* Independent regression review; every API is intercepted by a local fixture. */
require('./keyboard-ui-audit-bootstrap-20261008.cjs');
const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { fixture } = require('./verify-desktop-pet.cjs');
const assert = require('node:assert/strict');
const A = 'pet-local-check', B = 'other-fixture-owner';
const copy = value => JSON.parse(JSON.stringify(value));
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };
const flatten = value => value.flatMap(s => s.scenes.flatMap(c => c.groups.flatMap(g => g.items.map(i => i[1]))));
const requestSave = (page, suffix, owner=A, target={spaceId:'work',sceneId:'daily',groupId:'tools'}) => page.evaluate(({suffix, owner, target}) => ShiyuExtensionStore.save({accountId:owner, mode:'group', ...target, title:'Independent '+suffix, url:'https://example.test/reviewer-'+suffix}), { suffix, owner, target });
async function state(page) { return page.evaluate(() => ({ owner:prefs.accountProfile?.id, data:JSON.parse(JSON.stringify(data)), inbox:(prefs.extensionInbox||[]).map(row=>row.item[1]), pending:ShiyuExtensionStore.pending() })); }
async function ready(browser) {
  const f=await fixture(browser); const baseline=await f.page.evaluate(()=>JSON.parse(JSON.stringify(data)));
  await f.page.waitForTimeout(500); return {...f, baseline};
}
async function failures(browser) {
 const f=await ready(browser); let puts=0;
 try {
  await f.context.route('**/api/shiyu/auth/account',async route=>{if(route.request().method()==='PUT'){puts++;return route.fulfill({status:400,json:{message:'Local fixture failure'}});}return route.fulfill({json:{userId:A,data:f.baseline}});});
  await requestSave(f.page,'failure'); await f.page.waitForTimeout(1800);
  assert.equal(puts,1,'failed mutation must not automatically PUT every 350 ms');
  const s=await state(f.page); assert.equal(s.pending.filter(e=>e.accountId===A).length,1); assert(flatten(s.data).includes('https://example.test/reviewer-failure'));
  await f.context.route('**/api/shiyu/auth/account',async route=>route.fulfill({json:{userId:A,data:f.baseline}}));
  await f.page.evaluate(()=>persist()); await f.page.waitForFunction(()=>!ShiyuExtensionStore.pending('pet-local-check').length);
  console.log('PASS PUT failure preserves mutation, stops retry loop, explicit persistence retries');
 } finally { await f.context.close(); }
}
async function ownerInbox(browser) {
 const f=await ready(browser);
 try {
  await f.page.evaluate(()=>ShiyuExtensionStore.save({accountId:'pet-local-check',mode:'temporary',title:'A inbox',url:'https://example.test/reviewer-owner-inbox'}));
  await f.page.waitForFunction(()=>!ShiyuExtensionStore.pending('pet-local-check').length);
  assert((await state(f.page)).inbox.includes('https://example.test/reviewer-owner-inbox'));
  await f.page.evaluate(({B})=>ShiyuAccountSession.applyLogin({user:{id:B,name:'B'},accountData:[{id:'b',name:'B',scenes:[{id:'bc',name:'B',groups:[{id:'bg',name:'B',items:[]}]}]}]}),{B});
  assert.deepEqual((await state(f.page)).inbox,[],'A inbox cannot appear to B');
  await f.page.evaluate(({A,baseline})=>ShiyuAccountSession.applyLogin({user:{id:A,name:'A'},accountData:baseline}),{A,baseline:f.baseline});
  assert((await state(f.page)).inbox.includes('https://example.test/reviewer-owner-inbox'),'returning A retains own inbox');
  console.log('PASS owner-specific acknowledged inbox restores without cross-account leakage');
 } finally { await f.context.close(); }
}
async function staleGet(browser) {
 const f=await ready(browser), gate=deferred(), started=deferred(); let server=copy(f.baseline), hold=true, puts=0;
 try {
  await f.context.route('**/api/shiyu/auth/account',async route=>{
   if(route.request().method()==='PUT'){puts++;server=route.request().postDataJSON().data;return route.fulfill({json:{userId:A,data:server}});}
   if(hold){hold=false;started.resolve();await gate.promise;return route.fulfill({json:{userId:A,data:f.baseline}});}
   return route.fulfill({json:{userId:A,data:server}});
  });
  await f.page.evaluate(()=>{void refreshShiyuMembership(true);}); await started.promise;
  await requestSave(f.page,'stale-get'); await f.page.waitForFunction(()=>!ShiyuExtensionStore.pending('pet-local-check').length);
  assert.equal(puts,1); gate.resolve(); await f.page.waitForTimeout(500);
  assert(flatten((await state(f.page)).data).includes('https://example.test/reviewer-stale-get'),'old GET must not overwrite already PUT/ACKed mutation');
  await f.page.evaluate(()=>refreshShiyuMembership(true));
  assert(flatten((await state(f.page)).data).includes('https://example.test/reviewer-stale-get'),'fresh hydration must retain successful server save');
  console.log('PASS GET begun before save cannot overwrite later successful PUT/ACK; fresh hydrate retains');
 } finally { gate.resolve(); await f.context.close(); }
}
async function concurrentPut(browser) {
 const f=await ready(browser), gate=deferred(), started=deferred(); let bodies=[],server=copy(f.baseline);
 try {
  await f.context.route('**/api/shiyu/auth/account',async route=>{
   if(route.request().method()==='PUT') {const body=route.request().postDataJSON();bodies.push(body);if(bodies.length===1){started.resolve();await gate.promise;}server=body.data;return route.fulfill({json:{userId:body.userId,data:server}});}
   return route.fulfill({json:{userId:A,data:server}});
  });
  await requestSave(f.page,'concurrent-one'); await started.promise; await requestSave(f.page,'concurrent-two'); await f.page.waitForTimeout(450);
  assert.equal((await state(f.page)).pending.length,2); assert.equal(bodies.length,1,'single-flight prevents out-of-order PUT replacement');
  gate.resolve(); await f.page.waitForFunction(()=>!ShiyuExtensionStore.pending('pet-local-check').length);
  assert.equal(bodies.length,2); assert(!flatten(bodies[0].data).includes('https://example.test/reviewer-concurrent-two'));
  assert(flatten(bodies[1].data).includes('https://example.test/reviewer-concurrent-one')); assert(flatten(bodies[1].data).includes('https://example.test/reviewer-concurrent-two'));
  console.log('PASS captured-ID ACK preserves later entry; queued second PUT includes both');
 } finally { gate.resolve(); await f.context.close(); }
}
async function ownerInflight(browser) {
 const f=await ready(browser), gate=deferred(), started=deferred(); let bodies=[];
 try {
  await f.context.route('**/api/shiyu/auth/account',async route=>{
   if(route.request().method()==='PUT') {const body=route.request().postDataJSON();bodies.push(body);if(body.userId===A){started.resolve();await gate.promise;}return route.fulfill({json:{userId:body.userId,data:body.data}});}
   return route.fulfill({json:{userId:B,data:[]}});
  });
  await requestSave(f.page,'old-owner'); await started.promise;
  await f.page.evaluate(({B})=>ShiyuAccountSession.applyLogin({user:{id:B,name:'B'},accountData:[{id:'b',name:'B',scenes:[{id:'bc',name:'B',groups:[{id:'bg',name:'B',items:[]}]}]}]}),{B});
  await requestSave(f.page,'new-owner',B,{spaceId:'b',sceneId:'bc',groupId:'bg'}); await f.page.waitForTimeout(450);gate.resolve();
  await f.page.waitForFunction(()=>!ShiyuExtensionStore.pending('other-fixture-owner').length);
  const s=await state(f.page);assert.equal(s.owner,B);assert.equal(s.pending.filter(e=>e.accountId===A).length,1,'stale owner response cannot ACK A');assert(!flatten(s.data).includes('https://example.test/reviewer-old-owner'));assert(flatten(s.data).includes('https://example.test/reviewer-new-owner'));
  assert(bodies.filter(x=>x.userId===B).every(x=>!flatten(x.data).includes('https://example.test/reviewer-old-owner')));
  console.log('PASS owner switch during PUT rejects stale ACK and never sends A item in B payload');
 } finally { gate.resolve(); await f.context.close(); }
}
async function missingTarget(browser) {
 const f=await ready(browser); let puts=0;
 try {
  await f.context.route('**/api/shiyu/auth/account',async route=>{if(route.request().method()==='PUT')puts++;return route.fulfill({json:{userId:A,data:[]}});});
  await requestSave(f.page,'missing-target');
  await f.page.evaluate(()=>{data=[];const s=JSON.parse(localStorage.getItem(ShiyuExtensionStore.KEY));s.data=[];localStorage.setItem(ShiyuExtensionStore.KEY,JSON.stringify(s));});
  await f.page.waitForTimeout(1800);assert(puts<=1,'vanished target must not create repeated success PUTs');assert.equal((await state(f.page)).pending.length,1,'unapplied mutation must remain journaled');
  console.log('PASS vanished target remains journaled without repeated PUT loop');
 } finally { await f.context.close(); }
}
async function explicitDeletion(browser) {
 for(const mode of ['delete','edit-url']) {
  const f=await ready(browser);let puts=0,server=copy(f.baseline);
  try {
   await f.context.route('**/api/shiyu/auth/account',async route=>{
    if(route.request().method()==='PUT') {puts++;if(puts===1)return route.fulfill({status:400,json:{message:'Local fixture failure'}});server=route.request().postDataJSON().data;return route.fulfill({json:{userId:A,data:server}});}
    return route.fulfill({json:{userId:A,data:server}});
   });
   const suffix='explicit-'+mode;await requestSave(f.page,suffix);await f.page.waitForTimeout(850);
   assert.equal(puts,1);assert.equal((await state(f.page)).pending.length,1);
   await f.page.evaluate(({mode,suffix})=>{const items=data.find(s=>s.id==='work').scenes.find(c=>c.id==='daily').groups.find(g=>g.id==='tools').items;const at=items.findIndex(i=>i[1]==='https://example.test/reviewer-'+suffix);if(mode==='delete')items.splice(at,1);else items[at][1]='https://example.test/reviewer-edited-destination';persist();},{mode,suffix});
   assert.equal((await state(f.page)).pending.length,0,'explicit user edit cancels old mutation');
   await f.page.waitForTimeout(500);assert.equal(puts,2,'user action sends current state once');
   await f.page.evaluate(()=>refreshShiyuMembership(true));const s=await state(f.page);
   assert(!flatten(s.data).includes('https://example.test/reviewer-'+suffix),'old URL must not resurrect after persistence/hydration');
   if(mode==='edit-url')assert(flatten(s.data).includes('https://example.test/reviewer-edited-destination'));
   console.log('PASS pending '+mode+' stays deleted/edited after next PUT and hydration');
  }finally{await f.context.close();}
 }
}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const check of process.argv.includes('--last-change')?[explicitDeletion]:[failures,ownerInbox,staleGet,concurrentPut,ownerInflight,missingTarget,explicitDeletion])await check(browser);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
