const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output='.local/checks/onboarding-theme-next-pointer';
const initial=()=>({version:1,round:1,status:'idle',welcome:'handled',home:{status:'pending',step:'world'},space:{status:'pending',step:'spaces'},updatedAt:''});
const user='pointer-guide';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
  let state=initial();const errors=[];
  await context.route('**/api/shiyu/**',async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;let result={};
   if(path==='/api/shiyu/operations')result={onboarding:{enabled:true,welcome:true,home:true,space:true},world:{enabled:true,eligible:true,modules:{}},access:{},personalization:{},optionNames:{}};
   else if(path==='/api/shiyu/auth/session')result={authenticated:true,user:{id:user,name:'引导测试',member:false,entitlements:[{key:'desktop-pets',kind:'selection',enabled:true,value:['paper']}]}};
   else if(path==='/api/shiyu/plans/catalog')result={resources:{pets:[{id:'paper',enabled:true}]}};
   else if(path==='/api/shiyu/theme-access')result={items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false};
   else if(path==='/api/shiyu/auth/onboarding'){
    if(req.method()==='POST'){
     const body=req.postDataJSON();
     if(body.action==='start')state={...initial(),round:state.round+1,status:'active'};
     else if(body.action==='progress')state[body.module].step=body.step;
     else if(body.action==='skip'){state.status='skipped';state.welcome='handled';}
     else if(body.action==='complete')state[body.module].status='done';
    }
    result={userId:user,onboarding:state};
   }else if(path.startsWith('/api/shiyu/auth/wechat/'))result={};
   else if(path==='/api/shiyu/auth/welcome-gift')result={pending:false};
   else return route.fulfill({status:503,json:{}});
   return route.fulfill({json:result});
  });
  await context.addInitScript(({user})=>{if(!localStorage.getItem('yiyu-prototype-v1'))localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{accountProfile:{id:user,name:'引导测试',profileCompleted:true},theme:'threeBody',mode:'dark',color:'#0d5361',workspaceGuideDoneV1:true}}));},{user});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-onboarding-entry]').waitFor({state:'attached'});
  await page.locator('[data-account-open]').click();await page.locator('[data-onboarding-entry]').click();
  await page.locator('.sy-wax').click();await page.locator('.sy-welcome.is-open').waitFor();await page.locator('[data-letter-start]').click();
  await page.locator('.sy-tour').waitFor();
  assert.match(await page.locator('.sy-tour-progress').innerText(),/1 \/ 4/);
  for(const title of ['向内，安放你的喜欢','换一个主题，换一种心情']){await page.locator('[data-tour-next]').click({delay:100});await page.waitForFunction(t=>document.querySelector('#sy-tour-title')?.textContent===t,title);}
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-settled'));
  assert.match(await page.locator('.sy-tour-progress').innerText(),/3 \/ 4/);
  const next=page.locator('[data-tour-next]'),box=await next.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(200);
  const during=await page.evaluate(()=>({open:document.querySelector('.brand-demo4-stage').classList.contains('is-open'),settled:document.querySelector('.brand-demo4-stage').classList.contains('is-settled'),title:document.querySelector('#sy-tour-title')?.textContent,panel:getComputedStyle(document.querySelector('.sy-tour-panel')).visibility}));
  await page.mouse.up();await page.waitForTimeout(300);
  fs.mkdirSync(output,{recursive:true});
  assert.equal(during.settled,true);assert.equal(during.panel,'visible');
  await page.waitForFunction(()=>document.querySelector('#sy-tour-title')?.textContent==='我的一隅，有个伙伴陪你');
  assert.match(await page.locator('.sy-tour-progress').innerText(),/4 \/ 4/);assert.equal(state.home.step,'pet');assert.equal(state.home.status,'pending');
  await page.locator('#desktop-pet .pet-menu').waitFor({state:'visible'});await page.waitForTimeout(450);
  await page.screenshot({path:output+'/pointer-fourth-pet.png'});
  console.log('PASS human pointer down/up keeps third step visible, saves progress:pet, and shows fourth-step companion/menu.');
  await page.locator('[data-tour-prev]').click({delay:100});await page.waitForFunction(()=>document.querySelector('#sy-tour-title')?.textContent==='换一个主题，换一种心情');
  await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-settled'));
  await page.locator('[data-tour-skip]').click({delay:200});await page.waitForSelector('.sy-tour',{state:'detached'});
  assert.equal(await page.locator('#main').evaluate(el=>el.inert),false);
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-onboarding-entry]',{state:'attached'});await page.waitForTimeout(1600);assert.equal(await page.locator('.sy-tour').count(),0);
  await page.locator('.brand-demo4-entry').click();await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage').classList.contains('is-settled'));
  await page.mouse.click(1500,500,{delay:100});await page.waitForFunction(()=>!document.querySelector('.brand-demo4-stage').classList.contains('is-open'));
  assert.deepEqual(errors,[]);console.log('PASS returning to step three, skip, refresh, and ordinary outside-click dismissal still work.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
