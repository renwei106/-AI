const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base='http://127.0.0.1:4349';
const output='checks/onboarding';fs.mkdirSync(output,{recursive:true});
const initial=(welcome='none')=>({version:1,round:0,status:'idle',welcome,home:{status:'pending',step:'world'},space:{status:'pending',step:'spaces'},updatedAt:''});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  let user='guide-a',states={'guide-a':initial('pending'),'guide-b':initial()},writes=[];
  let config={onboarding:{enabled:true,welcome:true,home:true,space:true},world:{enabled:true,eligible:true,modules:{}},access:{},personalization:{},optionNames:{}};
  await context.route('**/api/shiyu/**',async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;let result={};
   if(path==='/api/shiyu/operations')result=config;
   else if(path==='/api/shiyu/auth/session')result={authenticated:true,user:{id:user,name:'引导测试',phone:'',member:false}};
   else if(path==='/api/shiyu/auth/onboarding'){
    if(req.method()==='POST'){
     const body=req.postDataJSON();writes.push(body);assert.equal(body.userId,user);
     const state=states[user];if(body.action==='start'){states[user]={...initial('handled'),round:state.round+1,status:'active'};}
     else if(body.action==='welcome')state.welcome='handled';
     else if(body.action==='skip')state.status='skipped';
     else if(body.action==='progress')state[body.module].step=body.step;
     else if(body.action==='complete'){state[body.module].status='done';if(state.home.status==='done'&&state.space.status==='done')state.status='complete';}
    }
    result={userId:user,onboarding:states[user]};
   }else if(path.startsWith('/api/shiyu/auth/wechat/'))result={};
   else if(path==='/api/shiyu/auth/welcome-gift')result={pending:false};
   else if(path==='/api/shiyu/auth/account'){return route.fulfill({status:503,json:{}});}
   else return route.fulfill({status:503,json:{}});
   await route.fulfill({status:200,json:result});
  });
  await context.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{accountProfile:{id:'guide-a',name:'引导测试',profileCompleted:true},theme:'base',mode:'light',color:'#48614c',workspaceGuideDoneV1:true}})));
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.sy-welcome[open]',{timeout:20000});
  await page.screenshot({path:output+'/01-envelope.png'});
  await page.locator('.sy-wax').click();await page.waitForSelector('.sy-welcome.is-open');await page.waitForTimeout(900);
  await page.screenshot({path:output+'/02-letter.png'});
  assert.equal(await page.locator('.sy-concept').count(),3);
  await page.locator('[data-letter-start]').click();await page.waitForSelector('.sy-tour');await page.waitForTimeout(300);
  console.log('Initial tour:',await page.locator('.sy-tour-progress').innerText());
  assert.match(await page.locator('.sy-tour-progress').innerText(),/1 \/ 5/);
  await page.screenshot({path:output+'/03-tour.png'});
  await page.mouse.move(800,600);await page.mouse.wheel(0,160);await page.waitForTimeout(100);await page.mouse.wheel(0,160);await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>view),'home','guide prevents existing double-wheel page navigation');
  // Disabled functions change actual steps, while the letter remains complete.
  config={...config,world:{...config.world,enabled:false,eligible:false},access:{space:false,spaceViews:false},personalization:{pet:{enabled:false}}};
  await page.evaluate(()=>window.ShiyuFeatureConfig.refresh());await page.waitForTimeout(500);
  console.log('Filtered tour:',await page.locator('.sy-tour-progress').innerText());
  assert.match(await page.locator('.sy-tour-progress').innerText(),/1 \/ 2/);
  assert.match(await page.locator('#sy-tour-title').innerText(),/主题/);
  await page.locator('[data-tour-next]').click();await page.waitForFunction(()=>document.querySelector('.sy-tour-progress')?.textContent.includes('2 / 2'));
  await page.locator('[data-tour-skip]').click();await page.waitForSelector('.sy-tour',{state:'detached'});assert.equal(states[user].status,'skipped');
  // Other pages never get a replay entry, even though they share the account menu.
  await page.evaluate(()=>{transitionUntil=0;changeView('space');});await page.waitForTimeout(500);
  assert.equal(await page.locator('[data-onboarding-entry]').count(),0);
  await page.evaluate(()=>{transitionUntil=0;changeView('home');});await page.waitForTimeout(500);
  assert.equal(await page.locator('[data-onboarding-entry]').count(),1);
  config={...config,world:{...config.world,enabled:true,eligible:true},access:{},personalization:{}};
  await page.evaluate(()=>window.ShiyuFeatureConfig.refresh());
  await page.locator('[data-account-open]').click();await page.locator('[data-onboarding-entry]').click();await page.locator('.sy-wax').click();await page.waitForSelector('.sy-welcome.is-open');
  await page.locator('[data-letter-start]').click();await page.waitForSelector('.sy-tour');assert.equal(states[user].round,2);
  for(let count=0;count<7;count++){const button=page.locator('[data-tour-next]');const label=await button.innerText(),title=await page.locator('#sy-tour-title').innerText();await button.click();if(label==='去我的空间')break;await page.waitForFunction(old=>document.querySelector('#sy-tour-title')?.textContent!==old,title);}
  await page.waitForSelector('.sy-tour[data-area="space"]');await page.waitForTimeout(400);await page.screenshot({path:output+'/04-space.png'});
  await page.locator('[data-tour-next]').click();await page.waitForFunction(()=>document.querySelector('#sy-tour-title')?.textContent.includes('场景'));const step=states[user].space.step;
  await page.reload({waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{transitionUntil=0;changeView('space');});await page.waitForSelector('.sy-tour[data-area="space"]');assert.equal(states[user].space.step,step);
  await page.keyboard.press('Escape');await page.waitForSelector('.sy-tour',{state:'detached'});await page.waitForTimeout(1400);assert.equal(await page.locator('.sy-tour').count(),0);
  // New registration marker waits through account dialogs and only appears on the theme home.
  states[user]=initial('pending');await page.evaluate(()=>{const d=document.createElement('dialog');d.id='registration-test';d.innerHTML='<button>修改密码</button>';document.body.append(d);d.showModal();transitionUntil=0;changeView('home');});
  await page.evaluate(()=>window.ShiyuOnboarding.refresh());await page.waitForTimeout(1600);assert.equal(await page.locator('.sy-welcome').count(),0);
  await page.evaluate(()=>document.querySelector('#registration-test').close());await page.waitForSelector('.sy-welcome[open]');
  await page.locator('[data-letter-later]').first().click();await page.waitForSelector('.sy-welcome',{state:'detached'});
  // Theme color, dark mode and phone layout.
  await page.evaluate(()=>{prefs.mode='dark';prefs.color='#a884bc';apply();render();});
  await page.locator('[data-account-open]').click();await page.locator('[data-onboarding-entry]').click();await page.locator('.sy-wax').click();await page.waitForSelector('.sy-welcome.is-open');await page.waitForTimeout(900);await page.screenshot({path:output+'/05-letter-dark.png'});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(450);await page.screenshot({path:output+'/06-letter-mobile.png'});
  assert(await page.locator('.sy-letter').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  console.log('Page errors:',JSON.stringify(errors));assert.deepEqual(errors,[]);
  console.log('PASS: letter, dynamic availability, replay, space resume, registration timing, themes and mobile.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
