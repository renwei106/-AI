const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const out = path.join(__dirname, 'particles-review', 'entry-rings');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    let factory;
    Object.defineProperty(window, 'createShiyuWorld', {
      get: () => factory,
      set: original => { factory = canvas => {
        const world = original(canvas);
        window.reviewWorld = world;
        return world;
      }; }
    });
  });
  await page.goto('http://127.0.0.1:4320/official/v2/index.html', { waitUntil: 'networkidle' });
  for (const stage of [4, 5, 6]) {
    await page.evaluate(stage => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * stage / 7), stage);
    await page.waitForTimeout(200);
    for (const time of stage === 4 ? [0, 8, 16] : stage === 5 ? [0, 30, 60] : [0, .5, 1]) {
      await page.evaluate(({ stage, time }) => window.reviewWorld.paint(stage, stage, 0, time), { stage, time });
      await page.screenshot({ path: path.join(out, `${stage}-${time}.png`) });
      if (stage === 4) {
        const a = 5.2 + time * .04, tilt = -.13, r = 1.4;
        const x = Math.cos(a) * r, y = Math.sin(a) * r * .34, z = Math.sin(a) * r * .28;
        const perspective = 3.8 / (3.8 - z * .97), scale = 270 * .97 * perspective;
        const cx = 720 + (x * Math.cos(tilt) - y * Math.sin(tilt)) * scale;
        const cy = 306 - (x * Math.sin(tilt) + y * Math.cos(tilt)) * scale;
        await page.screenshot({ path: path.join(out, `saturn-${time}.png`), clip: { x: cx - 65, y: cy - 40, width: 130, height: 80 } });
      }
    }
  }
  assert.equal(errors.length, 0, errors.join('\n'));
  await browser.close();
  console.log(JSON.stringify({ passed: true, review: out }));
})().catch(error => { console.error(error); process.exit(1); });
