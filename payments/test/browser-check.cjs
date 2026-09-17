'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const QRCode = require('qrcode');
const ROOT = path.resolve(__dirname, '../..'), out = path.join(ROOT, '.local/payments/qa');
async function main() {
 fs.mkdirSync(out, { recursive: true });
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 const errors = [], comparisons = [];
 try {
  for (const [theme, viewport] of [['light', { width: 1600, height: 1000 }], ['dark', { width: 1600, height: 1000 }], ['light', { width: 390, height: 844 }]]) {
   const suffix = theme + '-' + viewport.width;
   const context = await browser.newContext({ viewport, colorScheme: theme });
   await context.addInitScript(mode => { localStorage.setItem('yiyu-prototype-v1', JSON.stringify({ prefs: { mode, theme: 'base' } })); }, theme);
   const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
   const originalHtml = fs.readFileSync(path.join(ROOT, 'baselines/payment-integration-before-20260917/dist/index.html'), 'utf8');
   const route = async r => {
    const u = new URL(r.request().url());
    if (r.request().isNavigationRequest() && u.pathname === '/') await r.fulfill({ contentType: 'text/html', body: originalHtml });
    else await r.continue();
   };
   await page.route('**/*', route);
   await page.goto('http://127.0.0.1:4348/?page=membership'); await page.waitForTimeout(650);
   const measure = () => page.evaluate(() => Object.fromEntries(['#member-center h2', '.member-plans', '.member-comparison', '.checkout-choice', '.checkout-methods', '.checkout-legal'].map(s => {
    const e = document.querySelector(s), r = e.getBoundingClientRect(), c = getComputedStyle(e);
    return [s, { x: r.x, y: r.y, width: r.width, height: r.height, color: c.color, font: c.font, background: c.backgroundColor }];
   })));
   const before = await measure(); await page.screenshot({ path: path.join(out, 'before-' + suffix + '.png'), fullPage: true });
   await page.unroute('**/*', route);
   await page.goto('http://127.0.0.1:4348/?page=membership'); await page.waitForTimeout(650);
   const after = await measure(); await page.screenshot({ path: path.join(out, 'after-' + suffix + '.png'), fullPage: true });
   // Checkout note and action text necessarily change; card/table style and positions must not.
   for (const selector of ['#member-center h2', '.member-plans', '.member-comparison', '.checkout-choice', '.checkout-methods']) assert.deepEqual(after[selector], before[selector], suffix + ' ' + selector);
   assert.equal(await page.locator('.member-checkout>.member-primary').innerText(), '支付暂未开放');
   assert(await page.locator('.member-checkout>.member-primary').isDisabled());
   comparisons.push({ viewport, theme, layoutUnchanged: true });
   await context.close();
  }
  // UI-only fixture: explicitly simulated provider results, never sent to either payment platform.
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  let created = 0, paid = false, order = null;
  const image = await QRCode.toDataURL('weixin://wxpay/test-only-not-payable');
  await page.route('**/api/shiyu/payments/**', async route => {
   const url = new URL(route.request().url()), method = route.request().method(); let data;
   if (url.pathname.endsWith('/status')) data = { enabled: true, mode: 'integration', providers: { wechat: { ready: true }, alipay: { ready: true } } };
   else if (url.pathname.endsWith('/account')) data = { userId: 'ui-fixture', memberExpiresAt: paid ? Date.now() + 30 * 86400_000 : 0 };
   else if (url.pathname.endsWith('/orders') && method === 'POST') {
    const input = route.request().postDataJSON(); assert(input.accepted); assert.equal(input.planId, 'monthly'); created++;
    order = { id: 'SY' + String(created).padStart(28, '0'), planId: input.planId, planName: '月度会员', amount: 1000, days: 30, status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 1800_000,
     provider: input.provider, checkout: input.provider === 'wechat' ? { kind: 'qr', image } : { kind: 'redirect', url: 'https://openapi.alipay.com/gateway.do?test-only=1' } };
    data = { order };
   } else if (url.pathname.endsWith('/orders')) data = { items: order ? [order] : [] };
   else data = { order: { ...order, status: paid ? 'paid' : 'pending', paidAt: paid ? Date.now() : null, memberExpiresAt: paid ? Date.now() + 30 * 86400_000 : null } };
   await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.goto('http://127.0.0.1:4348/?page=membership'); await page.waitForTimeout(700);
  await page.locator('.payment-choice-trigger').click(); await page.locator('[data-method-choice="wechat"]').click();
  await page.locator('.member-checkout>.member-primary').click();
  await page.locator('#agreement-required-dialog').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-demo-success]').count(), 0);
  await page.locator('[data-return-agreement]').click();
  await page.locator('#payment-order .payment-qr').waitFor({ state: 'visible' });
  assert.equal(created, 1); assert.equal(await page.locator('[data-demo-success]').count(), 0);
  await page.screenshot({ path: path.join(out, 'wechat-checkout-fixture.png'), fullPage: true });
  paid = true; await page.locator('[data-payment-query]').click(); await page.locator('.payment-confirmed').waitFor();
  assert.equal(await page.locator('.payment-confirmed').innerText(), '支付成功');
  await page.locator('[data-payment-done]').click();
  await page.locator('.payment-choice-trigger').click(); await page.locator('[data-method-choice="alipay"]').click();
  await page.locator('[data-member-agree]').check(); await page.locator('.member-checkout>.member-primary').click();
  await page.locator('.payment-cashier').waitFor(); assert.match(await page.locator('.payment-cashier').getAttribute('href'), /^https:\/\/openapi.alipay.com\//);
  await page.screenshot({ path: path.join(out, 'alipay-checkout-fixture.png'), fullPage: true });
  await context.close();
  assert.deepEqual(errors, []);
  const report = { comparisons, frontendFixtureFlow: 'passed; no real payment calls', pageErrors: errors };
  fs.writeFileSync(path.join(out, 'browser-report.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
 } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
