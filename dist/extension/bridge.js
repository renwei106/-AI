(function (root) {
  'use strict';
  const protocol = 'shiyu-local-v1', store = root.ShiyuExtensionStore, sync = root.ShiyuAccountSync;
  const requests = new Map(), clone = value => JSON.parse(JSON.stringify(value));
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const profileKey = id => 'shiyu-account-profile:' + id;
  const inboxKey = id => 'shiyu-extension-inbox:' + id;
  const prefsKey = id => 'shiyu-extension-prefs:' + id;
  function active(message) { sync.check(message.deadline); }
  function hydrate(message) {
    active(message);
    const user = message.account?.user, id = user?.id;
    if (typeof id !== 'string' || !id || id.length > 128) throw new Error('无法确认拾隅账号，请重新连接。');
    if (message.payload?.accountId && message.payload.accountId !== id) throw new Error('登录账号已变化，请重新打开插件。');
    const previous = read(store.KEY) || {}, oldPrefs = previous.prefs || {}, previousId = oldPrefs.accountProfile?.id;
    const sameOwner = previous.signed === true && previousId === id;
    const ready = sameOwner && oldPrefs.accountDataUserId === id && Array.isArray(previous.data);
    // Request cloud data before making any owner/data change. In particular, an
    // account-only state request must never turn a cold account into an empty one.
    if (!ready && !Array.isArray(message.account?.data)) return null;
    if (!sameOwner && previousId) {
      active(message); localStorage.setItem(profileKey(previousId), JSON.stringify(oldPrefs.accountProfile || {}));
      active(message); localStorage.setItem(inboxKey(previousId), JSON.stringify(oldPrefs.extensionInbox || []));
      active(message); localStorage.setItem(prefsKey(previousId), JSON.stringify(oldPrefs));
    }
    const restored = !sameOwner ? read(prefsKey(id)) : null;
    const prefs = { ...oldPrefs, ...(restored || {}) };
    if (!sameOwner) { prefs.membership = null; prefs.membershipDemo = null; prefs.demoMemberOrders = []; }
    prefs.accountProfile = { ...user, ...(sameOwner ? oldPrefs.accountProfile : read(profileKey(id)) || {}), id };
    prefs.accountDataUserId = id;
    prefs.extensionInbox = sameOwner ? oldPrefs.extensionInbox || [] : read(inboxKey(id)) || restored?.extensionInbox || [];
    const data = ready ? previous.data : clone(message.account.data);
    const value = { ...previous, signed: true, data, prefs };
    store.applyPending(value, store.pending(id));
    active(message); localStorage.setItem(store.KEY, JSON.stringify(value));
    active(message); localStorage.setItem(inboxKey(id), JSON.stringify(prefs.extensionInbox));
    return id;
  }
  function list(id) {
    const value = read(store.KEY) || {}, items = [];
    const add = (item, extra) => { try { const url = new URL(item[1]); if (!['http:', 'https:'].includes(url.protocol)) return; items.push({ title: String(item[0] || url.hostname), url: url.href, description: String(item[2] || ''), icon: String(item[3] || ''), domain: url.hostname, ...extra }); } catch {} };
    for (const s of value.data || []) for (const c of s.scenes || []) for (const g of c.groups || []) for (const item of g.items || []) add(item, { spaceId: s.id, sceneId: c.id, groupId: g.id, path: [s.name, c.name, g.name].join(' / ') });
    for (const row of store.inbox()) add(row.item, { id: row.id, inbox: true, path: '稍后整理' });
    const library = value.prefs?.cornerCollections?.[id];
    const commonGroups = (library?.groups || []).filter(group => group.system !== 'inbox').map(group => {
      const refs = [...(group.refs || [])];
      if (group.sort === 'frequency') refs.sort((a, b) => (library.usage?.[b.url] || 0) - (library.usage?.[a.url] || 0));
      const common = refs.flatMap(ref => { let url; try { url = new URL(ref.url).href; } catch { return []; } if (ref.own) { const before = items.length; add(ref.own, { path: '我的常用' }); return items.length > before ? [items[items.length - 1]] : []; } const item = items.find(item => !item.inbox && item.groupId === ref.gid && item.url === url) || items.find(item => !item.inbox && item.url === url); return item ? [item] : []; });
      return { id: group.id, name: group.name, items: common };
    });
    return { accountId: id, items, commonGroups };
  }
  async function dispatch(message) {
    active(message);
    if (!['state', 'list', 'search', 'save', 'move'].includes(message.op)) throw new Error('不支持的插件操作。');
    const claimed = message.account?.user?.id;
    if (typeof claimed !== 'string' || !claimed || claimed.length > 128) throw new Error('无法确认拾隅账号，请重新连接。');
    // The worker is the caller's identity source, but an extension origin alone
    // must not authorize access to this origin's unpartitioned private storage.
    const beforeOwner = sync.owner();
    const identity = await sync.request('/api/shiyu/auth/session', {}, { deadline: message.deadline });
    active(message);
    if (!identity.response.ok || identity.value.authenticated !== true || identity.value.user?.id !== claimed) throw new Error('登录账号已变化，请重新打开插件。');
    const afterOwner = sync.owner();
    if (beforeOwner && afterOwner !== beforeOwner || !beforeOwner && afterOwner && afterOwner !== claimed) throw new Error('登录账号已变化，请重新打开插件。');
    message = { ...message, account: { ...message.account, user: identity.value.user } };
    const id = hydrate(message);
    if (!id) return { needsData: true };
    const payload = { ...(message.payload || {}), accountId: id };
    active(message);
    if (message.op === 'state') {
      const value = store.snapshot(), hint = read('shiyu-extension-theme:' + id)?.[message.account?.themePath || '/'];
      if (hint && /^#[0-9a-f]{6}$/i.test(hint.color) && ['light', 'dark', 'system'].includes(hint.mode)) value.theme = { color: hint.color, mode: hint.mode };
      return value;
    }
    if (message.op === 'list') return list(id);
    if (message.op === 'search') return store.search(payload);
    const before = new Set(store.pending(id).map(entry => entry.id));
    // A failed move has already persisted its journal and removed the local row.
    // Repeating that same move must finish the journal instead of losing its retry.
    const retryMove = message.op === 'move' && !store.inbox().some(row => row.id === payload.id)
      ? store.pending(id).find(entry => entry.kind === 'move' && entry.removeInboxIds?.includes(payload.id) && entry.spaceId === payload.spaceId && entry.sceneId === payload.sceneId && entry.groupId === payload.groupId) : null;
    let result;
    if (retryMove) {
      const graph = read(store.KEY)?.data || [], space = graph.find(value => value.id === payload.spaceId), scene = space?.scenes?.find(value => value.id === payload.sceneId), group = scene?.groups?.find(value => value.id === payload.groupId);
      if (!group) throw new Error('该分组已变更，请刷新后重新选择。');
      result = { label: [space.name, scene.name, group.name].join(' / ') };
    } else result = message.op === 'move' ? store.move({ ...payload, confirmCloud: true }) : store.save({ ...payload, confirmCloud: true });
    const savedUrl = message.op === 'save' ? new URL(payload.url).href : null;
    const pending = store.pending(id).filter(entry => entry.kind !== 'inbox' && (!before.has(entry.id) || retryMove?.id === entry.id || message.op === 'save' && entry.spaceId === payload.spaceId && entry.sceneId === payload.sceneId && entry.groupId === payload.groupId && entry.item?.[1] === savedUrl)).map(entry => entry.id);
    if (message.op === 'move' || payload.mode === 'group') {
      const flushed = await sync.flush(id, { deadline: message.deadline });
      active(message);
      if (sync.owner() !== id) throw new Error('登录账号已变化，请重新打开插件。');
      if (pending.some(id => flushed.recoveredMoveIds?.includes(id))) throw new Error('目标分组已变化，收藏仍保留在稍后整理，请重新选择。');
      const remaining = new Set(store.pending(id).map(entry => entry.id));
      if (pending.some(id => remaining.has(id))) throw new Error('目标分组已变化，收藏保留在本地，请刷新后重试。');
    }
    active(message);
    localStorage.setItem(inboxKey(id), JSON.stringify((read(store.KEY)?.prefs?.extensionInbox) || []));
    return result;
  }
  root.addEventListener('message', event => {
    const message = event.data;
    if (root.parent === root || event.source !== root.parent || !/^(?:chrome-extension|moz-extension):\/\/[a-z0-9-]+$/i.test(event.origin) || message?.protocol !== protocol || typeof message.id !== 'string' || !message.id || message.id.length > 128) return;
    let task = requests.get(message.id);
    if (!task) {
      task = Promise.resolve().then(() => dispatch(message)).then(value => ({ protocol, id: message.id, ok: true, value }), error => ({ protocol, id: message.id, ok: false, error: error.name === 'AbortError' ? '读取超时，请重试连接拾隅。' : error.message, code: error.name === 'AbortError' ? 'DEADLINE_EXCEEDED' : 'LOCAL_OPERATION_FAILED' }));
      requests.set(message.id, task);
      task.finally(() => setTimeout(() => { if (requests.get(message.id) === task) requests.delete(message.id); }, 30000));
    }
    task.then(response => event.source.postMessage(response, event.origin));
  });
})(window);
