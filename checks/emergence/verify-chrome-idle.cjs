const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const [width,height] of [[2010,1015],[390,844]]){
 const context=await browser.newContext({viewport:{width,height}}),origin='http://127.0.0.1:4328';
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 await context.route('**/api/shiyu/auth/wechat/qr**',r=>r.fulfill({json:{}}));
 await context.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true},{id:'emergence',enabled:true,allowed:true}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
 await context.addInitScript(()=>{localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode:'dark',color:'#b7698b',brandGuideDismissed:true},signed:false}));localStorage.setItem('shiyu-emergence-v1:guest',JSON.stringify({scene:'gravity',configs:{gravity:{count:10000},birds:{predators:0}}}));});
 await context.route('**/assets/emergence/shell.js',r=>r.fulfill({contentType:'text/javascript',body:require('node:fs').readFileSync('dist/assets/emergence/shell.js','utf8').replace('engine.setPaused(paused);','engine.setPaused(paused);window.__emergenceEngine=engine;')}));
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(origin);await page.evaluate(async()=>{await window.ShiyuFeatureConfig?.refresh();await document.fonts.ready;});
 await page.waitForSelector('.emergence-shortcuts');
 await page.mouse.move(450,450);await page.waitForTimeout(1000);
 assert.ok(Number(await page.locator('.emergence-shortcuts').evaluate(n=>getComputedStyle(n).opacity))<=.51);
 if(width===2010){
 await page.waitForFunction(()=>document.body.classList.contains('global-chrome-idle'),{},{timeout:15000});await page.waitForTimeout(1000);
 assert.equal(await page.locator('.emergence-shortcuts').evaluate(n=>getComputedStyle(n).opacity),'0');
 for(const selector of ['header .header-right','.utility-search','.scroll-invitation','.world-entry']){const nodes=page.locator(selector);if(await nodes.count())assert.equal(await nodes.first().evaluate(n=>getComputedStyle(n).opacity),'0',selector);}
 assert.equal(await page.locator('header > .brand-discovery').evaluate(n=>getComputedStyle(n).opacity),'0.03');
 await page.screenshot({path:'checks/emergence/chrome-idle.png'});

 await page.mouse.move(460,450);await page.waitForTimeout(1000);
 assert.equal(await page.locator('.emergence-shortcuts').evaluate(n=>getComputedStyle(n).opacity),'0.5');
 assert.equal(await page.locator('header .header-right').evaluate(n=>getComputedStyle(n).opacity),'1');
 await page.screenshot({path:'checks/emergence/chrome-awake.png'});
 }
 console.log('BEFORE',await page.evaluate(()=>({buttons:[...document.querySelectorAll('.emergence-scenes [data-emergence-scene]')].map(n=>n.dataset.emergenceScene),error:document.querySelector('.emergence-error')?.textContent})),errors);await page.locator('.emergence-open').click();
 await page.waitForFunction(()=>document.querySelectorAll('.emergence-scenes [data-emergence-scene]').length===2).catch(async error=>{console.log(await page.evaluate(()=>({error:document.querySelector('.emergence-error')?.textContent,scenes:[...document.querySelectorAll('.emergence-scenes [data-emergence-scene]')].map(n=>n.dataset.emergenceScene)})),errors);throw error;});
 assert.deepEqual(await page.locator('.emergence-scenes [data-emergence-scene]').evaluateAll(nodes=>nodes.map(n=>n.dataset.emergenceScene)),['birds','cosmos']);
 assert.equal(await page.locator('.emergence-scenes [data-emergence-scene="birds"]').getAttribute('aria-pressed'),'true');
 await page.screenshot({path:`checks/emergence/retained-scenes-${width}.png`});
 await page.locator('.emergence-scenes [data-emergence-scene="cosmos"]').click();
 assert.equal(await page.locator('.emergence-scenes [data-emergence-scene="cosmos"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-emergence-action="pause"]').click();
 assert.ok((await page.locator('[data-emergence-action="pause"]').textContent()).includes('继续'));
 assert.equal(await page.locator('.emergence-mass-legend').count(),0);
 assert.equal(await page.locator('[data-emergence-value="magnify"]').count(),0);
 assert.equal(await page.locator('.emergence-caption').evaluate(n=>getComputedStyle(n).opacity),'1');
 await page.mouse.click(5,height*.5);
 await page.waitForFunction(()=>document.querySelector('.emergence-panel').hidden);
 await page.evaluate(()=>{document.body.tabIndex=-1;document.body.focus();});
 const pointer=await page.evaluate(()=>__emergenceEngine.config.pointer);
 await page.keyboard.press('i');
 assert.equal(await page.evaluate(()=>__emergenceEngine.magnifierActive),true);
 assert.equal(await page.evaluate(()=>__emergenceEngine.config.pointer),pointer);
 await page.mouse.click(width*.4,height*.5,{button:'right'});
 assert.equal(await page.evaluate(()=>__emergenceEngine.magnifierActive),false);
 await page.evaluate(()=>document.body.focus());await page.keyboard.press('Space');
 assert.equal(await page.evaluate(()=>__emergenceEngine.paused),false);
 await page.keyboard.press('Space');
 await page.screenshot({path:`checks/emergence/shortcut-footer-${width}.png`});
 assert.ok(await page.locator('.emergence-shortcuts').isVisible());
 await page.evaluate(()=>{const node=document.createElement('footer');node.className='site-filing';node.textContent='测试备案';document.body.append(node);});
 assert.ok(await page.locator('body>.site-filing').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).display==='none')));
 await page.evaluate(()=>document.body.dataset.theme='base');
 assert.ok(await page.locator('body>.site-filing').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).display!=='none')));
 assert.ok(!requests.some(url=>/stars-engine|gravity-engine|gravity-core/.test(url)));
 assert.deepEqual(errors,[]);await context.close();
 console.log('PASS scene retirement, legacy fallback, switching and pause',width);
 }
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
