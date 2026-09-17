const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', e => console.log('PAGE ERROR', e.message));
    await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { signed = true; prefs.accountProfile = { id: 'feedback-review', name: '访客测试' }; prefs.theme = 'base'; prefs.mode = 'light'; prefs.color = '#48614c'; render(); });
    await page.locator('[data-account-open]').click();
    await page.screenshot({ path: 'checks/feedback-20260917/menu.png' });
    await page.locator('[data-menu-feedback]').click();
    await page.waitForTimeout(300);
    console.log(await page.locator('#support-feedback').evaluate(d => ({ rect: d.getBoundingClientRect().toJSON(), scroll: [...d.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 3 && e.clientHeight > 0).map(e => ({ el: e.className, h: e.clientHeight, sh: e.scrollHeight })) })));
    await page.screenshot({ path: 'checks/feedback-20260917/desktop-light.png' });
    await page.evaluate(() => { prefs.mode = 'dark'; render(); });
    await page.screenshot({ path: 'checks/feedback-20260917/desktop-dark.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { prefs.mode = 'light'; render(); });
    await page.screenshot({ path: 'checks/feedback-20260917/mobile-light.png' });
    console.log(await page.locator('#support-feedback').evaluate(d => ({ rect: d.getBoundingClientRect().toJSON(), bodyScroll: document.body.scrollWidth, scroll: d.querySelector('.feedback-scroll').getBoundingClientRect().toJSON(), scrollHeight: d.querySelector('.feedback-scroll').scrollHeight })));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
