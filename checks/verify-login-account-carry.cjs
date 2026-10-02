process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('./verify-desktop-pet.cjs');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const f=await fixture(browser,false),p=f.page;
 await p.evaluate(()=>{accountLoginTab='password';renderAccountLogin();document.querySelector('#login').showModal()});
 const account=p.locator('#login [data-login-account]'),credential=p.locator('#login [data-login-credential]');
 const fill=async(input,value)=>{await input.click();await input.fill(value)};
 const change=async mode=>{await p.locator('#login [data-account-tab="'+mode+'"]').click();await p.waitForTimeout(130);};
 await fill(account,'reader@example.test');await fill(credential,'Private123');await change('email');assert.equal(await account.inputValue(),'reader@example.test');assert.equal(await credential.inputValue(),'');assert(await p.locator('#login [data-code-send]').isEnabled());
 await fill(credential,'123456');await change('password');assert.equal(await account.inputValue(),'reader@example.test');assert.equal(await credential.inputValue(),'');
 await change('phone');assert.equal(await account.inputValue(),'');await fill(account,'13900000001');await change('password');assert.equal(await account.inputValue(),'13900000001');await change('phone');assert.equal(await account.inputValue(),'13900000001');assert(await p.locator('#login [data-code-send]').isEnabled());
 await change('email');assert.equal(await account.inputValue(),'');await fill(account,'next@example.test');await change('phone');assert.equal(await account.inputValue(),'');await change('password');assert.equal(await account.inputValue(),'');
 assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS password/email/phone account carry, incompatible clearing, empty accounts, credential clearing and code-button state');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
