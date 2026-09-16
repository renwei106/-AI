'use strict';
const themeMedia = matchMedia('(prefers-color-scheme: dark)');
function applyPageTheme() {
  let value = {};
  try { value = JSON.parse(localStorage.getItem('yiyu-prototype-v1') || '{}'); } catch {}
  const root = document.documentElement, theme = value.signed ? { color: value.prefs?.color || '#48614c', mode: value.prefs?.mode || 'system' } : null;
  if (!theme) { delete root.dataset.themed; delete root.dataset.themeDark; root.style.removeProperty('--theme-color'); return; }
  root.dataset.themed = 'true'; root.style.setProperty('--theme-color', theme.color);
  root.dataset.themeDark = String(theme.mode === 'dark' || theme.mode === 'system' && themeMedia.matches);
}
themeMedia.addEventListener('change', applyPageTheme); addEventListener('storage', applyPageTheme); applyPageTheme();
const address = /Edg\//.test(navigator.userAgent) ? 'edge://extensions' : 'chrome://extensions';
document.querySelector('#extension-address').textContent = address;
document.querySelector('#copy-address').onclick = async () => {
  const feedback = document.querySelector('#copy-feedback');
  try { await navigator.clipboard.writeText(address); feedback.textContent = '已复制。粘贴到浏览器地址栏，按回车打开扩展管理。'; }
  catch { feedback.textContent = '请手动复制 ' + address + '，粘贴到浏览器地址栏打开。'; }
};
document.querySelectorAll('.download').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#download-status').textContent = '下载已发起。完成后请先解压，再按下面的步骤加载插件。';
  document.querySelector('#install').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}));
function sizePreview() { const preview = document.querySelector('.hero-preview'); const width = preview.clientWidth - (innerWidth < 420 ? 24 : 32); preview.style.setProperty('--preview-scale', Math.min(1, width / 368)); }
addEventListener('resize', sizePreview); sizePreview();
addEventListener('message', event => {
  const frame = document.querySelector('iframe');
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'shiyu-preview-height') return;
  const height = Math.min(800, Math.max(300, Math.ceil(Number(event.data.height) || 460)));
  frame.height = height; document.querySelector('.hero-preview').style.setProperty('--preview-height', height + 'px');
});
