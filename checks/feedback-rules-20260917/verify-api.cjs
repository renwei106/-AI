const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { createFeedbackHandler } = require('../../feedback-server.cjs');
const root = path.join(__dirname, 'api-' + randomUUID()), directory = path.join(root, 'records'), configFile = path.join(root, 'categories.json');
let server;
(async () => {
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(configFile, JSON.stringify({ items: [{ id: 'appearance', name: '主题与外观', enabled: true }] }));
  const handler = createFeedbackHandler({ directory, configFile });
  server = http.createServer((req, res) => handler(req, res));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const payload = extra => ({ submissionId: randomUUID(), type: 'usage_issue', categoryId: 'appearance', description: '在切换主题后遇到了问题。', contact: '', images: [], ...extra });
  const post = async body => { const r = await fetch(origin + '/api/shiyu/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, data: await r.json() }; };
  for (const type of ['feature_request', 'usage_issue', 'appreciation', 'experience']) {
    assert.equal((await post(payload({ type, description: '  ' }))).status, 400);
    const body = payload({ type }); const response = await post(body); assert.equal(response.status, 201);
    const record = JSON.parse(await fs.readFile(path.join(directory, body.submissionId + '.json')));
    assert(record.receipt); assert.equal(record.categoryId, type === 'usage_issue' ? 'appearance' : null);
    assert.equal((await post(body)).data.receipt, response.data.receipt);
  }
  for (const categoryId of [null, '', '  ']) assert.equal((await post(payload({ categoryId }))).status, 400);
  assert.equal((await post(payload({ categoryId: 'not-available' }))).status, 409);
  const unwanted = payload({ type: 'appreciation', categoryId: 'not-available', contact: 'hidden.invalid', images: [{ name: 'hidden', dataUrl: 'bad' }] });
  assert.equal((await post(unwanted)).status, 201);
  const simple = JSON.parse(await fs.readFile(path.join(directory, unwanted.submissionId + '.json')));
  assert.equal(simple.categoryId, null); assert.equal(simple.contact, ''); assert.deepEqual(simple.images, []);
  await fs.writeFile(configFile, '{broken');
  assert.equal((await post(payload())).status, 503);
  for (const type of ['feature_request', 'appreciation', 'experience']) assert.equal((await post(payload({ type }))).status, 201, type + ' must not depend on categories');
  console.log('PASS revised API: all four types, per-type required descriptions, required valid issue category, discard irrelevant fields, internal receipt retained, retries, unrelated types work during category outage.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server?.close());
