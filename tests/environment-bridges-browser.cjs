/* Real browser origins and iframe messages, with every HTTP request intercepted
 * by this private fake fixture. No production or local application is contacted. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.SHIYU_PLAYWRIGHT_MODULE || 'C:/Users/任伟的机械革命/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'dist', name), 'utf8');
const shared = '<script>' + read('environment-policy-data.js') + '\n' + read('environment.js') + '</script>';
const auth = read('tool-auth-bridge.js'), account = read('account-surfaces.js');
const world = read('world.js').split('/* An isolated public discovery surface')[0];
const cases = [], requested = [];
let browser;
const html = body => '<!doctype html><html><head><meta charset="UTF-8"></head><body>' + body + '</body></html>';
const authFixture = () => html('<dialog id="login"><button>关闭</button></dialog>' + shared + '<script>window.renderAccountLogin=()=>{};window.show=()=>document.querySelector("dialog").showModal();</script><script>' + auth + '</script>');
const accountFixture = () => html('<header><div class="header-right"><div class="account-menu-wrap"><button data-account-signout>退出</button></div></div></header>' + shared + '<script>window.updateHeader=()=>{};window.signed=true;window.accountProfile=()=>({id:"fixture-only"});window.view="home";window.quotaCount=0;window.ShiyuEntitlements={toolExceeded:()=>window.quotaCount++};</script><script>' + account + '</script>');
const worldFixture = () => html(shared + '<script>window.updateHeader=()=>{};window.signed=false;window.prefs={};window.esc=String;window.svgIcon=()=>"";window.SHIYU_WORLD_CONFIG={modules:{}};</script><script>' + world + '</script>');
function parentFixture(child, popup = false) {
  return html('<script>window.messages=[];addEventListener("message",e=>messages.push({origin:e.origin,data:e.data}));</script>' + (popup ? '<button id="open" onclick="window.__fixturePopup=window.open(' + JSON.stringify(child).replaceAll('"', '&quot;') + ')">预览</button>' : '<iframe src="' + child.replaceAll('&', '&amp;').replaceAll('"', '&quot;') + '"></iframe>'));
}
async function fixtureContext(pages) {
  const context = await browser.newContext();
  context.setDefaultTimeout(5000);
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    requested.push({ method: route.request().method(), origin: url.origin, path: url.pathname });
    if (url.pathname === '/api/shiyu/auth/session') return route.fulfill({ json: { authenticated: true } });
    if (url.pathname === '/api/shiyu/operations') return route.fulfill({ json: { world: { enabled: false } } });
    if (url.pathname === '/api/shiyu/i18n/public') return route.fulfill({ json: {} });
    const content = pages.get(url.origin + url.pathname);
    return content ? route.fulfill({ contentType: 'text/html; charset=utf-8', body: content }) : route.abort();
  });
  return context;
}
async function embeddedCase(kind, parentOrigin, childOrigin, allowed) {
  const child = childOrigin + '/?tool-' + (kind === 'auth' ? 'login' : 'account') + '=embed';
  const parent = parentOrigin + '/fixture-parent';
  const context = await fixtureContext(new Map([[parent, parentFixture(child)], [childOrigin + '/', kind === 'auth' ? authFixture() : accountFixture()]]));
  try {
    const page = await context.newPage();
    await page.goto(parent);
    const frame = page.frameLocator('iframe');
    await frame.locator('body').waitFor({ state: 'attached' });
    if (kind === 'auth') {
      assert.equal(await frame.locator('dialog').evaluate(dialog => dialog.open), allowed);
      if (allowed) {
        await page.waitForFunction(() => messages.some(message => message.data.type === 'shiyu-login-ready'));
        await frame.locator('dialog').evaluate(dialog => dialog.close());
        await page.waitForFunction(() => messages.some(message => message.data.type === 'shiyu-login-close' && message.data.authenticated));
      }
    } else {
      if (allowed) await page.waitForFunction(() => messages.some(message => message.data.type === 'shiyu-account-session'));
      await page.evaluate(({ origin }) => document.querySelector('iframe').contentWindow.postMessage({ type: 'shiyu-tool-quota', tool: 'icons' }, origin), { origin: childOrigin });
      await page.waitForTimeout(80);
      assert.equal(await frame.locator('body').evaluate(() => quotaCount), allowed ? 1 : 0);
    }
    if (!allowed) assert.deepEqual(await page.evaluate(() => messages), []);
    cases.push({ kind, parentOrigin, childOrigin, allowed, pass: true });
  } finally { await context.close(); }
}
async function returnCase(currentOrigin, target, allowed) {
  const context = await fixtureContext(new Map([[currentOrigin + '/', authFixture()], [new URL(target).origin + '/returned', html('<p>已返回工具</p>')]]));
  try {
    const page = await context.newPage();
    const address = currentOrigin + '/?tool-login=1&return=' + encodeURIComponent(target);
    await page.goto(address);
    assert.equal(await page.locator('dialog').evaluate(dialog => dialog.open), allowed);
    if (allowed) {
      await page.locator('dialog').evaluate(dialog => dialog.close());
      await page.waitForURL(target);
    } else assert.equal(page.url(), address);
    cases.push({ kind: 'return', currentOrigin, target, allowed, pass: true });
  } finally { await context.close(); }
}
async function worldCase(parentOrigin, childOrigin, allowed) {
  const child = childOrigin + '/?operations-preview=fixture-token';
  const parent = parentOrigin + '/fixture-parent';
  const context = await fixtureContext(new Map([[parent, parentFixture(child, true)], [childOrigin + '/', worldFixture()]]));
  try {
    const page = await context.newPage();
    await page.goto(parent);
    const popupPromise = page.waitForEvent('popup');
    await page.locator('#open').click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    if (allowed) {
      await page.waitForFunction(() => messages.some(message => message.data.type === 'shiyu-operations-ready'));
    } else {
      await page.waitForTimeout(100);
      assert.deepEqual(await page.evaluate(() => messages), []);
    }
    await page.evaluate(origin => window.__fixturePopup.postMessage({ type: 'shiyu-operations-preview', token: 'fixture-token', draft: { world: { enabled: true } } }, origin), childOrigin);
    if (allowed) await popup.waitForFunction(() => window.ShiyuOperations?.enterWorld() === true);
    else { await popup.waitForTimeout(80); assert.equal(await popup.evaluate(() => window.ShiyuOperations?.enterWorld()), false); }
    cases.push({ kind: 'world-preview', parentOrigin, childOrigin, allowed, pass: true });
  } finally { await context.close(); }
}
(async () => {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  for (const kind of ['auth', 'account']) {
    await embeddedCase(kind, 'https://tool.shiyubox.com', 'https://shiyubox.com', true);
    await embeddedCase(kind, 'http://127.0.0.1:4173', 'http://127.0.0.1:4318', true);
    await embeddedCase(kind, 'http://localhost:4173', 'http://127.0.0.1:4349', true);
    await embeddedCase(kind, 'https://tool.shiyubox.com', 'http://127.0.0.1:4318', false);
    await embeddedCase(kind, 'http://127.0.0.1:4173', 'https://shiyubox.com', false);
    await embeddedCase(kind, 'http://127.0.0.1:4174', 'http://127.0.0.1:4318', false);
    await embeddedCase(kind, 'https://tool.shiyubox.com', 'https://unknown.shiyubox.com', false);
  }
  await returnCase('https://shiyubox.com', 'https://tool.shiyubox.com/returned#color', true);
  await returnCase('http://127.0.0.1:4349', 'http://127.0.0.1:4173/returned#color', true);
  await returnCase('https://shiyubox.com', 'http://127.0.0.1:4173/returned', false);
  await returnCase('http://127.0.0.1:4349', 'https://tool.shiyubox.com/returned', false);
  await returnCase('https://shiyubox.com', 'https://unknown.shiyubox.com/returned', false);
  await returnCase('http://127.0.0.1:4349', 'http://127.0.0.1:4174/returned', false);
  for (const origin of ['https://shiyubox.com', 'https://www.shiyubox.com', 'https://space.shiyubox.com', 'https://world.shiyubox.com']) await worldCase('https://admin.shiyubox.com', origin, true);
  await worldCase('http://127.0.0.1:5175', 'http://127.0.0.1:4349', true);
  await worldCase('http://127.0.0.1:5175', 'https://shiyubox.com', false);
  await worldCase('https://admin.shiyubox.com', 'http://127.0.0.1:4349', false);
  await worldCase('https://admin.shiyubox.com', 'https://unknown.shiyubox.com', false);
  const output = path.join(root, '.local/environment-isolation/browser-bridges.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ passed: cases.length, cases, interceptedRequests: requested.length, productionRequestsSent: 0 }, null, 2) + '\n');
  console.log('PASS ' + cases.length + ' real browser bridge/return cases; every network request fulfilled or blocked by the fixture');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); });
