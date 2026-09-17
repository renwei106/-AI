const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const root = path.resolve(__dirname, '../..'), out = __dirname;
let browser, server;
async function ready() {
  let startupError = '';
  server = spawn(process.execPath, ['preview.cjs'], { cwd: root, windowsHide: true, env: { ...process.env, PORT: '4321', SHIYU_FEEDBACK_DIR: path.join(out, 'submissions') }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stderr.on('data', bytes => startupError += bytes);
  await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw Error(startupError || 'Preview exited'); })]);
}
async function boot(page) {
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { signed = true; prefs.accountProfile = { id: 'feedback-rules-review', name: '反馈规则测试' }; prefs.theme = 'cinema'; prefs.mode = 'dark'; prefs.color = '#b67c53'; render(); });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}
async function open(page) { await page.locator('[data-account-open]').click(); await page.locator('[data-menu-feedback]').click(); }
async function choose(page, type) { await page.locator(`.feedback-type-options label:has(input[value="${type}"])`).click(); }
async function category(page, name = '主题与外观') {
  const trigger = page.locator('#feedback-category-trigger');
  await page.waitForFunction(() => !document.querySelector('#feedback-category-trigger').disabled);
  await trigger.click(); await page.getByRole('option', { name, exact: true }).click();
}
async function geometry(page) { return page.evaluate(() => ['header', '#main', '#dock'].map(s => { const e = document.querySelector(s), r = e.getBoundingClientRect(), c = getComputedStyle(e); return [s, r.x, r.y, r.width, r.height, c.color, c.backgroundColor, c.fontFamily]; })); }
(async () => {
  await ready(); browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1381, height: 1041 } });
  const before = await context.newPage();
  for (const name of ['feedback.js', 'feedback.css']) await before.route('**/' + name, async route => route.fulfill({ contentType: name.endsWith('.js') ? 'text/javascript' : 'text/css', body: await fs.readFile(path.join(root, 'baselines/feedback-rules-before-20260917', name), 'utf8') }));
  await boot(before);
  const page = await context.newPage(), errors = [], posts = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('request', req => { if (req.url().endsWith('/api/shiyu/feedback') && req.method() === 'POST') posts.push(req.postDataJSON()); });
  await boot(page); assert.deepEqual(await geometry(page), await geometry(before));
  const oldMenu = await before.locator('.account-menu button').allTextContents(), menu = await page.locator('.account-menu button').allTextContents();
  assert.equal(menu.indexOf('捎来回音') + 1, menu.indexOf('浏览器插件'));
  assert.deepEqual(menu.filter(x => !['捎来回音', '浏览器插件'].includes(x)), oldMenu.filter(x => !['捎来回音', '浏览器插件'].includes(x)));
  await page.locator('[data-account-open]').click(); await page.screenshot({ path: path.join(out, 'menu.png') }); await page.locator('[data-menu-feedback]').click();
  const d = page.locator('#support-feedback');
  assert.equal(await d.locator('.feedback-footer small').count(), 0); assert.equal(await d.locator('.feedback-receipt').count(), 0);
  assert.equal(await d.locator('.feedback-type-options label').count(), 4);
  assert.equal(await d.locator('.feedback-field:visible').count(), 0);
  await d.locator('[type=submit]').click(); assert.match(await d.locator('.feedback-error').textContent(), /先选/);
  await choose(page, 'feature_request');
  assert.equal(await d.locator('.feedback-description-label').textContent(), '期望功能描述'); assert(!(await d.locator('.feedback-category-field').isVisible()));
  await d.locator('[type=submit]').click(); assert.match(await d.locator('.feedback-error').textContent(), /期望功能描述/);
  await page.locator('#feedback-description').fill('希望能按自己的习惯整理收藏。');
  await page.locator('#feedback-contact').fill('feature@example.com');
  const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 100; c.height = 70; c.getContext('2d').fillRect(0, 0, 100, 70); return c.toDataURL(); });
  await page.locator('#feedback-files').setInputFiles({ name: 'feature.png', mimeType: 'image/png', buffer: Buffer.from(png.split(',')[1], 'base64') });
  await page.waitForFunction(() => document.querySelector('.feedback-image-count').textContent === '1 / 5');
  await d.screenshot({ path: path.join(out, 'feature-dark.png') });
  await choose(page, 'appreciation');
  assert.equal(await d.locator('.feedback-field:visible').count(), 1); assert.equal(await page.locator('#feedback-description').inputValue(), '');
  await d.locator('[type=submit]').click(); assert.match(await d.locator('.feedback-error').textContent(), /想对我们说的话/);
  await page.locator('#feedback-description').fill('谢谢你们，让收藏有了一个温暖的归处。');
  await d.screenshot({ path: path.join(out, 'appreciation-dark.png') });
  await choose(page, 'experience'); assert.equal(await d.locator('.feedback-description-label').textContent(), '使用心得'); assert.equal(await d.locator('.feedback-field:visible').count(), 1);
  await choose(page, 'feature_request'); assert.match(await page.locator('#feedback-description').inputValue(), /整理收藏/); assert.equal(await d.locator('.feedback-thumbnail').count(), 1);
  await choose(page, 'usage_issue');
  await page.waitForFunction(() => !document.querySelector('#feedback-category-trigger').disabled);
  assert(await page.locator('#feedback-category').evaluate(el => el.required));
  await d.locator('[type=submit]').click(); assert.match(await d.locator('.feedback-error').textContent(), /请选择遇到问题/);
  await page.locator('#feedback-category-trigger').click();
  assert.equal(await page.getByRole('option').count(), 5);
  assert(await page.locator('#feedback-category-options').evaluate(el => el.matches(':popover-open')));
  await page.screenshot({ path: path.join(out, 'category-dark.png') });
  await page.keyboard.press('Escape'); assert(await d.isVisible()); assert.equal(await page.locator('#feedback-category-trigger').getAttribute('aria-expanded'), 'false');
  await page.locator('#feedback-category-trigger').focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('End'); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#feedback-category').inputValue(), 'other');
  await category(page); assert.equal(await page.locator('#feedback-category').inputValue(), 'appearance');
  await d.locator('[type=submit]').click(); assert.match(await d.locator('.feedback-error').textContent(), /问题描述/);
  await page.locator('#feedback-description').fill('切换主题时，图片没有及时更新。');
  await page.locator('#feedback-contact').fill('issue@example.com');
  for (const [width, height, mode] of [[1381, 1041, 'light'], [390, 844, 'dark'], [320, 568, 'light'], [844, 390, 'dark']]) {
    await page.setViewportSize({ width, height }); await page.evaluate(mode => { prefs.mode = mode; render(); }, mode); await page.waitForTimeout(350);
    await page.locator('#feedback-category-trigger').scrollIntoViewIfNeeded(); await page.locator('#feedback-category-trigger').click();
    const box = await page.locator('#feedback-category-options').boundingBox(); assert(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height);
    assert(await page.getByRole('option').first().evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + 15, r.y + r.height / 2)); }));
    await page.screenshot({ path: path.join(out, `category-${width}-${mode}.png`) });
    await page.keyboard.press('Escape');
    await page.locator('#feedback-contact').scrollIntoViewIfNeeded();
    assert(await page.locator('#feedback-contact').evaluate(el => { const r = el.getBoundingClientRect(); return document.elementFromPoint(r.x + 20, r.y + r.height / 2) === el; }));
    assert(await d.locator('[type=submit]').evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); }));
  }
  await page.setViewportSize({ width: 1381, height: 1041 });
  await d.locator('[data-feedback-close]').first().click(); await open(page); assert.match(await page.locator('#feedback-description').inputValue(), /图片没有/);
  await page.route('**/api/shiyu/feedback', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"测试连接失败"}' }));
  await page.waitForFunction(() => !document.querySelector('#support-feedback [type=submit]').disabled); await d.locator('[type=submit]').click();
  await d.locator('.feedback-error').waitFor({ state: 'visible' }); await page.unroute('**/api/shiyu/feedback');
  await d.locator('[type=submit]').click(); await d.locator('.feedback-success').waitFor({ state: 'visible' });
  assert.deepEqual(posts[0], posts[1]);
  const record = JSON.parse(await fs.readFile(path.join(out, 'submissions', posts[1].submissionId + '.json'))); assert(record.receipt); assert.equal(record.categoryId, 'appearance');
  assert(!(await d.innerText()).includes(record.receipt));
  await d.screenshot({ path: path.join(out, 'success-dark.png') });
  await d.locator('.feedback-success button').click(); await open(page);
  await page.route('**/api/shiyu/feedback/categories', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await choose(page, 'usage_issue'); await d.locator('.feedback-category-status').waitFor({ state: 'visible' }); assert(await d.locator('[type=submit]').isDisabled());
  await choose(page, 'feature_request'); assert(!(await d.locator('[type=submit]').isDisabled()));
  await page.locator('#feedback-description').fill('希望可以方便地整理收藏。'); await page.locator('#feedback-contact').fill('not valid');
  await choose(page, 'appreciation'); await page.locator('#feedback-description').fill('谢谢你们。');
  await d.locator('[type=submit]').click(); await d.locator('.feedback-success').waitFor({ state: 'visible' });
  const gratitude = posts.at(-1); assert.equal(gratitude.categoryId, null); assert.equal(gratitude.contact, ''); assert.deepEqual(gratitude.images, []);
  assert(!(await d.locator('.feedback-success').innerText()).includes('联系'));
  await d.locator('.feedback-success button').click(); await open(page);
  await choose(page, 'experience'); await page.locator('#feedback-description').fill('习惯每天来拾隅收下新的灵感。'); await d.locator('[type=submit]').click(); await d.locator('.feedback-success').waitFor({ state: 'visible' });
  assert.equal(posts.at(-1).type, 'experience');
  await d.locator('.feedback-success button').click(); await open(page);
  await choose(page, 'feature_request'); await page.locator('#feedback-description').fill('希望增加快捷整理功能。'); await d.locator('[type=submit]').click(); await d.locator('.feedback-success').waitFor({ state: 'visible' });
  assert.equal(posts.at(-1).type, 'feature_request'); assert.equal(posts.at(-1).categoryId, null);
  await d.locator('.feedback-success button').click(); await open(page);
  await page.unroute('**/api/shiyu/feedback/categories'); await choose(page, 'usage_issue'); await category(page);
  await page.locator('#feedback-description').fill('账号切换前的草稿'); await page.evaluate(() => { prefs.accountProfile.id = 'another-user'; render(); });
  assert.equal(await page.locator('#feedback-description').inputValue(), '');
  await page.keyboard.press('Escape'); assert.deepEqual(errors, []);
  console.log('PASS revised UI: four conditional forms, required fields, independent drafts, theme dropdown keyboard/Esc and viewport bounds, compact footer/success, internal receipt, four real submissions, failures/retries, hidden fields omitted, menu swap, unchanged home and original menu items.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => { await browser?.close(); server?.kill(); });
