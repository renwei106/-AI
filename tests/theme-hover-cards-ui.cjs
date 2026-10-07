const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('.local/theme-hover-cards-qa');fs.mkdirSync(out,{recursive:true});
const order=['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody'];
const results=[];
const user={id:'qa-theme-user',name:'卡片测试',email:'theme@example.test',member:false};
let browser;
async function fixture({baseline=false,mode='dark',viewport={width:1356,height:1014},authenticated=false,configured=false}={}){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),errors=[];
 await context.addInitScript(({mode})=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:false,prefs:{theme:'base',mode,brandGuideDismissed:true,onboardingDone:true,homeEntryGesture:'double',worldEntryGesture:'double'}})),{mode});
 await context.route(/https:\/\/(?:open\.weixin\.qq\.com|res\.wx\.qq\.com|mp\.weixin\.qq\.com)\//,r=>r.fulfill({status:200,contentType:'text/html',body:''}));
 await context.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url());
  const json=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  if(url.pathname==='/api/shiyu/auth/session')return json(authenticated?{authenticated:true,user}:{authenticated:false});
  if(url.pathname==='/api/shiyu/auth/account')return json({userId:user.id,data:[{id:'qa',name:'测试空间',icon:'folder',scenes:[{id:'daily',name:'日常',groups:[{id:'tools',name:'工具',items:[]}]}]}]});
  if(url.pathname==='/api/shiyu/operations')return json({onboarding:{enabled:false},access:{},world:{enabled:true,eligible:true},personalization:configured?{themes:{enabled:true,order:['paper',...order.filter(id=>id!=='paper')],options:Object.fromEntries(order.map(id=>[id,{enabled:id!=='rain',name:id==='paper'?'后台主题名':undefined}]))}}:{}});
  if(url.pathname.startsWith('/api/shiyu/theme-access'))return json({fallback:'base',member:false,items:order.map(id=>({id,enabled:true,allowed:id!=='cinema',memberOnly:id==='cinema'}))});
  if(url.pathname==='/api/shiyu/auth/wechat/qr')return json({scene:'qa-theme-qr',qrUrl:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E'});
  if(url.pathname.startsWith('/api/shiyu/auth/wechat/'))return json({status:'waiting'});
  if(request.method()!=='GET')return json({});
  if(url.pathname==='/api/shiyu/payments/status')return json({enabled:false,providers:{}});
  if(url.pathname==='/api/shiyu/payments/account')return json({member:false});
  if(url.pathname==='/api/shiyu/auth/invitations')return json({enabled:false,items:[]});
  return route.continue();
 });
 if(baseline)await context.route(/\/v4\.(js|css)(?:\?|$)/,route=>{const extension=new URL(route.request().url()).pathname.endsWith('.css')?'css':'js';return route.fulfill({status:200,contentType:extension==='css'?'text/css':'text/javascript',body:fs.readFileSync(path.resolve('baselines/theme-hover-cards-before-20261007/v4.'+extension))})});
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4329/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.classList.contains('shiyu-account-ready')&&window.__shiyuThemeCatalog?.length===13);
 await page.waitForFunction(()=>window.ShiyuFeatureConfig?.onboarding()?.enabled===false);
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 return {context,page,errors,close:()=>context.close()};
}
async function hover(f){await f.page.locator('header .brand').hover();await f.page.locator('header .brand-theme-menu').waitFor({state:'visible'});}
async function structure(f){return f.page.evaluate(()=>({
 names:[...document.querySelectorAll('header [data-brand-theme]')].map(b=>[b.dataset.brandTheme,b.querySelector('b')?.textContent,b.getAttribute('aria-pressed'),!!b.querySelector('.theme-member-badge')]),
 home:[...document.querySelectorAll('header>.brand-discovery>.brand,#main>.home,.home h1,.home .search-area')].map(el=>{const r=el.getBoundingClientRect();return [el.className,r.x,r.y,r.width,r.height]}),
 settings:(()=>{settingsTab='theme';renderSettings();return document.querySelector('#settings .theme-gallery')?.outerHTML})()
 }));}
