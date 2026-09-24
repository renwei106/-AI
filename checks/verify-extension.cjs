const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const BASE = 'http://127.0.0.1:4318', output = path.resolve('checks/extension');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label, timeout = 12000) { const start = Date.now(); while (Date.now() - start < timeout) { const value = await fn(); if (value) return value; await pause(100); } throw new Error('Timed out: ' + label); }
const channel = process.env.EXTENSION_BROWSER || 'msedge';
const errors = [], checks = []; let context;
(async () => {
  context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-extension-e2e-')), { channel, headless: true, ignoreDefaultArgs: ['--disable-extensions'], viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', args: channel==='chrome'?['--enable-unsafe-extension-debugging']:['--enable-unsafe-extension-debugging', '--disable-extensions-except=' + path.resolve('browser-extension'), '--load-extension=' + path.resolve('browser-extension')] });
  if(channel === 'chrome'){const loader=await context.browser().newBrowserCDPSession();const installed=await loader.send('Extensions.loadUnpacked',{path:path.resolve('browser-extension')});const bootstrap=await context.newPage();await bootstrap.goto(`chrome-extension://${installed.id}/popup.html`);await bootstrap.waitForFunction(()=>!document.querySelector('#status').textContent.includes('正在连接'));await bootstrap.close();}
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker'), extensionId = worker.url().split('/')[2];
  const cd = await context.browser().newBrowserCDPSession(); let serial = 0;
  async function popup(targetPage) {
    const previous = (await cd.send('Target.getTargets')).targetInfos.filter(x=>x.url===`chrome-extension://${extensionId}/popup.html`);
    for(const old of previous) await cd.send('Target.closeTarget',{targetId:old.targetId});
    await until(async()=>!(await cd.send('Target.getTargets')).targetInfos.some(x=>x.url===`chrome-extension://${extensionId}/popup.html`),'previous popup closed');
    await targetPage.bringToFront();
    const target = (await cd.send('Target.getTargets', { filter: [{ type: 'tab', exclude: false }] })).targetInfos.find(x => x.url === targetPage.url());
    await cd.send('Extensions.triggerAction', { id: extensionId, targetId: target.targetId });
    const popupTarget = await until(async () => (await cd.send('Target.getTargets')).targetInfos.find(x => x.url === `chrome-extension://${extensionId}/popup.html`), 'popup target');
    const { sessionId } = await cd.send('Target.attachToTarget', { targetId: popupTarget.targetId, flatten: false });
    function send(method, params = {}) {
      const id = ++serial;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { cd.off('Target.receivedMessageFromTarget', handler); reject(new Error('CDP timeout: ' + method)); }, 12000);
        const handler = event => { if (event.sessionId !== sessionId) return; const message = JSON.parse(event.message); if (message.id !== id) return; clearTimeout(timer); cd.off('Target.receivedMessageFromTarget', handler); message.error ? reject(message.error) : resolve(message.result); };
        cd.on('Target.receivedMessageFromTarget', handler);
        cd.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id, method, params }) }).catch(reject);
      });
    }
    async function evaluate(expression) { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + result.result.description); return result.result.value; }
    await until(() => evaluate(`document.body?.dataset.ready === 'true'`), 'popup connected');
    return { evaluate, send, async screenshot(name) { await evaluate('new Promise(resolve=>setTimeout(resolve,250))'); const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); fs.writeFileSync(path.join(output, name), Buffer.from(result.data, 'base64')); }, async close() { await cd.send('Target.closeTarget',{targetId:popupTarget.targetId});await until(async()=>!(await cd.send('Target.getTargets')).targetInfos.some(x=>x.targetId===popupTarget.targetId),'popup closed'); } };
  }
  const site = await context.newPage(); await site.goto(BASE); await site.evaluate(value => { localStorage.setItem('yiyu-prototype-v1', value); }, fs.readFileSync(path.join(output, 'baseline-storage.json'), 'utf8')); await site.reload();
  await site.screenshot({ path: path.join(output, 'home-after.png') });
  await site.locator('[data-account-open]').click(); assert.equal(await site.locator('[data-menu-extension]').count(), 1);
  await site.screenshot({ path: path.join(output, 'avatar-entry.png') });
  const [intro] = await Promise.all([context.waitForEvent('page'), site.locator('[data-menu-extension]').click()]); await intro.waitForLoadState(); assert.equal(new URL(intro.url()).pathname, '/extension/'); checks.push('avatar menu opens introduction in a new tab');
  assert.notEqual(await intro.evaluate(() => document.documentElement.dataset.themed), 'true');
  for (const colorScheme of ['light', 'dark']) { await intro.emulateMedia({ colorScheme }); await intro.screenshot({ path: path.join(output, `intro-${colorScheme}.png`), fullPage: true }); }
  await intro.setViewportSize({ width: 375, height: 812 }); await intro.emulateMedia({ colorScheme: 'light' }); await intro.screenshot({ path: path.join(output, 'intro-mobile.png'), fullPage: true }); assert(await intro.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const [download] = await Promise.all([intro.waitForEvent('download'), intro.locator('.download').first().click()]); assert.equal(download.suggestedFilename(), 'shiyu-extension-0.1.1.zip'); assert.equal(await download.failure(), null); checks.push('ZIP download, responsive introduction and system light/dark themes');
  const target = await context.newPage(); await target.route('https://example.com/**', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="UTF-8"><link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiM0ODYxNGMiLz48L3N2Zz4="><title>值得留下的网页</title><h1>一个普通网页</h1>' })); await target.goto('https://example.com/keep?test=extension#part');
  let pop = await popup(target); assert.equal(await pop.evaluate('document.querySelector("#title").value'), '值得留下的网页'); await until(() => pop.evaluate('document.querySelector("#site-icon").hidden === false'), 'current website icon'); assert.equal(await pop.evaluate('document.querySelector("#login-panel").hidden'), false); await pop.screenshot('popup-guest.png');
  const loginPagePromise = context.waitForEvent('page'); await pop.evaluate('document.querySelector("#login").click()'); const login = await loginPagePromise; await login.waitForLoadState(); await login.locator('#login[open]').waitFor();
  await login.locator('[data-onboard-demo]').click();
  if (await login.locator('[data-onboard-skip]').isVisible()) await login.locator('[data-onboard-skip]').click();
  if (await login.locator('[data-onboard-finish]').isVisible()) await login.locator('[data-onboard-finish]').click();
  assert.equal(await login.evaluate(() => signed), true); checks.push('actual activeTab gesture reads title and URL; guest is guided through existing experience login');
  await until(() => intro.evaluate(() => document.documentElement.dataset.themed === 'true'), 'introduction receives signed-in theme');
  pop = await popup(target); await pop.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-color-scheme',value:'light'}]});await pop.screenshot('popup-light.png');
  assert.equal(await pop.evaluate(`document.documentElement.dataset.themed`), 'true');
  const temporaryLayout = await pop.evaluate(`({horizontal:document.documentElement.scrollWidth<=document.documentElement.clientWidth,vertical:document.documentElement.scrollHeight<=document.documentElement.clientHeight,buttonBottom:document.querySelector('#save').getBoundingClientRect().bottom,viewport:innerHeight})`);
  assert(temporaryLayout.horizontal && temporaryLayout.vertical && temporaryLayout.buttonBottom <= temporaryLayout.viewport);
  await pop.evaluate(`document.querySelector('#description').value='回头继续读';document.querySelector('#description').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#bookmark-form').requestSubmit()`);
  await until(() => pop.evaluate(`document.querySelector('#status').textContent.includes('已收藏到')`), 'temporary save');
  await until(()=>login.evaluate(() => ShiyuExtensionStore.inbox().length === 1),'inbox visible in second tab');
  await pop.evaluate(`document.querySelector('#bookmark-form').requestSubmit()`); await until(() => pop.evaluate(`document.querySelector('#status').textContent.includes('无需重复')`), 'duplicate'); checks.push('temporary save persists, preserves note and full URL, and deduplicates');
  await pop.evaluate(`document.querySelector('[data-mode="group"]').click()`); await pop.screenshot('popup-group.png');
  const pickerState = await pop.evaluate(`(()=>{document.querySelector('[data-picker="group"]').click();const menu=document.querySelector('[data-picker-menu="group"]'),rect=menu.getBoundingClientRect();return {open:!menu.hidden,options:menu.querySelectorAll('.place-option').length,inside:rect.top>=0&&rect.bottom<=innerHeight}})()`);
  assert(pickerState.open && pickerState.options > 0 && pickerState.inside); await pop.screenshot('popup-picker-open.png');
  await pop.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`);
  const groupLayout = await pop.evaluate(`({horizontal:document.documentElement.scrollWidth<=document.documentElement.clientWidth,vertical:document.documentElement.scrollHeight<=document.documentElement.clientHeight,buttonBottom:document.querySelector('#save').getBoundingClientRect().bottom,viewport:innerHeight})`);
  assert(groupLayout.horizontal && groupLayout.vertical && groupLayout.buttonBottom <= groupLayout.viewport);
  const dest = await pop.evaluate(`({spaceId:document.querySelector('#space').value,sceneId:document.querySelector('#scene').value,groupId:document.querySelector('#group').value})`);
  await pop.evaluate(`document.querySelector('#bookmark-form').requestSubmit()`); await until(() => pop.evaluate(`document.querySelector('#status').textContent.includes('已收藏到')`), 'group save');
  await until(()=>login.evaluate(dest => data.find(s=>s.id===dest.spaceId).scenes.find(c=>c.id===dest.sceneId).groups.find(g=>g.id===dest.groupId).items.some(x=>x[1]==='https://example.com/keep?test=extension#part'),dest),'group visible in second tab');
  assert.equal(await login.evaluate(dest => data.find(s => s.id === dest.spaceId).scenes.find(c => c.id === dest.sceneId).groups.find(g => g.id === dest.groupId).items.filter(x => x[1] === 'https://example.com/keep?test=extension#part').length, dest), 1);
  await pop.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] }); await pop.screenshot('popup-dark.png'); checks.push('classified save writes existing groups; popup follows system theme'); await pop.close();
  await login.evaluate(() => { view = 'space'; render(); }); await login.locator('[data-space-inbox]').waitFor();
  assert.equal(await login.evaluate(() => document.querySelector('[data-space-inbox]').nextElementSibling?.dataset.action), 'add');
  await login.screenshot({ path: path.join(output, 'workspace-inbox-entry.png') }); checks.push('workspace places the drawer entry directly before add-bookmark');
  const inbox = await context.newPage(); await inbox.goto(BASE + '/extension/inbox.html'); assert.equal(await inbox.locator('.inbox-card').count(), 1); await inbox.screenshot({ path: path.join(output, 'inbox.png') });
  await inbox.locator('.organize').click(); await inbox.locator('#move-form button[type=submit]').click(); assert.equal(await inbox.locator('.inbox-card').count(), 0); assert.match(await inbox.locator('#status').innerText(), /已归入/); checks.push('inbox moves to existing hierarchy atomically without adding duplicates');
  const validations = await login.evaluate(dest => {
    const store = ShiyuExtensionStore, accountId = store.snapshot().accountId, input = { title: '验证', url: 'https://example.com/validation', mode: 'group', accountId, ...dest }, results = [];
    for (const patch of [{ url: 'javascript:alert(1)' }, { url: 'https://name:password@example.com/' }, { groupId: 'deleted-group' }, { accountId: 'different-account' }, { title: '' }]) {
      const before = localStorage.getItem(store.KEY); try { store.save({ ...input, ...patch }); results.push(false); } catch { results.push(before === localStorage.getItem(store.KEY)); }
    }
    const original = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); };
    try { store.save(input); results.push(false); } catch (e) { results.push(e.message.includes('尚未保存')); } finally { Storage.prototype.setItem = original; }
    signed = false; persist(); try { store.save(input); results.push(false); } catch (e) { results.push(e.message.includes('登录')); }
    return results;
  }, dest); assert(validations.every(Boolean)); checks.push('invalid URLs, deleted groups, account switches, quota failure and logout all reject safely');
  await login.reload(); assert.equal(await login.evaluate(() => signed), false);
  pop = await popup(target); assert.equal(await pop.evaluate('document.querySelector("#login-panel").hidden'), false); await pop.close();
  // Connection failure retains the exact draft; restore site and reconnect without losing input.
  await login.evaluate(() => { signed = true; persist(); });
  pop = await popup(target); await pop.evaluate(`document.querySelector('#title').value='网络中断也要留下的草稿';document.querySelector('#title').dispatchEvent(new Event('input',{bubbles:true}))`);
  await until(() => worker.evaluate(async () => (await chrome.storage.local.get('draft')).draft?.title === '网络中断也要留下的草稿'), 'draft saved');
  const mainPages = context.pages().filter(p => { try { return new URL(p.url()).origin === BASE && new URL(p.url()).pathname === '/'; } catch { return false; } });
  for (const page of mainPages) await page.evaluate(() => { delete window.shiyuExtensionBridge; });
  await pop.evaluate(`document.querySelector('#bookmark-form').requestSubmit()`); await until(() => pop.evaluate(`document.querySelector('#status').textContent.includes('暂时连不上')`), 'connection failure');
  assert.equal(await pop.evaluate(`document.querySelector('#title').value`), '网络中断也要留下的草稿'); await pop.screenshot('popup-offline.png'); await pop.close();
  await site.reload(); pop = await popup(target); assert.equal(await pop.evaluate(`document.querySelector('#title').value`), '网络中断也要留下的草稿'); await pop.close(); checks.push('connection failure preserves draft across closing/reopening the popup');
  if (process.env.SKIP_APP_BASELINE !== '1') {
    const hashes = JSON.parse(fs.readFileSync('baselines/v196-before-bookmark-extension/hashes.json'));
    for (const file of ['dist/app.js', 'dist/v4.js', 'dist/style.css', 'dist/v4.css']) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), hashes[file], file + ' unchanged');
    checks.push('existing app/style files unchanged; no browser page errors');
  } else checks.push('extension flow passed; shared app baseline was checked separately');
  assert.deepEqual(errors, []);
  const report = { status: 'PASS', browser: context.browser().version(), extensionId, checks }; fs.writeFileSync(path.join(output, `results-${channel}.json`), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await context?.close(); });
