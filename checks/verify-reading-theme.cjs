const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
let browser;
async function noOverlap(page){
 const boxes=await page.locator('.cards[data-display=shelf]>.bookmark:not(.page-hidden),.cards[data-display=shelf]>.shelf-add').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,name:e.textContent}}));
 for(let i=0;i<boxes.length;i++){const a=boxes[i];assert(a.w>=200&&a.h>=44,`readable book: ${JSON.stringify(a)}`);for(let j=i+1;j<boxes.length;j++){const b=boxes[j];assert(!(a.x<b.right-1&&a.right>b.x+1&&a.y<b.bottom-1&&a.bottom>b.y+1),'books must not overlap');}}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
}
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1288,height:1041}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4318/?theme=reading',{waitUntil:'networkidle'});
 await page.evaluate(()=>{signed=true;document.querySelector('.brand-guide')?.remove()});
 await page.locator('.reading-gallery').waitFor();
 assert.equal(await page.locator('[data-reading-world]>svg').count(),1);
 await page.keyboard.press('Slash');await page.locator('#quick-search[open]').waitFor();await page.keyboard.press('Escape');
 await page.locator('[data-action=settings]').click();assert.equal(await page.locator('[data-v2-theme=reading]').count(),1);await page.screenshot({path:'checks/reading-theme-menu.png'});await page.keyboard.press('Escape');
 for(const [name,width,height] of [['light',1288,1041],['wide',2560,1440],['mobile',390,844],['short',1288,650]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(120);await page.screenshot({path:`checks/reading-home-${name}.png`});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const turn=await page.locator('.reading-gallery-nav').boundingBox(),dock=await page.locator('.dock-trigger').boundingBox();assert(turn.y>=65&&!(turn.x<dock.x+dock.width&&turn.x+turn.width>dock.x&&turn.y<dock.y+dock.height&&turn.y+turn.height>dock.y),'home interaction keeps controls free');
 }
 await page.setViewportSize({width:1288,height:1041});await page.evaluate(()=>{prefs.mode='dark';persist()});await page.reload({waitUntil:'networkidle'});await page.screenshot({path:'checks/reading-home-dark.png'});
 assert.equal(await page.locator('body').getAttribute('data-dark'),'true');
 await page.evaluate(()=>{signed=true;goSpace(data[0].id);scope='global';changeTheme('reading')});
 const dataBefore=await page.evaluate(()=>JSON.stringify(data));
 await page.locator('[data-link-settings]').click();const choice=page.locator('[data-link-view=shelf]');assert(await choice.isVisible());assert.equal(await choice.evaluate(e=>!!e.closest('.more-link-views')),false);assert.equal(await choice.locator('.membership-badge').count(),0);await page.screenshot({path:'checks/reading-style-menu.png'});
 await choice.click();await noOverlap(page);assert.equal(await page.evaluate(()=>JSON.stringify(data)),dataBefore);assert.equal(await page.locator('.shelf-spine').count(),3);assert(await page.locator('.shelf-mark img').count()>=3);
 await page.screenshot({path:'checks/reading-shelf-dark.png'});
 // The book remains a real external link with editing, while cards expose no direct delete action.
 const first=page.locator('.cards[data-display=shelf]>.bookmark').first();assert.equal(await page.locator('.cards[data-display=shelf]>.bookmark>.remove').count(),0);const href=await first.locator('a').getAttribute('href');assert(href.startsWith('https://'));
 await context.route(href+'**',r=>r.fulfill({contentType:'text/html',body:'<title>Book opened</title>'}));
 const popupEvent=page.waitForEvent('popup');await first.locator('a').click();const popup=await popupEvent;await popup.waitForLoadState();await popup.close();
 await first.hover();await first.locator('.bookmark-edit').click();await page.locator('#bookmark-editor [name=name]').fill('我的藏书测试');await page.locator('#bookmark-editor [type=submit]').click();assert.equal(await page.locator('.shelf-title').first().innerText(),'我的藏书测试');
 await page.locator('.shelf-add').click();await page.locator('#add[open]').waitFor();assert.equal(await page.locator('#add-group').inputValue(),await page.evaluate(()=>currentGroup().id));await page.keyboard.press('Escape');
 assert.equal(await page.locator('#member-gate[open]').count(),0);
 // Test many books, long names, multiple shelf tiers, pagination and sorting using isolated data.
 await page.evaluate(()=>{const g=currentGroup(),sample=g.items.map(i=>[...i]);g.items=Array.from({length:23},(_,i)=>[i===5?'一本名字比较长的设计与阅读灵感资料收藏':sample[i%3][0]+' '+(i+1),`https://example.com/reading-${i}`,sample[i%3][2],sample[i%3][3]]);prefs.mode='light';persist();render()});
 await noOverlap(page);await page.evaluate(()=>{window.scrollTo(0,0);document.activeElement.blur()});await page.mouse.move(20,500);await page.waitForTimeout(400);await page.screenshot({path:'checks/reading-shelf-light.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);await noOverlap(page);await page.screenshot({path:'checks/reading-shelf-mobile.png',fullPage:true});
 await page.setViewportSize({width:1288,height:1041});await page.locator('#bookmark-page-size').selectOption('10');await page.locator('[data-bookmark-page="2"]').first().click();await noOverlap(page);assert.equal(await page.locator('.bookmark:not(.page-hidden) .shelf-spine').count(),10);
 const original=await page.evaluate(()=>currentGroup().items.map(i=>i[1]));await page.evaluate(()=>window.scrollTo(0,0));
 const books=page.locator('.cards[data-display=shelf]>.bookmark:not(.page-hidden)');const a=await books.nth(0).boundingBox(),b=await books.nth(2).boundingBox();await page.mouse.move(a.x+80,a.y+30);await page.mouse.down();await page.waitForTimeout(450);await page.mouse.move(b.x+80,b.y+b.height-8,{steps:10});await page.waitForTimeout(120);await page.mouse.up();await page.waitForTimeout(550);
 const after=await page.evaluate(()=>currentGroup().items.map(i=>i[1]));assert.notDeepEqual(after,original);assert.deepEqual([...after].sort(),[...original].sort());assert.deepEqual(after.slice(0,10),original.slice(0,10),'page one order preserved');assert.deepEqual(after.slice(20),original.slice(20),'page three order preserved');await noOverlap(page);
 await page.locator('[data-link-settings]').click();assert.equal(await choice.getAttribute('aria-pressed'),'true');await page.locator('[data-link-view=follow]').click();assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'shelf');
 await page.goto('http://127.0.0.1:4318/',{waitUntil:'networkidle'});assert.equal(await page.locator('.home-reading').count(),1);await page.evaluate(()=>goSpace(data[0].id));assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'shelf');
 await page.locator('[data-link-settings]').click();await choice.click();await page.evaluate(()=>{scope='global';changeTheme('base')});assert.equal(await page.locator('.group:not([hidden]) .cards').getAttribute('data-display'),'shelf');await noOverlap(page);
 await page.locator('[data-link-settings]').click();await page.locator('[data-link-view=cards]').click();assert.equal(await page.locator('.shelf-spine').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: reading home and shelf light/dark, 4 viewports, visible theme/style entries, search, real link opening, editing/add destination, page-two drag preserves all items, pagination, follow theme, reload, independent style.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
