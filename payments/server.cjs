'use strict';
const { loadConfig, inspect } = require('./config.cjs');
const { PaymentStore } = require('./store.cjs');
const { WechatProvider, AlipayProvider, PaymentError } = require('./providers.cjs');
const { PaymentService, publicOrder } = require('./service.cjs');
const PREFIX = '/api/shiyu/payments';

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  const chunks = []; let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 128_000) throw new PaymentError('请求过大', 'TOO_LARGE', 413);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}
function localRequest(req) {
  const remote = req.socket.remoteAddress;
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote) &&
    /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '') &&
    !req.headers['x-forwarded-for'] && !req.headers.forwarded && !req.headers['x-forwarded-host'];
}
function createPaymentHandler(options = {}) {
  const config = options.config || loadConfig(), readiness = inspect(config);
  const store = options.store || new PaymentStore(config.database);
  const memberships = options.memberships || require('./membership.cjs').createMembershipService();
  const providers = options.providers || {};
  if (!options.providers) {
    if (readiness.providers.wechat.ready) providers.wechat = new WechatProvider(config.wechat);
    if (readiness.providers.alipay.ready) providers.alipay = new AlipayProvider(config.alipay);
  }
  const service = new PaymentService({ config, store, providers, memberships, getPlans: options.getPlans || (async () => {
    let response;
    try { response = await fetch(config.catalogUrl, { headers: { Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(5000) }); }
    catch { throw new PaymentError('套餐服务暂不可用', 'CATALOG_UNAVAILABLE', 503); }
    if (!response.ok) throw new PaymentError('套餐服务暂不可用', 'CATALOG_UNAVAILABLE', 503);
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new PaymentError('套餐配置无效', 'CATALOG_INVALID', 503);
    return data.items;
  }) });
  const publicStatus = () => ({ enabled: config.enabled, mode: config.mode, recurringEnabled: false, providers: Object.fromEntries(['wechat', 'alipay'].map(p => [p, { enabled: config[p].enabled !== false, ready: config.enabled && config[p].enabled !== false && !!providers[p], kind: p === 'wechat' ? 'qr' : 'embedded-qr' }])) });
  let revision = '';
  function reloadConfig() {
    if (options.config || options.providers) return;
    const fs = require('node:fs'), stamp = fs.existsSync(config.file) ? String(fs.statSync(config.file).mtimeMs) : '';
    if (stamp === revision) return;
    const fresh = loadConfig(config.file), ready = inspect(fresh), updated = {};
    if (ready.providers.wechat.ready) updated.wechat = new WechatProvider(fresh.wechat);
    if (ready.providers.alipay.ready) updated.alipay = new AlipayProvider(fresh.alipay);
    Object.assign(config, fresh); delete providers.wechat; delete providers.alipay; Object.assign(providers, updated); revision = stamp;
  }
  async function authenticate(req) {
    if (options.authenticate) return options.authenticate(req);
    if (config.mode === 'integration') {
      if (!localRequest(req)) throw new PaymentError('联调入口仅限本机访问', 'LOCAL_ONLY', 403);
      const token = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('shiyu_payment_session='))?.split('=')[1];
      const session = token && store.session(token);
      if (session) return { id: session.user_id };
    } else if (config.identityUrl) {
      try {
        const response = await fetch(config.identityUrl, { headers: { cookie: req.headers.cookie || '', Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated === true && typeof data.user?.id === 'string' && data.user.id.length > 0 && data.user.id.length < 128 && data.user.blacklisted !== true) return data.user;
        }
      } catch { throw new PaymentError('登录服务暂不可用', 'AUTH_UNAVAILABLE', 503); }
    }
    throw new PaymentError('请登录后再购买', 'UNAUTHENTICATED', 401);
  }
  async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith(PREFIX + '/')) return false;
    try {
      reloadConfig();
      if (url.pathname === PREFIX + '/status' && req.method === 'GET') { json(res, 200, publicStatus()); return true; }
      if (!config.enabled) throw new PaymentError('支付服务暂未开放', 'PAYMENTS_DISABLED', 503);
      const notification = url.pathname.match(/^\/api\/shiyu\/payments\/notify\/(wechat|alipay)$/);
      if (notification) {
        if (req.method !== 'POST') throw new PaymentError('请求方法不支持', 'METHOD_NOT_ALLOWED', 405);
        const raw = await readBody(req);
        service.notification(notification[1], req.headers, raw);
        if (notification[1] === 'alipay') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('success'); }
        else { res.writeHead(204); res.end(); }
        return true;
      }
      if (url.pathname === PREFIX + '/test-session' && req.method === 'GET') {
        if (config.mode !== 'integration' || !localRequest(req)) throw new PaymentError('联调入口仅限本机访问', 'LOCAL_ONLY', 403);
        const token = store.consumeTicket(url.searchParams.get('token') || '');
        if (!token) throw new PaymentError('联调入口已过期，请重新生成', 'INVALID_TICKET', 401);
        res.writeHead(303, { 'Set-Cookie': `shiyu_payment_session=${token}; Path=${PREFIX}; HttpOnly; SameSite=Lax; Max-Age=14400`, Location: '/?page=membership', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' }); res.end(); return true;
      }
      if (req.method !== 'GET') {
        const allowed = new Set([...config.allowedOrigins, config.publicBaseUrl]);
        if (!req.headers.origin || !allowed.has(req.headers.origin)) throw new PaymentError('请求来源无效', 'INVALID_ORIGIN', 403);
      }
      const user = await authenticate(req);
      if (!user?.id) throw new PaymentError('请登录后再购买', 'UNAUTHENTICATED', 401);
      if (url.pathname === PREFIX + '/account' && req.method === 'GET') {
        const current = memberships.readUsers().find(item => item.id === user.id);
        const state = memberships.stateFor(current || null);
        json(res, 200, { userId: user.id, ...state, memberExpiresAt: state.expiresAt, mode: config.mode }); return true;
      }
      if (url.pathname === PREFIX + '/orders' && req.method === 'GET') { json(res, 200, { items: store.list(user.id).map(publicOrder) }); return true; }
      if (url.pathname === PREFIX + '/orders' && req.method === 'POST') {
        if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new PaymentError('需要 JSON 请求', 'INVALID_CONTENT_TYPE', 415);
        json(res, 201, { order: await service.create(user, JSON.parse(await readBody(req))) }); return true;
      }
      const order = url.pathname.match(/^\/api\/shiyu\/payments\/orders\/(SY[a-f0-9]{28})$/);
      const cashier = url.pathname.match(/^\/api\/shiyu\/payments\/orders\/(SY[a-f0-9]{28})\/cashier$/);
      if (cashier && req.method === 'GET') {
        const owned = service.owned(user, cashier[1]);
        if (owned.provider !== 'alipay' || !owned.checkout || owned.expires_at <= Date.now() || ['paid','closed','expired'].includes(owned.status)) throw new PaymentError('本次支付已结束，请返回会员中心', 'CHECKOUT_EXPIRED', 409);
        const checkout = await service.upgradeCheckout(publicOrder(owned));
        json(res, 200, { url: await service.provider('alipay').cashier(checkout.checkout.url) }); return true;
      }
      if (order && req.method === 'GET') { json(res, 200, { order: publicOrder(service.owned(user, order[1])) }); return true; }
      const query = url.pathname.match(/^\/api\/shiyu\/payments\/orders\/(SY[a-f0-9]{28})\/query$/);
      if (query && req.method === 'POST') { json(res, 200, { order: await service.query(user, query[1]) }); return true; }
      throw new PaymentError('接口不存在', 'NOT_FOUND', 404);
    } catch (error) {
      const statusCode = error instanceof PaymentError ? error.status : error instanceof SyntaxError ? 400 : 500;
      // No provider payloads, key material, cookies or signatures are logged/returned.
      const code = error instanceof PaymentError ? error.code : 'PAYMENT_FAILED';
      const message = error instanceof PaymentError ? error.message : '支付请求处理失败，请稍后查询订单';
      if (url.pathname.endsWith('/notify/alipay')) { res.writeHead(statusCode, { 'Content-Type': 'text/plain' }); res.end('failure'); }
      else json(res, statusCode, { code, message, ...(error.orderId ? { orderId: error.orderId } : {}) });
    }
    return true;
  }
  store.expirePending();
  const recovery = setInterval(() => { store.expirePending(); service.retryFulfillment(); }, 30000); recovery.unref();
  handler.close = () => { clearInterval(recovery); store.close(); };
  handler.service = service;
  return handler;
}
module.exports = { createPaymentHandler, localRequest };
