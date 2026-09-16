const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const names=['城堡','鲨影','远行','地球','银河','太阳系','玫瑰','奔马','飞鸟','帆船','埃菲尔铁塔','飞机','上海天际线','东方明珠','金字塔','蒲公英'];
let browser;
(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1288,height:1041}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/flow-theme.js',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync('dist/flow-theme.js','utf8').replace('const FORM_START=10000,FORM_END=30000;','const FORM_START=20,FORM_END=120;').replace('if(now-lastGesture>700){','if(now-lastGesture>30){')}));
  await page.goto('http://127.0.0.1:4318/?theme=flow',{waitUntil:'networkidle'});
  await page.evaluate(()=>{signed=true;prefs.flowStyle='form';persist();render();document.querySelector('.brand-guide')?.remove()});
  const canvas=page.locator('.flow-canvas-back'),cover=page.locator('.flow-cover');await page.waitForTimeout(190);
  assert.equal(await canvas.getAttribute('data-formation-name'),names[0]);assert.equal(await cover.getAttribute('data-form-locked'),'true');assert.equal(await page.locator('.flow-canvas-front').count(),1);assert(Number(await canvas.getAttribute('data-front-particles'))>200,'a foreground particle layer crosses the translucent copy');assert(Number(await page.locator('.flow-copy h1').evaluate(element=>getComputedStyle(element).opacity))<1);
  await page.mouse.move(70,560);await page.mouse.move(180,560);await page.waitForTimeout(90);assert.equal(await canvas.getAttribute('data-formation-name'),names[0],'moving outside the completed shape leaves it locked');
  for(let index=1;index<names.length;index++){const point=await cover.evaluate(element=>element.__inspirationSnapshot().particles.find(p=>p.y>.57&&p.y<.84)||element.__inspirationSnapshot().particles[0]);await cover.dispatchEvent('pointerleave');const y=point.y*1041,x=Math.max(30,Math.min(1258,point.x*1288));await page.mouse.move(Math.max(20,x-34),y);await page.waitForTimeout(40);await page.mouse.move(Math.min(1268,x+34),y);await page.waitForTimeout(155);assert.equal(await canvas.getAttribute('data-formation-name'),names[index]);assert.equal(Number(await canvas.getAttribute('data-formation')),1);}
  const base=Number(await canvas.getAttribute('data-base-particles')),dense=Number(await canvas.getAttribute('data-dense-particles'));assert(dense>base*3.5,'tide has enough particles to fill the lower pool');
  await cover.evaluate(element=>element.__setInspirationMode('tide'));await page.waitForTimeout(8800);
  const coverage=await cover.evaluate(element=>{const canvas=element.querySelector('canvas'),level=Number(canvas.dataset.tideLevel),box=element.getBoundingClientRect(),particles=element.__inspirationSnapshot().particles.filter(p=>!p.retiring&&p.y*box.height>=level),columns=12,rows=4,cells=Array(columns*rows).fill(0);for(const p of particles){const x=Math.max(0,Math.min(columns-1,Math.floor(p.x*columns))),poolY=(p.y*box.height-level)/(box.height-level),y=Math.max(0,Math.min(rows-1,Math.floor(poolY*rows)));cells[y*columns+x]++;}return{cells,occupied:cells.filter(value=>value>=5).length/cells.length};});
  assert(coverage.occupied>.9,'the particle pool fills the full width and depth below the wave line');assert.deepEqual(errors,[]);
  console.log(`PASS: ${names.length} detailed formations and ${(coverage.occupied*100).toFixed(0)}% tide-pool coverage with ${dense} particles.`);
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
