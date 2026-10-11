const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.route('**/api/shiyu/theme-access**',r=>r.fulfill({json:{items:[{id:'base',enabled:true,allowed:true,memberOnly:false},{id:'emergence',enabled:true,allowed:true,memberOnly:false}],fallback:'base',member:false,previews:{},trial:{mode:'daily',value:10}}}));
await context.addInitScript(()=>{localStorage.setItem('yiyu-prototype-v1',JSON.stringify({prefs:{theme:'emergence',mode:'light',brandGuideDismissed:true},signed:false}));});
const p=await context.newPage();p.on('pageerror',e=>console.log('ERROR',e.message));await p.goto('http://127.0.0.1:4328/');await p.waitForTimeout(2500);console.log(await p.locator('body').innerText());await p.screenshot({path:'checks/emergence/integrated-closed.png'});await p.getByRole('button',{name:'涌现场景设置',exact:true}).click();await p.screenshot({path:'checks/emergence/integrated-panel.png'});
console.log(await p.evaluate(()=>Array.from(document.querySelectorAll('header,footer,.utility-search,.dock,.emergence-panel,.emergence-canvas,.emergence-open')).map(e=>({selector:e.className,box:e.getBoundingClientRect().toJSON(),z:getComputedStyle(e).zIndex}))));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
