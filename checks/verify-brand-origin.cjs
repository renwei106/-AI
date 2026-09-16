const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4318/', { waitUntil: 'networkidle' });
  await page.locator('.brand').hover();
  const entry = page.locator('.brand-origin-link');
  assert(await entry.isVisible(), 'official entry is not visible in the brand menu');
  assert.equal((await entry.locator('b').textContent()).trim(), '回到拾隅');
  assert.equal((await entry.locator('small').textContent()).trim(), '从这里，再看见世界');
  assert.equal(await entry.locator('svg').count(), 1);
  assert.equal(await entry.locator('i').count(), 0);
  assert((await page.locator('.brand-theme-menu').boundingBox()).width <= 176, 'brand menu is still too wide');
  assert.equal(await page.getByText('点击「拾隅」切换下一个主题', { exact: true }).count(), 0);
  const href = await entry.getAttribute('href');
  assert.equal((await page.request.get(href)).status(), 200, 'official entry does not resolve');
  await page.screenshot({ path: 'checks/v6/brand-official-entry.png' });
  await page.locator('.brand-theme-menu [data-brand-theme]').nth(1).click();
  await page.locator('.brand').hover();
  assert.equal(await page.locator('.brand-origin-link').count(), 1, 'official entry was lost after changing theme');
  assert.equal(await page.locator('.theme-switch-hint').count(), 0, 'old switch hint returned after changing theme');
  assert.equal(errors.length, 0, errors.join('\n'));
  await browser.close();
  console.log('PASS: brand menu links to the official experience');
})().catch(error => { console.error(error); process.exit(1); });
