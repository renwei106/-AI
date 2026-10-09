// Real unpacked Edge regression. Shiyu HTTPS resolves ONLY to a loopback TLS
// server with fake HttpOnly cookies. Native worker/iframe fetch is never replaced.
// Set SHIYU_PLAYWRIGHT_MODULE / SHIYU_EXTENSION_DIR / SHIYU_OPENSSL if necessary.
const fs = require('node:fs'), path = require('node:path'), https = require('node:https');
const cp = require('node:child_process'), assert = require('node:assert/strict');
const { chromium } = require(process.env.SHIYU_PLAYWRIGHT_MODULE || 'C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..'), local = path.join(root, '.local');
fs.mkdirSync(local, { recursive: true });
const temp = fs.mkdtempSync(path.join(local, 'extension-cold-tls-'));
const extension = path.resolve(root, process.env.SHIYU_EXTENSION_DIR || 'browser-extension-lab');
const version = JSON.parse(fs.readFileSync(path.join(extension, 'manifest.json'), 'utf8')).version;
const resultFile = path.join(local, 'extension-cold-start-browser-result.json');
const clone = value => JSON.parse(JSON.stringify(value));
const graph = owner => [{ id: 's', name: owner, scenes: [{ id: 'c', name: 'Scene', groups: [{ id: 'g', name: 'Group', items: [] }] }] }];
const documents = () => ({ memo: { data: { notes: [], lastNumber: 0 }, revision: 0 }, todo: { data: { calendarV2: { version: 2, revision: 0, groups: [], tasks: [], initialized: true } }, revision: 0 } });
const accounts = new Map(['fixture-a', 'fixture-b'].map(owner => [owner, { data: graph(owner), tools: documents() }]));
const requests = [], pageErrors = [], elapsed = {}, cases = [], held = new Set();
const runStarted = Date.now();
let sessionHang = false, putHang = false, browser, server;
const cookie = owner => ({ name: 'shiyu_user_session', value: owner, domain: '.shiyubox.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' });
function ownerFromCookie(value) { return /(?:^|;\s*)shiyu_user_session=(fixture-[ab])(?:;|$)/.exec(value || '')?.[1] || null; }
function send(res, value, status = 200, headers = {}) {
  if (!res.destroyed) { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }); res.end(typeof value === 'string' ? value : JSON.stringify(value)); }
}
function hold(res) { held.add(res); res.on('close', () => held.delete(res)); }
function bytes(req) { return new Promise((resolve, reject) => { let body = ''; req.on('data', chunk => { body += chunk; }); req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch (error) { reject(error); } }); req.on('error', reject); }); }
function cloudCount(owner, url) { return accounts.get(owner).data.flatMap(s => s.scenes.flatMap(c => c.groups.flatMap(g => g.items))).filter(item => item[1] === url).length; }
function payload(owner, name, mode = 'group') { return { accountId: owner, mode, title: name, url: 'https://example.test/' + name, description: 'Isolated fixture', spaceId: 's', sceneId: 'c', groupId: 'g' }; }
async function timed(name, task) { const started = Date.now(); try { return await task(); } finally { elapsed[name] = Date.now() - started; } }
async function boundedFast(name, task) { const value = await timed(name, task); assert(elapsed[name] < 2500, name + ' must finish within 2500 ms'); return value; }
async function withinTimeout(name, task) { const value = await timed(name, task); assert(elapsed[name] >= 5700 && elapsed[name] < 7800, name + ' must hit the 6-second operation deadline'); return value; }
async function main() {
  cp.execFileSync(process.env.SHIYU_OPENSSL || 'C:/Program Files/Git/usr/bin/openssl.exe', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(temp, 'fixture.key'), '-out', path.join(temp, 'fixture.crt'), '-days', '1', '-subj', '/CN=shiyubox.com', '-addext', 'subjectAltName=DNS:shiyubox.com'], { stdio: 'ignore' });
  server = https.createServer({ key: fs.readFileSync(path.join(temp, 'fixture.key')), cert: fs.readFileSync(path.join(temp, 'fixture.crt')) }, async (req, res) => {
    try {
      assert.equal(req.headers.host, 'shiyubox.com', 'The fixture accepts only the exact Shiyu host');
      const pathname = new URL(req.url, 'https://shiyubox.com').pathname, owner = ownerFromCookie(req.headers.cookie);
      const row = { path: pathname, method: req.method, owner, cookieIncluded: !!owner }; requests.push(row);
      if (pathname === '/api/shiyu/auth/session') {
        if (sessionHang) { row.held = true; return hold(res); }
        return send(res, owner ? { authenticated: true, user: { id: owner, name: owner, email: owner + '@example.test' } } : { authenticated: false });
      }
      if (pathname.startsWith('/api/') && !owner) return send(res, { message: 'Fixture requires login' }, 401);
      const account = owner && accounts.get(owner);
      if (pathname === '/api/shiyu/auth/account') {
        if (req.method === 'GET') return send(res, { userId: owner, data: clone(account.data), initialized: true });
        assert.equal(req.method, 'PUT');
        const body = await bytes(req); if (body.userId !== owner) return send(res, { message: 'Owner changed' }, 409);
        if (putHang) { row.held = true; return hold(res); }
        account.data = clone(body.data); row.committed = true;
        return send(res, { userId: owner, data: clone(account.data), initialized: true });
      }
      if (pathname === '/api/shiyu/auth/tools') {
        if (req.method === 'GET') return send(res, { userId: owner, tools: clone(account.tools) });
        assert.equal(req.method, 'POST');
        const body = await bytes(req), document = account.tools[body.tool];
        if (body.userId !== owner || !document || body.revision !== document.revision) return send(res, { message: 'Revision or owner changed' }, 409);
        document.data = clone(body.data); document.revision++; row.committed = true; row.tool = body.tool;
        return send(res, { userId: owner, data: clone(document.data), revision: document.revision });
      }
      if (pathname === '/extension/release.json') return send(res, { latest: version });
      const file = ['/extension/store.js', '/extension/bridge.html', '/extension/bridge.js', '/extension/account-sync.js'].includes(pathname) ? path.join(root, 'dist', pathname.slice(1)) : null;
      if (file) {
        const html = pathname.endsWith('.html');
        return send(res, fs.readFileSync(file, 'utf8'), 200, { 'Content-Type': html ? 'text/html; charset=utf-8' : 'application/javascript; charset=utf-8', ...(html ? { 'Content-Security-Policy': "default-src 'none'; script-src 'self'; connect-src 'self'; frame-ancestors chrome-extension: moz-extension:; object-src 'none'; base-uri 'none'" } : {}) });
      }
      if (pathname.endsWith('favicon.ico')) return send(res, {}, 404);
      // Ordinary tabs deliberately have no application, Store or bridge script.
      return send(res, '<!doctype html><title>Isolated ordinary website tab</title><p>Only fixture HTML.</p>', 200, { 'Content-Type': 'text/html; charset=utf-8' });
    } catch (error) { send(res, { message: error.message }, 500); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  browser = await chromium.launchPersistentContext(path.join(temp, 'profile'), { channel: 'msedge', headless: true, ignoreHTTPSErrors: true, timeout: 25000, args: ['--ignore-certificate-errors', '--host-resolver-rules=MAP shiyubox.com 127.0.0.1:' + port, '--proxy-server=direct://', '--proxy-bypass-list=*', '--disable-extensions-except=' + extension, '--load-extension=' + extension] });
  browser.on('page', page => page.on('pageerror', error => pageErrors.push({ url: page.url(), error: error.message })));
  // Continue into local TLS, rather than fulfill: SW interception does not expose
  // its final Cookie header. The TLS server records the actual wire cookie.
  await browser.route(/^https?:\/\//, route => new URL(route.request().url()).origin === 'https://shiyubox.com' ? route.continue() : route.abort());
  await browser.addCookies([cookie('fixture-a')]);
  const worker = browser.serviceWorkers()[0] || await browser.waitForEvent('serviceworker', { timeout: 15000 });
  assert.equal(await worker.evaluate(() => /\[native code\]/.test(fetch.toString())), true, 'Native worker fetch must be used');
  assert.equal(/executeScript\s*\(/.test(fs.readFileSync(path.join(extension, 'background.js'), 'utf8')), false, 'No code may be injected into an ordinary tab');
  const extensionId = new URL(worker.url()).hostname;
  const popup = await browser.newPage();
  const call = (type, p, page = popup) => page.evaluate(({ type, p }) => window.trialApi.call(type, { payload: p }), { type, p });
  const connect = (page = popup) => page.evaluate(() => window.trialApi.connect());
  const signed = (page = popup) => page.waitForFunction(() => document.body.dataset.auth === 'signed', {}, { timeout: 7000 });
  const pageCount = browser.pages().length;
  assert.equal(browser.pages().some(page => page.url().startsWith('https://shiyubox.com')), false);
  await boundedFast('noWebsiteTabColdOpenMs', async () => { await popup.goto('chrome-extension://' + extensionId + '/popup.html'); await signed(); });
  assert.equal((await popup.evaluate(() => window.trialApi.getState())).accountId, 'fixture-a');
  const cold = payload('fixture-a', 'cold-group');
  await boundedFast('noWebsiteTabCloudSaveMs', () => call('save', cold));
  assert.equal(cloudCount('fixture-a', cold.url), 1);
  assert.equal(browser.pages().length, pageCount, 'Cold open/save must not create any website tab');
  assert.equal(browser.pages().some(page => page.url().startsWith('https://shiyubox.com')), false);
  cases.push('no website tab: cold authenticated state and confirmed cloud group save');

  const website = await browser.newPage(); await website.goto('https://shiyubox.com/extension/start.html');
  const storage = () => website.evaluate(() => ({ value: JSON.parse(localStorage.getItem('yiyu-prototype-v1')), pending: JSON.parse(localStorage.getItem('shiyu-extension-pending-v1') || '[]') }));
  assert.equal(await website.evaluate(() => document.cookie.includes('shiyu_user_session')), false, 'Cookie stays HttpOnly');
  await website.evaluate(url => { const key = 'yiyu-prototype-v1', value = JSON.parse(localStorage.getItem(key)); value.prefs.color = '#123456'; value.prefs.mode = 'dark'; value.prefs.cornerCollections = { 'fixture-a': { groups: [{ id: 'common-a', name: 'A common', sort: 'manual', refs: [{ gid: 'g', url }] }], usage: {} } }; localStorage.setItem(key, JSON.stringify(value)); }, cold.url);
  const inboxA = payload('fixture-a', 'inbox-a', 'temporary'); await call('save', inboxA);
  const listedA = await call('list', { accountId: 'fixture-a' });
  assert.equal(listedA.commonGroups[0].items[0].url, cold.url);
  assert.equal(listedA.items.filter(item => item.inbox && item.url === inboxA.url).length, 1);
  await connect(); assert.equal((await popup.evaluate(() => window.trialApi.getState())).theme.color, '#123456');
  cases.push('existing common references, theme and temporary inbox retained in shared origin storage');

  // A real 5.5-second main-thread stall on the old ordinary tab must not delay
  // the isolated extension UI or the lightweight same-origin bridge document.
  await website.evaluate(() => { setTimeout(() => { window.fixtureBusyStarted = Date.now(); const end = Date.now() + 5500; while (Date.now() < end) {} window.fixtureBusyEnded = Date.now(); }, 10); });
  await new Promise(resolve => setTimeout(resolve, 50));
  const busy = payload('fixture-a', 'busy-tab-group');
  await boundedFast('busyWebsiteTabOpenAndSaveMs', async () => { await popup.reload({ waitUntil: 'commit' }); await signed(); await call('save', busy); });
  assert.equal(cloudCount('fixture-a', busy.url), 1);
  assert.equal(browser.pages().length, pageCount + 1, 'Busy tab must not cause an extra tab');
  await website.waitForFunction(() => !!window.fixtureBusyEnded, {}, { timeout: 6500 });
  const busyDuration = await website.evaluate(() => window.fixtureBusyEnded - window.fixtureBusyStarted);
  assert(busyDuration >= 5500); elapsed.websiteMainThreadBusyMs = busyDuration;
  assert.equal(await website.evaluate(() => !!window.ShiyuExtensionStore || !!window.shiyuExtensionBridge), false);
  cases.push('5.5-second busy old tab does not delay open/save and receives no injection');

  await browser.clearCookies(); await connect();
  assert.equal(await popup.evaluate(() => document.body.dataset.auth), 'guest');
  await assert.rejects(call('save', payload('fixture-a', 'logged-out-rejected')), /登录账号已变化/);
  assert.equal(cloudCount('fixture-a', 'https://example.test/logged-out-rejected'), 0);
  await browser.addCookies([cookie('fixture-b')]); await boundedFast('loginBMs', () => connect());
  assert.equal((await popup.evaluate(() => window.trialApi.getState())).accountId, 'fixture-b');
  await assert.rejects(call('save', payload('fixture-a', 'old-owner-rejected')), /登录账号已变化/);
  const listedB = await call('list', { accountId: 'fixture-b' });
  assert.equal(listedB.items.some(item => [cold.url, busy.url, inboxA.url].includes(item.url)), false);
  assert.equal(listedB.commonGroups.length, 0);
  const inboxB = payload('fixture-b', 'inbox-b', 'temporary'); await call('save', inboxB);
  await browser.addCookies([cookie('fixture-a')]); await connect();
  const restoredA = await call('list', { accountId: 'fixture-a' });
  assert.equal(restoredA.items.filter(item => item.inbox && item.url === inboxA.url).length, 1);
  assert.equal(restoredA.items.some(item => item.url === inboxB.url), false);
  assert.equal(restoredA.commonGroups[0].items[0].url, cold.url);
  cases.push('cookie login/logout and A/B/A switch: no stale authorization or inbox/common mixing');

  sessionHang = true;
  await withinTimeout('sessionHangRetryableMs', () => connect());
  assert.equal(await popup.evaluate(() => document.body.dataset.auth), 'error');
  assert.equal(await popup.getByRole('button', { name: '重新校验登录状态', exact: true }).isVisible(), true);
  sessionHang = false; await boundedFast('sessionRetryMs', () => connect());
  assert.equal((await popup.evaluate(() => window.trialApi.getState())).accountId, 'fixture-a');
  cases.push('session network hang is bounded at six seconds and explicit retry succeeds');

  const delayed = payload('fixture-a', 'put-timeout-retry'); putHang = true;
  await withinTimeout('groupPutHangMs', () => assert.rejects(call('save', delayed), /超时|重试/));
  const failedSave = await storage();
  assert.equal(failedSave.pending.filter(entry => entry.accountId === 'fixture-a' && entry.kind === 'group' && entry.item[1] === delayed.url).length, 1);
  assert.equal(failedSave.value.data[0].scenes[0].groups[0].items.filter(item => item[1] === delayed.url).length, 1);
  assert.equal(cloudCount('fixture-a', delayed.url), 0);
  putHang = false;
  await boundedFast('groupPutRetryMs', () => call('save', delayed));
  const retried = await storage();
  assert.equal(cloudCount('fixture-a', delayed.url), 1);
  assert.equal(retried.value.data[0].scenes[0].groups[0].items.filter(item => item[1] === delayed.url).length, 1);
  assert.equal(retried.pending.some(entry => entry.kind === 'group' && entry.item[1] === delayed.url), false);
  const putCount = requests.filter(row => row.path === '/api/shiyu/auth/account' && row.method === 'PUT').length;
  await call('save', delayed); assert.equal(cloudCount('fixture-a', delayed.url), 1);
  assert.equal(requests.filter(row => row.path === '/api/shiyu/auth/account' && row.method === 'PUT').length, putCount, 'A duplicate must not issue another cloud write');
  cases.push('group PUT timeout preserves one pending journal/local item; retry commits once and acknowledges only after success');

  const memoRead = await call('tool-records', { accountId: 'fixture-a', tool: 'memo', action: 'read' });
  const memoInput = { accountId: 'fixture-a', tool: 'memo', action: 'save', revision: memoRead.revision, item: { id: 'fixture-memo-a', content: 'A fixture note' } };
  const memoSaved = await boundedFast('memoSaveMs', () => call('tool-records', memoInput));
  assert.equal(memoSaved.revision, 1); assert.equal(memoSaved.data.notes[0].content, memoInput.item.content);
  const memoAgain = await call('tool-records', { accountId: 'fixture-a', tool: 'memo', action: 'read' });
  assert.equal(memoAgain.data.notes.filter(item => item.id === memoInput.item.id).length, 1);
  const memoRetry = await call('tool-records', memoInput); assert.equal(memoRetry.revision, 1);
  assert.equal(requests.filter(row => row.tool === 'memo' && row.committed).length, 1);
  const todoRead = await call('tool-records', { accountId: 'fixture-a', tool: 'todo', action: 'read' });
  const todoInput = { accountId: 'fixture-a', tool: 'todo', action: 'save', revision: todoRead.revision, item: { id: 'fixture-todo-a', title: 'A fixture task', date: '2026-10-09', priority: 2, done: false, start: null, duration: 30, groupId: '' } };
  const todoSaved = await boundedFast('todoSaveMs', () => call('tool-records', todoInput));
  assert.equal(todoSaved.revision, 1); assert.equal(todoSaved.data.calendarV2.tasks[0].title, todoInput.item.title);
  const todoAgain = await call('tool-records', { accountId: 'fixture-a', tool: 'todo', action: 'read' });
  assert.equal(todoAgain.data.calendarV2.tasks.filter(item => item.id === todoInput.item.id).length, 1);
  cases.push('memo/todo native API read and revision-aware save; repeat memo intent does not duplicate POST');

  const panel = await browser.newPage();
  await boundedFast('panelOpenMs', async () => { await panel.goto('chrome-extension://' + extensionId + '/panel.html'); await signed(panel); });
  const panelList = await call('list', { accountId: 'fixture-a' }, panel);
  assert.equal(panelList.items.filter(item => item.inbox && item.url === inboxA.url).length, 1);
  assert.equal(panelList.commonGroups[0].items[0].url, cold.url);
  assert.equal(browser.pages().length, pageCount + 2, 'Only explicit fixture tabs may exist');
  assert.equal(browser.pages().filter(page => page.url().startsWith('https://shiyubox.com')).length, 1);
  assert.equal(await website.evaluate(() => !!window.ShiyuExtensionStore || !!window.shiyuExtensionBridge), false);
  assert.equal(requests.some(row => /(?:app|v4)\.js$/.test(row.path)), false, 'The hidden bridge must not load the full application');
  assert.deepEqual(pageErrors, [], 'Popup, panel, bridge and ordinary fixture page must have no uncaught JS error');
  assert(requests.filter(row => row.path.startsWith('/api/') && row.owner).every(row => row.cookieIncluded), 'Actual native network requests include the fake HttpOnly session cookie');
  cases.push('popup/panel shared adapter: no extra website tab, no app load, no injection, no uncaught UI error');

  // The local graph still has g when a different client deletes that cloud
  // destination. A failed move must keep its original inbox row recoverable,
  // including after the website replaces its graph with the new cloud graph.
  const missingTarget = payload('fixture-a', 'deleted-target-move', 'temporary');
  await call('save', missingTarget);
  const beforeMove = await call('list', { accountId: 'fixture-a' });
  const sourceId = beforeMove.items.find(item => item.inbox && item.url === missingTarget.url).id;
  accounts.get('fixture-a').data[0].scenes[0].groups = [{ id: 'g2', name: 'Valid destination', items: [] }];
  const target = { accountId: 'fixture-a', id: sourceId, spaceId: 's', sceneId: 'c', groupId: 'g' };
  await boundedFast('deletedTargetMoveFailureMs', () => assert.rejects(call('move', target), /分组|保留|变化|变更/));
  const recovered = await call('list', { accountId: 'fixture-a' });
  assert.equal(recovered.items.filter(item => item.inbox && item.id === sourceId && item.url === missingTarget.url).length, 1, 'Missing cloud destination must restore the original inbox row');
  const hydrateFixture = async () => website.evaluate(data => { const key = 'yiyu-prototype-v1', value = JSON.parse(localStorage.getItem(key)); value.data = data; localStorage.setItem(key, JSON.stringify(value)); }, clone(accounts.get('fixture-a').data));
  await hydrateFixture();
  await popup.reload({ waitUntil: 'commit' }); await signed();
  const afterHydrate = await call('list', { accountId: 'fixture-a' });
  assert.equal(afterHydrate.items.filter(item => item.inbox && item.id === sourceId && item.url === missingTarget.url).length, 1, 'Reopen and website hydration must retain the restored inbox row');
  await boundedFast('deletedTargetMoveReselectMs', () => call('move', { ...target, groupId: 'g2' }));
  assert.equal(cloudCount('fixture-a', missingTarget.url), 1);
  assert.equal(accounts.get('fixture-a').data[0].scenes[0].groups.find(group => group.id === 'g2').items.filter(item => item[1] === missingTarget.url).length, 1);
  const afterReselect = await call('list', { accountId: 'fixture-a' });
  assert.equal(afterReselect.items.some(item => item.inbox && item.id === sourceId), false);
  assert.equal((await storage()).pending.some(entry => entry.kind === 'move' && entry.groupId === 'g' && entry.removeInboxIds?.includes(sourceId)), false, 'The rejected old move must not remain replayable');
  // Reintroducing that group must not resurrect the cancelled move during the
  // next unrelated journal flush.
  accounts.get('fixture-a').data[0].scenes[0].groups.push({ id: 'g', name: 'Recreated old destination', items: [] });
  await hydrateFixture();
  await call('save', { ...payload('fixture-a', 'after-reselect-flush'), groupId: 'g2' });
  assert.equal(accounts.get('fixture-a').data[0].scenes[0].groups.find(group => group.id === 'g').items.some(item => item[1] === missingTarget.url), false);
  assert.equal(cloudCount('fixture-a', missingTarget.url), 1);
  assert.deepEqual(pageErrors, []);
  assert.equal(browser.pages().length, pageCount + 2);
  cases.push('deleted cloud destination: failed move restores inbox through reopen/hydration, reselects g2 and never replays the old move');
}
(async () => {
  let error;
  try { await main(); } catch (failure) { error = failure; process.exitCode = 1; }
  finally {
    const result = { result: error ? 'FAIL' : 'PASS', browser: 'Edge', extensionVersion: version, runElapsedMs: Date.now() - runStarted, nativeFetch: true, network: 'exact Shiyu origin mapped to local TLS; fake HttpOnly Secure SameSite=Lax cookies only', elapsed, cases, pageErrors, requests, ...(error ? { error: error.stack } : {}) };
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ ...result, requests: result.requests.length, artifact: resultFile }));
    for (const res of held) res.destroy();
    await browser?.close();
    server?.closeAllConnections();
    if (server) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
