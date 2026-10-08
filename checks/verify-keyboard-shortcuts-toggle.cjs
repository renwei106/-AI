/* Use fixture APIs and real destinations; never write production data. */
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),f=await fixture(browser),p=f.page;
 const home=()=>p.waitForFunction(()=>view==='home'&&!document.body.classList.contains('world-active')&&!document.querySelector('#my-corner[open],#space-atlas[open]'));
 for(const [id,key]of [['common','C'],['memo','M'],['todo','Y'],['toolbox','Z']]){
  await p.keyboard.press('Alt+'+key);
  await p.waitForFunction(id=>document.querySelector('#my-corner[open]')?.dataset.cornerModule===id,id);
  await p.keyboard.press('Alt+2');assert.equal(await p.evaluate(()=>view),'home');assert(await p.locator('#my-corner').evaluate(d=>d.open));
  if(id==='memo'){
   await p.evaluate(()=>{document.querySelector('#my-corner').classList.add('memo-editor-mode');});
   await p.keyboard.press('Alt+M');assert(await p.locator('#my-corner').evaluate(d=>d.open));
   await p.evaluate(()=>{document.querySelector('#my-corner').classList.remove('memo-editor-mode');});
  }
  await p.keyboard.press('Alt+'+key);await home();console.log('PASS '+id+' opens and returns home with same shortcut');
 }
 await p.keyboard.press('Alt+2');await p.waitForFunction(()=>view==='space');
 await p.keyboard.press('Alt+2');await home();console.log('PASS space toggle');
 await p.keyboard.press('Alt+3');await p.waitForFunction(()=>document.body.classList.contains('world-active'));
 await p.keyboard.press('Alt+3');await home();assert.equal(await p.evaluate(()=>new URL(location.href).searchParams.get('page')),null);console.log('PASS world toggle and clean home URL');
 await p.keyboard.press('Alt+2');await p.waitForFunction(()=>view==='space');
 await p.evaluate(()=>{const input=document.createElement('input');input.id='toggle-input';document.body.append(input);input.focus();});
 await p.keyboard.press('Alt+2');assert.equal(await p.evaluate(()=>view),'space');
 await p.evaluate(()=>document.querySelector('#toggle-input').remove());
 await p.evaluate(()=>{settingsTab='shortcuts';renderSettings();show('#settings');});
 await p.keyboard.press('Alt+2');assert.equal(await p.evaluate(()=>view),'space');
 await p.locator('#settings .dialog-heading [data-action="close"]').click();await p.keyboard.press('Alt+2');await home();console.log('PASS input and settings guards on return');
 await p.evaluate(()=>{settingsTab='shortcuts';renderSettings();show('#settings');});
 assert.equal(await p.locator('[data-record-shortcut="home"]').textContent(),'Alt+1');
 await p.locator('[data-record-shortcut="home"]').click();await p.keyboard.press('H');
 assert.equal(await p.locator('[data-record-shortcut="home"]').textContent(),'H');
 await p.locator('#settings .dialog-heading [data-action="close"]').click();
 await p.evaluate(()=>document.activeElement?.blur());
 for(const [key,condition]of [['Alt+2',()=>view==='space'],['Alt+3',()=>document.body.classList.contains('world-active')],['Alt+C',()=>document.querySelector('#my-corner[open]')?.dataset.cornerModule==='common']]){
  await p.keyboard.press(key);await p.waitForFunction(condition);await p.keyboard.press('H');await home();
 }
 await p.keyboard.press('H');await home();
 await p.evaluate(()=>{settingsTab='shortcuts';renderSettings();show('#settings');});
 await p.locator('[data-clear-shortcut="home"]').click();assert.equal(await p.locator('[data-record-shortcut="home"]').textContent(),'未设置');
 await p.locator('[data-reset-shortcuts]').click();assert.equal(await p.locator('[data-record-shortcut="home"]').textContent(),'Alt+1');
 await p.locator('#settings .dialog-heading [data-action="close"]').click();
 await p.keyboard.press('Alt+2');await p.waitForFunction(()=>view==='space');await p.keyboard.press('Alt+1');await home();
 console.log('PASS home default, custom, clear/reset, return from space/world/app, already-home no-op');
 assert.deepEqual(f.errors,[]);await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
