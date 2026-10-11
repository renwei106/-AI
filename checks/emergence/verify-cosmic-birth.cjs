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
  await p.keyboard.press('Escape');
  for(const depth of ['flat','depth']){
    await p.evaluate(depth=>{const e=__testEngine;e.setScene('cosmos',{depth,count:650});e.setPaused(true);e.draw();},depth);
    const inspect=()=>p.evaluate(()=>{const e=__testEngine;return {count:e.particles.length,time:e.time,birth:e.cosmicBirth,mass:e.particles.reduce((a,p)=>a+p.mass,0),radius:e.particles.reduce((a,p)=>a+Math.hypot(p.x-e.world.width/2,p.y-e.world.height/2),0)/(e.particles.length||1),finite:e.snapshot().finite};});
    assert.equal((await inspect()).count,0);
    for(const [label,steps] of [['charge',60],['burst',20],['spread',100],['evolved',240]]){
      await p.evaluate(steps=>{for(let i=0;i<steps;i++)__testEngine.step();__testEngine.draw();},steps);
      const s=await inspect();assert.ok(s.finite);if(label==='charge')assert.equal(s.count,0);else assert.ok(Math.abs(s.mass-650)<1e-6);if(label==='burst')assert.equal(s.count,650);if(label==='evolved')assert.equal(s.birth,null);
      await p.screenshot({path:'checks/emergence/cosmic-birth-'+depth+'-'+label+'-'+width+'.png'});
      console.log(width,depth,label,JSON.stringify(s));
    }
    const state=await p.evaluate(()=>{const e=__testEngine;e.reset();e.step(.5);e.setConfig({...e.config,trail:12});const noReset=e.time===.5&&e.particles.length===0;e.setConfig({...e.config,count:100});for(let i=0;i<60;i++)e.step();return {noReset,count:e.particles.length};});assert.ok(state.noReset);assert.equal(state.count,100);
  }
  await p.evaluate(()=>{__testEngine.reset();__testEngine.setPaused(true);});
  const pausedTime=await p.evaluate(()=>__testEngine.time);await p.waitForTimeout(100);
  assert.equal(await p.evaluate(()=>__testEngine.time),pausedTime);
  await p.locator('.emergence-open').click();await p.locator('[data-emergence-action="restart"]').click();
  assert.equal(await p.evaluate(()=>__testEngine.particles.length),0);
  await p.locator('[data-emergence-action="pause"]').click();
  await p.waitForFunction(()=>__testEngine.particles.length>0);await p.evaluate(()=>__testEngine.setPaused(true));
  assert.deepEqual(errors,[]);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
