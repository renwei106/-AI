// Real Edge extension/MAIN/CSP regression. Every HTTPS request is an isolated fixture.
// Run with Node and Playwright installed, or set SHIYU_PLAYWRIGHT_MODULE to its module path.
const { chromium } = require(process.env.SHIYU_PLAYWRIGHT_MODULE || 'C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..');
  const fixtureDir = path.join(root, '.local'); fs.mkdirSync(fixtureDir, { recursive: true });
  const profile = fs.mkdtempSync(path.join(fixtureDir, 'first-open-profile-'));
  const extension = path.resolve(root, process.env.SHIYU_EXTENSION_DIR || 'browser-extension-lab');
  const version = JSON.parse(fs.readFileSync(path.join(extension, 'manifest.json'), 'utf8')).version;
  const browser = await chromium.launchPersistentContext(profile, {
    channel: 'msedge', headless: true, timeout: 25000,
    args: ['--disable-extensions-except=' + extension, '--load-extension=' + extension]
  });
  try {
    let owner = 'fixture-a', requests = [];
    const dataFor = id => [{id:'s',name:id,scenes:[{id:'c',name:'日常',groups:[{id:'g',name:'收藏',items:[]}]}]}];
    await browser.route('https://shiyubox.com/**', route => {
      const url = new URL(route.request().url());
      const json = value => route.fulfill({ contentType: 'application/json', body: JSON.stringify(value) });
      requests.push(url.pathname);
      if (url.pathname === '/api/shiyu/auth/session') return json(owner ? {authenticated:true,user:{id:owner,name:owner}} : {authenticated:false});
      if (url.pathname === '/api/shiyu/auth/account') return json({userId:owner,data:dataFor(owner)});
      if (url.pathname === '/extension/release.json') return json({latest:version});
      return route.fulfill({ contentType: 'text/html', headers: {'Content-Security-Policy': "default-src 'none'; connect-src 'self'; script-src 'none'"},
        body: '<!doctype html><title>Only an isolated non-homepage: no app.js, no bridge</title>' });
    });
    const worker = browser.serviceWorkers()[0] || await browser.waitForEvent('serviceworker', {timeout:15000});
    await worker.evaluate(version => { globalThis.fetch = async () => ({ok:true,json:async()=>({latest:version})}); }, version);
    const id = new URL(worker.url()).hostname;
    const website = await browser.newPage();
    await website.goto('https://shiyubox.com/extension/start.html');
    await website.evaluate(data => localStorage.setItem('yiyu-prototype-v1', JSON.stringify({signed:true,data,prefs:{accountProfile:{id:'fixture-a',name:'A'},accountDataUserId:'fixture-a',color:'#345678',mode:'dark',extensionInbox:[]}})), dataFor('fixture-a'));
    assert.equal(await website.evaluate(() => !!window.ShiyuExtensionStore || !!window.shiyuExtensionBridge), false);
    const popup = await browser.newPage(), started = Date.now();
    await popup.goto('chrome-extension://' + id + '/popup.html');
    await popup.waitForFunction(() => document.body.dataset.auth === 'signed', {}, {timeout:4000});
    const openingMs = Date.now() - started;
    assert(openingMs < 3000);
    const state = await popup.evaluate(() => window.trialApi.getState());
    assert.equal(state.accountId, 'fixture-a');
    assert.equal(await website.evaluate(() => typeof window.ShiyuExtensionStore?.save), 'function');
    const payload = {accountId:'fixture-a',mode:'group',title:'Isolated fixture bookmark',url:'https://example.test/fixture',spaceId:'s',sceneId:'c',groupId:'g'};
    await popup.evaluate(payload => window.trialApi.call('save', {payload}), payload);
    assert.equal(await website.evaluate(() => JSON.parse(localStorage.getItem('yiyu-prototype-v1')).data[0].scenes[0].groups[0].items[0][1]), payload.url);
    const list = await popup.evaluate(() => window.trialApi.call('list', {payload:{accountId:'fixture-a'}}));
    assert.equal(list.items.length, 1);
    owner = 'fixture-b';
    await assert.rejects(popup.evaluate(payload => window.trialApi.call('save', {payload:{...payload,url:'https://example.test/rejected'}}), payload), /登录账号已变化/);
    assert.equal(await website.evaluate(() => JSON.parse(localStorage.getItem('yiyu-prototype-v1')).data[0].scenes[0].groups[0].items.length), 1);
    await website.evaluate(() => localStorage.removeItem('yiyu-prototype-v1'));
    await popup.evaluate(() => window.trialApi.connect());
    assert.equal(await popup.evaluate(() => window.trialApi.getState().accountId), 'fixture-b');
    await popup.evaluate(() => window.trialApi.call('save', {payload:{accountId:'fixture-b',mode:'temporary',title:'Cold cookie fixture',url:'https://example.test/cold'}}));
    assert.equal(await website.evaluate(() => JSON.parse(localStorage.getItem('yiyu-prototype-v1')).prefs.extensionInbox.length), 1);
    console.log(JSON.stringify({result:'PASS',openingMs,version,browser:'Edge',origin:'isolated https://shiyubox.com fixture',restrictiveCSP:true,cases:['first open non-homepage','real MAIN file injection','save and list','cookie owner mismatch rejection','cookie-only cold state and save'],requests}));
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
