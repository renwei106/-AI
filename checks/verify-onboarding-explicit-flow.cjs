const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output='.local/checks/onboarding-explicit-flow';
const base='http://127.0.0.1:4349';
const initial=(welcome='handled')=>({version:1,round:0,status:'idle',welcome,home:{status:'pending',step:'world'},space:{status:'pending',step:'spaces'},updatedAt:''});
const user='explicit-guide';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:2066,height:1070},reducedMotion:'no-preference'});
  // Match the real saved progress: refresh previously jumped straight to step three.
  let state={...initial(),round:17,status:'active',home:{status:'pending',step:'theme'}},writes=[];
  await context.route('**/api/shiyu/**',async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;let result={};
   if(path==='/api/shiyu/operations')result={onboarding:{enabled:true,welcome:true,home:true,space:true},world:{enabled:true,eligible:true,modules:{}},access:{},personalization:{},optionNames:{}};
   else if(path==='/api/shiyu/auth/session')result={authenticated:true,user:{id:user,name:'引导测试',member:false,entitlements:[{key:'desktop-pets',kind:'selection',enabled:true,value:['paper']}]}};
   else if(path==='/api/shiyu/plans/catalog')result={resources:{pets:[{id:'paper',enabled:true}]}};
   else if(path==='/api/shiyu/theme-access')result={items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false};
   else if(path==='/api/shiyu/auth/onboarding'){
    if(req.method()==='POST'){
     const body=req.postDataJSON();writes.push(body);assert.equal(body.userId,user);
     if(body.action==='start')state={...initial(),round:state.round+1,status:'active'};
     else if(body.action==='welcome')state.welcome='handled';
     else if(body.action==='skip'){state.status='skipped';state.welcome='handled';}
     else if(body.action==='progress')state[body.module].step=body.step;
     else if(body.action==='complete'){state[body.module].status='done';if(state.home.status==='done'&&state.space.status==='done')state.status='complete';}
    }
    result={userId:user,onboarding:state};
   }else if(path.startsWith('/api/shiyu/auth/wechat/'))result={};
   else if(path==='/api/shiyu/auth/welcome-gift')result={pending:false};
   else return route.fulfill({status:503,json:{}});
   await route.fulfill({status:200,json:result});
  });
  await context.addInitScript(({user})=>{
   if(!localStorage.getItem('yiyu-prototype-v1'))localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{accountProfile:{id:user,name:'引导测试',profileCompleted:true},theme:'base',mode:'light',color:'#48614c',workspaceGuideDoneV1:true}}));
  },{user});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const assertFree=async()=>{
   assert.equal(await page.locator('.sy-tour,.sy-welcome[open]').count(),0);
   assert.equal(await page.locator('#main').evaluate(el=>el.inert),false);
   assert.equal(await page.locator('body>header').evaluate(el=>el.inert),false);
   assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('sy-tour-active')),false);
  };
  const start=async()=>{
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('[data-account-open]').click();await page.locator('[data-onboarding-entry]').click();
   await page.locator('.sy-wax').click();await page.waitForSelector('.sy-welcome.is-open');
   await page.locator('[data-letter-start]').click();await page.waitForSelector('.sy-tour');
   await page.waitForFunction(()=>document.querySelector('#sy-tour-title')?.textContent==='向外，发现一个世界');
   await page.emulateMedia({reducedMotion:'no-preference'});
  };
  const next=async title=>{await page.locator('[data-tour-next]').click({delay:180});await page.waitForFunction(t=>document.querySelector('#sy-tour-title')?.textContent===t,title);};
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-onboarding-entry]',{state:'attached'});await page.waitForTimeout(2200);
  await assertFree();assert.equal(writes.length,0);
  const served=await page.request.get(base+'/onboarding.js');assert.equal(await served.text(),fs.readFileSync('dist/onboarding.js','utf8'));
  console.log('PASS actual preview serves current file; saved active/theme does not start a tour on load.');
  await start();assert.equal(state.round,18);assert.match(await page.locator('.sy-tour-progress').innerText(),/1 \/ 5/);
  await next('向内，安放你的喜欢');await next('换一个主题，换一种心情');
  const panel=page.locator('.sy-tour-panel');
  if(!await page.locator('.brand-demo4-stage').evaluate(el=>el.classList.contains('is-settled')))assert.equal(await panel.evaluate(el=>getComputedStyle(el).visibility),'hidden');
  await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-settled'));
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.sy-tour-panel')).visibility==='visible');
  assert.match(await page.locator('.sy-tour-progress').innerText(),/3 \/ 5/);
  const before=await panel.boundingBox();await page.waitForTimeout(500);assert.deepEqual(await panel.boundingBox(),before);
  assert.equal(await page.locator('.sy-tour').count(),1);
  fs.mkdirSync(output,{recursive:true});await page.screenshot({path:output+'/explicit-theme-step.png'});
  await next('从这里，找到你想要的');assert.match(await page.locator('.sy-tour-progress').innerText(),/4 \/ 5/);
  await next('我的一隅，有个伙伴陪你');assert.match(await page.locator('.sy-tour-progress').innerText(),/5 \/ 5/);await page.locator('#desktop-pet .pet-menu').waitFor({state:'visible'});assert.equal(await page.locator('.sy-tour-panel').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await page.locator('[data-tour-next]').click();await page.waitForSelector('.sy-tour',{state:'detached'});
  assert.equal(state.home.status,'done');
  await page.evaluate(()=>{transitionUntil=0;changeView('space');});await page.waitForSelector('.sy-tour[data-area="space"]');
  const spaceTitles=['从空间开始整理','用场景区分日常','用分组整理网址','切换视图与样式','收藏网址，稍后再整理','随时回到首页'];
  assert.equal(await page.locator('#sy-tour-title').innerText(),spaceTitles[0]);
  for(const title of spaceTitles.slice(1))await next(title);
  await page.locator('[data-tour-next]').click();await page.waitForSelector('.sy-tour',{state:'detached'});assert.equal(state.status,'complete');
  await page.evaluate(()=>{transitionUntil=0;changeView('home');});await assertFree();
  console.log('PASS manual start runs steps one through five once, waits for theme expansion, then retains all six space steps.');
  await start();await next('向内，安放你的喜欢');await next('换一个主题，换一种心情');
  await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-settled'));
  await page.locator('[data-tour-skip]').click();await page.waitForSelector('.sy-tour',{state:'detached'});await page.waitForFunction(()=>JSON.parse(localStorage.getItem('shiyu-onboarding:explicit-guide')).status==='skipped');await assertFree();
  await page.locator('.brand-demo4-entry').click();await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-open'));
  await page.mouse.click(1500,500);await page.waitForFunction(()=>!document.querySelector('.brand-demo4-stage').classList.contains('is-open'));
  // A different client or an old higher-round response must not grant this page permission to resume.
  state={...initial(),round:99,status:'active',home:{status:'pending',step:'theme'}};
  await page.evaluate(()=>window.ShiyuOnboarding.refresh());await page.waitForTimeout(1500);await assertFree();
  for(let i=0;i<2;i++){await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-onboarding-entry]',{state:'attached'});await page.waitForTimeout(1700);await assertFree();}
  await page.screenshot({path:output+'/refresh-no-guide.png'});
  console.log('PASS skip restores real menu clicks; active higher-round responses and repeated refresh do not reopen a guide.');
  await start();assert.equal(state.round,100);assert.match(await page.locator('.sy-tour-progress').innerText(),/1 \/ 5/);
  await page.keyboard.press('Escape');await page.waitForSelector('.sy-tour',{state:'detached'});await assertFree();
  await page.evaluate(()=>{prefs.theme='threeBody';apply();render();});
  await page.waitForSelector('.home-threeBody');await start();assert.match(await page.locator('.sy-tour-progress').innerText(),/1 \/ 4/);
  await next('向内，安放你的喜欢');await next('换一个主题，换一种心情');
  await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-settled'));
  assert.match(await page.locator('.sy-tour-progress').innerText(),/3 \/ 4/);
  await page.screenshot({path:output+'/explicit-three-body-theme-step.png'});
  await next('我的一隅，有个伙伴陪你');assert.match(await page.locator('.sy-tour-progress').innerText(),/4 \/ 4/);await page.locator('#desktop-pet .pet-menu').waitFor({state:'visible'});assert.equal(await page.locator('.sy-tour-panel').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await page.locator('[data-tour-skip]').click();await page.waitForSelector('.sy-tour',{state:'detached'});await assertFree();
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('.home-threeBody');await page.waitForTimeout(1600);await assertFree();
  assert.deepEqual(errors,[]);console.log('PASS explicit restart begins at step one; Escape releases interaction; no page errors.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
