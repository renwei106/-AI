const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const origin='http://127.0.0.1:4328';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const options of [{viewport:{width:1711,height:1015},deviceScaleFactor:1},{viewport:{width:390,height:844},deviceScaleFactor:2}]){
  const context=await browser.newContext(options);
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await context.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
  await context.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled:true,allowed:true,memberOnly:false}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
  await context.route('**/assets/emergence/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8').replace('this.canvas = canvas;','window.__testEngine=this; this.canvas = canvas;')}));
  await context.addInitScript(()=>{if(!sessionStorage.getItem('magnify-seed')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode:'dark',brandGuideDismissed:true},signed:false}));sessionStorage.setItem('magnify-seed','1');}});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);
  const ready=async()=>{await p.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready;});await p.waitForFunction(()=>document.documentElement.classList.contains('shiyu-account-ready')&&window.__testEngine&&!window.__testEngine.destroyed);await p.waitForTimeout(400);};await ready();
  await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();
  await p.locator('[data-emergence-field="pointer"][data-emergence-value="magnify"]').click();
  assert.equal(await p.evaluate(()=>__testEngine.config.pointer),'magnify');
  await p.locator('[data-emergence-action="close"]').click();
  await p.evaluate(()=>__testEngine.setPaused(true));
  await p.mouse.move(options.viewport.width*.55,options.viewport.height*.58);
  assert.equal(await p.evaluate(()=>__testEngine.pointer.active),true);
  const pixel=await p.evaluate(()=>{
   const e=__testEngine,ctx=e.ctx;e.clearPointer();const x=e.width/2,y=e.height/2,d=e.dpr;
   const model=e.model;e.model={draw:(engine,context)=>{context.fillStyle='red';context.fillRect((x+10)/e.scale,(y-2)/e.scale,4/e.scale,4/e.scale);context.fillRect(10/e.scale,10/e.scale,4/e.scale,4/e.scale);}};
   e.draw();e.model=model;const sample=(px,py)=>[...ctx.getImageData(Math.round(px*d),Math.round(py*d),1,1).data];
   const result={dimension:e.config.depth,mode:e.config.pointer,lens:[e.lensCanvas.width,e.lensCanvas.height],enlarged:sample(x+30,y),original:sample(x+12,y),outside:sample(12,12)};
   // Repeated paused draws must never magnify the previous lens recursively.
   e.draw();const first=ctx.getImageData(0,0,e.canvas.width,e.canvas.height).data;e.draw();const second=ctx.getImageData(0,0,e.canvas.width,e.canvas.height).data;let changed=0,max=0;for(let i=0;i<first.length;i++){if(first[i]!==second[i])changed++;max=Math.max(max,Math.abs(first[i]-second[i]));}result.diff={changed,max};result.stable=changed===0;return result;
  });
  assert.deepEqual(pixel.enlarged,[255,0,0,255],JSON.stringify(pixel));assert.equal(pixel.original[3],0);assert.deepEqual(pixel.outside,[255,0,0,255]);assert(pixel.stable,JSON.stringify(pixel));
  const physics=await p.evaluate(()=>{
   const e=__testEngine,results=[];
   const advance=()=>{const random=Math.random;let seed=12345;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};try{for(let i=0;i<60;i++)e.step();}finally{Math.random=random;}};
   for(const scene of ['birds','cosmos'])for(const depth of ['flat','depth']){
    e.setScene(scene,{pointer:'none',depth,count:100,breeding:'no',predators:0});e.setPaused(true);
    const particles=structuredClone(e.particles);e.setPointer(e.width/2,e.height/2);
    advance();const expected=JSON.stringify(e.particles);
    e.particles=structuredClone(particles);e.time=0;e.tick=0;e.setConfig({...e.config,pointer:'magnify'});e.setPointer(e.width/2,e.height/2);
    advance();results.push({scene,depth,equal:expected===JSON.stringify(e.particles),finite:e.snapshot().finite});
   }return results;
  });assert(physics.every(r=>r.equal&&r.finite),JSON.stringify(physics));
  // Restore a real scene for visual review, then exercise persisted UI choices.
  await p.evaluate(()=>{__testEngine.setScene('birds',{pointer:'magnify'});__testEngine.setPaused(true);});
  await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();
  await p.locator('[data-emergence-field="depth"][data-emergence-value="depth"]').click();
  assert(await p.locator('[data-emergence-field="pointer"][data-emergence-value="magnify"]').isEnabled());
  assert(await p.locator('[data-emergence-field="pointer"][data-emergence-value="repel"]').isDisabled());
  await p.locator('[data-emergence-action="close"]').click();
  const yaw=await p.evaluate(()=>__testEngine.camera.yaw);
  await p.mouse.move(options.viewport.width*.5,options.viewport.height*.6);await p.mouse.down();await p.mouse.move(options.viewport.width*.65,options.viewport.height*.6,{steps:8});await p.waitForTimeout(350);
  assert.equal(await p.evaluate(()=>__testEngine.boost),1);assert.notEqual(await p.evaluate(()=>__testEngine.camera.yaw),yaw);await p.mouse.up();
  await p.reload();await ready();assert.equal(await p.evaluate(()=>__testEngine.config.pointer),'magnify');assert.equal(await p.evaluate(()=>__testEngine.is3D),true);
  await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();
  await p.locator('[data-emergence-field="depth"][data-emergence-value="flat"]').click();
  await p.locator('[data-emergence-field="pointer"][data-emergence-value="magnify"]').scrollIntoViewIfNeeded();
  await p.evaluate(()=>{__testEngine.setPaused(true);__testEngine.clearPointer();});
  await p.screenshot({path:`checks/emergence/magnify-${options.viewport.width}.png`});
  await p.locator('[data-emergence-scene="cosmos"]').click();await p.locator('[data-emergence-field="pointer"][data-emergence-value="magnify"]').click();
  assert.equal(await p.evaluate(()=>__testEngine.config.pointer),'magnify');
  assert.deepEqual(errors,[]);console.log('PASS magnifier pixel scale, no force, paused drawing, 2D/3D, persistence, cosmos, viewport',options.viewport.width);await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
