'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');
const { once } = require('node:events');
const { PaymentStore } = require('../store.cjs');
const { PaymentService } = require('../service.cjs');
const { WechatProvider, AlipayProvider, moneyToCents } = require('../providers.cjs');
const { createPaymentHandler } = require('../server.cjs');
const { inspect } = require('../config.cjs');

const keyPair = () => crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
const merchant = keyPair(), platform = keyPair();
const now = Date.now();
const wechat = { mchId: '1900000001', appId: 'wx1111111111111111', apiV3Key: '0123456789abcdef0123456789abcdef', serialNo: 'ABCDEF1234567890ABCDEF1234567890', privateKey: merchant.privateKey, publicKey: platform.publicKey, publicKeyId: 'PUB_KEY_ID_0000000001' };
const alipay = { appId: '2021000000000001', sellerId: '2088000000000001', privateKey: merchant.privateKey, publicKey: platform.publicKey };
const config = { enabled: true, mode: 'integration', publicBaseUrl: 'https://payments.example.test', allowedOrigins: ['http://localhost:4348'], database: ':memory:', alipay, wechat };
const plans = [{ id: 'monthly', name: '月度会员', days: 30, price: 10, enabled: true, autoRenew: false }, { id: 'auto-monthly', name: '连续包月', days: 30, price: 8, enabled: true, autoRenew: true }];
const user = { id: 'user-a' };
const input = overrides => ({ provider: 'wechat', planId: 'monthly', requestId: crypto.randomBytes(16).toString('hex'), accepted: true, ...overrides });
function signedHeaders(raw, timestamp = String(Math.floor(now / 1000)), key = platform.privateKey) {
  const nonce = crypto.randomBytes(16).toString('hex');
  return { 'wechatpay-timestamp': timestamp, 'wechatpay-nonce': nonce, 'wechatpay-serial': wechat.publicKeyId,
    'wechatpay-signature': crypto.sign('RSA-SHA256', Buffer.from(`${timestamp}\n${nonce}\n${raw}\n`), key).toString('base64') };
}
function encryptedEvent(data, overrides = {}) {
  const nonce = '123456789012', aad = 'transaction';
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(wechat.apiV3Key), Buffer.from(nonce)); cipher.setAAD(Buffer.from(aad));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final(), cipher.getAuthTag()]).toString('base64');
  return JSON.stringify({ id: 'event-test', event_type: 'TRANSACTION.SUCCESS', resource_type: 'encrypt-resource', resource: { algorithm: 'AEAD_AES_256_GCM', nonce, associated_data: aad, ciphertext }, ...overrides });
}
function wechatSuccess(order) {
  return { appid: wechat.appId, mchid: wechat.mchId, out_trade_no: order.id, transaction_id: '42000000000000000001', trade_state: 'SUCCESS', success_time: new Date(now).toISOString(), amount: { total: order.amount, currency: 'CNY' } };
}
function signedAlipay(data) {
  const payload = { ...data, sign_type: 'RSA2' };
  const canonical = Object.keys(payload).filter(k => k !== 'sign_type').sort().map(k => `${k}=${payload[k]}`).join('&');
  payload.sign = crypto.sign('RSA-SHA256', Buffer.from(canonical), platform.privateKey).toString('base64');
  return new URLSearchParams(payload).toString();
}
function fixture(overrides = {}) {
  const store = new PaymentStore(':memory:'); let count = 0;
  const stub = { async create() { count++; await new Promise(r => setTimeout(r, 2)); return { kind: 'qr', image: 'data:image/png;base64,TEST' }; }, async query(order) { return { orderId: order.id, status: 'pending' }; } };
  const service = new PaymentService({ config, store, providers: { wechat: stub, alipay: stub }, getPlans: async () => plans, ...overrides });
  return { store, service, calls: () => count };
}
function paidResult(order, overrides = {}) { return { orderId: order.id, transactionId: 'transaction-' + order.id, appId: wechat.appId, merchantId: wechat.mchId, amount: order.amount, currency: 'CNY', status: 'paid', paidAt: now, ...overrides }; }

