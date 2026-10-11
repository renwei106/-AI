const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const store={};let writes=0,fail=false;try{
 async function open(account,width=2066,height=1070){const dpr=1;
  const origin='http://127.0.0.1:4328',c=await b.newContext({viewport:{width,height},deviceScaleFactor:dpr,reducedMotion:'reduce'});
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await c.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
  await c.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled:true,allowed:true,memberOnly:false}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
  await c.route('**/assets/emergence/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8').replace('this.canvas = canvas;','window.__testEngine=this; this.canvas = canvas;')}));
  await c.addInitScript(()=>{if(!sessionStorage.getItem('edge-test')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode:'dark',color:'#b7698b',brandGuideDismissed:true},signed:false}));localStorage.setItem('shiyu-emergence-v1:guest',JSON.stringify({scene:'birds',configs:{}}));sessionStorage.setItem('edge-test','yes')}});
  await c.route('**/api/shiyu/auth/session',r=>r.fulfill({json:account?{authenticated:true,user:{id:account,name:account,member:false,entitlements:[]}}:{authenticated:false,entitlements:[]}}));
  await c.route('**/api/shiyu/auth/account',r=>r.fulfill({json:{userId:account,data:[],initialized:true}}));
  await c.route('**/api/shiyu/auth/emergence',async r=>{
    if(!account)return r.fulfill({status:401,json:{}});
    if(r.request().method()==='GET')return r.fulfill({json:{userId:account,settings:store[account]||null}});
    const body=r.request().postDataJSON();assert.equal(body.userId,account);
    if(fail){fail=false;return r.fulfill({status:503,json:{}})}
    store[account]=structuredClone(body.settings);writes++;return r.fulfill({json:{userId:account,settings:store[account]}});
  });
  await c.addInitScript(account=>{const state=JSON.parse(localStorage.getItem('yiyu-prototype-v1')||'{}');state.signed=!!account;state.prefs={...state.prefs,accountProfile:account?{id:account,name:account}:{},accountDataUserId:account||''};localStorage.setItem('yiyu-prototype-v1',JSON.stringify(state));},account);
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const ready=async()=>{await p.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready});await p.waitForFunction(()=>window.__testEngine&&!__testEngine.destroyed&&document.documentElement.classList.contains('shiyu-account-ready'))};
  await p.goto(origin);await ready();const rules=await p.locator('.emergence-rules').innerText();
  await p.locator('.emergence-open').click();



 return {p,c,errors};
 }
 let {p,c,errors}=await open('A');
 const scroll=p.locator('.emergence-panel-scroll');await scroll.evaluate(el=>el.scrollTop=el.scrollHeight);assert.ok(await scroll.evaluate(el=>el.scrollTop)>0);
 await p.keyboard.press('Escape');await p.locator('.emergence-open').click();assert.equal(await scroll.evaluate(el=>el.scrollTop),0);
 await scroll.evaluate(el=>el.scrollTop=el.scrollHeight);await p.mouse.click(600,300);await p.locator('.emergence-open').click();assert.equal(await scroll.evaluate(el=>el.scrollTop),0);
 await p.locator('[data-emergence-scene="cosmos"]').click();
 await p.locator('#emergence-speed').fill('0.6');await p.locator('#emergence-speed').dispatchEvent('input');
 await p.waitForFunction(()=>document.querySelector('.emergence-save').textContent==='已保存到账号');
 assert.equal(store.A.scene,'cosmos');assert.equal(store.A.configs.cosmos.speed,.6);
 fail=true;await p.locator('#emergence-speed').fill('0.7');await p.locator('#emergence-speed').dispatchEvent('input');await p.waitForFunction(()=>document.querySelector('.emergence-save').textContent.includes('保存失败'));
 assert.equal(store.A.configs.cosmos.speed,.6);await p.evaluate(()=>window.dispatchEvent(new Event('online')));await p.waitForFunction(()=>document.querySelector('.emergence-save').textContent==='已保存到账号');assert.equal(store.A.configs.cosmos.speed,.7);
 assert.deepEqual(errors,[]);await c.close();
 ({p,c,errors}=await open('A'));assert.equal(await p.evaluate(()=>__testEngine.scene.id),'cosmos');assert.equal(await p.locator('#emergence-speed').inputValue(),'0.7');await p.screenshot({path:'checks/emergence/account-settings-restored.png'});assert.deepEqual(errors,[]);await c.close();
 ({p,c,errors}=await open('B'));assert.equal(await p.evaluate(()=>__testEngine.scene.id),'birds');assert.equal(await p.locator('#emergence-speed').inputValue(),'0.8');assert.equal(store.B,undefined);assert.deepEqual(errors,[]);await c.close();
 const before=writes;({p,c,errors}=await open(null,390,844));await p.locator('#emergence-speed').fill('0.5');await p.locator('#emergence-speed').dispatchEvent('input');assert.equal(await p.locator('.emergence-save').textContent(),'已保存在此浏览器');await p.locator('.emergence-panel-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await p.keyboard.press('Escape');await p.locator('.emergence-open').click();assert.equal(await p.locator('.emergence-panel-scroll').evaluate(el=>el.scrollTop),0);assert.equal(writes,before);assert.deepEqual(errors,[]);await c.close();
 console.log('PASS reopen scroll reset, account save, clean-browser restore, identity isolation, offline retry and guest-only local persistence');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
