'use strict';
// The user store owns membership. Payment rows and invitation rows are source documents,
// never competing entitlement stores. Reads normalize legacy data without writing it.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const DEFAULT_ADMIN = path.resolve(__dirname, '../../聚合管理后台');
const DAY = 86400000;
const copy = value => JSON.parse(JSON.stringify(value));
function timestamp(value, endOfDay = false) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string' || !value || value === '永久') return 0;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + (endOfDay ? 'T23:59:59.999+08:00' : 'T00:00:00+08:00') : /Z$|[+-]\d\d:\d\d$/.test(value) ? value : value.replace(' ', 'T') + '+08:00';
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
function readJson(file, fallback) { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')) : copy(fallback); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); const temp = file + '.' + crypto.randomUUID() + '.tmp'; fs.writeFileSync(temp, JSON.stringify(value, null, 2)); fs.renameSync(temp, file); }
function createMembershipService(options = {}) {
  const usersFile = options.usersFile || process.env.SHIYU_USERS_FILE || path.join(DEFAULT_ADMIN, '.local/shiyu-users.json');
  const invitationsFile = options.invitationsFile || process.env.SHIYU_INVITATIONS_FILE || path.join(DEFAULT_ADMIN, '.local/shiyu-invitations.json');
  const now = options.now || Date.now;
  const plans = () => options.readPlans ? options.readPlans() : require(path.join(DEFAULT_ADMIN, 'membership/plan-store.cjs')).readPublishedPlans();
  const retainedPlan = id => options.readRetainedPlan ? options.readRetainedPlan(id) : options.readPlans ? null : require(path.join(DEFAULT_ADMIN, 'membership/plan-store.cjs')).retainedPlan?.(id);
  const readUsers = () => readJson(usersFile, { items: [] }).items || [];
  const writeUsers = items => writeJson(usersFile, { items, updatedAt: new Date(now()).toISOString() });
  const freePlan = () => plans().find(p => p.id === 'free' || p.name === '免费版');
  const paidPlan = id => plans().find(p => p.id === id && p.id !== 'free') || plans().find(p => p.id !== 'free' && p.name !== '免费版');
  const testState = options.readExperience || (user => require(path.join(DEFAULT_ADMIN, 'experience-test/store.cjs')).get('shiyu', user.id));
  function actualStateFor(user) {
    const value = user?.membership;
    const legacyPermanent = !!user?.member && user.memberExpiresAt === '永久';
    const permanent = value ? value.permanent === true : legacyPermanent;
    const expiresAt = permanent ? null : value ? timestamp(value.expiresAt, true) : timestamp(user?.memberExpiresAt, true);
    const member = !!user && !user.blacklisted && (value ? value.member === true : user.member === true) && (permanent || expiresAt > now());
    const plan = member ? value?.planId ? plans().find(p => p.id === value.planId) || retainedPlan(value.planId) : paidPlan() : freePlan();
    return { member, permanent: member && permanent, expiresAt: !permanent && expiresAt > 0 ? expiresAt : null,
      planId: member ? value?.planId || plan?.id || null : plan?.id || 'free',
      planName: member ? plan?.name || value?.planName || '会员' : plan?.name || '免费版',
      planVersion: member ? plan?.version || value?.planVersion || 1 : plan?.version || 1,
      entitlements: copy(plan?.entitlements || (member && Array.isArray(value?.entitlements) ? value.entitlements : [])) };
  }
  function stateFor(user) {
    const actual = actualStateFor(user);
    if (!user || user.blacklisted) return actual;
    const test = testState(user);
    if (!test?.enabled || !['member', 'free'].includes(test.values?.membership)) return actual;
    const member = test.values.membership === 'member', plan = member ? paidPlan() : freePlan();
    if (!plan) return actual;
    return { member, permanent: member, expiresAt: null, planId: plan.id,
      planName: plan.name, planVersion: plan.version || 1, entitlements: copy(plan.entitlements || []) };
  }
  function present(user, includeEvents = false, testView = false) {
    const state = testView ? stateFor(user) : actualStateFor(user), { password, accountData, memberEvents, membership, ...rest } = user;
    return { ...rest, ...state, membership: { ...state }, memberExpiresAt: state.permanent ? '永久' : state.expiresAt ? new Date(state.expiresAt).toISOString() : null,
      ...(includeEvents ? { memberEvents: copy(memberEvents || []) } : {}) };
  }
  function applyToUser(user, input) {
    user.memberEvents ||= [];
    const id = input.id || `ME:${crypto.randomUUID()}`;
    const prior = user.memberEvents.find(event => event.id === id);
    if (prior) return { user, event: prior, changed: false };
    const before = actualStateFor(user), source = input.source, cancel = input.action === 'cancel';
    if (!['admin', 'payment', 'reward'].includes(source)) throw Error('会员来源无效');
    const preserveOffline = source === 'admin' && input.planId && user.membership?.planId === input.planId && Array.isArray(user.membership.entitlements);
    if (!cancel && input.planId && !plans().some(plan => plan.id === input.planId && plan.id !== 'free') && !input.planSnapshot && !preserveOffline) throw Error('会员权益方案未发布或已下线');
    const selected = input.planId || before.planId;
    const plan = input.planSnapshot || plans().find(p => p.id === selected && p.id !== 'free') || (preserveOffline ? retainedPlan(selected) || { id: user.membership.planId, name: user.membership.planName, version: user.membership.planVersion, entitlements: user.membership.entitlements } : paidPlan());
    if (!cancel && !plan && !before.member) throw Error('请先发布至少一个会员权益方案');
    const permanent = !cancel && (source === 'admin' ? input.permanent === true : before.permanent);
    let expiresAt = null;
    if (!cancel && !permanent) {
      if (source === 'admin') {
        expiresAt = timestamp(input.expiresAt, true);
        if (!expiresAt || expiresAt < now()) throw Error('会员截止日期不能早于今天');
      } else {
        if (!Number.isInteger(input.days) || input.days <= 0 || input.days > 36500) throw Error('会员奖励或购买时长无效');
        expiresAt = Math.max(now(), before.expiresAt || 0) + input.days * DAY;
      }
    }
    // Rewards extend the current grant without silently changing its paid benefit snapshot.
    const preserve = source === 'reward' && before.member || permanent && source !== 'admin';
    const after = cancel ? { member: false, permanent: false, expiresAt: null, planId: null, planVersion: null, entitlements: [] } : {
      member: true, permanent, expiresAt,
      planId: preserve ? before.planId : plan?.id || before.planId,
      planName: preserve ? before.planName : plan?.name || before.planName,
      planVersion: preserve ? before.planVersion : plan?.version || 1,
      entitlements: copy(preserve ? before.entitlements : plan?.entitlements || before.entitlements) };
    if (source === 'admin' && JSON.stringify(user.membership) === JSON.stringify(after)) return { user, event: user.memberEvents[0] || null, changed: false };
    const end = state => state.permanent ? '永久' : state.expiresAt ? new Date(state.expiresAt).toISOString() : null;
    const action = cancel ? 'cancel' : source === 'admin' ? before.member ? 'adjust' : 'grant' : before.member ? 'renew' : 'grant';
    const event = { id, time: new Date(input.occurredAt || now()).toISOString(), source, action,
      title: input.title || (source === 'admin' ? cancel ? '管理员取消会员' : before.member ? '管理员调整' : '管理员开通' : source === 'payment' ? `${action === 'renew' ? '续费' : '开通'}${plan?.name || '会员'}` : '活动奖励'),
      type: source === 'admin' ? '管理员配置' : source === 'payment' ? '付费' : '活动赠送', amount: Number(input.amount || 0),
      duration: cancel ? '—' : permanent && source === 'admin' ? '永久' : `${input.days || Math.max(1, Math.ceil((expiresAt - now()) / DAY))} 天`,
      expires: cancel ? '已取消' : end(after), operator: input.operator || (source === 'admin' ? '管理员' : '系统'),
      orderId: input.orderId, rewardId: input.rewardId, planId: after.planId, planName: after.planName, planVersion: after.planVersion,
      beforeExpiresAt: end(before), afterExpiresAt: end(after), beforePermanent: before.permanent, afterPermanent: after.permanent,
      remark: input.remark || '', ...(source === 'payment' ? { provider: input.provider } : {}) };
    user.membership = after;
    user.member = after.member;
    user.memberExpiresAt = end(after);
    user.memberEvents.unshift(event);
    return { user, event, changed: true };
  }
  function mutate(userId, input) {
    const users = readUsers(), user = users.find(item => item.id === userId);
    if (!user) throw Error('会员归属用户不存在');
    const result = applyToUser(user, input);
    if (result.changed) writeUsers(users);
    return result;
  }
  const records = user => (user.memberEvents || []).filter(event => ['payment', 'reward'].includes(event.source) || !event.source && ['付费', '活动赠送'].includes(event.type)).map(event => ({
    id: event.id, source: event.source || (event.type === '付费' ? 'payment' : 'reward'), title: event.title,
    time: event.time, amount: event.amount || 0, duration: event.duration, expires: event.afterExpiresAt ?? event.expires,
    orderId: event.orderId, rewardId: event.rewardId, provider: event.provider, status: 'completed' }));
  function settleInvitations(inputStore) {
    const store = inputStore || readJson(invitationsFile, { campaigns: [], rewards: [] });
    const users = readUsers();
    const { calculateRewards } = require('./invitation-model.mjs');
    const rewards = calculateRewards(store.campaigns, users, store.rewards, now());
    if (rewards.length !== store.rewards.length) { store.rewards = rewards; writeJson(invitationsFile, store); }
    let changed = false;
    for (const reward of rewards) for (const [userId, days] of [[reward.inviterId, reward.inviterDays], [reward.inviteeId, reward.inviteeDays]]) {
      const user = users.find(item => item.id === userId);
      if (!user || !days) continue;
      const result = applyToUser(user, { id: `INV:${reward.id}:${userId}`, source: 'reward', days, rewardId: reward.id,
        title: `${reward.campaignName} · ${reward.type}`, occurredAt: timestamp(reward.occurredAt), remark: reward.note });
      changed ||= result.changed;
    }
    if (changed) writeUsers(users);
    return store;
  }
  function applyPayment(order) {
    const planSnapshot = order.plan_snapshot ? JSON.parse(order.plan_snapshot) : null;
    const result = mutate(order.user_id, { id: `PAY:${order.id}`, source: 'payment', orderId: order.id, planId: order.plan_id,
      planSnapshot, days: order.days, amount: order.amount / 100, provider: order.provider, occurredAt: order.paid_at });
    settleInvitations();
    return result;
  }
  function checkQuota(user, next, previous = user.accountData || []) {
    const rights = stateFor(user).entitlements;
    const limit = key => { const item = rights.find(x => x.key === key); return item?.enabled && Number.isFinite(Number(item.value)) ? Number(item.value) : 0; };
    const growing = (before, after, key, label) => { if (after > before && after > limit(key)) throw Error(`${label}已达到当前权益上限，请先调整会员权益`); };
    growing(previous.length, next.length, 'space-limit', '空间数量');
    for (const space of next) {
      const oldSpace = previous.find(x => x.id === space.id);
      growing(oldSpace?.scenes?.length || 0, space.scenes.length, 'scene-limit', '场景数量');
      for (const scene of space.scenes) {
        const oldScene = oldSpace?.scenes?.find(x => x.id === scene.id);
        growing(oldScene?.groups?.length || 0, scene.groups.length, 'group-limit', '分组数量');
      }
    }
  }
  return { stateFor, present, applyToUser, mutate, records, checkQuota, readUsers, writeUsers, plans, settleInvitations, applyPayment,
    readInvitations: () => readJson(invitationsFile, { campaigns: [], rewards: [] }), writeInvitations: data => writeJson(invitationsFile, data) };
}
module.exports = { createMembershipService, timestamp, DAY };
