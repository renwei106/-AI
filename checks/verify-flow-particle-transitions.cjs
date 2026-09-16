const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
let browser;
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1288,height:1041}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});await page.evaluate(()=>{signed=true;prefs.flowStyle='chaos';persist();render();document.querySelector('.brand-guide')?.remove()});
  const canvas=page.locator('.flow-canvas'),cover=page.locator('.flow-cover'),base=Number(await canvas.getAttribute('data-base-particles')),dense=Number(await canvas.getAttribute('data-dense-particles'));
  const copy=await page.locator('.flow-copy').boundingBox();assert(copy.y+copy.height/2<1041*.32,'all four states share the raised copy position');
  await page.evaluate(()=>document.querySelector('.flow-cover').__setInspirationMode('tide'));
  const entry=await cover.evaluate((e,base)=>e.__inspirationSnapshot().particles.slice(base),base),above=entry.filter(p=>p.baseY<0).length/entry.length,left=entry.filter(p=>p.baseX<.2).length,right=entry.filter(p=>p.baseX>.8).length;
  assert(above>.9&&left>entry.length*.4&&right>entry.length*.4,'new tide particles pour down from both upper inlets');assert(entry.every(p=>p.birth===0),'the extra tide particles begin transparent');assert.equal(Number(await canvas.getAttribute('data-particles')),dense);
  await page.waitForTimeout(1500);const entering=await cover.evaluate((e,base)=>e.__inspirationSnapshot().particles.slice(base),base);assert(entering.some(p=>p.birth>0)&&entering.some(p=>p.birth===0),'water enters progressively instead of appearing together');
  await page.evaluate(()=>document.querySelector('.flow-cover').__setInspirationMode('chaos'));assert.equal(Number(await canvas.getAttribute('data-retiring-particles')),dense-base);assert.equal(Number(await canvas.getAttribute('data-particles')),dense,'excess particles remain while fading');
  await page.waitForTimeout(1600);const fading=await cover.evaluate((e,base)=>e.__inspirationSnapshot().particles.slice(base),base);assert(fading.every(p=>p.retiring)&&fading.some(p=>p.retireAge>1),'excess particles fade in place over time');
  await page.waitForTimeout(2100);assert.equal(Number(await canvas.getAttribute('data-particles')),base);assert.equal(Number(await canvas.getAttribute('data-retiring-particles')),0);assert.deepEqual(errors,[]);
  console.log('PASS: raised copy, two-sided overhead water ingress, progressive appearance, and shrinking particle retirement.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
