/* Identity regression: all auth/account writes go to a private in-memory fixture.
 * Run against the local preview: node tests/account-session-ui.cjs
 * Optional --baseline serves the captured pre-fix scripts in .local/account-session-qa.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const store = require('../../聚合管理后台/membership/plan-store.cjs');
const baseline = process.argv.includes('--baseline');
const baseURL = process.env.SHIYU_PREVIEW_URL || 'http://127.0.0.1:4318/';
const out = path.resolve(__dirname, '../.local/account-session-qa');
fs.mkdirSync(out, { recursive: true });
const clone = value => JSON.parse(JSON.stringify(value));
const catalog = store.getCatalog();
const free = store.normalizePlan({ id: 'free', name: '免费版', enabled: true, price: 0, days: 0 });
const paid = store.normalizePlan({ id: 'monthly', name: '月度会员', enabled: true, price: 10, days: 30 });
const userFor = key => key ? {
  id: key === 'A' ? 'qa-phone-a' : 'qa-email-b', name: `测试账号${key}`,
  phone: key === 'A' ? '13800000001' : '', email: key === 'B' ? 'b@example.test' : '',
  avatar: 'person-male-calm', gender: 'private', profileCompleted: true,
  member: key === 'B', memberExpiresAt: key === 'B' ? '永久' : null,
  membership: { member: key === 'B', permanent: key === 'B', expiresAt: null,
    planId: key === 'B' ? paid.id : free.id, planName: key === 'B' ? paid.name : free.name,
    entitlements: (key === 'B' ? paid : free).entitlements },
} : null;
const dataFor = key => [{ id: 'work', name: `${key}_ONLY空间`, icon: 'folder', scenes: [
  { id: 'daily', name: '日常', groups: [{ id: 'tools', name: `${key}_ONLY分组`, items: [[`${key}_ONLY收藏`, `https://${key.toLowerCase()}.example.test`, '', '网']] }] },
] }];
const initial = { data: dataFor('B'), prefs: {
  theme: 'cosmos', mode: 'dark', font: 'youfeng', explicitFont: true,
  inspirationMockV1: true, firstSpaceCapacityV1: true, twelveSpacePreviewAdded: true,
  accountProfile: userFor('B'), accountDataUserId: 'qa-email-b', membership: userFor('B').membership,
}, signed: true, styles: {}, overrides: {} };
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, message, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await fn()) return; await sleep(40); }
  throw new Error(message);
}
async function fixture(browser, session = 'B') {
  const context = await browser.newContext({ viewport: { width: 1388, height: 1041 }, reducedMotion: 'reduce' });
  const f = { context, session, saved: { A: dataFor('A'), B: dataFor('B') }, requests: [], writes: [], errors: [],
    holds: [], armed: [], storageWrites: [] };
  f.holdNext = (pathname, page) => {
    const hold = { pathname, page, release: null, started: false };
    f.armed.push(hold); f.holds.push(hold); return hold;
  };
  await context.exposeBinding('__recordAccountStorage', ({ page }, value) => {
    f.storageWrites.push({ session: f.session, page: page.url(), value });
  });
  await context.addInitScript(state => {
    if (location.protocol !== 'http:') return;
    if (!localStorage.getItem('yiyu-prototype-v1')) localStorage.setItem('yiyu-prototype-v1', JSON.stringify(state));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      const result = original.call(this, key, value);
      if (this === localStorage && key === 'yiyu-prototype-v1') {
        try { window.__recordAccountStorage(JSON.parse(value)).catch(() => {}); } catch {}
      }
      return result;
    };
  }, initial);
  context.on('page', page => page.on('pageerror', error => f.errors.push(error.message)));
  if (baseline) for (const filename of ['account-access.js', 'v4.js', 'app.js', 'theme-availability.js']) {
    const source = fs.readFileSync(path.join(out, 'before-' + filename));
    await context.route(new RegExp('/' + filename.replaceAll('.', '\\.') + '(?:\\?|$)'), route => route.fulfill({ status: 200, contentType: 'application/javascript', body: source }));
  }
  await context.route('**/api/**', async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname, method = request.method();
    const owner = f.session, user = userFor(owner), page = request.frame().page();
    const body = method === 'GET' ? null : request.postDataJSON();
    f.requests.push({ pathname, method, owner });
    const holdIndex = f.armed.findIndex(item => item.pathname === pathname && (!item.page || item.page === page));
    if (holdIndex >= 0) {
      const hold = f.armed.splice(holdIndex, 1)[0];
      hold.started = true; hold.owner = owner;
      await new Promise(resolve => { hold.release = resolve; });
    }
    try {
      if (pathname === '/api/shiyu/auth/session') return json(route, user ? { authenticated: true, user } : { authenticated: false, entitlements: free.entitlements });
      if (pathname === '/api/shiyu/auth/login') {
        assert.equal(method, 'POST');
        if (body.credential === 'wrong-password' || body.credential === '000000') return json(route, { message: body.mode === 'code' ? '验证码不正确' : '密码不正确' }, 401);
        f.session = body.account === '13800000001' ? 'A' : 'B';
        return json(route, { authenticated: true, user: userFor(f.session), accountData: clone(f.saved[f.session]) });
      }
      if (pathname === '/api/shiyu/auth/logout') { assert.equal(method, 'POST'); f.session = null; return json(route, { ok: true }); }
      if (pathname === '/api/shiyu/auth/account') {
        if (!owner) return json(route, { message: '请先登录' }, 401);
        if (method === 'GET') return json(route, { userId: user.id, data: clone(f.saved[owner]) });
        assert.equal(method, 'PUT');
        f.writes.push({ owner, body: clone(body) });
        if (!baseline && body.userId !== user.id) return json(route, { code: 'ACCOUNT_SESSION_MISMATCH', message: '登录状态已变化' }, 409);
        f.saved[owner] = clone(body.data);
        return json(route, { ok: true, userId: user.id, data: clone(f.saved[owner]) });
      }
      if (pathname === '/api/shiyu/plans') return json(route, { items: [free, paid] });
      if (pathname === '/api/shiyu/plans/catalog') return json(route, catalog);
      if (pathname.startsWith('/api/shiyu/theme-access')) {
        const restricted = f.themeIsolation && owner !== 'B', trial = f.themeTrial && owner === 'B';
        const previews = trial ? { cosmos: { day: 'qa', started: true, active: true, remainingMs: 600000, expired: false } }
          : restricted ? { cosmos: { day: 'qa', started: true, active: false, remainingMs: 0, expired: true } } : {};
        return json(route, { member: !!user?.member, fallback: 'base', previews,
          items: catalog.resources.themes.map(item => ({ ...item, enabled: true, allowed: item.id !== 'cosmos' || !(restricted || trial), memberOnly: item.id === 'cosmos' && !!f.themeIsolation, qaOwner: owner })) });
      }
      if (pathname === '/api/shiyu/payments/status') return json(route, { enabled: false, providers: {} });
      if (pathname === '/api/shiyu/payments/account') return json(route, { member: !!user?.member, membership: user?.membership || null });
      if (pathname === '/api/shiyu/auth/invitations') return json(route, { enabled: false, items: [] });
      if (method !== 'GET') return json(route, { message: 'QA blocks real writes' }, 403);
      return route.continue(); // Preserve read-only i18n/config loading; fake i18n causes reloads.
    } catch (error) { if (!context._closed) f.errors.push(error.message); try { await route.abort(); } catch {} }
  });
  f.close = async () => { for (const hold of f.holds) hold.release?.(); await context.close(); };
  return f;
}
async function ready(page) {
  await page.waitForFunction(() => document.documentElement.classList.contains('shiyu-account-ready') && window.__shiyuMemberCatalog?.ready);
}
async function read(page) {
  return page.evaluate(() => ({ signed, id: prefs.accountProfile?.id || '', owner: prefs.accountDataUserId || '', data: JSON.stringify(data), stored: JSON.parse(localStorage.getItem('yiyu-prototype-v1') || 'null') }));
}
async function expectUser(page, key) {
  const id = userFor(key)?.id || '';
  try {
    await page.waitForFunction(({ id, marker }) => signed === !!id && (prefs.accountProfile?.id || '') === id && (!id || prefs.accountDataUserId === id && JSON.stringify(data).includes(marker)), { id, marker: `${key}_ONLY` });
  } catch (error) {
    console.error('identity expectation', key, await read(page), await page.locator('#login').innerText());
    throw error;
  }
  const state = await read(page);
  if (id) { assert(!state.data.includes(`${key === 'A' ? 'B' : 'A'}_ONLY`)); assert.equal(state.stored.prefs.accountProfile.id, id); }
  else assert.equal(state.stored.signed, false);
}
async function openPage(f, member = false) {
  const page = await f.context.newPage(); page.setDefaultTimeout(12000);
  await page.goto(baseURL + (member ? '?page=membership' : ''), { waitUntil: 'domcontentloaded' }); await ready(page); return page;
}
async function logout(page) {
  await page.bringToFront();
  await page.locator('header [data-account-open]').hover();
  await page.locator('.account-menu [data-account-signout]').click();
}
async function loginAs(page, key = 'A', options = {}) {
  await page.evaluate(() => { document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); show('#login'); });
  const mode = options.code ? (key === 'A' ? 'phone' : 'email') : 'password';
  await page.locator(`[data-account-tab="${mode}"]`).click();
  await page.waitForTimeout(120);
  for (const [selector, value] of [['[data-login-account]', key === 'A' ? '13800000001' : 'b@example.test'], ['[data-login-credential]', options.credential || 'Isolated-QA-Password']]) {
    await page.locator(selector).click(); await page.locator(selector).fill(value);
  }
  await page.locator(options.code ? '[data-code-submit]' : '[data-login-submit-v2]').click();
}
const loginA = page => loginAs(page, 'A');
function checkWrites(f) {
  assert(f.writes.every(write => write.body.userId === userFor(write.owner).id), 'every account PUT must include its authenticated owner');
  assert(f.writes.every(write => !JSON.stringify(write.body.data).includes(write.owner === 'A' ? 'B_ONLY' : 'A_ONLY')), 'cross-account dataset was submitted');
  assert(f.storageWrites.every(write => !(write.session === 'A' && write.value.signed && write.value.prefs?.accountProfile?.id === 'qa-email-b')), 'a stale B tab overwrote shared identity after login A');
  assert.deepEqual(f.errors, []);
}
async function switchScenario(browser) {
  const f = await fixture(browser);
  try {
    const main = await openPage(f), member = await openPage(f, true);
    await expectUser(main, 'B'); await expectUser(member, 'B');
    await logout(main); await until(() => f.session === null, 'logout endpoint did not complete');
    if (!baseline) { await expectUser(main, null); await expectUser(member, null); }
    await loginA(main); await expectUser(main, 'A');
    if (!baseline) await expectUser(member, 'A');
    await member.bringToFront(); await member.evaluate(() => window.dispatchEvent(new Event('focus')));
    await member.locator('.member-mode-toggle').click(); await member.waitForTimeout(750);
    if (baseline) {
      const evidence = { main: await read(main), oldMemberTab: await read(member), writes: f.writes, logoutRequests: f.requests.filter(item => item.pathname.endsWith('/logout')).length };
      fs.writeFileSync(path.join(out, 'baseline-result.json'), JSON.stringify(evidence, null, 2));
      assert.equal(evidence.oldMemberTab.id, 'qa-email-b');
      assert.equal(evidence.main.stored.prefs.accountProfile.id, 'qa-email-b');
      console.log('BASELINE REPRODUCED: old member tab overwrites B identity after main tab login A; evidence .local/account-session-qa/baseline-result.json');
      return;
    }
    await expectUser(main, 'A'); await expectUser(member, 'A');
    await main.reload({ waitUntil: 'domcontentloaded' }); await ready(main); await expectUser(main, 'A');
    const fresh = await openPage(f, true); await expectUser(fresh, 'A');
    await fresh.screenshot({ path: path.join(out, 'phone-a-new-member-tab.png'), animations: 'disabled' });
    await logout(main); await until(() => f.session === null, 'server logout required');
    await Promise.all([expectUser(main, null), expectUser(member, null), expectUser(fresh, null)]);
    await member.reload({ waitUntil: 'domcontentloaded' }); await ready(member); await expectUser(member, null);
    checkWrites(f); assert.equal(f.requests.filter(item => item.pathname.endsWith('/logout')).length, 2, 'one server logout per click');
    console.log('PASS cross-tab switch, old member persist, refresh/new tab, owner-bound writes, logout all tabs');
  } finally { await f.close(); }
}
async function staleResponseScenario(browser, pathname) {
  const f = await fixture(browser);
  try {
    const main = await openPage(f);
    const stale = await f.context.newPage(); stale.setDefaultTimeout(12000);
    const held = f.holdNext(pathname, stale);
    await stale.goto(baseURL + '?page=membership', { waitUntil: 'domcontentloaded' });
    // Catalog startup can supersede the initial session request. Explicitly
    // request hydration so the delayed-account case exercises the data path.
    if (pathname.endsWith('/account') && !held.started) {
      await stale.waitForFunction(() => window.__shiyuMemberCatalog?.ready && typeof window.refreshShiyuMembership === 'function');
      await stale.evaluate(() => { void window.refreshShiyuMembership(true); });
    }
    await until(() => held.started, `missing delayed ${pathname}`);
    assert.equal(held.owner, 'B');
    await logout(main); await until(() => f.session === null, 'logout did not complete');
    await loginA(main); await expectUser(main, 'A');
    held.release(); await ready(stale); await expectUser(stale, 'A');
    await stale.evaluate(() => { persist(); window.dispatchEvent(new Event('focus')); });
    await stale.waitForTimeout(650); await expectUser(main, 'A'); await expectUser(stale, 'A');
    checkWrites(f); console.log(`PASS late B ${pathname.split('/').pop()} response cannot restore B or contaminate A`);
  } finally { await f.close(); }
}
async function unauthenticatedScenario(browser) {
  const f = await fixture(browser, null);
  try { const page = await openPage(f); await expectUser(page, null); await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page); await expectUser(page, null); checkWrites(f); console.log('PASS cached signed-in profile cleared when server has no session'); }
  finally { await f.close(); }
}
async function logoutRaceScenario(browser) {
  const f = await fixture(browser);
  try {
    const page = await openPage(f), held = f.holdNext('/api/shiyu/auth/logout', page);
    await logout(page); await until(() => held.started, 'logout not requested');
    await loginA(page); await page.waitForTimeout(250);
    assert.equal(f.requests.filter(item => item.pathname.endsWith('/login')).length, 0, 'login must wait for in-flight logout');
    held.release(); await expectUser(page, 'A'); assert.equal(f.session, 'A');
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page); await expectUser(page, 'A');
    checkWrites(f); console.log('PASS delayed logout finishes before new login, so it cannot invalidate A');
  } finally { await f.close(); }
}
async function staleThemeScenario(browser, presence = false) {
  const f = await fixture(browser); f.themeIsolation = true; f.themeTrial = presence;
  try {
    const main = await openPage(f), stale = await f.context.newPage();
    stale.setDefaultTimeout(12000);
    const pathname = '/api/shiyu/theme-access' + (presence ? '/presence' : '');
    const held = f.holdNext(pathname, stale);
    await stale.goto(baseURL + (presence ? '' : '?page=membership'), { waitUntil: 'domcontentloaded' });
    // Keep the same document alive until the delayed response is released.
    if (presence) {
      await stale.bringToFront(); await stale.evaluate(() => window.dispatchEvent(new Event('focus')));
    }
    await until(() => held.started, 'missing delayed B theme request: ' + pathname);
    assert.equal(held.owner, 'B');
    await logout(main); await until(() => f.session === null, 'logout did not complete');
    await loginA(main); await expectUser(main, 'A'); await expectUser(stale, 'A');
    const themeIsA = () => window.__shiyuThemeCatalog?.find(item => item.id === 'cosmos')?.qaOwner === 'A' && window.__shiyuThemeCatalog.find(item => item.id === 'cosmos').allowed === false;
    await stale.waitForFunction(themeIsA); // New account refresh must not wait on B's old promise.
    held.release(); await stale.waitForTimeout(500);
    assert.equal(await stale.evaluate(themeIsA), true, 'late B theme permissions replaced A');
    assert.equal(await stale.evaluate(() => document.querySelector('.theme-preview-notice')?.hidden), true, 'B trial countdown leaked into A');
    await expectUser(main, 'A'); await expectUser(stale, 'A'); checkWrites(f);
    console.log(`PASS late B theme ${presence ? 'presence POST' : 'access GET'} ignored; A refresh starts before B completes`);
  } finally { await f.close(); }
}
async function failedLoginScenario(browser) {
  const f = await fixture(browser, null);
  try {
    const page = await openPage(f); await expectUser(page, null);
    for (const options of [{ credential: 'wrong-password' }, { code: true, credential: '000000' }]) {
      await loginAs(page, 'A', options);
      await page.waitForFunction(() => document.querySelector('#login')?.textContent.includes('不正确'));
      await page.locator('#login [data-action="close"]').click();
      await ready(page); await expectUser(page, null);
      assert.equal(await page.locator('header [data-account-open]').isVisible(), true, 'failed login left the avatar hidden');
      await page.locator('header [data-account-open]').click();
      assert.equal(await page.locator('#login').evaluate(node => node.open), true, 'login entry must still open');
    }
    checkWrites(f); console.log('PASS password/code rejection restores visible, usable login entry');
  } finally { await f.close(); }
}
async function profileIsolationScenario(browser) {
  const f = await fixture(browser);
  try {
    const page = await openPage(f);
    const custom = {};
    async function customize(key) {
      await page.evaluate(() => { document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); window.openShiyuProfileEditor('nickname'); });
      await page.locator('[data-profile-item-value]').fill(`${key}的本机昵称`);
      await page.locator('[data-profile-item-save]').click();
      await page.evaluate(() => { document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); window.openShiyuProfileEditor('avatar'); });
      const choice = page.locator('[data-profile-choice]').nth(key === 'B' ? 1 : 2);
      const avatar = await choice.getAttribute('data-profile-choice'); await choice.click();
      const birthday = key === 'B' ? '1992-03-04' : '1998-07-08';
      await page.evaluate(birthday => { prefs.accountProfile.birthday = birthday; persist(); document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close()); }, birthday);
      custom[key] = { name: `${key}的本机昵称`, avatar, birthday };
      await page.evaluate(() => refreshShiyuMembership());
      await assertProfile(key);
    }
    async function assertProfile(key) {
      await expectUser(page, key);
      const profile = await page.evaluate(() => prefs.accountProfile);
      for (const [field, value] of Object.entries(custom[key])) assert.equal(profile[field], value, `${key} ${field} changed or inherited from another account`);
      assert.equal(profile.phone, userFor(key).phone); assert.equal(profile.email, userFor(key).email);
    }
    await customize('B');
    await logout(page); await until(() => f.session === null, 'logout B'); await loginAs(page, 'A'); await expectUser(page, 'A');
    assert.equal(await page.evaluate(() => prefs.accountProfile.name), userFor('A').name);
    assert.notEqual(await page.evaluate(() => prefs.accountProfile.birthday), custom.B.birthday);
    await customize('A');
    for (const key of ['B', 'A']) {
      await logout(page); await until(() => f.session === null, 'logout before profile restore');
      await loginAs(page, key); await assertProfile(key);
      await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page); await assertProfile(key);
    }
    checkWrites(f); console.log('PASS nickname/avatar/birthday survive focus and B→A→B→A, with owner-isolated profile cache');
  } finally { await f.close(); }
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    await switchScenario(browser);
    if (!baseline) {
      await staleResponseScenario(browser, '/api/shiyu/auth/session');
      await staleResponseScenario(browser, '/api/shiyu/auth/account');
      await unauthenticatedScenario(browser);
      await logoutRaceScenario(browser);
      await staleThemeScenario(browser);
      await staleThemeScenario(browser, true);
      await failedLoginScenario(browser);
      await profileIsolationScenario(browser);
      fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ passed: true, scenarios: ['cross-tab B to A', 'stale session', 'stale account data', 'unauthenticated refresh', 'logout/login serialization', 'stale theme access', 'stale theme presence', 'failed login entry', 'owner-isolated profile cache'], realMutations: 0 }, null, 2));
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
