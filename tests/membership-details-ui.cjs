'use strict';
// Isolated read-only UI regression. No request is allowed to write real account or payment data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { getCatalog, normalizePlan } = require('../../聚合管理后台/membership/plan-store.cjs');
const clone = value => JSON.parse(JSON.stringify(value));
const catalog = getCatalog();
const keyToResource = { themes: 'themes', 'global-fonts': 'fonts', 'global-colors': 'colors', 'global-layouts': 'layouts', 'regular-styles': 'styles', 'corner-colors': 'cornerColors' };
for (const name of Object.values(keyToResource)) {
 const source = catalog.resources[name].filter(item => item.enabled !== false);
 catalog.resources[name] = source.slice(0, name === 'layouts' ? 2 : 3);
 if (name === 'cornerColors') catalog.resources[name].push(source.find(item => item.id === 'custom'));
 catalog.resources[name].push({ id: 'qa-disabled-' + name, name: '已下线的测试资源', enabled: false });
}
for (const [key, resource] of Object.entries(keyToResource)) catalog.items.find(item => item.key === key).options = catalog.resources[resource];
function set(plan, key, value, enabled = true) { Object.assign(plan.entitlements.find(item => item.key === key), { value, enabled }); }
function makePlan(id, name, days, price, count) {
 const plan = normalizePlan({ id, name, days, price, original: price, cycle: days ? days + ' 天' : '长期', tag: '', enabled: true, entitlements: [] }, catalog);
 for (const [key, resource] of Object.entries(keyToResource)) set(plan, key, catalog.resources[resource].filter(item => item.enabled !== false).slice(0, count).map(item => item.id).concat('qa-obsolete-id'));
 return plan;
}
const free = makePlan('free', '免费版', 0, 0, 1), monthly = makePlan('monthly', '月度会员', 30, 10, 2), yearly = makePlan('yearly', '年度会员', 365, 99, 99);
set(free, 'global-custom-color', '✓', false);
set(monthly, 'global-custom-color', '✓', true);
set(yearly, 'global-custom-color', '✓', false);
set(monthly, 'global-layouts', ['safe', 'wide'], false); // Selected IDs do not grant a disabled entitlement.
const plans = [free, monthly, yearly];
const workspace = [{ id: 'work', name: '工作空间', icon: 'folder', scenes: [{ id: 'daily', name: '日常', groups: [{ id: 'tools', name: '常用', items: [] }] }] }];
const prefs = { theme: 'base', mode: 'light', color: '#48614c', font: 'youfeng', width: 'safe', explicitFont: true, inspirationMockV1: true, firstSpaceCapacityV1: true, twelveSpacePreviewAdded: true, accountProfile: { id: 'qa-membership-details', name: '明细测试用户', email: 'qa@example.test' }, accountDataUserId: 'qa-membership-details', cornerCollections: { 'qa-membership-details': { stageVersion: 2, groups: [{ id: 'inbox', name: '暂存', system: 'inbox', refs: [] }] } } };
const snapshot = () => ({ member: true, permanent: true, expiresAt: null, planId: monthly.id, planName: monthly.name, entitlements: monthly.entitlements });
const output = path.resolve('.local/member-details-qa');
fs.mkdirSync(output, { recursive: true });
const errors = [], writes = [], contexts = [];
let browser;
const fulfill = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
async function pageFor(viewport = { width: 1440, height: 1000 }) {
 const context = await browser.newContext({ viewport, reducedMotion: 'reduce' }); contexts.push(context);
 await context.addInitScript(({ workspace, prefs }) => {
  if (!/^https?:$/.test(location.protocol)) return;
  localStorage.setItem('yiyu-prototype-v1', JSON.stringify({ data: workspace, prefs, signed: true, styles: {}, overrides: {} }));
 }, { workspace, prefs });
 await context.route('**/api/**', async route => {
  const request = route.request(), url = new URL(request.url()), method = request.method();
  if (!['GET', 'HEAD'].includes(method)) { writes.push({ method, path: url.pathname }); return fulfill(route, { ok: true }); }
  // The page embeds locale settings at render time. Preserve the same read-only
  // response on focus; an empty mock would intentionally trigger i18n's reload.
  if (url.pathname === '/api/shiyu/i18n/public') return route.continue();
  if (url.pathname === '/api/shiyu/plans') return fulfill(route, { schemaVersion: 2, items: plans });
  if (url.pathname === '/api/shiyu/plans/catalog') return fulfill(route, catalog);
  if (url.pathname === '/api/shiyu/auth/session') return fulfill(route, { authenticated: true, user: { id: prefs.accountProfile.id, name: prefs.accountProfile.name, email: prefs.accountProfile.email, member: true, permanent: true, memberExpiresAt: '永久', membership: snapshot() } });
  if (url.pathname === '/api/shiyu/auth/account') return fulfill(route, { data: workspace });
  if (url.pathname === '/api/shiyu/theme-access') return fulfill(route, { member: true, fallback: 'base', items: catalog.resources.themes.filter(item => item.enabled !== false).map(item => ({ ...item, memberOnly: item.id !== 'base', allowed: true })), previews: {} });
  if (url.pathname === '/api/shiyu/payments/status') return fulfill(route, { enabled: false, providers: {} });
  if (url.pathname === '/api/shiyu/payments/account') return fulfill(route, { member: true, membership: snapshot() });
  if (url.pathname === '/api/shiyu/auth/invitations') return fulfill(route, { enabled: false, config: null, items: [] });
  if (url.pathname === '/api/shiyu/member-visual') return fulfill(route, { badgeSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 7 4 4 5-7 5 7 4-4-2 13H5Z"/></svg>' });
  return fulfill(route, { items: [] });
 });
 const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
 await page.goto('http://127.0.0.1:4318/?page=membership');
 await page.waitForFunction(() => window.__shiyuMemberCatalog?.ready && window.__shiyuMemberResources && window.__shiyuUserEntitlements?.ready);
 await page.waitForSelector('[data-benefit-toggle="themes"]');
 await page.waitForTimeout(500); // Drain the existing account bootstrap before checking view-only operations.
 return page;
}
const toggle = (page, key) => page.locator(`[data-benefit-toggle="${key}"]`);
const details = (page, key) => page.locator(`[data-benefit-detail="${key}"]:visible`);
async function waitExpanded(page, key, expanded) {
 await page.waitForFunction(({ key, expanded }) => document.querySelector('#member-center')?.open && document.querySelector(`[data-benefit-toggle="${key}"]`)?.getAttribute('aria-expanded') === String(expanded), { key, expanded });
 if (expanded) assert((await details(page, key).count()) > 0, key + ' has visible detail rows');
 else assert.equal(await details(page, key).count(), 0, key + ' is collapsed');
}
function optionsFor(key) {
 const options = catalog.resources[keyToResource[key]].filter(item => item.enabled !== false);
 return key === 'global-colors' ? [...options, { id: 'custom', name: '自定义配色' }] : options;
}
function includes(plan, key, id) {
 if (key === 'global-colors' && id === 'custom') return !!plan.entitlements.find(item => item.key === 'global-custom-color')?.enabled;
 const value = plan.entitlements.find(item => item.key === key);
 return !!value?.enabled && Array.isArray(value.value) && value.value.map(id => String(id).toLowerCase()).includes(id.toLowerCase());
}
async function checkRows(page, key) {
 const rows = await details(page, key).evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.resourceId, text: node.querySelector('th')?.textContent, cells: [...node.querySelectorAll('td')].map(cell => cell.dataset.included), controls: [...node.querySelectorAll('input,select,button')].filter(control => !control.disabled).length })));
 assert.deepEqual(rows.map(row => row.id), optionsFor(key).map(item => item.id), key + ' uses available resource order once');
 for (const row of rows) {
  assert(row.text?.trim(), key + '/' + row.id + ' has a user-facing name');
  assert.deepEqual(row.cells, plans.map(plan => String(includes(plan, key, row.id))), key + '/' + row.id + ' maps each plan to its column');
  assert.equal(row.controls, 0, 'Detail cells are read-only, not editable permissions');
 }
}
async function checkAlignment(page, key) {
 const result = await page.evaluate(key => {
  const cards = [...document.querySelectorAll('#member-center [data-published-plan]')].map(node => node.getBoundingClientRect());
  const rows = [...document.querySelectorAll(`[data-benefit-detail="${key}"]`)];
  return rows.map(row => [...row.querySelectorAll('td')].map((cell, index) => { const box = cell.getBoundingClientRect(), card = cards[index]; return card ? Math.abs(box.x + box.width / 2 - card.x - card.width / 2) : Infinity; }));
 }, key);
 assert(result.length > 0 && result.every(row => row.length === plans.length && row.every(offset => offset < 3)), 'Plan cards and ' + key + ' detail columns align: ' + JSON.stringify(result));
}
async function shoot(page, name) { await page.waitForTimeout(150); await page.screenshot({ path: path.join(output, name + '.png'), animations: 'disabled' }); }
(async () => {
 browser = await chromium.launch({ channel: 'msedge', headless: true });
 try {
  const page = await pageFor();
  const keys = Object.keys(keyToResource), initialWrites = writes.length;
  for (const key of keys) { assert.equal(await toggle(page, key).getAttribute('aria-expanded'), 'false'); assert.equal(await details(page, key).count(), 0); }
  assert.match(await page.locator('[data-benefit-key="global-fonts"]').innerText(), /1\s*种/);
  assert.match(await page.locator('[data-benefit-key="corner-colors"]').innerText(), /卡片|张/);
  for (const key of keys) {
   await toggle(page, key).click(); await waitExpanded(page, key, true); await checkRows(page, key); await checkAlignment(page, key);
   await toggle(page, key).click(); await waitExpanded(page, key, false);
  }
  await toggle(page, 'themes').focus(); await page.keyboard.press('Enter'); await waitExpanded(page, 'themes', true);
  await toggle(page, 'themes').focus(); await page.keyboard.press('Space'); await waitExpanded(page, 'themes', false);
  await toggle(page, 'global-fonts').click(); await toggle(page, 'global-colors').click();
  await page.locator('[data-published-plan="yearly"]').click();
  await waitExpanded(page, 'global-fonts', true); await waitExpanded(page, 'global-colors', true);
  await checkRows(page, 'global-fonts'); await checkAlignment(page, 'global-colors');
  await page.evaluate(() => { const center = document.querySelector('#member-center'); center.scrollTop = 0; center.scrollLeft = 0; });
  await shoot(page, 'details-light');

  // A new resource and a published entitlement change must update an already open list.
  const font = { id: 'qa-new-font', name: '新增测试字体', enabled: true, preview: { kind: 'font', family: 'sans-serif', sample: '拾起喜欢' } };
  catalog.resources.fonts.splice(catalog.resources.fonts.length - 1, 0, font);
  set(yearly, 'global-fonts', yearly.entitlements.find(item => item.key === 'global-fonts').value.concat(font.id));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(() => { const row = document.querySelector('[data-benefit-detail="global-fonts"][data-resource-id="qa-new-font"]'); return row && row.getBoundingClientRect().height > 0 && document.querySelector('#member-center').open; });
  await waitExpanded(page, 'global-fonts', true); await waitExpanded(page, 'global-colors', true); await checkRows(page, 'global-fonts');
  assert.match(await page.locator('[data-benefit-key="global-fonts"]').innerText(), /4\s*种/);
  catalog.resources.fonts[1].enabled = false;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(id => !document.querySelector(`[data-benefit-detail="global-fonts"][data-resource-id="${id}"]`), catalog.resources.fonts[1].id);
  await checkRows(page, 'global-fonts');
  await page.evaluate(() => { prefs.mode = 'dark'; prefs.color = '#8b83d1'; prefs.explicitColor = '#8b83d1'; apply(); openMemberCenter(); });
  await waitExpanded(page, 'global-fonts', true); await waitExpanded(page, 'global-colors', true);
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#member-center')).getPropertyValue('--accent').trim()), '#8b83d1');
  await checkAlignment(page, 'global-fonts');
  await page.evaluate(() => { const center = document.querySelector('#member-center'); center.scrollTop = 500; });
  await shoot(page, 'details-dark-purple');
  const beforeClick = await details(page, 'global-colors').first().locator('td').evaluateAll(nodes => nodes.map(node => node.dataset.included));
  await details(page, 'global-colors').first().locator('td').first().click();
  assert.deepEqual(await details(page, 'global-colors').first().locator('td').evaluateAll(nodes => nodes.map(node => node.dataset.included)), beforeClick);
  assert.equal(writes.length, initialWrites, 'Reading, expanding and selecting a plan must not create API writes');

  const mobile = await pageFor({ width: 390, height: 844 }); const mobileWrites = writes.length;
  await toggle(mobile, 'themes').click(); await toggle(mobile, 'global-colors').click(); await checkRows(mobile, 'themes');
  const metrics = await mobile.evaluate(() => { const c = document.querySelector('#member-center'), box = c.getBoundingClientRect(); return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, left: box.left, right: box.right, width: c.clientWidth, scroll: c.scrollWidth }; });
  assert(metrics.documentWidth <= metrics.viewport + 1 && metrics.left >= -1 && metrics.right <= metrics.viewport + 1, 'Mobile has no outer page overflow: ' + JSON.stringify(metrics));
  assert(metrics.scroll > metrics.width, 'The existing membership container allows horizontal comparison');
  await mobile.evaluate(() => { const c = document.querySelector('#member-center'); c.scrollLeft = c.scrollWidth; });
  assert((await mobile.locator('#member-center').evaluate(node => node.scrollLeft)) > 0);
  await checkAlignment(mobile, 'themes');
  await shoot(mobile, 'details-mobile-horizontal-scroll');
  await mobile.evaluate(() => { const c = document.querySelector('#member-center'); c.scrollLeft = 0; c.scrollTop = 440; });
  await shoot(mobile, 'details-mobile-resource-list');
  assert.equal(writes.length, mobileWrites, 'Mobile read-only viewing has no writes');
  assert.deepEqual(errors, []);
  console.log('PASS: six expandable resource groups; per-plan read-only included states; custom color flag; disabled/obsolete IDs hidden; card-column alignment; Enter/Space; expansion survives selection and live catalog changes; light/dark custom accent; mobile shared horizontal scroll and no outer overflow; no view-only API writes.');
  console.log('Screenshots: ' + output);
 } finally { await Promise.all(contexts.map(context => context.close())); await browser?.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
