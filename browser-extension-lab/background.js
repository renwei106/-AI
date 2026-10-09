import { SITE_URLS } from './config.js';
import { initialState } from './todo-calendar-core.js';

const api = globalThis.browser || globalThis.chrome;
const sites = SITE_URLS.map(value => new URL(value));
const TIMEOUT = '读取超时，请重试连接拾隅。';
const OWNER_CHANGED = '登录账号已变化，请重新打开插件。';
const clients = new Map(), mutations = new Map();
let receiptWrites = Promise.resolve();
const trusted = sender => sender.id === api.runtime.id && ['popup.html', 'panel.html'].some(file => sender.url === api.runtime.getURL(file));
const detectBrowser = () => /Firefox\//.test(navigator.userAgent) ? 'firefox' : /Edg\//.test(navigator.userAgent) ? 'edge' : /Quark\//i.test(navigator.userAgent) ? 'quark' : /QQBrowser\//i.test(navigator.userAgent) ? 'qq' : /360(?:SE|EE)|QihooBrowser/i.test(navigator.userAgent) ? '360' : 'chrome';
const newer = (a, b) => {
  a = String(a).split('.').map(Number); b = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  return false;
};

// A port belongs to one popup/panel. Local-only data never goes through an arbitrary
// website tab, and closing that UI cancels its outstanding bridge requests.
api.runtime.onConnect.addListener(port => {
  if (!trusted(port.sender) || !port.name.startsWith('shiyu-local-v1:')) return;
  const id = port.name.slice('shiyu-local-v1:'.length);
  if (!/^[\w-]{8,80}$/.test(id) || clients.has(id)) return;
  const client = { port, sender: port.sender, pending: new Map() };
  clients.set(id, client);
  port.onMessage.addListener(message => {
    const pending = client.pending.get(message?.id);
    if (!pending || message.type !== 'local-result') return;
    client.pending.delete(message.id);
    message.ok ? pending.resolve(message.value) : pending.reject(Error(message.error || '读取失败，请重试'));
  });
  port.onDisconnect.addListener(() => {
    if (clients.get(id) === client) clients.delete(id);
    for (const pending of client.pending.values()) pending.reject(Error('插件窗口已关闭，请重新打开。'));
    client.pending.clear();
  });
});

async function selectSite() {
  // Query metadata only, never run code on a website tab. Keep the existing site
  // and effective-theme selection, including the lab's explicit localhost target.
  for (const site of sites) {
    const tab = (await api.tabs.query({ url: site.origin + '/*' })).find(tab => {
      try { return new URL(tab.url).origin === site.origin; } catch { return false; }
    });
    if (tab) return { site, themePath: new URL(tab.url).pathname };
  }
  return { site: sites[0], themePath: '/' };
}
function check(job) { if (job.signal.aborted || Date.now() >= job.deadline) throw Error(TIMEOUT); }
async function json(job, path, options = {}) {
  check(job);
  const response = await fetch(new URL(path, job.site), { ...options, credentials: 'include', cache: 'no-store', signal: job.signal });
  const result = await response.json(); check(job);
  if (!response.ok) throw Error(result.message || '无法连接账号数据，请重试。');
  return result;
}
async function session(job, expected) {
  const result = await json(job, 'api/shiyu/auth/session');
  const user = result.authenticated === true && result.user?.id ? result.user : null;
  if (expected && user?.id !== expected) throw Error(OWNER_CHANGED);
  return user;
}
function local(job, op, payload, account) {
  check(job);
  const client = clients.get(job.clientId);
  if (!client) return Promise.reject(Error('插件连接已关闭，请重新打开。'));
  const id = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const cancel = () => { client.pending.delete(id); reject(Error(TIMEOUT)); };
    job.signal.addEventListener('abort', cancel, { once: true });
    const finish = fn => value => { job.signal.removeEventListener('abort', cancel); try { check(job); fn(value); } catch (error) { reject(error); } };
    client.pending.set(id, { resolve: finish(resolve), reject: error => { job.signal.removeEventListener('abort', cancel); reject(error); } });
    try { client.port.postMessage({ type: 'local-request', id, site: job.site.origin, deadline: job.deadline, op, payload, account: { ...account, themePath: job.themePath } }); }
    catch (error) { client.pending.delete(id); job.signal.removeEventListener('abort', cancel); reject(error); }
  });
}
async function account(job, user) {
  const value = await json(job, 'api/shiyu/auth/account');
  if (value.userId !== user.id) throw Error(OWNER_CHANGED);
  return { user, data: Array.isArray(value.data) ? value.data : [] };
}
async function state(job) {
  const user = await session(job);
  if (!user) return { signed: false, accountId: null, name: '', theme: null, inboxCount: 0, spaces: [] };
  // Local metadata is optional until authentication completes. Hydrate only a cold
  // or different owner, never overwrite this account's unsynchronized edits.
  const value = await local(job, 'state', null, { user });
  if (value?.needsData) return local(job, 'state', null, await account(job, user));
  return value;
}
async function localAction(job, request, user) {
  const value = await local(job, request.type, request.payload, { user });
  return value?.needsData ? local(job, request.type, request.payload, await account(job, user)) : value;
}

