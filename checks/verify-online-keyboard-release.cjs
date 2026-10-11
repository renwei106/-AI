/* Production static assets, fixture API responses only. */
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),f=await fixture(browser),p=f.page;
 await p.locator('.pet-character').click();await p.locator('.pet-keyboard-entry').click();await p.locator('#settings[open] .keyboard-settings').waitFor();
 assert.equal(await p.locator('[data-record-shortcut="home"]').textContent(),'Alt+1');
 assert.equal(await p.locator('[data-record-shortcut="app:memo"]').textContent(),'Alt+M');
 await p.locator('[data-record-shortcut="app:memo"]').click();await p.keyboard.press('Control+L');assert.equal(await p.locator('[id="keyboard-error-app:memo"]').textContent(),'与浏览器快捷键冲突');
 await p.keyboard.press('N');assert.equal(await p.locator('[data-record-shortcut="app:memo"]').textContent(),'N');
 await p.locator('[data-clear-shortcut="app:memo"]').click();assert.equal(await p.locator('[data-record-shortcut="app:memo"]').textContent(),'未设置');
 await p.locator('[data-reset-shortcuts]').click();assert.equal(await p.locator('[data-record-shortcut="app:memo"]').textContent(),'Alt+M');
 await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:'.local/release-v129/online-shortcuts.png'});
 assert.deepEqual(f.errors,[]);await browser.close();console.log('PASS online shortcut entry, V1.2.9 defaults, conflict warning, single key capture, clear/reset');
})().catch(error=>{console.error(error);process.exit(1)});
