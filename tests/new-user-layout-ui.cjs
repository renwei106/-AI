// Local UI verification. Authentication and account writes stay in memory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const store = require('../../聚合管理后台/membership/plan-store.cjs');
const catalog = store.getCatalog();
const free = store.normalizePlan({ id: 'free', name: '免费版', enabled: true, price: 0, days: 0 });
const output = path.resolve(__dirname, '../.local/new-user-layout-qa');
const baseURL = process.env.SHIYU_PREVIEW_URL || 'http://127.0.0.1:4329/';
const clone = value => JSON.parse(JSON.stringify(value));
const user = { id: 'qa-layout-user', name: '布局测试', email: 'layout@example.test', member: false,
  membership: { member: false, planId: 'free', planName: '免费版', entitlements: free.entitlements } };
const accountData = [{ id: 'work', name: '测试空间', icon: 'folder', scenes: [
  { id: 'daily', name: '日常', groups: [{ id: 'tools', name: '收藏', items: [['保留的收藏', 'https://example.test/', '', '网']] }] }
] }];
const results = [];
let browser;

async function fixture(initialPrefs, domainNavigation = false) {
  const context = await browser.newContext({ viewport: { width: 1772, height: 1014 }, reducedMotion: 'reduce' });
  const fixture = { context, user: null, data: clone(accountData), errors: [], closing: false };
  fixture.close = async () => { fixture.closing = true; await context.close(); };
  if (initialPrefs) await context.addInitScript(prefs => {
    if (!localStorage.getItem('yiyu-prototype-v1')) localStorage.setItem('yiyu-prototype-v1', JSON.stringify({ prefs, signed: false }));
  }, initialPrefs);
  await context.route(/https:\/\/(?:open\.weixin\.qq\.com|res\.wx\.qq\.com|mp\.weixin\.qq\.com)\//,
    route => route.fulfill({ status: 200, contentType: 'text/html', body: '' }));
  await context.route('**/api/**', async route => {
    const request = route.request(), url = new URL(request.url()), method = request.method();
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/api/shiyu/auth/session') return json(fixture.user
      ? { authenticated: true, user: fixture.user } : { authenticated: false, entitlements: free.entitlements });
    if (url.pathname === '/api/shiyu/auth/account') {
      if (method === 'PUT') fixture.data = clone(request.postDataJSON().data);
      return json({ userId: user.id, data: fixture.data });
    }
    if (url.pathname === '/api/shiyu/plans') return json({ items: [free] });
    if (url.pathname === '/api/shiyu/plans/catalog') return json(catalog);
    if (url.pathname.startsWith('/api/shiyu/theme-access')) return json({ fallback: 'base', member: false,
      items: catalog.resources.themes.map(item => ({ ...item, enabled: true, allowed: true, memberOnly: false })) });
    if (url.pathname === '/api/shiyu/payments/status') return json({ enabled: false, providers: {} });
    if (url.pathname === '/api/shiyu/payments/account') return json({ member: false, membership: user.membership });
    if (url.pathname === '/api/shiyu/auth/invitations') return json({ enabled: false, items: [] });
    if (url.pathname === '/api/shiyu/auth/wechat/qr') return json({ scene: 'qa-layout-qr',
      qrUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E' });
    if (url.pathname.startsWith('/api/shiyu/auth/wechat/')) return json({ status: 'waiting' });
    if (method !== 'GET') return json({ message: 'Layout QA blocks real writes' }, 403);
    return route.continue();
  });
  if (domainNavigation) await context.route(/^https:\/\/(?:shiyubox\.com|space\.shiyubox\.com)\//, async route => {
    try {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/')) return await route.fallback();
      const response = await route.fetch({ url: new URL(url.pathname + url.search, baseURL).href });
      await route.fulfill({ response });
    } catch (error) { if (!fixture.closing) throw error; }
  });
  const page = fixture.page = await context.newPage();
  page.on('pageerror', error => fixture.errors.push(error.message));
  await page.goto(domainNavigation ? 'https://shiyubox.com/' : baseURL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('shiyu-account-ready'));
  fixture.login = async isNewUser => {
    fixture.user = clone(user);
    await page.evaluate(result => window.ShiyuAccountSession.applyLogin(result),
      { authenticated: true, user, accountData: clone(accountData), isNewUser });
  };
  return fixture;
}

