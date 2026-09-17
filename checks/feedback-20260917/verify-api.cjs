const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { createFeedbackHandler } = require('../../feedback-server.cjs');
const root = path.join(__dirname, 'api-' + randomUUID());
const directory = path.join(root, 'records'), configFile = path.join(root, 'categories.json');
const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=';
let server, base;
async function start() {
  const handler = createFeedbackHandler({ directory, configFile });
  server = http.createServer(async (req, res) => { if (!await handler(req, res)) { res.writeHead(404); res.end(); } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
}
const payload = overrides => ({ submissionId: randomUUID(), type: 'blocking_bug', categoryId: 'collection', description: '保存收藏后无法继续操作。', contact: 'qa@example.com',
  images: [{ name: 'screen.png', dataUrl: pixel }], identity: { signedIn: true, id: 'TEST-001', name: '反馈测试', isMember: true, membershipExpiresAt: '2027-09-01T00:00:00.000Z', membershipSource: 'demo', verified: true },
  context: { page: '/', theme: 'base', mode: 'light', viewport: '1440 × 900' }, ...overrides });
async function post(body, headers = {}) {
  const response = await fetch(base + '/api/shiyu/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
(async () => {
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(configFile, JSON.stringify({ items: [{ id: 'collection', name: '收藏与空间', enabled: true }, { id: 'hidden', name: '隐藏分类', enabled: false }] }));
  await start();
  assert.deepEqual((await (await fetch(base + '/api/shiyu/feedback/categories')).json()).items, [{ id: 'collection', name: '收藏与空间' }]);
  const good = payload();
  const replies = await Promise.all([post(good), post(good), post(good)]);
  assert.equal(replies.filter(r => r.status === 201).length, 1);
  assert.equal(new Set(replies.map(r => r.data.receipt)).size, 1);
  let records = await fs.readdir(directory); assert.equal(records.length, 1);
  const record = JSON.parse(await fs.readFile(path.join(directory, records[0])));
  assert.equal(record.identity.id, 'TEST-001'); assert.equal(record.identity.name, '反馈测试'); assert.equal(record.identity.isMember, true);
  assert.equal(record.identity.verified, false); assert.equal(record.identity.source, 'client-profile');
  assert.equal(record.images[0].dataUrl, pixel); assert.equal(record.categoryName, '收藏与空间'); assert(record.createdAt); assert.equal(record.status, 'new');
  assert.equal((await post({ ...good, description: 'changed' })).status, 409);
  for (const change of [{ type: '' }, { type: 'constructor' }, { description: '   ' }, { description: '长'.repeat(3001) }, { contact: 'bad address' }, { contact: '--- ---' }, { submissionId: '../escape' }, { images: Array(6).fill(good.images[0]) }, { images: [{ name: 'fake.png', dataUrl: 'data:image/png;base64,SGVsbG8=' }] }, { images: [{ name: 'x.svg', dataUrl: 'data:image/svg+xml;base64,PHN2Zy8+' }] }]) {
    assert.equal((await post(payload(change))).status, 400, JSON.stringify(change).slice(0, 100));
  }
  assert.equal((await post(payload({ images: [{ name: 'large.png', dataUrl: 'data:image/png;base64,' + Buffer.alloc(5 * 1024 * 1024 + 1).toString('base64') }] }))).status, 413);
  assert.equal((await post(payload({ categoryId: 'hidden' }))).status, 409);
  assert.equal((await post(payload(), { Origin: 'http://unrelated.example' })).status, 403);
  assert.equal((await post(payload(), { 'Content-Type': 'text/plain' })).status, 415);
  const guest = payload({ identity: { signedIn: false, id: 'forged', name: 'forged', isMember: true }, type: 'suggestion', categoryId: null, contact: '', images: [] });
  assert.equal((await post(guest)).status, 201);
  const guestRecord = JSON.parse(await fs.readFile(path.join(directory, guest.submissionId + '.json')));
  assert.equal(guestRecord.identity.id, null); assert.equal(guestRecord.identity.name, '访客'); assert.equal(guestRecord.identity.isMember, false);
  await fs.writeFile(configFile, JSON.stringify({ items: [{ id: 'changed', name: '更新后的分类', enabled: true }] }));
  assert.equal((await (await fetch(base + '/api/shiyu/feedback/categories')).json()).items[0].id, 'changed');
  assert.equal((await post(payload())).status, 409);
  await new Promise(resolve => server.close(resolve)); await start();
  assert.equal((await post(good)).data.receipt, replies[0].data.receipt);
  assert.equal((await fs.readdir(directory)).length, 2);
  await fs.writeFile(configFile, '{ broken');
  assert.equal((await fetch(base + '/api/shiyu/feedback/categories')).status, 503);
  assert.equal((await post(payload())).status, 503);
  console.log('PASS API: server categories and hot updates, durable records and images, identity provenance, guest identity, required fields, invalid formats/contact/category, 5-image/5-MB limits, origin, concurrent duplicate suppression, restart retry, config failure.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => server?.close());
