const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const THEMES=['base','music','flow','reading','poly','cosmos','flip','rain','projection','cinema','paper'];
let browser;

function closeTo(actual,expected,message){
  assert(Math.abs(actual-expected)<=1,`${message}: expected ${expected}, received ${actual}`);
}

async function dockSignature(page){
  return page.evaluate(()=>{
    const host=document.querySelector('#dock'),trigger=host.querySelector('.dock-trigger').cloneNode(true),options=host.querySelector('.dock-options'),strip=options.querySelector('.space-strip')||options;
    trigger.querySelector('.dock-label')?.remove();
    return {
      theme:host.dataset.dockTheme,
      trigger:trigger.innerHTML.replace(/\s+/g,' ').trim(),
      optionsClass:options.className,
      options:strip.innerHTML.replace(/\s+/g,' ').trim()
    };
  });
}

async function verifyTheme(theme){
  const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'no-preference'});
  await context.addInitScript(theme=>{
    localStorage.setItem('yiyu-prototype-v1',JSON.stringify({
      prefs:{theme,mode:'light',homeEntryGesture:'single',spaceThemePolicy:'default'},
      signed:true
    }));
    localStorage.removeItem('shiyu-space-atlas-v1');
  },theme);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto(BASE_URL,{waitUntil:'networkidle'});
    const homeDock=await dockSignature(page);
    const activeHomeTheme=await page.evaluate(()=>prefs.theme);
    assert.equal(homeDock.theme,activeHomeTheme,`${theme}: home dock declares its active theme`);

    await page.locator('.scroll-invitation').click();
    await page.locator('.workspace .space-mode-entry').waitFor({state:'visible'});
    assert.equal(await page.locator('#main').evaluate(element=>getComputedStyle(element).transform),'none',`${theme}: home-to-space animation does not move the header`);
    const daily=await page.evaluate(()=>{
      const heading=document.querySelector('.workspace .space-heading').getBoundingClientRect();
      const actions=document.querySelector('.workspace .space-top-actions').getBoundingClientRect();
      return {bodyTheme:document.body.dataset.theme,heading:{x:heading.x,y:heading.y},actions:{x:actions.x,y:actions.y}};
    });
    assert.equal(daily.bodyTheme,'base',`${theme}: default space presentation remains base`);
    assert(daily.heading.y<80&&daily.actions.y<90,`${theme}: daily header starts at its settled top position`);
    assert.deepEqual(await dockSignature(page),homeDock,`${theme}: space switcher keeps the home theme icon and popover`);

    await page.locator('.workspace .space-mode-entry').click();
    await page.locator('#space-mode-menu [data-space-mode="atlas"]').click();
    await page.locator('#space-atlas.atlas-ready .at-canvas').waitFor({state:'visible'});
    const atlas=await page.evaluate(()=>{
      const heading=document.querySelector('#space-atlas .at-mode-host').getBoundingClientRect();
      const actions=document.querySelector('#space-atlas .at-header-actions').getBoundingClientRect();
      return {heading:{x:heading.x,y:heading.y},actions:{x:actions.x,y:actions.y}};
    });
    closeTo(atlas.heading.x,daily.heading.x,`${theme}: atlas space name keeps the daily x coordinate`);
    closeTo(atlas.heading.y,daily.heading.y,`${theme}: atlas space name keeps the daily y coordinate`);
    closeTo(atlas.actions.x,daily.actions.x,`${theme}: atlas actions keep the daily x coordinate`);
    closeTo(atlas.actions.y,daily.actions.y,`${theme}: atlas actions keep the daily y coordinate`);
    assert.deepEqual(errors,[],`${theme}: no runtime errors`);
  }finally{
    await context.close();
  }
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  for(const theme of THEMES)await verifyTheme(theme);
  console.log(`PASS: ${THEMES.length} themes keep their home switcher on the space page and preserve daily/atlas header coordinates.`);
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
