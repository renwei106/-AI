// Exercise the actual local adapter with isolated storage and authenticated APIs.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const ROOT = path.resolve(__dirname, '..'), KEY = 'yiyu-prototype-v1', ORIGIN = 'chrome-extension://abcdefghijklmnopabcdefghijklmnop';
const clone = value => JSON.parse(JSON.stringify(value));
const graph = owner => [{ id: 's', name: owner, scenes: [{ id: 'c', name: '场景', groups: [{ id: 'g', name: '收藏', items: [] }] }] }];
const state = owner => ({ signed: true, data: graph(owner), prefs: { accountProfile: { id: owner, name: owner }, accountDataUserId: owner, extensionInbox: [] } });
const input = (suffix, mode = 'group') => ({ accountId: 'a', mode, title: suffix, url: 'https://example.test/' + suffix, spaceId: 's', sceneId: 'c', groupId: 'g' });
function locks() {
  const queues = new Map();
  return { async request(name, options, action) {
    const previous = queues.get(name) || Promise.resolve();
    let release, abort;
    const done = new Promise(resolve => { release = resolve; });
    queues.set(name, previous.then(() => done));
    const cancelled = new Promise((_, reject) => {
      abort = () => reject(Object.assign(new Error('Lock wait aborted'), { name: 'AbortError' }));
      if (options.signal.aborted) abort(); else options.signal.addEventListener('abort', abort, { once: true });
    });
    try { await Promise.race([previous, cancelled]); if (options.signal.aborted) throw Object.assign(new Error('Lock wait aborted'), { name: 'AbortError' }); return await action(); }
    finally { options.signal.removeEventListener('abort', abort); release(); }
  } };
}
function fixture({ local = new Map([[KEY, JSON.stringify(state('a'))]]), owner = 'a' } = {}) {
  const listeners = new Map(), responses = new Map(), messages = [], writes = [], requests = [];
  let nextId = 0;
  const f = { local, owner, requests, writes, messages, server: { a: graph('a'), b: graph('b') }, failPUT: false, holdSession: null, holdGET: null, holdPUT: null };
  const response = (value, ok = true) => ({ ok, json: async () => clone(value) });
  const hold = (gate, answer) => {
    gate.started = true;
    return new Promise(resolve => { gate.release = () => resolve(answer()); });
  };
  const parent = { postMessage(value, origin) { messages.push({ value: clone(value), origin }); responses.get(value.id)?.(clone(value)); responses.delete(value.id); } };
  const context = {
    localStorage: { getItem: key => local.has(key) ? local.get(key) : null, setItem: (key, value) => { writes.push(key); local.set(key, String(value)); }, removeItem: key => { writes.push(key); local.delete(key); } },
    navigator: { locks: locks() }, parent, URL, Date, Map, Set, Object, Array, JSON, AbortController, crypto: { randomUUID }, console,
    CustomEvent: class { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    setTimeout(callback, delay) { const timer = setTimeout(callback, delay); if (delay === 30000) timer.unref(); return timer; }, clearTimeout,
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(callback); },
    dispatchEvent(event) { for (const callback of listeners.get(event.type) || []) callback(event); },
    async fetch(url, options = {}) {
      const method = options.method || 'GET', requestOwner = f.owner;
      requests.push({ url, method, owner: requestOwner, body: options.body ? JSON.parse(options.body) : null });
      if (url === '/api/shiyu/auth/session') {
        const answer = () => response(requestOwner ? { authenticated: true, user: { id: requestOwner, name: requestOwner } } : { authenticated: false });
        if (f.holdSession) { const gate = f.holdSession; f.holdSession = null; return hold(gate, answer); }
        return answer();
      }
      assert.equal(url, '/api/shiyu/auth/account');
      if (method === 'GET') {
        const value = { userId: requestOwner, data: clone(f.server[requestOwner] || []) }, answer = () => response(value);
        if (f.holdGET) { const gate = f.holdGET; f.holdGET = null; return hold(gate, answer); }
        return answer();
      }
      assert.equal(method, 'PUT'); const payload = JSON.parse(options.body); assert.equal(payload.userId, requestOwner);
      const answer = () => { if (f.failPUT) return response({ message: 'Isolated PUT failure' }, false); f.server[requestOwner] = clone(payload.data); return response({ ok: true, userId: requestOwner }); };
      if (f.holdPUT) { const gate = f.holdPUT; f.holdPUT = null; return hold(gate, answer); }
      return answer();
    }
  };
  context.window = context; context.globalThis = context;
  const sandbox = vm.createContext(context);
  for (const file of ['store.js', 'account-sync.js', 'bridge.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'dist/extension', file), 'utf8'), sandbox);
  f.context = context; f.store = context.ShiyuExtensionStore; f.sync = context.ShiyuAccountSync;
  f.saved = () => JSON.parse(local.get(KEY) || '{}');
  f.pending = owner => clone(f.store.pending(owner));
  f.emit = (data, overrides = {}) => context.dispatchEvent({ type: 'message', origin: ORIGIN, source: parent, data, ...overrides });
  f.request = (op, payload = {}, options = {}) => {
    const message = { protocol: 'shiyu-local-v1', id: 'test-' + ++nextId, deadline: Date.now() + 8000, op, payload, account: { user: { id: 'a' } }, ...options };
    return new Promise(resolve => { responses.set(message.id, resolve); f.emit(message); });
  };
  f.microtasks = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
  return f;
}
async function started(f, gate) { for (let i = 0; i < 20 && !gate.started; i++) await f.microtasks(); assert(gate.started, 'Held request must begin'); }

test('only the extension parent with the expected protocol can request local data', async () => {
  const f = fixture(), message = { protocol: 'shiyu-local-v1', id: 'untrusted', deadline: Date.now() + 8000, op: 'state', account: { user: { id: 'a' } } };
  f.emit(message, { origin: 'https://untrusted.test' }); f.emit(message, { source: {} }); f.emit({ ...message, protocol: 'wrong' });
  await f.microtasks(); assert.equal(f.requests.length, 0); assert.equal(f.writes.length, 0); assert.equal(f.messages.length, 0);
});

test('expired dispatch performs no API or storage operations', async () => {
  const f = fixture(), original = new Map(f.local);
  const result = await f.request('save', input('expired'), { deadline: Date.now() - 1 });
  assert.equal(result.code, 'DEADLINE_EXCEEDED'); assert.equal(f.requests.length, 0); assert.equal(f.writes.length, 0); assert.deepEqual(f.local, original);
});

test('forged owner and unauthenticated parents cannot read or modify private state', async () => {
  for (const owner of ['a', null]) {
    const f = fixture({ owner }), original = new Map(f.local);
    const result = await f.request('state', {}, { account: { user: { id: 'b' }, data: graph('b') } });
    assert.equal(result.ok, false); assert.equal(result.value, undefined); assert.equal(f.writes.length, 0); assert.deepEqual(f.local, original);
    assert.deepEqual(f.requests.map(request => request.url), ['/api/shiyu/auth/session']);
  }
});

test('owner changes while session validation waits reject the old message without hydration', async () => {
  const f = fixture(), gate = {}; f.holdSession = gate;
  const pending = f.request('save', input('stale-owner')); await started(f, gate);
  f.owner = 'b'; f.local.set(KEY, JSON.stringify(state('b'))); const newLogin = new Map(f.local);
  gate.release(); const result = await pending;
  assert.equal(result.ok, false); assert.equal(f.writes.length, 0); assert.deepEqual(f.local, newLogin); assert.equal(f.pending('a').length, 0);
});

test('deadline expiration during session validation prevents later local writes', async () => {
  const f = fixture(), gate = {}; f.holdSession = gate;
  const pending = f.request('save', input('late-session'), { deadline: Date.now() + 25 }); await started(f, gate);
  await new Promise(resolve => setTimeout(resolve, 35)); gate.release(); const result = await pending;
  assert.equal(result.code, 'DEADLINE_EXCEEDED'); assert.equal(f.writes.length, 0); assert.equal(f.pending('a').length, 0);
});

test('cold or mismatched local data requests cloud hydration without changing storage', async () => {
  const values = [state('b'), { ...state('a'), prefs: { ...state('a').prefs, accountDataUserId: 'b' } }, { ...state('a'), data: null }];
  for (const value of values) {
    const f = fixture({ local: new Map([[KEY, JSON.stringify(value)]]) }), original = new Map(f.local);
    const result = await f.request('state'); assert.deepEqual(result.value, { needsData: true }); assert.equal(f.writes.length, 0); assert.deepEqual(f.local, original);
  }
});

test('cold mutation and library operations request hydration before any side effects', async () => {
  for (const op of ['list', 'search', 'save', 'move']) {
    const f = fixture({ local: new Map([[KEY, JSON.stringify(state('b'))]]) }), original = new Map(f.local);
    const result = await f.request(op, { ...input('cold-operation'), id: 'not-yet-hydrated', query: 'cold' });
    assert.deepEqual(result.value, { needsData: true }); assert.equal(f.writes.length, 0); assert.deepEqual(f.local, original); assert.equal(f.pending('a').length, 0);
  }
});

test('first authenticated hydration is allowed and switching accounts retains owner sidecars', async () => {
  const f = fixture({ local: new Map() });
  const first = await f.request('state', {}, { account: { user: { id: 'a' }, data: graph('a') } }); assert.equal(first.value.accountId, 'a');
  await f.request('save', input('a-inbox', 'temporary'));
  f.owner = 'b';
  const second = await f.request('state', {}, { account: { user: { id: 'b' }, data: graph('b') } }); assert.equal(second.value.accountId, 'b');
  assert.equal(JSON.parse(f.local.get('shiyu-extension-inbox:a'))[0].item[1], 'https://example.test/a-inbox'); assert.deepEqual(f.saved().prefs.extensionInbox, []);
  f.owner = 'a'; await f.request('state', {}, { account: { user: { id: 'a' }, data: graph('a') } });
  assert.equal(f.saved().prefs.extensionInbox[0].item[1], 'https://example.test/a-inbox');
});

test('ready local data and effective theme survive a state request containing stale cloud data', async () => {
  const value = state('a'); value.data[0].scenes[0].groups[0].items.push(['local', 'https://example.test/local', '', '']);
  const f = fixture({ local: new Map([[KEY, JSON.stringify(value)], ['shiyu-extension-theme:a', JSON.stringify({ '/space.html': { color: '#123456', mode: 'dark' } })]]) });
  const result = await f.request('state', {}, { account: { user: { id: 'a' }, data: graph('a'), themePath: '/space.html' } });
  assert.deepEqual(result.value.theme, { color: '#123456', mode: 'dark' }); assert.equal(f.saved().data[0].scenes[0].groups[0].items[0][0], 'local');
});

test('common groups preserve own items, referenced bookmarks and frequency ordering', async () => {
  const value = state('a');
  value.data[0].scenes[0].groups[0].items.push(['saved', 'https://example.test/saved', 'note', '']);
  value.prefs.cornerCollections = { a: { usage: { 'https://example.test/saved': 9 }, groups: [
    { id: 'inbox', system: 'inbox', name: '稍后整理', refs: [] },
    { id: 'common', name: '常用', sort: 'frequency', refs: [
      { url: 'https://example.test/own', own: ['own', 'https://example.test/own', '', ''] },
      { gid: 'g', url: 'https://example.test/saved' }
    ] }
  ] } };
  const f = fixture({ local: new Map([[KEY, JSON.stringify(value)]]) }), result = await f.request('list');
  assert.equal(result.ok, true); assert.equal(result.value.commonGroups.length, 1); assert.equal(result.value.commonGroups[0].name, '常用');
  assert.deepEqual(result.value.commonGroups[0].items.map(item => item.url), ['https://example.test/saved', 'https://example.test/own']);
  assert.equal(result.value.commonGroups[0].items[0].description, 'note'); assert.equal(result.value.commonGroups[0].items[1].path, '我的常用');
});

test('temporary save stays local and duplicate message IDs run only once', async () => {
  const f = fixture();
  const result = await f.request('save', input('local-only', 'temporary'), { id: 'same-id' }); assert.equal(result.ok, true);
  const again = await f.request('save', input('local-only', 'temporary'), { id: 'same-id' }); assert.deepEqual(again, result);
  assert.equal(f.saved().prefs.extensionInbox.length, 1); assert.equal(f.requests.length, 1); assert.equal(f.requests[0].url, '/api/shiyu/auth/session');
});

test('group save responds only after successful cloud PUT and retains ordinary local edits', async () => {
  const f = fixture(), gate = {}; f.holdPUT = gate;
  const pending = f.request('save', input('confirmed')); await started(f, gate); assert.equal(f.messages.length, 0); assert.equal(f.pending('a').length, 1);
  const value = f.saved(); value.data[0].scenes[0].groups[0].items.push(['ordinary edit', 'https://example.test/edit', '', '']); f.local.set(KEY, JSON.stringify(value));
  gate.release(); const result = await pending; assert.equal(result.ok, true); assert.equal(f.pending('a').length, 0);
  assert.deepEqual(f.saved().data[0].scenes[0].groups[0].items.map(item => item[1]), ['https://example.test/confirmed', 'https://example.test/edit']);
  assert.deepEqual(f.requests.map(request => [request.url, request.method]), [['/api/shiyu/auth/session', 'GET'], ['/api/shiyu/auth/account', 'GET'], ['/api/shiyu/auth/account', 'PUT']]);
});

test('failed group PUT retains its journal and an explicit duplicate retry confirms it', async () => {
  const f = fixture(); f.failPUT = true;
  const failed = await f.request('save', { ...input('retry'), url: 'https://EXAMPLE.test/retry' }); assert.equal(failed.ok, false); assert.equal(f.pending('a').length, 1);
  f.failPUT = false; const retried = await f.request('save', input('retry')); assert.equal(retried.ok, true); assert.equal(f.pending('a').length, 0);
  assert.equal(f.server.a[0].scenes[0].groups[0].items.length, 1); assert.equal(f.server.a[0].scenes[0].groups[0].items[0][1], 'https://example.test/retry');
});

test('an existing local group item absent from the cloud is confirmed by one PUT', async () => {
  const value = state('a'); value.data[0].scenes[0].groups[0].items.push(['original name', 'https://example.test/unsynced', 'original note', '']);
  const f = fixture({ local: new Map([[KEY, JSON.stringify(value)]]) });
  const result = await f.request('save', input('unsynced')); assert.equal(result.ok, true); assert.equal(result.value.duplicate, true); assert.equal(f.pending('a').length, 0);
  assert.equal(f.requests.filter(request => request.method === 'PUT').length, 1); assert.deepEqual(f.server.a[0].scenes[0].groups[0].items, value.data[0].scenes[0].groups[0].items.map(item => [item[0], item[1], item[2], 'https://example.test/favicon.ico']));
  assert.deepEqual(f.saved().data, value.data, 'Confirmation must retain the existing local item fields.');
});

test('a duplicate already present in the cloud is GET-confirmed without an extra PUT', async () => {
  const value = state('a'); value.data[0].scenes[0].groups[0].items.push(['existing', 'https://example.test/existing', '', 'https://example.test/favicon.ico']);
  const f = fixture({ local: new Map([[KEY, JSON.stringify(value)]]) }); f.server.a = clone(value.data);
  const result = await f.request('save', input('existing')); assert.equal(result.ok, true); assert.equal(result.value.duplicate, true); assert.equal(f.pending('a').length, 0);
  assert.equal(f.requests.filter(request => request.method === 'PUT').length, 0); assert.deepEqual(f.saved().data, value.data);
});

test('failed confirmation of a local-only duplicate retains its journal for explicit retry', async () => {
  const value = state('a'); value.data[0].scenes[0].groups[0].items.push(['existing', 'https://example.test/existing', '', '']);
  const f = fixture({ local: new Map([[KEY, JSON.stringify(value)]]) }); f.failPUT = true;
  const result = await f.request('save', input('existing')); assert.equal(result.ok, false); assert.equal(f.pending('a').length, 1); assert.deepEqual(f.saved().data, value.data);
  f.failPUT = false; const retried = await f.request('save', input('existing')); assert.equal(retried.ok, true); assert.equal(f.pending('a').length, 0); assert.equal(f.server.a[0].scenes[0].groups[0].items.length, 1);
});

test('failed move remains retryable after its inbox row has been removed locally', async () => {
  const f = fixture(); await f.request('save', input('move-retry', 'temporary')); const id = f.saved().prefs.extensionInbox[0].id;
  const payload = { accountId: 'a', id, spaceId: 's', sceneId: 'c', groupId: 'g' }; f.failPUT = true;
  const failed = await f.request('move', payload); assert.equal(failed.ok, false); assert.equal(f.saved().prefs.extensionInbox.length, 0); assert.equal(f.pending('a').filter(entry => entry.kind === 'move').length, 1);
  f.failPUT = false; const retried = await f.request('move', payload); assert.equal(retried.ok, true); assert.equal(f.pending('a').length, 0); assert.equal(f.server.a[0].scenes[0].groups[0].items[0][1], 'https://example.test/move-retry');
});

test('deleted cloud destination restores the original inbox row through hydration and safely retargets', async () => {
  const f = fixture(); await f.request('save', input('deleted-destination', 'temporary'));
  const original = clone(f.saved().prefs.extensionInbox[0]), id = original.id;
  f.server.a[0].scenes[0].groups = [{ id: 'g2', name: '新的分组', items: [] }];
  const failed = await f.request('move', { accountId: 'a', id, spaceId: 's', sceneId: 'c', groupId: 'g' });
  assert.equal(failed.ok, false); assert.match(failed.error, /仍保留在稍后整理/); assert.deepEqual(f.saved().prefs.extensionInbox, [original]);
  assert.equal(f.pending('a').filter(entry => entry.kind === 'move').length, 0); assert.equal(f.pending('a').filter(entry => entry.kind === 'inbox').length, 1);
  assert.equal(f.requests.filter(request => request.method === 'PUT').length, 0, 'An absent destination must not resurrect its old cloud group.');
  const hydrated = f.saved(); hydrated.data = clone(f.server.a); f.store.applyPending(hydrated, f.pending('a')); f.local.set(KEY, JSON.stringify(hydrated));
  const reopened = fixture({ local: f.local }); reopened.server = f.server;
  const list = await reopened.request('list'); assert.deepEqual(list.value.items.filter(item => item.inbox).map(item => [item.id, item.url]), [[id, original.item[1]]]);
  const retry = await reopened.request('move', { accountId: 'a', id, spaceId: 's', sceneId: 'c', groupId: 'g2' }); assert.equal(retry.ok, true); assert.equal(reopened.pending('a').length, 0); assert.equal(reopened.saved().prefs.extensionInbox.length, 0);
  assert.deepEqual(reopened.server.a[0].scenes[0].groups[0].items.map(item => item[1]), [original.item[1]]);
  reopened.server.a[0].scenes[0].groups.push({ id: 'g', name: '恢复的旧组', items: [] }); await reopened.request('save', { ...input('unrelated'), groupId: 'g2' });
  assert.equal(reopened.server.a[0].scenes[0].groups.find(group => group.id === 'g').items.length, 0, 'The replaced old move must never replay to its original destination.');
});

test('recovery journal write failure keeps the original move instead of dropping the bookmark', async () => {
  const f = fixture(); await f.request('save', input('recover-storage-failure', 'temporary'));
  const id = f.saved().prefs.extensionInbox[0].id; f.server.a[0].scenes[0].groups = [];
  const put = f.context.localStorage.setItem; let journalWrites = 0;
  f.context.localStorage.setItem = (key, value) => { if (key === f.store.PENDING_KEY && ++journalWrites === 2) throw new Error('Isolated full storage'); return put(key, value); };
  const failed = await f.request('move', { accountId: 'a', id, spaceId: 's', sceneId: 'c', groupId: 'g' });
  assert.equal(failed.ok, false); assert.equal(f.pending('a').length, 1); assert.equal(f.pending('a')[0].kind, 'move'); assert.equal(f.pending('a')[0].inboxEntry.id, id);
  f.context.localStorage.setItem = put;
  const retried = await f.request('move', { accountId: 'a', id, spaceId: 's', sceneId: 'c', groupId: 'g' });
  assert.equal(retried.ok, false); assert.match(retried.error, /仍保留在稍后整理/); assert.equal(f.pending('a')[0].kind, 'inbox'); assert.equal(f.saved().prefs.extensionInbox[0].id, id);
});

test('owner changes while cloud GET waits prevent PUT and journal acknowledgment', async () => {
  const f = fixture(), gate = {}; f.holdGET = gate;
  const pending = f.request('save', input('stale-cloud')); await started(f, gate);
  f.owner = 'b'; f.local.set(KEY, JSON.stringify(state('b'))); const newLogin = new Map(f.local);
  gate.release(); const result = await pending; assert.equal(result.ok, false); assert.equal(f.requests.filter(request => request.method === 'PUT').length, 0); assert.equal(f.pending('a').length, 1); assert.deepEqual(f.local, newLogin);
});

test('shared lock timeout keeps the local group journal without issuing a cloud request', async () => {
  const f = fixture(); let release, entered = false;
  const lock = f.sync.withLock('a', { deadline: Date.now() + 8000 }, async () => { entered = true; await new Promise(resolve => { release = resolve; }); });
  await f.microtasks(); assert(entered);
  const result = await f.request('save', input('locked'), { deadline: Date.now() + 25 });
  assert.equal(result.code, 'DEADLINE_EXCEEDED'); assert.equal(f.pending('a').length, 1); assert.equal(f.requests.length, 1); release(); await lock;
});