async function layout(fixture, name) {
  const page = fixture.page;
  await page.evaluate(() => {
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    settingsTab = 'layout'; renderSettings(); document.querySelector('#settings').showModal();
  });
  const evidence = await page.evaluate(() => ({ width: prefs.width, unified: unifiedField('width'),
    selected: document.querySelector('#settings .layout-card.selected span')?.textContent,
    cssWidth: document.documentElement.style.getPropertyValue('--width'),
    data: JSON.stringify(data), modes: prefs.spacePreferenceModes || {} }));
  await page.screenshot({ path: path.join(output, name + '.png') });
  results.push({ name, ...evidence, data: undefined });
  return evidence;
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const fresh = await fixture();
    try {
      const initial = await layout(fresh, 'first-visit');
      assert.equal(initial.width, 'wide'); assert.equal(initial.selected, '横向铺开');
      await fresh.login(true);
      const registered = await layout(fresh, 'fresh-registration');
      assert.equal(registered.width, 'wide'); assert.equal(registered.unified, true);
      assert.equal(registered.cssWidth, '100%'); assert.equal(registered.data, JSON.stringify(accountData));
      // A new user may choose a different layout; session refresh must preserve it.
      await fresh.page.locator('#settings [data-pref="width"][data-value="safe"]').click();
      await fresh.page.reload({ waitUntil: 'domcontentloaded' });
      await fresh.page.waitForFunction(() => document.documentElement.classList.contains('shiyu-account-ready'));
      const changed = await layout(fresh, 'new-user-choice-after-refresh');
      assert.equal(changed.width, 'safe'); assert.equal(changed.selected, '舒适留白');
      assert.deepEqual(fresh.errors, []);
    } finally { await fresh.close(); }

    const inheritedPrefs = { width: 'safe', theme: 'base', spacePreferenceModes: { width: 'space', font: 'space' },
      spacePreferences: { work: { width: 'safe', font: 'kai' } } };
    const inherited = await fixture(inheritedPrefs);
    try {
      await inherited.login(true);
      const initial = await layout(inherited, 'registration-with-old-browser-settings');
      assert.equal(initial.width, 'wide'); assert.equal(initial.unified, true);
      assert.equal(initial.modes.font, 'space');
      assert.equal(await inherited.page.evaluate(() => prefs.spacePreferences.work.font), 'kai');
      assert.equal(initial.data, JSON.stringify(accountData));
      assert.deepEqual(inherited.errors, []);
    } finally { await inherited.close(); }

    const returning = await fixture(inheritedPrefs);
    try {
      await returning.login(false);
      const unchanged = await layout(returning, 'returning-user');
      assert.equal(unchanged.width, 'safe'); assert.equal(unchanged.unified, false);
      assert.equal(await returning.page.evaluate(() => prefs.spacePreferences.work.width), 'safe');
      assert.deepEqual(returning.errors, []);
    } finally { await returning.close(); }

    for (const [name, newAccount, expectedMode] of [
      ['new-registration-across-domains', true, 'global'],
      ['ordinary-login-across-domains', false, 'space']
    ]) {
      const domain = await fixture(inheritedPrefs, true);
      try {
        await domain.login(newAccount);
        // A refresh before entering spaces must not lose the first-entry handoff.
        await domain.page.reload({ waitUntil: 'domcontentloaded' });
        await domain.page.waitForFunction(() => document.documentElement.classList.contains('shiyu-account-ready'));
        await domain.page.evaluate(() => { transitionUntil = 0; changeView('space'); });
        await domain.page.waitForURL('https://space.shiyubox.com/');
        await domain.page.waitForFunction(() => document.documentElement.classList.contains('shiyu-account-ready') && view === 'space');
        const result = await layout(domain, name);
        assert.equal(result.width, newAccount ? 'wide' : 'safe');
        assert.equal(result.modes.width, expectedMode);
        assert.equal(await domain.page.evaluate(() => effective().width), newAccount ? 'wide' : 'safe');
        assert.equal(await domain.page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--width').trim()), newAccount ? '100%' : '1120px');
        assert.deepEqual(domain.errors, []);
      } finally { await domain.close(); }
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log('PASS: first visit and new registration use wide; inherited browser layout resets only for a new account; returning users and manual choices survive login/refresh.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
