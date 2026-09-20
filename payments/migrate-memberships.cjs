'use strict';
// Explicit legacy migration. A dry run is the default; GET handlers never migrate data.
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { createMembershipService, timestamp } = require('./membership.cjs');
function migrateMemberships({ database, memberships = createMembershipService(), apply = false }) {
  if (!fs.existsSync(database)) return { candidates: 0, usersChanged: 0, applied: false };
  const db = new DatabaseSync(database, { readOnly: !apply });
  try {
    if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'").get()) return { candidates: 0, usersChanged: 0, applied: false };
    const orders = db.prepare("SELECT * FROM orders WHERE status='paid' ORDER BY paid_at ASC").all();
    const users = memberships.readUsers(), changed = new Set(), canonical = new Set(users.filter(u => u.membership).map(u => u.id)); let candidates = 0;
    for (const order of orders) {
      const user = users.find(u => u.id === order.user_id);
      if (!user || order.fulfillment_state === 'pending' || user.memberEvents?.some(e => e.id === `PAY:${order.id}`)) continue;
      candidates++;
      user.memberEvents ||= [];
      // An administrative override always wins over older payment history, including old-format cancellations.
      const override = canonical.has(user.id) || user.memberEvents.some(e => (e.source === 'admin' || e.type === '管理员配置' || /管理员|取消会员/.test(e.title || '')) && timestamp(e.time) >= order.paid_at);
      const before = memberships.stateFor(user), historicalExpiry = Number(order.member_expires_at) || 0;
      if (!override) {
        const plan = order.plan_snapshot ? JSON.parse(order.plan_snapshot) : memberships.plans().find(p => p.id === order.plan_id) || memberships.plans().find(p => p.id !== 'free');
        const expiry = Math.max(before.expiresAt || 0, historicalExpiry);
        user.membership = { member: before.permanent || expiry > Date.now(), permanent: before.permanent, expiresAt: before.permanent ? null : expiry,
          planId: plan?.id || order.plan_id, planName: plan?.name || order.plan_name, planVersion: plan?.version || 1, entitlements: plan?.entitlements || [] };
        user.member = user.membership.member; user.memberExpiresAt = before.permanent ? '永久' : expiry ? new Date(expiry).toISOString() : null;
      }
      user.memberEvents.push({ id: `PAY:${order.id}`, source: 'payment', action: 'grant', title: `开通${order.plan_name}`, type: '付费', amount: order.amount / 100,
        time: new Date(order.paid_at).toISOString(), duration: `${order.days} 天`, expires: historicalExpiry ? new Date(historicalExpiry).toISOString() : null,
        orderId: order.id, provider: order.provider, planId: order.plan_id, operator: '系统迁移', beforeExpiresAt: order.base_expiry ? new Date(order.base_expiry).toISOString() : null,
        afterExpiresAt: historicalExpiry ? new Date(historicalExpiry).toISOString() : null, beforePermanent: false, afterPermanent: false, remark: '迁移历史支付记录；保留后续管理员设置' });
      user.memberEvents.sort((a, b) => timestamp(b.time) - timestamp(a.time)); changed.add(user.id);
    }
    if (apply && changed.size) memberships.writeUsers(users);
    return { candidates, usersChanged: changed.size, applied: apply };
  } finally { db.close(); }
}
if (require.main === module) {
  const { loadConfig } = require('./config.cjs');
  process.stdout.write(JSON.stringify(migrateMemberships({ database: loadConfig().database, apply: process.argv.includes('--apply') })) + '\n');
}
module.exports = { migrateMemberships };
