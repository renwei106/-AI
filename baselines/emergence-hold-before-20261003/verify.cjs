const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }

const output = path.resolve(__dirname, '../../checks/emergence');
const url = process.env.EMERGENCE_URL || 'http://127.0.0.1:4327/';
const results = { checks: [], errors: [], stability: [], screenshots: [] };
const pass = text => { results.checks.push(text); console.log('PASS: ' + text); };
let browser;

(async () => {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  const writes = []; page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(request.url()); });
  await page.goto(url); await page.waitForFunction(() => window.__emergence);
  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  const snapshot = () => page.evaluate(() => window.__emergence.snapshot());
  const slide = async (key, value) => page.locator(`#control-${key}`).evaluate((input, value) => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }, value);
  const scene = async name => page.getByRole('button', { name: name + '场景', exact: true }).click();
  const screenshot = async name => { await page.screenshot({ path: path.join(output, name) }); results.screenshots.push(name); };

  assert.equal((await snapshot()).count, 420);
  const frozen = (await snapshot()).particles; await page.waitForTimeout(200); assert.deepEqual((await snapshot()).particles, frozen);
  await page.locator('#control-speed').focus(); await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('#control-speed').inputValue(), '0.85');
  await slide('count', 200); assert.equal((await snapshot()).count, 200);
  await slide('predators', 2); assert.equal((await snapshot()).predators, 2);
  await page.getByRole('button', { name: '短线', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__emergence.engine.config.shape), 'line');
  pass('Paused simulation stays still; keyboard sliders, count, shape and predator controls affect the engine immediately.');

  await scene('鱼群'); assert.equal((await snapshot()).model, 'flock'); assert.equal(await page.locator('#control-current').count(), 1);
  await slide('current', 1.2); await slide('count', 180);
  await scene('水滴'); assert.equal((await snapshot()).model, 'fluid'); assert.equal(await page.locator('#control-predators').count(), 0); assert.equal(await page.locator('#control-viscosity').count(), 1);
  await scene('宇宙'); assert.equal((await snapshot()).model, 'gravity'); assert.equal(await page.locator('#control-centers').count(), 1); assert.equal(await page.locator('#control-predators').count(), 0);
  await scene('鸟群'); assert.equal(await page.locator('#control-count').inputValue(), '200'); assert.equal(await page.locator('#control-speed').inputValue(), '0.85');
  await page.waitForTimeout(250); await page.reload(); await page.waitForFunction(() => window.__emergence);
  assert.equal(await page.locator('#control-count').inputValue(), '200'); assert.equal(await page.locator('#control-predators').inputValue(), '2');
  await scene('鱼群'); assert.equal(await page.locator('#control-current').inputValue(), '1.2');
  await page.getByRole('button', { name: '恢复场景', exact: true }).click(); assert.equal(await page.locator('#control-current').inputValue(), '0.55');
  await scene('鸟群'); assert.equal(await page.locator('#control-count').inputValue(), '200');
  pass('Scene-specific schemas and independent preferences survive reload; resetting fish does not reset birds.');

  const predation = await page.evaluate(async () => {
    const e = window.__emergence.engine, { defaultsFor } = await import('./scenes.js');
    e.setPaused(true); e.setScene('birds', { ...defaultsFor('birds'), count: 60, predators: 1 });
    Object.assign(e.predators[0], { x: e.particles[0].x, y: e.particles[0].y, rest: 0 });
    e.step(); const caught = e.snapshot(); e.setConfig({ ...e.config, predators: 0 });
    for (let i = 0; i < 180; i++) e.step(); const replenished = e.snapshot();
    e.setScene('birds', { ...defaultsFor('birds'), count: 60, predators: 1, replenish: 'no' });
    Object.assign(e.predators[0], { x: e.particles[0].x, y: e.particles[0].y, rest: 0 });
    e.step(); const natural = e.snapshot(); e.setConfig({ ...e.config, predators: 0 });
    for (let i = 0; i < 180; i++) e.step(); const after = e.snapshot();
    return { caught, replenished, natural, after };
  });
  assert.equal(predation.caught.captured, 1); assert.equal(predation.caught.count, 59); assert.equal(predation.caught.pending, 1);
  assert.equal(predation.replenished.count, 60); assert.equal(predation.replenished.pending, 0);
  assert.equal(predation.natural.count, 59); assert.equal(predation.after.count, 59);
  pass('Actual contact captures one prey; automatic replenishment restores the target; natural reduction does not silently respawn.');

  await page.getByRole('button', { name: '恢复场景', exact: true }).click();
  await page.mouse.move(650, 550); assert.equal(await page.evaluate(() => window.__emergence.engine.pointer.active), true);
  await page.mouse.move(1200, 400); assert.equal(await page.evaluate(() => window.__emergence.engine.pointer.active), false);
  await page.getByRole('button', { name: '收起调节面板', exact: true }).click();
  assert.equal(await page.locator('#settings').evaluate(e => e.inert), true);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'open-panel');
  await page.getByRole('button', { name: '调节风景', exact: true }).click(); assert.equal(await page.evaluate(() => document.activeElement.id), 'close-panel');
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#open-panel').getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: '调节风景', exact: true }).click();
  pass('Pointer influence stops over the panel; open, close and Escape preserve keyboard focus and hide inactive controls.');

  results.stability = await page.evaluate(async () => {
    const { SCENES, defaultsFor, fieldsFor, sanitize } = await import('./scenes.js');
    const e = window.__emergence.engine, samples = [];
    e.setPaused(true);
    for (const id of Object.keys(SCENES)) {
      const parameters = defaultsFor(id); parameters.count = id === 'water' ? 100 : 140;
      e.setScene(id, parameters); const start = performance.now();
      for (let i = 0; i < 3600; i++) e.step();
      samples.push({ id, mode: '60 simulation seconds', ms: performance.now() - start, ...e.snapshot(), particles: undefined });
      const max = Object.fromEntries(fieldsFor(id).map(field => [field.key, field.type === 'range' ? field.max : field.value]));
      e.setScene(id, max);
      for (let i = 0; i < 300; i++) e.step();
      samples.push({ id, mode: 'maximum parameters', ...e.snapshot(), particles: undefined });
      const min = Object.fromEntries(fieldsFor(id).map(field => [field.key, field.type === 'range' ? field.min : field.value]));
      e.setScene(id, min);
      for (let i = 0; i < 300; i++) e.step();
      samples.push({ id, mode: 'minimum parameters', ...e.snapshot(), particles: undefined });
      const corrupted = sanitize(id, { count: -99999, speed: Infinity, pointer: 'invalid', gravity: NaN });
      if (!Object.values(corrupted).every(v => typeof v === 'string' || Number.isFinite(v))) throw Error('Invalid persisted parameter survived');
    }
    return samples;
  });
  for (const sample of results.stability) { assert.equal(sample.finite, true, sample.id + ' remains finite'); assert.ok(sample.count <= sample.populationLimit); assert.ok(sample.predators <= sample.predatorLimit); }
  pass('All four models remain finite through 60 simulated seconds and min/max parameter runs; corrupted values are sanitized.');

  // Sync the interface after model-level tests before visual inspection.
  await page.getByRole('button', { name: '恢复场景', exact: true }).click();
  for (const [id, name] of [['birds', '鸟群'], ['fish', '鱼群'], ['water', '水滴'], ['cosmos', '宇宙']]) {
    if ((await snapshot()).scene !== id) await scene(name);
    await page.evaluate(() => { const e = window.__emergence.engine; e.setPaused(true); for (let i = 0; i < 480; i++) e.step(); e.draw(); });
    await screenshot(`${id}-light-desktop.png`);
  }
  await page.getByRole('button', { name: '切换深色外观', exact: true }).click();
  assert.equal(await page.locator('body').getAttribute('data-dark'), 'true');
  await screenshot('cosmos-dark-desktop.png');
  await scene('鸟群'); await page.locator('#advanced summary').click();
  await page.locator('#advanced').scrollIntoViewIfNeeded(); await screenshot('birds-dark-advanced.png');
  await slide('alignment', 1.8); assert.equal(await page.evaluate(() => window.__emergence.engine.config.alignment), 1.8);
  await page.getByRole('button', { name: '恢复场景', exact: true }).click(); assert.equal(await page.evaluate(() => window.__emergence.engine.config.alignment), 1.1);
  await page.locator('#advanced summary').click();
  await page.getByRole('button', { name: '切换浅色外观', exact: true }).click();
  await page.locator('.panel-scroll').evaluate(e => e.scrollTop = 0);

  await page.setViewportSize({ width: 1280, height: 800 }); await screenshot('birds-light-1280.png');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '收起调节面板', exact: true }).click(); await page.waitForTimeout(450); await screenshot('birds-mobile-closed.png');
  await page.getByRole('button', { name: '调节风景', exact: true }).click(); await page.waitForTimeout(450); await screenshot('birds-mobile-panel.png');
  const panelBox = await page.locator('#settings').boundingBox(); assert.ok(panelBox.x >= 0 && panelBox.x + panelBox.width <= 391);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.locator('#advanced summary').scrollIntoViewIfNeeded(); await page.locator('#advanced summary').click();
  await page.locator('#control-cohesion').scrollIntoViewIfNeeded(); await slide('cohesion', 1.5);
  assert.equal(await page.evaluate(() => window.__emergence.engine.config.cohesion), 1.5);
  pass('Light/dark appearances, expanded advanced controls, desktop/tablet/mobile panel layouts and scrolling are usable without horizontal overflow.');

  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const quiet = await reduced.newPage(); await quiet.goto(url); await quiet.waitForFunction(() => window.__emergence);
  assert.equal(await quiet.evaluate(() => window.__emergence.engine.paused), true);
  assert.equal(await quiet.locator('#open-panel').getAttribute('aria-expanded'), 'false');
  await reduced.close();
  const blocked = await browser.newContext(); await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage disabled'); }; });
  const noStorage = await blocked.newPage(); await noStorage.goto(url); await noStorage.waitForFunction(() => window.__emergence);
  assert.match(await noStorage.locator('#save-status').innerText(), /存储不可用/); await blocked.close();
  pass('Reduced-motion preference starts paused; mobile starts with the panel closed; unavailable storage is reported without blocking interaction.');
  assert.deepEqual(writes, []); assert.deepEqual(results.errors, []);
  pass('No page JavaScript errors and no write requests to any service.');
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
})().catch(error => { results.failure = error.stack; fs.mkdirSync(output, { recursive: true }); fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2)); console.error(error); process.exitCode = 1; }).finally(async () => browser?.close());
