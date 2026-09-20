'use strict';
const { PaymentError, moneyToCents } = require('./providers.cjs');
function reject(message, code, status = 400) { throw new PaymentError(message, code, status); }
function publicOrder(o) {
  return { id: o.id, provider: o.provider, planId: o.plan_id, planName: o.plan_name, amount: o.amount, days: o.days,
    status: o.status, createdAt: o.created_at, expiresAt: o.expires_at, paidAt: o.paid_at,
    memberExpiresAt: o.member_expires_at, fulfillment: o.fulfillment_state, checkout: o.checkout && o.status !== 'paid' && o.expires_at > Date.now() ? JSON.parse(o.checkout) : null };
}
class PaymentService {
  constructor({ config, store, providers, getPlans, memberships }) { Object.assign(this, { config, store, providers, getPlans, memberships }); this.creating = new Map(); this.querying = new Map(); }
  provider(name) { if (!this.providers[name]) reject('该支付方式尚未配置完成，请稍后重试', 'NOT_CONFIGURED', 503); return this.providers[name]; }
  async create(user, input) {
    if (!input || input.accepted !== true) reject('请先阅读并同意会员服务协议', 'AGREEMENT_REQUIRED');
    if (!['alipay', 'wechat'].includes(input.provider)) reject('请选择支付方式', 'INVALID_PROVIDER');
    if (!/^[A-Za-z0-9_-]{16,80}$/.test(input.requestId || '') || typeof input.planId !== 'string') reject('下单参数无效', 'INVALID_INPUT');
    if (this.config[input.provider]?.enabled === false) reject('该支付方式已关闭，请选择其他方式', 'PROVIDER_DISABLED', 409);
    const key = user.id + ':' + input.requestId;
    if (this.creating.has(key)) { await this.creating.get(key); return this.existing(user, input); }
    const promise = this.createOnce(user, input);
    this.creating.set(key, promise);
    try { return await promise; } finally { this.creating.delete(key); }
  }
  existing(user, input) {
    const old = this.store.find(user.id, input.requestId);
    if (old && (old.provider !== input.provider || old.plan_id !== input.planId)) reject('同一请求不能更换套餐或支付方式', 'REQUEST_CONFLICT', 409);
    return old ? publicOrder(old) : null;
  }
  async createOnce(user, input) {
    const existing = this.existing(user, input);
    if (existing) return existing;
    const provider = this.provider(input.provider);
    if (!this.store.rate('create:' + user.id, 10, 60_000) || !this.store.rate('daily:' + user.id, 100, 86_400_000)) reject('操作过于频繁，请稍后再试', 'RATE_LIMITED', 429);
    const plans = await this.getPlans();
    const plan = plans.find(p => p.id === input.planId && p.enabled === true);
    if (!plan || plan.id === 'free') reject('该套餐当前不可购买', 'PLAN_UNAVAILABLE');
    if (plan.autoRenew) reject('连续订阅需要另行开通自动扣款，请选择月度或年度会员', 'RECURRING_NOT_ENABLED');
    const amount = moneyToCents(plan.price);
    if (amount < 1 || amount > 10_000_000 || !Number.isInteger(plan.days) || plan.days < 1 || plan.days > 3660) reject('套餐金额或时长配置无效', 'PLAN_INVALID');
    const baseExpiry = typeof user.memberExpiresAt === 'number' ? user.memberExpiresAt : Date.parse(user.memberExpiresAt || '') || 0;
    const order = this.store.create({ userId: user.id, requestId: input.requestId, provider: input.provider, plan, amount, baseExpiry });
    try { return publicOrder(this.store.checkout(order.id, await provider.create(order, this.config.publicBaseUrl))); }
    catch (error) { this.store.unknown(order.id); error.orderId = order.id; throw error; }
  }
  owned(user, id) {
    const order = this.store.get(id);
    if (!order || order.user_id !== user.id) reject('订单不存在', 'ORDER_NOT_FOUND', 404);
    return order;
  }
  async query(user, id) {
    let order = this.owned(user, id);
    if (order.status === 'paid') return publicOrder(this.fulfill(order));
    if (order.status === 'closed' || Date.now() - order.last_checked_at < 4000) return publicOrder(order);
    if (this.querying.has(id)) return this.querying.get(id);
    const promise = (async () => {
      this.store.checked(id);
      const result = await this.provider(order.provider).query(order);
      if (result.orderId !== id) reject('支付查询返回的订单不匹配', 'ORDER_MISMATCH', 502);
      this.apply(order.provider, result);
      return publicOrder(this.store.get(id));
    })();
    this.querying.set(id, promise);
    try { return await promise; } finally { this.querying.delete(id); }
  }
  apply(provider, result) {
    const order = this.store.get(result.orderId);
    if (!order || order.provider !== provider) reject('支付通知订单不匹配', 'ORDER_MISMATCH', 404);
    if (result.status === 'pending') return order;
    const config = this.config[provider], merchant = provider === 'wechat' ? config.mchId : config.sellerId;
    if (result.appId !== config.appId || result.merchantId !== merchant || result.amount !== order.amount || result.currency !== 'CNY') reject('支付通知的应用、商户或金额不匹配', 'PAYMENT_MISMATCH');
    if (result.status === 'closed') return this.store.closed(order.id);
    if (!result.transactionId || !Number.isFinite(result.paidAt) || result.paidAt < order.created_at - 300_000 || result.paidAt > Date.now() + 300_000) reject('支付成功通知缺少有效交易信息', 'INVALID_PAYMENT');
    const currentUser = this.memberships?.readUsers().find(user => user.id === order.user_id);
    const expiry = this.memberships ? this.memberships.stateFor(currentUser || null).expiresAt : undefined;
    return this.fulfill(this.store.paid(order.id, result.transactionId, result.paidAt, expiry));
  }
  fulfill(order) {
    if (!this.memberships || order.fulfillment_state !== 'pending' || order.user_id === 'payment-integration') return order;
    const result = this.memberships.applyPayment(order);
    return this.store.fulfilled(order.id, result.event.afterPermanent ? null : Date.parse(result.event.afterExpiresAt) || null);
  }
  retryFulfillment() { for (const order of this.store.pendingFulfillment()) { try { this.fulfill(order); } catch { /* durable pending order retries without duplicate grants */ } } }
  notification(provider, headers, raw) { return this.apply(provider, this.provider(provider).notification(headers, raw)); }
}
module.exports = { PaymentService, publicOrder };
