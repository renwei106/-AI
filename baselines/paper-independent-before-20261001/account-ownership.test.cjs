'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const vm = require('node:vm');
const { once } = require('node:events');
const { pathToFileURL } = require('node:url');
const ts = require('../node_modules/typescript');
const { createMembershipService } = require('../../导航站/payments/membership.cjs');

test('account middleware binds reads and writes to the expected session user', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-account-ownership-'));
  const usersFile = path.join(dir, 'users.json');
  const adminRoot = path.resolve(__dirname, '..');
  const frontRoot = path.resolve(adminRoot, '../导航站');
  const space = id => ({ id, name: id, icon: 'test', scenes: [{ id: 'scene', name: 'scene', description: '', groups: [] }] });
  const memberships = createMembershipService({
    usersFile, invitationsFile: path.join(dir, 'invitations.json'),
    readPlans: () => [{ id: 'free', name: '免费版', entitlements: ['space-limit', 'scene-limit', 'group-limit'].map(key => ({ key, enabled: true, value: 1 })) }],
    readExperience: () => ({ enabled: false, values: {} }),
  });
  memberships.writeUsers(['account-a', 'account-b'].map(id => ({
    id, name: id, phone: 'test-phone-' + id, email: id + '@example.test', password: 'test-only', member: false, memberEvents: [],
    blacklisted: false, spaces: 1, accountData: [space(id + '-original')],
  })));

  // Run the actual cookie/session store against a temporary file, never a live session store.
  const sessionsModule = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(frontRoot, 'theme-access/store.cjs'), 'utf8'), {
    module: sessionsModule, exports: sessionsModule.exports, require,
    process: { env: { SHIYU_THEME_ACCESS_STORE: path.join(dir, 'sessions') } },
    __dirname: path.join(frontRoot, 'theme-access'),
  });
  const sessions = sessionsModule.exports;
  const cookies = Object.fromEntries(['account-a', 'account-b'].map(id => [id, 'shiyu_user_session=' + sessions.issueSession(id)]));
  const onboardingModule = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(adminRoot, 'shiyu-onboarding.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { module: onboardingModule, exports: onboardingModule.exports, structuredClone, Date, Error });
  const runtimeRequire = name => {
    if (name === './shiyu-onboarding') return onboardingModule.exports;
    if (name.includes('theme-access/store')) return sessions;
    if (name.includes('payments/membership')) return { createMembershipService: () => memberships };
    if (name.includes('experience-test/store')) return { get: () => ({ enabled: false, values: {} }) };
    if (name === 'node:module') return { createRequire: () => runtimeRequire };
    if (name === './platform-access-plugin') return { getPlatformSession: () => null };
    if (name === './analytics/runtime') return { observeAnalyticsLogin: () => {} };
    if (name === './shiyu-invitation-plugin' || name === './shiyu-library') return {};
    if (name.startsWith('node:')) return require(name);
    throw Error('External service access forbidden: ' + name);
  };
  const source = fs.readFileSync(path.join(adminRoot, 'shiyu-user-plugin.ts'), 'utf8')
    .replaceAll('import.meta.url', JSON.stringify(pathToFileURL(path.join(dir, 'entry.ts')).href));
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const pluginModule = { exports: {} };
  vm.runInNewContext(code, {
    module: pluginModule, exports: pluginModule.exports, require: runtimeRequire,
    process: { env: { SHIYU_USERS_FILE: usersFile } }, URL, Date, Error, console, Buffer, structuredClone,
    fetch: () => { throw Error('External fetch forbidden'); },
  });
  let middleware;
  pluginModule.exports.shiyuUserPlugin().configureServer({ middlewares: { use: handler => { middleware = handler; } } });
  const server = http.createServer((req, res) => {
    Promise.resolve(middleware(req, res, () => { res.writeHead(404); res.end(); }))
      .catch(error => { res.writeHead(500); res.end(JSON.stringify({ message: error.message })); });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => {
    server.close(); server.closeAllConnections();
    assert.equal(path.dirname(dir), os.tmpdir());
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  const request = async (user, method = 'GET', body, endpoint = '/api/shiyu/auth/account') => {
    const response = await fetch(baseUrl + endpoint, {
      method, headers: { 'content-type': 'application/json', ...(cookies[user] ? { cookie: cookies[user] } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };

  const original = fs.readFileSync(usersFile, 'utf8');
  await t.test('session profile belongs only to the current cookie and contains no credentials', async () => {
    for (const id of ['account-a', 'account-b']) {
      const result = await request(id, 'GET', undefined, '/api/shiyu/auth/session');
      assert.equal(result.status, 200);
      assert.equal(result.body.authenticated, true);
      assert.equal(result.body.user.id, id);
      assert.equal(result.body.user.name, id);
      assert.equal(result.body.user.phone, 'test-phone-' + id);
      assert.equal(result.body.user.email, id + '@example.test');
      assert.equal(result.body.user.password, undefined);
      assert.equal(result.body.user.token, undefined);
      assert.equal(result.body.token, undefined);
      assert.equal(result.body.user.memberEvents, undefined);
      assert.equal(result.body.user.accountData, undefined);
    }
    const guest = await request('none', 'GET', undefined, '/api/shiyu/auth/session');
    assert.equal(guest.body.authenticated, false);
    assert.equal(guest.body.user, undefined);
    assert.equal(fs.readFileSync(usersFile, 'utf8'), original);
  });
  await t.test('GET reports the authenticated owner, with no write', async () => {
    for (const id of ['account-a', 'account-b']) {
      const result = await request(id);
      assert.equal(result.status, 200);
      assert.equal(result.body.userId, id);
      assert.equal(result.body.data[0].id, id + '-original');
    }
    assert.equal(fs.readFileSync(usersFile, 'utf8'), original);
  });
  await t.test('stale B payload under A cookie and stale A payload under B cookie are rejected without partial writes', async () => {
    for (const [sessionId, payloadId] of [['account-a', 'account-b'], ['account-b', 'account-a']]) {
      const result = await request(sessionId, 'PUT', { userId: payloadId, data: [space('stale-data')] });
      assert.equal(result.status, 409);
      assert.equal(result.body.code, 'ACCOUNT_SESSION_MISMATCH');
      assert.equal(fs.readFileSync(usersFile, 'utf8'), original);
    }
  });
  await t.test('missing or malformed expected owner never falls back to the cookie owner', async () => {
    for (const userId of [undefined, null, '', 0, ['account-a']]) {
      assert.equal((await request('account-a', 'PUT', { userId, data: [space('stale-data')] })).status, 409);
      assert.equal(fs.readFileSync(usersFile, 'utf8'), original);
    }
  });
  await t.test('no authenticated session cannot read or save account data', async () => {
    assert.equal((await request('none')).status, 401);
    assert.equal((await request('none', 'PUT', { userId: 'account-a', data: [] })).status, 401);
    assert.equal(fs.readFileSync(usersFile, 'utf8'), original);
  });
  await t.test('matching owner still enforces existing validation and quotas', async () => {
    assert.equal((await request('account-a', 'PUT', { userId: 'account-a', data: {} })).status, 400);
    assert.equal((await request('account-a', 'PUT', { userId: 'account-a', data: [space('one'), space('two')] })).status, 400);
    assert.equal(fs.readFileSync(usersFile, 'utf8'), original);
  });
  await t.test('matching save updates only that account and returns its owner', async () => {
    const before = memberships.readUsers();
    const result = await request('account-a', 'PUT', { userId: 'account-a', data: [space('a-updated')] });
    assert.equal(result.status, 200);
    assert.equal(result.body.userId, 'account-a');
    assert.equal(result.body.data[0].id, 'a-updated');
    const after = memberships.readUsers();
    assert.equal(after.find(user => user.id === 'account-a').accountData[0].id, 'a-updated');
    assert.deepEqual(after.find(user => user.id === 'account-b'), before.find(user => user.id === 'account-b'));
  });
  await t.test('close guide acknowledgment is a private, per-user UI hint', async () => {
    const endpoint = '/api/shiyu/auth/corner-guide';
    assert.equal((await request('none', 'POST', { userId: 'account-a' }, endpoint)).status, 401);
    assert.equal((await request('account-a', 'POST', { userId: 'account-b' }, endpoint)).status, 409);
    assert.equal(memberships.readUsers().find(user => user.id === 'account-a').cornerUiHints, undefined);
    const acknowledged = await request('account-a', 'POST', { userId: 'account-a' }, endpoint);
    assert.equal(acknowledged.status, 200);
    assert.equal(acknowledged.body.userId, 'account-a');
    assert(acknowledged.body.closeGuideAcknowledgedAt);
    assert.equal(memberships.readUsers().find(user => user.id === 'account-a').cornerUiHints.closeGuideAcknowledgedAt, acknowledged.body.closeGuideAcknowledgedAt);
    assert.equal(memberships.readUsers().find(user => user.id === 'account-b').cornerUiHints, undefined);
    assert.equal((await request('account-a', 'GET', undefined, '/api/shiyu/auth/session')).body.user.cornerUiHints.closeGuideAcknowledgedAt, acknowledged.body.closeGuideAcknowledgedAt);
    assert.equal((await request('account-b', 'GET', undefined, '/api/shiyu/auth/session')).body.user.cornerUiHints.closeGuideAcknowledgedAt, undefined);
  });
  await t.test('onboarding persists per account, replays both modules and rejects stale rounds', async()=>{
    const endpoint='/api/shiyu/auth/onboarding';
    assert.equal((await request('', 'GET', undefined, endpoint)).status,401);
    assert.equal((await request('account-a','POST',{userId:'account-b',action:'start'},endpoint)).status,409);
    const before=memberships.readUsers();
    const started=await request('account-a','POST',{userId:'account-a',action:'start'},endpoint);
    assert.equal(started.status,200);assert.equal(started.body.onboarding.round,1);
    assert.equal((await request('account-b','GET',undefined,endpoint)).body.onboarding.status,'idle');
    await request('account-a','POST',{userId:'account-a',action:'progress',round:1,module:'space',step:'groups'},endpoint);
    assert.equal((await request('account-a','GET',undefined,endpoint)).body.onboarding.space.step,'groups');
    await request('account-a','POST',{userId:'account-a',action:'start'},endpoint);
    assert.equal((await request('account-a','POST',{userId:'account-a',action:'complete',round:1,module:'space'},endpoint)).status,409);
    assert.deepEqual(memberships.readUsers().find(user=>user.id==='account-a').accountData,before.find(user=>user.id==='account-a').accountData);
    assert.deepEqual(memberships.readUsers().find(user=>user.id==='account-b'),before.find(user=>user.id==='account-b'));
  });
  await t.test('newspaper is private, cover and editions are independent', async()=>{
    const endpoint='/api/shiyu/auth/newspaper';
    assert.equal((await request('', 'GET', undefined, endpoint)).status,401);
    assert.equal((await request('account-a','PUT',{userId:'account-b',section:'cover',fields:{title:'wrong'}},endpoint)).status,409);
    assert.equal((await request('account-a','PUT',{userId:'account-a',section:'cover',fields:{title:'private cover'}},endpoint)).status,200);
    assert.equal((await request('account-a','PUT',{userId:'account-a',section:'edition',fields:{title:'private edition'}},endpoint)).status,200);
    const a=await request('account-a','GET',undefined,endpoint),b=await request('account-b','GET',undefined,endpoint);
    assert.equal(a.body.newspaper.cover.title,'private cover');assert.equal(a.body.newspaper.edition.title,'private edition');assert.deepEqual(b.body.newspaper,{cover:{},edition:{}});
  });});
