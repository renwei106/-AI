const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');

const BASE_URL=process.env.SHIYU_PREVIEW_URL||'http://127.0.0.1:4318/';
const expectedHosts=['notion.so','feishu.cn','figma.com','are.na','dribbble.com','pinterest.com','developer.mozilla.org','github.com','juejin.cn','zhihu.com','bilibili.com','douban.com','xiaohongshu.com','unsplash.com','youtube.com','open.spotify.com','apple.com','wikipedia.org','stackoverflow.com','chat.deepseek.com','baidu.com'];
const errors=[];
let browser;

(async()=>{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1041},reducedMotion:'reduce'});
  await context.addInitScript(()=>{localStorage.removeItem('yiyu-prototype-v1');localStorage.removeItem('shiyu-space-atlas-v1')});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(BASE_URL,{waitUntil:'networkidle'});
  const snapshot=await page.evaluate(()=>{
    const host=url=>{try{return new URL(url).hostname.replace(/^www\./,'')}catch{return''}},first=data[0],items=first.scenes.flatMap(scene=>scene.groups.flatMap(group=>group.items)),other=data.slice(1).flatMap(space=>space.scenes.flatMap(scene=>scene.groups.flatMap(group=>group.items)));
    return {firstId:first.id,flags:{real:prefs.firstSpaceRealSitesV1,capacity:prefs.firstSpaceCapacityV1},items:items.filter(item=>String(item[3]).startsWith('assets/site-icons/')).map(item=>({name:item[0],host:host(item[1]),icon:item[3]})),otherReal:other.filter(item=>String(item[3]).startsWith('assets/site-icons/')).length};
  });
  assert.equal(snapshot.flags.real,true);assert.equal(snapshot.flags.capacity,true);
  assert.deepEqual(new Set(snapshot.items.map(item=>item.host)),new Set(expectedHosts));
  assert.equal(snapshot.items.length,expectedHosts.length,'each sample host appears once with a local brand mark');
  assert.equal(snapshot.otherReal,0,'the migration is confined to the first space');

  await page.evaluate(id=>{signed=true;goSpace(id)},snapshot.firstId);
  await page.locator('.workspace').waitFor({state:'visible'});
  const cardImages=page.locator('.workspace .bookmark-logo-image');
  const cardState=await page.evaluate(()=>({view,spaceId,sceneId,group:currentGroup()?.id,images:document.querySelectorAll('.workspace .bookmark-logo-image').length,items:currentGroup()?.items.slice(0,3),markup:document.querySelector('.group:not([hidden]) .cards')?.innerHTML.slice(0,600)}));
  assert(cardState.images>=3,`the first group immediately exposes its existing branded sites: ${JSON.stringify(cardState)}`);
  assert((await cardImages.count())>=3,'the first group immediately exposes its existing branded sites');
  await page.waitForFunction(()=>[...document.querySelectorAll('.workspace .bookmark-logo-image')].slice(0,3).every(img=>img.complete&&img.naturalWidth>0));
  assert((await cardImages.evaluateAll(images=>images.slice(0,3).map(img=>new URL(img.src).pathname))).every(path=>path.includes('/assets/site-icons/')));

  await page.locator('.workspace .space-mode-entry').click();
  await page.locator('#space-mode-menu [data-space-mode="atlas"]').click();
  await page.locator('#space-atlas[open].atlas-ready .at-canvas').waitFor({state:'visible'});
  await page.locator('.at-node[data-key="c:daily"] .at-node-main').click();
  await page.locator('.at-node[data-key="g:tools"] .at-node-main').click();
  const graphImages=page.locator('.at-node[data-kind="link"] .at-logo .bookmark-logo-image');
  assert.equal(await graphImages.count(),3);
  await page.waitForFunction(()=>[...document.querySelectorAll('.at-node[data-kind="link"] .at-logo img')].every(img=>img.complete&&img.naturalWidth>0));

  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'PASS',checks:[
    '第一个空间包含 21 个真实网址品牌图标，其他空间未写入',
    '仅替换容量演示占位网址，已有首屏网址升级为本地品牌图标',
    '常规卡片与图谱网址节点均成功加载真实图标'
  ],sample:snapshot.items.slice(0,8)},null,2));
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>browser?.close());
