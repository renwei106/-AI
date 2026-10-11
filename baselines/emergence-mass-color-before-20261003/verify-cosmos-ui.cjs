const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [width,height,mode] of [[2066,1070,'dark'],[1550,781,'light'],[390,844,'dark']]){
  const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),origin='http://127.0.0.1:4328';
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());await c.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
  await c.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled:true,allowed:true,memberOnly:false}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
  await c.route('**/assets/emergence/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8').replace('this.canvas = canvas;','window.__testEngine=this; this.canvas = canvas;')}));
  await c.addInitScript(mode=>{if(!sessionStorage.getItem('cosmos-seeded')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode,brandGuideDismissed:true},signed:false}));localStorage.setItem('shiyu-emergence-v1:guest',JSON.stringify({scene:'cosmos',configs:{cosmos:{count:650,centers:1}}}));sessionStorage.setItem('cosmos-seeded','yes');}},mode);
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);
  const ready=async()=>{await p.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready;});await p.waitForFunction(()=>window.__testEngine&&!__testEngine.destroyed&&document.documentElement.classList.contains('shiyu-account-ready'));await p.waitForTimeout(250);};await ready();
  assert.equal(await p.evaluate(()=>__testEngine.config.mutualGravity),.7);assert.equal(await p.evaluate(()=>__testEngine.config.collisions),'auto');assert.equal(await p.locator('.emergence-rules li').count(),4);
  const panel=p.locator('#emergence-panel');await p.locator('.emergence-open').click();
  await panel.locator('summary').filter({hasText:'星体引力'}).click();const gravity=p.locator('#emergence-mutualGravity');await gravity.press('ArrowRight');
  await p.locator('[data-emergence-field="massAppearance"][data-emergence-value="color"]').click();
  await panel.locator('summary').filter({hasText:'碰撞演化'}).click();assert.equal(await panel.locator('details[open]').count(),1);
  await p.locator('[data-emergence-field="collisions"][data-emergence-value="merge"]').click();assert.match(await p.locator('.emergence-rules').innerText(),/相撞时合并/);
  assert.equal(await p.locator('#emergence-mergeOverlap').inputValue(),'65');await p.locator('#emergence-mergeOverlap').press('ArrowRight');await p.locator('#emergence-mergeCooldown').press('ArrowRight');
  await p.locator('#emergence-fragmentGrace').press('ArrowRight');await p.screenshot({path:`checks/emergence/cosmos-controls-${width}-${mode}.png`});
  await p.locator('[data-emergence-field="collisions"][data-emergence-value="off"]').click();assert.match(await p.locator('.emergence-rules').innerText(),/不发生碰撞/);
  await p.locator('[data-emergence-field="collisions"][data-emergence-value="auto"]').click();await p.locator('[data-emergence-action="close"]').click();
  await p.reload();await ready();assert.equal(await p.evaluate(()=>__testEngine.config.mutualGravity),.75);assert.equal(await p.evaluate(()=>__testEngine.config.massAppearance),'color');assert.equal(await p.evaluate(()=>__testEngine.config.fragmentGrace),2.5);assert.equal(await p.evaluate(()=>__testEngine.config.mergeOverlap),70);assert.equal(await p.evaluate(()=>__testEngine.config.mergeCooldown),3.5);
  // Observe an evolved real simulation, without changing the saved settings.
  await p.evaluate(()=>{const e=__testEngine;for(let i=0;i<900;i++)e.step();e.draw();});
  const stats=await p.evaluate(()=>({count:__testEngine.particles.length,mass:__testEngine.particles.reduce((s,p)=>s+p.mass,0),merged:__testEngine.merged,shattered:__testEngine.shattered,max:Math.max(...__testEngine.particles.map(p=>p.mass))}));assert(Math.abs(stats.mass-650)<1e-7);assert(stats.merged>0);await p.screenshot({path:`checks/emergence/cosmos-evolved-${width}-${mode}.png`});
  await p.locator('.emergence-open').click();await p.waitForTimeout(1100);assert.match(await p.locator('.emergence-cosmos-status').innerText(),/最大质量/);
  await p.locator('#emergence-centers').press('Home');assert.equal(await p.evaluate(()=>__testEngine.config.centers),0);
  await p.locator('[data-emergence-field="depth"][data-emergence-value="depth"]').click();assert.equal(await p.evaluate(()=>__testEngine.is3D),true);assert(Math.abs(await p.evaluate(()=>__testEngine.particles.reduce((s,p)=>s+p.mass,0))-650)<1e-7);
  await p.locator('[data-emergence-field="pointer"][data-emergence-value="magnify"]').click();await p.locator('[data-emergence-action="close"]').click();await p.mouse.move(width*.55,height*.5);await p.screenshot({path:`checks/emergence/cosmos-3d-${width}-${mode}.png`});
  assert.deepEqual(errors,[]);console.log('PASS cosmic controls, legacy defaults, persistence, evolving mass, 2D/3D, magnifier',width,mode,stats);await c.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
