const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1288,height:1041},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
 await page.evaluate(()=>{signed=true;prefs.mode='light';goSpace(data[0].id);scope='global';changeTheme('base')});
 assert.equal(await page.evaluate(()=>isMember()),false);
 const originalData=await page.evaluate(()=>JSON.stringify(data));
 await page.locator('[data-link-settings]').click();
 const choice=page.locator('#link-view-settings [data-link-view=poly]');
 assert.equal(await choice.count(),1);assert(await choice.isVisible());
 assert.equal(await choice.evaluate(el=>!!el.closest('.more-link-views')),false);
 assert.equal(await choice.locator('.membership-badge').count(),0);assert.equal(await choice.locator('svg').count(),1);
 const iconBox=await choice.locator('svg').boundingBox();assert(iconBox.width>=16&&iconBox.height>=16);
 assert(await page.locator('#link-view-settings [data-link-view=poker] .membership-badge').count()>0);
 await page.screenshot({path:'checks/poly-link-style-menu.png'});
 await choice.click();await page.locator('#link-view-settings').waitFor({state:'hidden'});
 assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'poly');
 assert.equal(await page.locator('[data-link-settings]>span').innerText(),'棱光拾景');
 assert.equal(await page.locator('#member-gate[open]').count(),0);
 assert(await page.locator('.workspace .bookmark-logo-image').count()>=3);
 assert(await page.locator('.workspace .bookmark-edit').count()>=3);
 const texture=await page.locator('.workspace .bookmark').first().evaluate(el=>getComputedStyle(el,'::before').backgroundImage);assert(texture.includes('conic-gradient'));
 await page.screenshot({path:'checks/poly-link-style-light.png'});
 await page.evaluate(()=>{prefs.mode='dark';persist()});
 assert.equal(await page.evaluate(()=>JSON.stringify(data)),originalData);
 // Preserve selection and its checked state after reload.
 await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>goSpace(data[0].id));
 assert.equal(await page.locator('body').getAttribute('data-dark'),'true');
 await page.screenshot({path:'checks/poly-link-style-dark.png'});
 assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'poly');
 await page.locator('[data-link-settings]').click();assert.equal(await choice.getAttribute('aria-pressed'),'true');
 await page.locator('[data-link-view=cards]').click();assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'cards');
 await page.evaluate(()=>{scope='global';changeTheme('poly')});await page.locator('[data-link-settings]').click();await page.locator('[data-link-view=follow]').click();
 assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'poly');
 // Existing scope handling saves to each scope's rule without changing bookmark data.
 for(const scopeName of ['group','scene','space']){
   await page.evaluate(name=>{prefs.displayScopes??={};prefs.displayScopes[spaceId]=name;render()},scopeName);
   await page.locator('[data-link-settings]').click();await choice.click();
   assert.equal(await page.evaluate(()=>displayRule()?.style||styles[currentGroup().id]),'poly');
   await page.locator('[data-link-settings]').click();assert.equal(await choice.getAttribute('aria-pressed'),'true');await page.keyboard.press('Escape');
 }
 await page.locator('[data-link-settings]').click();await page.locator('[data-link-view=poker]').click();await page.locator('#member-gate[open]').waitFor();
 assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'poly');
 assert.deepEqual(errors,[]);
 console.log('PASS: independent visible style entry, SVG icon, select/reselect/reload, all three scopes, follow theme, logos and editing preserved, existing member gates preserved');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
