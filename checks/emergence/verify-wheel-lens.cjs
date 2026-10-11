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
  assert.equal(await p.evaluate(()=>__testEngine.config.count),6000);
  await p.locator('.emergence-open').click();
  const choose=(key,value)=>p.locator(`[data-emergence-field="${key}"][data-emergence-value="${value}"]`).click();

  for(const depth of ['flat','depth']){
   await choose('depth',depth);await choose('pointer','magnify');await p.keyboard.press('Escape');
   await p.mouse.move(width/2,height/2);const time=await p.evaluate(()=>__testEngine.time);
   await p.mouse.wheel(0,-120);await p.waitForTimeout(100);
   assert(await p.evaluate(()=>__testEngine.lensZoom>2.5));
   for(let i=0;i<8;i++)await p.mouse.wheel(0,-240);
   await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>__testEngine.lensZoom),10);
   for(let i=0;i<8;i++)await p.mouse.wheel(0,240);
   await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>__testEngine.lensZoom),2.5);
   assert.equal(await p.evaluate(()=>document.body.dataset.view),'home');assert.equal(await p.evaluate(()=>__testEngine.time),time);
   await p.evaluate(()=>{const e=__testEngine;e.reset(false);e.setPaused(true);const q=e.particles[0];q.x=e.world.width/2;q.y=e.world.height/2;q.z3=e.world.depth/2;e.followTarget=q;e.draw();});
   const result=await p.evaluate(()=>{const e=__testEngine,box=e.canvas.getBoundingClientRect(),lens=e.magnifierView(),target=e.followTarget;
    const inside=new WheelEvent('wheel',{clientX:box.left+lens.x,clientY:box.top+lens.y,deltaY:-120,bubbles:true,cancelable:true});e.canvas.dispatchEvent(inside);const zoom=e.lensZoom;
    const outside=new WheelEvent('wheel',{clientX:box.left+lens.x+lens.radius+15,clientY:box.top+lens.y,deltaY:-120,cancelable:true});const consumed=e.lensWheel(outside);
    return {inside:inside.defaultPrevented,outside:consumed,unchanged:zoom===e.lensZoom,follow:e.followTarget===target};});
   assert.deepEqual(result,{inside:true,outside:false,unchanged:true,follow:true});
   await p.screenshot({path:'checks/emergence/wheel-lens-'+depth+'-'+width+'.png'});
   await p.evaluate(()=>__testEngine.clearFollow());await p.locator('.emergence-open').click();
  }
  assert.deepEqual(errors,[]);console.log('PASS lens wheel limits, navigation interception, follow and pause',width);await c.close();
 }
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
