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
  // The retired launcher is an intended removal. Mask the same rectangles in both captures.
  const regions=await before.page.locator('#corner-orbit-demo,#corner-orbit-preview,#dock').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}).filter(r=>r.width&&r.height));
  for(const f of [before,after])await f.page.evaluate(regions=>{document.querySelectorAll('[data-retired-entry-mask]').forEach(n=>n.remove());for(const r of regions){const n=document.createElement('div');n.dataset.retiredEntryMask='';n.style.cssText=`position:fixed;left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px;background:#f0f;z-index:2147483647;pointer-events:none`;document.body.append(n);}},regions);
  const captures=[];
  for(const [i,f]of [before,after].entries()){const buffer=await f.page.screenshot({animations:'disabled'});fs.writeFileSync(path.join(out,`regression-${area}-${i?'after':'before'}.png`),buffer);captures.push(await sharp(buffer).ensureAlpha().raw().toBuffer());}
  let changed=0;for(let i=0;i<captures[0].length;i+=4){if(Math.max(...[0,1,2].map(k=>Math.abs(captures[0][i+k]-captures[1][i+k])))>15)changed++;}
  const ratio=changed/(1440*960);assert(ratio<.002,`unrelated ${area} visuals changed: ${ratio}`);console.log(`PASS ${area} baseline image: ${(ratio*100).toFixed(4)}% pixels changed outside pet`);
 }
 await before.context.close();await after.context.close();
}
async function adaptiveArcs(browser){
 const f=await fixture(browser),p=f.page,allModules=structuredClone(f.operations.corner.modules);
 const setModules=small=>{f.operations.corner.modules=allModules.map((module,index)=>({...module,enabled:small?index<2:module.enabled}));};
 const inspect=async(x,y)=>{
  await p.evaluate(({x,y})=>{const state=ShiyuDesktopPet.read();localStorage.setItem('shiyu-desktop-pet-v1',JSON.stringify({...state,position:{x,y,width:innerWidth,height:innerHeight},updated:Date.now()}));},{x,y});
  await p.reload({waitUntil:'networkidle'});await core(p).click();await p.locator('#desktop-pet[data-open="true"]').waitFor();
  return p.locator('#desktop-pet').evaluate(root=>{const pet=root.querySelector('.pet-character').getBoundingClientRect(),cx=pet.x+pet.width/2,cy=pet.y+pet.height/2;return {compact:root.dataset.compact==='true',direction:root.dataset.direction,viewport:{width:innerWidth,height:innerHeight},items:[...root.querySelectorAll('.pet-shortcut')].map(node=>{const r=node.getBoundingClientRect();return {group:node.classList.contains('pet-nav')?'nav':'app',angle:Math.atan2(r.y+r.height/2-cy,r.x+r.width/2-cx),x:r.x,y:r.y,right:r.right,bottom:r.bottom};})};});
 };
 const centers={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0,'upper-left':-3*Math.PI/4,'upper-right':-Math.PI/4,'lower-left':3*Math.PI/4,'lower-right':Math.PI/4};
 const arc=(layout,group)=>{const center=centers[layout.direction],offsets=layout.items.filter(item=>item.group===group).map(item=>Math.atan2(Math.sin(item.angle-center),Math.cos(item.angle-center))).sort((a,b)=>a-b);return {count:offsets.length,span:offsets.at(-1)-offsets[0],center:(offsets.at(-1)+offsets[0])/2};};
 setModules(true);const small=await inspect(1370,480),smallArc=arc(small,'app');
 assert.equal(small.direction,'left');assert.equal(small.compact,false);assert.equal(smallArc.count,3);assert(smallArc.span<1.4,'few entries stay clustered around the arc center');assert(Math.abs(smallArc.center)<.02,`few entries remain centered: ${JSON.stringify({smallArc,items:small.items})}`);
 setModules(false);const full=await inspect(1370,480),fullArc=arc(full,'app');
 assert.equal(full.compact,false);assert(fullArc.span>smallArc.span+.7,'the occupied arc expands as entries are added');assert(fullArc.span<Math.PI*.85,'the expanded arc stays within its available limit');
 setModules(true);
 for(const [x,y,expected]of [[720,480,'up'],[1380,60,'lower-left']]){const layout=await inspect(x,y),apps=arc(layout,'app');assert.equal(layout.direction,expected);assert.equal(layout.compact,false);assert(apps.span<1.4);assert(Math.abs(apps.center)<.02);for(const item of layout.items)assert(item.x>=0&&item.y>=0&&item.right<=layout.viewport.width&&item.bottom<=layout.viewport.height);}
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS adaptive centered arcs for few, growing and corner entry counts');
}
async function layersAndInput(browser){
 const f=await fixture(browser),p=f.page;
 const pageArt=await p.locator('#desktop-pet .pet-art').boundingBox();
 await click(p,'navigate','space');await p.waitForFunction(()=>view==='space');
 await p.locator('.space-mode-entry').click();await p.locator('#space-atlas[open]').waitFor();await p.locator('#space-atlas #desktop-pet').waitFor();
 const atlasArt=await p.locator('#space-atlas #desktop-pet .pet-art').boundingBox();
 assert.deepEqual({width:atlasArt.width,height:atlasArt.height},{width:pageArt.width,height:pageArt.height},'graph view keeps the global pet artwork size');
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
 assert.deepEqual(await p.locator('.pet-panel [data-pet-action=app]').evaluateAll(nodes=>nodes.map(node=>node.dataset.petId)),['common','memo','todo','icons','palette','cutout','toolbox'],'overflow preserves all current applications; the retired emoji app stays excluded');
 await p.locator('.pet-panel').hover();await p.mouse.wheel(0,-160);await p.waitForTimeout(220);await p.mouse.wheel(0,-160);await p.waitForTimeout(220);
 assert.equal(await p.evaluate(()=>document.body.classList.contains('world-active')),false,'scrolling pet entries does not activate page navigation gestures');
 await p.setViewportSize({width:1440,height:960});
 // The browser can acknowledge a resize before the pet's resize handler closes its menu.
 await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.open==='false');await click(p,'settings');
 await p.locator('[data-pet-pref=skin][data-value=sprout]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().skin==='sprout');
 await p.locator('[data-pet-pref=enabled][data-value=false]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().enabled===false);
 await p.locator('#settings').evaluate(d=>d.close());assert(await p.locator('#desktop-pet').isHidden());
 await p.evaluate(()=>{scope='global';settingsTab='desktop-pet';renderSettings();show('#settings')});
 await p.locator('[data-pet-pref=enabled][data-value=true]').click();await p.locator('#settings').evaluate(d=>d.close());await core(p).waitFor();
 await p.mouse.move(300,300);await core(p).waitFor({state:'visible'});await core(p).hover();await p.locator('#desktop-pet[data-open=true]').waitFor();await core(p).click();await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.open==='false','clicking the pet on the current item collapses the fan');await p.mouse.move(300,300);await core(p).hover();await p.locator('#desktop-pet[data-open=true]').waitFor();
 const wheelPath=await p.locator('#desktop-pet').evaluate(root=>{const pet=root.querySelector('.pet-character').getBoundingClientRect(),app=root.querySelector('.pet-menu [data-pet-id="common"]').getBoundingClientRect(),items=[...root.querySelectorAll('.pet-menu .pet-shortcut')],selected=Number(items.find(n=>n.dataset.selected==='true')?.dataset.wheelOrder),target=Number(items.find(n=>n.dataset.petId==='common')?.dataset.wheelOrder),ordered=[...items].sort((a,b)=>Number(a.dataset.wheelOrder)-Number(b.dataset.wheelOrder)),centers=ordered.map(n=>{const r=n.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};}),maxStep=Math.max(...centers.map((c,i)=>{const n=centers[(i+1)%centers.length];return Math.hypot(n.x-c.x,n.y-c.y);})),logo=root.querySelector('.pet-shortcut-icon>img.corner-config-icon'),logoRect=logo?.getBoundingClientRect(),iconRect=logo?.parentElement.getBoundingClientRect();return{x:(pet.x+pet.width/2+app.x+app.width/2)/2,y:(pet.y+pet.height/2+app.y+app.height/2)/2,selected,target,next:ordered[(selected+1)%ordered.length]?.dataset.petId,count:items.length,maxStep,logo:logoRect&&{width:logoRect.width,height:logoRect.height},icon:iconRect&&{width:iconRect.width,height:iconRect.height}};});assert(wheelPath.maxStep<240,`wheel path should connect adjacent inner/outer tracks smoothly: ${wheelPath.maxStep}`);if(wheelPath.logo){assert(Math.abs(wheelPath.logo.width-23)<1&&Math.abs(wheelPath.logo.height-23)<1,JSON.stringify(wheelPath));assert.equal(wheelPath.icon.width,43);assert.equal(wheelPath.icon.height,43);}
 await p.evaluate(()=>{window.__petSoundCount=0;const proto=window.AudioContext?.prototype;if(!proto)return;const create=proto.createOscillator;proto.createOscillator=function(){const oscillator=create.call(this),start=oscillator.start;oscillator.start=function(...args){window.__petSoundCount++;return start.apply(this,args)};return oscillator;};});
 await core(p).click();await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.open==='false');await p.mouse.wheel(0,120);assert.equal(await p.evaluate(()=>window.__petSoundCount),0,'wheel input after collapsing the fan does not play a sound');await p.mouse.move(300,300);await core(p).hover();await p.locator('#desktop-pet[data-open=true]').waitFor();
 await p.mouse.move(wheelPath.x,wheelPath.y);await p.mouse.wheel(0,120);let afterWheel=await p.locator('#desktop-pet .pet-menu .pet-shortcut[data-selected=true]').getAttribute('data-pet-id');assert.equal(afterWheel,wheelPath.next,'a downward wheel event advances clockwise by exactly one shortcut');assert.equal(await p.evaluate(()=>window.__petSoundCount),1,'a successful wheel selection plays one shared UI click');
 await p.mouse.wheel(0,-48);let returned=await p.locator('#desktop-pet .pet-menu .pet-shortcut[data-selected=true]').getAttribute('data-pet-id');assert.equal(returned,'home','backward wheel restores the previous selection');assert.equal(await p.evaluate(()=>window.__petSoundCount),2,'each reverse selection plays one click');
 const forwardSteps=(wheelPath.target-wheelPath.selected+wheelPath.count)%wheelPath.count;for(let i=0;i<forwardSteps;i++)await p.mouse.wheel(0,120);assert.equal(await p.locator('#desktop-pet .pet-menu .pet-shortcut[data-selected=true]').getAttribute('data-pet-id'),'common','individual wheel events traverse every shortcut to reach an application');assert.equal(await p.evaluate(()=>window.__petSoundCount),2+forwardSteps,'each stepped shortcut produces exactly one sound');await p.screenshot({path:path.join(out,'pet-wheel-selected.png')});
 const soundsBeforeLeave=await p.evaluate(()=>window.__petSoundCount);await p.mouse.move(300,300);await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.open==='false');await p.mouse.wheel(0,120);assert.equal(await p.evaluate(()=>window.__petSoundCount),soundsBeforeLeave,'wheel input after leaving the pet does not play a sound');await core(p).hover();await p.locator('#desktop-pet[data-open=true]').waitFor();await p.mouse.move(wheelPath.x,wheelPath.y);for(let i=0;i<forwardSteps;i++)await p.mouse.wheel(0,120);assert.equal(await p.locator('#desktop-pet .pet-menu .pet-shortcut[data-selected=true]').getAttribute('data-pet-id'),'common');
 await core(p).click();await p.locator('#my-corner[open]').waitFor();assert.equal(await p.locator('#my-corner').getAttribute('data-corner-module'),'common','clicking the pet activates the wheel-selected application without aiming at its shortcut');await p.locator('#my-corner').evaluate(d=>d.close());
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
async function speechHints(browser){
 const f=await fixture(browser),p=f.page,bubble=p.locator('#desktop-pet .pet-speech'),core=p.locator('#desktop-pet .pet-character');
 await p.mouse.move(240,220);await p.waitForTimeout(900);assert.equal(await bubble.isHidden(),true,'tips only appear after hovering over the pet');
 await core.hover();await p.waitForTimeout(350);assert.equal(await bubble.isHidden(),true,'the pet must be hovered for a short dwell before a tip appears');
 await p.waitForFunction(()=>{const n=document.querySelector('#desktop-pet .pet-speech');return n&&!n.hidden;});assert.equal(await bubble.getAttribute('data-hint'),'hover');assert(['好开心啊！','慢慢来，今天也会很棒！','准备好迎接一点小惊喜了吗？','和你一起，心情都变好了！'].includes(await bubble.locator('.pet-speech-text').textContent()),'hover gets an upbeat, varied line');const bounds=await bubble.boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=1440&&bounds.y+bounds.height<=960,'dialogue remains inside the viewport');const pointer=await p.evaluate(()=>{const bubble=document.querySelector('#desktop-pet .pet-speech'),pet=document.querySelector('#desktop-pet .pet-character'),b=bubble.getBoundingClientRect(),p=pet.getBoundingClientRect(),edge=bubble.dataset.tailEdge,tailX=parseFloat(bubble.style.getPropertyValue('--pet-speech-tail-x')),angle=parseFloat(bubble.style.getPropertyValue('--pet-speech-tail-angle'))*Math.PI/180,baseY=edge==='top'?b.top:b.bottom,tipX=b.left+tailX+Math.sin(angle)*4,tipY=baseY+(edge==='top'?-1:1)*Math.cos(angle)*4,targetX=p.left+p.width/2,targetY=p.top+Math.max(8,Math.min(16,p.height*.12));return Math.hypot(tipX-targetX,tipY-targetY)});assert(pointer<16,`speech tail should point close to the character's head, offset ${pointer.toFixed(1)}px`);assert.equal(await bubble.locator('.pet-speech-dismiss').count(),0,'dialogue has no close control');await p.screenshot({path:path.join(out,'pet-speech-hint.png')});
 await p.waitForTimeout(3000);assert.equal(await bubble.locator('.pet-speech-text').textContent(),'好开心啊！','dialogue remains stable before the five-second cadence');
 await p.waitForFunction(()=>document.querySelector('#desktop-pet .pet-speech-text').textContent==='试试滚动切换入口');
 await p.mouse.wheel(0,120);await p.waitForFunction(()=>document.querySelector('#desktop-pet .pet-speech').dataset.hint==='wheel');assert.equal(await bubble.locator('.pet-speech-text').textContent(),'滚轮切换真有趣！','wheel selection gets its own dialogue');
 const box=await core.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+8,box.y+box.height/2+5,{steps:2});await p.waitForFunction(()=>document.querySelector('#desktop-pet').dataset.dragging==='true');assert.equal(await bubble.isHidden(),true,'dragging the pet suppresses the dialogue');await p.mouse.up();
 await p.mouse.move(300,300);await p.waitForTimeout(350);await core.hover();await p.waitForFunction(()=>{const n=document.querySelector('#desktop-pet .pet-speech');return n&&!n.hidden;});assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS action-matched pet dialogue, five-second cadence, viewport placement, wheel response and drag suppression');
}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true,args:['--disable-lcd-text']});try{await compareSurfaces(b);await adaptiveArcs(b);await layersAndInput(b);await subApps(b);await entryPolicies(b);await speechHints(b);}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
