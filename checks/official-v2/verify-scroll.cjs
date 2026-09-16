const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const out = path.join(__dirname, 'scroll-review');
const url = 'http://127.0.0.1:4320/official/v2/index.html';
fs.mkdirSync(out, { recursive: true });
const errors = [], missing = [], report = {};

async function settle(page) { await page.waitForTimeout(1000); }
async function position(page, fraction) {
  await page.evaluate(f => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * f, behavior: 'instant' }), fraction);
  await settle(page);
}
async function state(page) {
  return page.evaluate(() => ({
    y: scrollY,
    chapter: document.querySelector('.experience').dataset.chapter,
    stage: (() => { const r = document.querySelector('.experience').getBoundingClientRect(); return { top: r.top, height: r.height }; })(),
    overflow: document.documentElement.scrollWidth > innerWidth,
    active: [...document.querySelectorAll('.scene')].filter(n => !n.inert).map(n => n.dataset.scene),
    textBounds: [...document.querySelectorAll('.scene:not([inert]) h1,.scene:not([inert]) h2')].map(n => {
      const r = n.getBoundingClientRect();
      return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, text:n.innerText };
    }),
    images: [...document.images].every(i => i.complete && i.naturalWidth > 0)
  }));
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) missing.push(r.url()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await settle(page);
  report.initial = await state(page);
  assert.equal(report.initial.chapter, '0');
  assert.equal(await page.locator('button').count(), 0, 'no click gate');
  await page.screenshot({ path: path.join(out, 'desktop-00.png') });

  await page.mouse.wheel(0, 1500);
  await settle(page);
  report.wheelForward = await state(page);
  assert(report.wheelForward.y > 0);
  assert.equal(report.wheelForward.stage.top, 0);
  assert.equal(report.wheelForward.chapter, '1');
  await page.mouse.wheel(0, -1500);
  await settle(page);
  assert.equal((await state(page)).chapter, '0');
  report.reverseWheel = true;

  report.chapters = [];
  for (const [index, fraction] of [0, .25, .5, .75, 1].entries()) {
    await position(page, fraction);
    const s = await state(page);
    report.chapters.push(s);
    assert.equal(s.chapter, String(index));
    assert.equal(s.active.length, 1);
    assert.equal(s.stage.top, 0);
    assert.equal(s.stage.height, 900);
    assert.equal(s.overflow, false);
    assert(s.images);
    assert(s.textBounds.every(r => r.x >= 0 && r.right <= 1440 && r.y >= 0 && r.bottom <= 900));
    await page.screenshot({ path: path.join(out, 'desktop-' + String(index).padStart(2, '0') + '.png') });
  }
  await position(page, .39);
  await page.screenshot({ path: path.join(out, 'desktop-transition.png') });

  await page.keyboard.press('End'); await settle(page);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'enter-link');
  await page.locator('.enter-link').click();
  await page.waitForURL('http://127.0.0.1:4318/');
  report.productLink = page.url();
  await page.goBack({ waitUntil: 'networkidle' });
  await page.keyboard.press('Home'); await settle(page);
  assert.equal((await state(page)).chapter, '0');
  report.keyboard = true;

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const mp = await mobile.newPage();
  mp.on('pageerror', e => errors.push(e.message));
  await mp.goto(url, { waitUntil: 'networkidle' });
  const cdp = await mobile.newCDPSession(mp);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 700 }] });
  for (let y = 660; y >= 160; y -= 50) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y }] });
    await mp.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle(mp);
  assert((await state(mp)).y > 0, 'native touch scroll works');
  report.mobileSwipe = true;
  report.mobile = [];
  for (let index = 0; index < 5; index++) {
    await position(mp, index / 4);
    const s = await state(mp);
    assert.equal(s.chapter, String(index));
    assert.equal(s.overflow, false);
    assert(s.textBounds.every(r => r.x >= 0 && r.right <= 390 && r.y >= 0 && r.bottom <= 844));
    report.mobile.push(s);
    await mp.screenshot({ path: path.join(out, 'mobile-' + index + '.png') });
  }

  const rp = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await rp.goto(url, { waitUntil: 'networkidle' });
  await position(rp, .5);
  assert.equal((await state(rp)).chapter, '2');
  await rp.screenshot({ path: path.join(out, 'reduced-a.png') });
  await rp.waitForTimeout(500);
  const a = fs.readFileSync(path.join(out, 'reduced-a.png'));
  const b = await rp.screenshot({ path: path.join(out, 'reduced-b.png') });
  assert(a.equals(b), 'reduced motion scene is static');
  report.reducedMotion = true;

  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(url);
  assert(await nojs.locator('.no-script a').isVisible());
  report.noJavaScriptEntry = true;
  const noGL = await browser.newPage();
  await noGL.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl' ? null : original.call(this, type, ...args);
    };
  });
  await noGL.goto(url, { waitUntil: 'networkidle' });
  await position(noGL, 1);
  assert(await noGL.locator('.enter-link').isVisible());
  report.noWebGL = true;

  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'v1-baseline-hashes.json'), 'utf8').replace(/^\uFEFF/, ''));
  for (const item of baseline) {
    const relative = path.relative(path.join(process.cwd(), 'baselines/official-v1-20260915'), item.Path);
    const current = path.join(process.cwd(), 'dist/official', relative);
    const hash = crypto.createHash('sha256').update(fs.readFileSync(current)).digest('hex').toUpperCase();
    assert.equal(hash, item.Hash, relative + ' V1 changed');
  }
  report.v1Preserved = true;
  report.errors = errors;
  report.missingAssets = missing;
  assert.equal(errors.length, 0);
  assert.equal(missing.length, 0);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify({ passed: true, output: out, checks: Object.keys(report) }));
})().catch(error => { console.error(error); process.exit(1); });
