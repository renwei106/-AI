'use strict';
const themeMedia = matchMedia('(prefers-color-scheme: dark)');
const officialFonts = { 'youfeng': '"Shiyu Youfeng"', 'qingya-song': '"Shiyu Qingya Song"', 'wenrun-kai': '"Shiyu Wenrun Kai"' };
async function applyOfficialFont() {
  try { const response = await fetch('/api/shiyu/operations', { cache: 'no-store' }); if (!response.ok) return; const { officialFont } = await response.json(); document.documentElement.style.setProperty('--official-font', officialFonts[officialFont] || officialFonts.youfeng); } catch {}
}
function applyPageMode() {
  let mode = 'system', color = '#48614c';
  try { const prefs = JSON.parse(localStorage.getItem('yiyu-prototype-v1') || '{}').prefs || {}; mode = prefs.mode || 'system'; color = /^#[0-9a-f]{6}$/i.test(prefs.color || '') ? prefs.color : color; } catch {}
  const channels = color.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
  const luminance = channels.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  document.documentElement.style.setProperty('--action-color', color);
  document.documentElement.style.setProperty('--on-action', luminance > .42 ? '#202326' : '#ffffff');
  document.documentElement.dataset.extensionDark = String(mode === 'dark' || mode === 'system' && themeMedia.matches);
}
themeMedia.addEventListener('change', applyPageMode);
addEventListener('storage', applyPageMode);
applyPageMode();
applyOfficialFont();
const browsers = [
  { id: 'chrome', name: 'Google Chrome', short: 'Chrome', icon: 'assets/browsers/chrome.svg', address: 'chrome://extensions', install: 'unpacked' },
  { id: 'edge', name: 'Microsoft Edge', short: 'Edge', icon: 'assets/browsers/edge.svg', address: 'edge://extensions', install: 'unpacked' },
  { id: '360', name: '360 安全浏览器', short: '360', icon: 'assets/browsers/browser360.svg', address: 'chrome://extensions', install: 'crx' },
  { id: 'qq', name: 'QQ 浏览器', short: 'QQ', icon: 'assets/browsers/qq.svg', address: 'chrome://extensions', install: 'crx' },
  { id: 'quark', name: '夸克浏览器', short: '夸克', icon: 'assets/browsers/quark.svg', address: 'chrome://extensions', install: 'crx' },
  { id: 'firefox', name: 'Firefox 火狐', short: 'Firefox', icon: 'assets/browsers/firefox.svg', address: 'about:addons', install: 'xpi' }
].map(browser => ({ ...browser, download: `downloads/shiyu-extension-${browser.id}-0.1.1.zip` }));
let selectedBrowser = null;
let firefoxRelease = { ready: false };
fetch('firefox-release.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(async release => {
  if (release?.ready && /^downloads\/shiyu-extension-firefox-[\d.]+\.xpi$/.test(release.download)) {
    const file = await fetch(release.download, { method: 'HEAD', cache: 'no-store' });
    if (file.ok) firefoxRelease = release;
  }
  if (selectedBrowser?.id === 'firefox') selectBrowser(selectedBrowser);
}).catch(() => {});
const heroActions = document.querySelector('.hero-actions');
heroActions.className = 'browser-download-panel';
heroActions.innerHTML = `<div class="browser-picker-heading"><strong>选择你正在使用的浏览器</strong></div><div class="browser-picker" role="radiogroup" aria-label="选择浏览器">${browsers.map(browser => `<button type="button" role="radio" aria-checked="false" data-browser="${browser.id}"><img src="${browser.icon}" alt=""><span>${browser.name}</span><i aria-hidden="true"></i></button>`).join('')}</div><div class="browser-download-action"><button type="button" class="primary" id="browser-download" disabled>请先选择浏览器</button><a href="#install" class="subtle-link">查看安装步骤 ↗</a></div>`;
document.querySelector('.compat-browsers')?.remove();
document.querySelector('.hero-footnote')?.remove();
document.querySelector('.steps .download')?.remove();
const methodTitle = document.querySelector('#install-method-title');
const methodPrimary = document.querySelector('#install-method-primary');
const methodFallback = document.querySelector('#install-method-fallback');
const addressCode = document.querySelector('#extension-address');
const copyAddress = document.querySelector('#copy-address');
addressCode.textContent = '选择浏览器后显示'; copyAddress.disabled = true;
function selectBrowser(browser) {
  selectedBrowser = browser;
  document.querySelectorAll('[data-browser]').forEach(button => {
    const active = button.dataset.browser === browser.id;
    button.setAttribute('aria-checked', String(active)); button.classList.toggle('selected', active);
  });
  const download = document.querySelector('#browser-download');
  download.disabled = false; download.textContent = `下载 ${browser.short} 版插件`;
  const firefox = browser.install === 'xpi';
  document.querySelector('.steps article:first-child h3').textContent = firefox ? '下载插件' : '下载并解压';
  document.querySelector('.steps article:first-child p').textContent = firefox ? '下载 Firefox 版安装文件，无需解压。' : '将 ZIP 解压到一个固定文件夹。安装完成后保留该文件夹，不要移动或删除。';
  document.querySelector('.steps article:nth-child(2) small').hidden = firefox;
  addressCode.textContent = browser.address; copyAddress.disabled = false;
  methodTitle.textContent = `在 ${browser.name} 中安装`;
  if (firefox) {
    download.disabled = !firefoxRelease.ready;
    if (!firefoxRelease.ready) download.textContent = 'Firefox 版准备中';
    methodPrimary.textContent = '在「扩展」页面点击齿轮，选择「从文件安装附加组件」，打开下载的 XPI 文件，按提示添加。';
    methodFallback.textContent = '安装后在同一个 Firefox 浏览器中登录拾隅，即可使用收藏功能。';
  } else if (browser.install === 'crx') {
    methodPrimary.textContent = '打开解压后的文件夹，将 shiyu-extension.crx 直接拖入扩展管理页，按提示完成安装。';
    methodFallback.textContent = '如果浏览器明确拒绝安装，开启「开发者模式」，点击「加载已解压的扩展程序」，选择同一个文件夹。';
  } else {
    methodPrimary.textContent = '开启「开发者模式」，点击「加载已解压的扩展程序」，选择解压后包含 manifest.json 的文件夹。';
    methodFallback.textContent = `${browser.short} 会限制站外 CRX，请按上述方式安装。`;
  }
  document.querySelector('#download-status').textContent = `已选择 ${browser.name}。下载后先解压 ZIP，再按下方对应步骤安装。`;
  if (firefox) document.querySelector('#download-status').textContent = firefoxRelease.ready ? '已选择 Firefox 火狐。下载后无需解压，按下方步骤安装。' : 'Firefox 版正在准备，正式安装包就绪后即可下载。';
}
document.querySelectorAll('[data-browser]').forEach(button => button.onclick = () => selectBrowser(browsers.find(browser => browser.id === button.dataset.browser)));
function detectBrowser() {
  const agent = navigator.userAgent;
  if (/Firefox\//.test(agent)) return 'firefox';
  if (/Edg\//.test(agent)) return 'edge';
  if (/Quark\//i.test(agent)) return 'quark';
  if (/QQBrowser\//i.test(agent)) return 'qq';
  if (/360(?:SE|EE)|QihooBrowser/i.test(agent)) return '360';
  if (/Chrome\//.test(agent)) return 'chrome';
  return browsers[0].id;
}
selectBrowser(browsers.find(browser => browser.id === detectBrowser()) || browsers[0]);
document.querySelector('#browser-download').onclick = () => {
  if (!selectedBrowser) return;
  if (selectedBrowser.id === 'firefox' && !firefoxRelease.ready) return;
  const link = document.createElement('a'); link.href = selectedBrowser.id === 'firefox' ? firefoxRelease.download : selectedBrowser.download; link.download = ''; link.click();
  const toast = document.querySelector('#download-toast');
  toast.textContent = `${selectedBrowser.short} 版插件已开始下载，请按下方步骤完成安装。`;
  toast.classList.add('show'); clearTimeout(window.downloadToastTimer);
  window.downloadToastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  document.querySelector('#download-status').textContent = `${selectedBrowser.name} 版插件已开始下载。下载完成后请先解压，再按下方步骤安装。`;
  if (selectedBrowser.id === 'firefox') document.querySelector('#download-status').textContent = 'Firefox 版插件已开始下载，无需解压，按下方步骤安装即可。';
  document.querySelector('#install').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
};
document.querySelector('#copy-address').onclick = async () => {
  const feedback = document.querySelector('#copy-feedback');
  if (!selectedBrowser) return;
  try { await navigator.clipboard.writeText(selectedBrowser.address); feedback.textContent = '已复制。粘贴到浏览器地址栏，按回车打开扩展管理。'; }
  catch { feedback.textContent = '请手动复制 ' + selectedBrowser.address + '，粘贴到浏览器地址栏打开。'; }
};
function sizePreview() { const preview = document.querySelector('.hero-preview'); const width = preview.clientWidth - (innerWidth < 420 ? 24 : 32); preview.style.setProperty('--preview-scale', Math.min(1, width / 368)); }
addEventListener('resize', sizePreview); sizePreview();
addEventListener('message', event => {
  const frame = document.querySelector('iframe');
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'shiyu-preview-height') return;
  const height = Math.min(800, Math.max(300, Math.ceil(Number(event.data.height) || 460)));
  frame.height = height; document.querySelector('.hero-preview').style.setProperty('--preview-height', height + 'px');
});
