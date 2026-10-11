const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const origin='http://127.0.0.1:4328';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const results={};
 for(const viewport of [{width:1711,height:1015},{width:1440,height:900},{width:390,height:844}])for(const mode of ['light','dark']){
  const c=await browser.newContext({viewport});
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await c.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
  await c.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled:true,allowed:true,memberOnly:false}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
  await c.route('**/assets/emergence/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8').replace('this.canvas = canvas;','window.__testEngine=this; this.canvas = canvas;')}));
  await c.addInitScript(mode=>{if(!sessionStorage.getItem('panel-seed')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode,brandGuideDismissed:true},signed:false}));localStorage.setItem('shiyu-emergence-v1:guest',JSON.stringify({scene:'fish',configs:{fish:{shape:'fish',speed:1.15,count:260,depth:'depth'}}}));sessionStorage.setItem('panel-seed','1');}},mode);
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);await p.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready;});await p.waitForFunction(()=>document.documentElement.classList.contains('shiyu-account-ready')&&window.__testEngine&&!window.__testEngine.destroyed);await p.waitForTimeout(300);
  assert.equal(await p.evaluate(()=>__testEngine.scene.id),'birds');assert.equal(await p.evaluate(()=>__testEngine.config.shape),'fish');assert.equal(await p.evaluate(()=>__testEngine.config.speed),1.15);assert.equal(await p.evaluate(()=>__testEngine.is3D),true);
  const copy=await p.locator('.emergence-copy').boundingBox();assert(copy.x<viewport.width*.15);assert.equal(await p.locator('.emergence-copy h1').innerText(),'聚散之间，\n自有默契。');
  await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();assert.equal(await p.locator('button[data-emergence-scene]').count(),2);assert.equal(await p.locator('.emergence-scene-art').count(),2);
  const foot=await p.locator('.emergence-panel-foot').boundingBox(),scroll=p.locator('.emergence-panel-scroll');await p.screenshot({path:`checks/emergence/panel-${viewport.width}-${mode}.png`});
  await scroll.hover();await p.mouse.wheel(0,430);await p.waitForTimeout(250);assert(await scroll.evaluate(e=>e.scrollTop>0),'wheel scrolls the panel');assert.equal(await p.evaluate(()=>view),'home');assert.deepEqual(await p.locator('.emergence-panel-foot').boundingBox(),foot);
  for(const [value,name] of [['bird','鸟形'],['fish','鱼形'],['triangle','三角']]){await p.getByRole('button',{name,exact:true}).click();assert.equal(await p.evaluate(()=>__testEngine.config.shape),value);}
  await p.getByRole('button',{name:'2D',exact:true}).click();assert.equal(await p.evaluate(()=>__testEngine.is3D),false);await p.getByRole('button',{name:'3D',exact:true}).click();assert.equal(await p.evaluate(()=>__testEngine.is3D),true);
  await p.getByRole('button',{name:'暂停',exact:true}).click();assert.equal(await p.evaluate(()=>__testEngine.paused),true);await p.getByRole('button',{name:'继续',exact:true}).click();assert.equal(await p.evaluate(()=>__testEngine.paused),false);
  await p.getByRole('button',{name:'重新开始',exact:true}).click();assert(await p.evaluate(()=>__testEngine.time<1));
  await p.getByRole('button',{name:'恢复默认',exact:true}).click();assert.equal(await p.evaluate(()=>__testEngine.config.speed),.8);
  await scroll.evaluate(e=>e.scrollTop=0);await p.getByRole('button',{name:'宇宙',exact:true}).click();assert.equal(await p.locator('.emergence-copy h1').innerText(),'彼此牵引，\n各自闪耀。');assert.equal(await p.locator('[data-emergence-field="shape"]').count(),0);
  const style=await p.locator('.emergence-panel').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,blur:getComputedStyle(e).backdropFilter,border:getComputedStyle(e).borderTopWidth}));assert(style.blur.includes('blur'));assert.equal(style.border,'0px');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.getByRole('button',{name:'关闭场景设置',exact:true}).click();await p.reload();await p.waitForFunction(()=>window.__testEngine?.scene.id==='cosmos');assert.equal(await p.locator('.emergence-copy h1').innerText(),'彼此牵引，\n各自闪耀。');
  assert.deepEqual(errors,[]);results[`${viewport.width}-${mode}`]={scroll:true,mergedScene:true,shapes:true,legacyMigration:true,copy:true,actions:true,persistence:true};await c.close();
 }
 fs.writeFileSync('checks/emergence/panel-results.json',JSON.stringify(results,null,2));console.log(results);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
