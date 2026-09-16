import { SITE_URL } from './config.js';

const site = new URL(SITE_URL);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let bridgeTabPromise;
async function siteTab() {
  const tabs = await chrome.tabs.query({ url: site.origin + '/*' });
  const tab = tabs.find(tab => { const url = new URL(tab.url); return url.origin === site.origin && ['/', '/index.html'].includes(url.pathname); });
  return tab || chrome.tabs.create({ url: SITE_URL + '?extension=bridge', active: false });
}
async function relay(request) {
  bridgeTabPromise ||= siteTab().finally(() => { bridgeTabPromise = null; });
  const tab = await bridgeTabPromise;
  for (let attempt = 0; attempt < 24; attempt++) {
    let result;
    try {
      const results = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN',
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
  throw new Error('暂时连不上拾隅。请确认本地预览已启动，并刷新拾隅页面后重试；填写内容已保留。');
}
chrome.runtime.onMessage.addListener((request, sender, reply) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('popup.html')) return false;
  (async () => {
    if (request.type === 'state') return relay({ type: 'state' });
    if (request.type === 'save') return relay({ type: 'save', payload: request.payload });
    if (request.type === 'open') {
      const route = { login: '?extension=login', collection: 'extension/inbox.html', guide: 'extension/' }[request.page];
      if (route === undefined) throw new Error('无效的页面。');
      await chrome.tabs.create({ url: SITE_URL + route }); return true;
    }
    throw new Error('无效的插件操作。');
  })().then(value => reply({ ok: true, value }), error => reply({ ok: false, error: error.message }));
  return true;
});
