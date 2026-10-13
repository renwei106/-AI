'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), http = require('node:http');
const { requestWithHost } = require('./release-environment.cjs');
async function localServer(t, handler) {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  return 'http://127.0.0.1:' + server.address().port;
}
test('real loopback HTTP preserves custom Host required by the tools health endpoint', async t => {
  const observed = [], url = await localServer(t, (req, res) => {
    observed.push(req.headers.host); res.statusCode = req.headers.host === 'tool.shiyubox.com' ? 200 : 403; res.end(res.statusCode === 200 ? 'healthy' : 'forbidden');
  });
  const wrong = await requestWithHost(url, { headers: { Host: '127.0.0.1' }, signal: AbortSignal.timeout(2000) });
  assert.equal(wrong.status, 403);
  const correct = await requestWithHost(url, { headers: { Host: 'tool.shiyubox.com' }, signal: AbortSignal.timeout(2000) });
  assert.deepEqual(correct, { status: 200, body: 'healthy' }); assert.deepEqual(observed, ['127.0.0.1', 'tool.shiyubox.com']);
});
test('Host probe rejects oversized streamed responses without Content-Length', async t => {
  const url = await localServer(t, (_, res) => { res.write(Buffer.alloc(48)); res.end(Buffer.alloc(48)); });
  await assert.rejects(requestWithHost(url, { headers: { Host: 'tool.shiyubox.com' }, signal: AbortSignal.timeout(2000), maxBytes: 64 }), /exceeds byte limit/);
});
test('Host probe honors abort and socket timeout without waiting indefinitely', async t => {
  const url = await localServer(t, () => {}), controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30);
  try { await assert.rejects(requestWithHost(url, { headers: { Host: 'tool.shiyubox.com' }, signal: controller.signal, timeout: 1000 }), /abort/i); }
  finally { clearTimeout(timer); }
  await assert.rejects(requestWithHost(url, { headers: { Host: 'tool.shiyubox.com' }, timeout: 30 }), /timed out/);
});
test('custom Host probes cannot connect to external or credential-bearing URLs', () => {
  for (const url of ['http://tool.shiyubox.com/', 'https://127.0.0.1/', 'http://user:password@127.0.0.1/']) assert.throws(() => requestWithHost(url, { headers: { Host: 'tool.shiyubox.com' } }), /loopback HTTP/);
});
