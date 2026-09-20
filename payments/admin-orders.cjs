'use strict';
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { loadConfig } = require('./config.cjs');
const { createMembershipService } = require('./membership.cjs');
function listOrders(options = {}) {
  const file = options.database || loadConfig().database;
  if (!fs.existsSync(file)) return { items: [] };
  const users = (options.memberships || createMembershipService()).readUsers();
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'").get()) return { items: [] };
    return { items: db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all().map(o => ({ id: o.id, userId: o.user_id,
      user: users.find(u => u.id === o.user_id)?.name || o.user_id, planId: o.plan_id, planName: o.plan_name, amount: o.amount,
      provider: o.provider, status: o.status, createdAt: o.created_at, paidAt: o.paid_at, expiresAt: o.expires_at,
      days: o.days, memberExpiresAt: o.member_expires_at, fulfillment: o.fulfillment_state })) };
  } finally { db.close(); }
}
module.exports = { listOrders };
