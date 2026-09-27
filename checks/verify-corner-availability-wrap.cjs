const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
  const config=await(await fetch('http://127.0.0.1:5175/api/shiyu/operations')).json();
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    async function openHome(modules,account){
      const page=await browser.newPage({viewport:{width:1375,height:992}});
      await page.addInitScript(id=>localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:true,prefs:{accountProfile:{id}}})),account);
      await page.route('**/api/shiyu/auth/**',route=>route.fulfill({status:503,json:{}}));
      await page.route('**/api/shiyu/operations',route=>route.fulfill({json:{...config,corner:{modules}}}));
      await page.goto('http://127.0.0.1:4337/',{waitUntil:'domcontentloaded'});
      await page.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');
      const shelf=page.frameLocator('#corner-orbit-demo');
      await shelf.locator('.core').hover({force:true});
      await shelf.locator('.core').dispatchEvent('pointermove');
      await shelf.locator('.stage.is-filled').waitFor();
      return{page,shelf};
    }
    const normal=await openHome(config.corner.modules,'corner-availability-check');
    const normalIds=await normal.shelf.locator('.menu-item:not([hidden])').evaluateAll(items=>items.map(item=>item.dataset.shiyuModuleId));
    const visibleIds=await normal.shelf.locator('.menu-item').evaluateAll(items=>items.filter(item=>getComputedStyle(item).display!=='none').map(item=>item.dataset.shiyuModuleId));
    assert.deepEqual(visibleIds,normalIds,'hidden placeholder items do not remain visible');
    assert(!normalIds.includes('todo')&&!normalIds.includes('emoji'),'disabled modules are absent from the home shelf');
    assert(normalIds.includes('excalidraw')&&normalIds.at(-1)==='toolbox','the configured external tool appears before Toolbox');
    const normalCore=await normal.shelf.locator('.core').boundingBox();
    await normal.page.goto('http://127.0.0.1:4337/?corner=toolbox',{waitUntil:'domcontentloaded'});
    await normal.page.locator('.corner-tool-row').first().waitFor();
    const toolboxIds=await normal.page.locator('.corner-tool-row').first().locator('.corner-tool-card').evaluateAll(cards=>[...new Set(cards.map(card=>card.dataset.toolCard))]);
    assert(!toolboxIds.includes('todo')&&!toolboxIds.includes('emoji'),'disabled modules are absent from the Toolbox catalog');
    assert(toolboxIds.includes('excalidraw'),'the external tool appears in Toolbox');
    const disabledExcalidraw=config.corner.modules.map(module=>module.id==='excalidraw'?{...module,enabled:false}:module);
    await normal.page.unroute('**/api/shiyu/operations');
    await normal.page.route('**/api/shiyu/operations',route=>route.fulfill({json:{...config,corner:{modules:disabledExcalidraw}}}));
    await normal.page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
    await normal.page.waitForFunction(()=>!ShiyuCornerModules.enabled().includes('excalidraw'));
    assert.equal(await normal.page.locator('.corner-tool-card[data-tool-card=excalidraw]').count(),0,'returning to an open Toolbox reflects an admin disable');
    await normal.page.close();

    const expanded=config.corner.modules.filter(module=>module.id!=='toolbox');
    for(let i=0;expanded.filter(module=>module.enabled).length<12;i++)expanded.push({id:'review-tool-'+i,enabled:true,entryName:'演示'+i,panelName:'演示'+i,icon:'',href:'https://excalidraw.com/'});
    expanded.push(config.corner.modules.find(module=>module.id==='toolbox'));
    const wrapped=await openHome(expanded,'corner-wrap-check');
    const layout=await wrapped.shelf.locator('.menu-shell').evaluate(shell=>{
      const core=document.querySelector('.core').getBoundingClientRect(),frame=window.frameElement?.getBoundingClientRect();
      const cards=[...shell.querySelectorAll('.menu-item:not([hidden])')].map(item=>({id:item.dataset.shiyuModuleId,top:Math.round(item.getBoundingClientRect().top)}));
      return{shell:shell.getBoundingClientRect().toJSON(),core:core.toJSON(),rows:[...new Set(cards.map(card=>card.top))],cards,columns:getComputedStyle(document.querySelector('.orbit')).gridTemplateColumns.split(' ').length,frameHeight:frame?.height};
    });
    assert.equal(layout.cards.length,13);
    assert.equal(layout.rows.length,2,'13 enabled applications occupy two rows');
    assert.equal(layout.cards.filter(card=>card.top===layout.rows[0]).length,12,'at most 12 applications fit on the first row');
    assert.equal(layout.columns,12);
    assert(layout.shell.bottom<layout.core.top,'the expanded shelf stays above the circular entrance');
    const wrappedCore=await wrapped.shelf.locator('.core').boundingBox();
    assert(Math.abs(wrappedCore.y-normalCore.y)<3,'expanding upward keeps the circular entrance in place');
    await wrapped.page.screenshot({path:'.local/corner-shelf-13-tools.png'});
    const start=await wrapped.shelf.locator('[data-shiyu-module-id=common]').boundingBox(),end=await wrapped.shelf.locator('[data-shiyu-module-id=toolbox]').boundingBox();
    await wrapped.page.mouse.move(start.x+start.width/2,start.y+start.height/2);
    await wrapped.page.mouse.down();
    await wrapped.page.waitForTimeout(330);
    await wrapped.page.mouse.move(end.x+end.width/2,end.y+end.height/2,{steps:10});
    await wrapped.page.mouse.up();
    const reordered=await wrapped.shelf.locator('.menu-item:not([hidden])').evaluateAll(items=>items.map(item=>item.dataset.shiyuModuleId));
    assert.equal(reordered.at(-1),'toolbox');
    assert.equal(reordered.at(-2),'common','dragging to the second row reorders the item before Toolbox');
    assert.equal(await wrapped.page.locator('#my-corner[open]').count(),0,'releasing a dragged item does not open an app');
    await wrapped.shelf.locator('[data-shiyu-module-id=excalidraw]').click();
    await wrapped.page.locator('#my-corner[data-corner-module=excalidraw][open]').waitFor();
    assert.equal(await wrapped.page.locator('[data-corner-launch-tool=excalidraw]').count(),1);
    await wrapped.page.close();
    console.log('PASS: backend availability, Excalidraw catalog/cover, and 13-tool upward wrap');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
