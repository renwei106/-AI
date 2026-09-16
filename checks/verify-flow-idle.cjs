const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
let browser;
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1288,height:1041}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/flow-theme.js',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/flow-theme.js','utf8').replace('const CHROME_IDLE_AFTER=10000;','const CHROME_IDLE_AFTER=300;')}));
  await page.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.querySelector('.brand-guide')?.remove());
  await page.waitForFunction(()=>document.body.classList.contains('global-chrome-idle'));
  await page.waitForTimeout(950);
  for(const selector of ['header','.scroll-invitation','.utility-search','.dock-trigger','.mode-pull-cord','.color-pull-cord'])assert(Number(await page.locator(selector).evaluate(e=>getComputedStyle(e).opacity))<.25,selector+' fades while idle');
  assert(Number(await page.locator('.dock-trigger').evaluate(e=>getComputedStyle(e).opacity))<.05,'the space entry becomes nearly invisible so it does not interfere with the bottom form');
  await page.screenshot({path:'checks/flow-idle.png'});
  await page.mouse.move(420,610);
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('global-chrome-idle')),false);
  for(let i=0;i<10;i++){await page.mouse.move(420+i%2,610);await page.waitForTimeout(100);}
  assert(Number(await page.locator('header').evaluate(e=>getComputedStyle(e).opacity))>.9,'chrome fades back in smoothly');
  await page.evaluate(()=>{scope='global';changeTheme('reading')});
  await page.locator('.reading-gallery').waitFor();
  await page.waitForFunction(()=>document.body.classList.contains('global-chrome-idle'));
  await page.waitForTimeout(950);
  assert(Number(await page.locator('header').evaluate(e=>getComputedStyle(e).opacity))<.25,'idle fading applies to other themes too');
  assert.deepEqual(errors,[]);
  console.log('PASS: chrome dims after idle and returns on movement across themes.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
