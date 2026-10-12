const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const output='.local/checks/home-continuity-lifecycle';
const themeIds=['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'];
const userId='continuity-lifecycle';
const accountData=[{id:'work',name:'连续性测试空间',icon:'▣',scenes:[{id:'daily',name:'测试场景',description:'仅本地 mock 数据',groups:[{id:'tools',name:'测试收藏',items:[['Continuity test','https://example.com','Local mock bookmark','C']]}]}]}];
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:2066,height:1070}}),page=await context.newPage();
 const errors=[],results=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));
 await context.addInitScript(({userId,accountData})=>{
  localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,data:accountData,prefs:{theme:'base',mode:'dark',color:'#115263',brandGuideDismissed:true,workspaceGuideDoneV1:true,accountProfile:{id:userId,name:'连续性测试',profileCompleted:true},accountDataUserId:userId}}));
 },{userId,accountData});
 await context.route('**/api/**',async route=>{
  const request=route.request(),pathname=new URL(request.url()).pathname;
  let json={},status=200;
  if(pathname==='/api/shiyu/operations')json={onboarding:{enabled:false},world:{enabled:true,eligible:true,modules:{discover:true}},access:{},personalization:{},optionNames:{}};
  else if(pathname==='/api/shiyu/theme-access')json={items:themeIds.map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:true};
  else if(pathname==='/api/shiyu/auth/session')json={authenticated:true,user:{id:userId,name:'连续性测试',member:true,permanent:true}};
  else if(pathname==='/api/shiyu/auth/account')json={userId,data:accountData};
  else if(pathname==='/api/shiyu/auth/onboarding')json={userId,onboarding:{status:'skipped',welcome:'handled',home:{status:'done'},space:{status:'done'}}};
  else if(pathname==='/api/shiyu/auth/welcome-gift')json={pending:false};
  requests.push({pathname,method:request.method()});
  await route.fulfill({status,json});
 });
 async function check(name,run){
  try{const details=await run();results.push({name,pass:true,details});console.log('PASS '+name);}
  catch(error){results.push({name,pass:false,error:error.message});console.log('FAIL '+name+': '+error.message);await page.screenshot({path:path.join(output,name.replace(/[^a-z0-9-]/gi,'-')+'-failure.png')}).catch(()=>{});}
 }
 async function ready(theme){
  await page.waitForFunction(theme=>view==='home'&&effective().theme===theme&&document.querySelector('#main>.home')&&(theme==='cosmos'?document.querySelector('#main>.home').dataset.orbitTheme==='cosmos'||document.querySelector('#main>.home-cosmos'):document.querySelector('#main>.home-'+theme)),theme,{timeout:12000});
  if(theme==='cosmos'||theme==='threeBody')await page.waitForFunction(()=>window.ShiyuThreeBodyScene?.snapshot().loaded===true,null,{timeout:12000});
  if(theme==='starlink')await page.waitForFunction(()=>document.querySelector('#main>.home iframe')?.contentDocument?.querySelector('canvas'),null,{timeout:12000});
  if(theme==='flow'||theme==='poly'||theme==='globe')await page.waitForFunction(()=>document.querySelector('#main>.home canvas'),null,{timeout:12000});
  await page.waitForTimeout(180);
 }
 async function select(theme){
  await page.evaluate(theme=>{window.ShiyuWorld?.close();transitionUntil=0;if(view!=='home')changeView('home');scope='global';changeTheme(theme);},theme);
  await ready(theme);
 }
 async function saveRoot(){return page.evaluate(()=>{
  const root=document.querySelector('#main>.home');
  window.continuityCheck={root,media:[...root.querySelectorAll('canvas,iframe')],frameWindows:[...root.querySelectorAll('iframe')].map(frame=>frame.contentWindow),scene:window.ShiyuThreeBodyScene,time:window.ShiyuThreeBodyScene?.snapshot().time};
  return {theme:effective().theme,media:window.continuityCheck.media.map(node=>node.tagName),time:window.continuityCheck.time};
 });}
 async function sameRoot(){return page.evaluate(()=>{
  const expected=window.continuityCheck,root=document.querySelector('#main>.home'),media=[...root.querySelectorAll('canvas,iframe')];
  return {root:root===expected.root,media:media.length===expected.media.length&&media.every((node,index)=>node===expected.media[index]),frames:[...root.querySelectorAll('iframe')].every((node,index)=>node.contentWindow===expected.frameWindows[index]),scene:!expected.scene||window.ShiyuThreeBodyScene===expected.scene,time:window.ShiyuThreeBodyScene?.snapshot().time};
 });}
 async function goSpace(){
  await page.evaluate(()=>{transitionUntil=0;changeView('space');});
  await page.waitForFunction(()=>view==='space'&&!!document.querySelector('#main>.workspace'),null,{timeout:5000});
  return page.evaluate(()=>({view,workspace:!!document.querySelector('#main>.workspace'),parked:document.querySelector('[data-home-retained]')?.contains(window.continuityCheck.root)===true,connected:window.continuityCheck.root.isConnected,scene:!window.continuityCheck.scene||window.ShiyuThreeBodyScene===window.continuityCheck.scene,time:window.ShiyuThreeBodyScene?.snapshot().time}));
 }
 async function goHome(){await page.evaluate(()=>{transitionUntil=0;changeView('home');});await page.waitForFunction(()=>view==='home'&&!!document.querySelector('#main>.home'));await page.waitForTimeout(120);}
 try{
  await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ShiyuHomeContinuity&&signed&&document.documentElement.classList.contains('shiyu-account-ready')&&window.ShiyuOperations?.worldStatus()==='ready');
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(()=>prefs.accountDataUserId),userId);
  for(const theme of themeIds){
   await check(theme+'-space-and-world',async()=>{
    await select(theme);const before=await saveRoot();
    const space=await goSpace();assert.equal(space.view,'space');assert.equal(space.workspace,true);assert.equal(space.connected,true);assert.equal(space.parked,true,'old home is parked, not silently restored by account guard');
    await page.waitForTimeout(300);
    if(['cosmos','threeBody'].includes(theme)){assert.equal(space.scene,true,'physical scene API survives workspace');assert.ok(await page.evaluate(()=>window.ShiyuThreeBodyScene?.snapshot().time>window.continuityCheck.time),'simulation advances in workspace');}
    await goHome();const returned=await sameRoot();assert.equal(returned.root,true);assert.equal(returned.media,true);assert.equal(returned.frames,true);assert.equal(returned.scene,true);
    await page.evaluate(()=>window.ShiyuWorld.open());await page.waitForFunction(()=>document.body.classList.contains('world-active')&&document.querySelector('#world-page')?.hidden===false);
    assert.equal(await page.evaluate(()=>view),'home','world is an overlay over live home');
    await page.waitForTimeout(250);await page.evaluate(()=>window.ShiyuWorld.close());await page.waitForFunction(()=>!document.body.classList.contains('world-active'));
    const worldReturned=await sameRoot();assert.equal(worldReturned.root,true);assert.equal(worldReturned.media,true);assert.equal(worldReturned.frames,true);assert.equal(worldReturned.scene,true);
    return {before,space,returned,worldReturned};
   });
  }
  for(let index=0;index<themeIds.length;index++){
   const theme=themeIds[index],other=themeIds[(index+1)%themeIds.length];
   await check(theme+'-home-theme-discard',async()=>{
    await select(theme);await saveRoot();await select(other);
    assert.equal(await page.evaluate(()=>window.continuityCheck.root.isConnected),false,'A must be discarded when selecting B');
    await select(theme);assert.equal(await page.evaluate(()=>document.querySelector('#main>.home')===window.continuityCheck.root),false,'A→B→A must create a new root');
    return {theme,other};
   });
  }
  for(const returnToOld of [false,true])await check('space-theme-switch-'+(returnToOld?'A-B-A':'A-B'),async()=>{
   await select('threeBody');await saveRoot();await goSpace();
   await page.evaluate(()=>{scope='global';changeTheme('starlink');});
   assert.equal(await page.evaluate(()=>view),'space');assert.equal(await page.locator('#main>.workspace').count(),1);
   assert.equal(await page.evaluate(()=>window.continuityCheck.root.isConnected),false,'theme change while away immediately discards A');
   if(returnToOld)await page.evaluate(()=>changeTheme('threeBody'));
   await goHome();await ready(returnToOld?'threeBody':'starlink');assert.equal(await page.evaluate(()=>document.querySelector('#main>.home')===window.continuityCheck.root),false,'return never restores invalidated A');
  });
  await check('base-direct-home-search-tabs',async()=>{
   await select('base');await page.locator('#main [data-search="saved"]').click();
   assert.equal(await page.evaluate(()=>searchType),'saved');assert.equal(await page.locator('#main [data-search="saved"]').getAttribute('class'),'selected');
   assert.equal(await page.locator('#main #engine').count(),0,'saved search must redraw form');
   assert.equal(await page.locator('#main #search-input').getAttribute('aria-label'),'搜索全部收藏');
   await page.locator('#main #search-input').fill('Continuity');await page.locator('#main #search-form').evaluate(node=>node.requestSubmit());
   assert.equal(await page.locator('#main #search-results .result').count(),1);
   await page.locator('#main [data-search="web"]').click();assert.equal(await page.locator('#main #engine').count(),1);assert.equal(await page.locator('#main #search-input').getAttribute('aria-label'),'搜索网页');
  });
  await check('cosmos-direct-home-subviews',async()=>{
   await select('cosmos');await page.locator('#main .three-body-open').click();await page.locator('.three-body-panel:not([hidden]) [data-cosmos-view="classic"]').click();
   await page.waitForSelector('#main>.home-cosmos .cosmos-composition',{timeout:5000});
   assert.equal(await page.locator('#main .three-body-canvas').count(),0);
   assert.equal(await page.evaluate(user=>localStorage.getItem('shiyu-cosmos-view:'+user),userId),'classic');
   await page.locator('.three-body-panel:not([hidden]) [data-cosmos-view="starOrbit"]').click();
   await page.waitForFunction(()=>document.querySelector('#main>.home-threeBody')?.dataset.orbitTheme==='cosmos'&&window.ShiyuThreeBodyScene?.snapshot().loaded===true,null,{timeout:12000});
   assert.equal(await page.evaluate(user=>localStorage.getItem('shiyu-cosmos-view:'+user),userId),'starOrbit');
   await page.locator('.three-body-panel:not([hidden]) .three-body-close').click();
  });
  await check('no-page-errors',async()=>assert.deepEqual(errors,[]));
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({viewport:{width:2066,height:1070},results,errors,requests},null,2));
  const failed=results.filter(result=>!result.pass);console.log(JSON.stringify({passed:results.length-failed.length,failed:failed.length,output}));
  assert.equal(failed.length,0,failed.map(result=>result.name+': '+result.error).join('\n'));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
