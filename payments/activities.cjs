'use strict';
// Activity rules and participation facts live beside orders for atomic quota reservation.
// Users and orders are joined, never copied into an activity-owned store.
const crypto = require('node:crypto');
const { PaymentError, moneyToCents } = require('./providers.cjs');
const { timestamp } = require('./invitation-model.mjs');
const fail = (message, code = 'ACTIVITY_INVALID', status = 400) => { throw new PaymentError(message, code, status); };
const integer = (n, min, max, label) => { if (!Number.isSafeInteger(n) || n < min || n > max) fail(`${label}必须为 ${min}–${max} 的整数`); return n; };
const cap = (n, label) => n == null ? null : integer(n, 1, 100000000, label);
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

class ActivityEngine {
  constructor(store, { now = Date.now } = {}) {
    this.store = store; this.db = store.db; this.now = now;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activities(id TEXT PRIMARY KEY, state TEXT NOT NULL, version INTEGER NOT NULL, created_at INTEGER NOT NULL, stopped_at INTEGER);
      CREATE TABLE IF NOT EXISTS activity_versions(activity_id TEXT NOT NULL REFERENCES activities(id), version INTEGER NOT NULL, rules TEXT NOT NULL, operator TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(activity_id,version));
      CREATE TABLE IF NOT EXISTS activity_participations(order_id TEXT PRIMARY KEY REFERENCES orders(id), activity_id TEXT NOT NULL, version INTEGER NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>0), bonus_days INTEGER NOT NULL CHECK(bonus_days>=0), discount_cents INTEGER NOT NULL CHECK(discount_cents>=0), FOREIGN KEY(activity_id,version) REFERENCES activity_versions(activity_id,version));
      CREATE INDEX IF NOT EXISTS activity_participation_activity ON activity_participations(activity_id);
      CREATE TABLE IF NOT EXISTS activity_audit(id INTEGER PRIMARY KEY AUTOINCREMENT, activity_id TEXT, order_id TEXT, user_id TEXT, action TEXT NOT NULL, operator TEXT NOT NULL, reason TEXT NOT NULL, details TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS activity_issues(order_id TEXT NOT NULL REFERENCES orders(id), code TEXT NOT NULL, message TEXT NOT NULL, created_at INTEGER NOT NULL, resolved_at INTEGER, PRIMARY KEY(order_id,code));
    `);
  }
  transaction(fn) { this.db.exec('BEGIN IMMEDIATE'); try { const value = fn(); this.db.exec('COMMIT'); return value; } catch (e) { this.db.exec('ROLLBACK'); throw e; } }
  audit(action, { activityId = null, orderId = null, userId = null, operator = '系统', reason = '', details = {} } = {}) {
    this.db.prepare('INSERT INTO activity_audit(activity_id,order_id,user_id,action,operator,reason,details,created_at) VALUES(?,?,?,?,?,?,?,?)').run(activityId, orderId, userId, action, operator, reason, JSON.stringify(details), this.now());
  }
  list() {
    return this.db.prepare('SELECT a.*,v.rules FROM activities a JOIN activity_versions v ON v.activity_id=a.id AND v.version=a.version ORDER BY a.created_at DESC,a.id').all().map(a => ({ ...JSON.parse(a.rules), id: a.id, state: a.state, version: a.version, createdAt: a.created_at, stoppedAt: a.stopped_at, status: a.state === 'draft' ? '草稿' : a.state === 'stopped' ? '已停用' : this.now() < JSON.parse(a.rules).start ? '未开始' : this.now() >= JSON.parse(a.rules).end ? '已结束' : '进行中', used: this.usage(a.id) }));
  }
  usage(id, userId, planId) {
    const row = this.db.prepare(`SELECT COALESCE(SUM(p.quantity),0) AS used FROM activity_participations p JOIN orders o ON o.id=p.order_id WHERE p.activity_id=? AND o.status!='closed' ${userId ? 'AND o.user_id=?' : ''} ${planId ? 'AND o.plan_id=?' : ''}`).get(id, ...(userId ? [userId] : []), ...(planId ? [planId] : []));
    return row.used; // Expired/unknown orders retain quota until provider closure is verified.
  }
  normalize(input, plans) {
    const name = String(input.name || '').trim(), description = String(input.description || '').trim();
    if (!name || name.length > 60 || description.length > 500) fail('活动名称需为 1–60 字，说明不超过 500 字');
    const start = integer(input.start, 1, Number.MAX_SAFE_INTEGER, '开始时间'), end = integer(input.end, 1, Number.MAX_SAFE_INTEGER, '结束时间');
    if (!Number.isFinite(new Date(start).getTime()) || !Number.isFinite(new Date(end).getTime()) || start >= end || end <= this.now()) fail('请选择有效时间，结束时间必须晚于开始时间且尚未结束');
    const priority = integer(input.priority, 1, 9999, '优先级');
    if (!['discount', 'plan_discount', 'fixed', 'none'].includes(input.priceMode)) fail('请选择正确的价格设置方式');
    const audience = input.audience ?? 'all';
    if (!['all', 'new_users'].includes(audience)) fail('请选择正确的参与范围');
    const discountBps = input.priceMode === 'discount' ? integer(input.discountBps, 0, 9999, '折扣比例') : null;
    if (!Array.isArray(input.plans) || !input.plans.length || input.plans.length > 100) fail('请选择适用套餐');
    const seen = new Set();
    const rules = input.plans.map(r => {
      const plan = plans.find(p => p.id === r.planId && p.id !== 'free' && p.enabled && !p.autoRenew);
      if (!plan || seen.has(r.planId)) fail('套餐不存在、未上架、重复或为连续订阅套餐');
      seen.add(r.planId);
      const priceCents = input.priceMode === 'fixed' ? integer(r.priceCents, 0, 10000000, '活动价（分）') : null;
      const base = moneyToCents(plan.price);
      if (priceCents !== null && priceCents > base) fail('活动价不能高于正常销售价');
      const planDiscountBps = input.priceMode === 'plan_discount' ? integer(r.discountBps, 0, 9999, '套餐折扣比例') : null;
      const bonusDays = input.giftEnabled === false ? 0 : integer(r.bonusDays ?? 0, 0, 3660, '每份赠送天数');
      if (input.priceMode === 'none' && bonusDays === 0) fail('仅赠天活动必须设置赠送天数');
      return { planId: r.planId, priceCents, discountBps: planDiscountBps, bonusDays, totalCap: cap(r.totalCap, '套餐总份数'), userCap: cap(r.userCap, '套餐每账号份数') };
    });
    return { name, description, start, end, priority, audience, priceMode: input.priceMode, discountBps, plans: rules, giftEnabled: input.giftEnabled ?? rules.some(r => r.bonusDays > 0), totalCap: cap(input.totalCap, '总优惠份数'), userCap: cap(input.userCap, '每账号优惠份数') ?? 1, allowZero: true, allowInvitation: input.allowInvitation === true };
  }
  mutate(input, operator, plans) {
    return this.transaction(() => {
      const old = input.id ? this.list().find(c => c.id === input.id) : null;
      if (input.id && !old) fail('活动不存在', 'NOT_FOUND', 404);
      if (old && input.version !== old.version) fail('活动已被其他管理员修改，请刷新后重试', 'VERSION_CONFLICT', 409);
      if (input.action === 'stop') {
        if (!old || old.state !== 'active' || old.end <= this.now()) fail('仅未结束的已启用活动可停用');
        this.db.prepare("UPDATE activities SET state='stopped',stopped_at=?,version=version+1 WHERE id=?").run(this.now(), old.id);
        // Keep rule versions immutable; the stop revision preserves what existing orders purchased.
        this.db.prepare('INSERT INTO activity_versions VALUES(?,?,?,?,?)').run(old.id, old.version + 1, JSON.stringify(this.rules(old.id, old.version)), operator, this.now());
        this.audit('stop', { activityId: old.id, operator, reason: '停止新参与；已创建订单在原支付期限内继续有效' });
        return this.list();
      }
      if (!['save', 'activate'].includes(input.action)) fail('不支持该操作');
      if (old && old.state !== 'draft') fail('已启用活动规则锁定，请复制为新活动后调整');
      const rules = this.normalize(input, plans);
      const state = input.action === 'activate' ? 'active' : 'draft';
      if (state === 'active') {
        const conflict = this.list().find(c => c.id !== old?.id && c.state === 'active' && c.priority === rules.priority && c.start < rules.end && rules.start < c.end && c.plans.some(p => rules.plans.some(r => r.planId === p.planId)));
        if (conflict) fail(`与“${conflict.name}”存在同套餐、重叠时间且同优先级冲突，请调整优先级`, 'PRIORITY_CONFLICT', 409);
      }
      const id = old?.id || crypto.randomUUID(), version = (old?.version || 0) + 1;
      if (!old) this.db.prepare('INSERT INTO activities VALUES(?,?,?,?,NULL)').run(id, state, version, this.now());
      else this.db.prepare('UPDATE activities SET state=?,version=? WHERE id=?').run(state, version, id);
      this.db.prepare('INSERT INTO activity_versions VALUES(?,?,?,?,?)').run(id, version, JSON.stringify(rules), operator, this.now());
      this.audit(input.action, { activityId: id, operator, details: { version, state } });
      return this.list();
    });
  }
  rules(id, version) { const row = this.db.prepare('SELECT rules FROM activity_versions WHERE activity_id=? AND version=?').get(id, version); return row ? JSON.parse(row.rules) : null; }
  quote(user, plan, quantity) {
    integer(quantity, 1, Math.floor(3660 / plan.days), '购买份数');
    if (user.blacklisted) fail('当前账号不可参加活动', 'FORBIDDEN', 403);
    const base = moneyToCents(plan.price), now = this.now();
    const registered = typeof user.registeredAt === 'string' ? timestamp(user.registeredAt) : NaN;
    const candidates = this.list().filter(c => c.state === 'active' && c.start <= now && now < c.end && (!c.audience || c.audience === 'all' || c.audience === 'new_users' && registered >= c.start && registered < c.end && registered <= now) && c.plans.some(p => p.planId === plan.id)).sort((a,b) => b.priority - a.priority || a.id.localeCompare(b.id));
    const campaign = candidates[0];
    let eligibleQuantity = 0, unit = base, bonusDays = 0, remainingQuantity = 0, bonusDaysPerUnit = 0, reason = '当前按正常售价购买';
    if (campaign) {
      const rule = campaign.plans.find(p => p.planId === plan.id);
      bonusDaysPerUnit = rule.bonusDays;
      remainingQuantity = Math.max(0, Math.min(Math.floor(3660 / (plan.days + rule.bonusDays)), (campaign.totalCap ?? Infinity) - this.usage(campaign.id), campaign.userCap - this.usage(campaign.id, user.id), (rule.totalCap ?? Infinity) - this.usage(campaign.id, null, plan.id), (rule.userCap ?? Infinity) - this.usage(campaign.id, user.id, plan.id)));
      eligibleQuantity = Math.min(quantity, remainingQuantity);
      unit = campaign.priceMode === 'fixed' ? rule.priceCents : campaign.priceMode === 'discount' ? Math.round(base * campaign.discountBps / 10000) : campaign.priceMode === 'plan_discount' ? Math.round(base * rule.discountBps / 10000) : base;
      if (unit > base || unit === 0 && !campaign.allowZero) fail('活动价格与套餐配置不一致，请联系管理员', 'ACTIVITY_PRICE_INVALID', 409);
      bonusDays = eligibleQuantity * rule.bonusDays;
      reason = eligibleQuantity ? `本次优惠 ${eligibleQuantity} 份，正常价 ${quantity - eligibleQuantity} 份` : '本次优惠名额或账号额度已用完，按正常价购买';
    }
    const amount = eligibleQuantity * unit + (quantity - eligibleQuantity) * base;
    const days = plan.days * quantity + bonusDays;
    if (!Number.isSafeInteger(amount) || amount > 10000000 || days > 3660) fail('订单金额或总会员时长超出范围');
    const facts = { userId: user.id, planId: plan.id, planVersion: plan.version ?? null, planHash: digest(plan), quantity, baseUnitCents: base, amount, days, eligibleQuantity, bonusDays, activityId: campaign?.id || null, activityVersion: campaign?.version || null, end: campaign?.end || null };
    return { ...facts, token: digest(facts), activityName: campaign?.name || null, activityDescription: campaign?.description || '', start: campaign?.start || null, priceMode: campaign?.priceMode || null, remainingQuantity, bonusDaysPerUnit, activityUnitCents: unit, discountCents: base * quantity - amount, allowInvitation: !eligibleQuantity || campaign.allowInvitation, reason };
  }
  reserve(user, input, plan, baseExpiry) {
    return this.transaction(() => {
      const existing = this.store.find(user.id, input.requestId);
      if (existing) {
        if (existing.plan_id !== input.planId || existing.quantity !== input.quantity || existing.provider !== input.provider && existing.provider !== 'free') fail('同一请求不能更换购买内容', 'REQUEST_CONFLICT', 409);
        return { order: existing, existing: true };
      }
      const quote = this.quote(user, plan, input.quantity);
      if (input.quoteToken !== quote.token && (input.quoteToken || quote.activityId)) fail('活动已结束、名额或价格已变化，请重新确认订单金额', 'QUOTE_CHANGED', 409);
      const order = this.store.create({ userId: user.id, requestId: input.requestId, provider: quote.amount === 0 ? 'free' : input.provider, plan, quantity: input.quantity, amount: quote.amount, days: quote.days, baseExpiry, expiresAt: quote.eligibleQuantity ? Math.min(this.now() + 10 * 60000, quote.end) : undefined });
      if (quote.eligibleQuantity) {
        this.db.prepare('INSERT INTO activity_participations VALUES(?,?,?,?,?,?)').run(order.id, quote.activityId, quote.activityVersion, quote.eligibleQuantity, quote.bonusDays, quote.discountCents);
        this.audit('reserve', { activityId: quote.activityId, orderId: order.id, userId: user.id, details: { version: quote.activityVersion, eligibleQuantity: quote.eligibleQuantity } });
      }
      return { order, quote, existing: false };
    });
  }
  participation(orderId) { return this.db.prepare('SELECT * FROM activity_participations WHERE order_id=?').get(orderId); }
  issue(orderId, code, message) {
    const inserted = this.db.prepare('INSERT INTO activity_issues VALUES(?,?,?,?,NULL) ON CONFLICT(order_id,code) DO UPDATE SET message=excluded.message,resolved_at=NULL WHERE activity_issues.resolved_at IS NOT NULL').run(orderId, code, message, this.now());
    if (inserted.changes) this.audit('exception', { orderId, reason: message, details: { code } });
  }
  resolveIssue(orderId, code, operator, reason) {
    this.db.prepare('UPDATE activity_issues SET resolved_at=? WHERE order_id=? AND code=? AND resolved_at IS NULL').run(this.now(), orderId, code);
    this.audit('resolve', { orderId, operator, reason, details: { code } });
  }
  view(users) {
    const byUser = new Map(users.map(u => [u.id, u]));
    const participations = this.db.prepare(`SELECT p.*,o.user_id,o.plan_id,o.plan_name,o.quantity AS order_quantity,o.amount,o.days,o.provider,o.status,o.created_at,o.paid_at,o.expires_at,o.fulfillment_state FROM activity_participations p JOIN orders o ON o.id=p.order_id ORDER BY o.created_at DESC`).all().map(r => ({ ...r, userName: byUser.get(r.user_id)?.name || r.user_id, activityName: this.rules(r.activity_id,r.version)?.name || r.activity_id }));
    return { campaigns: this.list(), participations, issues: this.db.prepare('SELECT * FROM activity_issues ORDER BY created_at DESC').all(), audit: this.db.prepare('SELECT * FROM activity_audit ORDER BY id DESC').all().map(r => ({ ...r, details: JSON.parse(r.details) })) };
  }
}
module.exports = { ActivityEngine };
