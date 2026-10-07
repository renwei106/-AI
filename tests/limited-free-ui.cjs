'use strict';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const admin=path.resolve(__dirname,'../../聚合管理后台');
const planStore=require(path.join(admin,'membership/plan-store.cjs'));
const {createLimitedFreeStore,merge}=require(path.join(admin,'membership/limited-free-store.cjs'));
const {policy}=require('../theme-access/server.cjs');
const out=path.resolve(__dirname,'artifacts-limited-free');fs.mkdirSync(out,{recursive:true});
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'limited-free-ui-'));
const limited=createLimitedFreeStore({file:path.join(temporary,'limited.json')});
const catalog=planStore.getCatalog();
const free=planStore.normalizePlan({id:'free',name:'免费版',enabled:true,price:0,days:0,entitlements:[]});
const paid=planStore.normalizePlan({id:'monthly',name:'月度会员',enabled:true,price:10,days:30,entitlements:[]});
free.entitlements.find(item=>item.key==='global-fonts').value=['youfeng','sans'];
free.entitlements.find(item=>item.key==='themes').value=['base'];
free.entitlements.find(item=>item.key==='memo-limit').value=2;
const workspace=[{id:'work',name:'工作空间',icon:'folder',scenes:[{id:'daily',name:'日常',groups:[{id:'tools',name:'常用',items:[]}]}]}];
const prefs={theme:'base',mode:'light',color:'#48614c',font:'youfeng',width:'safe',explicitFont:true,inspirationMockV1:true,firstSpaceCapacityV1:true,twelveSpacePreviewAdded:true,accountProfile:{id:'limited-ui',name:'限免测试',email:'qa@example.test'},accountDataUserId:'limited-ui'};
const snapshots=()=>({member:false,permanent:false,expiresAt:null,planId:'free',planName:'免费版',baseEntitlements:free.entitlements,entitlements:merge(free.entitlements,limited.publicState().items),limitedFree:limited.publicState().items});
let browser;const errors=[],blocked=[];
async function fixture(isAdmin=false,baseline=false) {
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await context.route('**/*',async route=>{const url=new URL(route.request().url());if(['127.0.0.1','localhost'].includes(url.hostname)&&!['/earth-theme.js','/avatar-theme.js'].includes(url.pathname))return route.fallback();return route.fulfill({status:200,contentType:route.request().resourceType()==='script'?'text/javascript':'text/plain',body:''})});
 if(!isAdmin)await context.addInitScript(({workspace,prefs})=>{localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data:workspace,prefs,signed:true,styles:{},overrides:{}}));},{workspace,prefs});
 if(baseline)await context.route('http://127.0.0.1:4318/**',async route=>{const file=new URL(route.request().url()).pathname.slice(1),original=path.resolve('baselines/limited-free-before-20261007/front/dist',file);if(['v4.js','account-access.js','member-entitlements.js','theme-availability.js'].includes(file))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(original,'utf8')});return route.fallback()});
 await context.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),method=req.method(),p=url.pathname;
  const reply=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(!['127.0.0.1','localhost'].includes(url.hostname))return reply({});
  if(p==='/api/shiyu/plans/limited-free/admin'){
   if(method==='GET')return reply(limited.read());
   try{return reply(limited.save(req.postDataJSON(),'UI QA'))}catch(e){return reply({message:e.message},e.status||400)}
  }
  if(p==='/api/shiyu/plans/catalog')return reply({...catalog,limitedFree:limited.publicState()});
  if(p==='/api/shiyu/plans')return reply({items:[free,paid],limitedFree:limited.publicState()});
  if(p==='/api/shiyu/plans/admin')return reply({schemaVersion:2,revision:0,items:[free,paid],publishedItems:[free,paid]});
  if(p==='/api/platform/session')return reply({active:true,admin:{id:'qa',name:'测试管理员',account:'qa'},applicationIds:['platform','shiyu'],roleIds:['superadmin']});
  if(p==='/api/platform/applications')return reply([{id:'shiyu',name:'拾隅',url:'http://127.0.0.1:5175/apps/shiyu/plans',enabled:true}]);
  if(p==='/api/shiyu/auth/session')return reply({authenticated:true,user:{id:'limited-ui',name:'限免测试',email:'qa@example.test',membership:snapshots(),...snapshots()}});
  if(p==='/api/shiyu/auth/wechat/qr')return reply({scene:'isolated-qa',qrUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',expiresIn:300});
  if(p==='/api/shiyu/auth/account')return reply({userId:'limited-ui',data:workspace,initialized:true});
  if(p.startsWith('/api/shiyu/theme-access'))return reply({...policy(catalog.resources.themes,[free,paid],snapshots().entitlements,false,limited.publicState().items),serverTime:Date.now(),limitedFree:limited.publicState(),previews:{},member:false});
  if(p==='/api/shiyu/payments/status')return reply({enabled:false,providers:{}});
  if(p==='/api/shiyu/payments/account')return reply({member:false,membership:snapshots()});
  if(p==='/api/shiyu/auth/invitations')return reply({enabled:false,items:[]});
  if(p==='/api/shiyu/auth/analytics')return reply({accepted:true},202);
  if(p==='/api/shiyu/auth/tools')return reply({userId:'limited-ui',tools:{}});
  if(p==='/api/shiyu/auth/tool-usage')return reply({userId:'limited-ui',entitlements:snapshots().entitlements});
  if(!['GET','HEAD'].includes(method)){blocked.push(p);return reply({message:'隔离测试阻止真实写入'},403)}
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));return {context,page};
}
const shoot=(p,name)=>p.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});
async function fontSettings(p){await p.waitForFunction(()=>window.__shiyuUserEntitlements?.ready&&window.__shiyuMemberResources);await p.evaluate(()=>{settingsTab='type';renderSettings();show('#settings')});await p.locator('[data-pref="font"][data-value="serif"] [data-entitlement-badge]').waitFor()}
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const before=await fixture(false,true);await before.page.goto('http://127.0.0.1:4318/');await fontSettings(before.page);await shoot(before.page,'font-before');await before.context.close();
  const front=await fixture();await front.page.goto('http://127.0.0.1:4318/');await fontSettings(front.page);await shoot(front.page,'font-unchanged');
  assert.equal(await front.page.evaluate(()=>ShiyuEntitlements.allows('global-fonts','serif')),false);
  const back=await fixture(true);await back.page.goto('http://127.0.0.1:5175/apps/shiyu/plans');await back.page.getByText('限时免费',{exact:true}).click();await back.page.getByRole('button',{name:'新增限免',exact:true}).click();
  const drawer=back.page.locator('.ant-drawer-open').last();await drawer.getByLabel('权益分组',{exact:true}).click();await back.page.locator('.ant-select-dropdown:visible').getByText('全局个性化',{exact:true}).last().click();
  await drawer.getByRole('checkbox',{name:'全局字体',exact:true}).check();await drawer.getByRole('checkbox',{name:'经典宋体',exact:true}).check();
  await shoot(back.page,'admin-create');await drawer.getByRole('button',{name:/保\s*存/}).click();await back.page.waitForFunction(()=>!document.querySelector('.ant-drawer-open'));assert.equal(limited.read().items[0].key,'global-fonts');await shoot(back.page,'admin-list');
  await front.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await front.page.waitForFunction(()=>ShiyuEntitlements.allows('global-fonts','serif'));assert.equal(await front.page.locator('[data-pref="font"][data-value="serif"] [data-entitlement-badge]').innerText(),'限免');await shoot(front.page,'font-limited');
  await front.page.locator('[data-pref="font"][data-value="serif"]').click();assert.equal(await front.page.evaluate(()=>prefs.font),'serif');assert.equal(await front.page.evaluate(()=>isMember()),false);
  await back.page.getByRole('button',{name:/编\s*辑/}).click();await drawer.getByLabel('启用限免',{exact:true}).click();await drawer.getByRole('button',{name:/保\s*存/}).click();await back.page.waitForFunction(()=>!document.querySelector('.ant-drawer-open'));assert.equal(limited.read().items[0].enabled,false);
  await front.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await front.page.waitForFunction(()=>!ShiyuEntitlements.allows('global-fonts','serif'));await front.page.locator('[data-pref="font"][data-value="serif"] .limited-free-badge').waitFor({state:'detached'});await shoot(front.page,'font-stopped');
  let state=limited.read(),r=state.items[0];limited.save({revision:state.revision,items:[{...r,enabled:true,startsAt:Date.now()-1000,endsAt:Date.now()+4000}]},'expiry QA');
  await front.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await front.page.waitForFunction(()=>ShiyuEntitlements.allows('global-fonts','serif'));await front.page.waitForFunction(()=>!ShiyuEntitlements.allows('global-fonts','serif'),{},{timeout:9000});await front.page.locator('[data-pref="font"][data-value="serif"] .limited-free-badge').waitFor({state:'detached'});
  await back.page.locator('.ant-segmented-item').filter({hasText:/^套餐与权益$/}).click();await back.page.locator('.ant-segmented-item').filter({hasText:/^限时免费$/}).click();
  await back.page.getByRole('button',{name:'新增限免',exact:true}).click();await drawer.getByLabel('权益分组',{exact:true}).click();await back.page.locator('.ant-select-dropdown:visible').getByText('主题',{exact:true}).last().click();
  const themeChoices=catalog.resources.themes.filter(item=>item.enabled!==false&&item.id!=='base');assert.equal(await drawer.getByRole('checkbox').count(),themeChoices.length);
  for(const id of ['cosmos','music'])await drawer.getByRole('checkbox',{name:themeChoices.find(item=>item.id===id).name,exact:true}).check();
  await shoot(back.page,'admin-theme-multiselect');await drawer.getByRole('button',{name:/保\s*存/}).click();await back.page.waitForFunction(()=>!document.querySelector('.ant-drawer-open'));assert.deepEqual(limited.read().items.find(item=>item.key==='themes').value.sort(),['cosmos','music']);
  await front.page.evaluate(()=>{document.querySelector('#settings').close();window.dispatchEvent(new Event('focus'))});await front.page.waitForFunction(()=>window.__shiyuThemeCatalog?.some(item=>item.id==='cosmos'&&item.limitedFree&&item.allowed));await front.page.evaluate(()=>{settingsTab='display';renderSettings();show('#settings')});
  await front.page.waitForFunction(()=>[...document.querySelectorAll('[data-brand-theme="cosmos"],[data-v2-theme="cosmos"]')].some(button=>button.querySelector('.limited-free-badge')?.textContent==='限免'));await shoot(front.page,'theme-limited');
  await back.page.getByRole('button',{name:'新增限免',exact:true}).click();await drawer.getByLabel('权益分组',{exact:true}).click();await back.page.locator('.ant-select-dropdown:visible').getByText('分享',{exact:true}).last().click();
  await drawer.getByRole('checkbox',{name:'分享密码',exact:true}).check();await drawer.getByRole('checkbox',{name:'分享有效期',exact:true}).check();await shoot(back.page,'admin-group-multiselect');await drawer.getByRole('button',{name:/保\s*存/}).click();await back.page.waitForFunction(()=>!document.querySelector('.ant-drawer-open'));
  for(const key of ['share-password','share-expiry'])assert.equal(limited.read().items.filter(item=>item.key===key).length,1);
  await front.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await front.page.waitForFunction(()=>ShiyuEntitlements.allows('share-password')&&ShiyuEntitlements.allows('share-expiry'));
  await back.page.getByRole('button',{name:'切换主题',exact:true}).click();await back.page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item').filter({hasText:'夜间模式'}).click();await back.page.waitForFunction(()=>document.body.dataset.theme==='dark');
  await back.page.getByRole('button',{name:'新增限免',exact:true}).click();await drawer.getByLabel('权益分组',{exact:true}).click();await back.page.locator('.ant-select-dropdown:visible').getByText('主题',{exact:true}).last().click();await drawer.getByRole('checkbox',{name:themeChoices.find(item=>item.id==='cosmos').name,exact:true}).check();await shoot(back.page,'admin-theme-dark');await drawer.getByRole('button',{name:/取\s*消/}).click();
  assert.deepEqual(errors,[]);assert.deepEqual(blocked,[]);await back.context.close();await front.context.close();
  console.log('PASS grouped multi-select, two flat premium themes, atomic multi-entitlement save and frontend linkage, edit/stop/expiry, unchanged baseline; no real configuration writes.');
 } finally { await browser.close(); fs.rmSync(temporary,{recursive:true,force:true}); }
})().catch(e=>{console.error(e);process.exitCode=1});

