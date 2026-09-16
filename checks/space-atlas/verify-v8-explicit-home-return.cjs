const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const checks=[];
const errors=[];
let browser;

async function freshPage(context){
  await context.addInitScript(()=>{
    localStorage.removeItem('yiyu-prototype-v1');
    localStorage.removeItem('shiyu-space-atlas-v1');
  });
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  return page;
}

async function atlasStatus(page){
  return page.evaluate(()=>({
    view,
    bodyView:document.body.dataset.view,
    open:document.querySelector('#space-atlas')?.open===true,
    ready:document.querySelector('#space-atlas')?.classList.contains('atlas-ready')===true
  }));
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});

  const atlasContext=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
  const page=await freshPage(atlasContext);
  await page.evaluate(()=>{signed=true;prefs.homeEntryGesture='single';goSpace(data[0].id)});
  await page.locator('.workspace .space-mode-entry').waitFor({state:'visible'});
  await page.locator('.workspace .space-mode-entry').click();
  await page.locator('[data-space-mode="atlas"]').click();
  await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor({state:'visible'});

  // Reproduce the retired interaction exactly: two separated upward wheel
  // gestures in the top zone must no longer reveal or trigger a home return.
  for(const deltaY of [-120,-120,160,160]){
    await page.mouse.move(644,42);
    await page.mouse.wheel(0,deltaY);
    await page.waitForTimeout(420);
    const status=await atlasStatus(page);
    assert.equal(status.view,'space','top-zone wheel must keep the logical view on space');
    assert.equal(status.open,true,'top-zone wheel must keep the atlas dialog open');
  }
  assert.equal(await page.locator('.at-cover-return').evaluate(el=>el.classList.contains('revealed')),false,'wheel must not reveal an armed return state');
  checks.push('图谱顶部连续向上或向下滚动均不会返回首页');

  // Wheel on the graph remains reserved for zoom and must not become a
  // navigation gesture, even when repeated with the old return cadence.
  const canvas=page.locator('.at-canvas');
  const zoomNode=page.locator('.at-node[data-level="0"]');
  const zoomBefore=await zoomNode.evaluate(el=>Number(getComputedStyle(el).zoom));
  const canvasBox=await canvas.boundingBox();
  await page.mouse.move(canvasBox.x+canvasBox.width*.52,canvasBox.y+canvasBox.height*.48);
  await page.mouse.wheel(0,-150);
  await page.waitForTimeout(420);
  const zoomAfter=await zoomNode.evaluate(el=>Number(getComputedStyle(el).zoom));
  assert(zoomAfter>zoomBefore,'canvas wheel should still increase the rendered node zoom');
  await page.mouse.wheel(0,-150);
  await page.waitForTimeout(260);
  assert.deepEqual(await atlasStatus(page),{view:'space',bodyView:'space',open:true,ready:true});
  checks.push('图谱画布滚轮仍用于缩放，连续操作不会离开图谱');

  const returnButton=page.locator('.at-cover-return');
  const resting=await returnButton.evaluate(el=>({
    opacity:Number(getComputedStyle(el).opacity),
    primary:Number(getComputedStyle(el.children[0]).opacity),
    hint:Number(getComputedStyle(el.children[1]).opacity),
    hintText:el.children[1].textContent.trim(),
    label:el.getAttribute('aria-label')
  }));
  assert(resting.opacity<.5,'explicit home entry should stay visually quiet at rest');
  assert(resting.primary>.9&&resting.hint<.1,'resting entry should show only its short label');
  assert.equal(resting.hintText,'点击返回首页');
  assert.equal(resting.label,'返回首页');

  await returnButton.hover();
  await page.waitForTimeout(240);
  const hovered=await returnButton.evaluate(el=>({
    opacity:Number(getComputedStyle(el).opacity),
    primary:Number(getComputedStyle(el.children[0]).opacity),
    hint:Number(getComputedStyle(el.children[1]).opacity)
  }));
  assert(hovered.opacity>.9,'explicit home entry should become clear on hover');
  assert(hovered.primary<.1&&hovered.hint>.9,'hover should replace the short label with the click instruction');
  checks.push('浅色返回入口在悬停时明确显示“点击返回首页”');

  await returnButton.click();
  await page.waitForFunction(()=>document.body.dataset.view==='home'&&!document.querySelector('#space-atlas')?.open);
  assert.equal((await atlasStatus(page)).view,'home');
  checks.push('只有点击明确的返回入口才会从图谱回到首页');
  await atlasContext.close();

  // The cover's existing single-scroll entry remains intact outside atlas.
  const dailyContext=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
  const daily=await freshPage(dailyContext);
  await daily.evaluate(()=>{signed=true;prefs.homeEntryGesture='single';view='home';render();scrollTo(0,document.documentElement.scrollHeight)});
  await daily.mouse.move(640,700);
  await daily.mouse.wheel(0,180);
  await daily.waitForFunction(()=>document.body.dataset.view==='space');
  assert.equal(await daily.evaluate(()=>view),'space');
  assert.equal(await daily.locator('#space-atlas[open]').count(),0);
  checks.push('常规流程中首页单次下滑进入空间的行为保持不变');
  await dailyContext.close();

  assert.deepEqual(errors,[],'page should not raise runtime errors');
  console.log(JSON.stringify({status:'PASS',checks,errors},null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
