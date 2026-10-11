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

  for(const depth of ['flat','depth']){
   await p.evaluate(depth=>{const e=__testEngine;let seed=947;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};e.setScene('cosmos',{depth,count:650,influx:'no',pointer:'none'});e.setPaused(true)},depth);
   for(const [label,seconds] of [['charge',.9],['primary',1.9],['secondary',3],['dust',5.8],['settled',12]]){
    const report=await p.evaluate(seconds=>{const e=__testEngine;while(e.time+1e-7<seconds)e.step();e.draw();const w=e.world,b=e.cosmicBirth;return {time:e.time,count:e.particles.length,visible:e.particles.filter(p=>!(p.releaseAt>e.time)).length,mass:e.particles.reduce((sum,p)=>sum+p.mass,0),largest:Math.max(0,...e.particles.map(p=>p.mass)),packets:b?.packets?.length||0,plane:e.particles.every(p=>Math.abs(p.z3-w.depth/2)<1e-7&&Math.abs(p.vz)<1e-7),octants:[...new Set(e.particles.map(p=>(p.x>w.width/2?1:0)+(p.y>w.height/2?2:0)+(p.z3>w.depth/2?4:0)))],finite:e.snapshot().finite};},seconds);
    assert(report.finite);if(label==='charge')assert.equal(report.count,0);else assert(Math.abs(report.mass-650)<1e-6);
    if(label==='primary'){assert(report.packets>=24);assert.equal(report.visible,0);assert(report.largest<6);}
    if(label==='secondary')assert(report.visible>0&&report.visible<650);
    if(label==='dust'){assert.equal(report.visible,650);assert(report.largest<6);if(depth==='depth')assert.equal(report.octants.length,8);}
    if(depth==='flat')assert(report.plane);
    await p.screenshot({path:`checks/emergence/radial-${depth}-${label}-${width}.png`});console.log(width,depth,label,JSON.stringify(report));
   }
   if(width===2066){
    const report=await p.evaluate(()=>{const e=__testEngine;while(e.time<60)e.step();e.draw();return {count:e.particles.length,merged:e.merged,shattered:e.shattered,mass:e.particles.reduce((sum,p)=>sum+p.mass,0),largest:Math.max(...e.particles.map(p=>p.mass))}});
    console.log('population',depth,report);assert(report.count>60);assert(Math.abs(report.mass-650)<1e-6);assert(report.merged>0);console.log('60s',depth,report);
   }
  }
  assert.deepEqual(errors,[]);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});

