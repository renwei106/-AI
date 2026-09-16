const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const errors=[];
const checks=[];
const report={viewPicker:{},directEntry:{}};
let browser;

function rememberedAtlas({mode='2d',layout='radial',scene3d='solar'}={}){
  return {
    work:{
      mode,layout,scene3d,motion:false,
      entry:{last:{view:'atlas',theme:'base',mode,layout,scene3d,motion:false}}
    }
  };
}

async function pageWithRememberedAtlas({mode='2d',layout='radial',scene3d='solar',reducedMotion='reduce'}={}){
  const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion});
  await context.addInitScript(({app,atlas})=>{
    localStorage.setItem('yiyu-prototype-v1',JSON.stringify(app));
    localStorage.setItem('shiyu-space-atlas-v1',JSON.stringify(atlas));
  },{
    app:{
      prefs:{theme:'base',homeEntryGesture:'single',spaceThemePolicy:'last',inspirationMockV1:true,firstSpaceCapacityV1:true},
      signed:true
    },
    atlas:rememberedAtlas({mode,layout,scene3d})
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  return {context,page};
}

async function openRememberedAtlas(page){
  await page.evaluate(()=>goSpace('work'));
  await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor({state:'visible'});
}

async function pickerState(page){
  return page.evaluate(()=>{
    const trigger=document.querySelector('#space-atlas [data-at="views"]');
    const popup=document.querySelector('#space-atlas .at-layout-menu');
    const shell=document.querySelector('#space-atlas .at-full-page');
    const tabs=[...popup.querySelectorAll('[role="tab"]')].map(tab=>({
      text:tab.textContent.replace(/\s+/g,' ').trim(),
      selected:tab.getAttribute('aria-selected'),
      controls:tab.getAttribute('aria-controls'),
      focused:tab===document.activeElement
    }));
    const views=[...popup.querySelectorAll('[data-at-view]')].map(button=>({
      id:button.dataset.atView,
      visible:button.getClientRects().length>0&&getComputedStyle(button).visibility!=='hidden',
      pressed:button.getAttribute('aria-pressed')
    }));
    const triggerRect=trigger.getBoundingClientRect(),popupRect=popup.getBoundingClientRect();
    return {
      trigger:{expanded:trigger.getAttribute('aria-expanded'),hasPopup:trigger.getAttribute('aria-haspopup'),controls:trigger.getAttribute('aria-controls'),rect:{x:triggerRect.x,y:triggerRect.y,width:triggerRect.width,height:triggerRect.height}},
      popup:{hidden:popup.hidden,role:popup.getAttribute('role'),id:popup.id,rect:{x:popupRect.x,y:popupRect.y,width:popupRect.width,height:popupRect.height}},
      shell:{mode:shell.dataset.mode,layout:shell.dataset.layout,presentation:shell.dataset.presentation},
      tabs,views
    };
  });
}

async function verifyViewPicker(){
  const {context,page}=await pageWithRememberedAtlas();
  try{
    await openRememberedAtlas(page);
    const trigger=page.locator('#space-atlas [data-at="views"]');
    const popup=page.locator('#space-atlas .at-layout-menu');
    assert.equal(await popup.isHidden(),true,'view picker starts closed');
    assert.deepEqual(await trigger.evaluate(element=>[...element.children].map(child=>child.classList.contains('at-view-dimension')?'dimension':child.classList.contains('at-view-current')?'current':child.tagName.toLowerCase())),['dimension','current','svg'],'the compact value starts with 2D/3D, followed by icon and style name');
    assert.equal(await trigger.locator(':scope > .at-view-current > svg').count(),1,'the current style keeps its vector icon beside the name');

    await trigger.hover();
    await popup.waitFor({state:'visible'});
    let state=await pickerState(page);
    assert.equal(state.trigger.expanded,'true','hovering the trigger exposes the picker');
    assert.equal(state.trigger.hasPopup,'dialog','trigger describes the non-modal tabbed picker');
    assert.equal(state.trigger.controls,state.popup.id,'trigger aria-controls points to the picker');
    assert.equal(state.popup.role,'dialog','tabbed picker uses dialog semantics rather than menu semantics');
    assert(state.popup.rect.y+state.popup.rect.height<=state.trigger.rect.y+2,'picker opens above the lower-right trigger');
    assert.deepEqual(state.tabs.map(tab=>tab.text),['2D','3D'],'dimension tabs are concise and ordered 2D then 3D');
    assert.deepEqual(state.tabs.map(tab=>tab.selected),['true','false'],'remembered 2D view selects the 2D tab');
    assert(state.tabs.every(tab=>tab.controls),'each dimension tab is connected to a tab panel');
    assert.deepEqual(state.views.filter(view=>view.visible).map(view=>view.id),['radial','organization','mindmap'],'2D tab shows only 2D layouts');
    await trigger.click();
    assert.equal(await popup.isVisible(),true,'a click that follows hover keeps the picker open instead of immediately toggling it closed');

    const tab3d=popup.getByRole('tab',{name:'3D'});
    await tab3d.hover();
    await page.waitForTimeout(320);
    assert.equal(await popup.isVisible(),true,'moving from trigger into the picker keeps it open');
    await tab3d.click();
    state=await pickerState(page);
    assert.deepEqual(state.shell,{mode:'2d',layout:'radial',presentation:'spatial'},'changing the dimension tab does not change the graph itself');
    assert.deepEqual(state.tabs.map(tab=>tab.selected),['false','true'],'3D tab becomes selected inside the picker');
    const visible3d=state.views.filter(view=>view.visible).map(view=>view.id);
    assert(visible3d.includes('spatial')&&visible3d.includes('solar'),'3D tab exposes the established 3D styles');
    assert.equal(visible3d.some(id=>['radial','organization','mindmap'].includes(id)),false,'3D tab hides all 2D layouts');

    await popup.locator('[data-at-view="solar"]').click();
    await page.locator('#space-atlas .at-full-page[data-mode="3d"][data-presentation="solar"]').waitFor();
    assert.equal(await popup.isHidden(),true,'choosing a style closes the picker');
    assert.match((await trigger.innerText()).replace(/\s+/g,' '),/3D.*行星轨道|行星轨道.*3D/,'trigger reports the selected dimension and style');

    await trigger.hover();
    await popup.waitFor({state:'visible'});
    state=await pickerState(page);
    assert.deepEqual(state.tabs.map(tab=>tab.selected),['false','true'],'reopening keeps the current 3D tab selected');
    await popup.getByRole('tab',{name:'2D'}).click();
    state=await pickerState(page);
    assert.deepEqual(state.shell,{mode:'3d',layout:'radial',presentation:'solar'},'returning to the 2D tab still leaves the current 3D view untouched');
    assert.deepEqual(state.views.filter(view=>view.visible).map(view=>view.id),['radial','organization','mindmap'],'2D tab restores only its three layouts');
    await popup.locator('[data-at-view="organization"]').click();
    await page.locator('#space-atlas .at-full-page[data-mode="2d"][data-layout="organization"]').waitFor();
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('shiyu-space-atlas-v1')).work);
    assert.equal(stored.mode,'2d');
    assert.equal(stored.layout,'organization','style selection persists the new graph view');

    // Keyboard access mirrors hover access. Arrow keys move between dimension
    // tabs, while Escape closes the picker and restores focus to its trigger.
    await page.mouse.move(600,450);
    await page.waitForTimeout(360);
    await trigger.focus();
    await page.keyboard.press('Enter');
    await popup.waitFor({state:'visible'});
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('role')),'tab','Tab enters the dimension tab list');
    await page.keyboard.press('ArrowRight');
    state=await pickerState(page);
    assert.equal(state.tabs.find(tab=>tab.text==='3D').selected,'true','ArrowRight activates the next dimension tab');
    assert.equal(state.tabs.find(tab=>tab.text==='3D').focused,true,'ArrowRight also moves keyboard focus');
    assert.equal(state.shell.mode,'2d','keyboard tab navigation does not apply a graph view');
    await page.keyboard.press('Escape');
    assert.equal(await popup.isHidden(),true,'Escape closes the picker');
    assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,'Escape restores focus to the trigger');

    await trigger.hover();
    await popup.waitFor({state:'visible'});
    await page.mouse.move(620,420);
    await page.waitForTimeout(380);
    assert.equal(await popup.isHidden(),true,'leaving both trigger and popup closes the hover picker');

    report.viewPicker={tabs:state.tabs,visible3d,stored};
    await trigger.hover();
    await popup.waitFor({state:'visible'});
    await page.screenshot({path:path.join(__dirname,'v11-view-tabs.png')});
    checks.push('右下视图选择器悬停展开，2D/3D Tab 只筛选样式，选择样式后才切换图谱');
    checks.push('视图选择器具备完整 Tab、方向键、Escape 与悬停离开交互');
  }finally{
    await context.close();
  }
}

