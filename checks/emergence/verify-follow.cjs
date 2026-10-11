const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [width,height,dpr] of [[2066,1070,1],[390,844,2]]){
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


  await p.keyboard.press('Escape');await p.waitForTimeout(400);
  const waitClick=()=>p.waitForTimeout(400);
  for(const scene of ['birds','cosmos'])for(const depth of ['flat','depth']){
   const point=await p.evaluate(({scene,depth})=>{
    const e=__testEngine;e.setScene(scene,{depth,pointer:'magnify',mutualGravity:0,collisions:'off',influx:'no',predators:0});e.reset(false);e.setPaused(true);e.camera={yaw:0,pitch:0};
    const a=e.model.create(e),b=e.model.create(e),k=e.is3D?e.projection3.focal/e.projection3.distance:e.scale;
    Object.assign(a,{x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2,vx:0,vy:0,vz:0});
    Object.assign(b,{x:a.x+20/k,y:a.y,z3:a.z3,vx:0,vy:0,vz:0});
    e.particles=[a,b];window.followA=a;window.followB=b;e.draw();return e.particleScreen(a);
   },{scene,depth});
   await p.mouse.click(point.x,point.y);await waitClick();
   assert.equal(await p.evaluate(()=>__testEngine.followTarget===followA),true);
   await p.mouse.move(width*.35,height*.62);
   assert.equal(await p.evaluate(()=>__testEngine.magnifierView().x===__testEngine.particleScreen(followA).x),true);
   const shifted=await p.evaluate(()=>{const e=__testEngine;followA.y+=10;followB.y+=10;e.draw();return e.magnifierView().y});
   assert.notEqual(shifted,point.y);
   const enlarged=await p.evaluate(()=>{const e=__testEngine,l=e.magnifierView(),b=e.particleScreen(followB);return {x:l.x+(b.x-l.x)*l.zoom,y:l.y+(b.y-l.y)*l.zoom}});
   await p.mouse.click(enlarged.x,enlarged.y);await waitClick();assert.equal(await p.evaluate(()=>__testEngine.followTarget===followB),true);
   await p.screenshot({path:'checks/emergence/follow-'+scene+'-'+depth+'-'+width+'.png'});
   await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>__testEngine.followTarget),null);
   const next=await p.evaluate(()=>__testEngine.particleScreen(followA));
   await p.mouse.dblclick(next.x,next.y);await waitClick();assert.equal(await p.evaluate(()=>__testEngine.followTarget),null);assert.equal(await p.evaluate(()=>__testEngine.paused),false);
   await p.evaluate(()=>__testEngine.setPaused(true));
   const pos=await p.evaluate(()=>__testEngine.particleScreen(followA));
   await p.mouse.click(pos.x,pos.y);await waitClick();assert.equal(await p.evaluate(()=>__testEngine.followTarget===followA),true);
   if(depth==='depth'){
    const before=await p.evaluate(()=>__testEngine.camera.yaw);await p.mouse.move(pos.x,pos.y);await p.mouse.down();await p.mouse.move(pos.x+70,pos.y+20,{steps:6});await p.mouse.up();await waitClick();
    assert.notEqual(await p.evaluate(()=>__testEngine.camera.yaw),before);assert.equal(await p.evaluate(()=>__testEngine.followTarget===followA),true);
   }
   await p.evaluate(()=>{__testEngine.setConfig({...__testEngine.config,pointer:'none'});__testEngine.draw()});assert.equal(await p.evaluate(()=>__testEngine.followTarget),null);
   await p.mouse.click(pos.x,pos.y);await waitClick();assert.equal(await p.evaluate(()=>__testEngine.followTarget),null);
   await p.evaluate(()=>{const e=__testEngine;e.setConfig({...e.config,pointer:'magnify'});e.followTarget=followA;e.particles=e.particles.filter(p=>p!==followA);e.draw()});assert.equal(await p.evaluate(()=>__testEngine.followTarget),null);
   console.log('PASS',width,scene,depth,'selection, enlarged hit test, moving follow, ESC, double-click, drag and mode/removal cleanup');
  }
  const merged=await p.evaluate(()=>{
   const e=__testEngine;e.setScene('cosmos',{pointer:'magnify',mutualGravity:0,collisions:'merge',influx:'no'});e.reset(false);e.setPaused(true);
   const a={...e.model.create(e),x:e.world.width/2,y:e.world.height/2,z3:e.world.depth/2,vx:.1,vy:0,vz:0,mass:1};
   const unit=Math.min(e.width,e.height)/e.scale/900;
   const b={...a,x:a.x+unit,vx:-.1};e.particles=[a,b];e.followTarget=a;e.step();e.draw();return e.followTarget===e.particles[0]&&e.followTarget.mass===2;
  });assert.ok(merged);
  assert.deepEqual(errors,[]);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
