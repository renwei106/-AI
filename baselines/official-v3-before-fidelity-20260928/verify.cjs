const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const out = path.join(__dirname, 'review');
const url = 'http://127.0.0.1:4320/official/v3/index.html';
const sections = ['intro', 'themes', 'space', 'world', 'extension', 'tools'];
const results = [];
fs.mkdirSync(out, { recursive: true });
function pass(name) { console.log('PASS', name); results.push(name); }
async function jump(page, id) {
  await page.evaluate(id => document.getElementById(id).scrollIntoView({ behavior: 'instant' }), id);
  await page.waitForTimeout(220);
}
async function captureSet(page, prefix) {
  const tiles = [];
  for (const id of sections) {
    await jump(page, id);
    await page.locator(`#${id} img`).evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
    await page.waitForTimeout(120);
    const file = path.join(out, `${prefix}-${id}.png`);
    await page.screenshot({ path: file, animations: 'disabled' });
    const tile = await sharp(file).resize({ width: 480 }).png().toBuffer();
    tiles.push({ input: tile, left: (tiles.length % 3) * 480, top: Math.floor(tiles.length / 3) * Math.round(480 * page.viewportSize().height / page.viewportSize().width) });
  }
  const height = Math.round(480 * page.viewportSize().height / page.viewportSize().width);
  await sharp({ create: { width: 1440, height: height * 2, channels: 3, background: '#101713' } }).composite(tiles).png().toFile(path.join(out, `${prefix}-overview.png`));
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const errors = [], failed = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
  await page.goto(url, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('main>.screen').count(), 6);
  assert.equal(await page.title(), '拾隅 · 收藏网址，连接世界');
  for (const id of sections) assert(await page.locator(`#${id} a[href^="https://"][href*="shiyubox.com"]`).count() > 0, `${id} product entry`);
  assert.equal(await page.locator('.header-enter').getAttribute('href'), 'https://shiyubox.com/');
  await captureSet(page, 'desktop');
  pass('six screens, product entries, desktop screenshot review');

  await jump(page, 'themes');
  for (const theme of ['cosmos', 'music', 'paper', 'flip', 'base', 'cinema']) {
    await page.locator(`[data-theme="${theme}"]`).click();
    await page.waitForFunction(theme => document.querySelector('#theme-image').getAttribute('src') === `./assets/${theme}.webp`, theme);
    assert(await page.locator('#theme-image').evaluate(image => image.complete && image.naturalWidth > 0));
  }
  await page.locator('#theme-cinema').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#theme-cosmos').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('End');
  assert.equal(await page.locator('#theme-base').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Home');
  pass('all themes, actual images, arrow/Home/End keyboard navigation');

  await jump(page, 'space');
  for (const view of ['list', 'map', 'cards']) {
    await page.locator(`#view-${view}`).click();
    assert.equal(await page.locator('#space-demo').getAttribute('data-view'), view);
    assert.equal(await page.locator('.view-switch [aria-selected="true"]').count(), 1);
    assert.equal(await page.locator('#space-demo').getAttribute('aria-labelledby'), `view-${view}`);
    assert.equal(await page.locator('.space-item').count(), 6);
    await page.screenshot({ path: path.join(out, `view-${view}.png`), animations: 'disabled' });
  }
  await page.locator('.space-item').first().click();
  assert.equal(await page.locator('.view-switch [aria-selected="true"]').count(), 1);
  pass('space view transitions preserve collection and selected tab');

  await jump(page, 'world');
  await page.locator('#topic-ai').click();
  assert(await page.locator('#world-map').textContent().then(text => text.includes('DeepSeek')));
  assert.equal(await page.locator('.world-resource').first().getAttribute('href'), 'https://chat.deepseek.com/');
  await page.locator('#topic-life').click();
  assert(await page.locator('#world-map').textContent().then(text => text.includes('Khan Academy')));
  pass('world resources change by topic');

  await jump(page, 'extension');
  await page.locator('#demo-save').click();
  assert.match(await page.locator('#demo-save-status').textContent(), /演示.*稍后整理/);
  await page.locator('#demo-destination').selectOption('灵感与参考');
  assert.equal(await page.locator('#demo-save').getAttribute('class'), '');
  await page.locator('#demo-save').click();
  assert.match(await page.locator('#demo-save-status').textContent(), /演示.*灵感与参考/);
  pass('extension collection demo and destination changes');

  await jump(page, 'tools');
  await page.locator('#pet-toggle').click();
  assert.equal(await page.locator('#pet-toggle').getAttribute('aria-expanded'), 'true');
  await page.locator('[data-pet-tool="todo"]').click();
  assert.equal(await page.locator('#tool-todo').getAttribute('aria-selected'), 'true');
  await page.locator('.todo-items input').nth(1).check();
  assert(await page.locator('.todo-items input').nth(1).isChecked());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#pet-toggle').getAttribute('aria-expanded'), 'false');
  await page.locator('#tool-palette').click();
  assert(await page.locator('[data-tool-panel="palette"]').isVisible());
  pass('pet expands, switches tools, collapses with Escape; todo demo works');

  await jump(page, 'themes');
  await page.locator('[data-setup="home"]').click();
  await page.waitForFunction(() => document.querySelector('#setup-status').textContent.includes('已复制'));
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'https://shiyubox.com/');
  assert.equal(await page.locator('#home-url').inputValue(), 'https://shiyubox.com/');
  for (const [browserName, settings] of [['edge', 'edge://settings/startHomeNTP'], ['chrome', 'chrome://settings/appearance'], ['firefox', 'about:preferences#home']]) {
    await page.locator('#setup-browser').selectOption(browserName);
    assert.equal(await page.locator('#open-settings').getAttribute('href'), settings);
  }
  await page.screenshot({ path: path.join(out, 'home-setup.png') });
  await page.keyboard.press('Escape');
  assert(await page.locator('[data-setup="home"]').evaluate(button => button === document.activeElement));
  await page.locator('[data-setup="desktop"]').click();
  const downloaded = page.waitForEvent('download');
  await page.locator('#download-shortcut').click();
  const download = await downloaded;
  const downloadedPath = await download.path();
  assert.match(fs.readFileSync(downloadedPath, 'utf8'), /URL=https:\/\/shiyubox\.com\//);
  await page.keyboard.press('Escape');
  pass('real clipboard uses product URL; browser guidance; desktop shortcut; dialog focus restoration');

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } });
    document.execCommand = () => false;
  });
  await page.locator('[data-setup="home"]').click();
  await page.waitForFunction(() => document.querySelector('#setup-status').textContent.includes('未能自动复制'));
  assert.equal(await page.locator('#home-url').inputValue(), 'https://shiyubox.com/');
  await page.keyboard.press('Escape');
  pass('denied clipboard exposes manual copying and never claims success');

  for (const viewport of [{ width: 2560, height: 1440 }, { width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport);
    for (const id of sections) {
      await jump(page, id);
      const layout = await page.evaluate(id => {
        const section = document.getElementById(id);
        const box = section.getBoundingClientRect();
        const footer = section.querySelector('.screen-bottom').getBoundingClientRect();
        const children = [...section.querySelectorAll('.copy, .theme-controls, .space-window, .extension-popup, .tool-demo:not([hidden])')].map(node => {
          const r = node.getBoundingClientRect();
          return { name: node.className, x: r.x, right: r.right, bottom: r.bottom, top: r.top };
        });
        return { width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1, section: { top: box.top, bottom: box.bottom }, footerTop: footer.top, children };
      }, id);
      assert(!layout.overflow, `${viewport.width} ${id}: horizontal overflow`);
      for (const child of layout.children) {
        assert(child.x >= -8 && child.right <= viewport.width + 10, `${viewport.width} ${id}: ${child.name} clipped horizontally ${JSON.stringify(child)}`);
        assert(child.bottom <= layout.footerTop + 15, `${viewport.width} ${id}: ${child.name} overlaps footer ${JSON.stringify(layout)}`);
      }
    }
    pass(`responsive content bounds ${viewport.width}×${viewport.height}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.locator('.screen').evaluateAll(nodes => nodes.every(node => node.offsetHeight <= innerHeight + 1)), 'six chapters each fit the common mobile viewport');
  await jump(page, 'space');
  for (const view of ['list', 'map', 'cards']) {
    await page.locator(`#view-${view}`).click();
    const layout = await page.locator('#space-demo').evaluate(node => {
      const parent = node.getBoundingClientRect();
      return [...node.querySelectorAll('.space-item')].map(card => { const r = card.getBoundingClientRect(); return { bottom: r.bottom - parent.bottom, top: r.top - parent.top }; });
    });
    assert(layout.every(card => card.bottom < 4 && card.top > -4), `mobile ${view} cards stay inside their panel: ${JSON.stringify(layout)}`);
  }
  await page.locator('#tool-memo').click();
  await captureSet(page, 'mobile');
  await jump(page, 'themes');
  assert.match(await page.locator('#theme-image').evaluate(image => image.currentSrc), /-mobile\.webp$/);
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  assert(requests.every(request => request.method === 'GET' && request.url.startsWith('http://127.0.0.1:4320/')), 'new site performs no API writes or external fetches');
  pass('mobile theme images, no script/resource errors, no account or production data access');

  await page.setViewportSize({ width: 1440, height: 900 });
  await jump(page, 'intro');
  await page.mouse.move(300, 400);
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(900);
  assert(await page.locator('.chapter-nav a[href="#themes"]').getAttribute('aria-current'));
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(900);
  assert(await page.locator('.chapter-nav a[href="#space"]').getAttribute('aria-current'));
  pass('native wheel and PageDown move between full-screen chapters');

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const mobile = await mobileContext.newPage();
  await mobile.goto(url);
  await jump(mobile, 'themes');
  await mobile.locator('[data-setup="desktop"]').click();
  assert(await mobile.locator('#download-shortcut').isHidden());
  assert.match(await mobile.locator('#desktop-help').textContent(), /Safari.*添加到主屏幕/);
  await mobileContext.close();
  pass('iOS provides home-screen instructions, no Windows shortcut');

  const reducedContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const reduced = await reducedContext.newPage();
  await reduced.goto(url);
  assert.equal(await reduced.locator('.floating-one').evaluate(node => getComputedStyle(node).animationName), 'none');
  await reduced.locator('.main-nav a[href="#space"]').click();
  await reduced.waitForFunction(() => document.querySelector('.chapter-nav a[href="#space"]').hasAttribute('aria-current'));
  await reducedContext.close();
  const plainContext = await browser.newContext({ javaScriptEnabled: false });
  const plain = await plainContext.newPage();
  await plain.goto(url);
  assert.equal(await plain.locator('main>.screen').count(), 6);
  assert(await plain.locator('.header-enter').isVisible());
  await plainContext.close();
  pass('reduced motion, chapter navigation, no-JavaScript product access');

  const baseline = path.join(root, 'baselines/official-before-product-20260928');
  for (const file of ['index.html', 'official.css', 'official.js']) assert.equal(fs.readFileSync(path.join(root, 'dist/official/v2', file), 'utf8'), fs.readFileSync(path.join(baseline, file), 'utf8'));
  for (const file of JSON.parse(fs.readFileSync(path.join(baseline, 'protected-files.json'), 'utf8').replace(/^\uFEFF/, ''))) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file.Path)).digest('hex').toUpperCase(), file.Hash);
  }
  pass('old official page and preexisting desktop-pet changes are byte-for-byte unchanged');
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ url, results, errors, failed, screens: sections, generatedAt: new Date().toISOString() }, null, 2));
  await browser.close();
  console.log(`Review: ${out}`);
})().catch(error => { console.error(error); process.exit(1); });
