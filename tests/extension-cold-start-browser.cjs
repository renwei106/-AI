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
  let releaseBlockingScript;
  try {
    let owner = 'fixture-a', requests = [];
    let markScriptRequested, blockerReleased = false;
    const scriptRequested = new Promise(resolve => { markScriptRequested = resolve; });
    const blockingScript = new Promise(resolve => { releaseBlockingScript = () => { blockerReleased = true; resolve(); }; });
    const dataFor = id => [{id:'s',name:id,scenes:[{id:'c',name:'日常',groups:[{id:'g',name:'收藏',items:[]}]}]}];
    await browser.route('https://shiyubox.com/**', async route => {
      const url = new URL(route.request().url());
      const json = value => route.fulfill({ contentType: 'application/json', body: JSON.stringify(value) });
      requests.push(url.pathname);
      if (url.pathname === '/api/shiyu/auth/session') return json(owner ? {authenticated:true,user:{id:owner,name:owner}} : {authenticated:false});
      if (url.pathname === '/api/shiyu/auth/account') return json({userId:owner,data:dataFor(owner)});
      if (url.pathname === '/extension/release.json') return json({latest:version});
      if (url.pathname === '/blocking.js') {
        markScriptRequested(); await blockingScript;
        return route.fulfill({contentType:'application/javascript',body:'window.fixtureScriptReleased = true;'});
      }
      if (url.pathname === '/extension/blocked.html') return route.fulfill({contentType:'text/html',headers:{'Content-Security-Policy':"default-src 'none'; connect-src 'self'; script-src 'self'"},
        body:'<!doctype html><title>Loading fixture</title><script src="/blocking.js"></script><p>Parser resumes after release.</p>'});
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
    await website.evaluate(() => localStorage.removeItem('yiyu-prototype-v1'));
    await website.goto('https://shiyubox.com/extension/blocked.html', {waitUntil:'commit'});
    await scriptRequested;
    assert.equal(await website.evaluate(() => document.readyState), 'loading');
    const blockedStarted = Date.now(); let deadline;
    try {
      await Promise.race([(async () => {
        await popup.reload({waitUntil:'commit'});
        await popup.waitForFunction(() => document.body.dataset.auth === 'signed', {}, {timeout:2500});
        assert.equal(await popup.evaluate(() => window.trialApi.getState().accountId), 'fixture-b');
        await popup.evaluate(() => window.trialApi.call('save', {payload:{accountId:'fixture-b',mode:'group',title:'Saved before page load',url:'https://example.test/while-loading',spaceId:'s',sceneId:'c',groupId:'g'}}));
      })(), new Promise((_, reject) => { deadline = setTimeout(() => reject(Error('Signed state and save must finish within 2500 ms while page is loading.')), 2500); })]);
    } finally { clearTimeout(deadline); }
    const loadingStateAndSaveMs = Date.now() - blockedStarted;
    assert.equal(blockerReleased, false);
    assert.equal(await website.evaluate(() => document.readyState), 'loading');
    assert.equal(await website.evaluate(() => JSON.parse(localStorage.getItem('yiyu-prototype-v1')).data[0].scenes[0].groups[0].items[0][1]), 'https://example.test/while-loading');
    releaseBlockingScript(); await website.waitForLoadState('load');
    assert.equal(await website.evaluate(() => window.fixtureScriptReleased), true);
    console.log(JSON.stringify({result:'PASS',openingMs,loadingStateAndSaveMs,version,browser:'Edge',origin:'isolated https://shiyubox.com fixture',restrictiveCSP:true,cases:['first open non-homepage','real MAIN file injection','save and list','cookie owner mismatch rejection','cookie-only cold state and save','signed state and save before blocked parser script releases'],requests}));
  } finally { releaseBlockingScript?.(); await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
