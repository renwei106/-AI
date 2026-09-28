/* All account and content APIs are intercepted by the desktop-pet fixture. */
const {fixture,out,base}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const retired='#corner-orbit-demo,#corner-orbit-preview,#corner-home-settings,.corner-entry,.corner-entry-slot,.corner-legacy-hidden,iframe[src*="liquid-orbit-menu"]';
const core=p=>p.locator('#desktop-pet .pet-character');
async function absent(p){
  assert.equal(await p.locator(retired).count(),0,'retired launcher must not exist, including hidden anchors');
  assert.equal(await p.locator('#dock').evaluate(n=>n.childElementCount),0,'no launcher placeholder or old space dock');
  assert.equal(await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('liquid-orbit-menu'))),false,'no retired iframe requests');
}
async function app(p,id){
  if(await p.locator('#desktop-pet').getAttribute('data-open')!=='true')await core(p).click();
  await p.locator(`.pet-menu [data-pet-id="${id}"]`).click();
  await p.waitForFunction(id=>document.querySelector('#my-corner[open]')?.dataset.cornerModule===id,id);
  await p.waitForFunction(()=>!document.querySelector('#my-corner')?.classList.contains('corner-reveal-opening'));
}
async function verify(browser){
  const before=await fixture(browser,true,'7686ca0'),f=await fixture(browser),p=f.page;
  for(const [theme,mode]of [['base','light'],['music','dark'],['paper','light']]){
    const boxes=[];
    for(const [label,state]of [['before',before],['after',f]]){
      await state.page.evaluate(({theme,mode})=>{view='home';prefs.theme=theme;prefs.mode=mode;render();},{theme,mode});
      await state.page.evaluate(()=>document.fonts.ready);await state.page.waitForTimeout(350);
      boxes.push(await state.page.locator('#main').boundingBox());
      await state.page.screenshot({path:path.join(out,`retired-entry-${theme}-${label}.png`)});
    }
    assert.deepEqual(boxes[1],boxes[0],`${theme} page geometry is unchanged`);await absent(p);
    await p.mouse.move(720,860);await p.waitForTimeout(450);await absent(p);
  }
  await before.context.close();
  await p.emulateMedia({reducedMotion:'no-preference'});
  await p.evaluate(()=>{
    const id=prefs.accountProfile.id;
    const groups=()=>[{id:'saved-inbox',system:'inbox',name:'暂存',iconMode:'manual',icon:'lib-Inbox',refs:[]},{id:'saved-group',name:'保留的收藏',iconMode:'default',iconSlot:0,refs:[]}];
    prefs.cornerCollections={[id]:{groups:groups(),stageVersion:2}};
    prefs.cornerCollections[id].groups[1].refs.push({id:'saved-url',url:'https://example.test/saved',own:['保留的网址','https://example.test/saved','原有说明','网']});
    prefs.cornerModules={[id]:{memo:{groups:groups(),notes:[{id:'saved-note',title:'保留的小记',content:'原有正文',updatedAt:1}],stageVersion:1},todo:{groups:groups(),tasks:[{id:'saved-task',title:'保留的待办',date:'2026-09-28',start:540,duration:60,color:'blue',status:'today'}],inbox:[],stageVersion:1}}};
    delete prefs.cornerCloseGuideAcknowledgedV1[id];persist();
    prefs.theme='base';prefs.mode='light';render();
  });
  const art=await core(p).innerHTML(),position=await p.locator('#desktop-pet').boundingBox();
  for(const id of ['common','memo','todo']){
    await app(p,id);await absent(p);
    assert.equal(await core(p).innerHTML(),art,'opening an app never repurposes the pet as its close button');
    assert.deepEqual(await p.locator('#desktop-pet').boundingBox(),position);
    const close=p.locator('#my-corner .corner-close-entry');await close.waitFor({state:'visible'});
    assert.equal(await close.getAttribute('aria-label'),'关闭当前应用');
    if(id==='common'){
      await p.locator('.corner-close-guide').waitFor();await p.locator('.corner-close-guide-ack').click();
      assert.equal(await p.locator('[data-corner-card=saved-group]').count(),1);
    }
    if(id==='memo'){
      await p.locator('.is-active [data-memo-card]').click();await p.locator('.memo-paper-editor').waitFor();
      assert(await close.isHidden());assert(await core(p).isHidden());
      await p.locator('[data-memo-close]').click();await p.locator('.memo-paper-editor').waitFor({state:'detached'});
    }
    await p.screenshot({path:path.join(out,`retired-entry-${id}-preserved.png`)});
    await close.click();await p.locator('#my-corner[open]').waitFor({state:'detached'});await core(p).waitFor();
    await p.waitForFunction(()=>document.activeElement===document.querySelector('#desktop-pet .pet-character'));
    assert.equal(await core(p).innerHTML(),art);await absent(p);
  }
  await p.reload({waitUntil:'networkidle'});await absent(p);
  const saved=await p.evaluate(()=>{const id=prefs.accountProfile.id;return {url:prefs.cornerCollections[id].groups.find(g=>g.id==='saved-group').refs[0].url,note:prefs.cornerModules[id].memo.notes.find(n=>n.id==='saved-note').content,task:prefs.cornerModules[id].todo.tasks.find(t=>t.id==='saved-task').title};});
  assert.deepEqual(saved,{url:'https://example.test/saved',note:'原有正文',task:'保留的待办'});
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{view='space';render();});await absent(p);
  await p.screenshot({path:path.join(out,'retired-entry-mobile-space.png')});
  assert.equal((await f.context.request.get(new URL('/liquid-orbit-menu.html',base).href)).status(),404);
  assert.deepEqual(f.errors,[]);await f.context.close();
  const guest=await fixture(browser,false);await absent(guest.page);await core(guest.page).click();
  await guest.page.locator('.pet-menu [data-pet-id=common]').click();await guest.page.locator('#login[open]').waitFor();
  assert.equal(await guest.page.locator('#my-corner[open]').count(),0);assert.deepEqual(guest.errors,[]);await guest.context.close();
  console.log('PASS legacy entry absent across themes, hover, resize, navigation and guests; app close, memo editing, pet identity and saved data preserved');
}
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-lcd-text']});try{await verify(browser);}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
