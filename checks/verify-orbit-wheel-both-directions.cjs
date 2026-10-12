const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{theme:'base',mode:'dark',color:'#0b5361',homeEntryGesture:'double',worldEntryGesture:'double',brandGuideDismissed:true,workspaceGuideDoneV1:true,accountProfile:{id:'wheel-guide',name:'滚轮测试',profileCompleted:true}}})));
  await page.route('**/api/**',route=>{
   const path=new URL(route.request().url()).pathname;let data={};
   if(path==='/api/shiyu/theme-access')data={items:['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:true};
   else if(path==='/api/shiyu/auth/session')data={authenticated:true,user:{id:'wheel-guide',name:'滚轮测试',member:true}};
   else if(path==='/api/shiyu/operations')data={onboarding:{enabled:false},world:{enabled:true,eligible:true,modules:{resources:true}},access:{},personalization:{}};
   else if(path==='/api/shiyu/auth/welcome-gift')data={pending:false};
   return route.fulfill({json:data});
  });
  await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1200);
  await page.evaluate(()=>{prefs.theme='cosmos';render();window.wheelToasts=[];const original=toast;toast=function(message,...args){wheelToasts.push(String(message));return original(message,...args);};});
  await page.waitForFunction(()=>ShiyuThreeBodyScene?.snapshot().loaded);
  await page.mouse.move(1660,520);
  const wheel=async delta=>{await page.mouse.wheel(0,delta);await page.waitForTimeout(80);};
  const snapshot=()=>page.evaluate(()=>({scale:ShiyuThreeBodyScene.snapshot().viewScale,zoom:ShiyuThreeBodyScene.snapshot().wheelZoomActive,toasts:wheelToasts.slice(),view,world:document.body.classList.contains('world-active')}));
  const before=await snapshot();await wheel(-120);const first=await snapshot();
  console.log('FIRST_REAL_UP_WHEEL',JSON.stringify({before,after:first}));
  assert.equal(first.toasts.length,0,'upward wheel must not prompt while zooming');assert.equal(first.world,false);assert.equal(first.zoom,true);
  await page.waitForTimeout(700);const settled=await snapshot();assert.ok(Math.abs(settled.scale/before.scale-Math.exp(.18))<.03,'capture and target must not apply the same zoom twice');
  await wheel(120);assert.equal((await snapshot()).toasts.length,0,'inward wheel still zooms');
  // Clamp the zoom target in one event loop; the visibly moving view must still consume wheel.
  await page.evaluate(()=>{const c=document.querySelector('.home canvas');for(let i=0;i<30;i++)c.dispatchEvent(new WheelEvent('wheel',{deltaY:-600,bubbles:true,cancelable:true}));});
  await wheel(-120);assert.equal((await snapshot()).toasts.length,0,'no prompt while view interpolates toward maximum');
  await page.waitForFunction(()=>ShiyuThreeBodyScene.snapshot().viewScale>=238.8);await page.waitForTimeout(240);
  await wheel(-120);assert.deepEqual((await snapshot()).toasts,['再向上滑动一次，进入世界']);assert.equal((await snapshot()).world,false);
  // Reversing after a prompt must resume zoom and clear the armed world gesture.
  await wheel(120);assert.equal((await snapshot()).world,false);await page.waitForTimeout(300);
  await page.evaluate(()=>{wheelToasts=[];const c=document.querySelector('.home canvas');for(let i=0;i<30;i++)c.dispatchEvent(new WheelEvent('wheel',{deltaY:-600,bubbles:true,cancelable:true}));});
  await page.waitForFunction(()=>ShiyuThreeBodyScene.snapshot().viewScale>=238.8);await page.waitForTimeout(240);
  await wheel(-120);assert.deepEqual((await snapshot()).toasts,['再向上滑动一次，进入世界']);assert.equal((await snapshot()).world,false,'reversed zoom must have cleared the old armed gesture');
  await page.waitForTimeout(280);await wheel(-120);await page.waitForFunction(()=>document.body.classList.contains('world-active'));
  console.log('PASS real upward wheels zoom once, wait for visible maximum, then prompt/enter world; reversing clears pending entry.');
  await page.locator('[data-w-home]').first().click();await page.waitForFunction(()=>!document.body.classList.contains('world-active'));await page.waitForTimeout(700);
  await page.mouse.move(1660,520);await page.evaluate(()=>{wheelToasts=[];const c=document.querySelector('.home canvas');for(let i=0;i<30;i++)c.dispatchEvent(new WheelEvent('wheel',{deltaY:600,bubbles:true,cancelable:true}));});
  await wheel(120);assert.equal((await snapshot()).toasts.length,0,'no space prompt while view interpolates toward minimum');
  await page.waitForFunction(()=>ShiyuThreeBodyScene.snapshot().viewScale<=8.04);await page.waitForTimeout(240);
  await wheel(120);assert.deepEqual((await snapshot()).toasts,['再向下滑动一次，进入我的空间']);assert.equal((await snapshot()).view,'home');
  await page.waitForTimeout(280);await wheel(120);await page.waitForFunction(()=>view==='space');
  await page.evaluate(()=>{transitionUntil=0;changeView('home');});await page.waitForTimeout(700);await page.mouse.move(1660,520);
  console.log('PASS downward wheels wait for visible minimum, then prompt/enter space.');
  await page.evaluate(()=>{prefs.homeEntryGesture='click';prefs.worldEntryGesture='click';wheelToasts=[];});
  await wheel(120);await page.waitForTimeout(280);await wheel(120);assert.equal((await snapshot()).toasts.length,0);assert.equal((await snapshot()).view,'home');
  await page.evaluate(()=>{const c=document.querySelector('.home canvas');for(let i=0;i<30;i++)c.dispatchEvent(new WheelEvent('wheel',{deltaY:-600,bubbles:true,cancelable:true}));});
  await page.waitForFunction(()=>ShiyuThreeBodyScene.snapshot().viewScale>=238.8);await page.waitForTimeout(240);await wheel(-120);await page.waitForTimeout(280);await wheel(-120);
  assert.equal((await snapshot()).toasts.length,0);assert.equal((await snapshot()).world,false);
  assert.deepEqual(errors,[]);console.log('PASS click-only settings still block both boundary navigation gestures; no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
