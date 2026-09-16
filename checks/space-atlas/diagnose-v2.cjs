const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixture=require('./baseline.json');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});const p=await b.newPage({viewport:{width:1573,height:1041},reducedMotion:'reduce'});
 await p.addInitScript(value=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({...value,signed:true})),fixture);
 await p.goto('http://127.0.0.1:4318');await p.evaluate(()=>goSpace('create'));
 const boxes=()=>p.evaluate(()=>Object.fromEntries(['.workspace .space-top-actions','.workspace [data-action=add]','.workspace [data-share-open]','.workspace [data-display-scope-open]','.at-header-actions','[data-at-header=add]','[data-at-header=share]','[data-at-header=settings]','.at-footer','.at-controls','.at-tools','.at-search','.at-hint','.dock'].map(s=>{const e=document.querySelector(s);return [s,e?{rect:e.getBoundingClientRect().toJSON(),display:getComputedStyle(e).display,position:getComputedStyle(e).position,transform:getComputedStyle(e).transform}:null]})));
 console.log('daily',JSON.stringify(await boxes()));
 await p.locator('.workspace .space-mode-entry').hover();await p.locator('[data-space-mode=atlas]').click();await p.waitForTimeout(500);
 console.log('atlas',JSON.stringify(await boxes()));
 await p.locator('[data-at-focus="c:ai"]').first().click();await p.locator('[data-at-focus="g:assistants"]').first().click();
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(500);console.log('mobile',JSON.stringify(await boxes()));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
