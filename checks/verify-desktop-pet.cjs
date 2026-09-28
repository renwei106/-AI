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
async function fixture(browser,authenticated=true,useBaseline=false){
 const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce',serviceWorkers:'block'});
 const f={context,authenticated,unavailable:false,operations:structuredClone(operations),errors:[]};
 if(useBaseline){
  const {execFileSync}=require('node:child_process');
  for(const file of ['index.html','account-access.js','corner.js','world.js']){
   const body=execFileSync('git',['show','4dc9aee:dist/'+file],{cwd:path.resolve(__dirname,'..'),encoding:'utf8'});
   await context.route(file==='index.html'?base:'**/'+file+'*',route=>route.fulfill({contentType:file.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8',body}));
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
 await core(p).waitFor();assert.equal(await p.locator('#desktop-pet').count(),1);
 await p.screenshot({path:path.join(out,'home-cat.png')});
 await openPet(p);await p.screenshot({path:path.join(out,'menu-corner.png')});
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
 await select(p,'settings');await p.locator('#settings[open] [data-pet-pref="skin"]').first().waitFor();
 await p.locator('[data-pet-pref="skin"][data-value="bird"]').click();
 await p.waitForFunction(()=>ShiyuDesktopPet.read().skin==='bird');
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
function innerWidthFallback(){return 1440;}
if(require.main===module)(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});try{if(process.argv.includes('--baseline'))await baseline(browser);else await verify(browser);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
