const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [width,height,dpr] of [[2066,1070,1],[1033,781,2],[390,844,2]]){
  const origin='http://127.0.0.1:4328',c=await b.newContext({viewport:{width,height},deviceScaleFactor:dpr,reducedMotion:'reduce'});
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await c.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
  await c.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled:true,allowed:true,memberOnly:false}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
  await c.route('**/assets/emergence/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8').replace('this.canvas = canvas;','window.__testEngine=this; this.canvas = canvas;')}));
  await c.addInitScript(()=>{if(!sessionStorage.getItem('edge-test')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode:'dark',color:'#b7698b',brandGuideDismissed:true},signed:false}));localStorage.setItem('shiyu-emergence-v1:guest',JSON.stringify({scene:'birds',configs:{}}));sessionStorage.setItem('edge-test','yes')}});
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const ready=async()=>{await p.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready});await p.waitForFunction(()=>window.__testEngine&&!__testEngine.destroyed&&document.documentElement.classList.contains('shiyu-account-ready'))};
  await p.goto(origin);await ready();const rules=await p.locator('.emergence-rules').innerText();
  await p.locator('.emergence-open').click();


  const state=()=>p.evaluate(()=>{const s=document.querySelector('.emergence-panel-scroll'),t=document.querySelector('.emergence-role-tabs');return {top:s.scrollTop,tab:t.getBoundingClientRect().top,page:window.scrollY}});
  for(const section of [0,1,2]){
    const active=p.locator('[role="tabpanel"]:visible');
    if(!await active.locator('details').nth(section).getAttribute('open').then(v=>v!==null))await active.locator('summary').nth(section).click();
    await p.locator('[data-emergence-role="predator"]').scrollIntoViewIfNeeded();
    for(const role of ['predator','prey','predator','prey']){
      const before=await state();
      await p.locator('[data-emergence-role="'+role+'"]').click();
      await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const after=await state();
      assert.ok(Math.abs(after.top-before.top)<=1,JSON.stringify({width,section,role,before,after}));
      assert.ok(Math.abs(after.tab-before.tab)<=1);assert.equal(after.page,before.page);
    }
  }
  const before=await state();await p.locator('[data-emergence-role="prey"]').focus();
  await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowLeft');
  const after=await state();assert.ok(Math.abs(after.top-before.top)<=1);assert.ok(Math.abs(after.tab-before.tab)<=1);
  await p.screenshot({path:'checks/emergence/role-scroll-'+width+'.png'});
  assert.deepEqual(errors,[]);console.log('PASS',width,'repeated role switches across all disclosures and keyboard preserve scroll and tab position');await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
