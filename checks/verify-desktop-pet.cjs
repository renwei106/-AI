/* All API requests use local fixtures; this check never writes live account data. */
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const out=path.resolve(__dirname,'../.local/desktop-pet');
const base=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4341/';
const catalog=require('../../聚合管理后台/membership/plan-store.cjs').getCatalog();
const plan=require('../../聚合管理后台/membership/plan-store.cjs').normalizePlan({id:'monthly',name:'月度会员',enabled:true,price:10,days:30});
const user={id:'pet-local-check',name:'宠物体验',email:'pet@example.test',profileCompleted:true,member:true,permanent:true,membership:{member:true,permanent:true,planId:plan.id,entitlements:plan.entitlements}};
const spaces=[{id:'work',name:'工作空间',icon:'folder',scenes:[{id:'daily',name:'日常',groups:[{id:'tools',name:'常用',items:[['示例网址','https://example.test/','仅本地测试','网']]}]}]},{id:'life',name:'生活空间',icon:'leaf',scenes:[{id:'life-daily',name:'日常',groups:[{id:'life-tools',name:'日常收藏',items:[]}]}]}];
const modules=['common','memo','todo','icons','palette','emoji','cutout','toolbox'].map((id,i)=>({id,entryName:['我的收藏','我的小记','我的待办','轻图标','轻色卡','轻表情','轻抠图','百宝箱'][i],enabled:true}));
const operations={world:{enabled:true,audience:'all'},announcement:{enabled:false},update:{enabled:false},corner:{modules}};
async function fixture(browser,authenticated=true,useBaseline=false,reduceMotion=true){
 const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:reduceMotion?'reduce':'no-preference',serviceWorkers:'block'});
 const f={context,authenticated,unavailable:false,operations:structuredClone(operations),errors:[]};
 if(useBaseline){
  const {execFileSync}=require('node:child_process');
  const revision=typeof useBaseline==='string'?useBaseline:'4dc9aee';
  for(const file of ['index.html','account-access.js','corner.js','corner.css','world.js','liquid-orbit-menu.html']){
   const body=execFileSync('git',['show',revision+':dist/'+file],{cwd:path.resolve(__dirname,'..'),encoding:'utf8'});
   await context.route(file==='index.html'?base:'**/'+file+'*',route=>route.fulfill({contentType:file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8',body}));
  }
 }
 await context.addInitScript(({user,spaces,authenticated})=>{if(window!==window.top||!/^https?:$/.test(location.protocol))return;if(!localStorage.getItem('yiyu-prototype-v1'))localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:authenticated,data:spaces,prefs:{theme:'base',mode:'light',accountProfile:authenticated?user:null,accountDataUserId:authenticated?user.id:null,brandGuideDismissed:true,inspirationMockV1:true,firstSpaceCapacityV1:true,twelveSpacePreviewAdded:true,cornerCloseGuideAcknowledgedV1:{[user.id]:true}}}));},{user,spaces,authenticated});
 await context.route('**/api/**',async route=>{
  const p=new URL(route.request().url()).pathname;
  let json={};let status=200;
  if(p==='/api/shiyu/auth/session'){status=f.unavailable?503:200;json=f.authenticated?{authenticated:true,user}:{authenticated:false};}
  else if(p==='/api/shiyu/auth/account')json={userId:user.id,data:spaces};
  else if(p==='/api/shiyu/operations')json=f.operations;
  else if(p.startsWith('/api/shiyu/theme-access'))json={member:f.authenticated,fallback:'base',previews:{},items:catalog.resources.themes.map(t=>({...t,enabled:true,allowed:true,memberOnly:false}))};
  else if(p==='/api/shiyu/plans/catalog')json=catalog;
  else if(p==='/api/shiyu/plans')json={items:[require('../../聚合管理后台/membership/plan-store.cjs').normalizePlan({id:'free',name:'免费版',enabled:true,price:0,days:0}),plan]};
  else if(p.includes('membership')||p.includes('member-plans'))json=catalog;
  else if(p==='/api/auth/session')json={user:f.authenticated?user:null};
  await route.fulfill({status,json});
 });
 context.on('page',p=>p.on('pageerror',e=>f.errors.push(e.stack||e.message)));
 const page=await context.newPage();f.page=page;page.setDefaultTimeout(10000);
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.documentElement.classList.contains('shiyu-account-ready'));
 return f;
}
async function baseline(browser){
 const f=await fixture(browser,true,true);
 await f.page.evaluate(()=>document.fonts.ready);
 await f.page.waitForTimeout(300);
 await f.page.screenshot({path:path.join(out,'before-home.png')});
 await f.page.evaluate(()=>{view='space';render()});
 await f.page.waitForTimeout(300);
 await f.page.screenshot({path:path.join(out,'before-space.png')});
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS baseline captured');
}
module.exports={fixture,baseline,out,base};
const core=p=>p.locator('#desktop-pet .pet-character');
async function openPet(p){await core(p).click();await p.locator('#desktop-pet[data-open="true"]').waitFor();}
async function select(p,action,id){await openPet(p);await p.locator(`#desktop-pet .pet-menu [data-pet-action="${action}"]${id?`[data-pet-id="${id}"]`:''}`).click();}
async function movePet(p,x,y){await core(p).waitFor({state:'visible'});const rect=await core(p).boundingBox();await p.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await p.mouse.down();await p.waitForTimeout(300);await p.mouse.move(x,y,{steps:8});assert.equal(await p.locator('#desktop-pet').getAttribute('data-open'),'false','toolbar is collapsed while dragging');await p.mouse.up();await p.waitForTimeout(430);}
async function geometry(p){return p.locator('#desktop-pet').boundingBox();}
async function verify(browser){
 const f=await fixture(browser),p=f.page;
 await p.evaluate(()=>{window.__petNode=document.querySelector('#desktop-pet');});
 await core(p).waitFor();assert.equal(await p.locator('#desktop-pet').count(),1);assert.equal(await p.locator('#desktop-pet').getAttribute('aria-label'),'桌面伙伴');assert.equal(await p.locator('#desktop-pet').getAttribute('data-skin'),'paper','a new account starts with the paper-girl companion');
 await p.screenshot({path:path.join(out,'home-paper.png')});
 await openPet(p);assert.equal(await p.locator('#desktop-pet .pet-menu [data-pet-action="navigate"][data-pet-id="space"] .pet-shortcut-label').textContent(),'我的空间','space shortcut uses the clarified label');await p.screenshot({path:path.join(out,'menu-corner.png')});
 assert.equal(await p.locator('#desktop-pet').getAttribute('data-compact'),'false','corner supports a radial menu');
 await p.mouse.click(500,700);
 const mainBefore=await p.locator('#main').boundingBox();await movePet(p,720,670);
 assert.deepEqual(await p.locator('#main').boundingBox(),mainBefore,'drag only moves the pet');
 const pos=await geometry(p);const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('shiyu-desktop-pet-v1')).position);
 assert.equal(saved.x,720);assert.equal(saved.y,670);
 await openPet(p);assert.equal(await p.locator('#desktop-pet').getAttribute('data-direction'),'up');
 await p.screenshot({path:path.join(out,'menu-center.png')});
 await p.mouse.click(450,760);
 await p.evaluate(()=>{prefs.theme='music';prefs.mode='dark';render()});
 await p.waitForFunction(()=>document.body.dataset.theme==='music');
 assert.deepEqual(await geometry(p),pos,'theme changes preserve position');
 await p.screenshot({path:path.join(out,'music-dark.png')});
 await select(p,'navigate','space');await p.waitForFunction(()=>view==='space');
 assert.deepEqual(await geometry(p),pos);assert(await p.evaluate(()=>window.__petNode===document.querySelector('#desktop-pet')));
 await select(p,'navigate','space');await p.locator('#desktop-pet .pet-panel [data-pet-id="life"]').click();await p.waitForFunction(()=>spaceId==='life');
 await select(p,'navigate','world');await p.locator('#world-page').waitFor({state:'visible'});
 await core(p).click();await p.locator('#desktop-pet[data-open="true"]').waitFor();
 assert(await core(p).isEnabled());await p.screenshot({path:path.join(out,'world-menu.png')});
 await p.locator('#desktop-pet .pet-menu [data-pet-action="app"][data-pet-id="common"]').click();
 await p.locator('#my-corner[open]').waitFor();await p.locator('#my-corner #desktop-pet').waitFor();
 assert.deepEqual(await geometry(p),pos,'full-page tool retains pet position');
 await select(p,'app','todo');await p.waitForFunction(()=>document.querySelector('#my-corner').dataset.cornerModule==='todo');
 await p.screenshot({path:path.join(out,'todo-pet.png')});
 await select(p,'navigate','home');await p.waitForFunction(()=>view==='home'&&!document.querySelector('#my-corner[open]'));
 await select(p,'settings');await p.locator('#settings[open] [data-pet-pref="skin"]').first().waitFor();assert.equal(await p.locator('#settings [data-settings-tab="desktop-pet"]').textContent(),'桌面伙伴');assert.equal(await p.locator('#settings .pet-preferences h3').first().textContent(),'桌面伙伴');assert.equal(await p.locator('#settings [data-pet-pref="skin"][data-value="line"] b').textContent(),'小线');assert.equal(await p.locator('#settings [data-pet-pref="skin"][data-value="paper"] b').textContent(),'小满');
 assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'false');await p.locator('[data-pet-pref="roaming"][data-value="roam"]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().roaming==='roam');assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'true','roaming is enabled on the theme page');await p.locator('[data-pet-pref="roaming"][data-value="fixed"]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().roaming==='fixed');assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'false');
 await p.locator('[data-pet-pref="skin"][data-value="bird"]').click();
 await p.waitForFunction(()=>ShiyuDesktopPet.read().skin==='bird');
 const owner=await p.evaluate(()=>prefs.accountProfile.id);await p.evaluate(()=>{prefs.accountProfile={...prefs.accountProfile,id:'pet-new-account'};dispatchEvent(new Event('shiyu-account-state'));});await p.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.skin==='paper');await p.evaluate(owner=>{prefs.accountProfile={...prefs.accountProfile,id:owner};dispatchEvent(new Event('shiyu-account-state'));},owner);await p.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.skin==='bird');
 await p.screenshot({path:path.join(out,'settings-bird.png')});
 await p.locator('#settings .dialog-heading [data-action="close"]').click();await core(p).waitFor();
 assert.deepEqual(await geometry(p),pos,'skin changes preserve the anchor');
 await p.reload({waitUntil:'networkidle'});await core(p).waitFor();assert.deepEqual(await geometry(p),pos,'refresh restores position');assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().skin),'bird');
 const cases=[[70,480,'right'],[1370,480,'left'],[720,70,'down'],[720,890,'up'],[60,60,null],[1380,60,null],[60,900,null],[1380,900,null]];
 for(const [x,y,d]of cases){await movePet(p,x,y);await openPet(p);if(d)assert.equal(await p.locator('#desktop-pet').getAttribute('data-direction'),d);const boxes=await p.locator('#desktop-pet .pet-menu button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));for(const r of boxes)assert(r.x>=0&&r.y>=0&&r.right<=innerWidthFallback()&&r.bottom<=960,JSON.stringify({x,y,d,r}));await p.mouse.click(720,480);}
 await p.setViewportSize({width:390,height:844});await core(p).waitFor();await openPet(p);await p.screenshot({path:path.join(out,'mobile-menu.png')});
 const mobile=await geometry(p);assert(mobile.x>=0&&mobile.x+mobile.width<=390);
 await p.setViewportSize({width:1440,height:960});
 f.authenticated=false;
 await select(p,'app','common');await p.locator('#login[open]').waitFor();
 assert.equal(await p.locator('#my-corner[open]').count(),0,'expired cached session cannot enter private app');
 await p.locator('#login').evaluate(d=>d.close());
 assert.deepEqual(f.errors,[]);await f.context.close();
 const guest=await fixture(browser,false);
 for(const [action,id]of [['navigate','space'],['navigate','world'],['app','common'],['settings',null]]){await select(guest.page,action,id);await guest.page.locator('#login[open]').waitFor();assert.equal(await guest.page.evaluate(()=>view),'home');assert.equal(await guest.page.locator('#my-corner[open]').count(),0);await guest.page.locator('#login').evaluate(d=>d.close());}
 await movePet(guest.page,600,600);assert.equal((await guest.page.evaluate(()=>ShiyuDesktopPet.read())).position.x,600,'guests can move pet');assert.deepEqual(guest.errors,[]);await guest.context.close();
 const offline=await fixture(browser);offline.unavailable=true;await select(offline.page,'app','common');await offline.page.waitForTimeout(200);assert.equal(await offline.page.locator('#my-corner[open]').count(),0,'unavailable session check fails closed');assert.equal(await offline.page.locator('#login[open]').count(),0,'network failure does not discard active identity');await offline.context.close();
 console.log('PASS pet drag, persistence, themes, navigation, account gates, settings, boundaries, mobile');
}
async function roaming(browser){
 const f=await fixture(browser,true,false,false),p=f.page;
 await p.clock.install();
 await p.evaluate(()=>{for(const [x,y]of [[170,210],[830,300],[1080,650]]){const el=document.createElement('div');el.dataset.petPerch='';el.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:110px;height:54px;pointer-events:none;background:#26352b;border-radius:14px`;document.body.append(el);}});
 await select(p,'settings');await p.locator('[data-pet-pref="roaming"][data-value="roam"]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().roaming==='roam');await p.locator('#settings .dialog-heading [data-action="close"]').click();
 assert.equal(await p.locator('#desktop-pet').getAttribute('data-roaming'),'true');
 await p.clock.runFor(59900);assert.equal(await p.locator('#desktop-pet').getAttribute('data-roam-phase'),'idle','roaming waits one minute before moving');
 await p.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.roamPhase==='run',null,{timeout:18000});
 await p.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.roamPhase==='jump',null,{timeout:2500});
 await p.waitForFunction(()=>{const data=document.querySelector('#desktop-pet')?.dataset;return data?.roamPhase==='land'||['landing','bounce'].includes(data?.roamCollision)},null,{timeout:8000});
 assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().position),null,'autonomous movement must not overwrite the saved position');
 const mode=p.locator('#desktop-pet .pet-mode-entry');assert.equal(await mode.count(),1,'roaming shortcut appears alongside settings');
 await p.locator('#desktop-pet .pet-character').hover();await p.locator('#desktop-pet[data-open="true"]').waitFor();assert(await p.locator('#desktop-pet .pet-menu .pet-shortcut').count()>0,'hover menu remains available while roaming');await p.locator('#desktop-pet .pet-mode-entry').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().roaming==='fixed');assert.equal(await p.locator('#desktop-pet').getAttribute('data-open'),'true','mode shortcut does not close the menu');await p.locator('#desktop-pet .pet-mode-entry').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().roaming==='roam');await p.locator('#desktop-pet .pet-character').hover();await p.locator('#desktop-pet[data-open="true"]').waitFor();await p.clock.runFor(90000);assert.equal(await p.locator('#desktop-pet').getAttribute('data-roam-phase'),'idle','hover pauses roaming movement');await p.mouse.move(30,30);await p.clock.runFor(100);await p.clock.runFor(59900);assert.equal(await p.locator('#desktop-pet').getAttribute('data-roam-phase'),'idle','leaving hover restarts the one-minute wait');await p.clock.runFor(300);
 const core=p.locator('#desktop-pet .pet-character'),box=await core.boundingBox();await p.evaluate(()=>{const root=document.querySelector('#desktop-pet');root.dataset.open='false';root.dataset.roaming='false';});await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+84,box.y+box.height/2+38,{steps:8});await p.mouse.up();
 await p.waitForFunction(()=>ShiyuDesktopPet.read().position?.x>100);
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS theme-only roaming delay, hover menu, mode switch, and user drag priority');
}
async function sameSurface(browser){
 const f=await fixture(browser,true,false,false),p=f.page;
 await p.clock.install();
 await p.evaluate(()=>{const box=document.querySelector('#desktop-pet').getBoundingClientRect(),el=document.createElement('div');el.dataset.petPerch='';el.style.cssText=`position:fixed;left:${box.left-150}px;top:${box.top+24}px;width:360px;height:70px;pointer-events:none;background:#26352b;border-radius:14px`;document.body.append(el);});
 await select(p,'settings');await p.locator('[data-pet-pref="roaming"][data-value="roam"]').click();await p.waitForFunction(()=>ShiyuDesktopPet.read().roaming==='roam');await p.locator('#settings .dialog-heading [data-action="close"]').click();
 await p.clock.runFor(59900);
 await p.waitForFunction(()=>['walk','run'].includes(document.querySelector('#desktop-pet')?.dataset.roamPhase),null,{timeout:18000});
 assert(['walk','run'].includes(await p.locator('#desktop-pet').getAttribute('data-roam-route')),`same surface uses a grounded walk/run route, got ${await p.locator('#desktop-pet').getAttribute('data-roam-route')}`);
 await p.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.roamPhase==='idle',null,{timeout:7000});
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS same-surface roaming stays grounded and walks or runs without jumping');
}
async function girlEngine(browser){
 const f=await fixture(browser,true,false,false),p=f.page;
 f.operations.petActions={'sit-wave':false,'lie-wave':false,'stand-wave':false};
 await p.evaluate(()=>ShiyuFeatureConfig.refresh());
 await p.clock.install();
 await p.reload({waitUntil:'networkidle'});
 await p.evaluate(()=>{window.__girlStates=[];new MutationObserver(()=>{const data=document.querySelector('#desktop-pet')?.dataset;if(data?.petActionId)window.__girlStates.push([data.petState,data.petActionId,Number(data.girlFrame),performance.now()])}).observe(document.querySelector('#desktop-pet'),{attributes:true,attributeFilter:['data-pet-state','data-pet-action-id','data-girl-frame']});});
 await p.clock.runFor(16000);
 const samples=await p.evaluate(()=>window.__girlStates);
 assert(samples.some(([state])=>state==='sit'||state==='lie'),'fixed idle must sit or lie');
 assert.equal(new Set(samples.map(([state])=>state)).size,1,'state remains stable while its gestures continue');
 assert(new Set(samples.map(([,id])=>id)).size>=2,'idle keeps playing different enabled gesture groups');
 const groups=[];for(const sample of samples){if(groups.at(-1)?.id!==sample[1])groups.push({id:sample[1],samples:[]});groups.at(-1).samples.push(sample);}
 assert(groups.length>=3,'multiple complete groups play within the same state');
 for(let i=1;i<groups.length-1;i++){const last=groups[i].samples.at(-1),next=groups[i+1].samples[0];assert.equal(last[2],last[0]==='sit'?0:20,'gesture completes at its neutral pose');assert(next[3]-last[3]>=1000,'next group starts after a resting gap');}
 assert(samples.every(([,id])=>!['sit-wave','lie-wave','stand-wave'].includes(id)),'disabled actions never play');
 f.operations.petActions['stand-rest']=false;await p.evaluate(()=>ShiyuFeatureConfig.refresh());
 const girl=p.locator('#desktop-pet .pet-character');
 await girl.hover();await p.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.petState==='stand');
 await p.evaluate(()=>{window.__danceFrames=[];new MutationObserver(()=>{const d=document.querySelector('#desktop-pet').dataset;window.__danceFrames.push([Number(d.girlFrame),performance.now()]);}).observe(document.querySelector('#desktop-pet'),{attributes:true,attributeFilter:['data-girl-frame']});});
 await p.clock.runFor(9000);
 const dance=await p.evaluate(()=>window.__danceFrames),peak=dance.findIndex(([frame])=>frame===12);
 assert(peak>=0,'standing dance reaches its turning pose');
 assert.deepEqual(dance.slice(peak,peak+4).map(([frame])=>frame),[12,11,10,9],'dance completes its return instead of freezing halfway');
 assert(dance[peak+4][1]-dance[peak+3][1]>=1200,'repeated dance waits at the neutral pose between groups');
 const art=p.locator('#desktop-pet .pet-girl-cutout');await art.waitFor();
 assert(await art.evaluate(img=>img.complete&&img.naturalWidth===512),'isolated full-body frames load');
 const box=await girl.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+60,box.y+box.height/2+15,{steps:4});
 await p.waitForFunction(()=>['jog','sprint'].includes(document.querySelector('#desktop-pet')?.dataset.petState));
 assert(Number(await p.locator('#desktop-pet').getAttribute('data-drag-speed'))>0,'drag speed is measured');
 await p.evaluate(()=>{const root=document.querySelector('#desktop-pet');root.dataset.dragSpeed='700';root.dataset.runUntil=String(performance.now()+2000)});
 await p.waitForFunction(()=>document.querySelector('#desktop-pet')?.dataset.petState==='sprint');
 await p.mouse.up();await p.mouse.move(20,20);await p.clock.runFor(1000);
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS girl states, disabled actions, isolated frames, hover and speed-aware drag');
}
async function temperament(browser){
 const f=await fixture(browser,true,false,false),p=f.page;
 await p.clock.install();
 await p.reload({waitUntil:'networkidle'});
 await select(p,'settings');
 const choices=p.locator('#settings [data-pet-pref="motion"]');
 await choices.first().waitFor();
 assert.deepEqual(await choices.allTextContents(),['安静','活泼','兴奋']);
 assert.equal(await p.locator('#settings .pet-setting-row:has([data-pet-pref="motion"]) h3').textContent(),'性格');
 await choices.filter({hasText:'安静'}).click();
 await p.waitForFunction(()=>ShiyuDesktopPet.read().motion==='quiet');
 assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().motion),'quiet');
 await p.locator('#settings .dialog-heading [data-action="close"]').click();
 await p.mouse.move(20,20);await p.clock.runFor(6000);
 const first=await p.locator('#desktop-pet').getAttribute('data-pet-state');
 await p.evaluate(()=>{window.__temperamentStates=[];new MutationObserver(()=>window.__temperamentStates.push(document.querySelector('#desktop-pet').dataset.petState)).observe(document.querySelector('#desktop-pet'),{attributes:true,attributeFilter:['data-pet-state']});});
 await p.clock.runFor(12000);
 assert.equal(await p.locator('#desktop-pet').getAttribute('data-pet-state'),first,'quiet personality keeps its state while playing gestures');
 await p.clock.runFor(30000);
 assert((await p.evaluate(()=>window.__temperamentStates)).some(state=>state!==first),'quiet personality eventually changes state');
 await select(p,'settings');await p.locator('#settings [data-pet-pref="motion"][data-value="excited"]').click();
 await p.waitForFunction(()=>ShiyuDesktopPet.read().motion==='excited');
 assert.equal(await p.evaluate(()=>ShiyuDesktopPet.read().motion),'excited');
 await p.locator('#settings .dialog-heading [data-action="close"]').click();await p.mouse.move(20,20);
 await p.clock.runFor(4000);const excited=await p.locator('#desktop-pet').getAttribute('data-pet-state');await p.evaluate(()=>{window.__temperamentStates=[];});
 await p.clock.runFor(26000);
 assert((await p.evaluate(()=>window.__temperamentStates)).some(state=>state!==excited),'excited personality changes state sooner');
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS personality labels and quiet/excited action intervals');
}
function innerWidthFallback(){return 1440;}
if(require.main===module)(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{if(process.argv.includes('--baseline'))await baseline(browser);else if(process.argv.includes('--roaming'))await roaming(browser);else if(process.argv.includes('--same-surface'))await sameSurface(browser);else if(process.argv.includes('--girl-engine'))await girlEngine(browser);else if(process.argv.includes('--temperament'))await temperament(browser);else{await verify(browser);await roaming(browser);await sameSurface(browser);await girlEngine(browser);await temperament(browser);}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
