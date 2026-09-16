const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
let browser;
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1288,height:1041}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/flow-theme.js',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/flow-theme.js','utf8').replace('const FORM_START=10000,FORM_END=30000;','const FORM_START=80,FORM_END=260;')}));
  await page.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});
  await page.evaluate(()=>{signed=true;prefs.flowStyle='form';persist();render();document.querySelector('.brand-guide')?.remove()});
  await page.waitForTimeout(400);
  const first=await page.locator('.flow-cover').evaluate(e=>e.__inspirationSnapshot().particles.map(p=>[p.x,p.y]));
  await page.waitForTimeout(900);
  const second=await page.locator('.flow-cover').evaluate(e=>e.__inspirationSnapshot().particles.map(p=>[p.x,p.y]));
  const formMotion=second.reduce((sum,point,index)=>sum+Math.hypot(point[0]-first[index][0],point[1]-first[index][1]),0)/second.length;
  assert(formMotion>.0003,'a completed form keeps moving gently');
  for(let index=0;index<3;index++){await page.mouse.click(640,780);await page.waitForTimeout(780);}
  assert.equal(await page.locator('.flow-cover').getAttribute('data-next-form'),'地球');
  const earthBefore=await page.locator('.flow-cover').evaluate(e=>e.__inspirationSnapshot().particles.map(p=>[p.x,p.y]));
  await page.waitForTimeout(900);
  const earthAfter=await page.locator('.flow-cover').evaluate(e=>e.__inspirationSnapshot().particles.map(p=>[p.x,p.y]));
  const earthMotion=earthAfter.reduce((sum,point,index)=>sum+Math.hypot(point[0]-earthBefore[index][0],point[1]-earthBefore[index][1]),0)/earthAfter.length;
  assert(earthMotion>.001,'the formed Earth keeps rotating');
  for(let index=0;index<2;index++){await page.mouse.click(640,780);await page.waitForTimeout(780);}
  assert.equal(await page.locator('.flow-cover').getAttribute('data-next-form'),'太阳系');
  assert.equal(await page.locator('.flow-canvas').getAttribute('data-solar-orbits'),'8');
  assert.equal(await page.locator('.flow-canvas').getAttribute('data-solar-bodies'),'9');
  const solarBefore=await page.locator('.flow-cover').evaluate(e=>e.__inspirationSnapshot().particles.map(p=>[p.x,p.y]));
  await page.waitForTimeout(900);
  const solarAfter=await page.locator('.flow-cover').evaluate(e=>e.__inspirationSnapshot().particles.map(p=>[p.x,p.y]));
  const orbitMotion=solarAfter.reduce((sum,point,index)=>sum+Math.hypot(point[0]-solarBefore[index][0],point[1]-solarBefore[index][1]),0)/solarAfter.length;
  assert(orbitMotion>.0008,'the planets visibly orbit the sun');
  await page.screenshot({path:'checks/flow-solar-dynamic.png'});
  assert.deepEqual(errors,[]);
  console.log(`PASS: completed form motion ${formMotion.toFixed(5)}, Earth rotation ${earthMotion.toFixed(5)}, solar orbit motion ${orbitMotion.toFixed(5)}, eight thin orbits and nine bodies.`);
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