async function verifyDirectRememberedEntry(){
  const {context,page}=await pageWithRememberedAtlas({mode:'3d',layout:'mindmap',scene3d:'solar',reducedMotion:'no-preference'});
  try{
    assert.equal(await page.evaluate(()=>view),'home','the session begins on the cover');
    await page.evaluate(()=>{
      window.__v11EntryFrames=[];
      const started=performance.now();
      const visualOpacity=element=>{
        if(!element)return 0;
        let opacity=1;
        for(let current=element;current&&current.nodeType===1;current=current.parentElement){
          const style=getComputedStyle(current);
          if(style.display==='none'||style.visibility==='hidden')return 0;
          opacity*=Number(style.opacity)||0;
        }
        return opacity;
      };
      const sample=()=>{
        const dialog=document.querySelector('#space-atlas');
        const shell=dialog?.querySelector('.at-full-page');
        const workspace=document.querySelector('#main>.workspace');
        window.__v11EntryFrames.push({
          time:performance.now()-started,
          view,
          bodyView:document.body.dataset.view,
          dialogOpen:dialog?.open===true,
          atlasReady:dialog?.classList.contains('atlas-ready')===true,
          atlasOpacity:dialog?Number(getComputedStyle(dialog).opacity):0,
          dailyOpacity:visualOpacity(workspace),
          mode:shell?.dataset.mode||null,
          layout:shell?.dataset.layout||null,
          presentation:shell?.dataset.presentation||null
        });
        if(performance.now()-started<1450)requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
      scrollTo(0,document.documentElement.scrollHeight);
    });
    await page.mouse.move(640,720);
    await page.mouse.wheel(0,150);
    await page.waitForFunction(()=>view==='space'&&document.querySelector('#space-atlas')?.open===true);
    await page.locator('#space-atlas.atlas-ready .at-canvas').waitFor({state:'visible'});
    await page.waitForTimeout(1200);
    const frames=await page.evaluate(()=>window.__v11EntryFrames);
    const entered=frames.filter(frame=>frame.view==='space');
    assert(entered.length>3,'sampler captures multiple entry frames');
    assert(entered.every(frame=>frame.bodyView==='space'),'body state is already space in every entry frame');
    assert(entered.every(frame=>frame.dialogOpen),'remembered atlas is open from the first painted space frame');
    assert(entered.every(frame=>frame.mode==='3d'&&frame.presentation==='solar'),'remembered 3D style is applied before the first painted space frame');
    const exposed=entered.filter(frame=>frame.dailyOpacity>.01);
    assert.deepEqual(exposed,[],'regular workspace must stay visually hidden throughout direct atlas entry');
    assert(entered.some(frame=>frame.atlasReady&&frame.atlasOpacity>.99),'atlas completes its smooth reveal');
    report.directEntry={frames:entered.length,first:entered[0],last:entered.at(-1),regularFramesExposed:exposed.length};
    await page.screenshot({path:path.join(__dirname,'v11-direct-atlas.png')});
    checks.push('记住图谱视图后从首页下滑，首个空间帧直接使用上次 3D 样式且不露出常规视图');
  }finally{
    await context.close();
  }
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  await verifyViewPicker();
  await verifyDirectRememberedEntry();
  assert.deepEqual(errors,[],'page should not raise runtime errors');
  const output={status:'PASS',checks,errors,report};
  fs.writeFileSync(path.join(__dirname,'v11-view-tabs-report.json'),JSON.stringify(output,null,2));
  console.log(JSON.stringify(output,null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
