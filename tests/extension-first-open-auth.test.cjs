// Run the real background worker and injected adapter in isolated pages; no live accounts.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const clone = value => value === undefined ? value : JSON.parse(JSON.stringify(value));
const key = 'yiyu-prototype-v1';
const source = fs.readFileSync(path.join(root, 'browser-extension-lab/background.js'), 'utf8')
  .replace(/^import \{ SITE_URLS \} from '.\/config\.js';/m, "const SITE_URLS = ['https://shiyubox.com/'];");
const spaceFor = owner => [{ id: 'space-1', name: owner + '的空间', scenes: [{ id: 'scene-1', name: '日常', groups: [{ id: 'group-1', name: '收藏', items: [] }] }] }];
const stateFor = owner => ({ signed: true, prefs: { accountProfile: { id: owner, name: owner }, accountDataUserId: owner,
  color: '#345678', mode: 'dark', extensionInbox: [] }, data: spaceFor(owner) });
const bookmark = owner => ({ accountId: owner, mode: 'group', title: '测试收藏', url: 'https://example.test/a', description: '备注',
  spaceId: 'space-1', sceneId: 'scene-1', groupId: 'group-1' });

function fixture({ pageState = stateFor('account-a'), cached, noTabs = false, loadingAttempts = 0, loadedBridge = false, sessionUser = { id: 'account-a' } } = {}) {
  let listener, nextTab = 7, failures = loadingAttempts;
  const extensionStorage = cached ? { shiyuAccountState: clone(cached) } : {};
  const local = new Map(pageState === null ? [] : [[key, JSON.stringify(pageState)]]);
  const tabs = noTabs ? [] : [{ id: 7, url: 'https://shiyubox.com/extension/start.html' }];
  const f = { sessionUser, serverData: spaceFor(sessionUser?.id || 'account-a'), requests: [], injected: [], events: [], created: [],
    fetchHook: null, tabs, extensionStorage, pageState: () => JSON.parse(local.get(key) || 'null'),
    setPageState: value => value === null ? local.delete(key) : local.set(key, JSON.stringify(value)) };
  const page = { location: { origin: 'https://shiyubox.com', hostname: 'shiyubox.com', pathname: '/extension/start.html' },
    localStorage: { getItem: name => local.has(name) ? local.get(name) : null, setItem: (name, value) => local.set(name, String(value)) },
    crypto: { randomUUID }, CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    dispatchEvent: event => { f.events.push(event.type); }, URL, Date, console, structuredClone, AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => {
      f.requests.push({ url, options });
      assert.equal(options.credentials, 'same-origin');
      if (f.fetchHook) { const intercepted = await f.fetchHook(url, options); if (intercepted) return intercepted; }
      const json = data => ({ ok: true, json: async () => clone(data) });
      if (url === '/api/shiyu/auth/session') return json(f.sessionUser ? { authenticated: true, user: f.sessionUser } : { authenticated: false });
      if (url === '/api/shiyu/auth/account') return json({ userId: f.sessionUser?.id, data: f.serverData });
      if (url === '/api/shiyu/auth/tools') {
        if (options.method === 'POST') { const body = JSON.parse(options.body); return json({ userId: f.sessionUser?.id, data: body.data, revision: 1 }); }
        return json({ userId: f.sessionUser?.id, tools: { memo: { data: { notes: [], lastNumber: 0 }, revision: 0 } } });
      }
      throw Error('Unexpected request: ' + url);
    } };
  page.window = page; page.globalThis = page;
  const pageContext = vm.createContext(page);
  if (loadedBridge) {
    vm.runInContext(fs.readFileSync(path.join(root, 'dist/extension/store.js'), 'utf8'), pageContext);
    page.shiyuExtensionBridge = { dispatch: async request => {
      f.bridgeCalls ||= []; f.bridgeCalls.push(request.type);
      if (request.type === 'state') return { ok: true, value: { ...page.ShiyuExtensionStore.snapshot(), theme: { color: '#abcdef', mode: 'light' } } };
      return { ok: true, value: page.ShiyuExtensionStore[request.type](request.payload) };
    } };
  }
  const chrome = { runtime: { id: 'test-extension', getManifest: () => ({ version: '1.0.0' }),
    getURL: file => 'chrome-extension://test-extension/' + file, onMessage: { addListener: value => { listener = value; } },
    onInstalled: { addListener() {} }, onStartup: { addListener() {} } },
    tabs: { query: async () => clone(tabs), create: async input => { const tab = { id: ++nextTab, url: input.url }; tabs.push(tab); f.created.push(input); return tab; } },
    scripting: { executeScript: async ({ target, func, args, files }) => {
      assert(tabs.some(tab => tab.id === target.tabId));
      if (failures-- > 0) throw Error('The newly created tab is still loading.');
      if (files) { for (const file of files) {
        assert.equal(file, 'account-store.js'); f.injected.push(file);
        vm.runInContext(fs.readFileSync(path.join(root, 'browser-extension-lab', file), 'utf8'), pageContext);
      } return [{ result: undefined }]; }
      page.args = args;
      return [{ result: await vm.runInContext('(' + func.toString() + ')(...args)', pageContext) }];
    } },
    action: { setPopup: async () => {}, onClicked: { addListener() {} } }, sidePanel: { setPanelBehavior: async () => {} },
    storage: { onChanged: { addListener() {} }, local: {
      get: async name => ({ [name]: extensionStorage[name] }), set: async values => Object.assign(extensionStorage, clone(values))
    } } };
  const context = { chrome, navigator: { userAgent: 'Chrome/140' }, URL, setTimeout, clearTimeout, console };
  context.globalThis = context;
  vm.runInNewContext(source, context, { filename: 'background.js' });
  f.request = request => new Promise((resolve, reject) => {
    const keepChannel = listener(request, { id: 'test-extension', url: chrome.runtime.getURL('popup.html') }, response => {
      if (!response?.ok) reject(Error(response?.error || 'No response')); else resolve(clone(response.value));
    });
    assert.equal(keepChannel, true);
  });
  return f;
}

