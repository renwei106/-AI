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
  assert.equal(await p.evaluate(()=>__testEngine.config.count),2500);

  for(const depth of ['flat','depth']){
   await p.evaluate(depth=>{const e=__testEngine;e.setScene('cosmos',{depth,speed:10,count:100,pointer:'none'});e.setPaused(false)},depth);
   const point=await p.locator('.emergence-canvas').boundingBox();
   await p.mouse.move(point.x+point.width*.6,point.y+point.height*.5);await p.mouse.down();await p.waitForTimeout(400);
   assert.equal(await p.evaluate(()=>__testEngine.boost),2);assert.equal(await p.evaluate(()=>__testEngine.config.speed),10);
   if(depth==='depth'){await p.mouse.move(point.x+point.width*.6+30,point.y+point.height*.5);assert.equal(await p.evaluate(()=>__testEngine.boost),1);}
   await p.mouse.up();assert.equal(await p.evaluate(()=>__testEngine.boost),1);
   await p.evaluate(()=>__testEngine.setPaused(true));await p.mouse.down();await p.waitForTimeout(350);assert.equal(await p.evaluate(()=>__testEngine.boost),1);await p.mouse.up();
  }
  assert.deepEqual(errors,[]);console.log('PASS 2D/3D hold doubles current speed, release restores, drag cancels, pause stays paused',width);await c.close();
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
