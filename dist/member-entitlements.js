// Shared feature decisions. Account access publishes the current user's server-owned
// snapshot; the public plan catalog is used only for badges and benefit descriptions.
(() => {
  'use strict';
  const category = key => key.startsWith('atlas-') ? 'atlas' : key === 'themes' ? 'themes' : key.startsWith('share-') ? 'share' : key.startsWith('corner-') ? 'corner' : key.startsWith('space-') ? 'space' : key === 'scene-limit' ? 'scene' : key === 'group-limit' ? 'group' : 'personal';
  const normalize = value => String(value ?? '').trim().toLowerCase();
  const snapshot = () => window.__shiyuUserEntitlements || { ready: false, entitlements: [] };
  const entries = value => Array.isArray(value) ? value : [];
  const plans = () => entries(window.__shiyuMemberCatalog?.plans || window.__shiyuMemberCatalog?.items).filter(p => p.enabled !== false);
  const freePlan = () => plans().find(p => p.id === 'free');
  const paidPlans = () => plans().filter(p => p.id !== 'free');
  const find = (list, key) => entries(list).find(b => b.key === key);
  const resourceNames = { themes: 'themes', 'global-fonts': 'fonts', 'global-colors': 'colors', 'global-layouts': 'layouts', 'regular-styles': 'styles', 'corner-colors': 'cornerColors' };
  let catalog = { resources: {}, items: [] }, catalogReady = false, decorateQueued = false, refreshing = null;
  function options(key) { return entries(catalog.resources?.[resourceNames[key]] || find(catalog.items, key)?.options); }
  function available(key, value) {
    if (value === undefined) return true;
    if (resourceNames[key] && !catalogReady) return false;
    const option = options(key).find(item => normalize(item.id) === normalize(value));
    return !!option && option.enabled !== false;
  }
  function grants(benefits, key, value) {
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
    if (!item?.enabled || item.kind !== 'quantity' || item.value === '' || !Number.isFinite(Number(item.value)) || Number(item.value) < 0) return null;
    return Math.floor(Number(item.value));
  }
  function limit(kind) { return snapshot().ready === true ? quantity(snapshot().entitlements, kind + '-limit') : null; }
  function requireQuota(kind, count, addition = 1) {
    const maximum = limit(kind);
    if (maximum !== null && Number(count) + addition <= maximum) return true;
    if (snapshot().ready !== true) { toast('正在读取权益，请稍后再试'); return false; }
    const canUpgrade = paidPlans().some(plan => (quantity(plan.entitlements, kind + '-limit') ?? -1) >= Number(count) + addition);
    if (canUpgrade) memberGate(category(kind + '-limit'), { entitlementKey: kind + '-limit' });
    else toast(maximum === null ? '当前方案暂未开放这项额度' : '已达到当前方案的数量上限');
    return false;
  }
  function requirements(button) {
    const d = button.dataset, key = d.pref;
    if (['font', 'width'].includes(key)) return [[key === 'font' ? 'global-fonts' : 'global-layouts', d.value]];
    if (key === 'color') { const listed = options('global-colors').some(o => normalize(o.id) === normalize(d.value)) || (typeof PALETTES !== 'undefined' && PALETTES.some(([id]) => normalize(id) === normalize(d.value))); return [[listed ? 'global-colors' : 'global-custom-color', listed ? d.value : undefined]]; }
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
  const selector = '[data-pref="font"],[data-pref="width"],[data-pref="color"],[data-preference-mode],[data-space-font],[data-space-width],[data-space-color],[data-custom-color],[data-link-view],[data-display-scope],[data-corner-color],[data-corner-custom]';
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
      mark(button, requirements(button).some(([key, value]) => premium(key, value)), button.matches('[data-corner-color],[data-corner-custom]') ? 'corner-member-badge' : 'membership-badge');
    });
    document.querySelectorAll('#display-scope-dialog [data-space-settings-tab]').forEach(button => {
      const field = { font: 'font', layout: 'width', colors: 'color' }[button.dataset.spaceSettingsTab];
      button.querySelector('[data-member-space-appearance]')?.remove();
      mark(button, !!field && !unifiedField(field) && premium('space-' + ({ font: 'font', width: 'layout', color: 'color' }[field])));
    });
    document.querySelectorAll('[data-at-dimension],[data-at-view],[data-at="toggle-dimension"]').forEach(button => {
      const mode = button.dataset.atDimension || (button.dataset.atView ? (['spatial', 'solar', 'systems'].includes(button.dataset.atView) ? '3d' : '2d') : document.querySelector('#space-atlas .at-shell')?.dataset.mode === '3d' ? '2d' : '3d');
      mark(button, premium('atlas-' + mode));
    });
    document.querySelectorAll('[data-space-mode="atlas"]').forEach(button => mark(button, premium('atlas-2d')));
    document.querySelectorAll('[data-entitlement-key]').forEach(button => mark(button, premium(button.dataset.entitlementKey)));
  }
  function queueDecorate() { if (decorateQueued) return; decorateQueued = true; queueMicrotask(() => { decorateQueued = false; decorate(); }); }
  window.ShiyuEntitlements = { snapshot, allows, require: requireFeature, premium, grants, options, plans, freePlan, paidPlans, quantity, limit, requireQuota, requirements, decorate, mark, category };
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
    refreshing = fetch('/api/shiyu/plans/catalog', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(value => {
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
