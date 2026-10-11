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

  await choose('pointer','attract');await p.keyboard.press('Escape');
  for(let i=0;i<3;i++){
   await p.keyboard.press('i');assert.equal(await p.evaluate(()=>__testEngine.config.pointer),'magnify');
   await p.mouse.move(width-2,height/2);
   const edge=await p.evaluate(()=>__testEngine.magnifierView());assert(Math.abs(edge.x-(width-2))<2);
   const retained=await p.evaluate(()=>{__testEngine.clearPointer();return __testEngine.magnifierView()});assert.equal(retained.x,edge.x);assert.equal(retained.y,edge.y);
   await p.keyboard.press('i');assert.equal(await p.evaluate(()=>__testEngine.config.pointer),'attract');
  }
  await p.keyboard.press('i');await p.mouse.move(1,1);
  const corner=await p.evaluate(()=>{const e=__testEngine;e.setPointer(1,1);e.clearPointer();return e.magnifierView()});assert(Math.abs(corner.x-1)<2&&Math.abs(corner.y-1)<2);
  await p.screenshot({path:'checks/emergence/lens-edge-'+width+'.png'});
  assert.deepEqual(errors,[]);console.log('PASS dense defaults, 2D/3D UI mouse modes, shortcut, paused state and screenshots',width);await c.close();
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
