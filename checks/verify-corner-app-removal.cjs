const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const removed = new Set(['icons', 'palette', 'cutout']);
  const configured = (await (await fetch('http://127.0.0.1:5175/api/shiyu/operations')).json()).corner.modules.map(item => item.id);
  assert.deepEqual(configured, ['common', 'memo', 'todo', 'emoji', 'excalidraw', 'toolbox']);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const home = await browser.newPage({ viewport: { width: 1375, height: 992 } });
    await home.route('**/api/shiyu/auth/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
    await home.goto('http://127.0.0.1:4337/', { waitUntil: 'domcontentloaded' });
    await home.evaluate(() => { signed = true; prefs.accountProfile = { id: 'corner-removal-qa' }; persist(); render(); });
    await home.waitForFunction(() => ShiyuCornerModules.enabled().length === 5);
    const shelf = home.frameLocator('#corner-orbit-demo');
    await shelf.locator('[data-shiyu-module-id=toolbox]').waitFor();
    const shelfIds = await shelf.locator('.menu-item:not([hidden])').evaluateAll(items => items.map(item => item.dataset.shiyuModuleId));
    assert.deepEqual(shelfIds, ['common', 'memo', 'todo', 'excalidraw', 'toolbox']);
    await shelf.locator('.core').hover({ force: true });
    await shelf.locator('.stage.is-filled').waitFor();
    await shelf.locator('[data-shiyu-module-id=toolbox]').click();
    await home.locator('.corner-tool-row').first().waitFor();
    const toolboxIds = await home.locator('[data-corner-open-tool]').evaluateAll(items => [...new Set(items.map(item => item.dataset.cornerOpenTool))]);
    assert(toolboxIds.includes('excalidraw'));
    assert([...removed].every(id => !toolboxIds.includes(id)));

    const admin = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await admin.route('**/api/**', route => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === '/api/shiyu/operations') return route.continue();
      const reply = value => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(value) });
      if (pathname === '/api/platform/session') return reply({ active: true, admin: { id: 'qa', name: '隔离验证', account: 'qa' }, applicationIds: ['platform', 'shiyu'], roleIds: ['superadmin'] });
      if (pathname === '/api/platform/applications') return reply([{ id: 'shiyu', name: '拾隅', url: 'http://127.0.0.1:5175/apps/shiyu/feature-flags', enabled: true }]);
      return reply({ items: [] });
    });
    await admin.goto('http://127.0.0.1:5175/apps/shiyu/feature-flags', { waitUntil: 'domcontentloaded' });
    await admin.getByRole('button', { name: '管理子应用' }).click();
    const adminIds = await admin.locator('[data-corner-module]').evaluateAll(items => items.map(item => item.dataset.cornerModule));
    assert.deepEqual(adminIds, configured);
    console.log('PASS: removed tools absent from home shelf, Toolbox, and local admin; other configured tools remain');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
