'use strict';
const { PaymentError, moneyToCents } = require('./providers.cjs');
const { ActivityEngine } = require('./activities.cjs');
function reject(message, code, status = 400) { throw new PaymentError(message, code, status); }
function publicOrder(o) {
  return { id: o.id, provider: o.provider, planId: o.plan_id, planName: o.plan_name, quantity: o.quantity || 1, amount: o.amount, days: o.days,
    status: o.status, createdAt: o.created_at, expiresAt: o.expires_at, paidAt: o.paid_at,
    memberExpiresAt: o.member_expires_at, fulfillment: o.fulfillment_state, checkout: o.checkout && o.status !== 'paid' && o.expires_at > Date.now() ? JSON.parse(o.checkout) : null };
}
class PaymentService {
  constructor({ config, store, providers, getPlans, memberships }) { Object.assign(this, { config, store, providers, getPlans, memberships }); this.activities = new ActivityEngine(store); this.creating = new Map(); this.querying = new Map(); }
  async quote(user, input) {
    const plans = await this.getPlans(), plan = plans.find(p => p.id === input.planId && p.enabled === true && p.id !== 'free' && !p.autoRenew);
    if (!plan || !Number.isInteger(plan.days) || plan.days < 1) reject('该套餐当前不可购买', 'PLAN_UNAVAILABLE');
    return this.activities.quote(this.activityUser(user), plan, input.quantity ?? 1);
  }
  activityUser(user) {
    // Eligibility uses the existing user store, never request-supplied profile fields.
    const stored = this.memberships?.readUsers?.().find(item => item.id === user.id);
    return { ...user, registeredAt: stored?.registeredAt, blacklisted: user.blacklisted || stored?.blacklisted };
  }
  provider(name) { if (!this.providers[name]) reject('该支付方式尚未配置完成，请稍后重试', 'NOT_CONFIGURED', 503); return this.providers[name]; }
  async create(user, input) {
    input = { ...input, quantity: input?.quantity ?? 1 };
    if (!input || input.accepted !== true) reject('请先阅读并同意会员服务协议', 'AGREEMENT_REQUIRED');
    if (!['alipay', 'wechat'].includes(input.provider)) reject('请选择支付方式', 'INVALID_PROVIDER');
    if (!/^[A-Za-z0-9_-]{16,80}$/.test(input.requestId || '') || typeof input.planId !== 'string' || !Number.isInteger(input.quantity) || input.quantity < 1) reject('下单参数无效', 'INVALID_INPUT');
    const key = user.id + ':' + input.requestId;
    if (this.creating.has(key)) { await this.creating.get(key); return this.existing(user, input); }
    const promise = this.createOnce(user, input);
    this.creating.set(key, promise);
    try { return await promise; } finally { this.creating.delete(key); }
  }
  existing(user, input) {
    const old = this.store.find(user.id, input.requestId);
    if (old && (old.provider !== input.provider && old.provider !== 'free' || old.plan_id !== input.planId || old.quantity !== input.quantity)) reject('同一请求不能更换套餐、数量或支付方式', 'REQUEST_CONFLICT', 409);
    return old ? publicOrder(old) : null;
  }
  async createOnce(user, input) {
    const existing = this.existing(user, input);
    if (existing) return existing.provider === 'free' ? this.completeFree(this.store.get(existing.id)) : this.upgradeCheckout(existing);
    const active = !input.quoteToken && this.store.active(user.id, input.provider, input.planId, input.quantity);
    if (active) return this.upgradeCheckout(publicOrder(active));
    if (!this.store.rate('create:' + user.id, 10, 60_000) || !this.store.rate('daily:' + user.id, 100, 86_400_000)) reject('操作过于频繁，请稍后再试', 'RATE_LIMITED', 429);
    const plans = await this.getPlans();
    const plan = plans.find(p => p.id === input.planId && p.enabled === true);
    if (!plan || plan.id === 'free') reject('该套餐当前不可购买', 'PLAN_UNAVAILABLE');
    if (plan.autoRenew) reject('连续订阅需要另行开通自动扣款，请选择月度或年度会员', 'RECURRING_NOT_ENABLED');
    const unitAmount = moneyToCents(plan.price);
    if (unitAmount < 1 || !Number.isInteger(plan.days) || plan.days < 1 || plan.days > 3660) reject('套餐金额或时长配置无效', 'PLAN_INVALID');
    const maxQuantity = Math.floor(3660 / plan.days);
    if (input.quantity > maxQuantity) reject(`该套餐单次最多购买 ${maxQuantity} 份`, 'QUANTITY_EXCEEDED');
    const amount = unitAmount * input.quantity;
    if (!Number.isSafeInteger(amount) || amount > 10_000_000) reject('订单金额超出单次支付范围', 'AMOUNT_EXCEEDED');
    const baseExpiry = typeof user.memberExpiresAt === 'number' ? user.memberExpiresAt : Date.parse(user.memberExpiresAt || '') || 0;
    const activityUser = this.activityUser(user);
    const preview = this.activities.quote(activityUser, plan, input.quantity);
    if (preview.amount > 0) {
      if (this.config.enabled === false) reject('支付服务暂未开放', 'PAYMENTS_DISABLED', 503);
      if (this.config[input.provider]?.enabled === false) reject('该支付方式已关闭，请选择其他方式', 'PROVIDER_DISABLED', 409);
      this.provider(input.provider);
    }
    let reservation;
    try { reservation = this.activities.reserve(activityUser, input, plan, baseExpiry); }
    catch (error) { this.activities.audit('rejected', { userId: user.id, reason: error.message, details: { code: error.code, planId: plan.id, quantity: input.quantity } }); throw error; }
    const { order } = reservation;
    if (order.provider === 'free') return this.completeFree(order);
    if (reservation.existing) return this.upgradeCheckout(publicOrder(order));
    try { return publicOrder(this.store.checkout(order.id, await this.provider(input.provider).create(order, this.config.publicBaseUrl))); }
    catch (error) { this.store.unknown(order.id); if (this.activities.participation(order.id)) this.activities.issue(order.id, 'CHECKOUT_UNKNOWN', '支付创建结果未确认，保留名额等待核查'); error.orderId = order.id; throw error; }
  }
  completeFree(order) {
    if (order.provider !== 'free' || order.amount !== 0 || !this.activities.participation(order.id)) reject('无效的零元订单', 'INVALID_FREE_ORDER');
    const paid = this.store.paid(order.id, `FREE:${order.id}`, order.created_at);
    if (order.status !== 'paid') this.activities.audit('free_complete', { orderId: order.id, userId: order.user_id, reason: '零元领取完成，未调用支付渠道' });
    try { return publicOrder(this.fulfill(paid)); } catch (error) { error.orderId = order.id; throw error; }
  }
  async upgradeCheckout(order) {
    if (order.provider !== 'alipay' || order.checkout?.kind !== 'redirect' || order.status === 'paid' || order.status === 'closed') return order;
    const stored = this.store.get(order.id);
    const checkout = await this.provider('alipay').create(stored, this.config.publicBaseUrl);
    return publicOrder(this.store.checkout(order.id, checkout));
  }
  owned(user, id) {
    const order = this.store.get(id);
    if (!order || order.user_id !== user.id) reject('订单不存在', 'ORDER_NOT_FOUND', 404);
    return order;
  }
  async query(user, id) {
    let order = this.owned(user, id);
    if (order.provider === 'free') return this.completeFree(order);
    if (order.provider === 'alipay' && order.checkout && JSON.parse(order.checkout).kind === 'redirect' && !['paid','closed'].includes(order.status) && order.expires_at > Date.now()) {
      await this.upgradeCheckout(publicOrder(order));
      order = this.owned(user, id);
    }
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
    if (result.status === 'closed') {
      const closed = this.store.closed(order.id);
      if (closed.status === 'closed' && order.status !== 'closed' && this.activities.participation(order.id)) this.activities.audit('release', { orderId: order.id, reason: '支付渠道确认关闭，释放优惠名额' });
      return closed;
    }
    if (!result.transactionId || !Number.isFinite(result.paidAt) || result.paidAt < order.created_at - 300_000 || result.paidAt > Date.now() + 300_000) reject('支付成功通知缺少有效交易信息', 'INVALID_PAYMENT');
    const currentUser = this.memberships?.readUsers().find(user => user.id === order.user_id);
    const expiry = this.memberships ? this.memberships.stateFor(currentUser || null).expiresAt : undefined;
    const participation = this.activities.participation(order.id);
    const needsReview = !!participation && (result.paidAt >= order.expires_at || order.status === 'closed');
    const paid = this.store.paid(order.id, result.transactionId, result.paidAt, expiry, needsReview);
    if (participation && order.status !== 'paid') {
      this.activities.audit('paid', { activityId: participation.activity_id, orderId: order.id, userId: order.user_id });
      if (needsReview) {
        this.activities.issue(order.id, 'PAYMENT_REVIEW', '付款超出有效期限或发生于已释放名额的订单，需核查后处理');
        return this.store.get(order.id);
      }
    }
    return this.fulfill(paid);
  }
  fulfill(order) {
    if (!this.memberships || order.fulfillment_state !== 'pending' || order.user_id === 'payment-integration') return order;
    const participation = this.activities.participation(order.id);
    try {
     return this.activities.transaction(() => {
      order = this.store.get(order.id);
      if (order.status !== 'paid' || order.fulfillment_state !== 'pending') return order;
      const rules = participation && this.activities.rules(participation.activity_id, participation.version);
      const result = this.memberships.applyPayment(order, { invitationEligible: !rules || rules.allowInvitation, activityId: participation?.activity_id, bonusDays: participation?.bonus_days || 0 });
      const complete = this.store.fulfilled(order.id, result.event.afterPermanent ? null : Date.parse(result.event.afterExpiresAt) || null);
      if (participation) {
        this.activities.audit('fulfilled', { activityId: participation.activity_id, orderId: order.id, userId: order.user_id, details: { eventId: result.event.id } });
        this.store.db.prepare('UPDATE activity_issues SET resolved_at=? WHERE order_id=? AND code IN (\'FULFILLMENT_FAILED\',\'CHECKOUT_UNKNOWN\',\'RECONCILE_FAILED\') AND resolved_at IS NULL').run(Date.now(),order.id);
      }
      return complete;
     });
    } catch (error) { if (participation) this.activities.issue(order.id, 'FULFILLMENT_FAILED', '订单已完成，会员到账失败，可安全重试补发'); throw error; }
  }
  async reconcileActivities() {
    if (this.reconciling) return;
    this.reconciling = true;
    try {
      const rows = this.store.db.prepare("SELECT o.* FROM orders o JOIN activity_participations p ON p.order_id=o.id WHERE o.status NOT IN ('paid','closed') AND (o.provider='free' OR o.expires_at<=?) ORDER BY o.created_at LIMIT 50").all(Date.now());
      for (const order of rows) {
        try {
          if (order.provider === 'free') { this.completeFree(order); continue; }
          const provider = this.provider(order.provider), result = await provider.query(order);
          if (result.orderId !== order.id) reject('核查订单不匹配', 'ORDER_MISMATCH');
          if (result.status !== 'pending') this.apply(order.provider,result);
          else {
            await provider.close(order);
            const closed = this.store.closed(order.id);
            if (closed.status === 'closed') this.activities.audit('release', { orderId: order.id, reason: '超时订单已向支付渠道关单，释放名额' });
          }
          this.store.db.prepare("UPDATE activity_issues SET resolved_at=? WHERE order_id=? AND code IN ('RECONCILE_FAILED','CHECKOUT_UNKNOWN') AND resolved_at IS NULL").run(Date.now(),order.id);
        } catch { this.activities.issue(order.id, 'RECONCILE_FAILED', '渠道核查或关单失败，名额继续保留，系统将重试'); }
      }
    } finally { this.reconciling = false; }
  }
  retryFulfillment() { for (const order of this.store.pendingFulfillment()) { try { this.fulfill(order); } catch { /* durable pending order retries without duplicate grants */ } } }
  notification(provider, headers, raw) { return this.apply(provider, this.provider(provider).notification(headers, raw)); }
}
module.exports = { PaymentService, publicOrder };
