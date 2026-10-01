// Browser regression with an in-memory account. No real account/config mutations.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {getCatalog,normalizePlan,createPlanStore}=require('../../聚合管理后台/membership/plan-store.cjs');
const {saveTool,daily}=require('../payments/tool-quotas.cjs');
const out=path.resolve('.local/tool-entitlements-qa');fs.mkdirSync(out,{recursive:true});
const catalog=getCatalog(),free=normalizePlan({id:'free',name:'免费版',price:0,days:0,cycle:'长期',tag:'',enabled:true,autoRenew:false,entitlements:[]}),paid=normalizePlan({id:'monthly',name:'月度会员',price:10,days:30,cycle:'月度',tag:'',enabled:true,autoRenew:false,entitlements:[]});
const plans=[free,paid];const set=(p,k,v)=>p.entitlements.find(b=>b.key===k).value=v;
set(free,'memo-limit',2);set(free,'todo-limit',1);set(free,'corner-limit',1);set(free,'icon-daily-limit',2);set(free,'color-daily-limit',1);
const id='tool-quota-qa',user={id},workspace=[{id:'work',name:'工作',icon:'folder',scenes:[{id:'day',name:'日常',groups:[{id:'tools',name:'常用',items:[]}]}]}];
const notes=[{id:'memo-a',title:'在用小记',content:'原有内容',createdAt:1,updatedAt:1,number:1,color:'theme'},{id:'memo-b',title:'归档小记',content:'归档',createdAt:2,updatedAt:2,number:2,archivedAt:2,color:'theme'},{id:'memo-c',title:'废纸船',content:'待恢复',createdAt:3,updatedAt:3,number:3,deletedAt:3,color:'theme'}];
const calendar={version:2,revision:0,groups:[],tasks:[{id:'todo-a',title:'唯一未完成事项',description:'',groupId:'',done:false,status:'today',date:'',dateEnd:'',start:null,duration:30,priority:0},{id:'todo-b',title:'已完成事项',description:'',groupId:'',done:true,status:'done',date:'',dateEnd:'',start:null,duration:30,priority:0}],view:'board',guideDismissed:true};
const pref={theme:'base',mode:'light',color:'#48614c',font:'youfeng',width:'safe',explicitFont:true,inspirationMockV1:true,firstSpaceCapacityV1:true,twelveSpacePreviewAdded:true,accountProfile:{id,name:'工具额度测试',email:'qa@example.test'},accountDataUserId:id,cornerCloseGuideAcknowledgedV1:{[id]:true},cornerCollections:{[id]:{stageVersion:2,groups:[{id:'inbox',system:'inbox',name:'暂存',refs:[]},{id:'common-a',name:'常用',refs:[]}]}},cornerModules:{[id]:{memo:{groups:[],notes,lastNumber:3},todo:{groups:[],calendarV2:calendar}}}};
let activePlan=free;
set(free,'desktop-pets',['paper']);
const snapshot=()=>({member:activePlan.id!=='free',permanent:activePlan.id!=='free',expiresAt:null,planId:activePlan.id,planName:activePlan.name,entitlements:activePlan.entitlements});
const errors=[],blocked=[];let browser;
const reply=(route,data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
async function fixture(viewport={width:1440,height:1000}){
 const context=await browser.newContext({viewport,reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
 if(process.env.QA_BASELINE==='1')await context.route('http://127.0.0.1:4318/**',async route=>{const url=new URL(route.request().url()),file=url.pathname.slice(1),baseline=path.resolve('baselines/tool-entitlements-before-20261001/dist',file);if(['corner.js','memo-paper.js','todo-calendar.js','member-entitlements.js','v4.js'].includes(file))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(baseline,'utf8')});return route.fallback();});
 await context.addInitScript(({workspace,pref})=>{if(location.origin==='http://127.0.0.1:4318'&&!localStorage.getItem('yiyu-prototype-v1'))localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data:workspace,prefs:pref,signed:true,styles:{},overrides:{}}));},{workspace,pref});
 await context.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),method=req.method(),p=url.pathname;
  if(p==='/api/shiyu/i18n/public')return route.continue();
  if(p==='/api/shiyu/plans')return reply(route,{items:plans});
  if(p==='/api/shiyu/plans/catalog')return reply(route,catalog);
  if(p==='/api/shiyu/operations')return reply(route,{personalization:{pet:{enabled:true,options:{cat:{enabled:false}}}},access:{corner:true},corner:{enabled:true,modules:['common','memo','todo'].map(id=>({id,enabled:true}))}});
  if(p==='/api/shiyu/auth/session')return reply(route,{authenticated:true,user:{id,name:'工具额度测试',email:'qa@example.test',membership:snapshot(),member:activePlan.id!=='free',permanent:activePlan.id!=='free'}});
  if(p==='/api/shiyu/auth/account')return reply(route,{userId:id,data:workspace,initialized:true});
  if(p==='/api/shiyu/auth/tools'||p==='/api/shiyu/auth/tool-usage'){
   if(method==='GET')return reply(route,p.endsWith('/tools')?{userId:id,tools:user.toolData||{}}:{userId:id,entitlements:activePlan.entitlements});
   const body=req.postDataJSON();try{return reply(route,{userId:id,...(p.endsWith('/tools')?saveTool(user,free.entitlements,body):daily(user,free.entitlements,body))});}catch(e){return reply(route,{message:e.message,code:e.code,tool:e.tool,limit:e.limit,used:e.used,requested:e.requested},e.status||400);}
  }
  if(p==='/api/shiyu/theme-access')return reply(route,{member:false,fallback:'base',items:catalog.resources.themes.map(t=>({...t,allowed:true,memberOnly:false})),previews:{}});
  if(p==='/api/shiyu/payments/status')return reply(route,{enabled:false,providers:{}});
  if(p==='/api/shiyu/payments/quote')return reply(route,{quote:{planId:'monthly',quantity:Number(url.searchParams.get('quantity')||1),activityId:null,token:'qa-quote',amount:1000,days:30,bonusDays:0,remainingQuantity:0}});
  if(p==='/api/shiyu/payments/account')return reply(route,{member:false,membership:snapshot()});
  if(p==='/api/shiyu/auth/invitations')return reply(route,{enabled:false,items:[]});
  if(p==='/api/my-palettes')return reply(route,{favorites:[],items:[]});
  if(!['GET','HEAD'].includes(method))blocked.push(p);
  return reply(route,{items:[]});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));return {context,page};
}
const closeGate=p=>p.evaluate(()=>document.querySelector('#member-gate')?.close());
async function open(p,tool){await p.evaluate(tool=>window.ShiyuCorner.openModule(tool),tool);try{await p.waitForSelector(tool==='memo'?'.memo-paper-app':tool==='todo'?'.tc-workspace':'.corner-stage',{timeout:10000});}catch(e){await p.screenshot({path:path.join(out,'failure.png')});console.log(await p.evaluate(()=>({errors:document.querySelector('#my-corner')?.innerText,signed,tools:!!window.ShiyuToolData,ready:window.ShiyuToolData?.ready('memo'),toast:document.body.innerText.slice(-900)})),errors);throw e;}}

