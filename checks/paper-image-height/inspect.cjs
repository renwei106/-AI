process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4318/';
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture}=require('../verify-desktop-pet.cjs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
const f=await fixture(b),p=f.page;
await f.context.route('**/api/shiyu/auth/newspaper',r=>r.fulfill({json:{userId:'pet-local-check',newspaper:{cover:{},edition:{}}}}));
await p.setViewportSize({width:1772,height:1015});await p.evaluate(()=>{prefs.theme='paper';render()});await p.locator('.edition-cover').click({position:{x:100,y:150}});
const measure=()=>p.evaluate(()=>Object.fromEntries(['.edition-content','.paper-columns','.paper-lead','.paper-lead>h2','.paper-lead .paper-cover','.paper-visual-upload','.paper-lead>p'].map(s=>{const e=document.querySelector(s);if(!e)return [s,null];const r=e.getBoundingClientRect(),c=getComputedStyle(e);return [s,{x:r.x,y:r.y,width:r.width,height:r.height,cssHeight:c.height,flex:c.flex,padding:c.padding,margin:c.margin,zoom:c.zoom,filter:c.filter,objectFit:c.objectFit}]})));
console.log('read',await measure());await p.screenshot({path:__dirname+'/before-read.png'});
await p.locator('.newspaper [data-paper-edit]').click();await p.locator('.newspaper.paper-editing').waitFor();console.log('edit',await measure());await p.screenshot({path:__dirname+'/before-edit.png'});
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});

