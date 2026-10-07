const $ = selector => document.querySelector(selector);
const extensionApi = globalThis.browser || globalThis.chrome;
const preview = ['http:', 'https:'].includes(location.protocol) && new URLSearchParams(location.search).has('preview');
const demoState = { signed: true, accountId: 'preview', name: '林间', inboxCount: 3, spaces: [
  { id: 'work', name: '工作空间', scenes: [{ id: 'daily', name: '日常工作', groups: [{ id: 'tools', name: '效率工具' }, { id: 'read', name: '稍后阅读' }] }] },
  { id: 'life', name: '生活空间', scenes: [{ id: 'weekend', name: '周末日常', groups: [{ id: 'ideas', name: '生活灵感' }] }] }
] };
const demoSearchItems = [
  { title: '拾隅 · 主题页', url: 'https://shiyubox.com/', domain: 'shiyubox.com', description: '挑一个喜欢的主题，从自己的角落出发。', path: '拾隅 / 常用' },
  { title: '拾隅 · 官网', url: 'https://shiyubox.com/official/v3/index.html', domain: 'shiyubox.com', description: '认识拾隅，让喜欢，自有归处。', path: '拾隅 / 常用' }
];
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let state, current, mode = 'temporary', view = 'bookmark', busy = false, lastSuccess = false, draft, activeTheme, searchTimer, searchSerial = 0;
function previewTheme() { return { color: '#48614c', mode: 'system' }; }
function applyTheme(theme) {
  activeTheme = theme;
  const root = document.documentElement;
  if (!theme?.color) { delete root.dataset.themed; delete root.dataset.themeDark; root.style.removeProperty('--theme-color'); root.style.removeProperty('--theme-on-color'); return; }
  const color = /^#[0-9a-f]{6}$/i.test(theme.color) ? theme.color : '#48614c';
  const channels = color.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
  const luminance = channels.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  root.dataset.themed = 'true'; root.style.setProperty('--theme-color', color); root.style.setProperty('--theme-on-color', luminance > .42 ? '#202326' : '#ffffff');
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
    if (type === 'state') return { ...demoState, signed: new URLSearchParams(location.search).get('signed') === '1', theme: previewTheme() };
    if (type === 'save') return { label: mode === 'temporary' ? '稍后整理' : ['#space','#scene','#group'].map(id=>document.querySelector(id).selectedOptions[0]?.textContent).filter(Boolean).join(' / ') };
    if (type === 'search') { const query = String(extra.payload?.query || '').toLocaleLowerCase(); const items = demoSearchItems.filter(item => [item.title, item.url, item.description, item.path].some(value => value.toLocaleLowerCase().includes(query))); return { total: items.length, items }; }
    if(type==='list'){const items=demoSearchItems.map((x,i)=>({...x,id:i===2?'demo-inbox':undefined,inbox:i===2,spaceId:'work',sceneId:'daily',groupId:'tools'}));return {accountId:'preview',items,commonGroups:[{id:'common-tools',name:'拾隅',items:items.slice(0,2)},{id:'common-reading',name:'稍后阅读',items:[]},{id:'common-life',name:'生活灵感',items:[]}]};}
    if(type==='move')return {label:'所选分组'};
    if (type === 'version') return { current: '0.3.0', latest: '0.3.0', hasUpdate: false, browser: 'chrome' };
    return;
  }
  let timer;
  const request = extensionApi.runtime.sendMessage({ type, ...extra });
  const response = type === 'state' ? await Promise.race([request, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('读取超时，请重试连接拾隅。')), 3000);
  })]).finally(() => clearTimeout(timer)) : await request;
  if (!response?.ok) throw new Error(response?.error || '连接中断，请重试。');
  return response.value;
}
function status(text, kind = '') { $('#status').textContent = text; $('#status').className = kind; }
function renderSearch(result, query) {
  const items = result?.items || [], total = result?.total || 0;
  $('#search-summary').textContent = total ? `找到 ${total} 个网址${total > items.length ? `，显示前 ${items.length} 个` : ''}` : `没有找到与“${query}”相关的网址`;
  $('#search-results').replaceChildren(...items.map(item => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'search-result';
    const mark = document.createElement('span'); mark.className = 'result-mark'; mark.textContent = (item.domain?.[0] || item.title?.[0] || '网').toUpperCase();
    const copy = document.createElement('span'); copy.className = 'result-copy';
    const title = document.createElement('strong'); title.textContent = item.title;
    const domain = document.createElement('small'); domain.textContent = item.domain || item.url;
    const path = document.createElement('em'); path.textContent = item.path;
    copy.append(title, domain, path);
    const open = document.createElement('span'); open.className = 'result-open'; open.textContent = '↗'; open.setAttribute('aria-hidden', 'true');
    button.append(mark, copy, open); button.setAttribute('aria-label', `打开 ${item.title}`);
    button.onclick = () => preview ? ($('#search-summary').textContent = `演示结果 · 安装后将打开 ${item.domain}`) : call('open-url', { url: item.url }).catch(error => { $('#search-summary').textContent = error.message; });
    return button;
  }));
  if (!items.length) { const empty = document.createElement('div'); empty.className = 'search-empty'; empty.textContent = '换一个名称、网址或备注试试'; $('#search-results').replaceChildren(empty); }
}
async function runSearch() {
  const query = $('#library-search').value.trim(), serial = ++searchSerial;
  if (!query) { $('#search-summary').textContent = '输入关键词，查询全部收藏'; $('#search-results').replaceChildren(); return; }
  $('#search-summary').textContent = '正在查询…';
  try { const result = await call('search', { payload: { query, accountId: state?.accountId } }); if (serial === searchSerial) renderSearch(result, query); }
  catch (error) { if (serial === searchSerial) { $('#search-summary').textContent = error.message; $('#search-results').replaceChildren(); } }
}
function setView(next) {
  document.querySelector('#save-result')?.setAttribute('hidden','');
  view = next === 'search' ? 'search' : 'bookmark';
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  $('#bookmark-form').hidden = view === 'search'; $('#search-panel').hidden = view !== 'search';
  $('#view-title').textContent = view === 'search' ? '查询我的收藏' : '收藏这点喜欢';
  if (view === 'search' && state?.signed) setTimeout(() => $('#library-search').focus(), 0);
}
async function checkVersion() {
  try {
    const release = await call('version'), button = $('#version-status');
    button.textContent = release.hasUpdate ? '有新版本' : `V${release.current}`;
    button.classList.toggle('has-update', release.hasUpdate);
    button.dataset.update = String(release.hasUpdate);
    button.setAttribute('aria-label', release.hasUpdate ? `发现新版本 V${release.latest}，点击前往更新` : `当前插件版本 V${release.current}`);
    window.trialRelease = release;
    document.dispatchEvent(new CustomEvent('trial-version-change', { detail: release }));
  } catch { /* Version status must never interrupt saving or search. */ }
}
window.addEventListener('focus', () => { if (!preview) void checkVersion(); });
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
  const unavailable = busy || !state?.signed || !current?.url;
  $('#save-temporary').disabled = unavailable;
  $('#save-group').disabled = unavailable || !$('#group').value;
  $('#save-temporary').querySelector('.save-label').textContent = busy && mode === 'temporary' ? '正在保存…' : '稍后整理';
  $('#save-group').querySelector('.save-label').textContent = busy && mode === 'group' ? '正在保存…' : '收藏至所选分组';
}
function setDestinationLoading(loading, label = '正在读取…') {
  document.querySelectorAll('.place-trigger').forEach(trigger => {
    trigger.disabled = loading;
    if (loading) trigger.querySelector('[data-picker-value]').textContent = label;
  });
}
function selectMode(value) {
  if (value !== mode) { lastSuccess = false; if ($('#status').className === 'success') status(''); }
  mode = value;
  updateSave(); saveDraft();
}
async function saveDraft() {
  if (preview || !current?.url || lastSuccess) return;
  draft = { url: current.url, title: $('#title').value, description: $('#description').value, mode, spaceId: $('#space').value, sceneId: $('#scene').value, groupId: $('#group').value };
  try { await extensionApi.storage.local.set({ draft }); } catch { status('草稿未能暂存，请保持窗口打开后重试。', 'error'); }
}
async function connect() {
  document.body.dataset.auth = 'checking';
  document.dispatchEvent(new Event('trial-auth-change'));
  $('#retry').hidden = true; setDestinationLoading(true); updateSave(); status('正在连接拾隅…');
  try {
    state = await call('state');
    document.body.classList.toggle('guest', !state.signed); $('#login-panel').hidden = state.signed;
    applyTheme(state.theme || null);
    options($('#space'), state.spaces, draft?.spaceId); fillScenes(draft);
    setDestinationLoading(!state.signed, '请先登录');
    $('#editor').disabled = !state.signed || !current?.url;
    status(!state.signed ? '登录后才能收藏。' : !current?.url ? '此页面无法收藏，请打开普通 HTTP / HTTPS 网页。' : '');
    updateSave();
  } catch (error) { state = null; setDestinationLoading(true, '读取失败'); $('#editor').disabled = true; updateSave(); status(error.message, 'error'); $('#retry').hidden = false; }
  finally { document.body.dataset.auth = state?.signed ? 'signed' : state ? 'guest' : 'error'; document.dispatchEvent(new Event('trial-auth-change')); }
}
document.querySelectorAll('.place-trigger').forEach(trigger => trigger.onclick = () => {
  const shell = trigger.closest('.select-shell'), menu = shell.querySelector('.place-menu'), opening = menu.hidden;
  closePickers(shell); menu.hidden = !opening; trigger.setAttribute('aria-expanded', String(opening));
  if (opening) setTimeout(() => menu.querySelector('[aria-selected=true]')?.focus(), 0);
});
document.addEventListener('click', event => { if (!event.target.closest('.select-shell')) closePickers(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePickers(); });
document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => setView(button.dataset.view));
$('#library-search').oninput = () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 180); };
document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') { event.preventDefault(); setView('search'); } });
$('#space').onchange = () => { fillScenes(); saveDraft(); };
$('#scene').onchange = () => { fillGroups(); saveDraft(); };
$('#group').onchange = () => { updateSave(); saveDraft(); };
$('#bookmark-form').oninput = () => { lastSuccess = false; saveDraft(); };
$('#bookmark-form').onsubmit = async event => {
  event.preventDefault(); if (busy || !state?.signed || !current?.url) return;
  selectMode(event.submitter?.dataset.submitMode === 'group' ? 'group' : 'temporary');
  if (mode === 'group' && !$('#group').value) return;
  busy = true; status('正在保存…'); updateSave(); $('#editor').disabled = true;
  try {
    const result = await call('save', { payload: { ...current, title: $('#title').value.trim(), description: $('#description').value.trim(), mode, accountId: state.accountId, spaceId: $('#space').value, sceneId: $('#scene').value, groupId: $('#group').value } });
    lastSuccess = true;
    showSaveResult(result);
    status(preview ? '演示完成 · 实际使用时将保存到' + result.label : result.duplicate ? '已在「' + result.label + '」中，无需重复收藏。' : '已收藏到「' + result.label + '」。', 'success');
    if (!preview) { try { await extensionApi.storage.local.remove('draft'); } catch { /* Save is already confirmed. */ } }
  } catch (error) { status(error.message, 'error'); $('#retry').hidden = false; }
  finally { busy = false; $('#editor').disabled = !state?.signed || !current?.url; updateSave(); if (!preview && location.pathname.endsWith('/panel.html')) queueCurrentPageRefresh(); }
};
$('#retry').onclick = connect;
$('#version-status').onclick = event => { if (event.currentTarget.dataset.update !== 'true') return; call('open-update').catch(error => status(error.message, 'error')); };
for (const [id, page] of [['login', 'login']]) $( '#' + id).onclick = () => {
  if (preview) { window.open((location.hostname === '127.0.0.1' ? 'http://127.0.0.1:4318/' : 'https://shiyubox.com/') + '?extension=login', '_blank', 'noopener'); return; }
  call('open', { page }).catch(error => status(error.message, 'error'));
};
let currentTabId, pageRefreshSerial = 0, pageRefreshTimer;
function pageFromTab(tab) {
  const url = tab?.pendingUrl || tab?.url;
  return url && /^https?:\/\//i.test(url) ? { url, title: (tab.title || new URL(url).hostname).slice(0, 100), icon: tab.favIconUrl || '' } : null;
}
async function refreshCurrentPage() {
  if (preview || busy) return;
  const serial = ++pageRefreshSerial;
  const [tab] = await extensionApi.tabs.query({ active: true, currentWindow: true });
  if (serial !== pageRefreshSerial) return;
  const next = pageFromTab(tab);
  currentTabId = tab?.id;
  if (next?.url !== current?.url) {
    await saveDraft();
    if (serial !== pageRefreshSerial) return;
    current = next; draft = null; lastSuccess = false;
    $('#title').value = current?.title || ''; $('#description').value = '';
    document.querySelector('#save-result')?.setAttribute('hidden', '');
    setView(view);
  } else {
    if ($('#title').value === current?.title) $('#title').value = next?.title || '';
    current = next;
  }
  $('#page-domain').textContent = current ? new URL(current.url).hostname : '浏览器设置页、新标签页等无法收藏';
  setSiteIdentity(); $('#editor').disabled = !state?.signed || !current?.url; updateSave();
  if (state?.signed) status(current?.url ? '' : '此页面无法收藏，请打开普通 HTTP / HTTPS 网页。');
}
function queueCurrentPageRefresh() {
  clearTimeout(pageRefreshTimer);
  pageRefreshTimer = setTimeout(() => refreshCurrentPage().catch(error => status(error.message, 'error')), 80);
}
if (!preview && location.pathname.endsWith('/panel.html')) {
  extensionApi.tabs.onActivated.addListener(queueCurrentPageRefresh);
  extensionApi.tabs.onUpdated.addListener((tabId, change) => {
    if (tabId === currentTabId && (change.url || change.status === 'complete' || change.title)) queueCurrentPageRefresh();
  });
  window.addEventListener('focus', queueCurrentPageRefresh);
}
async function start() {
  if (preview) { document.body.classList.add('preview'); current = { title: '拾隅 · 让喜欢，自有归处', url: 'https://shiyubox.com/', description: '遇见喜欢的，随手收进拾隅。', icon: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect x="2" y="2" width="28" height="28" rx="7" fill="#48614c"/><g transform="translate(4 4)" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 14h7a4 4 0 0 0 4-4V3M14 14l7 7"/></g></svg>') }; }
  else {
    const [tab] = await extensionApi.tabs.query({ active: true, currentWindow: true });
    currentTabId = tab?.id;
    current = pageFromTab(tab);
    try { draft = (await extensionApi.storage.local.get('draft')).draft; if (draft?.url !== current?.url) draft = null; } catch {}
  }
  $('#page-domain').textContent = current ? new URL(current.url).hostname : '浏览器设置页、新标签页等无法收藏';
  setSiteIdentity();
  $('#title').value = draft?.title || current?.title || ''; $('#description').value = draft?.description || current?.description || '';
  mode = draft?.mode === 'group' ? 'group' : 'temporary';
  await connect(); selectMode(mode); setView(view); document.body.dataset.ready = 'true'; checkVersion();
}
start().catch(error => { status(error.message, 'error'); $('#retry').hidden = false; document.body.dataset.ready = 'true'; });
if (preview) new ResizeObserver(() => parent.postMessage({ type: 'shiyu-preview-height', height: document.body.scrollHeight }, location.origin)).observe(document.body);

window.trialApi={call,getState:()=>state,connect,setView,applyTheme,refreshCurrent:async()=>{if(!preview){await saveDraft();current=null;draft=null;await start()}}};

function showSaveResult(result) {
  let panel=document.querySelector('#save-result');
  if(!panel){
    panel=document.createElement('section');panel.id='save-result';panel.setAttribute('aria-labelledby','save-result-title');
    panel.innerHTML='<div class="save-result-art" aria-hidden="true"><svg viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="48" fill="currentColor" opacity=".08"/><rect x="35" y="25" width="50" height="66" rx="12" stroke="currentColor" stroke-width="2"/><path d="M48 25v25l12-7 12 7V25" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="83" cy="83" r="20" fill="var(--accent)"/><path d="m74 83 6 6 12-13" stroke="var(--on-accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h2 id="save-result-title" tabindex="-1">收藏成功</h2><p class="save-result-destination"></p><p class="save-result-note"></p><button type="button" class="primary">继续收藏</button>';
    $('#bookmark-form').after(panel);
    panel.querySelector('button').onclick=()=>{setView('bookmark');status('');lastSuccess=false;updateSave();$('#title').focus();};
  }
  panel.querySelector('h2').textContent=result.duplicate?'已收藏，无需重复添加':'收藏成功';
  panel.querySelector('.save-result-destination').textContent='已收藏到「'+(result.label|| (mode==='temporary'?'稍后整理':$('#group').selectedOptions[0]?.textContent||'所选分组'))+'」';
  panel.querySelector('.save-result-note').textContent=preview?'当前为演示结果，不会写入真实收藏。':'喜欢的内容，已经妥善收好。';
  $('#bookmark-form').hidden=true;panel.hidden=false;panel.querySelector('h2').focus();
}
