const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const out = path.join(__dirname, 'scroll-review');
  const report = { viewports: [] };
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    const p = await browser.newPage({ viewport });
    await p.goto('http://127.0.0.1:4320/official/v2/index.html', { waitUntil: 'networkidle' });
    for (let chapter = 0; chapter <= 4; chapter++) {
      await p.evaluate(c => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * c / 4), chapter);
      await p.waitForTimeout(1000);
      const result = await p.evaluate(() => {
        const scene = document.querySelector('.scene:not([inert])');
        const rect = scene.querySelector('.scene-copy').getBoundingClientRect();
        return { active: scene.dataset.scene, top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
      });
      assert.equal(result.active, String(chapter));
      assert(result.top >= 55 && result.bottom < viewport.height - 55, JSON.stringify({ viewport, chapter, result }));
      assert(result.left >= 0 && result.right <= viewport.width);
      if (chapter === 0 || chapter === 4) await p.screenshot({ path: path.join(out, viewport.width + '-' + chapter + '.png') });
    }
    report.viewports.push(viewport);
    await p.close();
  }
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:4320/official/v2/index.html', { waitUntil: 'networkidle' });
  for (const fraction of [.12, .14, .16, .38, .40, .65, .88]) {
    await p.evaluate(f => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), fraction);
    await p.waitForTimeout(850);
    const strong = await p.locator('.scene').evaluateAll(scenes => scenes.filter(scene => {
      const copy = scene.querySelector('.scene-copy');
      return Number(getComputedStyle(scene).opacity) * Number(getComputedStyle(copy).opacity) > .02;
    }).length);
    assert(strong <= 1, 'transition text overlaps at ' + fraction);
  }
  report.noOverlappingCopy = true;
  await p.evaluate(() => scrollTo(0, 1500));
  await p.waitForTimeout(1000);
  const times = await p.evaluate(() => new Promise(resolve => {
    const list = []; let last = performance.now();
    function sample(now) { list.push(now - last); last = now; if (list.length < 90) requestAnimationFrame(sample); else resolve(list.slice(3)); }
    requestAnimationFrame(sample);
  }));
  times.sort((a, b) => a - b);
  report.frameTime = { medianMs: times[Math.floor(times.length * .5)], p95Ms: times[Math.floor(times.length * .95)], note: 'Headless Edge on this workstation; device-specific.' };
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: path.join(out, 'desktop-00.png') });
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.goto('http://127.0.0.1:4320/official/v2/index.html', { waitUntil: 'networkidle' });
  await m.screenshot({ path: path.join(out, 'mobile-0.png') });
  fs.writeFileSync(path.join(out, 'finish-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
