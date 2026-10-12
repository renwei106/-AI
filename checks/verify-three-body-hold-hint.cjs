const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:2066,height:1070}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',brandGuideDismissed:true},signed:false})));
 await page.route('**/api/**',route=>{
  const path=new URL(route.request().url()).pathname;
  return route.fulfill({json:path.endsWith('/theme-access')?{items:['base','threeBody'].map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:path.endsWith('/operations')?{onboarding:{enabled:false},world:{enabled:false}}:{}});
 });
 await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1200);

 await page.evaluate(()=>{prefs.theme='threeBody';render();});
 await page.waitForFunction(()=>window.ShiyuThreeBodyScene?.snapshot().loaded);

 assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().initialTapAvailable),true);assert.ok(await page.locator('.three-body-actions').textContent().then(t=>t.includes('长按加速')));await page.mouse.move(500,700);await page.mouse.down();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().accelerating),true);await page.mouse.up();assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().accelerating),false);
 await page.evaluate(()=>document.querySelector('[data-three-pause]').click());
 assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().paused),true);
 const before=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().bodies);await page.mouse.click(500,700);await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().bodies),before);assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().initialTapAvailable),true);
 const hint=page.locator("[data-three-initial-tap]");assert.equal(await hint.evaluate(b=>b.parentElement.classList.contains("home-threeBody")),true);await hint.click();assert.equal(await hint.isVisible(),false);await page.waitForTimeout(400);
 const after=await page.evaluate(()=>ShiyuThreeBodyScene.snapshot());assert.equal(after.initialTapAvailable,false);assert.notEqual(before[0].vx,after.bodies[0].vx);assert.deepEqual(before.slice(1),after.bodies.slice(1));
 assert.ok(Math.hypot(after.bodies[0].vx-before[0].vx,after.bodies[0].vy-before[0].vy)<.03);
 await page.mouse.click(600,700);await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().bodies),after.bodies);
 assert.deepEqual(errors,[]);console.log('PASS initial single tap subtly changes one body; repeated tap does nothing.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
