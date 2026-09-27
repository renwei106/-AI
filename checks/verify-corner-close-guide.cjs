const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1375,height:992}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/api/shiyu/auth/**',route=>route.fulfill({status:route.request().url().includes('/wechat/')?200:503,json:{}}));
    await page.goto('http://127.0.0.1:4337/',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>{signed=true;prefs.accountProfile={id:'close-guide-a'};localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));render()});
    await page.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');
    const shelf=page.frameLocator('#corner-orbit-demo');
    const enter=async()=>{const box=await shelf.locator('.core-hit').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForSelector('#my-corner[open]')};
    const close=async()=>{await page.locator('.corner-close-entry').click();await page.waitForFunction(()=>!document.querySelector('#my-corner').open)};
    await enter();
    assert.equal(await page.locator('.corner-close-guide:visible').count(),1,'guide is shown on first entry');
    await page.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));
    await page.screenshot({path:'.local/corner-close-guide.png'});
    await close();
    await enter();
    assert.equal(await page.locator('.corner-close-guide:visible').count(),1,'closing the module does not acknowledge the guide');
    const saved=page.waitForRequest(request=>request.url().endsWith('/api/shiyu/auth/corner-guide')&&request.method()==='POST');
    await page.locator('.corner-close-guide-ack').click();
    assert.equal((await saved).postDataJSON().userId,'close-guide-a');
    assert.equal(await page.locator('.corner-close-guide').count(),0);
    assert.equal(await page.evaluate(()=>prefs.cornerCloseGuideAcknowledgedV1['close-guide-a']),true);
    await close();
    await page.goto('http://127.0.0.1:4337/?corner=memo',{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#my-corner[open][data-corner-module=memo]');
    assert.equal(await page.locator('.corner-close-guide').count(),0,'acknowledgment covers every module after reload');
    await close();
    await page.evaluate(()=>{signed=true;prefs.accountProfile={id:'close-guide-b'};localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));render()});
    await page.goto('http://127.0.0.1:4337/?corner=icons',{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#my-corner[open][data-corner-module=icons]');
    assert.equal(await page.locator('.corner-close-guide:visible').count(),1,'another account gets its own guide');
    await page.locator('.corner-close-guide-dismiss').click();
    assert.equal(await page.evaluate(()=>prefs.cornerCloseGuideAcknowledgedV1['close-guide-b']),true);
    await page.evaluate(()=>{signed=false});
    await page.locator('[data-module-title]').click();
    await page.waitForSelector('#login[open]');
    assert.equal(await page.locator('#my-corner').getAttribute('data-corner-module'),'icons','unsigned users cannot switch into another module');
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('shiyu-account-state',{detail:{authenticated:false}})));
    await page.waitForFunction(()=>!document.querySelector('#my-corner').open);

    const guest=await browser.newPage({viewport:{width:1375,height:992}});
    await guest.route('**/api/shiyu/auth/**',route=>route.fulfill({status:route.request().url().includes('/wechat/')?200:503,json:{}}));
    for(const id of ['common','memo','todo','toolbox','icons','palette','emoji','cutout']){
      await guest.goto('http://127.0.0.1:4337/?corner='+id,{waitUntil:'domcontentloaded'});
      await guest.waitForSelector('#login[open]');
      assert.equal(await guest.locator('#my-corner[open]').count(),0,id+' requires sign-in on direct entry');
    }
    await guest.goto('http://127.0.0.1:4337/',{waitUntil:'domcontentloaded'});
    await guest.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');
    const guestShelf=guest.frameLocator('#corner-orbit-demo');
    await guestShelf.locator('.core').hover({force:true});
    await guestShelf.locator('.stage.is-filled').waitFor();
    await guestShelf.locator('[data-shiyu-module-id=memo]').click();
    await guest.waitForSelector('#login[open]');
    assert.equal(await guest.locator('#my-corner[open]').count(),0,'clicking a tool from the home shelf requires sign-in');
    const cloud=await browser.newPage({viewport:{width:1375,height:992}});
    await cloud.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{accountProfile:{id:'cloud-guide-check'}}})));
    await cloud.route('**/api/shiyu/auth/session',route=>route.fulfill({status:200,json:{authenticated:true,user:{id:'cloud-guide-check',name:'测试用户',phone:'',cornerUiHints:{closeGuideAcknowledgedAt:'2026-09-27 12:00'}}}}));
    await cloud.route('**/api/shiyu/auth/account',route=>route.fulfill({status:503,json:{}}));
    await cloud.goto('http://127.0.0.1:4337/?corner=memo',{waitUntil:'domcontentloaded'});
    await cloud.waitForFunction(()=>prefs.cornerCloseGuideAcknowledgedV1?.['cloud-guide-check']===true);
    await cloud.waitForSelector('#my-corner[open][data-corner-module=memo]');
    assert.equal(await cloud.locator('.corner-close-guide').count(),0,'server-side UI hint is restored on another browser');
    await cloud.close();
    assert.deepEqual(errors,[]);
    console.log('PASS: first-entry close guide requires explicit acknowledgment, stays per account, and all module routes require login');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
