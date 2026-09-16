const { chromium } = require('C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage({viewport:{width:1573,height:1041}});
  await page.goto('http://127.0.0.1:4318');
  await page.evaluate(() => { prefs.theme='base'; prefs.mode='light'; prefs.color='#48614c'; signed=true; render(); });
  await page.screenshot({path:'checks/space-atlas/home-before.png'});
  await page.evaluate(() => goSpace(data[0].id));
  await page.screenshot({path:'checks/space-atlas/space-before.png'});
  fs.writeFileSync('checks/space-atlas/baseline.json', JSON.stringify(await page.evaluate(() => ({data,styles,prefs,html:document.querySelector('.workspace').innerHTML})),null,2));
  console.log(await page.locator('.workspace-top').innerText());
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
