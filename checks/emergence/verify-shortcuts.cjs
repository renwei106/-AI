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

  const mode=()=>p.evaluate(()=>__testEngine.config.pointer);
  const choose=async(key,value)=>p.locator(`[data-emergence-field="${key}"][data-emergence-value="${value}"]`).click();
  await p.evaluate(()=>__testEngine.setPaused(true));
  await p.mouse.move(width*.55,height*.55);
  await p.keyboard.press('m');assert.equal(await mode(),'repel');
  for(const expected of ['attract','magnify','none','repel']){await p.keyboard.press('i');assert.equal(await mode(),expected);}
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('shiyu-emergence-v1:guest')).configs.birds.pointer),'repel');
  await p.keyboard.press('i');await p.keyboard.press('i');
  assert.equal(await p.locator('.emergence-interaction-status').innerText(),'鼠标互动 · 放大镜');
  assert.equal(await p.evaluate(()=>__testEngine.paused),true);
  assert.equal(await p.evaluate(()=>__testEngine.pointer.active),true);
  await p.screenshot({path:`checks/emergence/shortcuts-lens-${width}.png`});
  // No repeats, IME, modified keys or editable targets may change the scene.
  await p.keyboard.press('Control+i');await p.keyboard.press('Alt+i');await p.keyboard.press('Shift+i');
  await p.evaluate(()=>{for(const props of [{repeat:true},{isComposing:true}])document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'i',bubbles:true,...props}));});
  assert.equal(await mode(),'magnify');
  await p.evaluate(()=>{const input=document.createElement('input');input.id='shortcut-input';document.body.append(input);input.focus();});
  await p.keyboard.type('i');assert.equal(await mode(),'magnify');assert.equal(await p.locator('#shortcut-input').inputValue(),'i');
  await p.evaluate(()=>document.querySelector('#shortcut-input').remove());
  await p.evaluate(()=>{const el=document.createElement('div');el.id='shortcut-edit';el.contentEditable='true';document.body.append(el);el.focus();});
  await p.keyboard.type('i');assert.equal(await mode(),'magnify');await p.evaluate(()=>document.querySelector('#shortcut-edit').remove());
  await p.evaluate(()=>{const d=document.createElement('dialog');d.id='shortcut-dialog';d.innerHTML='<button>test</button>';document.body.append(d);d.showModal();});
  await p.keyboard.press('i');assert.equal(await mode(),'magnify');await p.evaluate(()=>document.querySelector('#shortcut-dialog').remove());
  await p.locator('.emergence-open').click();
  await p.keyboard.press('i');assert.equal(await mode(),'none');
  assert.equal(await p.locator('[data-emergence-field="pointer"][data-emergence-value="none"]').getAttribute('aria-pressed'),'true');
  await choose('pointer','attract');assert.equal(await mode(),'attract');
  assert.equal(await p.locator('.emergence-interaction-status').innerText(),'鼠标互动 · 吸引');
  await choose('depth','depth');await p.keyboard.press('i');assert.equal(await mode(),'none');
  await p.keyboard.press('i');assert.equal(await mode(),'magnify');
  await p.keyboard.press('i');assert.equal(await mode(),'none');
  await p.screenshot({path:`checks/emergence/shortcuts-panel-${width}.png`});
  await p.locator('[data-emergence-scene="cosmos"]').click();
  await choose('depth','flat');await choose('pointer','repel');
  assert.equal(await p.locator('.emergence-interaction-status').innerText(),'鼠标互动 · 推开');
  await p.keyboard.press('i');assert.equal(await mode(),'attract');
  assert.equal(await p.locator('.emergence-interaction-status').innerText(),'鼠标互动 · 牵引');
  await p.keyboard.press('i');
  await p.evaluate(()=>{__testEngine.setPaused(true);__testEngine.followTarget=__testEngine.particles[0];});
  await p.keyboard.press('i');assert.equal(await p.evaluate(()=>__testEngine.followTarget),null);assert.equal(await p.evaluate(()=>__testEngine.paused),true);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(2300);assert.equal(await p.locator('.emergence-interaction-status').evaluate(el=>el.matches(':popover-open')),false);
  await p.evaluate(()=>{prefs.mode='light';render();});await p.keyboard.press('i');
  await p.screenshot({path:`checks/emergence/shortcuts-light-${width}.png`});
  await p.reload();await ready();assert.equal(await mode(),'repel');
  await p.evaluate(()=>document.body.dataset.view='space');await p.keyboard.press('i');assert.equal(await mode(),'repel');
  await c.route('**/api/shiyu/operations',async route=>{const response=await route.fetch();const content=await response.json();content.emergenceContent.allowCustomize=false;await route.fulfill({json:content});});
  await p.reload();await ready();const managedMode=await mode();await p.keyboard.press('i');assert.equal(await mode(),managedMode);
  assert.deepEqual(errors,[]);console.log('PASS single mode shortcut, toast, UI sync, follow cleanup, input/modifier/IME/modal guards and persistence',width);
  await c.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
