process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4343/';
const {fixture}=require('./verify-desktop-pet.cjs'),{chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict'),out='.local/corner-mobile-20260928';
async function inside(loc,w,h,label){const r=await loc.boundingBox();assert(r,label+' visible');assert(r.x>=-1&&r.y>=-1&&r.x+r.width<=w+1&&r.y+r.height<=h+1,label+' '+JSON.stringify(r));}
async function keyboard(p,h){await p.evaluate(h=>{Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>h});visualViewport.dispatchEvent(new Event('resize'))},h);await p.waitForTimeout(80)}
(async()=>{const b=await chromium.launch({channel:'chrome'});try{for(const [w,h]of [[320,740],[390,844],[600,960],[768,1024],[820,1180],[1024,768],[844,390]]){
 if(process.env.CORNER_WIDTH&&w!==Number(process.env.CORNER_WIDTH))continue;
 const f=await fixture({newContext:o=>b.newContext({...o,viewport:{width:w,height:h},isMobile:w<=600,hasTouch:true})}),p=f.page;
 await p.evaluate(()=>ShiyuCorner.openModule('common'));await p.waitForTimeout(150);
 await inside(p.locator('.corner-card.is-center'),w,h,'collection card');
 await p.locator('.corner-card.is-center .corner-card-empty p').tap();await p.locator('.corner-card.is-center.is-flipped').waitFor();
 await p.locator('.corner-card.is-center [data-corner-name]').fill('手机收藏');await keyboard(p,Math.min(h,420));await inside(p.locator('.corner-card.is-center'),w,Math.min(h,420),'collection keyboard');assert.equal(await p.locator('.corner-card.is-center [data-corner-name]').inputValue(),'手机收藏');await keyboard(p,h);
 await p.locator('.corner-card.is-center [data-corner-tab=colors]').tap();await p.locator('.corner-card.is-center [data-corner-color=default]').tap();await p.locator('.corner-card.is-center .corner-back-header').tap();
 await p.locator('.corner-card.is-center [data-corner-add-links]').tap();await inside(p.locator('#corner-picker'),w,h,'collection picker');assert(await p.locator('#corner-picker').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 await p.locator('#corner-search').fill('示例');await p.locator('.corner-source input').first().check();await p.locator('#corner-save').tap();await p.locator('#corner-picker').waitFor({state:'hidden'});assert.equal(await p.locator('.corner-card.is-center .corner-links a[href="https://example.test/"]').count(),2);
 await p.screenshot({path:out+`/verified-common-${w}x${h}.png`});
 const current=await p.locator('.corner-card.is-center').getAttribute('data-corner-card');await p.locator('[data-corner-page="1"]').tap();assert.notEqual(await p.locator('.corner-card.is-center').getAttribute('data-corner-card'),current);
 await p.evaluate(()=>ShiyuCorner.closeModule());await p.evaluate(()=>ShiyuCorner.openModule('memo'));await p.locator('.memo-cover.is-active').waitFor();await p.waitForTimeout(200);
 await inside(p.locator('.memo-view-tabs'),w,h,'memo tabs');await inside(p.locator('.memo-cover.is-active'),w,h,'memo card');
 await p.locator('.memo-cover.is-active [data-memo-card]').tap();await p.locator('.memo-paper-editor').waitFor();await p.locator('[data-memo-title]').fill('移动端小记');await p.locator('[data-memo-content]').fill('手机和平板编辑，输入不会因屏幕变化而丢失。');
 await keyboard(p,Math.min(h,400));await inside(p.locator('.memo-paper-editor'),w,Math.min(h,400),'memo keyboard');assert.equal(await p.locator('[data-memo-content]').inputValue(),'手机和平板编辑，输入不会因屏幕变化而丢失。');await p.screenshot({path:out+`/keyboard-memo-${w}x${h}.png`});await keyboard(p,h);await p.locator('[data-memo-close]').tap();await p.locator('.memo-paper-editor').waitFor({state:'detached'});
 assert(await p.evaluate(()=>prefs.cornerModules[prefs.accountProfile.id].memo.notes.some(n=>n.title==='移动端小记'&&n.content.includes('不会'))));
 await p.locator('.memo-cover.is-active [data-memo-color-trigger]').tap();await inside(p.locator('.memo-color-popover'),w,h,'memo palette');await p.locator('button[data-memo-color=theme]').tap();
 await p.locator('.memo-cover.is-active [data-memo-archive]').tap();await p.locator('[data-memo-view=archive]').tap();await p.locator('[data-memo-archive-open]').first().tap();await inside(p.locator('.memo-paper-editor'),w,h,'archive preview');await p.locator('[data-memo-unarchive]').tap();await p.locator('[data-memo-close]').tap();await p.locator('.memo-paper-editor').waitFor({state:'detached'});
 await p.locator('[data-memo-view=trash]').tap();await p.locator('[data-memo-pour]').tap();await inside(p.locator('.memo-pour-confirm'),w,h,'delete confirmation');await p.locator('[data-memo-cancel-pour]').tap();
 await p.locator('[data-memo-view=notes]').tap();await p.screenshot({path:out+`/verified-memo-${w}x${h}.png`});await p.evaluate(()=>ShiyuCorner.closeModule());await p.evaluate(()=>{prefs.mode='dark';render()});await p.evaluate(()=>ShiyuCorner.openModule('memo'));await p.locator('.memo-cover.is-active').waitFor();await p.screenshot({path:out+`/dark-memo-${w}x${h}.png`});assert.deepEqual(f.errors,[]);
 await f.context.close();console.log('PASS collection edit/add/search/navigation and memo edit/keyboard/archive/trash',w,h);
}}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
