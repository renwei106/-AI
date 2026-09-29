import { SITE_URLS } from './config.js';
const extensionApi = globalThis.browser || globalThis.chrome;

const sites = SITE_URLS.map(value => new URL(value));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const detectBrowser = () => {
  const agent = navigator.userAgent;
  if (/Firefox\//.test(agent)) return 'firefox';
  if (/Edg\//.test(agent)) return 'edge';
  if (/Quark\//i.test(agent)) return 'quark';
  if (/QQBrowser\//i.test(agent)) return 'qq';
  if (/360(?:SE|EE)|QihooBrowser/i.test(agent)) return '360';
  return 'chrome';
};
const newer = (latest, current) => {
  const a = String(latest).split('.').map(Number), b = String(current).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index++) if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  return false;
};
async function versionStatus() {
  const current = extensionApi.runtime.getManifest().version;
  for (const site of sites) try {
    const response = await fetch(new URL('extension/release.json', site), { cache: 'no-store' });
    if (!response.ok) continue;
    const release = await response.json(), latest = /^\d+\.\d+\.\d+$/.test(release.latest || '') ? release.latest : current;
    return { current, latest, hasUpdate: newer(latest, current), browser: detectBrowser() };
  } catch { /* Try the next configured site. */ }
  return { current, latest: current, hasUpdate: false, browser: detectBrowser() };
}
let bridgeTabPromise;
async function siteTab() {
  for (const site of sites) {
    const tabs = await extensionApi.tabs.query({ url: site.origin + '/*' });
    const tab = tabs.find(tab => { const url = new URL(tab.url); return url.origin === site.origin && ['/', '/index.html'].includes(url.pathname); });
    if (tab) return { tab, site };
  }
  const site = sites[0];
  return { tab: await extensionApi.tabs.create({ url: site.href + '?extension=bridge', active: false }), site };
}
async function relay(request) {
  bridgeTabPromise ||= siteTab().finally(() => { bridgeTabPromise = null; });
  const { tab, site } = await bridgeTabPromise;
  for (let attempt = 0; attempt < 24; attempt++) {
    let result;
    try {
      const results = await extensionApi.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN',
        func: (message, expectedOrigin) => location.origin === expectedOrigin ? window.shiyuExtensionBridge?.dispatch(message) : undefined,
        args: [request, site.origin] });
      result = results[0]?.result;
    } catch { /* The tab may still be loading; never fall back to a different site. */ }
    if (result) {
      if (!result.ok) throw new Error(result.error);
      return result.value;
    }
    await delay(250);
  }
  throw new Error('暂时连不上拾隅。请刷新拾隅网页后重试，已填内容会保留。');
}
extensionApi.runtime.onMessage.addListener((request, sender, reply) => {
  if (sender.id !== extensionApi.runtime.id || sender.url !== extensionApi.runtime.getURL('popup.html')) return false;
  (async () => {
    if (request.type === 'state') return relay({ type: 'state' });
    if (request.type === 'save') return relay({ type: 'save', payload: request.payload });
    if (request.type === 'search') return relay({ type: 'search', payload: request.payload });
    if (request.type === 'version') return versionStatus();
    if (request.type === 'open-update') {
      const site = sites[0], browser = detectBrowser();
      await extensionApi.tabs.create({ url: new URL(`extension/?browser=${encodeURIComponent(browser)}#download`, site).href }); return true;
    }
    if (request.type === 'open-url') {
      let url; try { url = new URL(request.url); } catch { throw new Error('网址无效。'); }
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('仅支持打开普通网页。');
      await extensionApi.tabs.create({ url: url.href }); return true;
    }
    if (request.type === 'open') {
      const route = { login: '?extension=login', collection: 'extension/inbox.html', guide: 'extension/' }[request.page];
      if (route === undefined) throw new Error('无效的页面。');
      const { site } = await siteTab();
      await extensionApi.tabs.create({ url: new URL(route, site).href }); return true;
    }
    throw new Error('无效的插件操作。');
  })().then(value => reply({ ok: true, value }), error => reply({ ok: false, error: error.message }));
  return true;
});
