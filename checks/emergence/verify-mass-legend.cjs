const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [width,height] of [[2066,1070],[390,844]]){
  const origin='http://127.0.0.1:4328',c=await b.newContext({viewport:{width,height},reducedMotion:'reduce'});
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await c.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
  await c.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled:true,allowed:true,memberOnly:false}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
  await c.route('**/assets/emergence/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8').replace('this.canvas = canvas;','window.__testEngine=this; this.canvas = canvas;')}));
  await c.addInitScript(()=>{localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode:'dark',color:'#b7698b',brandGuideDismissed:true},signed:false}));localStorage.setItem('shiyu-emergence-v1:guest',JSON.stringify({scene:'cosmos',configs:{}}));});
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);
  await p.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready});await p.waitForFunction(()=>window.__testEngine&&!__testEngine.destroyed&&document.documentElement.classList.contains('shiyu-account-ready'));
  await p.evaluate(()=>__testEngine.setPaused(true));
  assert.equal(await p.evaluate(()=>__testEngine.config.count),10000);
  await p.locator('.emergence-open').click();
  const choose=(key,value)=>p.locator(`[data-emergence-field="${key}"][data-emergence-value="${value}"]`).click();
  for(const depth of ['flat','depth']){
   await choose('depth',depth);
   for(const mode of ['repel','attract']){await choose('pointer',mode);assert.equal(await p.evaluate(()=>__testEngine.config.pointer),mode);}
   await p.keyboard.press('i');assert.equal(await p.evaluate(()=>__testEngine.config.pointer),'magnify');
   await choose('pointer','attract');
   await p.evaluate(()=>{const e=__testEngine;e.reset();while(e.time<6.05)e.step();e.draw();});
   await p.screenshot({path:`checks/emergence/dense-panel-${depth}-${width}.png`});
   await p.keyboard.press('Escape');
   await p.mouse.move(width*.5,height*.5);assert.equal(await p.evaluate(()=>__testEngine.pointer.active),true);
   const before=await p.evaluate(()=>__testEngine.time);await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>__testEngine.time),before);
   assert.equal(await p.locator('.emergence-mass-legend>span').count(),7);assert((await p.locator('.emergence-mass-legend').innerText()).includes('星系源'));await p.screenshot({path:`checks/emergence/mass-legend-${depth}-${width}.png`});
   await p.locator('.emergence-open').click();
  }
  assert.deepEqual(errors,[]);console.log('PASS dense defaults, 2D/3D UI mouse modes, shortcut, paused state and screenshots',width);await c.close();
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
