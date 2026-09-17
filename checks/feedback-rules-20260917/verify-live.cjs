const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs/promises');
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
(async () => {
  for (const name of ['feedback.js', 'feedback.css']) {
    const response = await fetch('http://127.0.0.1:4318/' + name); assert.equal(response.status, 200);
    assert.equal(await response.text(), await fs.readFile(path.join(__dirname, '../../dist', name), 'utf8'));
  }
  const response = await fetch('http://127.0.0.1:4318/api/shiyu/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionId: randomUUID(), type: 'usage_issue', description: '必选分类接口校验，不保存记录', categoryId: null, images: [], contact: '' }) });
  assert.equal(response.status, 400); assert.match((await response.json()).message, /问题分类/);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1381, height: 1041 } });
    await page.goto('http://127.0.0.1:4318/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { prefs.theme = 'cinema'; prefs.mode = 'dark'; prefs.color = '#b67c53'; render(); });
    await page.locator('[data-account-open]').click();
    const menu = await page.locator('.account-menu button').allTextContents(); assert(menu.indexOf('捎来回音') < menu.indexOf('浏览器插件'));
    await page.locator('[data-menu-feedback]').click();
    await page.locator('label:has(input[value=usage_issue])').click();
    await page.waitForFunction(() => !document.querySelector('#feedback-category-trigger').disabled);
    await page.locator('#feedback-category-trigger').click(); await page.getByRole('option', { name: '主题与外观', exact: true }).click();
    await page.locator('#feedback-title').focus(); await page.waitForTimeout(350);
    await page.locator('#support-feedback').screenshot({ path: path.join(__dirname, 'ready-dialog.png') });
    assert.equal(await page.locator('.feedback-footer small,.feedback-receipt').count(), 0);
    console.log('PASS live 4318: latest assets, new server-required category, four types, themed category selection, reordered guest menu, removed footer line/receipt. No real record created.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