test('money accepts exact cents and rejects floating-point/negative/exponential values', () => {
  assert.equal(moneyToCents('10.01'), 1001); assert.equal(moneyToCents(10), 1000);
  for (const value of ['1.001', '-10', '1e2', NaN, Infinity, '0.30000000000000004']) assert.throws(() => moneyToCents(value));
});
test('configuration requires secrets, bound AppID and HTTPS callback; production requires trusted identity', () => {
  assert.equal(inspect(config).providers.wechat.ready, true);
  assert.equal(inspect(config).providers.alipay.ready, true);
  assert.equal(inspect({ ...config, publicBaseUrl: 'http://example.test' }).providers.wechat.ready, false);
  assert.equal(inspect({ ...config, mode: 'production' }).providers.alipay.ready, false);
  assert.equal(inspect({ ...config, wechat: { ...wechat, appId: '' } }).providers.wechat.ready, false);
});
test('server catalog determines price and duration; client identity and amount are ignored', async t => {
  const f = fixture(); t.after(() => f.store.close());
  const order = await f.service.create(user, input({ amount: 1, days: 9999, userId: 'attacker' }));
  assert.equal(order.amount, 1000); assert.equal(order.days, 30); assert.equal(f.store.get(order.id).user_id, user.id);
  await assert.rejects(() => f.service.query({ id: 'attacker' }, order.id), e => e.status === 404);
});
test('retries and concurrent clicks create a single provider order; changed request intent is rejected', async t => {
  const f = fixture(); t.after(() => f.store.close()); const body = input();
  const result = await Promise.all(Array.from({ length: 6 }, () => f.service.create(user, body)));
  assert.equal(new Set(result.map(o => o.id)).size, 1); assert.equal(f.calls(), 1);
  await assert.rejects(() => f.service.create(user, { ...body, provider: 'alipay' }), e => e.code === 'REQUEST_CONFLICT');
});

