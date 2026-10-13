/* Execute the captured production functions with fake fetches only. The server
 * entrypoint, storage initialization, model providers and real HTTP are not run. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const privateRoot = path.join(root, '.local/checks/environment-isolation-20261013');
const baseline = path.join(privateRoot, 'tools-production-baseline');
const candidate = path.join(privateRoot, 'tools-production-candidate');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'tools-production-candidate-sha256.json'), 'utf8'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const cases = [];
const source = phase => ({
  library: fs.readFileSync(path.join(phase === 'before' ? baseline : candidate, phase === 'before' ? 'library-source.js' : 'dist/library-source.js'), 'utf8'),
  server: fs.readFileSync(path.join(phase === 'before' ? baseline : candidate, 'server/generation-server.mjs'), 'utf8'),
});
function libraryFixture(code, href, respond) {
  const requests = [], context = { URL, AbortController, setTimeout, clearTimeout, location: new URL(href), categoryChinese: {}, searchText: () => '', chineseName: () => '' };
  context.fetch = async input => {
    const url = new URL(input, href);
    requests.push(url.href);
    const result = respond(url);
    return { ok: result !== false, json: async () => structuredClone(result === false ? {} : result) };
  };
  const script = code.replace(/^import[^\n]*$/gm, '').replace(/^export /gm, '') + '\nglobalThis.readLibrary=fetchLibraryData;';
  vm.runInNewContext(script, context, { timeout: 1000 });
  return { requests, read: context.readLibrary };
}
function serverFixture(code, local, origin) {
  const requests = [];
  const start = code.indexOf('const server=http.createServer('), end = code.indexOf('\nserver.listen(', start);
  assert(start >= 0 && end > start);
  const context = {
    URL, Headers, Buffer, AbortSignal, local, origin, process: { env: { AUTH_SESSION_URL: 'http://127.0.0.1:5175/api/shiyu/auth/session' } },
    http: { createServer: callback => callback },
    send: (res, status, data) => { res.status = status; res.body = JSON.stringify(data); },
    fetch: async input => {
      requests.push(String(input));
      return { ok: true, status: 200, headers: new Headers({ 'Content-Type': 'application/json' }), text: async () => '<html><head></head><body>fake login only</body></html>', arrayBuffer: async () => Buffer.from('{}') };
    },
  };
  // The callback is otherwise byte-for-byte source; unused static-file branches
  // need a fixture module URL to parse in a VM Script instead of an ESM entrypoint.
  const callback = code.slice(start, end).replace('const server=http.createServer(', 'globalThis.fixtureHandler=http.createServer(').replaceAll('import.meta.url', '"file:///isolated-fixture/generation-server.mjs"');
  vm.runInNewContext(callback, context, { timeout: 1000 });
  return {
    requests,
    async get(url) {
      const req = { method: 'GET', url, headers: { host: new URL(origin).host, origin, 'sec-fetch-site': 'same-origin' } };
      const res = { status: 0, body: '', headers: {}, writeHead(status, headers) { this.status = status; this.headers = headers; }, end(body) { this.body = Buffer.isBuffer(body) ? body.toString('utf8') : String(body || ''); } };
      await context.fixtureHandler(req, res);
      return res;
    },
  };
}
async function check(name, fn) { await fn(); cases.push({ name, pass: true }); }
async function main() {
  for (const file of manifest.files) {
    const before = fs.readFileSync(path.join(baseline, file.path.startsWith('dist/') ? 'library-source.js' : file.path));
    const after = fs.readFileSync(path.join(candidate, file.path));
    assert.equal(hash(before), file.beforeSha256);
    assert.equal(hash(after), file.afterSha256);
  }
  const patch = path.join(root, manifest.patch.path);
  assert.equal(hash(fs.readFileSync(patch)), manifest.patch.sha256);
  await check('production patch applies to exact captured bytes and reproduces both candidate hashes', async () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-production-tools-patch-'));
    try {
      for (const file of manifest.files) {
        const from = path.join(baseline, file.path.startsWith('dist/') ? 'library-source.js' : file.path);
        fs.mkdirSync(path.dirname(path.join(temp, file.path)), { recursive: true });
        fs.copyFileSync(from, path.join(temp, file.path));
      }
      const result = cp.spawnSync('git', ['apply', '--recount', patch], { cwd: temp, encoding: 'utf8', timeout: 5000, windowsHide: true });
      assert.equal(result.status, 0, result.stderr);
      for (const file of manifest.files) assert.equal(hash(fs.readFileSync(path.join(temp, file.path))), file.afterSha256);
    } finally {
      const target = path.resolve(temp);
      assert(target.startsWith(path.resolve(os.tmpdir()) + path.sep + 'shiyu-production-tools-patch-'));
      fs.rmSync(target, { recursive: true, force: true });
    }
  });
  const before = source('before'), after = source('after');
  const localItem = { items: [{ id: 'local-poison-fixture', name: '本机假数据', scene: 'test', url: '/fake.svg' }] };
  const normalItem = { items: [{ id: 'formal-fixture', name: '同源假数据', scene: 'test', url: '/fake.svg' }] };
  await check('baseline formal library failure actually accepts a computer-local API response', async () => {
    const fixture = libraryFixture(before.library, 'https://tool.shiyubox.com/', url => url.origin === 'http://127.0.0.1:5175' ? localItem : false);
    const data = await fixture.read();
    assert.equal(data.items[0].id, 'local-poison-fixture');
    assert.equal(fixture.requests.length, 2);
    assert(fixture.requests.some(url => new URL(url).origin === 'http://127.0.0.1:5175'));
  });
  await check('candidate formal library failure cannot query or accept computer-local data', async () => {
    const fixture = libraryFixture(after.library, 'https://tool.shiyubox.com/', url => url.origin === 'http://127.0.0.1:5175' ? localItem : false);
    await assert.rejects(fixture.read(), /平台图标库读取失败/);
    assert.equal(fixture.requests.length, 3);
    assert(fixture.requests.every(url => new URL(url).origin === 'https://tool.shiyubox.com'));
  });
  await check('candidate empty same-origin responses stay same-origin through all fallbacks', async () => {
    const fixture = libraryFixture(after.library, 'https://tool.shiyubox.com/', url => url.origin === 'http://127.0.0.1:5175' ? localItem : { items: [] });
    await assert.rejects(fixture.read(), /平台图标库读取失败/);
    assert(fixture.requests.every(url => new URL(url).origin === 'https://tool.shiyubox.com'));
  });
  await check('successful formal library contents are unchanged', async () => {
    const a = libraryFixture(before.library, 'https://tool.shiyubox.com/', () => normalItem);
    const b = libraryFixture(after.library, 'https://tool.shiyubox.com/', () => normalItem);
    assert.deepEqual(JSON.parse(JSON.stringify(await b.read())), JSON.parse(JSON.stringify(await a.read())));
    assert.equal(a.requests.length, 1); assert.equal(b.requests.length, 1);
  });
  await check('candidate local previews retain the original explicitly local 5175 fallback', async () => {
    for (const host of ['127.0.0.1', 'localhost']) {
      const fixture = libraryFixture(after.library, 'http://' + host + ':4173/', url => url.origin === 'http://127.0.0.1:5175' ? localItem : false);
      assert.equal((await fixture.read()).items[0].id, 'local-poison-fixture');
      assert(fixture.requests.every(url => ['http://' + host + ':4173', 'http://127.0.0.1:5175'].includes(new URL(url).origin)));
    }
  });
  await check('baseline production development-login route emits a browser-local base URL', async () => {
    const fixture = serverFixture(before.server, false, 'https://tool.shiyubox.com');
    const response = await fixture.get('/__shiyu_shared_login');
    assert.equal(response.status, 200);
    assert(response.body.includes('<base href="http://127.0.0.1:4318/">'));
  });
  await check('candidate production development-login and development-proxy routes return 404 before fetch', async () => {
    const fixture = serverFixture(after.server, false, 'https://tool.shiyubox.com');
    assert.equal((await fixture.get('/__shiyu_shared_login')).status, 404);
    assert.equal((await fixture.get('/__shiyu_auth_proxy/api/shiyu/auth/session')).status, 404);
    assert.equal(fixture.requests.length, 0);
  });
  await check('candidate explicit local login and local proxy remain usable', async () => {
    const fixture = serverFixture(after.server, true, 'http://127.0.0.1:4173');
    assert.equal((await fixture.get('/__shiyu_shared_login')).status, 200);
    assert.equal((await fixture.get('/__shiyu_auth_proxy/api/shiyu/auth/session')).status, 200);
    assert.equal(fixture.requests.length, 2);
  });
  await check('a local flag with a formal public origin cannot enable development routes', async () => {
    const fixture = serverFixture(after.server, true, 'https://tool.shiyubox.com');
    assert.equal((await fixture.get('/__shiyu_shared_login')).status, 404);
    assert.equal((await fixture.get('/__shiyu_auth_proxy/api/shiyu/auth/session')).status, 404);
    assert.equal(fixture.requests.length, 0);
  });
  await check('existing production same-origin auth proxy remains unchanged', async () => {
    for (const code of [before.server, after.server]) {
      const fixture = serverFixture(code, false, 'https://tool.shiyubox.com');
      assert.equal((await fixture.get('/api/shiyu/auth/session')).status, 200);
      assert.equal(fixture.requests[0], 'http://127.0.0.1:5175/api/shiyu/auth/session');
    }
  });
  const report = { result: 'PASS', passed: cases.length, cases, files: manifest.files, patchSha256: manifest.patch.sha256, actualNetworkRequests: 0, serverEntrypointExecuted: false, modelAndStorageInitializationExecuted: false };
  fs.writeFileSync(path.join(privateRoot, 'tools-production-candidate-tests.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
