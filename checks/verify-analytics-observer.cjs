const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage(),batches=[],errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install({time:new Date('2026-09-28T10:00:00+08:00')});
    await page.route('**/analytics-fixture',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html><body data-view="home"><main>原有页面内容</main><aside class="desktop-pet"></aside><script>const prefs={theme:'base',font:'youfeng',color:'#48614c',mode:'system',accountProfile:{gender:'private'},privateNote:'PRIVATE_NOTE',privateBookmark:'https://private.example.invalid'};const signed=false;function effective(){return prefs}const THEMES={base:{name:'基础风格'}};window.SHIYU_LOCALE_STATE={country:'CN'};window.ShiyuDesktopPet={state:{enabled:true,skin:'cat'},read(){return this.state}};</script><script src="/analytics.js"></script></body></html>`}));
    await page.route('**/api/shiyu/auth/analytics',async route=>{batches.push(...route.request().postDataJSON().events);await route.fulfill({status:202,contentType:'application/json',body:'{"accepted":true}'});});
    await page.goto(''+(process.env.ANALYTICS_FRONT_QA_URL || 'http://127.0.0.1:4341')+'/analytics-fixture');
    await page.clock.runFor(2000);await page.waitForTimeout(100);
    assert(batches.some(e=>e.kind==='preference'&&e.props.petEnabled===true));
    await page.evaluate(()=>{window.ShiyuDesktopPet.state.enabled=false;document.querySelector('.desktop-pet').hidden=true;});
    await page.clock.runFor(5000);await page.waitForTimeout(100);
    assert(batches.some(e=>e.kind==='preference'&&e.props.petEnabled===false&&e.props.petVisible===false));
    await page.clock.runFor(15000);await page.waitForTimeout(100);
    assert(batches.some(e=>e.kind==='usage'));
    const activeCount=batches.filter(e=>e.kind==='usage').length;
    await page.evaluate(()=>Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'}));
    await page.clock.runFor(30000);await page.waitForTimeout(100);
    assert.equal(batches.filter(e=>e.kind==='usage').length,activeCount);
    assert(!JSON.stringify(batches).includes('PRIVATE_NOTE'));assert(!JSON.stringify(batches).includes('private.example.invalid'));
    assert(batches.every(e=>!('userId' in e)));assert.equal(await page.locator('main').textContent(),'原有页面内容');assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,observations:batches.length,checks:['pet enabled and disabled','visible activity only','private fields excluded','no client identity','page unchanged']}));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
