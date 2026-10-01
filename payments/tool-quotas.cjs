'use strict';
// Tool data and counters belong to the authenticated user, alongside existing account data.
const definitions = {
  memo: { key: 'memo-limit', label: '小记', count: data => data.notes.filter(n => !n.deletedAt).length },
  todo: { key: 'todo-limit', label: '未完成事项', count: data => (data.calendarV2?.tasks || []).filter(t => !t.deletedAt && !t.done).length },
  corner: { key: 'corner-limit', label: '常用卡片', count: data => data.groups.filter(g => g.system !== 'inbox').length },
  icons: { key: 'icon-daily-limit', label: '今日图标使用次数' },
  colors: { key: 'color-daily-limit', label: '今日色号复制次数' },
};
function failure(message, code = 'INVALID_TOOL_DATA', status = 400, detail = {}) {
  return Object.assign(Error(message), { code, status, ...detail });
}
function quota(entitlements, key) {
  const row = entitlements.find(item => item.key === key);
  if (!row?.enabled) return 0;
  if (row.unlimited === true) return Infinity;
  return Number.isSafeInteger(row.value) && row.value >= 0 ? row.value : 0;
}
function check(entitlements, kind, before, after) {
  const def = definitions[kind], maximum = quota(entitlements, def.key);
  if (after > before && after > maximum) throw failure(`${def.label}已达到当前套餐上限`, 'TOOL_QUOTA_EXCEEDED', 409,
    { tool: kind, entitlementKey: def.key, used: before, requested: after - before, limit: Number.isFinite(maximum) ? maximum : null });
}
function validate(kind, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || JSON.stringify(data).length > 4000000) throw failure('工具数据无效或过大');
  const rows = kind === 'memo' ? data.notes : kind === 'corner' ? data.groups : data.calendarV2?.tasks || [];
  if (!Array.isArray(rows) || rows.length > 50000 || rows.some(row => !row || typeof row.id !== 'string' || !row.id || row.id.length > 180) || new Set(rows.map(row => row.id)).size !== rows.length) throw failure('工具条目无效或重复');
  if (kind === 'todo' && rows.some(row => typeof row.done !== 'boolean')) throw failure('事项完成状态无效');
}
function saveTool(user, entitlements, input) {
  const { tool, data, revision, initialize } = input, def = definitions[tool];
  if (!def?.count) throw failure('未知工具');
  validate(tool, data);
  user.toolData ||= {};
  const previous = user.toolData[tool];
  if (previous && initialize) return { ...previous, imported: false };
  if ((previous?.revision || 0) !== revision) throw failure('其他窗口已更新内容，请保留输入并重新打开', 'TOOL_REVISION_CONFLICT', 409);
  // One-time import preserves pre-quota local content, including existing overage.
  // Every subsequent write is checked against the stored authoritative document.
  if (previous || !initialize) check(entitlements, tool, previous ? def.count(previous.data) : 0, def.count(data));
  const result = { revision: (previous?.revision || 0) + 1, data: structuredClone(data) };
  user.toolData[tool] = result;
  return { ...result, imported: !previous };
}
const dayFor = now => new Date(now + 8 * 3600000).toISOString().slice(0, 10);
function daily(user, entitlements, input, now = Date.now()) {
  const { tool, action, requestId, amount = 1 } = input;
  if (!['icons', 'colors'].includes(tool) || !['reserve', 'commit', 'cancel'].includes(action) || typeof requestId !== 'string' || !/^[\w-]{8,100}$/.test(requestId)) throw failure('使用请求无效');
  const today = dayFor(now);
  user.toolUsage ||= {};
  // Keep yesterday's receipts to settle requests crossing midnight without charging today.
  for (const date of Object.keys(user.toolUsage)) if (date < dayFor(now - 86400000)) delete user.toolUsage[date];
  const ledger = user.toolUsage[today] ||= { icons: {}, colors: {} };
  let date = today, rows = ledger[tool], receipt = rows[requestId];
  for (const [key, value] of Object.entries(user.toolUsage)) if (value[tool]?.[requestId]) { date = key; rows = value[tool]; receipt = rows[requestId]; break; }
  if (action === 'reserve') {
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 10000) throw failure('使用数量无效');
    if (receipt) {
      if (receipt.amount !== amount || receipt.status === 'cancelled') throw failure('该请求已处理，请重新操作');
    } else {
      const used = Object.values(rows).reduce((sum, item) => sum + (item.status === 'cancelled' ? 0 : item.amount), 0);
      check(entitlements, tool, used, used + amount);
      receipt = rows[requestId] = { amount, status: 'reserved', createdAt: now };
    }
  } else {
    if (!receipt) throw failure('使用记录不存在');
    if (receipt.status === 'reserved') receipt.status = action === 'commit' ? 'committed' : 'cancelled';
    else if (action === 'commit' && receipt.status === 'cancelled') throw failure('使用请求已取消');
  }
  const used = Object.values(rows).reduce((sum, item) => sum + (item.status === 'cancelled' ? 0 : item.amount), 0), limit = quota(entitlements, definitions[tool].key);
  return { requestId, status: receipt.status, tool, date, used, limit: Number.isFinite(limit) ? limit : null, resetsAt: new Date(Date.parse(today + 'T00:00:00+08:00') + 86400000).toISOString() };
}
module.exports = { definitions, quota, check, saveTool, daily, dayFor };