test('a query response for another order cannot update either membership', async t => {
  const f = fixture(); t.after(() => f.store.close());
  const first = await f.service.create(user, input());
  const second = await f.service.create({ id: 'user-b' }, input());
  f.service.providers.wechat.query = async () => paidResult(second);
  await assert.rejects(() => f.service.query(user, first.id), e => e.code === 'ORDER_MISMATCH');
  assert.equal(f.store.get(first.id).status, 'pending');
  assert.equal(f.store.get(second.id).status, 'pending');
  assert.equal(f.store.membership('user-b'), 0);
});
test('agreement, enabled plan and recurring authorization are checked on the backend', async t => {
  const f = fixture(); t.after(() => f.store.close());
  await assert.rejects(() => f.service.create(user, input({ accepted: false })), e => e.code === 'AGREEMENT_REQUIRED');
  await assert.rejects(() => f.service.create(user, input({ planId: 'auto-monthly' })), e => e.code === 'RECURRING_NOT_ENABLED');
  await assert.rejects(() => f.service.create(user, input({ planId: 'deleted' })), e => e.code === 'PLAN_UNAVAILABLE');
  assert.equal(f.calls(), 0);
});
test('payment mismatch and forged state cannot grant membership', async t => {
  const f = fixture(); t.after(() => f.store.close()); const order = await f.service.create(user, input());
  for (const change of [{ amount: 1 }, { currency: 'USD' }, { merchantId: 'wrong' }, { appId: 'wrong' }, { paidAt: NaN }, { transactionId: '' }]) assert.throws(() => f.service.apply('wechat', paidResult(order, change)));
  assert.equal(f.store.membership(user.id), 0); assert.equal(f.store.get(order.id).status, 'pending');
});
test('repeated notifications grant once, renewals extend existing paid time, paid state never regresses', async t => {
  const f = fixture(); t.after(() => f.store.close()); const order = await f.service.create(user, input());
  const result = paidResult(order);
  for (let i = 0; i < 10; i++) f.service.apply('wechat', result);
  assert.equal(f.store.membership(user.id), now + 30 * 86_400_000);
  assert.equal(f.store.db.prepare('SELECT count(*) AS count FROM ledger').get().count, 1);
  f.service.apply('wechat', { ...result, status: 'closed' }); assert.equal(f.store.get(order.id).status, 'paid');
  const second = await f.service.create(user, input()); f.service.apply('wechat', paidResult(second));
  assert.equal(f.store.membership(user.id), now + 60 * 86_400_000);
});
test('a transaction cannot be reused on a second order; rollback keeps its ledger untouched', async t => {
  const f = fixture(); t.after(() => f.store.close());
  const first = await f.service.create(user, input()), second = await f.service.create(user, input());
  f.service.apply('wechat', paidResult(first, { transactionId: 'unique-txn' }));
  assert.throws(() => f.service.apply('wechat', paidResult(second, { transactionId: 'unique-txn' })));
  assert.equal(f.store.get(second.id).status, 'pending'); assert.equal(f.store.membership(user.id), now + 30 * 86_400_000);
});
test('uncertain network result remains queryable and same key cannot create another provider order', async t => {
  let calls = 0;
  const f = fixture({ providers: { wechat: { create: async () => { calls++; throw Error('timeout'); } } } }); t.after(() => f.store.close());
  const body = input(); await assert.rejects(() => f.service.create(user, body));
  const retry = await f.service.create(user, body); assert.equal(retry.status, 'unknown'); assert.equal(calls, 1);
});
test('Wechat Native request is signed, response is verified and code_url becomes a real QR image', async () => {
  const provider = new WechatProvider(wechat, { now: () => now, fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.mch.weixin.qq.com/v3/pay/transactions/native');
    const values = Object.fromEntries([...options.headers.Authorization.matchAll(/(\w+)="([^"]+)"/g)].map(m => [m[1], m[2]]));
    assert.equal(values.mchid, wechat.mchId); assert.equal(values.serial_no, wechat.serialNo);
    assert(crypto.verify('RSA-SHA256', Buffer.from(`POST\n/v3/pay/transactions/native\n${values.timestamp}\n${values.nonce_str}\n${options.body}\n`), merchant.publicKey, Buffer.from(values.signature, 'base64')));
    const body = JSON.parse(options.body); assert.equal(body.amount.total, 1000); assert.equal(body.notify_url, config.publicBaseUrl + '/api/shiyu/payments/notify/wechat');
    const raw = JSON.stringify({ code_url: 'weixin://wxpay/bizpayurl?pr=local-test-only' });
    return new Response(raw, { status: 200, headers: signedHeaders(raw) });
  } });
  const checkout = await provider.create({ id: 'SY' + 'a'.repeat(28), plan_name: '月度会员', amount: 1000, expires_at: now + 1800_000 }, config.publicBaseUrl);
  assert.match(checkout.image, /^data:image\/png;base64,/);
});
test('Wechat callback verifies signature, timestamp, key ID and AES-GCM authentication', () => {
  const provider = new WechatProvider(wechat, { now: () => now });
  const order = { id: 'SY' + 'a'.repeat(28), amount: 1000 };
  const raw = encryptedEvent(wechatSuccess(order));
  const result = provider.notification(signedHeaders(raw), raw); assert.equal(result.amount, 1000); assert.equal(result.status, 'paid');
  assert.throws(() => provider.notification(signedHeaders(raw), raw.replace('event-test', 'changed')));
  assert.throws(() => provider.notification(signedHeaders(raw, String(Math.floor(now / 1000) - 301)), raw));
  assert.throws(() => provider.notification({ ...signedHeaders(raw), 'wechatpay-serial': 'PUB_KEY_ID_999' }, raw));
  assert.throws(() => provider.notification({ ...signedHeaders(raw), 'wechatpay-signature': 'WECHATPAY/SIGNTEST/test' }, raw));
  const altered = JSON.parse(raw); altered.resource.associated_data = 'changed'; const changed = JSON.stringify(altered);
  assert.throws(() => provider.notification(signedHeaders(changed), changed));
});
test('Wechat must reject unsigned successful HTTP responses', async () => {
  const provider = new WechatProvider(wechat, { fetchImpl: async () => new Response(JSON.stringify({ code_url: 'weixin://wxpay/fake' })) });
  await assert.rejects(() => provider.create({ id: 'SY' + 'b'.repeat(28), plan_name: '月度会员', amount: 1000, expires_at: now + 1800_000 }, config.publicBaseUrl));
});
test('Alipay official SDK creates a signed desktop cashier URL and validates a real RSA2 notification', async () => {
  const provider = new AlipayProvider(alipay), id = 'SY' + 'c'.repeat(28);
  const checkout = await provider.create({ id, plan_name: '月度会员', amount: 1000 }, config.publicBaseUrl);
  const url = new URL(checkout.url), values = Object.fromEntries(url.searchParams);
  assert.equal(values.method, 'alipay.trade.page.pay'); assert.equal(values.app_id, alipay.appId);
  assert.equal(JSON.parse(values.biz_content).total_amount, '10.00'); assert.equal(JSON.parse(values.biz_content).product_code, 'FAST_INSTANT_TRADE_PAY');
  const sign = values.sign; delete values.sign;
  const canonical = Object.keys(values).sort().map(k => `${k}=${values[k]}`).join('&');
  assert(crypto.verify('RSA-SHA256', Buffer.from(canonical), merchant.publicKey, Buffer.from(sign, 'base64')));
  const fields = { app_id: alipay.appId, seller_id: alipay.sellerId, out_trade_no: id, trade_no: '20260917000001', total_amount: '10.00', trade_status: 'TRADE_SUCCESS', gmt_payment: '2026-09-17 16:00:00', subject: '拾隅 + % & 会员' };
  const raw = signedAlipay(fields), result = provider.notification({}, raw); assert.equal(result.amount, 1000); assert.equal(result.merchantId, alipay.sellerId);
  assert.throws(() => provider.notification({}, raw.replace('total_amount=10.00', 'total_amount=0.01')));
  assert.throws(() => provider.notification({}, raw + '&seller_id=other'));
});
test('HTTP routes enforce authenticated ownership and Origin; signed callbacks are processed without browser cookies', async t => {
  const store = new PaymentStore(':memory:');
  const wx = new WechatProvider(wechat, { now: () => now });
  wx.create = async () => ({ kind: 'qr', image: 'data:image/png;base64,TEST' });
  wx.query = async order => ({ orderId: order.id, status: 'pending' });
  const handler = createPaymentHandler({ config, store, providers: { wechat: wx }, getPlans: async () => plans,
    authenticate: async req => req.headers.authorization === 'test-user-a' ? user : req.headers.authorization === 'test-user-b' ? { id: 'user-b' } : null });
  const server = http.createServer(async (req, res) => { if (!await handler(req, res)) { res.writeHead(404); res.end(); } }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.close(); server.closeAllConnections(); store.close(); });
  const base = 'http://127.0.0.1:' + server.address().port + '/api/shiyu/payments';
  const headers = { 'Content-Type': 'application/json', Origin: 'http://localhost:4348', Authorization: 'test-user-a' };
  const post = (body, h = headers) => fetch(base + '/orders', { method: 'POST', headers: h, body: JSON.stringify(body) });
  assert.equal((await post(input(), { ...headers, Origin: 'https://attacker.test' })).status, 403);
  assert.equal((await post(input(), { ...headers, Authorization: '' })).status, 401);
  const response = await post(input()); assert.equal(response.status, 201); const { order } = await response.json();
  assert.equal((await fetch(base + '/orders/' + order.id, { headers: { Authorization: 'test-user-b' } })).status, 404);
  const raw = encryptedEvent(wechatSuccess(order));
  for (let i = 0; i < 2; i++) assert.equal((await fetch(base + '/notify/wechat', { method: 'POST', headers: signedHeaders(raw), body: raw })).status, 204);
  const account = await fetch(base + '/account', { headers: { Authorization: 'test-user-a' } }).then(r => r.json()); assert.equal(account.memberExpiresAt, now + 30 * 86_400_000);
  const forged = await fetch(base + '/notify/wechat', { method: 'POST', headers: signedHeaders(raw), body: raw + ' ' }); assert.equal(forged.status, 400);
});
test('local test-session links are single use, expiring, and cannot be issued by a remote request', async t => {
  const store = new PaymentStore(':memory:'); t.after(() => store.close());
  const ticket = store.makeTicket(), token = store.consumeTicket(ticket); assert(token); assert.equal(store.consumeTicket(ticket), null); assert.equal(store.session(token).user_id, 'payment-integration');
  const { localRequest } = require('../server.cjs');
  assert(localRequest({ socket: { remoteAddress: '127.0.0.1' }, headers: { host: '127.0.0.1:4348' } }));
  assert(!localRequest({ socket: { remoteAddress: '127.0.0.1' }, headers: { host: 'public.example.test', 'x-forwarded-for': '1.1.1.1' } }));
});
