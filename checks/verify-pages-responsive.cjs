process.env.SHIYU_PREVIEW_URL='http://127.0.0.1:4343/';
const {fixture}=require('./verify-desktop-pet.cjs');
const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('fs');
const store=require('../../聚合管理后台/membership/plan-store.cjs');
const plans=[['free','免费版',0,0],['monthly','月度会员',10,30],['quarter','季度会员',28,90],['year','年度会员',99,365],['permanent','永久会员',299,0]].map(([id,name,price,days])=>store.normalizePlan({id,name,price,days,enabled:true}));
const out='.local/pages-responsive-20260928';
async function within(loc,w,h,label){const r=await loc.boundingBox();assert(r,label+' visible');assert(r.x>=-1&&r.x+r.width<=w+1&&r.y>=-1&&r.y+r.height<=h+1,label+JSON.stringify(r));}
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
for(const [width,height] of [[320,740],[390,844],[600,960],[768,1024],[820,1180],[1024,768],[844,390],[1440,960]]){
 if(process.env.RESPONSIVE_WIDTH&&width!==Number(process.env.RESPONSIVE_WIDTH))continue;
 const f=await fixture({newContext:async options=>{const c=await b.newContext({...options,viewport:{width,height},hasTouch:true,isMobile:width<=600});const route=c.route.bind(c);c.route=(pattern,handler)=>route(pattern,async r=>new URL(r.request().url()).pathname==='/api/shiyu/plans'?r.fulfill({json:{items:plans}}):handler(r));return c}}),p=f.page;
 await p.evaluate(()=>{prefs.workspaceGuideDoneV1=true;view='space';const s=data[0];s.scenes=Array.from({length:6},(_,i)=>({id:i?'scene'+i:'daily',name:'场景 '+i,groups:Array.from({length:5},(_,j)=>({id:i||j?'group'+i+'-'+j:'tools',name:'分组 '+j,items:Array.from({length:j?2:24},(_,k)=>['收藏网址 '+k,'https://example.test/'+k,'收藏的说明文字与灵感','网'])}))}));sceneId='daily';render()});
 const saved=await p.evaluate(()=>JSON.stringify(data));
 for(const mode of ['light','dark']){
  await p.evaluate(mode=>{prefs.mode=mode;render()},mode);
  for(const style of await p.evaluate(()=>Object.keys(LINK_VIEWS))){await p.evaluate(style=>{styles[currentGroup().id]=style;prefs.groupColumns??={};prefs.groupColumns[currentGroup().id]=6;renderGroups()},style);assert((await p.evaluate(()=>document.documentElement.scrollWidth))<=width+1,'space overflow '+style);const g=await p.locator('.cards[data-display]').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));assert(width>1100||g.scroll<=g.width+2,'cards overflow '+style+' '+width+' '+JSON.stringify(g));}
 }
 await p.evaluate(()=>{prefs.mode='light';styles[currentGroup().id]='cards';render()});
 await p.locator('.scene-button[data-scene=scene1]').tap();await p.locator('[data-group-tab="group1-1"]').tap();
 await p.locator('[data-action=add]').tap();await within(p.locator('#add'),width,height,'add');await p.locator('#add input[name=url]').fill('https://example.test/new');await p.setViewportSize({width,height:Math.max(320,height-160)});assert.equal(await p.locator('#add input[name=url]').inputValue(),'https://example.test/new');await p.evaluate(()=>document.querySelector('#add').close());await p.setViewportSize({width,height});
 await p.evaluate(()=>openLinkSettings());await within(p.locator('#link-view-settings'),width,height,'styles');await p.evaluate(()=>document.querySelector('#link-view-settings').close());
 await p.evaluate(()=>manageOrganization('scene'));await within(p.locator('#organization'),width,height,'scene management');await p.evaluate(()=>document.querySelector('#organization').close());
 await p.locator('.global-search-trigger').tap();await p.locator('.global-search-field input').fill('收藏');await within(p.locator('.global-search-results'),width,height,'search results');await p.locator('.global-search-field input').fill('');await p.locator('.global-search-trigger').tap();
 await p.locator('[data-display-scope-open]').tap();await within(p.locator('#display-scope-dialog'),width,height,'space settings');await p.evaluate(()=>document.querySelector('#display-scope-dialog').close());
 await p.evaluate(()=>openSpaceShare());await within(p.locator('#space-share-dialog'),width,height,'share');await p.evaluate(()=>document.querySelector('#space-share-dialog').close());
 await p.locator('.space-mode-entry').tap();await p.locator('#space-atlas[open]').waitFor();
 for(const dim of ['2d','3d']){
  if(await p.locator('.at-shell').getAttribute('data-mode')!==dim)await p.locator('[data-at=toggle-dimension]').tap();
  const views=await p.locator(`[data-at-view-panel="${dim}"] [data-at-view]`).evaluateAll(ns=>ns.map(n=>n.dataset.atView));
  for(const view of views){await p.locator('.at-view-current').tap();await p.locator(`[data-at-view="${view}"]`).tap();await p.waitForTimeout(100);await within(p.locator('.at-header-actions'),width,height,'atlas actions');await within(p.locator('.at-view-tools'),width,height,'atlas tools');assert.equal(await p.locator('.at-shell').getAttribute(dim==='2d'?'data-layout':'data-presentation'),view);}
 }
 // Real multi-touch events: pinch must zoom without altering the stored collection.
 const before=await p.locator('.at-node').first().getAttribute('style'),cdp=await p.context().newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width*.35,y:height*.5,id:1},{x:width*.65,y:height*.5,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width*.2,y:height*.5,id:1},{x:width*.8,y:height*.5,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(120);
 assert.notEqual(await p.locator('.at-node').first().getAttribute('style'),before,'pinch changes graph');assert.equal(await p.evaluate(()=>JSON.stringify(data)),saved,'pinch leaves collections intact');
 await p.screenshot({path:out+`/verified-atlas-${width}x${height}.png`});await p.evaluate(()=>document.querySelector('#space-atlas').close());
 await p.evaluate(()=>openMemberCenter());await p.waitForTimeout(150);assert.equal(await p.locator('[data-published-plan]').count(),5);assert(await p.locator('#member-center').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'member page overflow');
 await p.locator('[data-published-plan=year]').tap();assert.equal(await p.locator('[data-published-plan=year]').getAttribute('aria-pressed'),'true');await p.locator('[data-benefit-toggle=themes]').tap();assert((await p.locator('[data-benefit-detail=themes]').count())>0);
 await p.locator('[data-member-quantity]').tap();await p.locator('[data-member-quantity-value="2"]').tap();await p.locator('[data-member-agree]').check();assert.equal(await p.locator('[data-member-agree]').isChecked(),true);
 await p.screenshot({path:out+`/verified-member-${width}x${height}.png`});assert.deepEqual(f.errors,[]);await f.context.close();console.log('PASS space styles, graph views and touch, membership',width,height);
}
const p=await b.newPage();for(const width of [320,390,600,820,1024,1440]){await p.setViewportSize({width,height:960});await p.goto(process.env.SHIYU_PREVIEW_URL+'extension/',{waitUntil:'networkidle'});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'extension overflow');const frame=p.frames().find(f=>f.url().includes('popup.html'));assert(await frame.evaluate(()=>document.body.scrollWidth<=innerWidth),'preview overflow');await p.locator('.browser-picker button').last().click();await p.locator('summary').first().click();console.log('PASS extension',width)}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
