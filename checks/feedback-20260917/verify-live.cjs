const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  for (const file of ['feedback.js', 'feedback.css']) {
    const response = await fetch('http://127.0.0.1:4318/' + file);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), await fs.readFile(path.join(__dirname, '../../dist', file), 'utf8'));
  }
  const categories = await (await fetch('http://127.0.0.1:4318/api/shiyu/feedback/categories')).json();
  assert.equal(categories.items.length, 5);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4318/', { waitUntil: 'networkidle' });
    await page.locator('[data-account-open]').click();
    await page.locator('[data-menu-feedback]').click();
    await page.waitForFunction(() => !document.querySelector('#support-feedback [type=submit]').disabled);
    const d = page.locator('#support-feedback');
    assert(!(await page.locator('#login').isVisible()));
    await d.screenshot({ path: path.join(__dirname, 'ready-dialog.png') });
    await page.keyboard.press('Escape'); assert(!(await d.isVisible()));
    assert.deepEqual(errors, []);
    console.log('PASS live 4318: exact current assets, 5 server categories, guest avatar entry, dialog and Esc; no real feedback created.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
