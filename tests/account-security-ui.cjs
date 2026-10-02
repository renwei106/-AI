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
const pref={theme:'base',mode:'light',color:'#48614c',font:'youfeng',width:'safe',explicitFont:true,inspirationMockV1:true,firstSpaceCapacityV1:true,twelveSpacePreviewAdded:true,accountProfile:{id,name:'工具额度测试',email:'qa@example.test',phone:'13900000001',gender:'male',birthday:'1995-01-01',profileCompleted:true},accountDataUserId:id,cornerCloseGuideAcknowledgedV1:{[id]:true},cornerCollections:{[id]:{stageVersion:2,groups:[{id:'inbox',system:'inbox',name:'暂存',refs:[]},{id:'common-a',name:'常用',refs:[]}]}},cornerModules:{[id]:{memo:{groups:[],notes,lastNumber:3},todo:{groups:[],calendarV2:calendar}}}};
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
  if(p==='/api/shiyu/auth/session')return reply(route,{authenticated:true,user:{id,name:'工具额度测试',email:'qa@example.test',phone:'13900000001',gender:'male',birthday:'1995-01-01',profileCompleted:true,membership:snapshot(),member:false}});
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

async function main(){
 browser=await chromium.launch({channel:'msedge',headless:true});
 const {context,page}=await fixture({width:1772,height:1015});
 await page.clock.install();
 let security={hasPassword:false,phone:'139****0001',email:'q***@example.test',wechatBound:false,wechatNickname:''},sends=0,saved=[],fail=false,qrError=false,logoutCalls=0;
 await context.route('**/api/shiyu/auth/**',async route=>{
  const p=new URL(route.request().url()).pathname;
  if(p.endsWith('/logout')){logoutCalls++;return reply(route,{ok:true});}
  if(p.endsWith('/session')&&logoutCalls)return reply(route,{authenticated:false});
  if(p.endsWith('/security')){if(route.request().method()==='PUT'){saved.push(route.request().postDataJSON());security.hasPassword=true;}return reply(route,{security});}
  if(p.endsWith('/send-code')||p.endsWith('/email/send')){sends++;await new Promise(r=>setTimeout(r,300));return reply(route,fail?{message:'发送失败'}:{resendAfter:60},fail?502:200);}
  if(p.endsWith('/wechat/qr'))return reply(route,qrError?{message:'二维码生成失败'}:{scene:'fixture',qrUrl:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="white"/><text x="20" y="120">TEST QR</text></svg>')},qrError?502:200);
  if(p.endsWith('/wechat/status'))return reply(route,{status:'ready-to-bind',nickname:'测试微信'});
  if(p.endsWith('/wechat/bind')){security.wechatBound=true;security.wechatNickname='测试微信';return reply(route,{ok:true});}
  return route.fallback();
 });
 await page.goto('http://127.0.0.1:4318/');await page.waitForFunction(()=>window.__shiyuMemberCatalog?.ready);
 await page.evaluate(()=>{signed=true;prefs.accountProfile={...prefs.accountProfile,name:'测试账号',id:'tool-quota-qa',email:'qa@example.test',phone:'13900000001',gender:'male',birthday:'1995-01-01',profileCompleted:true};prefs.mode='dark';apply();openAccountCenter()});
 const output=path.resolve('.local/account-security-qa');fs.mkdirSync(output,{recursive:true});
 const open=kind=>page.evaluate(kind=>window.openShiyuSecurityEditor(kind),kind);
 const editor=page.locator('#account-security-editor');
 await page.setViewportSize({width:1317,height:1015});
 await page.evaluate(()=>{prefs.accountProfile.phone='';prefs.mode='dark';prefs.color='#169d82';apply()});await open('phone');
 assert.equal(await editor.locator('h2').innerText(),'绑定手机号');assert.equal(await page.locator('[data-security-editor-save]').innerText(),'绑定手机号');assert.doesNotMatch(await editor.innerText(),/当前手机号|未绑定/);
 await editor.screenshot({path:path.join(output,'phone-bind-compact.png')});assert((await editor.boundingBox()).height<330);
 assert(await editor.locator('.security-field').evaluateAll(rows=>rows.every(row=>{const label=row.querySelector('span').getBoundingClientRect(),field=row.querySelector('input').getBoundingClientRect();return label.right<field.left&&Math.abs(label.y+label.height/2-field.y-field.height/2)<2})));
 await page.setViewportSize({width:390,height:844});await editor.screenshot({path:path.join(output,'phone-bind-mobile.png')});assert(await editor.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 await page.setViewportSize({width:1772,height:1015});await page.evaluate(()=>{prefs.accountProfile.phone='13900000001'});
 await open('phone');assert.equal(await editor.locator('h2').innerText(),'换绑手机号');assert.equal(await page.locator('[data-security-editor-save]').innerText(),'换绑手机号');await page.locator('[data-security-phone]').fill('13900000001');
 await page.locator('[data-security-phone-send]').click();assert(await page.locator('[data-security-phone-send]').isDisabled());
 await page.waitForTimeout(400);assert.match(await page.locator('[data-security-phone-send]').innerText(),/60|59/);assert.equal(sends,1);
 await page.locator('[data-security-phone]').dispatchEvent('input');assert(await page.locator('[data-security-phone-send]').isDisabled());
 await open('phone');await page.locator('[data-security-phone]').fill('13900000001');assert(await page.locator('[data-security-phone-send]').isDisabled());
 await editor.screenshot({path:path.join(output,'phone-countdown-dark.png')});
 await page.clock.fastForward(61000);assert(await page.locator('[data-security-phone-send]').isEnabled());
 await page.locator('[data-security-phone]').fill('13900000003');fail=true;await page.locator('[data-security-phone-send]').click();await page.waitForTimeout(400);assert(await page.locator('[data-security-phone-send]').isEnabled());fail=false;
 await open('password');await page.locator('[data-security-channel]').waitFor();assert.equal(await page.locator('[data-security-current]').count(),0);assert.match(await editor.innerText(),/设置密码/);
 await editor.screenshot({path:path.join(output,'set-password-dark.png')});
 await page.locator('[data-security-code]').fill('123456');await page.locator('[data-security-new]').fill('Testing123');await page.locator('[data-security-confirm]').fill('Different123');await page.locator('[data-security-editor-save]').click();assert.equal(saved.length,0);
 await page.locator('[data-security-confirm]').fill('Testing123');await page.locator('[data-security-editor-save]').click();await page.waitForFunction(()=>!document.querySelector('#account-security-editor').open);assert.equal(saved[0].verification,'code');assert.equal(saved[0].currentPassword,undefined);
 await open('password');await page.locator('[data-security-current]').waitFor();assert.equal(await page.getByLabel('当前密码',{exact:true}).count(),1);assert.equal(await page.getByLabel('新密码',{exact:true}).count(),1);assert.equal(await page.getByLabel('确认新密码',{exact:true}).count(),1);
 await editor.screenshot({path:path.join(output,'change-password-dark.png')});
 await page.locator('[data-security-switch]').click();await page.waitForTimeout(400);await page.locator('[data-security-switch]').click();await page.waitForTimeout(400);
 await page.evaluate(()=>{prefs.mode='light';apply()});await editor.screenshot({path:path.join(output,'change-password-light.png')});
 await open('wechat');await page.locator('[data-security-qr] img').waitFor();await editor.screenshot({path:path.join(output,'wechat-qr-light.png')});await page.locator('[data-wechat-confirm]:visible').waitFor();await page.locator('[data-wechat-confirm]').click();await page.waitForFunction(()=>!document.querySelector('#account-security-editor').open);assert.match(await page.locator('#account-center [data-security-item="wechat"]').innerText(),/测试微信/);
 await open('wechat');await page.locator('[data-wechat-binding-status]').waitFor();assert.equal(await page.locator('[data-security-qr]').count(),0);assert.match(await editor.innerText(),/已绑定/);
 security.wechatBound=false;qrError=true;await open('wechat');await page.locator('[data-wechat-refresh]:visible').waitFor();assert.match(await editor.innerText(),/二维码生成失败/);
 security.hasPassword=false;security.phone='';security.email='';await open('password');await page.locator('[data-bind-contact]').waitFor();assert.equal(await page.locator('[data-security-current]').count(),0);
 await page.setViewportSize({width:390,height:844});security.hasPassword=true;security.email='q***@example.test';await open('password');await page.locator('[data-security-current]').waitFor();assert(await editor.evaluate(el=>el.scrollWidth<=el.clientWidth+1));await editor.screenshot({path:path.join(output,'password-mobile.png')});
 await page.setViewportSize({width:1772,height:1015});
 await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());updateHeader();document.querySelector('.account-menu [data-account-signout]').click()});
 await page.locator('#account-signout-confirm[open]').waitFor();assert.equal(logoutCalls,0);assert(await page.evaluate(()=>signed));
 await page.locator('#account-signout-confirm [data-signout-cancel]').last().click();assert.equal(logoutCalls,0);assert(await page.evaluate(()=>signed));
 await page.evaluate(()=>openAccountCenter());await page.locator('#account-center [data-account-signout]').click();await page.locator('#account-signout-confirm[open]').waitFor();
 await page.keyboard.press('Escape');assert.equal(logoutCalls,0);assert(await page.evaluate(()=>signed));
 await page.locator('#account-center [data-account-signout]').click();await page.locator('#account-signout-confirm').screenshot({path:path.join(output,'logout-confirm-light.png')});
 await page.locator('#account-signout-confirm [data-signout-confirm]').click();await page.waitForFunction(()=>!signed);assert.equal(logoutCalls,1);
 console.log('PASS both logout entries: cancel and Escape keep session, confirmation sends one logout');
 assert.deepEqual(errors,[]);await context.close();console.log('PASS profile UI: countdown, in-flight lock, reopen, failure retry, first/existing password, labels, WeChat QR/confirm/bound/error, no-contact and mobile');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});
