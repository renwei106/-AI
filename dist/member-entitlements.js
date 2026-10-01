// Shared feature decisions. Account access publishes the current user's server-owned
// snapshot; the public plan catalog is used only for badges and benefit descriptions.
(() => {
  'use strict';
  const category = key => ({'memo-limit':'memo','todo-limit':'todo','icon-daily-limit':'icons','color-daily-limit':'colors'}[key]) || (key.startsWith('atlas-') ? 'atlas' : key === 'themes' ? 'themes' : key.startsWith('share-') ? 'share' : key.startsWith('corner-') ? 'corner' : key.startsWith('space-') ? 'space' : key === 'scene-limit' ? 'scene' : key === 'group-limit' ? 'group' : 'personal');
  const normalize = value => String(value ?? '').trim().toLowerCase();
  const snapshot = () => window.__shiyuUserEntitlements || { ready: false, entitlements: [] };
  const entries = value => Array.isArray(value) ? value : [];
  const plans = () => entries(window.__shiyuMemberCatalog?.plans || window.__shiyuMemberCatalog?.items).filter(p => p.enabled !== false);
  const freePlan = () => plans().find(p => p.id === 'free');
  const paidPlans = () => plans().filter(p => p.id !== 'free');
  const find = (list, key) => entries(list).find(b => b.key === key);
  const resourceNames = { themes: 'themes', 'global-fonts': 'fonts', 'global-colors': 'colors', 'global-layouts': 'layouts', 'regular-styles': 'styles', 'corner-colors': 'cornerColors', 'desktop-pets':'pets' };
  let catalog = { resources: {}, items: [] }, catalogReady = false, decorateQueued = false, refreshing = null;
  function options(key) { return entries(catalog.resources?.[resourceNames[key]] || find(catalog.items, key)?.options); }
  function available(key, value) {
    if (value === undefined) return true;
    if (resourceNames[key] && !catalogReady) return false;
    const option = options(key).find(item => normalize(item.id) === normalize(value));
    return !!option && option.enabled !== false;
  }
  function grants(benefits, key, value) {
    if (key === 'corner-colors') {
      if (['default','theme'].includes(value)) return true;
      const color = options(key).find(item => item.id === value)?.preview?.color || value;
      const [globalKey,globalValue] = colorRequirement(color);
      return grants(benefits,globalKey,globalValue);
    }
    const benefit = find(benefits, key);
    if (!benefit?.enabled || !available(key, value)) return false;
    if (benefit.kind !== 'selection') return value === undefined;
    const selected = Array.isArray(benefit.value) ? benefit.value : [benefit.value];
    return selected.some(id => normalize(id) === normalize(value));
  }
  function allows(key, value) { return snapshot().ready === true && grants(snapshot().entitlements, key, value); }
  function premium(key, value) { return !!window.__shiyuMemberCatalog?.ready && !grants(freePlan()?.entitlements, key, value) && paidPlans().some(plan => grants(plan.entitlements, key, value)); }
  function requireFeature(key, value, section = category(key), context = {}) {
    if (allows(key, value)) return true;
    if (snapshot().ready !== true || resourceNames[key] && !catalogReady) { toast('正在读取权益，请稍后再试'); return false; }
    if (premium(key, value) && typeof memberGate === 'function') memberGate(section, { entitlementKey: key, value, ...context });
    else toast('当前方案暂不支持此功能');
    return false;
  }
  function quantity(benefits, key) {
    const item = find(benefits, key);
    if (item?.enabled && item.kind === 'quantity' && item.unlimited === true) return Infinity;
    if (!item?.enabled || item.kind !== 'quantity' || item.value === '' || !Number.isFinite(Number(item.value)) || Number(item.value) < 0) return null;
    return Math.floor(Number(item.value));
  }
  function limit(kind) { return snapshot().ready === true ? quantity(snapshot().entitlements, kind + '-limit') : null; }
  function requireQuota(kind, count, addition = 1) {
    const maximum = limit(kind);
    if (maximum !== null && Number(count) + addition <= maximum) return true;
    if (snapshot().ready !== true) { toast('正在读取权益，请稍后再试'); return false; }
    if (['memo','todo','corner'].includes(kind)) { toolExceeded(kind, {used:Number(count),requested:addition,limit:maximum}); return false; }
    const canUpgrade = paidPlans().some(plan => (quantity(plan.entitlements, kind + '-limit') ?? -1) >= Number(count) + addition);
    if (canUpgrade) memberGate(category(kind + '-limit'), { entitlementKey: kind + '-limit' });
    else toast(maximum === null ? '当前方案暂未开放这项额度' : '已达到当前方案的数量上限');
    return false;
  }
  function toolExceeded(tool, context = {}) {
    const key = { memo:'memo-limit',todo:'todo-limit',corner:'corner-limit',icons:'icon-daily-limit',colors:'color-daily-limit' }[tool];
    const needed = Number(context.used || 0) + Number(context.requested || 1);
    const canUpgrade = paidPlans().some(plan => (quantity(plan.entitlements, key) ?? -1) >= needed && (context.limit === null || (quantity(plan.entitlements, key) ?? -1) > Number(context.limit ?? -1)));
    memberGate(tool, { ...context, entitlementKey:key, quotaExceeded:true, canUpgrade });
  }
  function colorRequirement(value) {
    const color = options('global-colors').find(option => [option.id,option.preview?.color].some(id => normalize(id) === normalize(value)));
    return color ? ['global-colors',color.id] : ['global-custom-color'];
  }
  function requirements(button) {
    const d = button.dataset, key = d.pref;
    if (['font', 'width'].includes(key)) return [[key === 'font' ? 'global-fonts' : 'global-layouts', d.value]];
    if (key === 'color') return [colorRequirement(d.value)];
    if (d.petPref === 'skin') return [['desktop-pets',d.value]];
    if (d.preferenceMode && d.value === 'space') return [['space-' + ({ font: 'font', width: 'layout', color: 'color' }[d.preferenceMode])]];
    if (d.spaceFont) return [['space-font'], ['global-fonts', d.spaceFont]];
    if (d.spaceWidth) return [['space-layout'], ['global-layouts', d.spaceWidth]];
    if (d.spaceColor) return [['space-color'], ...requirements({ dataset: { pref: 'color', value: d.spaceColor } })];
    if (d.customColor) return [...(d.customColor === 'space' ? [['space-color']] : []), ['global-custom-color']];
    if (d.linkView) return [['regular-styles', d.linkView]];
    if (['scene', 'group'].includes(d.displayScope)) return [['space-style-' + d.displayScope]];
    if (d.cornerColor) return [['corner-colors', d.cornerColor]];
    if (button.hasAttribute('data-corner-custom')) return [['corner-colors', 'custom']];
    return [];
  }
  const selector = '[data-pref="font"],[data-pref="width"],[data-pref="color"],[data-preference-mode],[data-space-font],[data-space-width],[data-space-color],[data-custom-color],[data-link-view],[data-display-scope],[data-corner-color],[data-corner-custom],[data-pet-pref="skin"]';
  function badgeMarkup() { try { return MEMBER_VISUAL_CONFIG.badge; } catch { return ''; } }
  function mark(button, paid, badgeClass = 'membership-badge') {
    let badge = button.querySelector('[data-entitlement-badge]');
    if (!paid) { badge?.remove(); return; }
    const markup = badgeMarkup(); if (!markup) return;
    if (!badge) { badge = document.createElement('span'); badge.className = badgeClass; badge.dataset.entitlementBadge = ''; badge.title = '会员权益'; badge.setAttribute('aria-label', '会员权益'); button.append(badge); }
    if (badge.dataset.entitlementSvg !== markup) { badge.innerHTML = markup; badge.dataset.entitlementSvg = markup; }
  }
  function decorate() {
    document.querySelectorAll(selector).forEach(button => {
      button.querySelectorAll('.membership-badge:not([data-entitlement-badge]),.corner-member-badge:not([data-entitlement-badge])').forEach(old => old.remove());
      mark(button, button.dataset.petPref !== 'skin' && requirements(button).some(([key, value]) => premium(key, value)), button.matches('[data-corner-color],[data-corner-custom]') ? 'corner-member-badge' : 'membership-badge');
    });
    document.querySelectorAll('#display-scope-dialog [data-space-settings-tab]').forEach(button => {
      const field = { font: 'font', layout: 'width', colors: 'color' }[button.dataset.spaceSettingsTab];
      button.querySelector('[data-member-space-appearance]')?.remove();
      mark(button, !!field && !unifiedField(field) && premium('space-' + ({ font: 'font', width: 'layout', color: 'color' }[field])));
    });
    document.querySelectorAll('.at-layout-menu [data-at-view]').forEach(button => {
      const mode = ['spatial', 'solar', 'systems'].includes(button.dataset.atView) ? '3d' : '2d';
      mark(button, premium('atlas-' + mode));
    });
    document.querySelectorAll('[data-space-mode="atlas"]').forEach(button => mark(button, premium('atlas-2d')));
    document.querySelectorAll('[data-entitlement-key]').forEach(button => mark(button, premium(button.dataset.entitlementKey)));
  }
  function queueDecorate() { if (decorateQueued) return; decorateQueued = true; queueMicrotask(() => { decorateQueued = false; decorate(); }); }
  window.ShiyuEntitlements = { snapshot, allows, require: requireFeature, premium, grants, options, plans, freePlan, paidPlans, quantity, limit, requireQuota, toolExceeded, requirements, decorate, mark, category };
  window.addEventListener('click', event => {
    const button = event.target.closest?.(selector); if (!button) return;
    const needed = requirements(button), section = needed.some(([key]) => key.startsWith('space-')) ? 'space' : undefined;
    for (const [key, value] of needed) if (!allows(key, value)) { event.preventDefault(); event.stopImmediatePropagation(); requireFeature(key, value, section || category(key)); return; }
  }, true);
  for (const event of ['shiyu-user-entitlements', 'shiyu-member-catalog']) window.addEventListener(event, queueDecorate);
  function start() {
    new MutationObserver(queueDecorate).observe(document.body, { childList: true, subtree: true });
    queueDecorate();
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
  function refreshResources() {
    if (refreshing) return refreshing;
    refreshing = fetch('/api/shiyu/plans/catalog', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(raw => {
     const value=window.ShiyuI18n?.catalog(raw)||raw;
      if (!value || catalogReady && JSON.stringify(value) === JSON.stringify(catalog)) return;
      catalog = value; catalogReady = true; window.__shiyuMemberResources = value; queueDecorate(); window.dispatchEvent(new Event('shiyu-member-resources'));
    }).catch(() => {}).finally(() => { refreshing = null; });
    return refreshing;
  }
  window.addEventListener('focus', refreshResources);
  window.addEventListener('shiyu-member-catalog', refreshResources);
  setInterval(() => { if (!document.hidden) void refreshResources(); }, 15000);
  void refreshResources();
})();

/* Persist tool documents through the existing signed-in account service. */
(() => {
  const sessions = new Map(), clone = value => structuredClone(value);
  const userId = () => signed ? prefs.accountProfile?.id : null;
  const counts = { memo: data => (data.notes || []).filter(n => !n.deletedAt).length, todo: data => (data.calendarV2?.tasks || []).filter(t => !t.deletedAt && !t.done).length, corner: data => (data.groups || []).filter(g => g.system !== 'inbox').length };
  const replace = (target, value) => { for (const key of Object.keys(target)) delete target[key]; Object.assign(target, clone(value)); };
  function backup(tool, id, data) { try { localStorage.setItem(`shiyu-tool-recovery:${id}:${tool}`, JSON.stringify(data)); } catch {} }
  async function request(body, id) {
    const response = await fetch('/api/shiyu/auth/tools', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, userId: id }) });
    const result = await response.json();
    if (!response.ok) throw Object.assign(Error(result.message || '保存失败，请重试'), result);
    if (id !== userId() || result.userId !== id) throw Error('账号已切换，请重新打开');
    return result;
  }
  function ready(tool) { return sessions.get(`${userId()}:${tool}`)?.ready === true; }
  async function open(tool, library) {
    const id = userId(); if (!id) throw Error('请先登录');
    const key = `${id}:${tool}`;
    if (sessions.get(key)?.ready && sessions.get(key).library === library) return;
    if (sessions.get(key)?.loading) return sessions.get(key).loading;
    const state = { ready: false, library, revision: 0, saved: null, queue: Promise.resolve() }; sessions.set(key, state);
    state.loading = (async () => {
      const response = await fetch('/api/shiyu/auth/tools', { credentials: 'same-origin', cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || id !== userId() || result.userId !== id) throw Error(result.message || '无法读取账号工具数据');
      let document = result.tools?.[tool];
      if (!document) document = await request({ tool, data: library, revision: 0, initialize: true }, id);
      if (JSON.stringify(document.data) !== JSON.stringify(library)) backup(tool, id, library);
      replace(library, document.data); state.revision = document.revision; state.saved = clone(document.data); state.ready = true;
      persist();
    })().catch(error => { sessions.delete(key); throw error; });
    return state.loading;
  }
  async function save(tool, next) {
    const id = userId(), state = sessions.get(`${id}:${tool}`);
    if (!state?.ready) { toast('正在读取工具数据，请稍后重试'); return false; }
    const snapshot = clone(next), task = async () => {
      if (id !== userId() || !state.ready) return false;
      const before = counts[tool](state.saved), after = counts[tool](snapshot);
      if (after > before && !window.ShiyuEntitlements.requireQuota(tool, before, after - before)) {
        backup(tool, id, snapshot); replace(state.library, state.saved); persist(); return false;
      }
      try {
        const result = await request({ tool, data: snapshot, revision: state.revision }, id);
        state.saved = clone(result.data); state.revision = result.revision;
        return true;
      } catch (error) {
        backup(tool, id, snapshot);
        if (id === userId()) {
          replace(state.library, state.saved); persist();
          if (error.code === 'TOOL_REVISION_CONFLICT') { state.ready = false; sessions.delete(`${id}:${tool}`); }
          if (error.code === 'TOOL_QUOTA_EXCEEDED') window.ShiyuEntitlements.toolExceeded(tool, error);
          else toast(error.message);
        }
        return false;
      }
    };
    state.queue = state.queue.then(task, task); return state.queue;
  }
  // The existing common-card editor saves synchronously. Sync its changes without
  // changing that editor; restore the last accepted document on a rejected write.
  let timer;
  const originalPersist = persist;
  persist = function () {
    const result = originalPersist(); clearTimeout(timer);
    const id = userId(), state = sessions.get(`${id}:corner`);
    if (state?.ready && JSON.stringify(state.library) !== JSON.stringify(state.saved)) timer = setTimeout(async () => {
      const next = clone(state.library); if (!await save('corner', next)) window.dispatchEvent(new Event('shiyu-tool-rollback'));
    }, 300);
    return result;
  };
  window.ShiyuToolData = { open, ready, save };
  window.addEventListener('shiyu-account-state', () => { clearTimeout(timer); sessions.clear(); });
})();
