const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const ts=require('../../聚合管理后台/node_modules/typescript');
const {createService}=require('../i18n/service.cjs');
const {localized}=require('../i18n/frontend-server.cjs');
const root=path.resolve(__dirname,'../dist'),out=path.resolve(__dirname,'i18n-global');
const store=path.join(out,'preview-state.json'),ed=require('../i18n/editorial-en.json');
const base=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../聚合管理后台/.local/shiyu-i18n.json'),'utf8'));
const operations=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../聚合管理后台/.local/shiyu-operations.json'),'utf8'));
operations.world.enabled=true;operations.world.eligible=true;operations.world.modules=Object.fromEntries(['discover','resources','learning','materials','creators','collaboration'].map(k=>[k,true]));operations.world.children={resources:{website:true,creator:true},materials:{studio:true,palette:true,cutout:true,emoji:true}};
operations.spaceViews={regular:{enabled:true,follow:true,cards:true,list:true,poker:true,paper:true,record:true,film:true,planet:true,calendar:true},graph:{enabled:true,twoD:{enabled:true,radial:true,organization:true,mindmap:true},threeD:{enabled:true,micro:true,galaxy:true}}};
operations.access={world:true,corner:true,pet:true};
operations.platformCreators=[{id:'qa-creator',name:'创作者原名',category:'财经',platform:'Bilibili',status:'published',followerCount:123400,followerText:'12.34万粉丝',profileUrl:'https://example.test/creator',avatarUrl:'',coverUrl:''}];
const themes=['base','music','cinema','cosmos','globe','flip','rain','paper','poly','flow'];
const themeCatalog={member:true,fallback:'base',items:themes.map(id=>({id,enabled:true,allowed:true,memberOnly:false})),previews:{}};
const {getCatalog,createPlanStore}=require('../../聚合管理后台/membership/plan-store.cjs');
const memberCatalog=getCatalog();
const workspace=[{id:'qa-space',name:'用户空间原名',scenes:[{id:'qa-scene',name:'用户场景原名',description:'用户自定义说明',groups:[{id:'qa-group',name:'用户分组原名',items:[['用户收藏原名','https://example.test/','用户收藏说明','E']]}]}]}];
const prefs={theme:'base',mode:'light',color:'#48614c',font:'youfeng',explicitFont:true,width:'safe',brandGuideDismissed:true,inspirationMockV1:true,firstSpaceCapacityV1:true,twelveSpacePreviewAdded:true,accountProfile:{id:'qa-locale',name:'用户姓名原名',email:'qa@example.test'},accountDataUserId:'qa-locale',cornerCollections:{'qa-locale':{stageVersion:2,groups:[{id:'inbox',name:'暂存',system:'inbox',refs:[]}]}}};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(store,JSON.stringify(base));
// Test-only stores and HTTP listener. All real account/payment writes are intercepted.
fs.writeFileSync(path.join(out,'shiyu-operations.json'),JSON.stringify(operations));
for(const name of ['shiyu-plans.json','shiyu-themes.json'])fs.copyFileSync(path.resolve(__dirname,'../../聚合管理后台/.local/'+name),path.join(out,name));
const service=createService({root,store,ts});
const errors=[],snapshots=[],requests=[];let browser,server;
const fulfill=(route,value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
async function capture(page,label,selector='body'){
 await page.waitForTimeout(90);
 const result=await page.locator(selector).evaluate(host=>{
  const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
  const chinese=[],overflow=[];
  const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let n;
  while(n=walker.nextNode()){const e=n.parentElement,t=n.textContent.trim();if(e&&!e.closest('script,style,svg,textarea')&&visible(e)&&/[\u3400-\u9fff]/.test(t))chinese.push(t)}
  for(const e of host.querySelectorAll('button,label,h1,h2,h3,.world-nav span')){if(visible(e)&&e.textContent.trim()&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+3)overflow.push({text:e.textContent.trim().slice(0,85),class:e.className,width:e.clientWidth,scroll:e.scrollWidth})}
  return {chinese:[...new Set(chinese)],overflow};
 });
 snapshots.push({label,...result});
 await page.screenshot({path:path.join(out,label+'.png')});
}
(async()=>{
 await service.action('POST','scan');let state=service.read();for(const [id,e]of Object.entries(ed))if(state.entries[id])state.entries[id].translations={...state.entries[id].translations,en:{text:e.text,approved:true}};fs.writeFileSync(store,JSON.stringify(state));await service.action('POST','publish-language',{locale:'en'});
 server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local');if(url.pathname==='/api/shiyu/i18n/public'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(await service.action('GET','public')));return}if(url.pathname==='/api/shiyu/i18n/asset'){const value=service.asset(url.searchParams.get('locale'),url.searchParams.get('file'));res.end(value||'');return}const file=url.pathname==='/'?'index.html':url.pathname.slice(1),target=path.resolve(root,file);if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return}if(await localized(req,res,file,root))return;res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(target))}catch(e){res.writeHead(500);res.end(String(e))}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;process.env.SHIYU_ADMIN_ORIGIN=origin;
 browser=await chromium.launch({channel:'msedge',headless:true});
 for(const locale of (process.env.I18N_EN_ONLY?['en']:['zh-CN','en'])){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',colorScheme:'light'});
  await context.addCookies([{name:'shiyu-language',value:locale,url:origin}]);
  await context.addInitScript(({workspace,prefs})=>{localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data:workspace,prefs,signed:true,styles:{},overrides:{}}))},{workspace,prefs});
  await context.route('**/api/**',route=>{const req=route.request(),url=new URL(req.url());if(url.pathname.startsWith('/api/shiyu/i18n/'))return route.continue();if(!['GET','HEAD'].includes(req.method()))return fulfill(route,{ok:true});if(url.pathname==='/api/shiyu/operations')return fulfill(route,operations);if(url.pathname==='/api/shiyu/theme-access')return fulfill(route,themeCatalog);if(url.pathname==='/api/shiyu/auth/session')return fulfill(route,{authenticated:true,user:{...prefs.accountProfile,member:true,permanent:true,memberExpiresAt:'永久',membership:{member:true,permanent:true,entitlements:memberCatalog.items.map(x=>({...x,enabled:true,value:x.kind==='selection'?x.options?.map(o=>o.id)||[]:999}))}}});if(url.pathname==='/api/shiyu/auth/account')return fulfill(route,{data:workspace});if(url.pathname==='/api/shiyu/plans/catalog')return fulfill(route,memberCatalog);if(url.pathname==='/api/shiyu/plans')return fulfill(route,{items:createPlanStore().readPublishedPlans()});return fulfill(route,{items:[],enabled:false})});
  const page=await context.newPage();page.on('pageerror',e=>errors.push({locale,message:e.message,stack:e.stack}));page.on('request',r=>{if(/(?:memo-paper|todo-calendar)/.test(r.url()))requests.push(r.url())});
  await page.goto(origin,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.ShiyuCorner&&window.__shiyuThemeCatalog?.length===10);
  await page.evaluate(()=>{prefs.brandGuideDismissed=true;document.querySelector('.brand-guide')?.remove();signed=true;render()});
  for(const theme of themes)for(const mode of ['light','dark']){await page.evaluate(({theme,mode})=>{view='home';prefs.theme=theme;prefs.mode=mode;render()},{theme,mode});await capture(page,`${locale}-home-${theme}-${mode}`)}
  await page.evaluate(()=>{prefs.theme='base';prefs.mode='light';view='home';render()});
  for(const tab of ['themes','colors','type','layout','copy','desktop-pet']){await page.evaluate(tab=>{settingsTab=tab;scope='global';renderSettings();show('#settings')},tab);await capture(page,`${locale}-settings-${tab}`,'#settings');await page.evaluate(()=>document.querySelector('#settings').close())}
  for(const module of ['common','memo','todo','toolbox']){
   await page.evaluate(id=>window.ShiyuCorner.openModule(id),module);await page.waitForTimeout(550);await capture(page,`${locale}-${module}`,'#my-corner');
   if(module==='todo'){
    assert.ok(await page.locator('.tc-root').count(),'lazy calendar loaded');
    for(const view of ['board','priority','calendar']){await page.locator('[data-tc-action="layout-menu"]').click();await capture(page,`${locale}-todo-${view}`,'#my-corner')}
    await page.locator('[data-tc-action="new"]').first().click();await capture(page,`${locale}-todo-editor`,'#my-corner');await page.keyboard.press('Escape');
   }
   await page.evaluate(()=>window.ShiyuCorner.closeModule());await page.waitForTimeout(150);
  }
  await page.evaluate(()=>{view='space';spaceId=data[0].id;sceneId=data[0].scenes[0].id;render()});await capture(page,`${locale}-space`);
  if(process.env.I18N_EXTENDED){
   const views=await page.evaluate(()=>Object.keys(LINK_VIEWS));
   for(const style of views){await page.evaluate(style=>{styles[currentGroup().id]=style;render()},style);await capture(page,`${locale}-space-${style}`)}
   await page.evaluate(()=>openLinkSettings());await capture(page,`${locale}-space-style-settings`,'#link-view-settings');await page.evaluate(()=>document.querySelector('#link-view-settings').close());
   await page.locator('.space-mode-entry').first().click();await page.waitForSelector('#space-atlas[open]');
   for(const layout of ['radial','organization','mindmap','spatial','solar','systems']){await page.evaluate(layout=>document.querySelector(`[data-at-view="${layout}"]`)?.click(),layout);await capture(page,`${locale}-atlas-${layout}`,'#space-atlas')}
   await page.evaluate(()=>document.querySelector('#space-atlas').close());
   await page.evaluate(()=>{view='home';render();openMemberCenter()});await page.waitForTimeout(200);await capture(page,`${locale}-membership`,'#member-center');await page.evaluate(()=>document.querySelector('#member-center').close());
   for(const theme of themes){await page.evaluate(theme=>{prefs.theme=theme;view='home';render()},theme);await page.evaluate(()=>window.ShiyuCorner.openModule('common'));await capture(page,`${locale}-favorites-${theme}`,'#my-corner');await page.evaluate(()=>window.ShiyuCorner.closeModule())}
  }
  await page.evaluate(()=>{view='home';render();window.ShiyuWorld.open()});await page.waitForTimeout(250);
  for(const section of ['discover','resources','learning','materials','creators','collaboration']){await page.locator(`[data-w-section="${section}"]`).first().click();await capture(page,`${locale}-world-${section}`,'#world-page')}
  await page.evaluate(()=>window.ShiyuWorld.close());
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{view='home';prefs.theme='base';render()});await capture(page,`${locale}-mobile-home`);
  if(process.env.I18N_EXTENDED)for(const theme of themes){await page.evaluate(theme=>{prefs.theme=theme;render()},theme);await capture(page,`${locale}-mobile-${theme}`)}
  await page.evaluate(()=>window.ShiyuCorner.openModule('todo'));await page.waitForTimeout(200);await capture(page,`${locale}-mobile-todo`,'#my-corner');await page.evaluate(()=>window.ShiyuCorner.closeModule());
  await context.close();
 }
 fs.writeFileSync(path.join(out,'ui-report.json'),JSON.stringify({errors,snapshots,requests},null,2));
 console.log(JSON.stringify({errors,english:snapshots.filter(x=>x.label.startsWith('en')&&(x.chinese.length||x.overflow.length)),snapshots:snapshots.length,imports:[...new Set(requests)]},null,2));
 assert.equal(errors.length,0,'no browser exceptions');
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'ui-report.json'),JSON.stringify({errors,snapshots,requests},null,2));process.exitCode=1}).finally(async()=>{await browser?.close();if(server)await new Promise(r=>server.close(r))});
