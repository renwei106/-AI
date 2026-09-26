const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const origin=process.env.ORBIT_TEST_ORIGIN||'http://127.0.0.1:4336',out=path.resolve('.local/home-search-20260926');fs.mkdirSync(out,{recursive:true});
// Exercise the shipped preference resolver with independent country, browser,
// language and timezone fixtures. The expected engine is not derived from it.
const app=fs.readFileSync('dist/app.js','utf8'),resolver=app.slice(app.indexOf("let homeSearchEngineChoice="),app.indexOf("document.addEventListener('change',event=>"));
const chrome='Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36',edge=chrome+' Edg/130.0.0.0';
for(const [country,zone,language,manual,expected] of [
 ['CN','America/New_York','en-US','','baidu'],['US','Asia/Shanghai','zh-CN','','google'],['JP','Asia/Tokyo','zh-CN','','google'],
 ['','Asia/Shanghai','en-US','','baidu'],['','Asia/Urumqi','en-US','','baidu'],['','America/New_York','zh-CN','','google'],
 ['XX','Asia/Shanghai','en-US','','baidu'],['','UTC','zh-CN','','baidu'],['','UTC','en-US','','google'],
 ['CN','Asia/Shanghai','zh-CN','bing','bing'],['US','America/New_York','en-US','baidu','baidu'],['CN','Asia/Shanghai','en-US','bad-id','baidu']
])for(const userAgent of [chrome,edge]){
 const context=vm.createContext({SEARCH_ENGINES:[['Web',[['baidu'],['google'],['bing']]]],window:{SHIYU_LOCALE_STATE:{country}},localStorage:{getItem:()=>manual},navigator:{language,userAgent},Intl:{DateTimeFormat:()=>({resolvedOptions:()=>({timeZone:zone})})}});
 vm.runInContext(resolver,context);assert.equal(vm.runInContext('defaultSearchEngine(true)',context),expected,JSON.stringify({country,zone,language,manual,userAgent}));assert.equal(vm.runInContext('defaultSearchEngine()',context),userAgent===chrome?'google':'baidu','other search surfaces keep their default');
}
console.log('PASS 24 country/timezone/language/manual preference cases and unchanged defaults outside the home search');
const picker=p=>p.locator('.home-base #search-form .select-wrap'),menu=p=>picker(p).locator('.select-options');
const frame=p=>p.frameLocator('#corner-orbit-demo');
async function setup(browser,{country='CN',timezoneId='America/New_York',locale='en-US',touch=false,baseline=false}={}){
 const p=await browser.newPage({viewport:{width:touch?390:1440,height:touch?844:960},timezoneId,locale,hasTouch:touch,isMobile:touch,userAgent:edge});p.setDefaultTimeout(10000);
 await p.addInitScript(country=>{let state;Object.defineProperty(window,'SHIYU_LOCALE_STATE',{configurable:true,get:()=>state,set:value=>{state={...value,country}}})},country);
 await p.route('**/api/shiyu/**',r=>r.fulfill({status:200,json:r.request().url().endsWith('/operations')?{corner:{modules:['common','memo','todo'].map(id=>({id,enabled:true}))}}:{}}));
 if(baseline)for(const file of ['app','v4','corner'])await p.route('**/'+file+'.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(out,file+'.before.js'),'utf8')}));
 await p.goto(origin,{waitUntil:'domcontentloaded'});await p.evaluate(()=>{prefs.theme='base';prefs.mode='light';prefs.brandGuideDismissed=true;render()});await picker(p).locator('.select-trigger').waitFor();await p.mouse.move(25,180);await p.waitForTimeout(500);return p;
}
async function arrow(p){const r=await picker(p).locator('.select-trigger small').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2,{steps:6});await menu(p).waitFor();}
async function openFan(p){await p.mouse.move(25,180);await p.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');const r=await frame(p).locator('.core').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2,{steps:6});await frame(p).locator('.is-filled').waitFor();await p.waitForTimeout(750);}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),errors=[];b.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));try{
 const p=await setup(b);assert.equal(await p.locator('.home-base #engine').inputValue(),'baidu','CN works even with a US language/timezone');
 const geometry=page=>page.locator('.base-composition').evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {x:r.x,y:r.y,width:r.width,height:r.height,font:s.fontFamily,color:s.color}});
 const before=await setup(b,{baseline:true});assert.deepEqual(await geometry(p),await geometry(before));await before.close();await p.bringToFront();
 assert.equal(await menu(p).isVisible(),false);await arrow(p);assert.equal(await picker(p).locator('.select-trigger').getAttribute('aria-expanded'),'true');assert.equal(await menu(p).locator('.search-engine-tabs-nav').count(),1);await p.screenshot({path:path.join(out,'hover-light.png')});
 await p.mouse.move(25,180);await p.waitForTimeout(220);assert.equal(await menu(p).isVisible(),false);
 await arrow(p);const r=await menu(p).boundingBox();await p.mouse.move(r.x+45,r.y+50,{steps:12});await p.waitForTimeout(200);assert(await menu(p).isVisible(),'moving from arrow into menu stays open');
 await menu(p).locator('[data-engine-tab="1"]').click();assert(await menu(p).locator('[data-engine-panel="1"]').isVisible());await menu(p).locator('[data-engine-tab="0"]').click();
 await menu(p).locator('[data-value="bing"]').click();assert.equal(await p.locator('.home-base #engine').inputValue(),'bing');assert.equal(await menu(p).isVisible(),false);assert.equal(await p.evaluate(()=>localStorage.getItem('shiyu-home-search-engine')),'bing');
 await p.locator('.home-base #search-input').fill('搜索测试 & hello');await p.evaluate(()=>{window.__searchURL=null;window.open=url=>{window.__searchURL=url};});await p.locator('.home-base #search-form .submit').click();assert.equal(await p.evaluate(()=>__searchURL),'https://www.bing.com/search?q='+encodeURIComponent('搜索测试 & hello'));
 await p.reload({waitUntil:'domcontentloaded'});await picker(p).locator('.select-trigger').waitFor();assert.equal(await p.locator('.home-base #engine').inputValue(),'bing','manual selection survives reload');
 await p.mouse.move(25,180);await p.waitForTimeout(250);await picker(p).locator('.select-trigger').focus();await p.keyboard.press('ArrowDown');assert(await menu(p).isVisible());assert.equal(await p.evaluate(()=>document.activeElement.dataset.value),'bing');await p.keyboard.press('Escape');assert.equal(await menu(p).isVisible(),false);
 // Both surfaces share native values, visible labels, persistence and hover behavior.
 await p.locator('.home-base #search-input').fill('保留首页输入');
 await p.evaluate(()=>quickSearch());const quick=p.locator('#quick-search .select-wrap'),quickMenu=quick.locator('.select-options');
 assert.equal(await quick.locator('select').inputValue(),'bing');
 await quick.locator('.select-trigger small').hover();assert(await quickMenu.isVisible());
 await p.screenshot({path:path.resolve('.local/home-search-sync-20260926/popup-hover-light.png')});
 await p.mouse.move(25,180);await p.waitForTimeout(220);assert.equal(await quickMenu.isVisible(),false);
 await quick.locator('.select-trigger small').hover();await quickMenu.locator('[data-value="google"]').hover();await p.waitForTimeout(200);assert(await quickMenu.isVisible(),'popup gap stays open');
 await quickMenu.locator('[data-value="google"]').click();
 assert.equal(await p.locator('.home-base #engine').inputValue(),'google');assert.equal(await picker(p).locator('.select-trigger span').textContent(),'Google');
 assert.equal(await p.locator('.home-base #search-input').inputValue(),'保留首页输入');
 assert.equal(await p.evaluate(()=>localStorage.getItem('shiyu-home-search-engine')),'google');
 await p.locator('#quick-search #search-input').fill('共享引擎');await p.evaluate(()=>{window.open=url=>{window.__searchURL=url}});await p.locator('#quick-search .submit').click();assert.equal(await p.evaluate(()=>__searchURL),'https://www.google.com/search?q='+encodeURIComponent('共享引擎'));
 await p.evaluate(()=>document.querySelector('#quick-search').close());await arrow(p);assert.equal(await menu(p).locator('[data-value="google"]').getAttribute('aria-selected'),'true');
 await menu(p).locator('[data-value="baidu"]').click();await p.evaluate(()=>quickSearch());assert.equal(await quick.locator('select').inputValue(),'baidu');assert.equal(await quick.locator('.select-trigger span').textContent(),'百度');
 await p.locator('#quick-search [data-search="saved"]').click();assert.equal(await p.locator('#quick-search select').count(),0);await p.locator('#quick-search [data-search="web"]').click();assert.equal(await quick.locator('select').inputValue(),'baidu','web/saved switching retains engine');
 await p.mouse.move(25,180);await quick.locator('.select-trigger').focus();await p.keyboard.press('ArrowDown');assert(await quickMenu.isVisible());await p.keyboard.press('Escape');assert.equal(await quickMenu.isVisible(),false);
 await p.evaluate(()=>document.querySelector('#quick-search').close());
 await p.reload({waitUntil:'domcontentloaded'});await picker(p).locator('.select-trigger').waitFor();assert.equal(await p.locator('.home-base #engine').inputValue(),'baidu');await p.evaluate(()=>quickSearch());assert.equal(await quick.locator('select').inputValue(),'baidu');await p.evaluate(()=>document.querySelector('#quick-search').close());
 await p.evaluate(()=>{prefs.mode='dark';apply()});await arrow(p);await p.screenshot({path:path.join(out,'hover-dark.png')});await p.mouse.move(25,180);await p.waitForTimeout(220);
 // Real module entry and close, followed by cursor checks on both hit layers.
 await openFan(p);await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'cursor-qa'}});let box=await frame(p).locator('.core-hit').boundingBox();await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForSelector('#my-corner[open]');await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));await p.locator('.corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);await p.mouse.move(25,180);await p.waitForTimeout(1000);
 assert.deepEqual(await frame(p).locator('.core,.core-hit').evaluateAll(els=>els.map(el=>getComputedStyle(el).cursor)),['pointer','pointer']);
 await openFan(p);box=await frame(p).locator('.core-hit').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForTimeout(330);assert.equal(await frame(p).locator('.core-hit').evaluate(el=>getComputedStyle(el).cursor),'grabbing');await p.mouse.up();assert.equal(await frame(p).locator('.core-hit').evaluate(el=>getComputedStyle(el).cursor),'pointer');
 await p.screenshot({path:path.join(out,'returned-home.png')});await p.close();console.log('PASS arrow hover / leave / gap, grouped popup, click selection and submission, reload persistence, keyboard, bidirectional shared quick search and hover, unchanged layout, dark/light and cursor after module close and drag release');
 const us=await setup(b,{country:'US',timezoneId:'Asia/Shanghai',locale:'zh-CN'});assert.equal(await us.locator('.home-base #engine').inputValue(),'google','US country wins over Chinese language/timezone');await us.close();
 const mobile=await setup(b,{touch:true,country:'CN',timezoneId:'Asia/Shanghai',locale:'zh-CN'});await picker(mobile).locator('.select-trigger').tap();assert(await menu(mobile).isVisible());await menu(mobile).locator('[data-value="google"]').tap();assert.equal(await mobile.locator('.home-base #engine').inputValue(),'google');assert.equal(await menu(mobile).isVisible(),false);await mobile.screenshot({path:path.join(out,'mobile.png')});await mobile.close();
 assert.deepEqual(errors,[]);console.log('PASS server country overrides browser region, touch click selection and no browser errors');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
