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
 if(process.env.QA_LEGACY==='1')pref.cornerModules[id].todo={groups:[],tasks:calendar.tasks.map(t=>({...t,done:false,status:'today'})),view:'board'};
 const {context,page:p}=await fixture();await p.goto('http://127.0.0.1:4318/');await p.waitForFunction(()=>window.__shiyuUserEntitlements?.ready&&window.__shiyuMemberCatalog?.ready&&window.ShiyuCorner);await p.waitForTimeout(450);
 if(process.env.QA_BASELINE==='1'){await open(p,'memo');await p.screenshot({path:path.join(out,'memo-before.png')});await p.evaluate(()=>ShiyuCorner.closeModule());await open(p,'todo');await p.screenshot({path:path.join(out,'todo-before.png')});await context.close();console.log('PASS captured original module baseline');return;}
 if(process.env.QA_LEGACY==='1'){await open(p,'todo');await p.waitForTimeout(250);assert.equal(user.toolData.todo.data.calendarV2.tasks.length,2);await p.locator('[data-tc-task="todo-a"] .tc-task-copy').first().click();await p.locator('.tc-editor [name=title]').fill('历史超额仍可编辑');await p.locator('.tc-editor button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('.tc-editor'));assert.equal(user.toolData.todo.data.calendarV2.tasks.find(t=>t.id==='todo-a').title,'历史超额仍可编辑');await context.close();console.log('PASS legacy over-quota todo migration retains editing');return;}
 await open(p,'memo');await p.screenshot({path:path.join(out,'memo-light.png')});
 await p.locator('[data-memo-new]').click();await p.locator('#member-gate[open]').waitFor();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'memo');assert.equal(user.toolData.memo.data.notes.filter(n=>!n.deletedAt).length,2);
 await p.screenshot({path:path.join(out,'memo-limit.png')});await closeGate(p);
 // Edit remains available at the limit.
 await p.locator('[data-note-id="memo-a"] .memo-cover-open').click();await p.locator('[data-memo-title]').fill('额度已满仍能编辑');await p.locator('[data-memo-close]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));
 assert.equal(user.toolData.memo.data.notes.find(n=>n.id==='memo-a').title,'额度已满仍能编辑');
 await p.evaluate(()=>ShiyuCorner.closeModule());await open(p,'todo');await p.waitForTimeout(200);await p.screenshot({path:path.join(out,'todo-light.png')});
 await p.locator('[data-tc-action="new"]').first().click();await p.locator('.tc-editor [name=title]').fill('超过额度的事项');await p.locator('.tc-editor button[type=submit]').click();await p.locator('#member-gate[open]').waitFor();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'todo');assert.equal(user.toolData.todo.data.calendarV2.tasks.filter(t=>!t.done&&!t.deletedAt).length,1);await closeGate(p);
 assert.equal(await p.locator('.tc-editor [name=title]').inputValue(),'超过额度的事项');
 // Fresh reload verifies account restoration and completion releases capacity.
 await p.reload();await p.waitForFunction(()=>window.__shiyuUserEntitlements?.ready);await open(p,'todo');await p.waitForTimeout(200);
 await p.locator('[data-tc-task="todo-a"] [data-tc-action=complete]').first().click();await p.waitForTimeout(250);assert.equal(user.toolData.todo.data.calendarV2.tasks.find(t=>t.id==='todo-a').done,true);
 await p.locator('[data-tc-action="new"]').first().click();await p.locator('.tc-editor [name=title]').fill('完成后可以新增');await p.locator('.tc-editor button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('.tc-editor'));assert(user.toolData.todo.data.calendarV2.tasks.some(t=>t.title==='完成后可以新增'));
 await p.evaluate(()=>ShiyuCorner.closeModule());await open(p,'common');await p.locator('[data-corner-new]').click();await p.locator('#member-gate[open]').waitFor();assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),'corner');await closeGate(p);await p.evaluate(()=>ShiyuCorner.closeModule());
 await p.evaluate(()=>openMemberCenter());await p.locator('.member-comparison table').waitFor();assert.match(await p.locator('.member-comparison table').innerText(),/拾隅工具/);assert.match(await p.locator('.member-comparison table').innerText(),/我的小记/);await p.getByRole('row').filter({hasText:'我的小记'}).scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'member-tools-light.png'),fullPage:true});await p.evaluate(()=>{prefs.mode='dark';apply();});await p.screenshot({path:path.join(out,'member-tools-dark.png'),fullPage:true});
 // Every new benefit uses the same existing carousel.
 await p.evaluate(()=>document.querySelector('#member-center').close());for(const tool of ['memo','todo','corner','icons','colors']){await p.evaluate(tool=>memberGate(tool),tool);assert.equal(await p.locator('#member-gate').getAttribute('data-member-feature'),tool);await closeGate(p);}
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{prefs.mode='light';apply();memberGate('memo')});await p.screenshot({path:path.join(out,'member-tool-mobile.png')});assert(await p.locator('#member-gate [data-member-center]').isVisible());assert(await p.locator('#member-gate').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await closeGate(p);
 // Independent tools share the account iframe and reserve before copying.
 const toolPage=await context.newPage();toolPage.on('pageerror',e=>errors.push(e.message));await toolPage.goto('http://127.0.0.1:4173/#color/explore');await toolPage.waitForTimeout(1300);
 const result=await toolPage.evaluate(async()=>{const {useTool}=await import('./tool-usage.js');let calls=0;const op=()=>{calls++};return [await useTool('icons',1,op),await useTool('icons',1,op),await useTool('icons',1,op),calls]});assert.deepEqual(result,[true,true,false,2]);
 await toolPage.frameLocator('iframe[title="拾隅账号"]').locator('#member-gate[open]').waitFor();await toolPage.waitForTimeout(350);const gate=toolPage.frameLocator('iframe[title="拾隅账号"]').locator('#member-gate');assert.equal(await gate.getAttribute('data-member-feature'),'icons');assert(await gate.locator('[data-feature="icons"]').evaluate(el=>Math.abs(el.getBoundingClientRect().left-el.parentElement.getBoundingClientRect().left)<2),'correct tool must actually be visible after iframe expansion');assert.match(await gate.locator('.member-sub').innerText(),/2 \/ 2/);await toolPage.screenshot({path:path.join(out,'tool-shared-gate.png')});
 await toolPage.frameLocator('iframe[title="拾隅账号"]').locator('#member-gate [data-member-close]').click();free.entitlements.find(b=>b.key==='color-daily-limit').unlimited=false;
 const colorResult=await toolPage.evaluate(async()=>{const {copyColor}=await import('./tool-usage.js');return [await copyColor('#123456',{silent:true}),await copyColor('#654321',{silent:true})]});assert.deepEqual(colorResult,[true,false]);assert.equal(await toolPage.frameLocator('iframe[title="拾隅账号"]').locator('#member-gate[open]').count(),0);
 assert.equal(await toolPage.evaluate(async()=>{const {copyColor}=await import('./tool-usage.js');return copyColor('#654321',{silent:false})}),false);await toolPage.frameLocator('iframe[title="拾隅账号"]').locator('#member-gate[open]').waitFor();assert.equal(await toolPage.frameLocator('iframe[title="拾隅账号"]').locator('#member-gate').getAttribute('data-member-feature'),'colors');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,blockedBackgroundWrites:blocked,checks:['memo edit at cap','todo cap and completion','common cap','member grouping','tool-specific carousel','shared daily quota','silent color limit','explicit color gate']},null,2));await context.close();console.log('PASS tool quota browser flows');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});