async function scrollAll(f){const list=f.page.locator('.brand-theme-list');await list.hover();for(let i=0;i<10;i++){await f.page.mouse.wheel(0,260);await f.page.waitForTimeout(185)}await f.page.waitForFunction(()=>[...document.querySelectorAll('.brand-theme-cover img')].every(img=>img.complete&&img.naturalWidth>0));return list;}
(async()=>{try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const before=await fixture({baseline:true}),after=await fixture();
 const original=await structure(before),changed=await structure(after);
 assert.deepEqual(changed.names,original.names,'theme labels, order, selection and member badges');assert.deepEqual(changed.home,original.home,'closed-menu homepage geometry');assert.equal(changed.settings,original.settings,'personalization theme gallery');
 await hover(before);await before.page.screenshot({path:path.join(out,'before-dark.png')});await before.close();
 await hover(after);
 const position=await after.page.locator('.brand').boundingBox();
 await after.page.mouse.move(position.x+120,position.y+position.height+6);
 assert(await after.page.locator('.brand-theme-menu').isVisible(),'hover bridge');
 await after.page.locator('.brand-theme-list').hover();
 await after.page.waitForFunction(()=>[...document.querySelectorAll('.brand-theme-list button')].slice(0,3).every(b=>{const img=b.querySelector('img');return !img||img.complete&&img.naturalWidth>0}));
 await after.page.screenshot({path:path.join(out,'after-dark.png')});
 const list=await scrollAll(after);assert(await list.evaluate(el=>el.scrollTop>0));
 assert.equal(await after.page.evaluate(()=>view),'home','wheel stays inside menu');assert.equal(await after.page.locator('dialog[open]').count(),0,'no wheel-induced login');
 for(let i=0;i<10;i++){await after.page.mouse.wheel(0,-260);await after.page.waitForTimeout(210)}assert.equal(await after.page.evaluate(()=>document.body.classList.contains('world-active')),false,'upward scroll does not enter world');
 assert.equal(await after.page.locator('.brand-theme-list [data-brand-theme]').count(),13);assert.equal(await after.page.locator('.brand-theme-cover').count(),13);
 await after.page.locator('[data-brand-theme="paper"]').click();
 await after.page.waitForFunction(()=>effective().theme==='paper');
 await hover(after);assert.equal(await after.page.locator('[data-brand-theme="paper"]').getAttribute('aria-pressed'),'true');
 await after.page.locator('[data-brand-theme="base"]').focus();await after.page.keyboard.press('PageDown');await after.page.keyboard.press('PageDown');assert.equal(await after.page.evaluate(()=>view),'home','keyboard scroll stays inside menu');
 await after.page.locator('[data-brand-theme="base"]').click();await after.page.waitForFunction(()=>effective().theme==='base');
 await after.page.locator('.brand').click();await after.page.waitForFunction(()=>effective().theme==='poly');
 await hover(after);await after.page.locator('[data-brand-theme="cinema"]').click();await after.page.locator('#login').waitFor({state:'visible'});assert.equal(await after.page.evaluate(()=>effective().theme),'poly','premium login restriction preserved');
 assert.deepEqual(after.errors,[]);results.push({case:'desktop dark / unchanged home and settings / hover bridge / both-direction scrolling / selection / logo cycle / premium login',passed:true});await after.close();
 const configured=await fixture({configured:true});await hover(configured);assert.equal(await configured.page.locator('[data-brand-theme="rain"]').count(),0);assert.equal(await configured.page.locator('[data-brand-theme="paper"] b').textContent(),'后台主题名');assert.equal(await configured.page.locator('.brand-theme-list button').first().getAttribute('data-brand-theme'),'paper');assert(await configured.page.locator('[data-brand-theme="cinema"] .theme-member-badge').isVisible());assert.deepEqual(configured.errors,[]);results.push({case:'backend disabled theme, name, ordering and member badge',passed:true});await configured.close();
 for(const spec of [{name:'light',mode:'light',viewport:{width:1356,height:1014}},{name:'short',mode:'dark',viewport:{width:1366,height:600}},{name:'mobile',mode:'light',viewport:{width:390,height:844}}]){
  const f=await fixture(spec);await hover(f);const rect=await f.page.locator('.brand-theme-menu').boundingBox();assert(rect.x>=0&&rect.y>=0&&rect.x+rect.width<=spec.viewport.width+1&&rect.y+rect.height<=spec.viewport.height+1,JSON.stringify({spec,rect}));await scrollAll(f);assert.equal(await f.page.evaluate(()=>view),'home');await f.page.locator('.brand-theme-list').evaluate(el=>el.scrollTop=0);await f.page.screenshot({path:path.join(out,'after-'+spec.name+'.png')});assert.deepEqual(f.errors,[]);results.push({case:spec.name+' viewport containment and image loading',passed:true});await f.close();
 }
 const space=await fixture({authenticated:true});await space.page.evaluate(()=>{view='space';render()});assert.equal(await space.page.locator('.brand-theme-list').count(),0);assert.deepEqual(space.errors,[]);results.push({case:'space does not receive homepage cards',passed:true});await space.close();
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}catch(error){console.error(error);process.exitCode=1}finally{await browser?.close()}})();
