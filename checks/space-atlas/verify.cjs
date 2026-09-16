const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fixture=require('./baseline.json');
const errors=[];
const report=[];
const wait=page=>page.waitForTimeout(420);
async function hoverClick(page,selector){const locator=page.locator(selector).first();await locator.hover({force:true});await locator.click();await wait(page)}
async function collisions(page){return page.evaluate(()=>{
 const root=document.querySelector('.at-canvas').getBoundingClientRect();
 const nodes=[...document.querySelectorAll('.at-node')].map(e=>({name:e.textContent,rect:e.getBoundingClientRect()}));
 const overlaps=[],clipped=[];
 for(let i=0;i<nodes.length;i++){const a=nodes[i],ar=a.rect;
   if(ar.left<root.left-1||ar.right>root.right+1||ar.top<root.top-1||ar.bottom>root.bottom+1)clipped.push(a.name);
   for(let j=i+1;j<nodes.length;j++){const b=nodes[j],br=b.rect;const ox=Math.min(ar.right,br.right)-Math.max(ar.left,br.left),oy=Math.min(ar.bottom,br.bottom)-Math.max(ar.top,br.top);if(ox>1&&oy>1)overlaps.push([a.name,b.name,ox,oy]);}
 }
 return {count:nodes.length,overlaps,clipped};
})}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1573,height:1041},reducedMotion:'reduce'});
 await context.addInitScript(value=>{if(!localStorage.getItem('atlas-test-seeded')){localStorage.setItem('yiyu-prototype-v1',JSON.stringify({...value,signed:true}));localStorage.setItem('atlas-test-seeded','1')}},fixture);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4318');
 await page.evaluate(()=>{prefs.theme='base';prefs.mode='light';goSpace('work')});
 const original=await page.evaluate(()=>JSON.stringify(data));
 await page.locator('.space-atlas-entry').click();await wait(page);
 assert.equal(await page.locator('.at-node[data-kind=link]').count(),0);
 assert(await page.locator('.at-node[data-kind=scene]').count()>1);
 assert(await page.locator('.at-node[data-kind=bundle]').count()>1);
 const scene=page.locator('.at-node[data-key="c:daily"]');await scene.hover({force:true});
 assert(await page.locator('.at-node.is-muted').count()>0);
 assert(await scene.evaluate(el=>el.classList.contains('is-related')));
 assert(await page.locator('.at-node[data-key="s:work"]').evaluate(el=>el.classList.contains('is-related')));
 await page.mouse.move(100,80);await wait(page);
 report.push({case:'large space default',...await collisions(page)});
 await page.locator('[data-at=depth]').click();await page.locator('[data-at-depth="99"]').click();await wait(page);
 assert(await page.locator('.at-node[data-kind=bundle]').count()>0);
 report.push({case:'large space all levels',...await collisions(page)});
 await page.locator('[data-at=daily]').click();assert.equal(await page.evaluate(()=>JSON.stringify(data)),original);
 await page.evaluate(()=>goSpace('create'));await page.locator('.space-atlas-entry').click();await wait(page);
 report.push({case:'inspiration 3d',...await collisions(page)});
 await hoverClick(page,'[data-at-focus="c:ai"]');
 assert.equal(await page.locator('.at-node.is-parent').count(),1);
 assert.equal(await page.locator('.at-node[data-kind=link]').count(),3);
 assert.equal(await page.locator('.at-peer').count(),6);
 await page.locator('.at-peer[data-at-focus="c:mock-inspiration-v1-0"]').click();await wait(page);
 assert.match(await page.locator('.at-path').innerText(),/设计灵感/);
 await page.locator('.at-peer[data-at-focus="c:ai"]').click();await wait(page);
 await hoverClick(page,'[data-at-focus="g:assistants"]');
 assert.equal(await page.locator('.at-site').count(),3);
 assert.equal(await page.locator('.at-site a').first().getAttribute('target'),'_blank');
 const beforeFocus=await page.locator('.at-path').innerText();
 const popupPromise=context.waitForEvent('page');await page.locator('.at-site a').first().click();const popup=await popupPromise;await popup.close();assert.equal(await page.locator('.at-path').innerText(),beforeFocus);
 await page.locator('[data-at-layout=list]').click();assert(await page.locator('.at-site-grid.is-list').isVisible());
 await page.locator('[data-at=daily]').click();await page.evaluate(()=>{prefs.membership={expiresAt:Date.now()+86400000};render()});
 await page.locator('.space-atlas-entry').click();await wait(page);
 await page.locator('.at-search input').fill('DeepSeek');assert(await page.locator('.at-search-results').isVisible());
 await page.locator('[data-at-locate]').first().click();await wait(page);
 await page.locator('.at-site').first().hover();await page.locator('.at-site [data-at-details]').first().click();
 await page.locator('[data-at-manage=edit]').click();assert(await page.locator('#bookmark-editor').isVisible());
 await page.locator('#bookmark-editor-form [name=name]').fill('图谱编辑验证');await page.locator('#bookmark-editor-form [type=submit]').click();await wait(page);
 assert.match(await page.locator('.at-site').first().innerText(),/图谱编辑验证/);
 await page.locator('.at-site').first().hover();await page.locator('.at-site [data-at-details]').first().click();await page.locator('[data-at-manage=move]').click();
 await page.locator('.at-drawer input').fill('界面设计');await page.locator('[data-at-destination]').first().click();await wait(page);
 assert.equal(await page.locator('.at-site').count(),2);assert(await page.locator('[data-at=undo]').isVisible());
 await page.locator('[data-at=undo]').click();await wait(page);assert.equal(await page.locator('.at-site').count(),3);
 await page.locator('.at-site').first().hover();await page.locator('.at-site [data-at-details]').first().click();await page.locator('[data-at-manage=down]').click();await wait(page);
 assert.match(await page.locator('.at-site').nth(1).innerText(),/图谱编辑验证/);
 await page.locator('.at-site').nth(1).hover();await page.locator('.at-site [data-at-details]').nth(1).click();await page.locator('[data-at-manage=delete]').click();await page.locator('[data-at-delete]').click();await wait(page);
 assert.equal(await page.locator('.at-site').count(),2);await page.locator('[data-at=undo]').click();await wait(page);assert.equal(await page.locator('.at-site').count(),3);
 await page.locator('[data-at=daily]').click();assert.match(await page.locator('.group:not([hidden])').innerText(),/图谱编辑验证/);
 await page.locator('.space-atlas-entry').click();await wait(page);await hoverClick(page,'[data-at-focus="c:ai"]');
 await page.locator('[data-at=add]').click();await page.locator('#organization-name').fill('图谱新增分组');await page.locator('#organization-form [type=submit]').click();await wait(page);
 assert.match(await page.locator('.at-canvas').innerText(),/图谱新增分组/);
 await page.locator('[data-at=daily]').click();await page.evaluate(()=>{prefs.mode='dark';prefs.color='#9270c2';render()});await page.locator('.space-atlas-entry').click();await wait(page);
 assert.equal(await page.locator('#space-atlas').evaluate(el=>getComputedStyle(el).color),'rgb(239, 239, 234)');
 await page.locator('[data-at-mode="2d"]').click();await wait(page);report.push({case:'inspiration 2d',...await collisions(page)});
 await page.locator('[data-at=depth]').click();await page.locator('[data-at-depth="99"]').click();await wait(page);report.push({case:'inspiration 2d all',...await collisions(page)});
 await page.locator('[data-at=daily]').click();await page.reload();await page.evaluate(()=>goSpace('create'));await page.locator('.space-atlas-entry').click();await wait(page);
 assert.equal(await page.locator('[data-at-mode="2d"]').getAttribute('aria-pressed'),'true');assert.match(await page.locator('[data-at=depth]').innerText(),/全部下级/);
 for(const size of [{width:1280,height:800},{width:390,height:844},{width:2560,height:1440}]){await page.setViewportSize(size);await wait(page);report.push({case:`${size.width} 2d`,...await collisions(page)});await page.locator('[data-at-mode="3d"]').click();await wait(page);report.push({case:`${size.width} 3d`,...await collisions(page)});await page.locator('[data-at-mode="2d"]').click();}
 await page.locator('[data-at=daily]').click();await page.evaluate(()=>{signed=false;prefs.membership=null;goSpace('life')});await page.locator('.space-atlas-entry').click();await wait(page);await page.locator('[data-at=add]').click();assert(await page.locator('#login').isVisible());
 await context.close();
 // File preview must work without a server or third-party graph dependencies.
 const filePage=await browser.newPage();filePage.on('pageerror',e=>errors.push(e.message));await filePage.goto(pathToFileURL(path.resolve('dist/index.html')).href);await filePage.evaluate(()=>goSpace('life'));await filePage.locator('.space-atlas-entry').click();await wait(filePage);assert(await filePage.locator('.at-node').count()>0);await filePage.close();
 fs.writeFileSync('checks/space-atlas/report.json',JSON.stringify({report,errors},null,2));
 console.log(JSON.stringify({report,errors},null,2));assert.deepEqual(errors,[]);
 for(const r of report){assert.equal(r.overlaps.length,0,r.case+' has overlapping node labels');assert.equal(r.clipped.length,0,r.case+' has clipped nodes');}
 await browser.close();console.log('PASS: hierarchy, hover, direct URL opening, peers, edit, move, undo, order, create, themes, settings, responsive layouts, login and file preview');
})().catch(e=>{console.error(e);process.exit(1)});