function matchesItem(tool, item, input) {
  if (!item || item.deletedAt || item.archivedAt) return false;
  if (tool === 'memo') return item.content === input.content;
  const expected = { title: input.title, date: input.date || '', priority: Math.max(0, Math.min(3, Number(input.priority) || 0)), done: !!input.done };
  if (Object.hasOwn(input, 'groupId')) expected.groupId = input.groupId || '';
  if (Object.hasOwn(input, 'start')) Object.assign(expected, { start: input.start, duration: Number(input.duration) > 0 ? Number(input.duration) : 30, dateEnd: input.date ? input.dateEnd || input.date : '' });
  return Object.entries(expected).every(([field, value]) => item[field] === value);
}
async function toolRecords(job, p) {
  if (!['memo', 'todo'].includes(p?.tool) || !['read', 'save'].includes(p?.action)) throw Error('无效的工具操作');
  const result = await json(job, 'api/shiyu/auth/tools');
  if (result.userId !== p.accountId) throw Error(OWNER_CHANGED);
  const doc = result.tools?.[p.tool];
  let data = structuredClone(doc?.data || (p.tool === 'memo' ? { notes: [], lastNumber: 0 } : { calendarV2: { version: 2, revision: 0, groups: [], tasks: [], initialized: true } }));
  if (p.action === 'read') return { data, revision: doc?.revision || 0 };
  if (p.tool === 'todo' && !data.calendarV2) data.calendarV2 = initialState({ ...data, tasks: data.tasks || [], inbox: data.inbox || [] });
  const items = p.tool === 'memo' ? (data.notes ||= []) : data.calendarV2.tasks;
  const input = p.item;
  if (!input || typeof input.id !== 'string') throw Error('记录无效');
  let item = items.find(value => value.id === input.id);
  if ((doc?.revision || 0) !== p.revision) {
    // A response may be lost after the server committed. Retry the same record,
    // rather than creating another one or accepting a different owner's content.
    if (matchesItem(p.tool, item, input)) return { data, revision: doc?.revision || 0 };
    throw Error('内容已在其他页面更新，请刷新列表后重试');
  }
  if (item?.deletedAt || item?.archivedAt) throw Error('这条记录已删除或归档，请刷新后重试');
  if (!item) {
    item = { id: input.id, createdAt: Date.now() };
    if (p.tool === 'memo') { data.lastNumber = Math.max(data.lastNumber || 0, ...items.map(value => value.number || 0)) + 1; Object.assign(item, { number: data.lastNumber, title: '', icon: '✦', color: 'theme' }); }
    else Object.assign(item, { start: null, duration: 30, groupId: '', description: '', dateEnd: '', done: false });
    items.unshift(item);
  }
  if (p.tool === 'memo') {
    if (typeof input.content !== 'string' || !input.content.trim() || Array.from(input.content).length > 300) throw Error('小记内容请填写1–300字');
    item.content = input.content;
  } else {
    if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 200) throw Error('待办标题请填写1–200字');
    if (input.date && !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw Error('日期无效');
    if (item.date !== input.date) item.dateEnd = input.date;
    Object.assign(item, { title: input.title, date: input.date || '', priority: Math.max(0, Math.min(3, Number(input.priority) || 0)), done: !!input.done, completedAt: input.done ? item.completedAt || Date.now() : null });
    data.calendarV2.revision = (data.calendarV2.revision || 0) + 1;
    if (Object.hasOwn(input, 'groupId')) {
      if (input.groupId && !data.calendarV2.groups.some(group => group.id === input.groupId)) throw Error('分组已变化，请刷新后重试');
      item.groupId = input.groupId || '';
    }
    if (Object.hasOwn(input, 'start')) {
      const start = input.start, duration = Number(input.duration);
      if (start !== null && (!Number.isInteger(start) || start < 0 || start >= 1440 || !Number.isFinite(duration) || duration <= 0 || duration > 525600 || !input.date)) throw Error('时间段无效');
      if (input.dateEnd && (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateEnd) || input.dateEnd < input.date)) throw Error('结束日期无效');
      Object.assign(item, { start, duration: Number.isFinite(duration) && duration > 0 ? duration : 30, dateEnd: input.date ? input.dateEnd || input.date : '' });
    }
  }
  item.updatedAt = Date.now();
  await session(job, p.accountId); check(job);
  const saved = await json(job, 'api/shiyu/auth/tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: p.accountId, tool: p.tool, data, revision: doc?.revision || 0, initialize: false }) });
  if (saved.userId !== p.accountId) throw Error(OWNER_CHANGED);
  return { data: saved.data, revision: saved.revision };
}
async function versionStatus(job) {
  const current = api.runtime.getManifest().version;
  try { const release = await json(job, 'extension/release.json'), latest = /^\d+\.\d+\.\d+$/.test(release.latest || '') ? release.latest : current;
    return { current, latest, hasUpdate: newer(latest, current), browser: detectBrowser() };
  } catch { return { current, latest: current, hasUpdate: false, browser: detectBrowser() }; }
}
async function action(job, request) {
  if (request.type === 'state') return state(job);
  if (['save', 'move', 'search', 'list', 'tool-records'].includes(request.type)) {
    if (!request.payload?.accountId) throw Error('请先登录拾隅，再保存收藏。');
    const user = await session(job, request.payload.accountId);
    const execute = () => request.type === 'tool-records' ? toolRecords(job, request.payload) : localAction(job, request, user);
    const mutating = ['save', 'move'].includes(request.type) || request.type === 'tool-records' && request.payload.action === 'save';
    if (!mutating || !request.requestId) return execute();
    const key = job.site.origin + ':' + user.id + ':' + request.requestId;
    const normalized = structuredClone(request.payload);
    if (request.type === 'tool-records' && normalized.item) delete normalized.item.updated;
    const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
    const fingerprint = JSON.stringify(ordered({ type: request.type, payload: normalized }));
    const before = mutations.get(key);
    if (before && before.fingerprint !== fingerprint) throw Error('请求内容已变化，请重新提交。');
    if (before) return before.promise;
    const entry = { fingerprint, promise: (async () => {
      // Moving an inbox row removes its source. Retain its confirmed receipt across
      // service-worker restarts; ordinary saves can be verified by URL/record ID.
      if (request.type !== 'move') return execute();
      const receiptKey = 'shiyuConfirmedMoves';
      const receipts = (await api.storage.local.get(receiptKey))[receiptKey] || [];
      check(job);
      const receipt = receipts.find(value => value.key === key);
      if (receipt) {
        if (receipt.fingerprint !== fingerprint) throw Error('请求内容已变化，请重新提交。');
        return receipt.value;
      }
      const value = await execute();
      const write = receiptWrites.then(async () => {
        const latest = (await api.storage.local.get(receiptKey))[receiptKey] || [];
        await api.storage.local.set({ [receiptKey]: [...latest.filter(value => value.key !== key), { key, fingerprint, value }].slice(-100) });
      });
      receiptWrites = write.catch(() => {});
      await write;
      return value;
    })() };
    mutations.set(key, entry);
    try { const value = await entry.promise; entry.promise = Promise.resolve(value); return value; }
    catch (error) { if (mutations.get(key) === entry) mutations.delete(key); throw error; }
    finally { if (mutations.size > 100) mutations.delete(mutations.keys().next().value); }
  }
  if (request.type === 'version') return versionStatus(job);
  if (request.type === 'open-shortcuts') {
    const url = { chrome: 'chrome://extensions/shortcuts', edge: 'edge://extensions/shortcuts' }[detectBrowser()];
    if (!url) throw Error('当前浏览器不支持此快捷键设置入口');
    await api.tabs.create({ url }); return true;
  }
  if (request.type === 'open-url') {
    let url; try { url = new URL(request.url); } catch { throw Error('网址无效。'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw Error('仅支持打开普通网页。');
    await api.tabs.create({ url: url.href }); return true;
  }
  if (request.type === 'open' || request.type === 'open-update') {
    const route = request.type === 'open-update' ? `extension/?browser=${encodeURIComponent(detectBrowser())}#download` : { login: '?extension=login', collection: 'extension/inbox.html', guide: 'extension/' }[request.page];
    if (route === undefined) throw Error('无效的页面。');
    await api.tabs.create({ url: new URL(route, job.site).href }); return true;
  }
  throw Error('无效的插件操作。');
}
api.runtime.onMessage.addListener((request, sender, reply) => {
  if (!trusted(sender)) return false;
  const client = clients.get(request?.clientId);
  if (!client || client.sender.url !== sender.url || sender.documentId && client.sender.documentId !== sender.documentId) { reply({ ok: false, error: '插件连接已关闭，请重新打开。' }); return false; }
  const controller = new AbortController(), deadline = Date.now() + 6000;
  let timer;
  const expired = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(Error(TIMEOUT)); }, 6000); });
  const task = (async () => { const { site, themePath } = await selectSite(); const job = { site, themePath, clientId: request.clientId, signal: controller.signal, deadline }; check(job); return action(job, request); })();
  Promise.race([task, expired]).then(value => reply({ ok: true, value }), error => reply({ ok: false, error: controller.signal.aborted || error.name === 'AbortError' ? TIMEOUT : error.message })).finally(() => clearTimeout(timer));
  return true;
});
async function applyMode() {
  const { opening = 'popup' } = await api.storage.local.get('opening');
  const side = opening === 'side' && !!(api.sidePanel?.open || api.sidebarAction?.open);
  await api.action.setPopup({ popup: side ? '' : 'popup.html' });
  if (api.sidePanel?.setPanelBehavior) await api.sidePanel.setPanelBehavior({ openPanelOnActionClick: side });
}
if (api.sidebarAction) api.action.onClicked.addListener(() => api.sidebarAction.open());
api.runtime.onInstalled.addListener(applyMode);
api.runtime.onStartup.addListener(applyMode);
api.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.opening) void applyMode(); });
