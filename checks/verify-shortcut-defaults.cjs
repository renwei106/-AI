const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),f=await fixture(browser),p=f.page;
 await p.evaluate(()=>{settingsTab='shortcuts';renderSettings();show('#settings');});
 for(const [id,key]of [['home','Alt+1'],['space','Alt+2'],['world','Alt+3'],['app:memo','Alt+M'],['app:todo','Alt+Y'],['app:common','Alt+C'],['app:toolbox','Alt+Z']])assert.equal(await p.locator(`[data-record-shortcut="${id}"]`).textContent(),key);
 assert.equal(await p.locator('.keyboard-row-error').evaluateAll(nodes=>nodes.filter(n=>n.textContent).length),0);
 await p.locator('[data-record-shortcut="app:memo"]').click();await p.keyboard.press('Alt+N');
 await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>{settingsTab='shortcuts';renderSettings();show('#settings');});
 assert.equal(await p.locator('[data-record-shortcut="app:memo"]').textContent(),'Alt+N');
 await p.locator('[data-reset-shortcuts]').click();assert.equal(await p.locator('[data-record-shortcut="app:memo"]').textContent(),'Alt+M');
 await p.locator('#settings .dialog-heading [data-action=close]').click();
 for(const [key,condition]of [['Alt+2',()=>view==='space'],['Alt+3',()=>document.body.classList.contains('world-active')],['Alt+C',()=>document.querySelector('#my-corner[open]')?.dataset.cornerModule==='common']]){
  await p.keyboard.press(key);await p.waitForFunction(condition);await p.keyboard.press('Alt+1');await p.waitForFunction(()=>view==='home'&&!document.querySelector('#my-corner[open]')&&!document.body.classList.contains('world-active'));
 }
 for(const [ua,platform]of [['Chrome/140 Safari/537.36','Win32'],['Firefox/147','Win32'],['Version/18 Safari/605','MacIntel']]){
  await p.evaluate(({ua,platform})=>{Object.defineProperty(navigator,'userAgent',{configurable:true,value:ua});Object.defineProperty(navigator,'platform',{configurable:true,value:platform});settingsTab='shortcuts';renderSettings();show('#settings');},{ua,platform});
  assert.equal(await p.locator('.keyboard-row-error').evaluateAll(nodes=>nodes.filter(n=>n.textContent).length),0);
  await p.locator('#settings .dialog-heading [data-action=close]').click();
 }
 assert.deepEqual(f.errors,[]);await browser.close();console.log('PASS short defaults, no known Chrome/Edge/Firefox/Safari conflicts, custom persistence, reset, navigation');
})().catch(error=>{console.error(error);process.exit(1)});
