// Published plans provide display values; the authenticated snapshot provides access.
(() => {
 'use strict';
 let plans = [], selectedId = null, loading = true, refreshing = null;
 const expandedBenefits = new Set();
 const resourceKeys = { '首页主题': 'themes', '字体选择': 'global-fonts', '配色选择': 'global-colors', '页面布局': 'global-layouts', '网址展示样式': 'regular-styles', '常用卡片': 'corner-colors' };
 const attr = value => esc(String(value)).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
 const publish = (ready = true) => { window.__shiyuMemberCatalog = { ready, plans }; window.dispatchEvent(new CustomEvent('shiyu-member-catalog', { detail: window.__shiyuMemberCatalog })); };
 const original = openMemberCenter;
 const benefit = (plan, key) => plan.entitlements?.find(item => item.key === key);
 function selectedText(plan, key) {
  const item = benefit(plan, key), options = window.ShiyuEntitlements?.options(key).filter(option => option.enabled !== false) || [];
  if (!window.__shiyuMemberResources) return '正在读取';
  const values = item?.enabled && Array.isArray(item.value) ? item.value.map(value => String(value).toLowerCase()) : [];
  const count = options.filter(option => values.includes(String(option.id).toLowerCase())).length;
  return count ? (count === options.length ? '全部 ' : '') + count + ' 种' : '—';
 }
 function quantityText(plan, key) { const item = benefit(plan, key); return item?.enabled && Number.isFinite(Number(item.value)) ? item.value + ' ' + (item.unit || '个') : '—'; }
 function groupedText(plan, pairs, fallback = '—') { return pairs.filter(([key]) => benefit(plan, key)?.enabled).map(([, label]) => label).join('、') || fallback; }
 const rows = [
  ['主题与个性化', '首页主题', plan => selectedText(plan, 'themes')],
  ['', '字体选择', plan => selectedText(plan, 'global-fonts')],
  ['', '配色选择', plan => selectedText(plan, 'global-colors') + (benefit(plan, 'global-custom-color')?.enabled ? ' · 支持自定义' : '')],
  ['', '页面布局', plan => selectedText(plan, 'global-layouts')],
  ['', '网址展示样式', plan => selectedText(plan, 'regular-styles')],
  ['收藏与空间', '可拥有空间', plan => quantityText(plan, 'space-limit')],
  ['', '每个空间的场景', plan => quantityText(plan, 'scene-limit')],
  ['', '每个场景的分组', plan => quantityText(plan, 'group-limit')],
  ['', '常用卡片', plan => quantityText(plan, 'corner-limit') + (benefit(plan, 'corner-colors')?.enabled && benefit(plan, 'corner-colors')?.value?.length > 1 ? ' · 更多配色' : '')],
  ['', '空间独立设置', plan => groupedText(plan, [['space-font', '字体'], ['space-layout', '布局'], ['space-color', '配色']], '跟随全局')],
  ['', '样式设置范围', plan => groupedText(plan, [['space-style-scene', '按场景'], ['space-style-group', '按分组']], '全空间统一')],
  ['浏览与分享', '关系图谱', plan => groupedText(plan, [['atlas-2d', '2D'], ['atlas-3d', '3D']])],
  ['', '分享保护', plan => groupedText(plan, [['share-password', '访问密码'], ['share-expiry', '有效期']], '公开分享')],
 ];
 function resourceOptions(key) {
  const options = (window.ShiyuEntitlements?.options(key) || []).filter(option => option.enabled !== false);
  return key === 'global-colors' ? [...options.filter(option => option.id !== 'custom'), { id: 'custom', name: '自定义配色', preview: { kind: 'color', color: 'custom' } }] : options;
 }
 function includesResource(plan, key, id) {
  const item = benefit(plan, key === 'global-colors' && id === 'custom' ? 'global-custom-color' : key);
  return !!item?.enabled && (key === 'global-colors' && id === 'custom' || Array.isArray(item.value) && item.value.some(value => String(value).toLowerCase() === String(id).toLowerCase()));
 }
 function paintComparison(table, columns) {
  const focusedKey = table.contains(document.activeElement) ? document.activeElement.dataset.benefitToggle : null;
  table.innerHTML = `<thead><tr><th>功能权益</th>${plans.map(plan => `<th>${esc(plan.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(([group, name, summary]) => {
   const key = resourceKeys[name], expanded = expandedBenefits.has(key);
   const toggle = key ? `<button type="button" class="member-benefit-toggle" data-benefit-toggle="${key}" aria-expanded="${expanded}" aria-label="${expanded ? '收起' : '展开'}${name === '常用卡片' ? '常用卡片配色' : name}明细">${expanded ? '收起' : '展开'}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button>` : '';
   const summaryRow = `<tr${key ? ` data-benefit-key="${key}"` : ''}><th scope="row"><span class="benefit-category">${esc(group)}</span><span class="member-benefit-title">${esc(name)}${toggle}</span></th>${plans.map(plan => `<td class="${plan.id === selectedId ? 'selected-entitlement' : ''}">${esc(summary(plan))}</td>`).join('')}</tr>`;
   if (!key || !expanded) return summaryRow;
   const options = resourceOptions(key);
   const details = options.map(option => `<tr class="member-resource-detail" data-benefit-detail="${key}" data-resource-id="${attr(option.id)}"><th scope="row"><span class="member-resource-label"><span class="member-resource-preview" data-resource-preview aria-hidden="true"></span><span>${esc(option.name)}</span></span></th>${plans.map(plan => {
    const included = includesResource(plan, key, option.id), label = included ? '包含' : '不包含';
    return `<td data-included="${included}" class="${plan.id === selectedId ? 'selected-entitlement' : ''}"><span class="member-resource-check" role="img" aria-label="${label}" title="${label}">${included ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7"/></svg>' : ''}</span></td>`;
   }).join('')}</tr>`).join('');
   return summaryRow + (details || `<tr class="member-resource-detail"><th scope="row">暂无可用项目</th>${plans.map(() => '<td>—</td>').join('')}</tr>`);
  }).join('')}</tbody>`;
  table.querySelectorAll('tr').forEach(row => row.style.gridTemplateColumns = columns);
  table.querySelectorAll('[data-benefit-detail]').forEach(row => {
   const option = resourceOptions(row.dataset.benefitDetail).find(item => String(item.id) === row.dataset.resourceId);
   const preview = row.querySelector('[data-resource-preview]'), style = option?.preview;
   if (style?.kind === 'font') { preview.classList.add('font'); preview.style.fontFamily = style.family || 'inherit'; preview.textContent = 'Aa'; }
   else if (style?.color === 'custom' || option?.id === 'custom') preview.classList.add('custom');
   else if (style?.color && /^#[\da-f]{3,8}$/i.test(style.color)) { preview.classList.add('color'); preview.style.backgroundColor = style.color; }
   else preview.hidden = true;
  });
  if (focusedKey) table.querySelector(`[data-benefit-toggle="${focusedKey}"]`)?.focus({ preventScroll: true });
 }
 document.addEventListener('click', event => {
  const toggle = event.target.closest?.('#member-center [data-benefit-toggle]'); if (!toggle) return;
  const key = toggle.dataset.benefitToggle;
  if (expandedBenefits.has(key)) expandedBenefits.delete(key); else expandedBenefits.add(key);
  paintComparison(toggle.closest('table'), `var(--member-label-width, 280px) repeat(${plans.length},minmax(180px,1fr))`);
 });
 function syncMemberHeader() {
  const heading = document.querySelector('#member-center[open] .member-heading'); if (!heading) return;
  const current = window.__shiyuUserEntitlements; let message = '';
  if (current?.ready && current.member) {
   if (current.permanent) message = '永久会员 · 永久有效';
   else if (Number.isFinite(Number(current.expiresAt))) message = '会员有效期至 ' + new Date(Number(current.expiresAt)).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' });
  }
  let label = heading.querySelector('.member-current-status'); if (!message) { label?.remove(); return; }
  if (!label) { label = document.createElement('small'); label.className = 'member-current-status'; label.setAttribute('role', 'status'); heading.insertBefore(label, heading.querySelector(':scope > button,:scope > [data-shiyu-language]')); }
  label.textContent = message;
 }
 function paint() {
  syncMemberHeader(); const d = document.querySelector('#member-center'); if (!d?.open) return;
  const rail = d.querySelector('.member-plans'), table = d.querySelector('.member-comparison table'), checkout = d.querySelector('.member-checkout'); if (!rail || !table) return;
  if (!plans.length) { rail.textContent = loading ? '正在读取会员套餐…' : window.__shiyuMemberCatalog?.ready ? '暂无上架套餐' : '套餐暂时无法加载，请稍后重试。'; table.replaceChildren(); if (checkout) checkout.hidden = true; return; }
  const paid = plans.filter(plan => plan.id !== 'free'); if (checkout) checkout.hidden = !paid.length;
  selectedId = paid.some(plan => plan.id === selectedId) ? selectedId : paid[0]?.id || null;
  rail.querySelectorAll('button').forEach(button => button.remove());
  if (!rail.querySelector('.plan-label')) rail.innerHTML = '<div class="plan-label"><strong>可选套餐</strong><small>选择与你相伴的时光</small></div>';
  const columns = `var(--member-label-width, 280px) repeat(${plans.length},minmax(180px,1fr))`;
  rail.style.gridTemplateColumns = columns;
  plans.forEach(plan => {
   const button = document.createElement('button'), free = plan.id === 'free'; button.className = plan.id === selectedId ? 'selected-plan' : ''; button.setAttribute('aria-pressed', String(plan.id === selectedId)); button.dataset.publishedPlan = plan.id;
   button.innerHTML = `<small>${esc(plan.tag || '')}</small><h3>${esc(plan.name)}</h3><strong><em>¥</em>${Number(plan.price)}</strong><del>${plan.original > plan.price ? '¥' + Number(plan.original) : ''}</del><span>${esc(plan.cycle || (free ? '长期' : plan.days + ' 天'))}</span>`;
   button.disabled = free; if (free) button.title = '免费版仅作权益对比，无需购买';
   else button.onclick = () => { selectedId = plan.id; freeMemberSelected = false; selectedMemberPlan = MEMBER_CONFIG.plans.findIndex(item => item.id === plan.id); memberAgreed = false; openMemberCenter(); };
   rail.append(button);
  });
  paintComparison(table, columns);
  const selected = paid.find(plan => plan.id === selectedId), choice = d.querySelector('.checkout-choice');
  if (selected && choice) choice.innerHTML = `<b>${esc(selected.name)} · ${selected.days} 天</b><span class="checkout-price">¥${Number(selected.price)}</span>${selected.original > selected.price ? '<del>¥' + Number(selected.original) + '</del>' : ''}`;
  const statusNote = d.querySelector('.member-status>span:last-child'); if (statusNote) statusNote.textContent = '具体权益与有效期以所选套餐为准';
  const subtitle = d.querySelector(':scope > .member-sub'); if (subtitle) subtitle.textContent = '更多主题与收藏空间，选择适合你的相伴方式。';
 }
 openMemberCenter = function () { original(); paint(); };
 const originalHeader = updateHeader; updateHeader = function (...args) { const result = originalHeader.apply(this, args); syncMemberHeader(); return result; };
 async function refresh() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
   try {
    const response = await fetch('/api/shiyu/plans', { cache: 'no-store' }); if (!response.ok) throw Error();
    const data = await response.json(), next = (data.items || []).filter(plan => plan.enabled !== false); loading = false;
    if (JSON.stringify(plans) === JSON.stringify(next) && window.__shiyuMemberCatalog?.ready) return;
    plans = next; const paid = plans.filter(plan => plan.id !== 'free'); selectedId = paid.some(plan => plan.id === selectedId) ? selectedId : paid[0]?.id || null;
    if (paid.length) { MEMBER_CONFIG.plans = paid.map(plan => ({ ...plan, auto: plan.autoRenew, saving: plan.cycle })); selectedMemberPlan = Math.max(0, paid.findIndex(plan => plan.id === selectedId)); freeMemberSelected = false; }
    publish(); if (document.querySelector('#member-center')?.open) { if (paid.length) openMemberCenter(); else paint(); }
   } catch { loading = false; if (!plans.length) publish(false); paint(); } finally { refreshing = null; }
  })(); return refreshing;
 }
 window.addEventListener('shiyu-member-resources', paint); window.addEventListener('shiyu-user-entitlements', syncMemberHeader); window.addEventListener('focus', refresh);
 paint(); void refresh(); setInterval(() => { if (!document.hidden) void refresh(); }, 15000);
})();
