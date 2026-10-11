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
  const yes=p.locator('[data-emergence-field="edgeWrap"][data-emergence-value="yes"]'),no=p.locator('[data-emergence-field="edgeWrap"][data-emergence-value="no"]');
  assert.equal(await no.getAttribute('aria-pressed'),'true');
  assert.deepEqual(await p.locator('[data-emergence-field="edgeWrap"]').allTextContents(),['不穿透','穿透']);
  assert.deepEqual(await p.evaluate(()=>[__testEngine.config.depth,__testEngine.config.pointer]),['flat','repel']);
  for(const field of ['shape','pointer','depth','edgeWrap']){
   const items=p.locator(`[data-emergence-field="${field}"]`);
   const gap=await items.first().evaluate(el=>parseFloat(getComputedStyle(el.parentElement).gap));assert(gap>=8);
   const fills=await items.evaluateAll(els=>els.map(el=>({selected:el.getAttribute('aria-pressed'),fill:getComputedStyle(el).backgroundColor})));
   assert(fills.every(item=>item.fill!=='rgba(0, 0, 0, 0)'&&item.fill!=='transparent'));
   assert.notEqual(fills.find(item=>item.selected==='true').fill,fills.find(item=>item.selected==='false').fill);
  }
  await yes.click();await p.locator('[data-emergence-field="depth"][data-emergence-value="depth"]').click();
  await p.reload();await ready();assert.deepEqual(await p.evaluate(()=>[__testEngine.config.edgeWrap,__testEngine.config.depth]),['yes','depth']);
  await p.locator('.emergence-open').click();await p.locator('[data-emergence-action="reset"]').click();
  assert.deepEqual(await p.evaluate(()=>[__testEngine.config.edgeWrap,__testEngine.config.depth,__testEngine.config.pointer]),['no','flat','repel']);
  assert.equal(await p.evaluate(()=>__testEngine.config.edgeWrap),'no');assert.equal(await p.locator('.emergence-rules').innerText(),rules);
  await no.scrollIntoViewIfNeeded();await p.screenshot({path:`checks/emergence/choice-defaults-${width}.png`});
  await p.reload();await ready();assert.equal(await p.evaluate(()=>__testEngine.config.edgeWrap),'no');
  await p.locator('.emergence-open').click();await p.locator('[data-emergence-field="depth"][data-emergence-value="flat"]').click();assert.equal(await p.evaluate(()=>__testEngine.world.bounded),true);
  await p.locator('[data-emergence-scene="cosmos"]').click();assert.equal(await no.getAttribute('aria-pressed'),'true');await yes.click();await no.click();assert.equal(await p.evaluate(()=>__testEngine.config.edgeWrap),'no');
  await p.locator('[data-emergence-action="close"]').click();await p.evaluate(()=>{for(let i=0;i<120;i++)__testEngine.step();__testEngine.draw()});
  assert.deepEqual(errors,[]);console.log('PASS toggle, persistence, unchanged captions, both scenes/dimensions, viewport/DPR',width,dpr);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
