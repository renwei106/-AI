/* Local fixtures only: never reads or writes a real account or remote config. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4349/';
const output=path.resolve(__dirname,'../.local/checks/click-only-page-return');
const themeIds=['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'];
const userId='click-only-page-return';
const entitlements=[...['atlas-2d','atlas-3d'].map(key=>({key,kind:'boolean',enabled:true})),{key:'themes',kind:'selection',enabled:true,value:themeIds}];
const user={id:userId,name:'本地返回回归',member:true,permanent:true,profileCompleted:true,entitlements};
const spaces=[{id:'work',name:'本地回归空间',icon:'folder',scenes:[{id:'daily',name:'测试场景',groups:[{id:'tools',name:'测试网址',style:'cards',items:Array.from({length:100},(_,i)=>['本地网址 '+i,'https://example.test/'+i,'仅本地 mock 数据','网'])}]}]}];
const checks=[],errors=[];
let browser,currentPage;

async function fixture(gesture='double',theme='base'){
  const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(({userId,user,spaces,gesture,theme})=>{
    if(window!==window.top)return;
    localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,data:spaces,prefs:{theme,mode:'dark',color:'#115263',homeEntryGesture:gesture,worldEntryGesture:gesture,brandGuideDismissed:true,workspaceGuideDoneV1:true,accountProfile:user,accountDataUserId:userId}}));
    window.__navigationWheelPrevents=[];
    const before=Event.prototype.preventDefault;
    Event.prototype.preventDefault=function(){if(this instanceof WheelEvent)window.__navigationWheelPrevents.push({target:this.target?.className||this.target?.id,deltaY:this.deltaY});return before.call(this)};
  },{userId,user,spaces,gesture,theme});
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname.startsWith('/api/')){
      let json={};
      if(url.pathname==='/api/shiyu/auth/session')json={authenticated:true,user};
      else if(url.pathname==='/api/shiyu/auth/account')json={userId,data:spaces};
      else if(url.pathname==='/api/shiyu/operations')json={onboarding:{enabled:false},world:{enabled:true,eligible:true,modules:{discover:true,resources:true,learning:true,materials:true,creators:true,collaboration:true}},access:{},personalization:{},optionNames:{}};
      else if(url.pathname==='/api/shiyu/theme-access')json={items:themeIds.map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:true};
      else if(url.pathname==='/api/shiyu/plans/catalog')json={resources:{themes:themeIds.map(id=>({id,enabled:true}))},items:[]};
      else if(url.pathname==='/api/shiyu/plans')json={items:[{id:'free',enabled:true,entitlements},{id:'monthly',enabled:true,entitlements}]};
      else if(url.pathname==='/api/shiyu/auth/onboarding')json={userId,onboarding:{status:'skipped',welcome:'handled',home:{status:'done'},space:{status:'done'}}};
      else if(url.pathname==='/api/shiyu/auth/welcome-gift')json={pending:false};
      return route.fulfill({json});
    }
    if(url.origin!==new URL(base).origin)return route.abort();
    return route.continue();
  });
  const page=await context.newPage();currentPage=page;
  page.on('pageerror',error=>errors.push(error.message));
  page.setDefaultTimeout(10000);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>signed&&document.documentElement.classList.contains('shiyu-account-ready')&&window.ShiyuOperations?.worldStatus()==='ready'&&window.ShiyuEntitlements?.snapshot().ready===true);
  await page.waitForTimeout(1100);
  await page.evaluate(()=>{
    window.__navigationMessages=[];const before=toast;
    toast=function(...args){window.__navigationMessages.push(String(args[0]));return before.apply(this,args)};
  });
  return {context,page};
}
async function wheelSeries(page,selector,deltaY,count=4){
  const rect=await page.locator(selector).first().boundingBox();assert(rect,'wheel target is visible: '+selector);
  await page.mouse.move(rect.x+rect.width*.55,rect.y+Math.min(rect.height*.45,240));
  for(let i=0;i<count;i++){await page.mouse.wheel(0,deltaY);await page.waitForTimeout(500);}
}
async function touchSeries(page,selector,deltaY,count=3){
  for(let i=0;i<count;i++){
    await page.locator(selector).first().evaluate((target,dy)=>{
      const rect=target.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+Math.min(rect.height/2,320);
      const point=cy=>new Touch({identifier:1,target,clientX:x,clientY:cy});
      target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[point(y)],changedTouches:[point(y)]}));
      target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[point(y+dy)]}));
    },deltaY);
    await page.waitForTimeout(500);
  }
}
async function settled(page){await page.waitForTimeout(1350);}
async function clearProbes(page){await page.evaluate(()=>{window.__navigationMessages=[];window.__navigationWheelPrevents=[];});}
async function noReturn(page,world=false){
  assert.equal(await page.evaluate(()=>view),world?'home':'space');
  if(world)assert.equal(await page.locator('#world-page:visible').count(),1);
  const probe=await page.evaluate(()=>({prevents:window.__navigationWheelPrevents,messages:window.__navigationMessages}));
  assert.deepEqual(probe.prevents,[],'normal content wheel must not be prevented by a page-return listener');
  assert(!probe.messages.some(text=>/再向上滑|继续向上滑|回到封面|返回首页/.test(text)),JSON.stringify(probe.messages));
}
async function homeReturn(page){
  await page.locator('.space-home-tab').click({force:true});
  await page.waitForFunction(()=>view==='home'&&!!document.querySelector('#main>.home')&&!document.querySelector('#space-atlas')?.open);
  await settled(page);
}
async function check(name,action){await action();checks.push(name);console.log('PASS '+name);}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  for(const gesture of ['double','click']){
    const {context,page}=await fixture(gesture);
    await check(gesture+' preference: home entry and normal/empty space click-only return',async()=>{
      await page.evaluate(()=>{window.__homeNode=document.querySelector('#main>.home');scrollTo(0,document.documentElement.scrollHeight);});
      await wheelSeries(page,'#main>.home',180,1);
      assert.equal(await page.evaluate(()=>view),'home','one wheel gesture does not enter space');
      await wheelSeries(page,'#main>.home',180,1);
      if(gesture==='double')await page.waitForFunction(()=>view==='space'&&!!document.querySelector('#groups'));
      else {assert.equal(await page.evaluate(()=>view),'home');await page.locator('.scroll-invitation').click({force:true});await page.waitForFunction(()=>view==='space'&&!!document.querySelector('#groups'));}
      await settled(page);
      await page.evaluate(()=>{for(let index=0;index<3;index++)renderGroups();});
      assert.equal(await page.locator('.workspace-tools .group-view-controls').count(),1,'repeated group renders keep one shared style control');
      const group=page.locator('#groups');
      const scrollHost=await group.evaluate(node=>node.scrollHeight>node.clientHeight+1?'#groups':'#groups>.group:not([hidden])');
      await page.locator(scrollHost).first().evaluate(node=>node.scrollTop=0);
      await clearProbes(page);
      await wheelSeries(page,'#groups',-180,4);
      await noReturn(page);
      await touchSeries(page,'#groups',150);
      await page.locator('#filter').evaluate(node=>node.blur());
      await page.keyboard.press('PageUp');await page.keyboard.press('PageUp');
      await noReturn(page);
      const before=await page.locator(scrollHost).first().evaluate(node=>node.scrollTop);
      await clearProbes(page);await wheelSeries(page,'#groups',180,1);
      const after=await page.locator(scrollHost).first().evaluate(node=>node.scrollTop);
      assert(after>before,'ordinary bookmark list still scrolls down');
      await noReturn(page);
      if(gesture==='double')await page.screenshot({path:path.join(output,'space.png')});
      await homeReturn(page);assert.equal(await page.evaluate(()=>document.querySelector('#main>.home')===window.__homeNode),true,'click return restores the same original home');
      await page.locator('.scroll-invitation').click({force:true});await page.waitForFunction(()=>view==='space'&&!!document.querySelector('#groups'));await settled(page);
      await page.evaluate(()=>{data.find(s=>s.id==='work').scenes[0].groups[0].items=[];renderGroups();scrollTo(0,0);});
      await clearProbes(page);await wheelSeries(page,'#groups',-180,4);await touchSeries(page,'#groups',150);await page.keyboard.press('PageUp');await noReturn(page);
      await homeReturn(page);
    });
    await check(gesture+' preference: world entry, native scroll, touch and Escape',async()=>{
      await page.evaluate(()=>{scrollTo(0,0);window.__worldHomeNode=document.querySelector('#main>.home');});
      await wheelSeries(page,'#main>.home',-180,1);assert.equal(await page.locator('#world-page:visible').count(),0);
      await wheelSeries(page,'#main>.home',-180,1);
      if(gesture==='double')await page.locator('#world-page:visible').waitFor();
      else {assert.equal(await page.locator('#world-page:visible').count(),0);await page.locator('.world-entry').click({force:true});await page.locator('#world-page:visible').waitFor();}
      await settled(page);await clearProbes(page);
      // Restart at the top each time to exercise the old return boundary, even
      // though the newly allowed native downward wheel moves into the content.
      for(let i=0;i<4;i++){await page.locator('#world-page').evaluate(node=>node.scrollTop=0);await wheelSeries(page,'#world-page',180,1);assert.equal(await page.locator('#world-page:visible').count(),1);}
      assert(await page.locator('#world-page').evaluate(node=>node.scrollTop)>0,'world wheel normally scrolls into content');
      await page.locator('#world-page').evaluate(node=>node.scrollTop=0);await touchSeries(page,'#world-page',150);await page.keyboard.press('Escape');await page.keyboard.press('Escape');await noReturn(page,true);
      if(gesture==='double')await page.screenshot({path:path.join(output,'world.png')});
      await page.locator('#world-page .world-home').click();await page.locator('#world-page:visible').waitFor({state:'hidden'});
      assert.equal(await page.evaluate(()=>document.querySelector('#main>.home')===window.__worldHomeNode),true);await settled(page);
    });
    await context.close();
  }
  const {context,page}=await fixture('double','threeBody');
  await page.waitForFunction(()=>window.ShiyuThreeBodyScene?.snapshot().loaded===true);
  await check('atlas top wheel stays; graph wheel zoom and click return preserve physical scene',async()=>{
    await page.evaluate(()=>{window.__physicalHome=document.querySelector('#main>.home');window.__physicalScene=window.ShiyuThreeBodyScene;});
    await page.locator('.scroll-invitation').click({force:true});await page.waitForFunction(()=>view==='space'&&!!document.querySelector('#groups'));await settled(page);
    await page.locator('.workspace .space-mode-entry').click();await page.locator('[data-space-mode="atlas"]').click();await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor();await settled(page);
    await clearProbes(page);
    const headerSelector='#space-atlas .at-header-actions';
    await wheelSeries(page,headerSelector,-180,4);assert.equal(await page.locator('#space-atlas[open]').count(),1);await noReturn(page);
    const node=page.locator('.at-node[data-level="0"]').first();
    const before=await node.evaluate(node=>Number(getComputedStyle(node).zoom));
    await wheelSeries(page,'.at-canvas',-180,2);
    const after=await node.evaluate(node=>Number(getComputedStyle(node).zoom));assert(after>before,'graph wheel retains zoom');
    assert.equal(await page.locator('#space-atlas[open]').count(),1);
    await page.screenshot({path:path.join(output,'atlas.png')});
    await homeReturn(page);
    assert.deepEqual(await page.evaluate(()=>({root:document.querySelector('#main>.home')===window.__physicalHome,scene:window.ShiyuThreeBodyScene===window.__physicalScene,loaded:window.ShiyuThreeBodyScene.snapshot().loaded})),{root:true,scene:true,loaded:true});
  });
  await check('world detail Escape returns to parent; modal Escape closes only modal',async()=>{
    await page.locator('.world-entry').click({force:true});await page.locator('#world-page:visible').waitFor();
    await page.locator('.world-nav [data-w-section="resources"]').click();
    await page.locator('#world-page [data-w-open="resource-category"]').first().click();
    assert.equal(await page.locator('#world-page').getAttribute('data-section'),'resource-category');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('#world-page').dataset.section==='resources');
    await page.keyboard.press('Escape');assert.equal(await page.locator('#world-page:visible').count(),1);
    await page.locator('.world-nav [data-w-section="creators"]').click();await page.locator('[data-w-preview="publish"]').click();await page.locator('#world-dialog[open]').waitFor();
    await page.keyboard.press('Escape');await page.locator('#world-dialog[open]').waitFor({state:'hidden'});assert.equal(await page.locator('#world-page:visible').count(),1);
    await page.locator('#world-page .world-home').click();await page.locator('#world-page:visible').waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>window.ShiyuThreeBodyScene===window.__physicalScene),true);
  });
  await context.close();assert.deepEqual(errors,[],'no runtime errors');
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({status:'PASS',checks,errors},null,2));
  console.log(JSON.stringify({status:'PASS',checks,errors},null,2));
})().catch(async error=>{
  console.error(error);
  if(currentPage&&!currentPage.isClosed())await currentPage.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({status:'FAIL',checks,errors,error:error.stack},null,2));
  process.exitCode=1;
}).finally(async()=>{await browser?.close();});
