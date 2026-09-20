const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const store=require('../../聚合管理后台/membership/plan-store.cjs');
const catalog=store.getCatalog();
const clone=x=>JSON.parse(JSON.stringify(x));
const free=store.normalizePlan({id:'free',name:'免费版',enabled:true,price:0,days:0,entitlements:[]});
const paid=store.normalizePlan({id:'monthly',name:'月度会员',enabled:true,price:10,days:30,entitlements:[]});
function set(plan,key,value){const b=plan.entitlements.find(b=>b.key===key);b.value=value;b.enabled=true;}
set(free,'global-fonts',['youfeng','sans']);set(free,'global-colors',['#48614c']);set(free,'global-layouts',['safe']);set(free,'space-limit',2);set(free,'scene-limit',2);set(free,'group-limit',2);set(free,'corner-limit',2);
const yearly=clone(paid);yearly.id='yearly';yearly.name='年度会员';yearly.days=365;set(yearly,'space-limit',30);
const plans=[free,paid,yearly];
const workspace=[{id:'work',name:'工作空间',icon:'folder',scenes:[{id:'daily',name:'日常',description:'',groups:[{id:'tools',name:'常用',items:[['收藏','https://example.com','', '网']]}]}]}];
const pref={theme:'base',mode:'light',color:'#48614c',font:'youfeng',width:'safe',explicitFont:true,inspirationMockV1:true,firstSpaceCapacityV1:true,twelveSpacePreviewAdded:true,accountProfile:{id:'qa-membership',name:'测试用户',email:'qa@example.test'},accountDataUserId:'qa-membership',cornerCollections:{'qa-membership':{stageVersion:2,groups:[{id:'one',name:'常用',iconMode:'theme',refs:[]},{id:'inbox',system:'inbox',name:'暂存',refs:[]}]}}};
let currentPlan=free,currentMember=false,permanent=false,expiresAt=null,mutations=[];
const json=(route,value)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(value)});
function membership(){return{member:currentMember,permanent,expiresAt,planId:currentPlan.id,planName:currentPlan.name,entitlements:currentPlan.entitlements};}
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];
await context.addInitScript(({workspace,pref})=>{if(location.protocol!=='http:')return;localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data:workspace,prefs:pref,signed:true,styles:{},overrides:{}}));},{workspace,pref});
await context.route('**/api/**',async route=>{
 const u=new URL(route.request().url()),method=route.request().method();
 if(u.pathname==='/api/shiyu/plans')return json(route,{items:plans});
 if(u.pathname==='/api/shiyu/plans/catalog')return json(route,catalog);
 if(u.pathname==='/api/shiyu/auth/session')return json(route,{authenticated:true,user:{id:'qa-membership',name:'测试用户',email:'qa@example.test',member:currentMember,memberExpiresAt:permanent?'永久':expiresAt?new Date(expiresAt).toISOString():null,membership:membership()}});
 if(u.pathname==='/api/shiyu/auth/account'){if(method!=='GET')mutations.push(u.pathname);return json(route,{data:workspace});}
 if(u.pathname.startsWith('/api/shiyu/theme-access'))return json(route,{member:currentMember,memberExpired:false,fallback:'base',items:catalog.resources.themes.map(t=>({...t,memberOnly:!free.entitlements.find(b=>b.key==='themes').value.includes(t.id),allowed:currentPlan.entitlements.find(b=>b.key==='themes').value.includes(t.id)})),previews:{}});
 if(u.pathname==='/api/shiyu/payments/status')return json(route,{enabled:false,providers:{}});
 if(u.pathname==='/api/shiyu/payments/account')return json(route,{member:currentMember,memberExpiresAt:expiresAt,membership:membership()});
 if(u.pathname==='/api/shiyu/auth/invitations')return json(route,{enabled:false,items:[]});
 if(method!=='GET'){mutations.push('blocked:'+u.pathname);return json(route,{ok:true});}
 return route.continue();
});
const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));const out=path.resolve('tests/artifacts-membership');fs.mkdirSync(out,{recursive:true});
try{
 await p.goto('http://127.0.0.1:4318/');await p.waitForFunction(()=>window.__shiyuUserEntitlements?.ready&&window.__shiyuMemberResources&&window.__shiyuMemberCatalog?.ready);
 assert.equal(await p.evaluate(()=>ShiyuEntitlements.allows('global-fonts','youfeng')),true);
 await p.evaluate(()=>{settingsTab='type';renderSettings();show('#settings')});
 await p.waitForSelector('[data-pref="font"][data-value="serif"] [data-entitlement-badge]');
 await p.locator('[data-pref="font"][data-value="serif"]').click();
 assert.equal(await p.evaluate(()=>prefs.font),'youfeng');assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'personal');
 assert.equal(await p.locator('#member-gate article').count(),8);
 await p.locator('#member-gate').screenshot({path:path.join(out,'gate-personal-light.png'),animations:'disabled'});
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 currentPlan=clone(paid);set(currentPlan,'global-fonts',['youfeng','sans']);currentMember=true;expiresAt=Date.now()+86400000;await p.evaluate(()=>refreshShiyuMembership());
 await p.evaluate(()=>{settingsTab='type';renderSettings();show('#settings')});await p.locator('[data-pref="font"][data-value="serif"]').click();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'personal');assert.equal(await p.evaluate(()=>isMember()),true);assert.equal(await p.evaluate(()=>prefs.font),'youfeng');
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));currentPlan=free;currentMember=false;expiresAt=null;await p.evaluate(()=>refreshShiyuMembership());
 await p.evaluate(()=>{settingsTab='layout';renderSettings();show('#settings')});await p.locator('[data-pref="width"][data-value="wide"]').click();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'personal');assert.equal(await p.evaluate(()=>prefs.width),'safe');
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await p.evaluate(()=>{settingsTab='colors';renderSettings();show('#settings')});await p.locator('[data-pref="color"][data-value="#467ea5"]').click();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'personal');assert.equal(await p.evaluate(()=>prefs.color),'#48614c');await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await p.evaluate(()=>{prefs.mode='dark';prefs.color='#8b83d1';prefs.explicitColor='#8b83d1';apply();memberGate('space')});
 assert.match(await p.locator('[data-feature="space"] .gate-feature-detail').innerText(),/20.*起/);
 assert.equal(await p.evaluate(()=>getComputedStyle(document.querySelector('#member-gate')).getPropertyValue('--accent').trim()),'#8b83d1');
 await p.locator('#member-gate').screenshot({path:path.join(out,'gate-space-dark-purple.png'),animations:'disabled'});
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await p.evaluate(()=>{goSpace('work');openLinkSettings()});await p.locator('[data-link-view="book"]').click();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'personal');await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await p.locator('.space-mode-entry').hover();await p.waitForSelector('[data-space-mode="atlas"]',{state:'visible'});await p.locator('[data-space-mode="atlas"]').click();
 await p.waitForSelector('#space-atlas[open]');assert.equal(await p.locator('#space-atlas .at-shell').getAttribute('data-mode'),'2d');
 await p.waitForSelector('[data-at="toggle-dimension"] [data-entitlement-badge]');await p.locator('[data-at="toggle-dimension"]').click();
 assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'atlas');assert.equal(await p.locator('#space-atlas .at-shell').getAttribute('data-mode'),'2d');
 await p.locator('#member-gate').screenshot({path:path.join(out,'gate-atlas-dark-purple.png'),animations:'disabled'});
 await p.evaluate(()=>document.querySelector('#member-gate').close());
 currentPlan=paid;currentMember=true;expiresAt=Date.now()+86400000;
 await p.evaluate(()=>refreshShiyuMembership());await p.locator('[data-at="toggle-dimension"]').click();assert.equal(await p.locator('#space-atlas .at-shell').getAttribute('data-mode'),'3d');
 assert.equal(await p.locator('[data-at-dimension="3d"] [data-entitlement-badge]').count(),1);
 currentMember=false;currentPlan=free;expiresAt=null;await p.evaluate(()=>refreshShiyuMembership());assert.equal(await p.locator('#space-atlas .at-shell').getAttribute('data-mode'),'2d');
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await p.evaluate(()=>editOrganization('space'));await p.locator('.inline-create input').fill('第二空间');await p.locator('.inline-create input').press('Enter');await p.waitForFunction(()=>data.length===2);
 await p.evaluate(()=>editOrganization('space'));assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'space');
 await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());editOrganization('space','work')});assert.equal(await p.locator('#organization-name').count(),1);
 for(const [kind,name] of [['scene','第二场景'],['group','第二分组']]){
  await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await p.evaluate(kind=>editOrganization(kind),kind);await p.locator('.inline-create input').fill(name);await p.locator('.inline-create input').press('Enter');await p.waitForFunction(kind=>organizationList(kind).length===2,kind);await p.evaluate(kind=>editOrganization(kind),kind);assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),kind);
 }
 await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());changeView('home')});
 await p.locator('.corner-entry').click({force:true});await p.waitForSelector('#my-corner[open]');
 assert.equal(await p.evaluate(()=>prefs.cornerCollections['qa-membership'].groups.filter(g=>g.system!=='inbox').length),1);
 await p.evaluate(()=>document.querySelector('[data-corner-new]').click());assert.equal(await p.evaluate(()=>prefs.cornerCollections['qa-membership'].groups.filter(g=>g.system!=='inbox').length),2);
 await p.waitForSelector('#my-corner .is-flipped');await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#my-corner .is-flipped'));await p.evaluate(()=>document.querySelector('[data-corner-new]').click());assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'corner');
 await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 set(free,'space-limit',4);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.waitForFunction(()=>ShiyuEntitlements.limit('space')===4&&memberCatalogQuantity('space',false).value===4);assert.equal(await p.evaluate(()=>ShiyuEntitlements.requireQuota('space',2)),true);set(free,'space-limit',2);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.waitForFunction(()=>ShiyuEntitlements.limit('space')===2&&memberCatalogQuantity('space',false).value===2);
 const opened=context.waitForEvent('page');await p.evaluate(()=>openMemberCenter());const m=await opened;m.on('pageerror',e=>errors.push(e.message));await m.waitForLoadState();await m.waitForSelector('[data-published-plan="monthly"]');
 assert.equal(await m.locator('#member-center .member-comparison tbody tr').count(),13);
 assert.equal(await m.locator('[data-published-plan="free"]').isDisabled(),true);
 const content=await m.locator('#member-center .member-comparison').innerText();assert.match(content,/2 种/);assert(!content.includes('youfeng'));
 const alignment=await m.evaluate(()=>{const a=document.querySelector('[data-published-plan="monthly"]').getBoundingClientRect(),b=document.querySelector('.member-comparison tbody tr td:nth-of-type(2)').getBoundingClientRect();return Math.abs(a.x+a.width/2-b.x-b.width/2)});assert(alignment<3,'plan/benefit columns align: '+alignment);
 currentPlan=paid;currentMember=true;permanent=true;expiresAt=null;await m.evaluate(()=>refreshShiyuMembership());await m.waitForFunction(()=>document.querySelector('.member-current-status')?.textContent.includes('永久会员'));
 await m.locator('#member-center').screenshot({path:path.join(out,'center-permanent-summary.png'),animations:'disabled'});
 await m.close();
 assert.deepEqual(errors,[]);assert(!mutations.some(x=>x.startsWith('blocked:')),'unexpected mutation '+mutations);
 console.log('PASS: granular badges and blocked free font; 8 themed groups; quantities with first-plan 起; 2D free / 3D paid and downgrade; quota creation/edit/corner inbox exclusion; new-tab summarized center, columns and permanent header; no real writes.');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
