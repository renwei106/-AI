const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const origin='http://127.0.0.1:4328',out='checks/emergence',results={};
const rights=(enabled=true,allowed=true)=>({items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled,allowed,memberOnly:!allowed}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}});
(async()=>{
 const published=await fetch(origin+'/api/shiyu/operations').then(r=>r.json());assert(published.emergenceContent);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const errors=[];
 async function fixture({viewport={width:1440,height:900},mode='light',theme='emergence',policy=rights(),content=structuredClone(published.emergenceContent),offline=false}={}){
  const c=await browser.newContext({viewport});
  await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await c.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
  await c.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:policy}));
  await c.route('**/api/shiyu/operations',r=>offline?r.fulfill({status:503,json:{}}):r.fulfill({json:{...published,emergenceContent:content}}));
  // Instrument only this test response; production exposes no mutable engine.
  await c.route('**/assets/emergence/engine.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/assets/emergence/engine.js','utf8').replace('this.canvas = canvas;','window.__testEngine=this; this.canvas = canvas;')}));
  await c.addInitScript(({mode,theme})=>{if(!sessionStorage.getItem('emergence-fixture')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme,mode,brandGuideDismissed:true},signed:false}));sessionStorage.setItem('emergence-fixture','1');}},{mode,theme});
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin,{waitUntil:'domcontentloaded'});await p.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready;});return {c,p,content,policy};
 }
 try {
  const {c,p,content}=await fixture();await p.waitForFunction(()=>window.__testEngine?.particles.length>0);
  assert.deepEqual(await p.locator('.emergence-canvas').boundingBox(),{x:0,y:0,width:1440,height:900});
  assert.equal(await p.locator('.scene-caption,#pointer-hint,#rules,#scene-name').count(),0);
  assert.equal(await p.getByText('群游',{exact:true}).isVisible(),false);
  await p.screenshot({path:out+'/integrated-desktop-light.png'});
  await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();
  const bounds=await p.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {panel:rect('.emergence-panel'),header:rect('body>header'),search:rect('.utility-search'),footer:rect('footer')}});
  assert(bounds.panel.top>bounds.header.bottom);assert(bounds.panel.bottom<bounds.search.top);assert(bounds.panel.bottom<bounds.footer.top);
  assert(await p.evaluate(()=>document.elementFromPoint(1298,733)?.closest('.emergence-panel')!==null));
  const speed=p.locator('#emergence-speed');await speed.fill('1.25');assert.equal(await p.evaluate(()=>window.__testEngine.config.speed),1.25);
  await p.getByRole('button',{name:'鱼形',exact:true}).click();assert.equal(await p.evaluate(()=>window.__testEngine.config.shape),'fish');
  await p.getByRole('button',{name:'宇宙',exact:true}).click();assert.equal(await p.locator('#emergence-predators').count(),0);
  await p.getByRole('button',{name:'群游',exact:true}).click();assert.equal(await speed.inputValue(),'1.25');
  await p.screenshot({path:out+'/integrated-desktop-panel.png'});
  await p.getByRole('button',{name:'关闭场景设置',exact:true}).click();
  await p.mouse.move(880,450);await p.mouse.down();await p.waitForTimeout(380);assert.equal(await p.evaluate(()=>window.__testEngine.boost),2);await p.mouse.up();assert.equal(await p.evaluate(()=>window.__testEngine.boost),1);assert.equal(await p.evaluate(()=>window.__testEngine.config.speed),1.25);
  await p.locator('.emergence-canvas').dispatchEvent('pointerdown',{pointerId:8,pointerType:'touch',isPrimary:true,button:0});await p.waitForTimeout(330);assert.equal(await p.evaluate(()=>window.__testEngine.boost),2);await p.locator('.emergence-canvas').dispatchEvent('pointercancel',{pointerId:8,pointerType:'touch'});assert.equal(await p.evaluate(()=>window.__testEngine.boost),1);assert.equal(await p.evaluate(()=>window.__testEngine.pointer.active),false);
  await p.reload();await p.waitForFunction(()=>window.__testEngine?.particles.length>0);assert.equal(await p.evaluate(()=>window.__testEngine.config.speed),1.25);results.savedParametersAndHold=true;
  await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();
  for(const [id,name] of [['birds','群游'],['cosmos','宇宙']]){
   await p.getByRole('button',{name,exact:true}).click();await p.getByRole('button',{name:'3D',exact:true}).click();
   assert.equal(await p.evaluate(()=>__testEngine.is3D),true);assert(await p.locator('[data-emergence-field="pointer"]').first().isDisabled());
   await p.getByRole('button',{name:'关闭场景设置',exact:true}).click();const yaw=await p.evaluate(()=>__testEngine.camera.yaw);
   await p.mouse.move(850,450);await p.mouse.down();await p.waitForTimeout(360);await p.mouse.move(600,490,{steps:10});await p.mouse.up();
   assert.notEqual(await p.evaluate(()=>__testEngine.camera.yaw),yaw);assert.equal(await p.evaluate(()=>__testEngine.boost),1);assert.equal(await p.evaluate(()=>__testEngine.scene.id),id);
   await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();
  }
  await p.getByRole('button',{name:'群游',exact:true}).click();await p.getByRole('button',{name:'2D',exact:true}).click();await p.getByRole('button',{name:'关闭场景设置',exact:true}).click();results.integrated3dScenes=true;
  // Configuration changes apply on focus, including disabled scene fallback and locked defaults.
  content.scenes.birds.enabled=false;content.defaultScene='cosmos';content.allowCustomize=false;content.scenes.cosmos.defaults.speed=.5;
  await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await p.waitForFunction(()=>window.__testEngine?.scene.id==='cosmos');
  assert.equal(await p.evaluate(()=>window.__testEngine.config.speed),.5);await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();assert.equal(await p.locator('.emergence-fields input').count(),0);assert.equal(await p.getByRole('button',{name:'群游',exact:true}).count(),0);results.backendPolicy=true;
  await p.getByRole('button',{name:'关闭场景设置',exact:true}).click();
  await p.locator('.utility-search button').click();await p.waitForSelector('#quick-search[open]');await p.locator('#quick-search [aria-label="关闭搜索"]').click();results.sharedSearch=true;
  await p.evaluate(()=>{window.__oldEngine=window.__testEngine; prefs.theme='base';render();});assert.equal(await p.evaluate(()=>window.__oldEngine.destroyed),true);assert.equal(await p.locator('.emergence-canvas,.emergence-panel').count(),0);results.cleanup=true;
  await p.waitForTimeout(800);const baseAfter=await p.locator('.base-composition').screenshot();await c.close();
  const baseline=await fixture({theme:'base'});await baseline.p.waitForTimeout(500);const baseBefore=await baseline.p.locator('.base-composition').screenshot();fs.writeFileSync(out+'/base-after.png',baseAfter);fs.writeFileSync(out+'/base-before.png',baseBefore);assert(baseAfter.equals(baseBefore),'base theme remains visually unchanged after switching');await baseline.p.locator('.brand').hover();await baseline.p.locator('[data-brand-theme="emergence"]').click();await baseline.p.waitForFunction(()=>window.__testEngine?.scene.id==='birds');await baseline.c.close();results.baseRegression=true;results.sharedThemePicker=true;
  for(const viewport of [{width:1440,height:900},{width:390,height:844}])for(const mode of ['light','dark']){
   const {c,p}=await fixture({viewport,mode});await p.waitForFunction(()=>window.__testEngine?.particles.length>0);await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const overlap=await p.evaluate(()=>{const a=document.querySelector('.emergence-panel').getBoundingClientRect(),b=document.querySelector('body>header').getBoundingClientRect(),s=document.querySelector('.utility-search').getBoundingClientRect();return {overlap:a.top<b.bottom||a.bottom>s.top,panel:a.toJSON(),header:b.toJSON(),search:s.toJSON()}});if(overlap.overlap){console.log(viewport,mode,overlap);await p.screenshot({path:out+'/mobile-overlap.png'});}assert(!overlap.overlap);
   await p.screenshot({path:`${out}/integrated-${viewport.width}-${mode}.png`});await p.getByRole('button',{name:'关闭场景设置',exact:true}).click();await c.close();
  }results.responsive=true;
  const expired=rights(true,false);expired.previews={emergence:{remainingMs:0,started:false,expired:true}};
  for(const policy of [rights(false,false),expired]){
   const {c,p}=await fixture({policy});await p.waitForTimeout(900);assert.equal(await p.locator('.emergence-canvas').count(),0);assert.equal(await p.evaluate(()=>effective().theme),'base');await c.close();
  }results.accessEnforced=true;
  const offline=await fixture({offline:true});await offline.p.waitForSelector('.emergence-error button');assert.equal(await offline.p.evaluate(()=>!!window.__testEngine),false);await offline.c.close();results.missingConfigFailsClosed=true;
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/integration-results.json',JSON.stringify(results,null,2));console.log(results);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
