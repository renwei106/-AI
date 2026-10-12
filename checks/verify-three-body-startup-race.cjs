require('node:fs').mkdirSync('.local/checks/three-body-startup',{recursive:true});
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base='http://127.0.0.1:4349';
const output='.local/checks/three-body-startup';
const themeIds=['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'];
const gate=()=>{let release;const promise=new Promise(resolve=>release=resolve);return {promise,release};};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 fs.mkdirSync(output,{recursive:true});
 try{
  for(const order of ['operations-first','permission-first']){
   const context=await browser.newContext({viewport:{width:2066,height:1070}});
   const page=await context.newPage(),errors=[],requests=[],operations=gate(),permission=gate();
   let userId='startup-race';const started=Date.now();page.on('pageerror',error=>errors.push(error.message));
   await context.addInitScript(()=>{
    localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{theme:'threeBody',mode:'dark',color:'#115263',brandGuideDismissed:true,workspaceGuideDoneV1:true,accountProfile:{id:'startup-race',name:'测试',profileCompleted:true},accountDataUserId:'startup-race'}}));
    window.startupTimeline=[];
    const sample=()=>{try{window.startupTimeline.push({t:Math.round(performance.now()),prefs:prefs.theme,effective:effective().theme,body:document.body.dataset.theme,main:document.querySelector('#main>.home')?.className,continuity:!!window.ShiyuHomeContinuity,unchanged:window.ShiyuHomeContinuity?.unchanged(),signed,ready:document.documentElement.classList.contains('shiyu-account-ready')});}catch{}};
    setInterval(sample,100);document.addEventListener('DOMContentLoaded',sample);
   });
   await context.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;let json={},status=200;
    if(path==='/api/shiyu/theme-access'){
     json={items:themeIds.map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:true};await permission.promise;
    }else if(path==='/api/shiyu/operations'){
     json={onboarding:{enabled:false},world:{enabled:true,eligible:true,modules:{}},access:{},personalization:{},optionNames:{}};await operations.promise;
    }else if(path==='/api/shiyu/auth/session')json={authenticated:true,user:{id:userId,name:'测试',member:true}};
    else if(path==='/api/shiyu/auth/onboarding')json={userId:'startup-race',onboarding:{status:'skipped',welcome:'handled',home:{status:'done'},space:{status:'done'}}};
    else if(path==='/api/shiyu/auth/welcome-gift')json={pending:false};
    else if(path==='/api/shiyu/auth/account'){if(route.request().method()==='GET')status=503;else json={userId};}
    requests.push({at:Date.now()-started,path,status});await route.fulfill({status,json});
   });
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!!window.ShiyuHomeContinuity&&document.documentElement.classList.contains('shiyu-account-ready'));
   // Both scripts are mounted, but their startup requests remain unresolved.
   await page.waitForTimeout(500);
   if(order==='operations-first'){operations.release();await page.waitForTimeout(500);permission.release();}
   else{permission.release();await page.waitForTimeout(500);operations.release();}
   await page.waitForFunction(()=>window.ShiyuThreeBodyScene?.snapshot().loaded===true,{},{timeout:15000});
   await page.waitForTimeout(200);
   await page.locator('.brand-demo4-entry').click();await page.waitForFunction(()=>document.querySelector('.brand-demo4-stage')?.classList.contains('is-settled'));
   const result=await page.evaluate(()=>({prefs:prefs.theme,effective:effective().theme,body:document.body.dataset.theme,main:document.querySelector('#main>.home')?.className,selected:[...document.querySelectorAll('.brand-demo4-card[aria-pressed="true"]')].map(el=>el.dataset.brandTheme),physics:window.ShiyuThreeBodyScene?.snapshot().loaded===true,canvas:!!document.querySelector('#main>.home-threeBody .three-body-canvas')}));
   assert.equal(result.prefs,'threeBody',order+' preserves preference');assert.equal(result.effective,'threeBody',order+' resolves allowed theme');assert.equal(result.body,'threeBody',order+' applies actual theme');assert.equal(result.main,'home home-threeBody',order+' renders actual theme');assert.deepEqual(result.selected,['threeBody'],order+' picker agrees with rendered theme');assert.equal(result.physics,true,order+' loads physical simulation');assert.equal(result.canvas,true,order+' renders simulation canvas');assert.deepEqual(errors,[]);
   const served=await page.request.get(base+'/home-continuity.js');assert.equal(await served.text(),fs.readFileSync('dist/home-continuity.js','utf8'));
   const timeline=await page.evaluate(()=>window.startupTimeline),transitions=timeline.filter((value,index)=>index===0||JSON.stringify({...value,t:0})!==JSON.stringify({...timeline[index-1],t:0}));
   fs.writeFileSync(output+'/'+order+'.json',JSON.stringify({order,result,errors,transitions,requests},null,2));await page.screenshot({path:output+'/'+order+'.png'});
   console.log('PASS '+order+': preference, effective theme, body, home DOM and picker all agree; physics loaded without page errors.');
   if(order==='operations-first'){
    await page.locator('.brand-demo4-entry').click();
    await page.evaluate(()=>{window.ownerRetainedHome=document.querySelector('#main>.home');transitionUntil=0;changeView('space');});
    await page.waitForFunction(()=>document.body.dataset.view==='space'&&!document.querySelector('#main>.home'));
    assert.equal(await page.evaluate(()=>window.ownerRetainedHome.isConnected),true,'actual workspace visit retains same-owner home');
    userId='startup-other';
    await page.evaluate(()=>{prefs.accountProfile={...prefs.accountProfile,id:'startup-other'};prefs.accountDataUserId='startup-other';render();});
    assert.equal(await page.evaluate(()=>window.ownerRetainedHome.isConnected),false,'owner change discards parked home before return');
    await page.evaluate(()=>{view='home';render();});
    await page.waitForFunction(()=>document.querySelector('#main>.home-threeBody')&&window.ShiyuThreeBodyScene?.snapshot().loaded===true);
    assert.equal(await page.evaluate(()=>document.querySelector('#main>.home')===window.ownerRetainedHome),false,'different owner cannot recover previous home');
    assert.equal(await page.evaluate(()=>prefs.accountProfile.id),'startup-other');
    assert.deepEqual(errors,[]);console.log('PASS actual workspace visit retains home; owner change in workspace discards it and creates a new simulation on return.');
   }
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