async function main(){
 browser=await chromium.launch({channel:'msedge',headless:true});const {context,page:p}=await fixture({width:1772,height:1015});
 await p.goto('http://127.0.0.1:4318/');await p.waitForFunction(()=>ShiyuEntitlements.snapshot().ready&&ShiyuEntitlements.options('desktop-pets').length===6&&ShiyuFeatureConfig.option('pet','cat')===false);
 const settings=()=>p.evaluate(()=>{scope='global';settingsTab='desktop-pet';renderSettings();show('#settings')});
 await settings();await p.locator('[data-pet-pref="skin"][data-value="paper"]').waitFor();
 assert.equal(await p.locator('[data-pet-pref="skin"][data-value="cat"]').count(),0);
 await p.locator('[data-pet-pref="skin"][data-value="bird"]').click();await p.locator('#member-gate[open]').waitFor();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'personal');assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().skin),'paper');
 await p.screenshot({path:path.join(out,'pet-member-gate.png')});await closeGate(p);
 activePlan=paid;await p.evaluate(async()=>{await ShiyuAccountSession.verify()});await p.waitForFunction(()=>ShiyuEntitlements.allows('desktop-pets','bird'));
 await settings();await p.locator('[data-pet-pref="skin"][data-value="bird"]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().skin==='bird');await p.screenshot({path:path.join(out,'pet-member-selected.png')});
 // Reload as an expired member: preserve preference but display an allowed free shape.
 activePlan=free;await p.reload();await p.waitForFunction(()=>ShiyuEntitlements.snapshot().ready&&document.querySelector('#desktop-pet')?.dataset.skin==='paper');assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().skin),'bird');
 // Empty grants never fall back to an unauthorized hardcoded shape.
 await p.evaluate(()=>{window.__shiyuUserEntitlements.entitlements=window.__shiyuUserEntitlements.entitlements.map(b=>b.key==='desktop-pets'?{...b,value:[]}:b);window.dispatchEvent(new Event('shiyu-user-entitlements'))});assert.equal(await p.locator('#desktop-pet').isHidden(),true);
 // Presets and custom/card colors use the same global entitlement source.
 free.entitlements.find(b=>b.key==='global-custom-color').enabled=false;const color=catalog.resources.colors.find(c=>c.enabled!==false);set(free,'global-colors',[color.id]);
 await p.reload();await p.waitForFunction(()=>ShiyuEntitlements.snapshot().ready);
 assert.equal(await p.evaluate(()=>ShiyuEntitlements.allows('corner-colors','custom')),false);
 const checks=await p.evaluate(({id,value})=>({requirement:ShiyuEntitlements.requirements({dataset:{pref:'color',value}}),allowed:ShiyuEntitlements.allows('global-colors',id),custom:ShiyuEntitlements.allows('global-custom-color')}),{id:color.id,value:color.preview.color});assert.equal(checks.allowed,true);assert.equal(checks.custom,false);assert.deepEqual(checks.requirement,[['global-colors',color.id]]);
 await p.evaluate(()=>openMemberCenter());await p.locator('#member-center [data-benefit-key="desktop-pets"]').waitFor();assert.equal(await p.locator('#member-center [data-benefit-key="corner-colors"]').count(),0);
 assert.deepEqual(errors,[]);await context.close();console.log('PASS partner selection gate, paid selection, expiry fallback, empty grants, global colors and member comparison');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});
