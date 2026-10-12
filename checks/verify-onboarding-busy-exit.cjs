const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:4349';
const initial=()=>({version:1,round:4,status:'idle',welcome:'handled',home:{status:'pending',step:'world'},space:{status:'pending',step:'spaces'},updatedAt:''});
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
for(const exit of ['skip','Escape','skip-fails']){
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
let state=initial(),requestBodies=[],resolveProgressStarted,resolveProgress,resolveSkipStarted,resolveSkip;
const progressStarted=new Promise(resolve=>resolveProgressStarted=resolve),progressRelease=new Promise(resolve=>resolveProgress=resolve),skipStarted=new Promise(resolve=>resolveSkipStarted=resolve),skipRelease=new Promise(resolve=>resolveSkip=resolve);
await context.route('**/api/shiyu/**',async route=>{
const req=route.request(),path=new URL(req.url()).pathname;let result={};
if(path==='/api/shiyu/operations')result={onboarding:{enabled:true,welcome:true,home:true,space:true},world:{enabled:true,eligible:true,modules:{}},access:{},personalization:{},optionNames:{}};
else if(path==='/api/shiyu/auth/session')result={authenticated:true,user:{id:'race-guide',name:'测试',member:false}};
else if(path==='/api/shiyu/auth/onboarding'){
 if(req.method()==='POST'){
 const body=req.postDataJSON();requestBodies.push(body);
 if(body.action==='start')state={...initial(),round:state.round+1,status:'active'};
 if(body.action==='welcome')state.welcome='handled';
 if(body.action==='progress'&&body.step==='theme'){resolveProgressStarted();await progressRelease;state[body.module].step=body.step;}
 else if(body.action==='progress')state[body.module].step=body.step;
 if(body.action==='skip'){resolveSkipStarted();await skipRelease;if(exit==='skip-fails')return route.fulfill({status:503,json:{message:'测试保存失败'}});state.status='skipped';state.welcome='handled';}
 }result={userId:'race-guide',onboarding:structuredClone(state)};
}else if(path.startsWith('/api/shiyu/auth/wechat/'))result={};
else if(path==='/api/shiyu/auth/welcome-gift')result={pending:false};
else return route.fulfill({status:503,json:{}});
await route.fulfill({status:200,json:result});
});
await context.addInitScript(()=>{if(!localStorage.getItem('yiyu-prototype-v1'))localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{accountProfile:{id:'race-guide',name:'测试',profileCompleted:true},theme:'base',mode:'light',workspaceGuideDoneV1:true}}));});
const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('[data-onboarding-entry]').waitFor({state:'attached'});
await page.locator('[data-account-open]').click();await page.locator('[data-onboarding-entry]').click();await page.locator('.sy-wax').click();await page.waitForSelector('.sy-welcome.is-open');await page.locator('[data-letter-start]').click();await page.locator('.sy-tour').waitFor();
await page.locator('[data-tour-next]').click();await page.waitForFunction(()=>document.querySelector('#sy-tour-title')?.textContent==='向内，安放你的喜欢');
await page.locator('[data-tour-next]').click();await progressStarted;
if(exit!=='Escape')await page.locator('[data-tour-skip]').click();else await page.keyboard.press('Escape');
assert.equal(await page.locator('.sy-tour').count(),0);assert.equal(await page.locator('#main').evaluate(el=>el.inert),false);assert.equal(await page.locator('body>header').evaluate(el=>el.inert),false);
await page.locator('.brand-demo4-entry').click();await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage')?.classList.contains('is-open'));await page.mouse.click(1000,500);await page.waitForFunction(()=>!document.querySelector('.brand-demo4-stage')?.classList.contains('is-open'));
console.log('PASS '+exit+' immediately releases page and real menu clicks while progress POST remains pending.');
resolveProgress();await skipStarted;await page.waitForTimeout(1000);
assert.equal(await page.locator('.sy-tour').count(),0);assert.equal(await page.locator('#main').evaluate(el=>el.inert),false);
console.log('PASS '+exit+' stale progress response cannot relock page while skip POST remains pending.');
resolveSkip();if(exit==='skip-fails')await page.waitForTimeout(600);else await page.waitForFunction(()=>JSON.parse(localStorage.getItem('shiyu-onboarding:race-guide')||'{}').status==='skipped');
await page.reload({waitUntil:'domcontentloaded'});await page.locator('[data-onboarding-entry]').waitFor({state:'attached'});await page.waitForTimeout(1700);
assert.equal(await page.locator('.sy-tour').count(),0);assert.equal(await page.locator('#main').evaluate(el=>el.inert),false);assert.equal(requestBodies.filter(b=>b.action==='skip').length,1);assert.deepEqual(errors,[]);
console.log('PASS '+exit+' exit then refresh remains free.');await context.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
