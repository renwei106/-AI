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

  const prey=p.locator('[data-emergence-role="prey"]'),predator=p.locator('[data-emergence-role="predator"]');
  assert.equal(await prey.getAttribute('aria-selected'),'true');
  for(const role of ['predator','prey']){
    await p.locator(`[data-emergence-role="${role}"]`).click();
    const sections=p.locator(`#emergence-role-${role} details`);
    assert.equal(await sections.count(),3);
    assert.deepEqual(await sections.evaluateAll(els=>els.map(el=>el.open)),[true,false,false]);
    for(const index of [1,2,0]){
      await sections.nth(index).locator('summary').click();
      assert.deepEqual(await sections.evaluateAll(els=>els.map(el=>el.open)),[0,1,2].map(i=>i===index));
    }
    await sections.first().locator('summary').click();
    assert.deepEqual(await sections.evaluateAll(els=>els.map(el=>el.open)),[false,false,false]);
    await sections.first().locator('summary').click();
  }
  const appearance=await p.locator('.emergence-fields > .emergence-group').first().innerHTML();
  const fieldsBefore=await p.locator('[data-emergence-field]').evaluateAll(els=>[...new Set(els.map(el=>el.dataset.emergenceField))].sort());
  await p.evaluate(()=>{window.roleEngine=__testEngine;window.roleParticle=__testEngine.particles[0];window.roleConfig=JSON.stringify(__testEngine.config)});
  assert.equal(await p.locator('#emergence-role-predator').isVisible(),false);
  await predator.click();
  assert.equal(await p.locator('#emergence-role-prey').isVisible(),false);
  assert.equal(await p.locator('#emergence-predators').isVisible(),true);
  assert.equal(await p.locator('#emergence-huntSpeed').isVisible(),true);
  assert.equal(await p.evaluate(()=>roleEngine===__testEngine&&roleParticle===__testEngine.particles[0]&&roleConfig===JSON.stringify(__testEngine.config)),true);
  assert.equal(await p.locator('.emergence-fields > .emergence-group').first().innerHTML(),appearance);
  assert.equal(await p.locator('#emergence-role-predator details[open]').count(),1);
  await p.locator('#emergence-predators').fill('0');await p.locator('#emergence-predators').dispatchEvent('input');
  assert.equal(await p.evaluate(()=>__testEngine.predators.length),0);
  await p.locator('#emergence-role-predator summary').filter({hasText:'捕食者繁衍'}).click();
  await p.locator('#emergence-predatorBirthInterval').fill('360');await p.locator('#emergence-predatorBirthInterval').dispatchEvent('input');
  await p.locator('#emergence-role-predator summary').filter({hasText:'探索规则'}).click();
  assert.equal(await p.locator('#emergence-role-predator details[open]').count(),1);
  await p.locator('#emergence-huntRest').fill('6');await p.locator('#emergence-huntRest').dispatchEvent('input');
  await predator.scrollIntoViewIfNeeded();await p.screenshot({path:'checks/emergence/role-predator-'+width+'.png'});
  await prey.click();await p.locator('#emergence-count').fill('440');await p.locator('#emergence-count').dispatchEvent('input');
  assert.equal(await p.evaluate(()=>__testEngine.config.predatorBirthInterval),360);
  await p.locator('#emergence-role-prey summary').filter({hasText:'探索规则'}).click();
  await p.locator('[data-emergence-field="shape"][data-emergence-value="fish"]').click();
  assert.equal(await p.locator('#emergence-current').isVisible(),true);
  await p.locator('[data-emergence-field="shape"][data-emergence-value="triangle"]').click();
  assert.equal(await p.locator('#emergence-current').isVisible(),false);
  await p.locator('#emergence-role-prey summary').filter({hasText:'探索规则'}).click();
  await prey.scrollIntoViewIfNeeded();await p.screenshot({path:'checks/emergence/role-prey-'+width+'.png'});
  await prey.focus();await p.keyboard.press('ArrowRight');assert.equal(await predator.getAttribute('aria-selected'),'true');
  await p.keyboard.press('Home');assert.equal(await prey.getAttribute('aria-selected'),'true');
  await p.reload();await ready();assert.deepEqual(await p.evaluate(()=>[__testEngine.config.predators,__testEngine.config.predatorBirthInterval,__testEngine.config.huntRest,__testEngine.config.count]),[0,360,6,440]);
  await p.locator('.emergence-open').click();
  assert.deepEqual(await p.locator('[data-emergence-field]').evaluateAll(els=>[...new Set(els.map(el=>el.dataset.emergenceField))].sort()),fieldsBefore);
  await p.locator('[data-emergence-scene="cosmos"]').click();assert.equal(await p.locator('[role="tablist"]').count(),0);assert.equal(await p.locator('#emergence-speed').isVisible(),true);
  await p.locator('[data-emergence-scene="birds"]').click();await predator.click();await p.locator('[data-emergence-action="reset"]').click();
  assert.deepEqual(await p.evaluate(()=>[__testEngine.config.predators,__testEngine.config.count]),[1,420]);
  assert.deepEqual(errors,[]);console.log('PASS role tabs, no restart, all fields, disclosure, persistence, keyboard, cosmos unchanged',width,dpr);await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
