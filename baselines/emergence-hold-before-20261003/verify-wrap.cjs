const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let browser;
(async () => {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:4327/'); await page.waitForFunction(() => window.__emergence);
  const results = await page.evaluate(async () => {
    const e = window.__emergence.engine, { defaultsFor } = await import('./scenes.js');
    const runs = [], check = (condition, message) => { if (!condition) throw Error(message); };
    for (const id of ['birds', 'fish', 'water', 'cosmos']) {
      e.setScene(id, { ...defaultsFor(id), pointer: 'none' });
      const { width: w, height: h } = e.world;
      const xs = e.particles.map(p => p.x), ys = e.particles.map(p => p.y);
      const headings = new Set(e.particles.map(p => Math.floor((Math.atan2(p.vy, p.vx) + Math.PI) / (Math.PI / 4)) % 8));
      check(Math.min(...xs) < w * .1 && Math.max(...xs) > w * .9 && Math.min(...ys) < h * .1 && Math.max(...ys) > h * .9, id + ' random positions cover full viewport');
      check(headings.size === 8, id + ' headings span every direction');
      const corners = [];
      for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const p = e.model.create(e, 0); Object.assign(p, { x: sx > 0 ? w - .01 : .01, y: sy > 0 ? h - .01 : .01, vx: sx, vy: sy });
        const before = { x: p.x, y: p.y }; e.particles = [p]; e.step();
        check(sx > 0 ? p.x < 4 : p.x > w - 4, id + ' horizontal wrapping');
        check(sy > 0 ? p.y < 4 : p.y > h - 4, id + ' vertical wrapping');
        check(Math.sign(p.vx) === sx && Math.sign(p.vy) === sy, id + ' preserves heading');
        const wrap = (n, length) => ((n % length) + length) % length;
        check(Math.abs(p.x - wrap(before.x + p.vx, w)) < 1e-8 && Math.abs(p.y - wrap(before.y + p.vy, h)) < 1e-8, id + ' preserves overshoot');
        corners.push([p.x, p.y]);
      }
      runs.push({ id, headings: headings.size, corners });
    }
    e.setScene('birds', { ...defaultsFor('birds'), pointer: 'none' });
    const { width: w, height: h } = e.world;
    const pair = (x1, y1, x2, y2) => {
      e.particles = [e.model.create(e, 0), e.model.create(e, 1)];
      e.particles.forEach((p, i) => Object.assign(p, { x: i ? x2 : x1, y: i ? y2 : y1, vx: 1.45, vy: 0, phase: 0 }));
      e.time = 0; e.step(); return e.particles.map(p => [p.ax, p.ay]);
    };
    const seam = pair(1, 1, w - 9, h - 9), middle = pair(w / 2, h / 2, w / 2 - 10, h / 2 - 10);
    check(seam.every((force, i) => force.every((v, j) => Math.abs(v - middle[i][j]) < 1e-9)), 'corner neighbors behave like adjacent interior neighbors');
    e.setScene('birds', { ...defaultsFor('birds'), predators: 1, replenish: 'no', pointer: 'none' });
    const prey = e.particles[0]; Object.assign(prey, { x: w - 2, y: h / 2, vx: 0, vy: 1.45 }); e.particles = [prey];
    Object.assign(e.predators[0], { x: 1, y: h / 2, vx: 0, vy: 0, rest: 0 }); e.step();
    check(e.captured === 1 && e.particles.length === 0, 'predator captures across the seam');
    e.setScene('cosmos', defaultsFor('cosmos'));
    const star = e.particles[0]; Object.assign(star, { x: w - .01, y: h / 2, vx: 2, vy: 0, trail: [[w - 20, h / 2], [w - 10, h / 2]] }); e.particles = [star]; e.step();
    check(star.trail.length === 0, 'wrapped star does not draw a viewport-spanning trail');
    e.setScene('water', defaultsFor('water')); const drop = e.particles[0]; drop.x = 0; drop.y = h / 2; e.particles = [drop]; e.draw();
    const surface = e.fluidSurface, row = Math.round(surface.surface.height / 2), fw = surface.surface.width;
    check(surface.pixels.data[(row * fw) * 4 + 3] > 0 && surface.pixels.data[(row * fw + fw - 1) * 4 + 3] > 0, 'water surface appears on both edges');
    e.setScene('birds', defaultsFor('birds'));
    check(e.origin.x === 0 && e.origin.y === 0 && Math.abs(w * e.scale - e.width) < 1e-8 && Math.abs(h * e.scale - e.height) < 1e-8, 'world boundary is the visible screen boundary');
    return { runs, periodicNeighbors: true, captureAcrossSeam: true, waterSurfaceWrap: true, trailSafe: true, screenAligned: true };
  });
  const out = path.resolve(__dirname, '../../checks/emergence');
  await page.screenshot({ path: path.join(out, 'random-start-desktop.png') });
  const before = await page.evaluate(() => { const e = window.__emergence.engine; return { x: e.particles[0].x / e.world.width, y: e.particles[0].y / e.world.height }; });
  await page.setViewportSize({ width: 390, height: 844 });
  const after = await page.evaluate(() => { const e = window.__emergence.engine; return { x: e.particles[0].x / e.world.width, y: e.particles[0].y / e.world.height, fit: Math.abs(e.world.width * e.scale - innerWidth) < 1e-8 && Math.abs(e.world.height * e.scale - innerHeight) < 1e-8 }; });
  assert.ok(Math.abs(before.x - after.x) < 1e-8 && Math.abs(before.y - after.y) < 1e-8 && after.fit);
  await page.getByRole('button', { name: '收起调节面板', exact: true }).click();
  await page.screenshot({ path: path.join(out, 'random-start-mobile.png') });
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(out, 'wrap-results.json'), JSON.stringify({ ...results, resizePreserved: true, errors }, null, 2));
  console.log('PASS: all scenes start scattered; all four corner crossings preserve heading and overshoot; periodic neighbors/capture/water surface; no long star trails; desktop and mobile screen-aligned bounds.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => browser?.close());
