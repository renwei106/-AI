const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const url = 'http://127.0.0.1:4320/official/v2/index.html';
const out = path.join(__dirname, 'particles-review');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [], failed = [], requested = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  page.on('request', r => requested.push(r.url()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  assert.equal(await page.locator('.scene').count(), 7);
  assert.equal(await page.locator('img').count(), 0);
  assert.equal(await page.locator('.chapter-jump').count(), 7);
  assert.equal(await page.locator('.sound-toggle').count(), 1);
  assert.equal(await page.locator('.brand').getAttribute('href'), '/');
  assert.equal(await page.locator('.brand').getAttribute('aria-label'), '进入拾隅主题页');
  assert.equal(await page.locator('#atmosphere').getAttribute('data-renderer'), 'webgl');
  const travel = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  assert(travel >= 15000 * .9);
  const forms = ['point', 'melody', 'birds', 'earth', 'solar-system', 'galaxy', 'atom'];
  const report = { travel, scenes: [], errors, failed, noPhotographs: true };
  for (let i = 0; i <= 6; i++) {
    await page.evaluate(i => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * i / 7), i);
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.experience').getAttribute('data-chapter'), String(i));
    assert.equal(await page.locator('.experience').getAttribute('data-form'), forms[i]);
    assert.equal(await page.locator('.chapter-jump[aria-current="step"]').getAttribute('data-chapter-jump'), String(i));
    const top = await page.locator('.experience').evaluate(n => n.getBoundingClientRect().top);
    assert.equal(top, 0);
    const copy = await page.locator('.scene:not([inert]) .scene-copy').boundingBox();
    assert(copy.y > 0 && copy.y + copy.height < 900);
    await page.screenshot({ path: path.join(out, 'desktop-' + i + '.png') });
    report.scenes.push({ form: forms[i], copy });
  }
  await page.keyboard.press('Home'); await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 2300); await page.waitForTimeout(1200);
  assert.equal(await page.locator('.experience').getAttribute('data-chapter'), '1');
  await page.mouse.wheel(0, -2300); await page.waitForTimeout(1200);
  assert.equal(await page.locator('.experience').getAttribute('data-chapter'), '0');
  report.wheelAndReverse = true;
  await page.locator('[data-chapter-jump="4"]').click();
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('.experience').getAttribute('data-chapter'), '4');
  assert.equal(await page.locator('.chapter-jump[aria-current="step"]').getAttribute('data-chapter-jump'), '4');
  await page.screenshot({ path: path.join(out, 'desktop-controls.png') });
  await page.evaluate(() => document.activeElement.blur());
  report.chapterJump = true;
  assert(!requested.some(r => /\.(webp|png|jpe?g)(\?|$)/.test(r)), 'raster image requested');
  assert(!requested.some(r => /\.(mp3|m4a|aac|ogg|wav|flac)(\?|$)/.test(r)), 'external audio requested');

  const audioPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  audioPage.on('pageerror', e => errors.push(e.message));
  await audioPage.goto(url, { waitUntil: 'networkidle' });
  const sound = audioPage.locator('.sound-toggle');
  assert.equal(await sound.getAttribute('data-audio-state'), 'ready');
  await sound.click();
  await audioPage.waitForTimeout(450);
  assert.equal(await sound.getAttribute('data-audio-state'), 'playing');
  assert.equal(await sound.getAttribute('aria-pressed'), 'true');
  await sound.click();
  await audioPage.waitForTimeout(100);
  assert.equal(await sound.getAttribute('data-audio-state'), 'muted');
  assert.equal(await sound.getAttribute('aria-pressed'), 'false');
  await audioPage.screenshot({ path: path.join(out, 'desktop-audio-muted.png') });
  await audioPage.close();
  report.ambientAudio = true;

  const brandEntry = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await brandEntry.goto(url, { waitUntil: 'networkidle' });
  await Promise.all([
    brandEntry.waitForURL(location => location.origin === 'http://127.0.0.1:4318'),
    brandEntry.locator('.brand').click()
  ]);
  assert.equal(new URL(brandEntry.url()).origin, 'http://127.0.0.1:4318');
  await brandEntry.close();
  report.brandThemeEntry = true;

  const movingForms = [[1, 'melody'], [2, 'birds'], [3, 'earth'], [4, 'solar-system'], [5, 'galaxy'], [6, 'atom']];
  for (const [chapter, label] of movingForms) {
    await page.evaluate(chapter => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * chapter / 7), chapter);
    await page.waitForTimeout(800);
    const before = await page.screenshot();
    await page.waitForTimeout(700);
    const after = await page.screenshot();
    assert(!before.equals(after), label + ' is not moving while held');
  }
  report.heldMotion = movingForms.map(([, label]) => label);

  const hoverPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  hoverPage.on('pageerror', e => errors.push(e.message));
  await hoverPage.goto(url, { waitUntil: 'networkidle' });
  await hoverPage.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 6 / 7));
  await hoverPage.waitForTimeout(1000);
  const entryAlignment = await hoverPage.locator('.entry-link').evaluate(link => {
    const frame = link.getBoundingClientRect(), label = link.querySelector('.entry-label').getBoundingClientRect();
    return Math.abs((frame.left + frame.width / 2) - (label.left + label.width / 2));
  });
  assert(entryAlignment < .6, 'entry label is not centered independently from its arrow');
  await hoverPage.locator('.entry-link').hover();
  await hoverPage.waitForTimeout(1300);
  assert.equal(await hoverPage.locator('.entry-link').evaluate(link => getComputedStyle(link, ':before').animationName), 'entry-sweep');
  assert.equal(await hoverPage.locator('.entry-link').evaluate(link => getComputedStyle(link, ':after').animationName), 'entry-border-sweep');
  assert.equal(await hoverPage.locator('.entry-link').evaluate(link => getComputedStyle(link, ':before').animationDuration), '2.8s');
  await hoverPage.screenshot({ path: path.join(out, 'desktop-6-entry-hover.png') });
  report.entryHover = true;
  await hoverPage.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  mobile.on('pageerror', e => errors.push(e.message));
  await mobile.goto(url, { waitUntil: 'networkidle' });
  for (let i = 0; i <= 6; i++) {
    await mobile.evaluate(i => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * i / 7), i);
    await mobile.waitForTimeout(1000);
    const box = await mobile.locator('.scene:not([inert]) .scene-copy').boundingBox();
    assert(box.x >= 0 && box.x + box.width <= 390 && box.y > 50 && box.y + box.height < 790, 'mobile copy clipped');
    if (i === 6) {
      const portal = await mobile.locator('.portal-link').boundingBox();
      assert(portal.x >= 0 && portal.x + portal.width <= 390 && portal.y > 50 && portal.y + portal.height < 790, 'mobile portal clipped');
      const entry = await mobile.locator('.entry-link').boundingBox();
      assert(entry.y > box.y + box.height && entry.y + entry.height < 820, 'mobile entry overlaps the closing copy');
    }
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth), 390);
    await mobile.screenshot({ path: path.join(out, 'mobile-' + i + '.png') });
  }
  report.mobile = true;
  await mobile.evaluate(() => scrollTo(0, 0));
  await mobile.waitForTimeout(800);
  const cdp = await mobile.context().newCDPSession(mobile);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 700 }] });
  for (let y = 650; y >= 150; y -= 50) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y }] });
    await mobile.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForTimeout(800);
  assert(await mobile.evaluate(() => scrollY > 0), 'native swipe does not scroll');
  report.nativeSwipe = true;

  report.smallViewports = [];
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    const small = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    small.on('pageerror', e => errors.push(e.message));
    await small.goto(url, { waitUntil: 'networkidle' });
    for (let i = 0; i <= 6; i++) {
      await small.evaluate(i => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * i / 7), i);
      await small.waitForTimeout(150);
      const copy = await small.locator('.scene:not([inert]) .scene-copy').boundingBox();
      const cue = await small.locator('.scroll-cue').boundingBox();
      const soundControl = await small.locator('.sound-toggle').boundingBox();
      const progressControl = await small.locator('.journey-progress').boundingBox();
      assert(copy.y > 50 && copy.y + copy.height < viewport.height - 35, JSON.stringify({ viewport, i, copy }));
      assert(copy.x >= 0 && copy.x + copy.width <= viewport.width);
      assert(soundControl.x >= 0 && soundControl.x + soundControl.width <= viewport.width && soundControl.y + soundControl.height <= viewport.height, 'sound control clipped');
      assert(progressControl.x >= 0 && progressControl.x + progressControl.width <= viewport.width && progressControl.y + progressControl.height <= viewport.height, 'progress control clipped');
      if (i === 6) {
        const portal = await small.locator('.portal-link').boundingBox();
        assert(portal.x >= 0 && portal.x + portal.width <= viewport.width && portal.y > 20 && portal.y + portal.height < viewport.height - 20, 'portal clipped');
        const entry = await small.locator('.entry-link').boundingBox();
        assert(entry.x >= 0 && entry.x + entry.width <= viewport.width && entry.y > copy.y + copy.height && entry.y + entry.height <= viewport.height - 15, 'bottom entry clipped or overlaps copy');
      }
      if (i !== 6) assert(copy.y + copy.height < cue.y, 'scroll cue overlaps copy: ' + JSON.stringify({ viewport, i, copy, cue }));
      assert.equal(await small.locator('.experience').getAttribute('data-form'), forms[i]);
      if ([1, 3, 6].includes(i)) await small.screenshot({ path: path.join(out, viewport.width + '-' + i + '.png') });
    }
    report.smallViewports.push(viewport);
    await small.close();
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (let i = 0; i < 6; i++) {
    for (const phase of [.40, .55, .62, .75, .9]) {
      await page.evaluate(p => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p / 7), i + phase);
      await page.waitForTimeout(50);
      const visibleCopy = await page.locator('.scene').evaluateAll(scenes => scenes.filter(scene =>
        Number(getComputedStyle(scene).opacity) * Number(getComputedStyle(scene.querySelector('.scene-copy')).opacity) > .02).length);
      assert(visibleCopy <= 1, 'copy overlaps in transition ' + i + ': ' + phase);
    }
  }
  report.noOverlappingCopy = true;
  await page.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 6 / 7));
  await page.waitForTimeout(150);
  await page.locator('.brand').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'portal-link');
  assert.equal(await page.locator('.portal-link').getAttribute('href'), '/');
  assert.equal(await page.locator('.portal-link').textContent(), '');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'entry-link');
  assert.equal(await page.locator('.entry-link').getAttribute('href'), '/');
  for (const selector of ['.portal-link', '.entry-link']) {
    assert(await page.locator(selector).evaluate(link => {
      const r = link.getBoundingClientRect();
      return link.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    }), selector + ' cannot receive a click');
  }
  const response = await page.request.get('http://127.0.0.1:4320/', { maxRedirects: 0 });
  assert.equal(response.headers().location, 'http://127.0.0.1:4318/');
  report.keyboardAndProductEntry = true;
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(180);
  assert.equal(await page.evaluate(() => scrollY), 0, 'bottom does not loop to the opening');
  assert.equal(await page.locator('.experience').getAttribute('data-chapter'), '0');
  report.loopReturn = true;
  const loopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await loopPage.goto(url, { waitUntil: 'networkidle' });
  await loopPage.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await loopPage.waitForTimeout(1800);
  assert.equal(await loopPage.evaluate(() => scrollY), 0, 'animated bottom loop does not reset');
  assert.equal(await loopPage.locator('.experience').getAttribute('data-chapter'), '0');
  await loopPage.close();
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(url);
  assert(await nojs.locator('.no-script a').isVisible());
  report.noJavaScriptEntry = true;
  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await reduced.goto(url, { waitUntil: 'networkidle' });
  await reduced.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 3 / 7));
  await reduced.waitForTimeout(300);
  const a = await reduced.screenshot();
  await reduced.waitForTimeout(500);
  const b = await reduced.screenshot();
  assert(a.equals(b), 'reduced motion is not static');
  report.reducedMotion = true;
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type === 'webgl' ? null : original.call(this, type, ...args); };
  });
  await fallback.goto(url, { waitUntil: 'networkidle' });
  await fallback.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 3 / 7));
  await fallback.waitForTimeout(1500);
  assert.equal(await fallback.locator('#atmosphere').getAttribute('data-renderer'), 'canvas');
  assert.equal(await fallback.locator('.experience').getAttribute('data-form'), 'earth');
  await fallback.screenshot({ path: path.join(out, 'fallback-earth.png') });
  report.fallback = true;
  assert.equal(errors.length, 0);
  assert.equal(failed.length, 0);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify({ passed: true, report: out }));
})().catch(e => { console.error(e); process.exit(1); });
