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
const snapshot=()=>({member:false,permanent:false,expiresAt:null,planId:'free',planName:'免费版',entitlements:free.entitlements});
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
  if(p==='/api/shiyu/operations')return reply(route,{access:{corner:true},corner:{enabled:true,modules:['common','memo','todo'].map(id=>({id,enabled:true}))}});
  if(p==='/api/shiyu/auth/session')return reply(route,{authenticated:true,user:{id,name:'工具额度测试',email:'qa@example.test',membership:snapshot(),member:false}});
  if(p==='/api/shiyu/auth/account')return reply(route,{userId:id,data:workspace,initialized:true});
  if(p==='/api/shiyu/auth/tools'||p==='/api/shiyu/auth/tool-usage'){
   if(method==='GET')return reply(route,p.endsWith('/tools')?{userId:id,tools:user.toolData||{}}:{userId:id,entitlements:free.entitlements});
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
 browser=await chromium.launch({channel:'msedge',headless:true});
 const {context,page:p}=await fixture({width:1772,height:1015});
 if(process.env.QA_SHOWCASE_BEFORE==='1')await context.route(/\/v4\.(js|css)(\?|$)/,route=>{const file=new URL(route.request().url()).pathname.split('/').pop();return route.fulfill({contentType:file.endsWith('.css')?'text/css':'text/javascript',body:fs.readFileSync(path.resolve('baselines/member-showcase-before-20261001',file),'utf8')});});
 await p.goto('http://127.0.0.1:4318/?corner=memo');await p.waitForFunction(()=>window.__shiyuUserEntitlements?.ready&&window.__shiyuMemberCatalog?.ready&&window.__shiyuMemberResources&&window.ShiyuCornerModules);
 await p.waitForTimeout(700);
 const output=path.resolve('.local/member-showcase-qa');fs.mkdirSync(output,{recursive:true});
 if(process.env.QA_SHOWCASE_BEFORE==='1'){await p.evaluate(()=>{prefs.mode='dark';apply();memberGate('memo')});await p.locator('#member-gate').screenshot({path:path.join(output,'before-dark-memo.png')});return;}
 // Aggregate differently configured published plans, never an unavailable plan or the first plan alone.
 await p.evaluate(()=>{
  const items=window.__shiyuMemberCatalog.plans,monthly=items.find(p=>p.id==='monthly'),annual=JSON.parse(JSON.stringify(monthly)),hidden=JSON.parse(JSON.stringify(monthly));
  annual.id='annual';annual.name='年度会员';annual.entitlements.find(b=>b.key==='memo-limit').value=800;annual.entitlements.find(b=>b.key==='icon-daily-limit').value=250;
  hidden.id='hidden';hidden.enabled=false;hidden.entitlements.find(b=>b.key==='memo-limit').unlimited=true;
  items.push(annual,hidden);memberGate('memo');
 });
 const detail=key=>p.locator('#member-gate [data-feature="'+key+'"] .gate-feature-detail');
 assert.match(await detail('memo').innerText(),/免费版\s+2 条\s+会员版\s+至多可享受 800 条/);
 assert.match(await detail('icons').innerText(),/至多可享受 250 次\/天/);
 assert.match(await detail('colors').innerText(),/会员版\s+不限量/);
 assert.equal(await detail('todo').locator('.gate-benefit-row').count(),2);
 assert.doesNotMatch(await detail('todo').innerText(),/至多/);
 assert.doesNotMatch(await p.locator('#member-gate .member-benefits').innerText(),/月度会员|季度会员|年度会员|共用|次日恢复|废纸船|不占额度/);
 await p.evaluate(()=>{const a=window.__shiyuMemberCatalog.plans.find(p=>p.id==='annual');a.entitlements.find(b=>b.key==='memo-limit').unlimited=true;memberGate('memo');});
 assert.match(await detail('memo').innerText(),/会员版\s+不限量/);
 // Counts use the best actual selection, not a union that no plan offers, and ignore disabled resources.
 await p.evaluate(()=>{const items=window.__shiyuMemberCatalog.plans,opts=ShiyuEntitlements.options('global-fonts').filter(o=>o.enabled!==false).map(o=>o.id);items.find(p=>p.id==='monthly').entitlements.find(b=>b.key==='global-fonts').value=opts.slice(0,1);items.find(p=>p.id==='annual').entitlements.find(b=>b.key==='global-fonts').value=opts.slice(0,3);memberGate('personal');});
 assert.match(await detail('personal').innerText(),/3 种字体/);
 // Restore representative published values for the visual review.
 await p.evaluate(({plans})=>{window.__shiyuMemberCatalog.plans=plans;}, {plans});
 const features=['themes','personal','space','scene','group','corner','memo','todo','icons','colors','atlas','share'];
 for(const mode of ['dark','light']){
  await p.evaluate(mode=>{prefs.mode=mode;apply()},mode);
  for(const key of features){
   await p.evaluate(key=>memberGate(key),key);await p.waitForTimeout(60);
   assert.equal(await detail(key).locator('.gate-benefit-row').count(),2);
   assert(await p.locator('#member-gate [data-feature="'+key+'"]').evaluate(el=>Math.abs(el.getBoundingClientRect().left-el.parentElement.getBoundingClientRect().left)<2));
   await p.locator('#member-gate').screenshot({path:path.join(output,mode+'-'+key+'.png')});
  }
 }
 assert.equal(await p.locator('.gate-icon-wall svg').count(),48);
 assert.equal(await p.locator('.gate-palette-card').count(),8);
 assert(await p.locator('.gate-memo-add').evaluate(el=>getComputedStyle(el).borderStyle==='dashed'));
 for(const width of [1772,390]){
  await p.setViewportSize({width,height:width===390?844:1015});
  for(const key of ['memo','icons','colors','personal']){
   await p.evaluate(key=>memberGate(key),key);await p.waitForTimeout(80);
   assert(await p.locator('#member-gate').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   assert(await p.locator('#member-gate .gate-arrow').evaluateAll(buttons=>buttons.every(el=>{const a=el.getBoundingClientRect(),b=el.querySelector('svg').getBoundingClientRect();return Math.abs(a.x+a.width/2-b.x-b.width/2)<1&&Math.abs(a.y+a.height/2-b.y-b.height/2)<1;})));
   if(width===390)await p.screenshot({path:path.join(output,'mobile-'+key+'.png')});
  }
 }
 await p.locator('.gate-next').click();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'space');
 await p.locator('.gate-prev').click();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'personal');
 await p.locator('#member-gate [data-member-center]').click();await p.locator('#member-center[open]').waitFor();
 assert.match(await p.locator('#member-center').innerText(),/月度会员/);
 assert.deepEqual(errors,[]);await context.close();console.log('PASS showcase: best published quotas, unlimited, equal plans, resource selection, two-row summaries, 12 previews, light/dark/mobile, SVG centering, carousel and member-center navigation');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});

