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
  await p.locator('.emergence-open').click();
  const choose=(key,value)=>p.locator(`[data-emergence-field="${key}"][data-emergence-value="${value}"]`).click();

  for(const depth of ['flat','depth']){
   await choose('depth',depth);await choose('pointer','none');await p.keyboard.press('Escape');
   const target=await p.evaluate(()=>{const e=__testEngine;e.reset(false);e.setPaused(true);const q=e.particles[0];q.x=e.world.width/2;q.y=e.world.height/2;q.z3=e.world.depth/2;q.mass=128;q.vx=0;q.vy=0;q.vz=0;q.visualRadius=6.09;e.cosmicBirth=null;e.particles=[q];e.draw();return e.particleScreen(q);});
   await p.mouse.move(target.x,target.y);
   const info=await p.evaluate(()=>{const i=__testEngine.gravityInspection();return i&&{reach:i.reach,strength:i.strength}});assert(info.reach>0);assert.equal(info.strength,128);
   assert.equal(await p.locator('.emergence-mass-legend>span').first().innerText(),'黑洞');
   assert.equal(await p.locator('.emergence-mass-legend canvas').first().evaluate(c=>c.width===c.height),true);
   await p.screenshot({path:'checks/emergence/gravity-inspect-'+depth+'-'+width+'.png'});
   await p.mouse.move(width*.8,30);await p.waitForTimeout(250);assert.equal(await p.locator('.emergence-caption').evaluate(n=>getComputedStyle(n).opacity),'0.04');
   await p.locator('.emergence-caption').hover();await p.waitForTimeout(250);assert.equal(await p.locator('.emergence-caption').evaluate(n=>getComputedStyle(n).opacity),'1');
   await p.screenshot({path:'checks/emergence/gravity-legend-'+depth+'-'+width+'.png'});
   await p.evaluate(()=>{__testEngine.setPaused(false);});await p.mouse.move(target.x,target.y);assert(await p.evaluate(()=>!!__testEngine.gravityInspection()));
   await p.screenshot({path:'checks/emergence/live-gravity-'+depth+'-'+width+'.png'});
   await p.mouse.move(width*.85,100);assert.equal(await p.evaluate(()=>__testEngine.gravityInspection()),null);await p.evaluate(()=>__testEngine.setPaused(true));
   await p.locator('.emergence-open').click();await choose('pointer','magnify');await p.keyboard.press('Escape');await p.mouse.move(target.x,target.y);
   assert(await p.evaluate(()=>!!__testEngine.gravityInspection()));await p.screenshot({path:'checks/emergence/gravity-lens-'+depth+'-'+width+'.png'});
   await p.locator('.emergence-open').click();
  }
  assert.deepEqual(errors,[]);console.log('PASS live and paused hover, pointer none and lens, exit clears range',width);await c.close();
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
