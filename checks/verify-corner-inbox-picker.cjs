const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const p=await browser.newPage({viewport:{width:1381,height:1041}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});
 const groups=await p.evaluate(()=>prefs.cornerCollections.guest.groups);assert.equal(groups.length,4);assert.equal(groups[0].system,'inbox');assert.equal(groups[0].name,'暂存');
 assert.equal(await p.locator('.corner-peek-groups [data-corner-peek="'+groups[0].id+'"]').count(),0);
 await p.reload({waitUntil:'networkidle'});assert.equal(await p.evaluate(()=>prefs.cornerCollections.guest.groups.filter(g=>g.system==='inbox').length),1);
 await p.locator('.corner-entry').click();await p.waitForTimeout(600);
 assert.equal(await p.locator('.corner-inbox [data-corner-delete]').count(),0);assert.equal(await p.locator('.corner-inbox [data-corner-drag-group]').count(),0);
 assert.equal(await p.locator('[data-corner-new] .corner-member-badge').count(),1);
 const original=await p.evaluate(()=>JSON.stringify(data));
 // Each settled back must visibly animate on its way to the front, including repeated visits.
 for(let i=0;i<3;i++){
  await p.locator('.corner-deck>.is-center .corner-card-front').evaluate(e=>e.click());await p.waitForTimeout(950);
  assert(await p.locator('.corner-deck>.is-center').evaluate(e=>e.classList.contains('is-flipped')));
  await p.locator('.corner-deck>.is-center .corner-back-header').click();await p.waitForTimeout(210);
  const transform=await p.locator('.corner-deck>.is-center .corner-card-turn').evaluate(e=>getComputedStyle(e).transform);
  assert(transform.startsWith('matrix3d('),'flip '+i+' must be animated: '+transform);
  await p.waitForTimeout(750);assert(await p.locator('.corner-deck>.is-center').evaluate(e=>e.classList.contains('is-settled')&&!e.classList.contains('is-flipped')));
 }
 const before=await p.evaluate(()=>({theme:prefs.theme,mode:prefs.mode,color:prefs.color}));
 await p.locator('[data-corner-cord=mode]').click();await p.waitForTimeout(180);
 assert.equal(await p.evaluate(()=>prefs.theme),before.theme);assert.notEqual(await p.evaluate(()=>prefs.mode),before.mode);assert.equal(await p.evaluate(()=>prefs.color),before.color);
 await p.locator('[data-corner-cord=color]').click();await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>prefs.theme),before.theme);assert.notEqual(await p.evaluate(()=>prefs.color),before.color);
 await p.locator('.corner-deck>.is-center [data-corner-add-links]').evaluate(e=>e.click());
 assert.equal(await p.locator('#corner-picker .dialog-heading p').count(),0);
 assert.equal(await p.locator('.corner-library-nav input').count(),0);
 const menuBoxes=await p.locator('.corner-library-nav>details').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));for(const box of menuBoxes)assert(Math.abs(box.x-menuBoxes[0].x)<2);assert(menuBoxes[0].width>170);
 const first=await p.locator('.corner-source-list input').count();assert(first>0);
 await p.locator('[data-library-select-group]').click();assert.equal(await p.locator('.corner-source-list input:checked').count(),first);
 const other=await p.locator('[data-library-group]').nth(1).getAttribute('data-library-group');
 await p.locator('[data-library-group="'+other+'"]').evaluate(e=>e.click());assert.equal(await p.locator('.corner-source-list input:checked').count(),0);
 const query=await p.evaluate(()=>data[0].scenes[0].name);
 await p.locator('#corner-search').fill(query);assert((await p.locator('.corner-source-list input').count())>0);assert.equal(await p.locator('[data-library-select-group]').count(),0);
 const count=await p.evaluate(q=>data.flatMap(s=>s.scenes.flatMap(c=>c.groups.flatMap(g=>g.items.filter(i=>(i[0]+' '+i[1]+' '+s.name+' / '+c.name+' / '+g.name).toLowerCase().includes(q.toLowerCase()))))).length,query);
 assert.equal(await p.locator('.corner-source-list input').count(),count);
 const dimensions=await p.locator('#corner-save').evaluate(e=>({w:e.offsetWidth,h:e.offsetHeight,inner:e.parentElement.clientWidth-parseFloat(getComputedStyle(e.parentElement).paddingLeft)-parseFloat(getComputedStyle(e.parentElement).paddingRight)}));assert(dimensions.h>=48);assert(Math.abs(dimensions.w-dimensions.inner)<2);
 await p.screenshot({path:'checks/corner-inbox-picker-desktop.png'});
 await p.locator('#corner-save').click();assert.equal(await p.locator('.corner-deck>.is-center .corner-link').count(),first);assert.equal(await p.evaluate(()=>JSON.stringify(data)),original);
 // An expired member defaults to inbox, while an existing card remains selectable.
 await p.locator('.corner-close-entry').click();
 await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'inbox-regression'};prefs.membership={expiresAt:Date.now()-10000};prefs.membershipDemo={expiresAt:0};prefs.cornerCollections['inbox-regression']=JSON.parse(JSON.stringify(prefs.cornerCollections.guest));persist();render();});
 await p.locator('.corner-entry').click();await p.waitForTimeout(350);
 const active=await p.locator('.corner-deck>.is-center').getAttribute('data-corner-card');
 await p.locator('.corner-deck>.is-center [data-corner-add-links]').evaluate(e=>e.click());assert.equal(await p.locator('#corner-destination').inputValue(),groups[0].id);
 await p.locator('#corner-destination').selectOption(active);await p.locator('[data-add-tab=paste]').click();await p.locator('.corner-pasted-links textarea').fill('https://example.net 暂存回归');await p.locator('#corner-save').click();assert(await p.locator('.corner-deck>.is-center .corner-link').filter({hasText:'暂存回归'}).count());
 await p.locator('.corner-deck>.is-center [data-corner-add-links]').evaluate(e=>e.click());await p.locator('[data-add-tab=paste]').click();await p.locator('.corner-pasted-links textarea').fill('https://example.org 默认暂存');await p.locator('#corner-save').click();assert.equal(await p.locator('.corner-inbox .corner-link').count(),1);
 await p.locator('.corner-close-entry').click();await p.evaluate(()=>{prefs.mode='light';render();});await p.setViewportSize({width:390,height:844});await p.locator('.corner-entry').click();await p.waitForTimeout(350);await p.locator('.corner-deck>.is-center [data-corner-add-links]').evaluate(e=>e.click());await p.screenshot({path:'checks/corner-inbox-picker-mobile.png'});
 assert(await p.locator('.corner-library-content').isVisible());assert(await p.locator('#corner-save').isVisible());
 await p.locator('#corner-picker').evaluate(e=>e.close());await p.locator('.corner-close-entry').click();await p.setViewportSize({width:1381,height:1041});
 await p.evaluate(()=>{prefs.mode='dark';prefs.membership={expiresAt:Date.now()+86400000};const g=prefs.cornerCollections['inbox-regression'].groups;while(g.filter(x=>x.system!=='inbox').length<11)g.push({id:crypto.randomUUID(),name:'会员卡片',iconMode:'theme',iconSlot:g.length,refs:[]});persist();render();});await p.locator('.corner-entry').click();await p.waitForTimeout(400);
 // Member has 11 custom cards plus inbox, so may still add the twelfth.
 assert.equal(await p.locator('[data-corner-new]').isDisabled(),false);await p.locator('[data-corner-new]').evaluate(e=>e.click());await p.waitForTimeout(950);
 assert.equal(await p.evaluate(()=>prefs.cornerCollections['inbox-regression'].groups.length),13);assert.equal(await p.locator('[data-corner-new]').isDisabled(),true);await p.mouse.click(690,145);await p.waitForTimeout(950);
 await p.locator('.corner-deck>.is-center [data-corner-add-links]').evaluate(e=>e.click());await p.screenshot({path:'checks/corner-inbox-picker-dark.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: permanent inbox migration, hover excluded, free quota, repeated animated flips, mode/color cords, hierarchical single-group select-all, global search, full-width save, expired-member destinations, preserved source data, desktop/mobile');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
