const {fixture,out,base}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const core=p=>p.locator('#desktop-pet .pet-character');
async function click(p,action,id){
 if(await p.locator('#desktop-pet').getAttribute('data-open')!=='true')await core(p).click();
 await p.locator(`.pet-menu [data-pet-action="${action}"]${id?`[data-pet-id="${id}"]`:''}`).click();
}
async function compareSurfaces(browser){
 const before=await fixture(browser,true,true),after=await fixture(browser);
 for(const area of ['home','space']){
  for(const f of [before,after]){await f.page.evaluate(area=>{view=area;render();},area);await f.page.evaluate(()=>document.fonts.ready);await f.page.addStyleTag({content:'#desktop-pet{display:none!important}'});await f.page.waitForTimeout(350);}
  const captures=[];
  for(const [i,f]of [before,after].entries()){const buffer=await f.page.screenshot({animations:'disabled',mask:[f.page.locator('#corner-orbit-demo'),f.page.locator('#corner-orbit-preview')]});fs.writeFileSync(path.join(out,`regression-${area}-${i?'after':'before'}.png`),buffer);captures.push(await sharp(buffer).ensureAlpha().raw().toBuffer());}
  let changed=0;for(let i=0;i<captures[0].length;i+=4){if(Math.max(...[0,1,2].map(k=>Math.abs(captures[0][i+k]-captures[1][i+k])))>15)changed++;}
  const ratio=changed/(1440*960);assert(ratio<.002,`unrelated ${area} visuals changed: ${ratio}`);console.log(`PASS ${area} baseline image: ${(ratio*100).toFixed(4)}% pixels changed outside pet`);
 }
 await before.context.close();await after.context.close();
}
async function layersAndInput(browser){
 const f=await fixture(browser),p=f.page;
 await click(p,'navigate','space');await p.waitForFunction(()=>view==='space');
 await p.locator('.space-mode-entry').click();await p.locator('#space-atlas[open]').waitFor();await p.locator('#space-atlas #desktop-pet').waitFor();
 await p.screenshot({path:path.join(out,'atlas-pet.png')});
 await click(p,'navigate','home');await p.waitForFunction(()=>view==='home'&&!document.querySelector('#space-atlas[open]'));
 await click(p,'app','common');await p.locator('#my-corner[open]').waitFor();
 await p.locator('[data-corner-cord=fullscreen]').click();await p.waitForFunction(()=>Boolean(document.fullscreenElement));
 assert(await p.locator('#desktop-pet').evaluate(n=>document.fullscreenElement.contains(n)),'pet remains inside native fullscreen content');
 await click(p,'navigate','home');await p.waitForFunction(()=>!document.fullscreenElement&&!document.querySelector('#my-corner[open]'));
 await p.mouse.move(200,200);await core(p).hover();await p.locator('#desktop-pet[data-open="true"]').waitFor();
 const app=p.locator('.pet-menu [data-pet-id=common]'),box=await app.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:10});await p.waitForTimeout(400);assert(await app.isVisible(),'hover corridor keeps the menu available');
 await p.mouse.move(300,300);await p.waitForTimeout(450);assert.equal(await p.locator('#desktop-pet').getAttribute('data-open'),'false','hover-only menu dismisses on leave');
 await core(p).focus();await p.keyboard.press('ArrowDown');assert.equal(await p.locator('#desktop-pet').getAttribute('data-open'),'true');await p.keyboard.press('Escape');assert.equal(await p.locator('#desktop-pet').getAttribute('data-open'),'false');
 await p.setViewportSize({width:320,height:480});await click(p,'more','__more');
 await p.screenshot({path:path.join(out,'compact-all-apps.png')});
 const panel=await p.locator('.pet-panel').boundingBox();assert(panel.x>=0&&panel.y>=0&&panel.x+panel.width<=320&&panel.y+panel.height<=480);
 assert.equal(await p.locator('.pet-panel [data-pet-action=app]').count(),8,'overflow preserves the entire application catalog');
 await p.locator('.pet-panel').hover();await p.mouse.wheel(0,-160);await p.waitForTimeout(220);await p.mouse.wheel(0,-160);await p.waitForTimeout(220);
 assert.equal(await p.evaluate(()=>document.body.classList.contains('world-active')),false,'scrolling pet entries does not activate page navigation gestures');
 await p.setViewportSize({width:1440,height:960});await click(p,'settings');
 await p.locator('[data-pet-pref=skin][data-value=sprout]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().skin==='sprout');
 await p.locator('[data-pet-pref=enabled][data-value=false]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().enabled===false);
 await p.locator('#settings').evaluate(d=>d.close());assert(await p.locator('#desktop-pet').isHidden());
 await p.evaluate(()=>{scope='global';settingsTab='desktop-pet';renderSettings();show('#settings')});
 await p.locator('[data-pet-pref=enabled][data-value=true]').click();await p.locator('#settings').evaluate(d=>d.close());await core(p).waitFor();
 await p.screenshot({path:path.join(out,'sprout-pet.png')});
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS atlas, hover corridor, keyboard, compact overflow, hide/re-enable');
}
async function subApps(browser){
 const f=await fixture(browser),p=f.page;
 const rect=await core(p).boundingBox();await p.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await p.mouse.down();await p.waitForTimeout(300);await p.mouse.move(860,680,{steps:8});await p.mouse.up();await p.waitForTimeout(450);
 const position=await p.locator('#desktop-pet').boundingBox();
 const tool=await f.context.newPage();await tool.goto('http://127.0.0.1:4173/#home',{waitUntil:'networkidle'});await core(tool).waitFor();
 assert.deepEqual(await tool.locator('#desktop-pet').boundingBox(),position,'other origin restores the shared companion position');
 await tool.evaluate(()=>window.__petReference=document.querySelector('#desktop-pet'));
 await click(tool,'more','__more');await tool.locator('.pet-panel [data-pet-id=studio]').click();await tool.waitForURL('**/#');
 assert(await tool.evaluate(()=>window.__petReference===document.querySelector('#desktop-pet')),'tool routes keep one pet');
 await tool.screenshot({path:path.join(out,'light-app-pet.png')});
 await tool.evaluate(()=>location.hash='work');await tool.locator('#gallery').waitFor();
 await tool.evaluate(async()=>{const {state}=await import('/model.js');state.items=[{id:'unsaved-test',name:'未保存测试'}];});
 await click(tool,'navigate','home');await tool.locator('.leave-dialog[open]').waitFor();assert(tool.url().includes('#work'));
 await tool.locator('#keep-creating').click();assert(tool.url().includes('#work'),'return-home respects unsaved work cancellation');
 await click(tool,'navigate','home');await tool.locator('#leave-creating').click();await tool.waitForURL(base);await core(tool).waitFor();
 assert.deepEqual(await tool.locator('#desktop-pet').boundingBox(),position,'return-home keeps the same position');
 await tool.goto('http://127.0.0.1:4173/#home',{waitUntil:'networkidle'});f.authenticated=false;
 await click(tool,'more','__more');await tool.locator('.pet-panel [data-pet-id=studio]').click();await tool.locator('#login[open]').waitFor();assert(tool.url().endsWith('#home'),'expired tool session does not enter the private shortcut');
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS cross-origin position, one instance per application, return-home, leave confirmation, tool session expiry');
}
async function entryPolicies(browser){
 const f=await fixture(browser),p=f.page;
 await click(p,'navigate','space');await p.waitForFunction(()=>view==='space');await click(p,'navigate','space');await p.locator('.pet-panel [data-pet-id=life]').click();await p.waitForFunction(()=>spaceId==='life');
 await click(p,'navigate','home');await p.reload({waitUntil:'networkidle'});await click(p,'navigate','space');await p.waitForFunction(()=>view==='space'&&spaceId==='life');
 await click(p,'navigate','world');await p.locator('#world-page').waitFor({state:'visible'});
 await p.locator('.world-nav [data-w-section=resources]').click();await p.locator('#world-page').evaluate(n=>n.scrollTop=240);
 const scroll=await p.locator('#world-page').evaluate(n=>n.scrollTop);
 await click(p,'navigate','home');await click(p,'navigate','world');await p.locator('#world-page').waitFor({state:'visible'});
 assert.equal(await p.locator('#world-page').evaluate(n=>n.scrollTop),scroll,'pet resumes the world list position');
 await p.locator('[data-w-open=collection]').first().click();await core(p).waitFor();await click(p,'navigate','world');await p.waitForFunction(()=>new URL(location.href).searchParams.get('section')==='resources');assert.equal(new URL(p.url()).searchParams.get('section'),'resources','world detail returns to its list');
 await click(p,'navigate','home');
 f.operations.world={...f.operations.world,audience:'whitelist',whitelist:''};f.operations.corner.modules=f.operations.corner.modules.map(m=>m.id==='memo'?{...m,enabled:false}:m);
 await p.reload({waitUntil:'networkidle'});await click(p,'more','__more');assert.equal(await p.locator('.pet-panel [data-pet-id=memo]').count(),0,'disabled applications are not exposed by the new entry');
 await p.mouse.click(300,300);await click(p,'navigate','world');await p.locator('#shiyu-operations-dialog[open]').waitFor();assert.equal(await p.evaluate(()=>document.body.classList.contains('world-active')),false,'world audience rules still apply to authenticated users');
 await p.locator('#shiyu-operations-dialog').evaluate(d=>d.close());
 const locked=await p.evaluate(async()=>{document.body.classList.add('theme-preview-corner-disabled');const result=await ShiyuCorner.openModule('common');document.body.classList.remove('theme-preview-corner-disabled');return result;});assert.equal(locked,false,'new application adapter respects the expired-theme gate');
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS last space, world detail/list resume, disabled modules, world audience and theme-expiry gates');
}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{await compareSurfaces(b);await layersAndInput(b);await subApps(b);await entryPolicies(b);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
