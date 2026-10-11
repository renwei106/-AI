const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict'), fs = require('node:fs');
const before = process.argv.includes('--before');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const origin = 'http://127.0.0.1:4328';
    const context = await browser.newContext({ viewport: { width: 2066, height: 1070 } });
    await context.route('**/*', r => new URL(r.request().url()).origin === origin ? r.continue() : r.abort());
    await context.route('**/api/shiyu/auth/wechat/qr**', r => r.fulfill({ json: {} }));
    await context.route('**/api/shiyu/theme-access**', r => r.fulfill({ json: {
      items: ['base', 'emergence'].map(id => ({ id, enabled: true, allowed: true, memberOnly: false })),
      fallback: 'base', member: false, previews: {}, trial: { mode: 'daily', value: 10 }
    } }));
    await context.route('**/assets/emergence/engine.js', r => r.fulfill({ contentType: 'text/javascript', body:
      fs.readFileSync(before ? 'baselines/emergence-continuity-before-20261003/engine.js' : 'dist/assets/emergence/engine.js', 'utf8')
        .replace('this.canvas = canvas;', 'window.__testEngine=this; this.canvas = canvas;')
    }));
    if (before) await context.route('**/emergence-theme.js', r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync('baselines/emergence-continuity-before-20261003/emergence-theme.js', 'utf8') }));
    await context.addInitScript(() => {
      localStorage.setItem('yiyu-prototype-v1', JSON.stringify({ prefs: { theme: 'emergence', mode: 'dark', brandGuideDismissed: true }, signed: false }));
      localStorage.setItem('shiyu-emergence-v1:guest', JSON.stringify({ scene: 'birds', configs: { birds: { depth: 'depth', pointer: 'magnify' } } }));
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin);
    await page.evaluate(async () => { await window.ShiyuFeatureConfig?.refresh(); await document.fonts.ready; });
    await page.waitForFunction(() => window.__testEngine && !__testEngine.destroyed && document.documentElement.classList.contains('shiyu-account-ready'));
    await page.waitForTimeout(300);
    const timing = await page.evaluate(() => {
      const e = __testEngine, result = {};
      // Dispatch the actual off-canvas pointer path before every controlled animation frame.
      for (const depth of ['flat', 'depth']) {
        e.setConfig({ ...e.config, depth }); e.setPaused(false); cancelAnimationFrame(e.raf);
        const start = e.time; e.lastFrame = 1000; e.accumulator = 0;
        for (let i = 1; i <= 60; i++) {
          document.querySelector('.brand').dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }));
          e.frame(1000 + i * 1000 / 60); cancelAnimationFrame(e.raf);
        }
        result[depth] = e.time - start;
      }
      e.lastFrame = 0; e.accumulator = 0; e.raf = requestAnimationFrame(e.frame);
      window.__originalEngine = e;
      return result;
    });
    console.log(before ? 'BASELINE' : 'FIXED', timing);
    if (before) { assert(timing.flat < .1 && timing.depth < .1); return; }
    assert(timing.flat > .75 && timing.depth > .75, 'moving over controls must preserve simulation time');
    const continues = async action => {
      const time = await page.evaluate(() => __testEngine.time);
      await action(); await page.waitForTimeout(220);
      assert(await page.evaluate(t => __testEngine === __originalEngine && !__testEngine.destroyed && __testEngine.time > t, time), 'interaction must retain a running engine');
    };
    await continues(() => page.locator('.brand').hover());
    await continues(() => page.locator('[data-brand-theme="base"]').hover());
    await continues(() => page.locator('.emergence-open').click());
    await continues(() => page.locator('#emergence-speed').press('ArrowRight'));
    await continues(() => page.locator('#emergence-predators').press('ArrowRight'));
    await continues(() => page.evaluate(() => { prefs.mode = 'light'; render(); }));
    assert(await page.locator('#emergence-panel').isVisible(), 'appearance refresh retains open panel');
    await page.screenshot({ path: 'checks/emergence/continuity-settings.png' });
    await page.locator('[data-emergence-action="pause"]').click();
    const paused = await page.evaluate(() => __testEngine.time);
    await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __testEngine.time), paused);
    await continues(() => page.locator('[data-emergence-action="pause"]').click());
    await page.locator('[data-emergence-field="depth"][data-emergence-value="flat"]').click();
    await page.locator('[data-emergence-action="close"]').click();
    await page.mouse.move(1000, 600); await page.mouse.down(); await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => __testEngine.boost), 2);
    await page.mouse.up(); assert.equal(await page.evaluate(() => __testEngine.boost), 1);
    await page.locator('.brand').hover(); await page.locator('[data-brand-theme="base"]').click();
    await page.waitForFunction(() => __originalEngine.destroyed && !document.querySelector('.emergence-canvas'));
    assert.deepEqual(errors, []);
    console.log('PASS menu hover, settings, shared appearance refresh, explicit pause/resume, hold/release and actual theme exit');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
