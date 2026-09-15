const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');
const fs = require('node:fs');
const assets = path.resolve(__dirname, '../../dist/official/assets');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4318/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(__dirname, 'product-before.png') });
  await page.evaluate(() => { document.querySelector('[data-dismiss-guide]')?.click(); });
  console.log('themes', await page.evaluate(() => Object.keys(THEMES)));
  for (const theme of ['base','cinema','music','paper','cosmos','flip']) {
    await page.evaluate(theme => { view = 'home'; scope = 'global'; changeTheme(theme); }, theme);
    await page.waitForTimeout(950);
    await sharp(await page.screenshot()).webp({ quality: 88 }).toFile(path.join(assets, theme + '.webp'));
    console.log('captured', theme);
  }
  await page.evaluate(() => {
    view = 'home'; scope = 'global'; changeTheme('base'); signed = true;
    data = data.slice(0, 3).map(s => ({...s,scenes:s.scenes.slice(0,2).map(c=>({...c,groups:c.groups.slice(0,2)}))}));
    goSpace(data[0].id);
  });
  await page.waitForTimeout(700);
  await sharp(await page.screenshot()).webp({ quality: 90 }).toFile(path.join(assets, 'workspace.webp'));
  await page.evaluate(() => { view='home'; render(); searchType='saved'; quickSearch(); });
  const input = page.locator('#quick-search input').first();
  await input.fill('设计');
  await input.dispatchEvent('input');
  await page.waitForTimeout(300);
  await sharp(await page.screenshot()).webp({ quality: 90 }).toFile(path.join(assets,'search.webp'));
  for (const [source, target] of [['poster-sea.png','sea.webp'],['poster-road.png','road.webp'],['poster-night.png','night.webp']]) {
    await sharp(path.resolve(assets, '../../', source)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join(assets,target));
  }
  await browser.close();
  console.log('Product assets ready');
})().catch(error => { console.error(error); process.exit(1); });
