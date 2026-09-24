// Isolated Firefox profile + local fixture using the real collection store.
// No production accounts or data are read/written.
const { Builder } = require('../.local/firefox-tools/node_modules/selenium-webdriver');
const firefox = require('../.local/firefox-tools/node_modules/selenium-webdriver/firefox');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
let driver, socket, server;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) { for (let i = 0; i < 100; i++) { if (await fn()) return; await sleep(200); } throw new Error('Firefox check timed out'); }
(async () => {
  const store = fs.readFileSync(path.join(root, 'dist/extension/store.js'));
  server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (req.url === '/store.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(store); }
    res.end(`<!doctype html><title>Firefox 收藏测试</title><script src="/store.js"></script><script>
      if (!localStorage.getItem('yiyu-prototype-v1')) localStorage.setItem('yiyu-prototype-v1',JSON.stringify({signed:false,prefs:{accountProfile:{id:'firefox-fixture'}},data:[{id:'s',name:'空间',scenes:[{id:'c',name:'场景',groups:[{id:'g',name:'分组',items:[]},{id:'g2',name:'分组二',items:[]}]}]}]}));
      window.shiyuExtensionBridge={async dispatch(r){try{return {ok:true,value:r.type==='state'?ShiyuExtensionStore.snapshot():ShiyuExtensionStore.save(r.payload)}}catch(e){return {ok:false,error:e.message}}}};
      </script><h1>本地插件测试</h1>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const source = fs.mkdtempSync(path.join(os.tmpdir(), 'shiyu-firefox-check-'));
  fs.cpSync(path.join(root, '.local/firefox-extension'), source, { recursive: true });
  fs.writeFileSync(path.join(source, 'config.js'), `export const SITE_URLS = [${JSON.stringify(base)}];`);
  const testManifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
  testManifest.host_permissions = ['http://127.0.0.1/*'];
  fs.writeFileSync(path.join(source, 'manifest.json'), JSON.stringify(testManifest));
  const options = new firefox.Options().addArguments('-headless', '--remote-allow-system-access');
  if (process.env.FIREFOX_BINARY) options.setBinary(process.env.FIREFOX_BINARY);
  options.set('webSocketUrl', true);
  const builder = new Builder().forBrowser('firefox').setFirefoxOptions(options);
  if (process.env.GECKODRIVER) builder.setFirefoxService(new firefox.ServiceBuilder(process.env.GECKODRIVER));
  driver = await builder.build();
  console.log('Firefox ' + (await driver.getCapabilities()).get('browserVersion'));
  await driver.installAddon(source, true);
  await driver.get(base);
  const site = await driver.getWindowHandle();
  await driver.setContext('chrome');
  const uuid = await driver.executeScript("return JSON.parse(Services.prefs.getStringPref('extensions.webextensions.uuids'))['bookmark@shiyubox.com'];");
  await driver.setContext('content');
  await driver.switchTo().newWindow('tab');
  const popup = await driver.getWindowHandle();
  await driver.get(`moz-extension://${uuid}/popup.html`);
  await driver.switchTo().window(site);
  socket = new WebSocket((await driver.getCapabilities()).get('webSocketUrl'));
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0;
  function command(method, params) {
    const id = ++serial;
    return new Promise((resolve, reject) => {
      const handler = event => { const r = JSON.parse(event.data); if (r.id !== id) return; clearTimeout(timer); socket.removeEventListener('message', handler); r.type === 'error' ? reject(new Error(r.message)) : resolve(r.result); };
      const timer = setTimeout(() => { socket.removeEventListener('message', handler); reject(new Error('BiDi timeout')); }, 15000);
      socket.addEventListener('message', handler); socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression, context = popup) {
    const r = await command('script.evaluate', { expression: `(async()=>JSON.stringify(await (async()=>{return (${expression})})()))()`, target: { context }, awaitPromise: true });
    if (r.type === 'exception') throw new Error(r.exceptionDetails.text);
    return r.result.value === undefined ? undefined : JSON.parse(r.result.value);
  }
  // Restart popup initialisation while the collectible website is active.
  await command('browsingContext.reload', { context: popup, wait: 'complete' });
  await until(async () => await evaluate('document.body.dataset.ready === "true"'));
  assert.equal(await evaluate('document.querySelector("#login-panel").hidden'), false);
  await driver.executeScript("const v=JSON.parse(localStorage.getItem('yiyu-prototype-v1'));v.signed=true;localStorage.setItem('yiyu-prototype-v1',JSON.stringify(v));");
  await evaluate('document.querySelector("#retry").click()');
  await until(async () => !(await evaluate('document.querySelector("#save-temporary").disabled')));
  assert.equal(await evaluate('document.querySelector("#save-temporary").disabled'), false);
  assert.equal(await evaluate('document.querySelector("#title").value'), 'Firefox 收藏测试');
  await evaluate('document.querySelector("#save-temporary").click()');
  await until(async () => (await evaluate('document.querySelector("#status").textContent')).includes('已收藏到'));
  assert.equal(await driver.executeScript('return ShiyuExtensionStore.inbox().length'), 1);
  await evaluate('document.querySelector("[data-picker=group]").click()');
  assert.equal(await evaluate('document.querySelector("[data-picker-menu=group]").hidden'), false);
  await evaluate('document.querySelector("[data-picker-menu=group] button[data-value=g2]").click()');
  await evaluate('document.querySelector("#save-group").click()');
  await until(async () => (await evaluate('document.querySelector("#status").textContent')).includes('分组二'));
  assert.equal(await driver.executeScript("return JSON.parse(localStorage.getItem('yiyu-prototype-v1')).data[0].scenes[0].groups[1].items.length"), 1);
  await driver.executeScript("const v=JSON.parse(localStorage.getItem('yiyu-prototype-v1'));v.signed=false;localStorage.setItem('yiyu-prototype-v1',JSON.stringify(v));");
  await until(async () => !(await evaluate('document.querySelector("#login-panel").hidden')));
  assert.equal(await evaluate('document.querySelector("#login-panel").hidden'), false);
  assert.equal(await evaluate('document.querySelector("#save-group").disabled'), true);
  console.log('PASS: native Firefox extension background, Promise API, MAIN bridge, guest/login/logout sync, webpage title, temporary collection, group picker and classified collection');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  socket?.close(); await driver?.quit(); server?.close();
});
