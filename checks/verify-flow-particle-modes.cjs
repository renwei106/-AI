const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
let browser;
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1288,height:1041}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});
  await page.evaluate(()=>{signed=true;prefs.flowStyle='chaos';persist();render();document.querySelector('.brand-guide')?.remove()});
  const canvas=page.locator('.flow-canvas'),cover=page.locator('.flow-cover');
  const base=Number(await canvas.getAttribute('data-base-particles')),snow=Number(await canvas.getAttribute('data-snow-particles')),dense=Number(await canvas.getAttribute('data-dense-particles'));
  assert(snow>base&&snow<dense*.45,'snow uses a visibly lighter particle budget than tide');assert(dense>base*2,'tide keeps its dedicated high-density particle budget');
  async function trace(mode,style){
    await page.evaluate(mode=>document.querySelector('.flow-cover').__setInspirationMode(mode),mode);await page.waitForTimeout(190);
    await page.mouse.move(110,650);await page.mouse.move(1050,610,{steps:24});
    assert.equal(await canvas.getAttribute('data-trace-style'),style);assert(Number(await canvas.getAttribute('data-traces'))>2,mode+' leaves its own pointer trail');
  }
  await trace('chaos','chaos');await trace('form','form');assert.equal(await canvas.getAttribute('data-trace-glyph'),await canvas.getAttribute('data-formation-name'),'formation trails use the same glyph as the active target');await trace('snow','snow');
  assert.equal(Number(await canvas.getAttribute('data-particles')),snow);assert(Number(await canvas.getAttribute('data-snow-max-depth'))>=1041*.33,'snow can build to one third of the viewport');
  await page.screenshot({path:'checks/flow-mode-snow-dense.png'});
  await page.evaluate(()=>document.querySelector('.flow-cover').__setInspirationMode('tide'));await page.waitForTimeout(190);assert.equal(Number(await canvas.getAttribute('data-particles')),dense);assert.equal(await canvas.getAttribute('data-trace-style'),'water');
  await page.mouse.move(120,690);await page.mouse.move(1120,610,{steps:24});assert(Number(await canvas.getAttribute('data-ripples'))>5);assert.equal(await canvas.getAttribute('data-ripple-layers'),'2');
  await page.screenshot({path:'checks/flow-mode-tide-dense.png'});
  assert.equal(await cover.getAttribute('data-particle-mode'),'tide');assert.deepEqual(errors,[]);
  console.log(`PASS: ${base} base / ${snow} sparse snow / ${dense} dense tide particles, one-third snow capacity, and distinct mode trails.`);
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
