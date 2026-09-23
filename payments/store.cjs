'use strict';
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

class PaymentStore {
  constructor(filename) {
    if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, request_id TEXT NOT NULL,
        provider TEXT NOT NULL, plan_id TEXT NOT NULL, plan_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity>0), amount INTEGER NOT NULL CHECK(amount>0), days INTEGER NOT NULL CHECK(days>0),
        status TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
        paid_at INTEGER, transaction_id TEXT, checkout TEXT, last_checked_at INTEGER NOT NULL DEFAULT 0,
        base_expiry INTEGER NOT NULL DEFAULT 0, member_expires_at INTEGER,
        UNIQUE(user_id, request_id), UNIQUE(provider, transaction_id));
      CREATE TABLE IF NOT EXISTS memberships (user_id TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS ledger (order_id TEXT PRIMARY KEY REFERENCES orders(id), user_id TEXT NOT NULL, days INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL, ticket INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS rates (key TEXT PRIMARY KEY, started_at INTEGER NOT NULL, count INTEGER NOT NULL);
    `);
    const columns = new Set(this.db.prepare('PRAGMA table_info(orders)').all().map(row => row.name));
    if (!columns.has('quantity')) this.db.exec('ALTER TABLE orders ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1');
    if (!columns.has('plan_snapshot')) this.db.exec('ALTER TABLE orders ADD COLUMN plan_snapshot TEXT');
    if (!columns.has('fulfillment_state')) this.db.exec("ALTER TABLE orders ADD COLUMN fulfillment_state TEXT NOT NULL DEFAULT 'legacy'");
  }
  get(id) { return this.db.prepare('SELECT * FROM orders WHERE id=?').get(id); }
  find(userId, requestId) { return this.db.prepare('SELECT * FROM orders WHERE user_id=? AND request_id=?').get(userId, requestId); }
  active(userId, provider, planId, quantity, now = Date.now()) {
    return this.db.prepare("SELECT * FROM orders WHERE user_id=? AND provider=? AND plan_id=? AND quantity=? AND status IN ('created','pending','unknown') AND expires_at>? ORDER BY created_at DESC LIMIT 1")
      .get(userId, provider, planId, quantity, now);
  }
  list(userId) { return this.db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100').all(userId); }
  create({ userId, requestId, provider, plan, quantity = 1, amount, days = plan.days, baseExpiry = 0 }) {
    const id = 'SY' + crypto.randomBytes(14).toString('hex'), now = Date.now();
    this.db.prepare(`INSERT INTO orders (id,user_id,request_id,provider,plan_id,plan_name,quantity,amount,days,status,created_at,expires_at,base_expiry,plan_snapshot,fulfillment_state) VALUES (?,?,?,?,?,?,?,?,?,'created',?,?,?,?,'pending')`)
      .run(id, userId, requestId, provider, plan.id, plan.name, quantity, amount, days, now, now + 30 * 60_000, baseExpiry, JSON.stringify(plan));
    return this.get(id);
  }
  checkout(id, data) { this.db.prepare("UPDATE orders SET checkout=?,status='pending' WHERE id=? AND status IN ('created','unknown')").run(JSON.stringify(data), id); return this.get(id); }
  unknown(id) { this.db.prepare("UPDATE orders SET status='unknown' WHERE id=? AND status='created'").run(id); }
  checked(id) { this.db.prepare('UPDATE orders SET last_checked_at=? WHERE id=?').run(Date.now(), id); }
  closed(id) { this.db.prepare("UPDATE orders SET status='closed' WHERE id=? AND status!='paid'").run(id); return this.get(id); }
  membership(userId) { return this.db.prepare('SELECT expires_at FROM memberships WHERE user_id=?').get(userId)?.expires_at || 0; }
  pendingFulfillment() { return this.db.prepare("SELECT * FROM orders WHERE status='paid' AND fulfillment_state='pending' ORDER BY paid_at ASC").all(); }
  fulfilled(id, expiresAt) {
    const order = this.get(id);
    this.db.prepare('UPDATE ledger SET expires_at=? WHERE order_id=?').run(expiresAt || 0, id);
    this.db.prepare('UPDATE memberships SET expires_at=? WHERE user_id=?').run(expiresAt || 0, order.user_id);
    this.db.prepare("UPDATE orders SET fulfillment_state='complete',member_expires_at=? WHERE id=?").run(expiresAt, id);
    return this.get(id);
  }
  paid(id, transactionId, paidAt, authoritativeExpiry) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const order = this.get(id);
      if (!order) throw Error('订单不存在');
      if (order.status === 'paid') {
        if (order.transaction_id !== transactionId) throw Error('订单交易号不一致');
      } else {
        const start = authoritativeExpiry !== undefined ? Math.max(paidAt, authoritativeExpiry || 0) : Math.max(paidAt, order.base_expiry, this.membership(order.user_id));
        const expires = start + order.days * 86_400_000;
        this.db.prepare('INSERT INTO ledger(order_id,user_id,days,expires_at,created_at) VALUES(?,?,?,?,?)').run(id, order.user_id, order.days, expires, Date.now());
        this.db.prepare('INSERT INTO memberships(user_id,expires_at) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET expires_at=excluded.expires_at').run(order.user_id, expires);
        this.db.prepare("UPDATE orders SET status='paid',paid_at=?,transaction_id=?,member_expires_at=? WHERE id=?").run(paidAt, transactionId, expires, id);
      }
      this.db.exec('COMMIT');
      return this.get(id);
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  rate(key, limit, interval) {
    const now = Date.now();
    this.db.prepare(`INSERT INTO rates(key,started_at,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET
      count=CASE WHEN rates.started_at<? THEN 1 ELSE rates.count+1 END,
      started_at=CASE WHEN rates.started_at<? THEN excluded.started_at ELSE rates.started_at END`).run(key, now, now - interval, now - interval);
    return this.db.prepare('SELECT count FROM rates WHERE key=?').get(key).count <= limit;
  }
  makeTicket() {
    const token = crypto.randomBytes(32).toString('hex');
    this.db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());
    this.db.prepare('INSERT INTO sessions VALUES(?,?,?,1)').run(hash(token), 'payment-integration', Date.now() + 5 * 60_000);
    return token;
  }
  consumeTicket(token) {
    const row = this.db.prepare('DELETE FROM sessions WHERE token_hash=? AND ticket=1 AND expires_at>? RETURNING user_id').get(hash(token), Date.now());
    if (!row) return null;
    const session = crypto.randomBytes(32).toString('hex');
    this.db.prepare('INSERT INTO sessions VALUES(?,?,?,0)').run(hash(session), row.user_id, Date.now() + 4 * 3600_000);
    return session;
  }
  session(token) { return this.db.prepare('SELECT user_id FROM sessions WHERE token_hash=? AND ticket=0 AND expires_at>?').get(hash(token), Date.now()); }
  close() { this.db.close(); }
}
function hash(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
module.exports = { PaymentStore };
