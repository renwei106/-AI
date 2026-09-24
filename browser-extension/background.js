import { SITE_URLS } from './config.js';
const extensionApi = globalThis.browser || globalThis.chrome;

const sites = SITE_URLS.map(value => new URL(value));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
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
  let refreshed = false;
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
    if (attempt === 11 && !refreshed) {
      refreshed = true;
      try { await extensionApi.tabs.reload(tab.id); } catch { /* Retry below. */ }
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