test('first install on a non-homepage supports state, save, search, list and move without website UI scripts', async () => {
  const f = fixture();
  const initial = await f.request({ type: 'state' });
  assert.equal(initial.accountId, 'account-a');
  assert.deepEqual(initial.theme, { color: '#345678', mode: 'dark' });
  assert.equal(f.created.length, 0);
  assert.deepEqual(f.injected, ['account-store.js']);
  assert.equal(f.requests.length, 0, 'An already-saved website login must not wait for network or app.js.');
  assert.equal((await f.request({ type: 'save', payload: bookmark('account-a') })).label, 'account-a的空间 / 日常 / 收藏');
  assert.equal(f.pageState().data[0].scenes[0].groups[0].items[0][1], bookmark('account-a').url);
  assert.equal((await f.request({ type: 'search', payload: { accountId: 'account-a', query: '测试收藏' } })).total, 1);
  assert.equal((await f.request({ type: 'list', payload: { accountId: 'account-a' } })).items.length, 1);
  await f.request({ type: 'save', payload: { ...bookmark('account-a'), mode: 'temporary', url: 'https://example.test/inbox' } });
  const inboxId = f.pageState().prefs.extensionInbox[0].id;
  await f.request({ type: 'move', payload: { ...bookmark('account-a'), id: inboxId } });
  assert.equal(f.pageState().prefs.extensionInbox.length, 0);
  assert.equal(f.pageState().data[0].scenes[0].groups[0].items.length, 2);
  assert(f.events.includes('shiyu-extension-change'));
});

test('a loaded page retains its effective theme and existing bridge', async () => {
  const f = fixture({ loadedBridge: true });
  const state = await f.request({ type: 'state' });
  assert.deepEqual(state.theme, { color: '#abcdef', mode: 'light' });
  await f.request({ type: 'save', payload: bookmark('account-a') });
  assert.deepEqual(f.bridgeCalls, ['state', 'save']);
  assert.deepEqual(f.injected, []);
});

test('the current account wins over stale extension cache and old-account writes are rejected', async () => {
  const f = fixture({ cached: { signed: true, accountId: 'account-b' } });
  assert.equal((await f.request({ type: 'state' })).accountId, 'account-a');
  f.setPageState(stateFor('account-b'));
  f.sessionUser = { id: 'account-b' };
  assert.equal((await f.request({ type: 'state' })).accountId, 'account-b');
  const before = f.pageState();
  for (const type of ['save', 'list', 'move', 'search']) await assert.rejects(f.request({ type, payload: bookmark('account-a') }), /登录账号已变化/);
  assert.deepEqual(f.pageState(), before);
  f.setPageState({ signed: false, prefs: {}, data: [] });
  f.sessionUser = null;
  assert.equal((await f.request({ type: 'state' })).signed, false);
  await assert.rejects(f.request({ type: 'save', payload: bookmark('account-b') }), /登录账号已变化/);
});

test('a cookie-only login reads genuine session/account APIs and is ready to save before app.js', async () => {
  const f = fixture({ pageState: null, sessionUser: { id: 'account-a', name: '账号A' }, noTabs: true, loadingAttempts: 1 });
  const state = await f.request({ type: 'state' });
  assert.equal(state.accountId, 'account-a');
  assert.equal(state.spaces[0].name, 'account-a的空间');
  assert.equal(f.created.length, 1);
  assert.equal(f.created[0].active, false);
  assert.deepEqual(f.requests.map(request => request.url), ['/api/shiyu/auth/session', '/api/shiyu/auth/account']);
  await f.request({ type: 'save', payload: bookmark('account-a') });
  assert.equal(f.pageState().data[0].scenes[0].groups[0].items.length, 1);
});

