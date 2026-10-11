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


  await p.locator('[data-emergence-scene="cosmos"]').click();
  await p.locator('summary').filter({hasText:'星尘补给'}).click();
  assert.equal(await p.locator('#emergence-influxInterval').inputValue(),'8');
  await p.locator('#emergence-influxInterval').fill('12');await p.locator('#emergence-influxInterval').dispatchEvent('input');
  assert.equal(await p.evaluate(()=>__testEngine.config.influxInterval),12);
  await p.screenshot({path:'checks/emergence/influx-panel-'+width+'.png'});
  await p.keyboard.press('Escape');
  for(const depth of ['flat','depth']){
   await p.evaluate(depth=>{const e=__testEngine;e.setScene('cosmos',{depth,influx:'no'});e.setPaused(true);for(let i=0;i<650;i++)e.step();e.draw()},depth);
   await p.screenshot({path:'checks/emergence/orbits-'+depth+'-'+width+'.png'});
  }
  assert.deepEqual(errors,[]);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
