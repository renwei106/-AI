'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const { createShiyuUserProxy, resolveDefaultEnvironment } = require('../shiyu-user-proxy.cjs');
const contract = require('../dist/environment-policy-data.js').environmentContract;
const root = path.resolve(__dirname, '..');
async function fixture(t) {
  const requests = [];
  const upstream = http.createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    requests.push({ path: req.url, method: req.method, headers: { ...req.headers }, body });
    const allowed = [...contract.profiles.production.browserOrigins.site, ...contract.profiles.production.browserOrigins.admin].includes(req.headers.origin);
    res.setHeader('Set-Cookie', ['fixture_auth=only; HttpOnly; Path=/', 'fixture_second=only; Path=/']);
    if (req.url.includes('/wechat/profile-start')) {
      res.writeHead(302, { 'Content-Type': 'text/plain', Location: '/fixture-redirect', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" });
      res.end('fixture redirect only'); return;
    }
    const status = req.method === 'GET' ? 200 : allowed ? 201 : 403;
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(status === 403 ? '{"code":"INVALID_ORIGIN"}' : '{"fixture":true}');
  });
  upstream.listen(0, '127.0.0.1'); await once(upstream, 'listening');
  t.after(() => { upstream.closeAllConnections(); upstream.close(); });
  const upstreamOrigin = 'http://127.0.0.1:' + upstream.address().port;
  const handler = createShiyuUserProxy({ environment: 'test', upstreamOrigin, allowedUpstreamOrigins: [upstreamOrigin] });
  const proxy = http.createServer((req, res) => { if (!handler(req, res)) { res.writeHead(404); res.end(); } });
  proxy.listen(0, '127.0.0.1'); await once(proxy, 'listening');
  t.after(() => { proxy.closeAllConnections(); proxy.close(); });
  return {
    requests, upstreamOrigin,
    request(route, { method = 'POST', headers = {}, body = Buffer.from('{"fake":true}') } = {}) {
      return new Promise((resolve, reject) => {
        const request = http.request({ hostname: '127.0.0.1', port: proxy.address().port, path: route, method, headers }, response => {
          const chunks = []; response.on('data', chunk => chunks.push(chunk)); response.on('error', reject);
          response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
        });
        request.on('error', reject); request.setTimeout(3000, () => request.destroy(Error('Fixture request timeout'))); request.end(body);
      });
    },
  };
}
test('actual HTTP account proxy forwards the original evidence for every user write path', async t => {
  const f = await fixture(t);
  const paths = [
    '/api/shiyu/auth/login', '/api/shiyu/auth/logout', '/api/shiyu/auth/send-code', '/api/shiyu/auth/email/send',
    '/api/shiyu/auth/password', '/api/shiyu/auth/password-verify', '/api/shiyu/auth/welcome-gift', '/api/shiyu/auth/signup-gift',
    '/api/shiyu/auth/onboarding', '/api/shiyu/auth/tools', '/api/shiyu/auth/corner-guide', '/api/shiyu/auth/account',
    '/api/shiyu/auth/avatar', '/api/shiyu/auth/emergence', '/api/shiyu/auth/analytics', '/api/shiyu/auth/wechat/skip',
    '/api/shiyu/auth/wechat/bind', '/api/shiyu/auth/wechat/profile',
  ];
  for (const route of paths) {
    const body = Buffer.from(JSON.stringify({ fixture: true, route, text: '只在假服务中' }));
    const response = await f.request(route, { headers: { Origin: 'https://shiyubox.com', 'Sec-Fetch-Site': 'same-origin', Referer: 'https://shiyubox.com/?fixture=only', Cookie: 'fixture_cookie=only', 'Content-Type': 'application/json' }, body });
    assert.equal(response.status, 201, route);
    assert.equal(response.body.toString(), '{"fixture":true}');
    assert.deepEqual(response.headers['set-cookie'], ['fixture_auth=only; HttpOnly; Path=/', 'fixture_second=only; Path=/']);
    const received = f.requests.at(-1);
    assert.equal(received.headers.origin, 'https://shiyubox.com', route);
    assert.equal(received.headers.host, new URL(f.upstreamOrigin).host, route);
    assert.equal(received.headers['sec-fetch-site'], 'same-origin', route);
    assert.equal(received.headers.referer, 'https://shiyubox.com/?fixture=only', route);
    assert.equal(received.headers.cookie, 'fixture_cookie=only');
    assert.equal(received.headers['content-type'], 'application/json');
    assert(received.body.equals(body));
  }
});
test('missing Origin is never invented and development/hostile origins reach the formal policy unchanged', async t => {
  const f = await fixture(t);
  for (const origin of [undefined, 'http://127.0.0.1:4349', 'https://unknown.shiyubox.com', 'null']) {
    const response = await f.request('/api/shiyu/auth/login', { headers: { ...(origin === undefined ? {} : { Origin: origin }), 'X-Forwarded-Host': 'admin.shiyubox.com', 'X-Forwarded-Proto': 'https', 'Content-Type': 'application/json' } });
    assert.equal(response.status, 403);
    assert.equal(f.requests.at(-1).headers.origin, origin);
  }
});
test('avatar Origin is preserved rather than rewritten to the admin upstream', async t => {
  const f = await fixture(t);
  const response = await f.request('/api/shiyu/auth/avatar', { method: 'PUT', headers: { Origin: 'http://127.0.0.1:4349' } });
  assert.equal(response.status, 403);
  assert.equal(f.requests.at(-1).headers.origin, 'http://127.0.0.1:4349');
});
test('read methods, absent evidence, cookie/status/body and existing profile redirect headers remain intact', async t => {
  const f = await fixture(t);
  const read = await f.request('/api/shiyu/auth/session', { method: 'GET', headers: { Cookie: 'fixture_cookie=read' }, body: Buffer.alloc(0) });
  assert.equal(read.status, 200); assert.equal(read.body.toString(), '{"fixture":true}');
  assert.equal(f.requests.at(-1).headers.origin, undefined);
  assert.equal(f.requests.at(-1).headers['sec-fetch-site'], undefined);
  assert.equal(f.requests.at(-1).headers.referer, undefined);
  assert.equal(f.requests.at(-1).headers.cookie, 'fixture_cookie=read');
  const redirect = await f.request('/api/shiyu/auth/wechat/profile-start?ticket=fixture', { method: 'GET', body: Buffer.alloc(0) });
  assert.equal(redirect.status, 302); assert.equal(redirect.headers.location, '/fixture-redirect');
  assert.equal(redirect.headers['referrer-policy'], 'no-referrer');
  assert.equal(redirect.headers['x-content-type-options'], 'nosniff');
  assert.equal(redirect.headers['content-security-policy'], "default-src 'none'");
  assert.equal(redirect.body.toString(), 'fixture redirect only');
});
test('upstream selection rejects public/HTTPS/unregistered targets and needs explicit fixture registration', () => {
  for (const upstreamOrigin of ['https://admin.shiyubox.com', 'http://10.0.0.1:5175', 'http://127.0.0.1:4318', 'http://127.0.0.1:5175/path', 'http://user@127.0.0.1:5175']) assert.throws(() => createShiyuUserProxy({ environment: 'production', upstreamOrigin }));
  assert.throws(() => createShiyuUserProxy({ environment: 'test', upstreamOrigin: 'http://127.0.0.1:45091' }));
  assert.throws(() => createShiyuUserProxy({ environment: 'test', upstreamOrigin: 'http://127.0.0.1:45091', allowedUpstreamOrigins: ['http://127.0.0.1:45092'] }));
  assert.throws(() => createShiyuUserProxy({ environment: 'production', allowedUpstreamOrigins: ['http://127.0.0.1:5175'] }));
  assert.throws(() => createShiyuUserProxy({ environment: 'test', allowedUpstreamOrigins: ['http://127.0.0.1:45091'] }));
});
test('a test environment flag alone cannot enable the default website proxy', () => {
  const environment = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP'].filter(name => typeof process.env[name] === 'string').map(name => [name, process.env[name]]));
  const result = spawnSync(process.execPath, ['-e', 'require("./shiyu-user-proxy.cjs")({url:"/api/shiyu/auth/login"},{})'], { cwd: root, env: { ...environment, SHIYU_ENV: 'test', SHIYU_ADMIN_ORIGIN: 'http://127.0.0.1:45091' }, encoding: 'utf8', timeout: 5000, windowsHide: true });
  assert.equal(result.status, 1); assert.match(result.stderr, /explicit test account proxy factory/);
});
test('default environment rejects unknown modes and conflicts; explicit test factory is independent of a formal host', () => {
  for (const environment of [{ SHIYU_ENV: 'staging' }, { NODE_ENV: 'staging' }, { SHIYU_ENV: '' }, { SHIYU_ENV: 'development', NODE_ENV: 'production' }, { SHIYU_ENV: 'production', NODE_ENV: 'development' }, { SHIYU_ENV: 'test', NODE_ENV: 'production' }]) assert.throws(() => resolveDefaultEnvironment(environment));
  assert.equal(resolveDefaultEnvironment({}), 'development');
  assert.equal(resolveDefaultEnvironment({ SHIYU_ENV: 'production', NODE_ENV: 'production' }), 'production');
  const environment = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP'].filter(name => typeof process.env[name] === 'string').map(name => [name, process.env[name]]));
  const script = 'const p=require("./shiyu-user-proxy.cjs").createShiyuUserProxy({environment:"test",upstreamOrigin:"http://127.0.0.1:45091",allowedUpstreamOrigins:["http://127.0.0.1:45091"]});if(typeof p!=="function")process.exit(1)';
  const result = spawnSync(process.execPath, ['-e', script], { cwd: root, env: { ...environment, SHIYU_ENV: 'production', NODE_ENV: 'production', SHIYU_ADMIN_ORIGIN: 'http://127.0.0.1:5175' }, encoding: 'utf8', timeout: 5000, windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
});
test('runtime policy dependency is included by existing website and private-preview archives', () => {
  const proxy = fs.readFileSync(path.join(root, 'shiyu-user-proxy.cjs'), 'utf8');
  assert(proxy.includes("require('./dist/environment-policy-data.js')"));
  assert.match(fs.readFileSync(path.join(root, 'deploy/online/publish.ps1'), 'utf8'), /git[^\r\n]*archive[^\r\n]*\bdist\b/);
  assert.match(fs.readFileSync(path.join(root, 'deploy/private-preview/deploy.ps1'), 'utf8'), /tar\.exe[^\r\n]*\bdist\b/);
});
