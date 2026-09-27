const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1375,height:992}});
    await page.route('**/api/shiyu/auth/**',route=>route.fulfill({status:503,json:{}}));
    await page.goto('http://127.0.0.1:4337/',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>{signed=true;prefs.accountProfile={id:'home-shelf-check'};localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));render()});
    await page.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');
    assert.equal(await page.locator('#corner-orbit-backup').count(),0,'old 180-degree entrance is removed');
    const shelf=page.frameLocator('#corner-orbit-demo');
    const clickCore=async()=>{const r=await shelf.locator('.core-hit').boundingBox();await page.mouse.click(r.x+r.width/2,r.y+r.height/2)};
    const close=async()=>{await page.locator('.corner-close-entry').click();await page.waitForFunction(()=>!document.querySelector('#my-corner').open)};
    const openShelf=async()=>{await shelf.locator('.core').hover({force:true});await shelf.locator('.core').dispatchEvent('pointermove');await shelf.locator('.stage.is-filled').waitFor()};

    await openShelf();await clickCore();await page.waitForSelector('#my-corner[open]');
    assert.equal(await page.locator('.corner-close-arrow').count(),0);
    assert.equal(await page.locator('.corner-close-x').evaluate(el=>getComputedStyle(el).opacity),'1');
    await close();

    const fillStart=performance.now();await openShelf();
    assert(performance.now()-fillStart<1200,'home shelf fills in roughly half a second');
    const before=await shelf.locator('.menu-item:not([hidden])').evaluateAll(items=>items.map(item=>item.dataset.shiyuModuleId));
    assert.equal(before.at(-1),'toolbox');
    assert.equal(before.length,await page.evaluate(()=>ShiyuCornerModules.enabled().length));
    assert.equal(await shelf.locator('.menu-item .tool-art').count(),before.length-1,'shelf reuses Toolbox artwork for every tool');
    assert.equal(await shelf.locator('.home-shelf-settings>button').innerText(),'','settings is icon-only');
    assert.equal(await shelf.locator('[data-shiyu-module-id=common] .shelf-tag-body').count(),1,'common uses a tag drawing');
    for(const item of await shelf.locator('.menu-item .tool-art').all())assert.equal(await item.evaluate(el=>getComputedStyle(el).filter),'grayscale(1)','all shelf artwork starts without color');
    const layout=await shelf.locator('.menu-shell').evaluate(shell=>{const bounds=element=>{const r=element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};return{shell:bounds(shell),core:bounds(document.querySelector('.core')),heading:bounds(shell.querySelector('.home-shelf-heading')),row:bounds(shell.querySelector('.orbit')),settings:bounds(shell.querySelector('.home-shelf-settings>button')),cards:[...shell.querySelectorAll('.menu-item:not([hidden])')].map(item=>({id:item.dataset.shiyuModuleId,card:bounds(item),label:bounds(item.querySelector('.shiyu-module-label')),art:bounds(item.querySelector('.cutout-art>span,.emoji-face,.palette-art>span:first-child,.icons-art>span:first-child,.standard-art>span,.shelf-common-art>svg,.memo-art>svg,.todo-art>svg')||item.querySelector('svg,img'))}))}});
    assert(layout.shell.bottom<=layout.core.y,'the open shelf stays above the central circle');
    const toolbox=layout.cards.find(card=>card.id==='toolbox');
    assert(layout.settings.bottom<toolbox.card.y&&layout.settings.right<=layout.shell.right,'settings stays in the shelf header');
    assert(layout.heading.bottom<layout.row.y+7,'shelf title and drag hint have their own header row');
    await page.screenshot({path:'.local/home-shelf-layout.png'});
    for(const {id,card,label,art} of layout.cards){assert(label.y>=card.y&&label.bottom<=card.bottom,`${id} label stays inside its card`);assert(art.bottom<=label.y+1,`${id} artwork stays above its label: ${JSON.stringify({art,label})}`)}
    for(const id of before.filter(id=>id!=='toolbox')){const item=shelf.locator('.menu-item[data-shiyu-module-id='+id+']');await item.hover();await page.waitForTimeout(350);assert.equal(await item.locator('.tool-art').evaluate(el=>getComputedStyle(el).filter),'grayscale(0)',`${id} artwork gains color on hover`)}
    const commonArt=shelf.locator('[data-shiyu-module-id=common] .shelf-tag');
    const artBefore=await commonArt.evaluate(el=>getComputedStyle(el).transform);
    const source=await shelf.locator('[data-shiyu-module-id=common]').boundingBox();
    const target=await shelf.locator('[data-shiyu-module-id='+before.find(id=>id!=='common'&&id!=='toolbox')+']').boundingBox();
    await page.mouse.move(source.x+source.width/2,source.y+source.height/2);
    await page.waitForTimeout(750);
    assert.notEqual(await commonArt.evaluate(el=>getComputedStyle(el).transform),artBefore,'shelf icon animates on hover');
    assert.equal(await shelf.locator('[data-shiyu-module-id=common] .tool-art').evaluate(el=>getComputedStyle(el).filter),'grayscale(0)','hover restores icon color');
    await page.mouse.down();
    await page.waitForTimeout(340);assert.equal(await shelf.locator('.menu-item.is-dragging').count(),1);
    assert.equal(await shelf.locator('.home-shelf-placeholder').count(),0,'drag never inserts a spare slot');
    const dropX=target.x+target.width*.8,dropY=target.y+target.height/2;
    await page.mouse.move(dropX,dropY,{steps:8});
    const dragged=await shelf.locator('.menu-item.is-dragging').boundingBox();
    assert(Math.abs(dragged.x+dragged.width/2-dropX)<16,'dragged card follows the pointer');
    await page.mouse.up();
    await page.waitForTimeout(120);
    assert.equal(await page.locator('#my-corner[open]').count(),0,'releasing a reordered item does not open a module');
    const reordered=await shelf.locator('.menu-item:not([hidden])').evaluateAll(items=>items.map(item=>item.dataset.shiyuModuleId));
    assert.notDeepEqual(reordered,before);assert.equal(reordered.at(-1),'toolbox');
    assert.deepEqual(await page.evaluate(()=>prefs.cornerShelfOrderV1['home-shelf-check']),reordered.slice(0,-1));
    await shelf.locator('.menu-item[data-shiyu-module-id=memo]').click();
    await page.waitForSelector('#my-corner[open][data-corner-module=memo]');await close();
    await page.goto('http://127.0.0.1:4337/?corner=toolbox',{waitUntil:'domcontentloaded'});
    await page.locator('.corner-tool-row').first().waitFor();
    const rowOrder=await page.locator('.corner-tool-row').first().locator('[data-corner-open-tool]').evaluateAll((items,count)=>items.slice(0,count).map(item=>item.dataset.cornerOpenTool),reordered.length-1);
    assert.deepEqual(rowOrder,reordered.filter(id=>id!=='toolbox'),'Toolbox rows use the user shelf order');
    await page.goto('http://127.0.0.1:4337/',{waitUntil:'domcontentloaded'});
    await page.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');

    await openShelf();await shelf.locator('.menu-item[data-shiyu-module-id=memo]').click();
    await page.waitForSelector('#my-corner[open][data-corner-module=memo]');await close();
    await page.mouse.move(1150,680);await page.waitForTimeout(550);await clickCore();
    await page.waitForSelector('#my-corner[open][data-corner-module=memo]');await close();

    await openShelf();await shelf.locator('.home-shelf-settings>button').click();
    await page.locator('#corner-home-settings[open]').waitFor();
    await page.screenshot({path:'.local/home-shelf-settings.png'});
    await page.evaluate(()=>{prefs.mode='dark';apply()});
    await page.waitForTimeout(350);
    await page.screenshot({path:'.local/home-shelf-settings-dark.png'});
    const darkColors=await page.locator('#corner-home-settings .corner-home-settings-app').first().evaluate(el=>({background:getComputedStyle(el).backgroundColor,text:getComputedStyle(el).color,surface:getComputedStyle(el).getPropertyValue('--surface')}));
    assert(Number(darkColors.background.match(/\d+/g)?.[0])<100,`dark settings tile keeps a dark surface: ${JSON.stringify(darkColors)}`);
    await page.evaluate(()=>{prefs.mode='light';apply()});
    await page.setViewportSize({width:390,height:780});
    const modalBounds=await page.locator('#corner-home-settings').boundingBox();
    assert(modalBounds.x>=0&&modalBounds.x+modalBounds.width<=390,'settings fit a mobile viewport');
    await page.setViewportSize({width:1375,height:992});
    assert.equal(await page.locator('#corner-home-settings .corner-home-settings-app').count(),before.length);
    const pinCandidate=reordered.filter(id=>id!=='toolbox'&&!['common','memo','todo'].includes(id)).at(-1);
    await page.locator('#corner-home-settings .corner-home-settings-app[data-module-id='+pinCandidate+']').click();
    await page.locator('#corner-home-settings input[value=specific]').check();
    await page.locator('#corner-home-settings select').selectOption('toolbox');
    await page.locator('#corner-home-settings [data-settings-save]').click();
    assert.equal(await page.locator('#corner-home-settings').count(),0);
    assert((await shelf.locator('.menu-item:not([hidden])').evaluateAll(items=>items.map(item=>item.dataset.shiyuModuleId))).indexOf(pinCandidate)<reordered.indexOf(pinCandidate),'pinned app moves forward');
    assert.equal(await page.evaluate(()=>prefs.cornerPinnedModulesV1['home-shelf-check'].includes('toolbox')),false);
    assert.equal(await page.evaluate(()=>prefs.cornerCoreTargetV1['home-shelf-check']),'toolbox');
    await page.mouse.move(1150,680);await page.waitForTimeout(350);
    assert.equal(await shelf.locator('.menu-item.is-selected').getAttribute('data-shiyu-module-id'),'toolbox');
    await clickCore();await page.waitForSelector('#my-corner[open][data-corner-module=toolbox]');await close();

    await openShelf();await shelf.locator('.home-shelf-settings>button').click();
    await page.locator('#corner-home-settings select').selectOption('memo');
    await page.locator('#corner-home-settings [data-settings-save]').click();
    await page.mouse.move(1150,680);await page.waitForTimeout(350);
    await clickCore();await page.waitForSelector('#my-corner[open][data-corner-module=memo]');await close();

    await openShelf();await shelf.locator('.home-shelf-settings>button').click();
    await page.locator('#corner-home-settings .corner-home-settings-app[data-module-id='+pinCandidate+']').click();
    await page.locator('#corner-home-settings [data-settings-cancel]').click();
    assert(await page.evaluate(id=>prefs.cornerPinnedModulesV1['home-shelf-check'].includes(id),pinCandidate),'cancel preserves pin');
    await openShelf();await shelf.locator('.home-shelf-settings>button').click();
    await page.locator('#corner-home-settings .corner-home-settings-app[data-module-id='+pinCandidate+']').click();
    await page.locator('#corner-home-settings [data-settings-save]').click();
    assert.equal(await page.evaluate(id=>prefs.cornerPinnedModulesV1['home-shelf-check'].includes(id),pinCandidate),false,'pin can be removed');

    await openShelf();await shelf.locator('.home-shelf-settings>button').click();
    await page.locator('#corner-home-settings input[value=recent]').check();
    await page.locator('#corner-home-settings [data-settings-save]').click();
    await openShelf();
    const selectedBefore=await shelf.locator('.menu-item.is-selected').getAttribute('data-shiyu-module-id');
    await page.mouse.wheel(0,120);await page.waitForTimeout(100);
    const selectedAfter=await shelf.locator('.menu-item.is-selected').getAttribute('data-shiyu-module-id');
    assert.notEqual(selectedAfter,selectedBefore);
    await clickCore();await page.waitForSelector('#my-corner[open][data-corner-module='+selectedAfter+']');await close();

    await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#corner-orbit-demo[data-theme-ready=true]');
    assert.deepEqual(await shelf.locator('.menu-item:not([hidden])').evaluateAll(items=>items.map(item=>item.dataset.shiyuModuleId)),await page.evaluate(()=>{const ids=prefs.cornerShelfOrderV1['home-shelf-check'],pins=prefs.cornerPinnedModulesV1['home-shelf-check'];return [...ids.filter(id=>pins.includes(id)),...ids.filter(id=>!pins.includes(id)),'toolbox']}));
    assert.equal(await page.evaluate(()=>prefs.cornerCoreDefaultV1['home-shelf-check']),'recent');
    console.log('PASS: horizontal shelf, no placeholder or old fan, persisted order shared with Toolbox, core target preference, wheel selection and persistent close icon');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
