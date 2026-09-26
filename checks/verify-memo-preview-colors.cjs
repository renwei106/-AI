const {chromium}=require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.MEMO_PREVIEW_ORIGIN||'http://127.0.0.1:4330';
const artifacts='.local/paper-reference/qa';fs.mkdirSync(artifacts,{recursive:true});
async function authFixture(p){await p.route('**/api/shiyu/auth/**',r=>r.fulfill({status:r.request().url().includes('/wechat/')?200:503,json:{}}));}
async function enter(p,label='小记'){
  const frame=p.frameLocator('#corner-orbit-demo');
  await frame.locator('.core-hit').hover({force:true});
  await frame.locator('.stage.is-filled').waitFor();await p.waitForTimeout(750);
  const hit=await frame.locator('.menu-item').filter({hasText:label}).locator('span').boundingBox();
  await p.mouse.move(hit.x+hit.width/2,hit.y+hit.height/2,{steps:12});await p.waitForTimeout(180);
  await p.mouse.click(hit.x+hit.width/2,hit.y+hit.height/2);
}
async function ready(p){await p.waitForSelector('#my-corner[open][data-corner-module=memo]');await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));await p.waitForFunction(()=>document.querySelector('.memo-paper-canvas canvas')?.dataset.paperCount!==undefined);}
async function outside(p){await p.mouse.click(1250,260);await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));await p.waitForTimeout(1000);}
async function unfold(p){await p.locator('.memo-paper-access button').evaluate(el=>el.click());await p.waitForSelector('.memo-paper-editor.is-preview');}
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
  const p=await b.newPage({viewport:{width:1440,height:960}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await authFixture(p);
  await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>ShiyuCornerModules.enabled().includes('memo'));
  await p.evaluate(()=>{signed=true;prefs.accountProfile={id:'memo-entry-qa',name:'入口测试'};prefs.mode='light';prefs.theme='base';prefs.brandGuideDismissed=true;localStorage.setItem('yiyu-prototype-v1',JSON.stringify({data,prefs,overrides,styles,signed}));persist();render()});
  await enter(p);await ready(p);
  assert.equal(await p.locator('#my-corner .corner-close-entry').count(),1);
  assert.equal(await p.locator('#my-corner [data-corner-cord]').count(),3);
  assert.equal(await p.locator('.memo-paper-hint,#preview-mode,#preview-theme').count(),0);
  assert.doesNotMatch(await p.locator('#my-corner').innerText(),/本地体验|切换明暗|滚动|拖动|翻阅|点击编辑/);
  assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-memo-color'),'theme');
  const title=p.locator('[data-corner-next-theme]');
  let theme=await p.evaluate(()=>prefs.theme);await title.click();await p.waitForFunction(old=>prefs.theme!==old,theme);
  theme=await p.evaluate(()=>prefs.theme);await p.locator('[data-corner-cord=theme]').click();await p.waitForFunction(old=>prefs.theme!==old,theme);
  let color=await p.evaluate(()=>prefs.color);await p.locator('[data-corner-cord=color]').click();await p.waitForFunction(old=>prefs.color!==old,color);
  assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-memo-color'),'theme');
  await p.locator('[data-corner-cord=mode]').click();assert.equal(await p.evaluate(()=>prefs.mode),'dark');
  await p.screenshot({path:artifacts+'/entry-dark-controls.png'});
  await p.locator('.is-active [data-memo-color-trigger]').hover();await p.waitForSelector('.memo-color-popover:not([hidden])');
  assert.deepEqual(await p.locator('button[data-memo-color]').evaluateAll(els=>els.map(el=>el.dataset.memoColor)),['theme','gray','red','green','orange','blue','purple']);
  const layout=await p.locator('button[data-memo-color]').evaluateAll(els=>els.map(el=>({x:Math.round(el.getBoundingClientRect().x),y:Math.round(el.getBoundingClientRect().y)})));
  assert.equal(new Set(layout.map(r=>r.x)).size,7);assert.equal(new Set(layout.map(r=>r.y)).size,1);
  const originalBg=await p.locator('.memo-cover.is-active .memo-cover-inner').evaluate(el=>getComputedStyle(el).backgroundColor);
  const globalColor=await p.evaluate(()=>prefs.color);await p.locator('button[data-memo-color=red]').click();
  assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-memo-color'),'red');assert.equal(await p.evaluate(()=>prefs.color),globalColor);
  await p.waitForTimeout(220);assert.notEqual(await p.locator('.memo-cover.is-active .memo-cover-inner').evaluate(el=>getComputedStyle(el).backgroundColor),originalBg);
  await p.locator('.is-active [data-memo-color-trigger]').hover();await p.screenshot({path:artifacts+'/color-menu-six-dark.png'});
  await p.mouse.move(1250,230);await p.waitForTimeout(220);
  await p.locator('.is-active [data-memo-card]').click();await p.waitForSelector('[data-memo-title]');assert.equal(await p.locator('[data-memo-trash]').count(),0);
  await p.locator('[data-memo-title]').fill('纸色与预览');await outside(p);
  await p.locator('.is-active').hover();await p.locator('.is-active [data-memo-discard]').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-app.is-busy'));
  await p.locator('[data-memo-view=trash]').click();await p.waitForTimeout(900);await p.screenshot({path:artifacts+'/trash-tight-stack.png'});
  await unfold(p);assert.equal(await p.locator('.memo-paper-editor input,.memo-paper-editor textarea,[data-memo-edit]').count(),0);
  await p.screenshot({path:artifacts+'/trash-preview-only.png'});await p.locator('.memo-paper-preview-title').click();await p.waitForFunction(()=>!document.querySelector('.memo-paper-editor'));await p.waitForTimeout(1100);
  await unfold(p);await outside(p);await unfold(p);assert.equal(await p.locator('[data-memo-restore] svg').count(),1);
  await p.locator('[data-memo-restore]').click();await p.waitForTimeout(1000);assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-memo-color'),'red');
  await p.locator('.is-active [data-memo-card]').click();await p.waitForSelector('[data-memo-title]');await p.locator('[data-memo-content]').fill('捡回来以后才能编辑。');await outside(p);
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>ShiyuCornerModules.enabled().includes('memo'));await p.evaluate(()=>{signed=true});await enter(p);await ready(p);
  assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-memo-color'),'red');assert.match(await p.locator('.memo-cover.is-active').textContent(),/捡回来以后才能编辑/);
  await p.locator('.memo-paper-app').dispatchEvent('keydown',{key:'Home'});await p.waitForTimeout(900);await p.locator('[data-memo-new]').click();await p.locator('[data-memo-title]').fill('默认灰色新小记');
  assert.equal(await p.evaluate(()=>prefs.cornerModules['memo-entry-qa'].memo.notes[0].color),'theme');await outside(p);assert.equal(await p.locator('.memo-cover.is-active').getAttribute('data-memo-color'),'theme');
  await p.evaluate(()=>{prefs.mode='light';render()});await ready(p);await p.locator('.is-active [data-memo-color-trigger]').hover();await p.screenshot({path:artifacts+'/color-menu-six-light.png'});
  await p.locator('#my-corner .corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);assert.equal(await p.locator('canvas[data-paper-count]').count(),0);assert.equal(await p.locator('#dock .corner-entry').count(),1);
  await enter(p,'常用');await p.waitForSelector('#my-corner[open][data-corner-module=common]');await p.waitForFunction(()=>!document.querySelector('#my-corner').classList.contains('corner-reveal-opening'));
  assert.equal(await p.locator('#my-corner [data-corner-cord]').count(),2);await p.locator('#my-corner .corner-close-entry').click();await p.waitForFunction(()=>!document.querySelector('#my-corner').open);
  await enter(p);await ready(p);assert.equal(await p.locator('#my-corner .corner-close-entry').count(),1);assert.equal(await p.locator('#my-corner [data-corner-cord]').count(),3);assert.deepEqual(errors,[]);
  console.log('PASS real home menu, shared close/reopen, title and upper theme/color/mode controls, single-row theme circle and six colors, theme defaults, persistent individual color, preview-only trash, restore then edit, unchanged common controls');await p.close();
  const guest=await b.newPage({viewport:{width:1440,height:960}});await authFixture(guest);await guest.goto(base,{waitUntil:'domcontentloaded'});await guest.waitForFunction(()=>ShiyuCornerModules.enabled().includes('memo'));await enter(guest);await guest.waitForSelector('#login[open]');assert.equal(await guest.locator('#my-corner[open]').count(),0);await guest.close();console.log('PASS original sign-in required from home');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
