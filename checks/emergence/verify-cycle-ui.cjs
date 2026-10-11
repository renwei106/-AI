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


  await p.locator('[data-emergence-scene="cosmos"]').click();await p.keyboard.press('Escape');
  for(const depth of ['flat','depth']){
    await p.evaluate(depth=>{const e=__testEngine;e.setScene('cosmos',{depth,count:650,mutualGravity:0});e.reset(false);e.setPaused(true);const x=e.world.width*(depth==='flat'?.57:.52),y=e.world.height*(depth==='flat'?.62:.53);e.particles=[{...e.model.create(e),x:x-1,y,z3:e.world.depth/2,mass:320,vx:.1,vy:0,vz:0},{...e.model.create(e),x:x+1,y,z3:e.world.depth/2,mass:380,vx:-.1,vy:0,vz:0}];e.step();e.draw();},depth);
    for(const [label,steps] of [['condense',30],['swell',30],['burst',20],['expand',120]]){
      const state=await p.evaluate(steps=>{const e=__testEngine;for(let i=0;i<steps;i++)e.step();e.draw();return {count:e.particles.length,mass:e.particles.reduce((sum,p)=>sum+p.mass,0),finite:e.snapshot().finite};},steps);
      assert.ok(state.finite);assert.ok(Math.abs(state.mass-700)<1e-6);if(label==='condense'||label==='swell')assert.equal(state.count,1);else assert.equal(state.count,650);
      await p.screenshot({path:'checks/emergence/cosmic-cycle-'+depth+'-'+label+'-'+width+'.png'});
    }
  }
  assert.deepEqual(errors,[]);console.log('PASS cycle render',width);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});