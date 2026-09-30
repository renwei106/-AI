const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=path.join(__dirname,'day-theme-background');
const baseline=path.join(root,'baselines/theme-day-background-before-20260930/v4.js');
const themes=['base','music','cinema','cosmos','globe','flip','rain','paper','poly','flow'];
const colors=['#48614c','#467ea5','#8b83d1','#bd9055','#a95e76','#ffffff','#000000','#567890'];
const catalog={items:themes.map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:true};
let browser;
async function open(version){
  const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light',reducedMotion:'reduce'});
  // Preview only: no API request may reach the local proxy or production services.
  await context.route('**/api/**',route=>route.fulfill({status:route.request().url().includes('/theme-access')?200:503,contentType:'application/json',body:JSON.stringify(route.request().url().includes('/theme-access')?catalog:{})}));
  if(version==='before')await context.route('**/v4.js?*',route=>route.fulfill({path:baseline,contentType:'application/javascript'}));
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4318/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__shiyuThemeCatalog?.length===10);
  await page.addStyleTag({content:'*,*::before,*::after{transition:none!important}'});
  await page.evaluate(async()=>{prefs.brandGuideDismissed=true;prefs.mode='light';render();await document.fonts.ready;document.querySelector('.brand-guide')?.remove()});
  return {context,page};
}
async function snapshot(page){
  return page.evaluate(()=>{
    const body=getComputedStyle(document.body),probe=document.createElement('span');
    probe.style.cssText='position:fixed;visibility:hidden;background:var(--bg)';document.body.append(probe);
    const background=getComputedStyle(probe).backgroundColor;probe.remove();
    return {background,body:body.backgroundColor,image:body.backgroundImage,accent:body.getPropertyValue('--accent').trim(),surface:body.getPropertyValue('--surface'),soft:body.getPropertyValue('--soft'),line:body.getPropertyValue('--line'),ink:body.color,font:body.fontFamily};
  });
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  browser=await chromium.launch({channel:'msedge',headless:true});
  const results={};
  for(const version of ['before','after']){
    const {context,page}=await open(version);results[version]={};
    for(const theme of themes){
      await page.evaluate(theme=>{view='home';prefs.theme=theme;prefs.mode='light';render()},theme);
      for(const mode of ['light','dark'])for(const color of colors){
        await page.evaluate(({mode,color})=>{prefs.mode=mode;prefs.color=color;apply()},{mode,color});
        const key=[theme,mode,color].join('/');results[version][key]=await snapshot(page);
        if(version==='after'){
          const current=results.after[key],previous=results.before[key];
          assert.equal(await page.evaluate(()=>resolveThemeColor()),color,`${key}: existing color source`);
          if(mode==='dark')assert.deepEqual(current,previous,`${key}: dark appearance unchanged`);
          else{
            assert.notEqual(current.background,previous.background,`${key}: light background updated`);
            for(const property of ['surface','ink','font'])assert.equal(current[property],previous[property],`${key}: ${property} unchanged`);
          }
        }
      }
    }
    for(const [label,color]of [['green','#48614c'],['blue','#467ea5'],['purple','#8b83d1'],['champagne','#bd9055']]){
      await page.evaluate(color=>{prefs.theme='base';prefs.mode='light';prefs.color=color;render()},color);
      await page.waitForTimeout(180);
      await page.screenshot({path:path.join(output,`${version}-${label}.png`)});
      results[version][`layout/${label}`]=await page.locator('header,.base-composition,#search-form').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {selector:node.id||node.className||node.tagName,x:r.x,y:r.y,width:r.width,height:r.height}}));
      if(version==='after')assert.deepEqual(results.after[`layout/${label}`],results.before[`layout/${label}`],`${label}: same layout`);
    }
    if(version==='after'){
      assert.equal(new Set(colors.map(color=>results.after[`base/light/${color}`].body)).size,colors.length,'every palette has a distinct daylight background');
      // Exercise the actual settings click and saved custom palette, then reload.
      await page.evaluate(()=>{signed=true;window.__shiyuUserEntitlements={ready:true,entitlements:[{key:'global-custom-color',enabled:true,kind:'boolean',value:true}]};settingsTab='colors';renderSettings();show('#settings')});
      await page.locator('#settings [data-pref="color"][data-value="#467ea5"]').click();
      assert.equal((await snapshot(page)).accent,'#467ea5');
      await page.locator('#settings [data-custom-color]').click();
      await page.locator('#custom-color-dialog .inline-color-value input').fill('#567890');
      await page.locator('#custom-color-dialog .inline-color-value input').dispatchEvent('change');
      await page.locator('.custom-color-confirm').click();
      await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__shiyuThemeCatalog?.length===10);
      assert.equal(await page.evaluate(()=>resolveThemeColor()),'#567890','custom palette survives reload');
      await page.evaluate(()=>{view='space';prefs.spacePreferenceModes={color:'space'};prefs.spacePreferences={[spaceId]:{color:'#a95e76'}};render()});
      assert.equal((await snapshot(page)).accent,'#a95e76','space-specific color respected');
      await page.evaluate(()=>{view='home';render()});
      assert.equal((await snapshot(page)).accent,'#567890','home retains global palette');
      for(const scheme of ['dark','light']){
        await page.emulateMedia({colorScheme:scheme});await page.evaluate(()=>{prefs.mode='system';render()});
        assert.equal(await page.evaluate(()=>document.body.dataset.dark),String(scheme==='dark'));
      }
      await page.setViewportSize({width:390,height:844});
      await page.evaluate(()=>{prefs.theme='base';prefs.color='#8b83d1';prefs.mode='light';render()});
      await page.waitForTimeout(200);await page.screenshot({path:path.join(output,'after-mobile-purple.png')});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile has no horizontal overflow');
    }
    await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));
  console.log('PASS: 10 themes × 8 palettes × light/dark before/after; dark appearance and layout unchanged; palette clicks, custom color persistence, independent space color, system mode and mobile layout.');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
