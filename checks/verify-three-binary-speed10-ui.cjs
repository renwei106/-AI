require('node:fs').mkdirSync('.local/checks/three-binary-speed10-20261012',{recursive:true});
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output='.local/checks/three-binary-speed10-20261012';
fs.mkdirSync(output,{recursive:true});
const ids=['base','poly','music','cosmos','flow','flip','rain','cinema','paper','globe','forestCompanion','emergence','threeBody','starlink'];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const context=await browser.newContext({viewport:{width:2066,height:1070},reducedMotion:'reduce'});
  let defaults={threeBody:1.3,binarySystem:1.5};
  await context.addInitScript(()=>{if(!localStorage.getItem('speed10-fixture')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'base',mode:'dark',color:'#0b5361',brandGuideDismissed:true},signed:false}));localStorage.setItem('speed10-fixture','1');}});
  await context.route('**/api/**',route=>{
   const url=route.request().url();
   const result=url.includes('theme-access')?{items:ids.map(id=>({id,enabled:true,allowed:true,memberOnly:false})),fallback:'base',member:false}:url.includes('/operations')?{threeBodyContent:{allowCustomize:true,defaultScene:'threeBody',defaults:{speed:defaults.threeBody},scenes:{binarySystem:{enabled:true,defaults:{speed:defaults.binarySystem}},multiBody:{enabled:true,defaults:{speed:1.2}}}}}:{};
   return route.fulfill({json:result});
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4349/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{prefs.theme='threeBody';persist();render();});
  const ready=async scene=>page.waitForFunction(expected=>window.ShiyuThreeBodyScene?.snapshot().loaded&&ShiyuThreeBodyScene.snapshot().scene===expected,scene);
  await ready('threeBody');
  const open=async()=>{if(await page.locator('.three-body-panel').isHidden())await page.locator('.home-threeBody .three-body-open').click();};
  const speed=()=>page.locator('.three-body-panel [data-three-param="speed"]');
  const check=async(max,value)=>{assert.equal(await speed().getAttribute('max'),String(max));assert.equal(await speed().inputValue(),String(value));assert.equal(await speed().locator('+ output').textContent(),Number(value).toFixed(1));};
  const select=async id=>{await page.locator('[data-three-scene="'+id+'"]').click();await ready(id);};
  const savedSpeed=async id=>page.evaluate(scene=>JSON.parse(localStorage.getItem('shiyu-three-body-settings:guest')).configs[scene].speed,id);
  await open();await check(10,1.3);
  await speed().focus();await page.keyboard.press('End');await check(10,10);assert.equal(await savedSpeed('threeBody'),10);
  await page.screenshot({path:output+'/three-body-speed10.png'});
  await select('binarySystem');await check(10,1.5);
  await speed().focus();await page.keyboard.press('End');await check(10,10);assert.equal(await savedSpeed('binarySystem'),10);assert.equal(await page.evaluate(()=>ShiyuThreeBodyScene.snapshot().model.params.speed),10);
  await page.screenshot({path:output+'/binary-system-speed10.png'});
  await select('threeBody');await check(10,10);
  await page.reload({waitUntil:'domcontentloaded'});await ready('threeBody');await open();await check(10,10);
  await select('binarySystem');await check(10,10);
  await page.reload({waitUntil:'domcontentloaded'});await ready('binarySystem');await open();await check(10,10);
  await page.locator('.three-body-reset').click();await check(10,1.5);assert.equal(await savedSpeed('binarySystem'),1.5);
  await select('threeBody');await page.locator('.three-body-reset').click();await check(10,1.3);assert.equal(await savedSpeed('threeBody'),1.3);
  for(const scene of ['particleLife','elementSandbox']){await select(scene);assert.equal(await speed().getAttribute('max'),'2');await speed().focus();await page.keyboard.press('End');assert.equal(await speed().inputValue(),'2');assert.equal(await savedSpeed(scene),2);}
  await page.locator('.three-body-close').click();
  await page.evaluate(()=>{prefs.theme='cosmos';persist();render();});await ready('multiBody');await open();await check(2,1.2);
  await speed().focus();await page.keyboard.press('End');await check(2,2);assert.equal(await savedSpeed('multiBody'),2);
  await page.screenshot({path:output+'/multi-body-unchanged.png'});
  // The admin may also set either newly expanded speed default to 10.
  defaults={threeBody:10,binarySystem:10};
  await page.locator('.three-body-close').click();await page.evaluate(()=>{prefs.theme='threeBody';persist();render();});await ready('threeBody');
  await page.reload({waitUntil:'domcontentloaded'});await ready('threeBody');await open();await page.locator('.three-body-reset').click();await check(10,10);
  await select('binarySystem');await page.locator('.three-body-reset').click();await check(10,10);
  assert.deepEqual(errors,[]);
  console.log('PASS: three-body/binary speed 10.0; scene switching and independent reload persistence; admin resets 1.3/1.5 and 10; particle/element/multi-body maximum remains 2.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
