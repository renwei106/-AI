const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const p=await browser.newPage({viewport:{width:1381,height:1041}}),errors=[];
 p.on('pageerror',e=>errors.push(e.stack));
 await p.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
 await p.evaluate(()=>{prefs.mode='dark';prefs.theme='cinema';prefs.cornerCollections={guest:{groups:[{id:'inbox',system:'inbox',name:'暂存',icon:'lib-Inbox',iconMode:'manual',refs:[]},{id:'normal',name:'卡片',iconMode:'theme',refs:[]}],usage:{}}};render()});
 const click=async(loc,x=.5,y=.5)=>{const r=await loc.boundingBox();await p.mouse.click(r.x+r.width*x,r.y+r.height*y)},pause=()=>p.waitForTimeout(800);
 await p.locator('.corner-entry').click();await pause();
 const panel=p.locator('#my-corner'),inbox=p.locator('.corner-inbox'),lid=inbox.locator('.corner-inbox-lid'),front=inbox.locator('.corner-card-front'),open=()=>inbox.evaluate(e=>e.classList.contains('is-inbox-open'));
 assert.equal(await lid.locator('h3,small,svg').count(),0);
 for(const [x,y] of [[.12,.12],[.5,.5],[.9,.92]]){assert(!(await open()));await click(lid,x,y);await pause();assert(await open());assert.equal(await front.locator('.corner-flip-hint').evaluate(e=>getComputedStyle(e).cursor),'pointer');await click(front.locator('.corner-flip-hint'));await pause();assert(!(await open()));}
 const center=await lid.evaluate(e=>{const r=e.getBoundingClientRect(),a=e.querySelector('.corner-inbox-note>span').getBoundingClientRect(),b=e.querySelector('.corner-inbox-note>p').getBoundingClientRect();return {card:(r.top+r.bottom)/2,text:(a.top+b.bottom)/2,bg:getComputedStyle(e).backgroundColor,cursor:getComputedStyle(e).cursor}});
 assert(Math.abs(center.card-center.text)<2);assert.equal(center.cursor,'pointer');console.log('lid',center);
 const symbol=panel.locator('.corner-close-symbol');
 for(const hover of [false,true]){if(hover)await symbol.hover();else await p.mouse.move(10,10);await p.waitForTimeout(350);const r=await symbol.boundingBox();assert(Math.abs(r.width-r.height)<.1);assert(Math.abs(r.width-46)<.1);}
 await p.mouse.move(10,10);await p.screenshot({path:'checks/refined-inbox-closed-dark.png'});
 for(const [x,y] of [[30,400],[1300,450],[680,80]]){await p.mouse.click(x,y);assert(await panel.isVisible());}
 const bottom=await panel.locator('.corner-card:not(.is-away)').evaluateAll(es=>Math.max(...es.map(e=>e.getBoundingClientRect().bottom)));
 await p.mouse.click(900,Math.min(1020,bottom+55));assert(!(await panel.isVisible()));
 await p.evaluate(()=>{prefs.cornerCollections.guest.groups[0].refs=Array.from({length:30},(_,i)=>({id:'ref'+i,url:'https://example.com/'+i,own:['暂存网址 '+(i+1),'https://example.com/'+i,'']}));persist()});
 await p.locator('.corner-entry').click();await pause();assert(await open());
 await p.context().route('https://example.com/**',r=>r.fulfill({body:'Saved link'}));const popup=p.waitForEvent('popup');await click(inbox.locator('.corner-link>a').first());await(await popup).close();assert(await panel.isVisible());assert(await open());
 await click(inbox.locator('.corner-link-remove').first());assert.equal(await inbox.locator('.corner-link').count(),29);assert(await open());
 await p.screenshot({path:'checks/refined-inbox-open-dark.png'});
 await p.locator('.corner-close-entry').click();
 await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'atlas-refine'};prefs.mode='dark';goSpace(data[0].id)});await pause();
 await p.evaluate(()=>window.sharedControls=document.querySelector('.workspace .space-heading-controls'));
 const rect=await p.locator('.workspace .space-heading-controls').boundingBox();
 const sameHeader=async()=>{const r=await p.locator('.workspace .space-heading-controls').boundingBox();assert(await p.evaluate(()=>sharedControls===document.querySelector('.workspace .space-heading-controls')));for(const k of ['x','y','width','height'])assert(Math.abs(r[k]-rect[k])<1,`${k}: ${r[k]} vs ${rect[k]}`);assert.equal(await p.locator('.space-heading-controls').count(),1)};
 await p.locator('.workspace .space-mode-entry').click();await p.locator('[data-space-mode=atlas]').click();await pause();await sameHeader();
 const change=async(mode)=>{await p.locator('[data-at="views"]').click();if(['spatial','solar','systems'].includes(mode))await p.locator('[data-at-dimension="3d"]').click();else await p.locator('[data-at-dimension="2d"]').click();await p.locator(`[data-at-view="${mode}"]`).click();await p.mouse.move(200,60);await pause();await sameHeader()};
 const addShape=async()=>p.locator('.at-node[data-kind=add]').evaluate(e=>{const b=e.querySelector('.at-node-main'),m=e.querySelector('.at-add-mark'),peer=e.parentElement.querySelector('.at-node[data-level="1"][data-kind="'+e.dataset.addKind+'"]'),q=peer?.querySelector('.at-node-main'),s=peer?.querySelector('.at-orb,.at-logo');const shape=x=>{if(!x)return null;const r=x.getBoundingClientRect(),c=getComputedStyle(x);return {w:r.width,h:r.height,radius:c.borderRadius,border:c.borderStyle,bg:c.backgroundImage}};return {kind:e.dataset.addKind,main:shape(b),mark:shape(m),peer:shape(q),symbol:shape(s)}});
 const checkAdd=async(compact=false)=>{const s=await addShape();console.log('add',s);if(compact){assert.equal(s.main.border,'dashed');assert.equal(s.main.radius,s.peer.radius);assert(Math.abs(s.main.w-s.peer.w)<1&&Math.abs(s.main.h-s.peer.h)<1);}else{assert.equal(s.mark.border,'dashed');assert(Math.abs(s.mark.w-s.mark.h)<1);if(s.symbol){assert(Math.abs(s.mark.w-s.symbol.w)<1);assert.equal(s.mark.radius,s.symbol.radius)}}};
 await change('organization');await checkAdd(true);
 await p.locator('.at-node[data-kind=scene][data-level="1"] .at-node-main').first().click();await pause();await p.mouse.move(200,60);await pause();await checkAdd(true);
 const anchors=async()=>p.locator('.at-canvas').evaluate(e=>{const center=s=>{const r=e.querySelector(s).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}};return {root:center('.at-node[data-level="0"] .at-orb'),parent:center('.at-node.is-parent[data-kind=space] .at-orb')}});
 let a=await anchors();assert(Math.abs(a.root.y-a.parent.y)<1);assert(a.root.y<250);console.log('organization anchors',a);await p.screenshot({path:'checks/refined-atlas-organization.png'});
 await change('mindmap');await checkAdd(true);a=await anchors();assert(Math.abs(a.root.x-a.parent.x)<1);assert(a.root.x<250);console.log('mindmap anchors',a);await p.screenshot({path:'checks/refined-atlas-mindmap.png'});
 await change('radial');await checkAdd();await p.locator('.at-node.is-parent[data-kind=space] .at-node-main').click();await pause();await p.mouse.move(200,60);await pause();
 const opacity=await p.locator('.at-canvas').evaluate(e=>{const o=s=>+getComputedStyle(e.querySelector(s)).opacity;return {direct:o('.at-line[data-level="1"]'),deep:o('.at-line[data-level="2"]'),node:o('.at-node[data-level="2"]')}});console.log('opacity measured',opacity);await p.screenshot({path:'checks/refined-atlas-radial.png'});assert(opacity.direct>opacity.deep*2);assert(opacity.node<.6);console.log('radial opacity',opacity);await p.screenshot({path:'checks/refined-atlas-radial.png'});
 for(const mode of ['spatial','solar','systems']){await change(mode);await checkAdd()}
 await p.locator('.workspace .space-mode-entry').click();await p.locator('[data-space-mode=daily]').click();await pause();await sameHeader();
 assert.deepEqual(errors,[]);console.log('PASS lid hit areas and copy, footer cursor, round close, blank-region boundaries, links/remove, shared heading identity and geometry, add silhouettes, directed focus alignment, radial hierarchy, all graph layouts');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
