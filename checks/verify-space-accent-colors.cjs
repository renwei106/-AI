const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const THEMES=['base','music','flow','reading','poly','cosmos','flip','rain','projection','cinema','paper'];
let browser;

async function colors(page){
  return page.evaluate(()=>{
    const bg=selector=>getComputedStyle(document.querySelector(selector)).backgroundColor;
    const sample=property=>{
      const node=document.createElement('i');node.style.cssText=`position:fixed;pointer-events:none;background:var(${property})`;document.body.append(node);
      const value=getComputedStyle(node).backgroundColor;node.remove();return value;
    };
    return {
      soft:sample('--space-accent-soft'),hover:sample('--space-accent-hover'),accent:sample('--accent'),
      scene:bg('.scene-button.active'),site:bg('.bookmark .site-icon'),
      pills:[...document.querySelectorAll('.view-settings-trigger')].map(node=>getComputedStyle(node).backgroundColor),
      inbox:bg('.space-inbox-entry'),add:bg('.space-top-actions [data-action="add"]')
    };
  });
}

async function verifyState(page,theme,mode,policy){
  await page.evaluate(({theme,mode,policy})=>{
    view='home';prefs.theme=theme;prefs.color=(THEMES[theme]||THEMES.base).color;prefs.mode=mode;prefs.spaceThemePolicy=policy;signed=true;persist();render();goSpace('work');
  },{theme,mode,policy});
  await page.locator('.workspace .scene-button.active').waitFor();
  const state=await colors(page),label=`${theme}/${mode}/${policy}`;
  assert.equal(state.scene,state.soft,`${label}: selected scene uses the theme tint`);
  assert.equal(state.site,state.soft,`${label}: website icon uses the theme tint`);
  assert(state.pills.length>=2,`${label}: card and width controls are present`);
  assert(state.pills.every(color=>color===state.soft),`${label}: card and adaptive-width controls use the theme tint`);
  assert.equal(state.inbox,state.soft,`${label}: inbox uses the theme tint`);
  assert.equal(state.add,state.accent,`${label}: add bookmark uses the exact theme color`);

  await page.locator('[data-column-settings]').click();
  assert.equal(await page.locator('#column-settings .column-auto').evaluate(node=>getComputedStyle(node).backgroundColor),state.soft,`${label}: adaptive-width option uses the theme tint`);
  await page.locator('#column-settings .dialog-heading [data-action="close"]').click();

  for(const selector of ['.global-search-trigger','.space-share','.display-scope-button','.space-inbox-entry']){
    await page.locator(selector).hover();
    assert.equal(await page.locator(selector).evaluate(node=>getComputedStyle(node).backgroundColor),state.hover,`${label}: ${selector} hover uses the shared theme hover tint`);
    await page.mouse.move(600,500);
  }
}

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1288,height:1041},reducedMotion:'reduce'});
  await context.addInitScript(()=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode:'light',homeEntryGesture:'single',spaceThemePolicy:'default'},signed:true})));
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  for(const theme of THEMES)for(const mode of ['light','dark'])for(const policy of ['default','last'])await verifyState(page,theme,mode,policy);
  assert.deepEqual(errors,[],'no runtime errors');
  await context.close();
  console.log(`PASS: six requested accent areas stay aligned across ${THEMES.length} themes, light/dark modes, and both space-entry policies.`);
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
