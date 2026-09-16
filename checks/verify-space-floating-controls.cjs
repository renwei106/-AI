const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
let browser;

function closeTo(actual,expected,message){
  assert(Math.abs(actual-expected)<=1,`${message}: expected ${expected} +/- 1px, received ${actual}px`);
}

function overlaps(a,b){
  return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
}

async function prepare(page){
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  await page.evaluate(()=>{
    signed=true;
    prefs.theme='base';
    prefs.mode='light';
    prefs.spaceThemePolicy='default';
    const target=data.find(item=>item.id==='work')||data[0];
    const current=target.scenes[0];
    const active=current.groups[0];
    while(active.items.length<30){
      const index=active.items.length+1;
      active.items.push([`回归收藏 ${index}`,`https://example.com/floating-controls/${index}`,'用于验证空间详情页滚动布局',String(index)]);
    }
    spaceId=target.id;
    sceneId=current.id;
    activeGroups[current.id]=active.id;
    view='space';
    render();
  });
  await page.locator('.workspace-tools>.group-view-controls').waitFor({state:'visible'});
  await page.locator('.group-tab-bar').waitFor({state:'visible'});
}

async function geometry(page){
  return page.evaluate(()=>{
    const box=selector=>{
      const node=document.querySelector(selector);
      if(!node)throw new Error(`Missing ${selector}`);
      const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
      return {
        left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,
        width:rect.width,height:rect.height,position:style.position
      };
    };
    return {
      scrollY,
      viewport:{width:innerWidth,height:innerHeight},
      tools:box('.workspace-tools'),
      controls:box('.workspace-tools>.group-view-controls'),
      groupBar:box('.group-tab-bar'),
      dock:box('#dock .dock-trigger')
    };
  });
}

async function verifyDialogs(page,label){
  await page.locator('.workspace-tools>.group-view-controls [data-link-settings]').click();
  await page.locator('#link-view-settings[open]').waitFor({state:'visible'});
  await page.locator('#link-view-settings .dialog-heading [data-action="close"]').click();
  await page.locator('#link-view-settings').waitFor({state:'hidden'});

  await page.locator('.workspace-tools>.group-view-controls [data-column-settings]').click();
  await page.locator('#column-settings[open]').waitFor({state:'visible'});
  await page.locator('#column-settings .dialog-heading [data-action="close"]').click();
  await page.locator('#column-settings').waitFor({state:'hidden'});
  return `${label}: both settings dialogs open from their matching buttons`;
}

async function verifyDesktop(context){
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await prepare(page);
    const before=await geometry(page);
    assert.equal(before.controls.position,'fixed','desktop controls are fixed');
    closeTo(before.viewport.width-before.controls.right,32,'desktop controls keep the requested right offset');
    closeTo(before.viewport.height-before.controls.bottom,24,'desktop controls keep the requested bottom offset');
    closeTo(before.tools.height,0,'desktop workspace tools collapse out of document flow');
    assert(before.groupBar.top>=before.tools.top-1&&before.groupBar.top-before.tools.top<=24,
      `desktop group bar moves up behind the collapsed tool row: ${JSON.stringify({tools:before.tools,groupBar:before.groupBar})}`);
    assert(!overlaps(before.controls,before.dock),
      `desktop controls do not intersect the bottom space dock: ${JSON.stringify({controls:before.controls,dock:before.dock})}`);

    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    await page.waitForFunction(()=>scrollY>0);
    const after=await geometry(page);
    closeTo(after.controls.left,before.controls.left,'desktop controls keep their x coordinate after scrolling');
    closeTo(after.controls.top,before.controls.top,'desktop controls keep their y coordinate after scrolling');
    assert(!overlaps(after.controls,after.dock),'desktop controls still do not intersect the dock after scrolling');
    await verifyDialogs(page,'desktop');
    assert.deepEqual(errors,[],'desktop has no runtime errors');
    return {before,after};
  }finally{
    await page.close();
  }
}

async function verifyMobile(context){
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await prepare(page);
    const state=await geometry(page);
    assert.notEqual(state.controls.position,'fixed','mobile controls stay in normal flow');
    assert(state.tools.height>0,
      `mobile workspace tools retain a non-zero row height: ${JSON.stringify({tools:state.tools,controls:state.controls})}`);
    assert(state.controls.top>=state.tools.top-1&&state.controls.bottom<=state.tools.bottom+1,
      `mobile controls remain inside the workspace tool row: ${JSON.stringify({tools:state.tools,controls:state.controls})}`);
    assert(state.groupBar.top>state.tools.bottom,
      `mobile group bar remains after the workspace tool row: ${JSON.stringify({tools:state.tools,groupBar:state.groupBar})}`);
    assert(!overlaps(state.tools,state.dock),
      `mobile workspace tools do not intersect the bottom space dock: ${JSON.stringify({tools:state.tools,dock:state.dock})}`);
    await verifyDialogs(page,'mobile');
    assert.deepEqual(errors,[],'mobile has no runtime errors');
    return state;
  }finally{
    await page.close();
  }
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const desktop=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
  const mobile=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true,isMobile:true});
  await Promise.all([desktop,mobile].map(context=>context.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode:'light',homeEntryGesture:'single',spaceThemePolicy:'default'},signed:true})))));
  const desktopResult=await verifyDesktop(desktop);
  const mobileResult=await verifyMobile(mobile);
  await Promise.all([desktop.close(),mobile.close()]);
  console.log(JSON.stringify({status:'PASS',desktop:{right:desktopResult.before.viewport.width-desktopResult.before.controls.right,bottom:desktopResult.before.viewport.height-desktopResult.before.controls.bottom,toolsHeight:desktopResult.before.tools.height,scrollY:desktopResult.after.scrollY},mobile:{position:mobileResult.controls.position,toolsHeight:mobileResult.tools.height}},null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
