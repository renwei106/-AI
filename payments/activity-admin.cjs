'use strict';
const { PaymentStore } = require('./store.cjs');
const { ActivityEngine } = require('./activities.cjs');
const { PaymentService } = require('./service.cjs');
const { loadConfig, inspect } = require('./config.cjs');
const { createMembershipService } = require('./membership.cjs');
const { WechatProvider, AlipayProvider, PaymentError } = require('./providers.cjs');
function createActivityAdmin(options = {}) {
  const config = options.config || loadConfig(), store = options.store || new PaymentStore(config.database);
  const memberships = options.memberships || createMembershipService(), engine = new ActivityEngine(store);
  const view = () => ({ ...engine.view(memberships.readUsers()), plans: memberships.plans().filter(p => p.id !== 'free' && p.enabled && !p.autoRenew).map(p => ({ id: p.id, name: p.name, price: p.price, days: p.days })) });
  const service = () => {
    const fresh = options.config || loadConfig(), ready = inspect(fresh), providers = options.providers || {};
    if (!options.providers) {
      if (ready.providers.wechat.ready) providers.wechat = new WechatProvider(fresh.wechat);
      if (ready.providers.alipay.ready) providers.alipay = new AlipayProvider(fresh.alipay);
    }
    return new PaymentService({ config: fresh, store, providers, memberships, getPlans: async () => memberships.plans() });
  };
  return {
    view, close: () => store.close(),
    async mutate(input, operator) {
      if (['save','activate','stop'].includes(input.action)) { engine.mutate(input,operator,memberships.plans()); return view(); }
      const reason = String(input.reason || '').trim();
      if (reason.length < 5 || reason.length > 500) throw new PaymentError('请填写 5–500 字的处理原因', 'REASON_REQUIRED', 400);
      const order = store.get(input.orderId);
      if (!order || !engine.participation(order.id)) throw new PaymentError('活动订单不存在','NOT_FOUND',404);
      if (!['retry','grant_review','note','reconcile'].includes(input.action)) throw new PaymentError('操作无效','INVALID_ACTION',400);
      engine.audit('admin_' + input.action, { orderId: order.id, userId: order.user_id, operator, reason });
      const payments = service();
      if (input.action === 'retry') {
        if (order.status !== 'paid' || order.fulfillment_state === 'review') throw new PaymentError('只有已完成且无需人工核查的订单可重试到账','INVALID_STATE',409);
        payments.fulfill(order);
      }
      if (input.action === 'grant_review') {
        if (order.status !== 'paid' || order.fulfillment_state !== 'review') throw new PaymentError('该订单不需要人工补发','INVALID_STATE',409);
        store.db.prepare("UPDATE orders SET fulfillment_state='pending' WHERE id=? AND fulfillment_state='review'").run(order.id);
        payments.fulfill(store.get(order.id));
        engine.resolveIssue(order.id,'PAYMENT_REVIEW',operator,reason);
      }
      if (input.action === 'reconcile') {
        if (order.provider === 'free') payments.completeFree(order);
        else { await payments.query({ id: order.user_id },order.id); await payments.reconcileActivities(); }
      }
      return view();
    },
  };
}
module.exports = { createActivityAdmin };