test('unsigned storage does not hide a signed cookie session and display preferences survive', async () => {
  const f = fixture({ pageState: { signed: false, prefs: { color: '#fedcba', mode: 'light', font: 'custom', membership: { member: true }, membershipDemo: { member: true }, demoMemberOrders: ['old'],
      cornerCollections: { old: { groups: [{ id: 'old', name: '旧账号专属', refs: [] }] } }, extensionInbox: [{ id: 'old-account' }] }, data: spaceFor('old') },
    sessionUser: { id: 'account-a', name: '账号A' } });
  const state = await f.request({ type: 'state' });
  assert.equal(state.signed, true);
  assert.deepEqual(state.theme, { color: '#fedcba', mode: 'light' });
  assert.equal(f.pageState().prefs.font, 'custom');
  assert.deepEqual(f.pageState().prefs.extensionInbox, []);
  assert.equal(f.pageState().prefs.membership, null);
  assert.equal(f.pageState().prefs.membershipDemo, null);
  assert.deepEqual(f.pageState().prefs.demoMemberOrders, []);
  assert.equal(state.spaces[0].name, 'account-a的空间');
  assert.deepEqual((await f.request({ type: 'list', payload: { accountId: 'account-a' } })).commonGroups, []);
});

test('a prototype signed flag without an actual production account cannot create a login', async () => {
  const f = fixture({ pageState: { signed: true, prefs: {}, data: [] }, sessionUser: null });
  assert.equal((await f.request({ type: 'state' })).signed, false);
});

test('cold-start hydration rejects mismatching owners and concurrent account changes without writing', async () => {
  const f = fixture({ pageState: null, sessionUser: { id: 'account-a', name: 'A' } });
  f.fetchHook = url => url === '/api/shiyu/auth/account' ? { ok: true, json: async () => ({ userId: 'account-b', data: spaceFor('account-b') }) } : null;
  await assert.rejects(f.request({ type: 'state' }), /登录账号已变化/);
  assert.equal(f.pageState(), null);
  f.fetchHook = url => { if (url === '/api/shiyu/auth/account') f.setPageState(stateFor('account-b')); return null; };
  await assert.rejects(f.request({ type: 'state' }), /登录账号已变化/);
  assert.equal(f.pageState().prefs.accountProfile.id, 'account-b');
});

test('a stalled session request is bounded and Retry recovers without returning an old cached account', async () => {
  const f = fixture({ pageState: null, cached: { signed: true, accountId: 'old' } });
  f.fetchHook = (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Error('request aborted')), { once: true }));
  const started = Date.now();
  await assert.rejects(f.request({ type: 'state' }), /aborted/);
  assert(Date.now() - started < 2600, 'Background must finish before the popup 3-second timeout.');
  assert.equal(f.pageState(), null);
  f.fetchHook = null; f.sessionUser = { id: 'account-a', name: 'A' };
  assert.equal((await f.request({ type: 'state' })).accountId, 'account-a');
});

test('memo tools work on a non-homepage and reject mismatching API ownership', async () => {
  const f = fixture({ sessionUser: { id: 'account-a' } });
  assert.equal((await f.request({ type: 'tool-records', payload: { tool: 'memo', action: 'read', accountId: 'account-a' } })).revision, 0);
  const saved = await f.request({ type: 'tool-records', payload: { tool: 'memo', action: 'save', accountId: 'account-a', revision: 0, item: { id: 'memo-1', content: '测试小记' } } });
  assert.equal(saved.data.notes[0].content, '测试小记');
  f.sessionUser = { id: 'account-b' };
  await assert.rejects(f.request({ type: 'tool-records', payload: { tool: 'memo', action: 'save', accountId: 'account-a', revision: 0, item: { id: 'memo-2', content: '拒绝保存' } } }), /无法获取账号数据/);
  assert.equal(f.requests.filter(request => request.options.method === 'POST').length, 1);
});

test('cookie account changes reject stale locally signed mutations before any local write', async () => {
  const f = fixture({ sessionUser: { id: 'account-b' } });
  const before = f.pageState();
  for (const type of ['save', 'move', 'list', 'search']) await assert.rejects(f.request({ type, payload: bookmark('account-a') }), /登录账号已变化/);
  assert.deepEqual(f.pageState(), before);
  assert.equal(f.events.length, 0);
  f.sessionUser = null;
  await assert.rejects(f.request({ type: 'save', payload: bookmark('account-a') }), /登录账号已变化/);
  assert.deepEqual(f.pageState(), before);
});
