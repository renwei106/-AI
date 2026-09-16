const $ = selector => document.querySelector(selector);
const preview = location.protocol !== 'chrome-extension:' && new URLSearchParams(location.search).has('preview');
const demoState = { signed: true, accountId: 'preview', name: '林间', inboxCount: 3, spaces: [
  { id: 'work', name: '工作空间', scenes: [{ id: 'daily', name: '日常工作', groups: [{ id: 'tools', name: '效率工具' }, { id: 'read', name: '稍后阅读' }] }] },
  { id: 'life', name: '生活空间', scenes: [{ id: 'weekend', name: '周末日常', groups: [{ id: 'ideas', name: '生活灵感' }] }] }
] };
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let state, current, mode = 'temporary', busy = false, lastSuccess = false, draft, activeTheme;
function previewTheme() {
  try { const value = JSON.parse(localStorage.getItem('yiyu-prototype-v1') || '{}'); return value.signed ? { color: value.prefs?.color, mode: value.prefs?.mode || 'system' } : null; } catch { return null; }
}
function applyTheme(theme) {
  activeTheme = theme;
  const root = document.documentElement;
  if (!theme?.color) { delete root.dataset.themed; delete root.dataset.themeDark; root.style.removeProperty('--theme-color'); return; }
  root.dataset.themed = 'true'; root.style.setProperty('--theme-color', theme.color);
  root.dataset.themeDark = String(theme.mode === 'dark' || theme.mode === 'system' && systemDark.matches);
}
function setSiteIdentity() {
  const image = $('#site-icon'), fallback = $('#site-fallback');
  if (!current?.url) { image.hidden = true; fallback.hidden = false; fallback.textContent = '—'; return; }
  const page = new URL(current.url), host = page.hostname.replace(/^www\./i, '');
  fallback.textContent = (host[0] || '网').toUpperCase();
  const safe = value => {
    if (!value) return false;
    if (value.startsWith('data:image/')) return true;
    try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
  };
  const candidates = [current.icon, page.origin + '/favicon.ico'].filter((value, index, list) => safe(value) && list.indexOf(value) === index);
  let cursor = 0;
  image.onload = () => { image.hidden = false; fallback.hidden = true; };
  image.onerror = () => { image.hidden = true; fallback.hidden = false; if (cursor < candidates.length) image.src = candidates[cursor++]; };
  image.hidden = true; fallback.hidden = false;
  if (candidates.length) image.src = candidates[cursor++];
}
systemDark.addEventListener('change', () => { if (activeTheme?.mode === 'system') applyTheme(activeTheme); });
async function call(type, extra = {}) {
  if (preview) {
    if (type === 'state') return { ...demoState, theme: previewTheme() };
    if (type === 'save') return { label: mode === 'temporary' ? '稍后整理' : '所选分组' };
    return;
  }
  const response = await chrome.runtime.sendMessage({ type, ...extra });
  if (!response?.ok) throw new Error(response?.error || '连接中断，请重试。');
  return response.value;
}
function status(text, kind = '') { $('#status').textContent = text; $('#status').className = kind; }
function closePickers(except) {
  document.querySelectorAll('.select-shell').forEach(shell => {
    if (shell === except) return;
    shell.querySelector('.place-menu').hidden = true;
    shell.querySelector('.place-trigger').setAttribute('aria-expanded', 'false');
  });
}
function syncPicker(select) {
  const shell = select.closest('.select-shell'), trigger = shell.querySelector('.place-trigger'), menu = shell.querySelector('.place-menu');
  trigger.querySelector('[data-picker-value]').textContent = select.selectedOptions[0]?.textContent || '请选择';
  menu.replaceChildren(...[...select.options].map(option => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'place-option'; button.role = 'option';
    button.textContent = option.textContent; button.dataset.value = option.value;
    button.setAttribute('aria-selected', String(option.value === select.value));
    button.onclick = () => {
      select.value = option.value; syncPicker(select); closePickers();
      select.dispatchEvent(new Event('change', { bubbles: true })); trigger.focus();
    };
    return button;
  }));
}
function options(select, values, preferred) {
  select.replaceChildren(...values.map(value => new Option(value.name, value.id)));
  if (values.some(x => x.id === preferred)) select.value = preferred;
  syncPicker(select);
}
function fillScenes(preferred = {}) {
  preferred ||= {};
  const space = state?.spaces.find(x => x.id === $('#space').value);
  options($('#scene'), space?.scenes || [], preferred.sceneId); fillGroups(preferred.groupId);
}
function fillGroups(preferred) {
  const scene = state?.spaces.find(x => x.id === $('#space').value)?.scenes.find(x => x.id === $('#scene').value);
  options($('#group'), scene?.groups || [], preferred); updateSave();
}
function updateSave() {
  $('#save').disabled = busy || !state?.signed || !current?.url || (mode === 'group' && !$('#group').value);
  $('#save').textContent = busy ? '正在保存…' : mode === 'temporary' ? '保存到稍后整理 ↗' : '收藏到所选分组 ↗';
}
function selectMode(value) {
  if (value !== mode) { lastSuccess = false; if ($('#status').className === 'success') status(''); }
  mode = value; document.body.dataset.mode = mode; document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  $('#destination').hidden = mode !== 'group';
  $('#temporary-panel').hidden = mode !== 'temporary';
  updateSave(); saveDraft();
}
async function saveDraft() {
  if (preview || !current?.url || lastSuccess) return;
  draft = { url: current.url, title: $('#title').value, description: $('#description').value, mode, spaceId: $('#space').value, sceneId: $('#scene').value, groupId: $('#group').value };
  try { await chrome.storage.local.set({ draft }); } catch { status('草稿未能暂存，请保持窗口打开后重试。', 'error'); }
}
async function connect() {
  $('#retry').hidden = true; $('#editor').disabled = true; status('正在连接拾隅…');
  try {
    state = await call('state');
    document.body.classList.toggle('guest', !state.signed); $('#login-panel').hidden = state.signed;
    applyTheme(state.signed ? state.theme : null);
    options($('#space'), state.spaces, draft?.spaceId); fillScenes(draft);
    $('#editor').disabled = !state.signed || !current?.url;
    status(!state.signed ? '登录后才能收藏。' : !current?.url ? '此页面无法收藏，请打开普通 HTTP / HTTPS 网页。' : '');
    updateSave();
  } catch (error) { state = null; status(error.message, 'error'); $('#retry').hidden = false; }
}
document.querySelectorAll('[data-mode]').forEach(button => button.onclick = () => selectMode(button.dataset.mode));
document.querySelectorAll('.place-trigger').forEach(trigger => trigger.onclick = () => {
  const shell = trigger.closest('.select-shell'), menu = shell.querySelector('.place-menu'), opening = menu.hidden;
  closePickers(shell); menu.hidden = !opening; trigger.setAttribute('aria-expanded', String(opening));
  if (opening) setTimeout(() => menu.querySelector('[aria-selected=true]')?.focus(), 0);
});
document.addEventListener('click', event => { if (!event.target.closest('.select-shell')) closePickers(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePickers(); });
$('#space').onchange = () => { fillScenes(); saveDraft(); };
$('#scene').onchange = () => { fillGroups(); saveDraft(); };
$('#group').onchange = () => { updateSave(); saveDraft(); };
$('#bookmark-form').oninput = () => { lastSuccess = false; saveDraft(); };
$('#bookmark-form').onsubmit = async event => {
  event.preventDefault(); if (busy || !state?.signed || !current?.url) return;
  busy = true; status('正在保存…'); updateSave(); $('#editor').disabled = true;
  try {
    const result = await call('save', { payload: { ...current, title: $('#title').value.trim(), description: $('#description').value.trim(), mode, accountId: state.accountId, spaceId: $('#space').value, sceneId: $('#scene').value, groupId: $('#group').value } });
    lastSuccess = true;
    status(preview ? '演示完成 · 实际使用时将保存到' + result.label : result.duplicate ? '已在「' + result.label + '」中，无需重复收藏。' : '已收藏到「' + result.label + '」。', 'success');
    if (!preview) { try { await chrome.storage.local.remove('draft'); } catch { /* Save is already confirmed. */ } }
  } catch (error) { status(error.message, 'error'); $('#retry').hidden = false; }
  finally { busy = false; $('#editor').disabled = !state?.signed || !current?.url; updateSave(); }
};
$('#retry').onclick = connect;
for (const [id, page] of [['login', 'login']]) $( '#' + id).onclick = () => {
  if (preview) { status('这是界面预览，安装后即可使用。'); return; }
  call('open', { page }).catch(error => status(error.message, 'error'));
};
async function start() {
  if (preview) { document.body.classList.add('preview'); current = { title: '设计的细节，藏在日常里', url: 'https://example.com/inspiration', icon: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="9" fill="#e6ebe4"/><path d="M10 10h12M10 16h9M10 22h12" fill="none" stroke="#48614c" stroke-width="2" stroke-linecap="round"/></svg>') }; }
  else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && /^https?:\/\//i.test(tab.url)) current = { url: tab.url, title: (tab.title || new URL(tab.url).hostname).slice(0, 100), icon: tab.favIconUrl || '' };
    try { draft = (await chrome.storage.local.get('draft')).draft; if (draft?.url !== current?.url) draft = null; } catch {}
  }
  $('#page-domain').textContent = current ? new URL(current.url).hostname : '浏览器设置页、新标签页等无法收藏';
  setSiteIdentity();
  $('#title').value = draft?.title || current?.title || ''; $('#description').value = draft?.description || '';
  mode = draft?.mode === 'group' ? 'group' : 'temporary';
  await connect(); selectMode(mode); document.body.dataset.ready = 'true';
}
start().catch(error => { status(error.message, 'error'); $('#retry').hidden = false; document.body.dataset.ready = 'true'; });
if (preview) new ResizeObserver(() => parent.postMessage({ type: 'shiyu-preview-height', height: document.body.scrollHeight }, location.origin)).observe(document.body);
