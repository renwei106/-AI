(function (root) {
  'use strict';
  if (root.ShiyuAccountSync) return;
  const KEY = 'yiyu-prototype-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  function check(deadline, signal) {
    if (!Number.isFinite(deadline) || Date.now() >= deadline || signal?.aborted) {
      const error = new Error('读取超时，请重试连接拾隅。'); error.name = 'AbortError'; throw error;
    }
  }
  function owner() {
    try { const value = JSON.parse(localStorage.getItem(KEY) || '{}'); return value.signed ? value.prefs?.accountProfile?.id || '' : ''; }
    catch { return ''; }
  }
  function requireOwner(userId, scope) {
    check(scope.deadline, scope.signal);
    if (!userId || owner() !== userId) throw new Error('登录账号已变化，请重新打开插件。');
  }
  async function request(url, options = {}, scope = {}) {
    const deadline = scope.deadline ?? Date.now() + 8000;
    check(deadline, scope.signal);
    const controller = new AbortController();
    const abort = () => controller.abort();
    scope.signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(abort, Math.max(1, deadline - Date.now()));
    try {
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options, signal: controller.signal });
      const value = await response.json();
      check(deadline, controller.signal);
      return { response, value };
    } finally { clearTimeout(timer); scope.signal?.removeEventListener('abort', abort); }
  }
  async function withLock(userId, options, action) {
    const deadline = options?.deadline ?? Date.now() + 8000;
    check(deadline);
    if (!userId || !navigator.locks?.request) throw new Error('暂时无法安全同步，请保持网页打开后重试。');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), Math.max(1, deadline - Date.now()));
    try {
      return await navigator.locks.request('shiyu-account-data:' + userId, { signal: controller.signal }, async () => {
        const scope = { deadline, signal: controller.signal };
        check(deadline, scope.signal);
        return action(scope);
      });
    } finally { clearTimeout(timer); }
  }
  function notify(store, scope) {
    check(scope.deadline, scope.signal);
    try { localStorage.setItem(store.EVENT_KEY, crypto.randomUUID()); } catch {}
    root.dispatchEvent(new CustomEvent('shiyu-extension-change'));
  }
  async function flush(userId, options = {}) {
    // Web Locks coordinate this origin's bridge and website writers. The existing
    // server PUT has no revision: other origins/clients are not covered by this lock.
    return withLock(userId, options, async scope => {
      requireOwner(userId, scope);
      const store = root.ShiyuExtensionStore;
      if (!store) throw new Error('暂时无法读取本地收藏，请重试。');
      const loaded = await request('/api/shiyu/auth/account', {}, scope);
      requireOwner(userId, scope);
      if (!loaded.response.ok || loaded.value.userId !== userId) throw new Error(loaded.value.message || '无法获取账号数据，请重新连接拾隅。');
      const value = { signed: true, data: Array.isArray(loaded.value.data) ? clone(loaded.value.data) : [], prefs: { accountProfile: { id: userId } } };
      const invalidMoves = store.pending(userId).filter(entry => entry.kind === 'move' && !value.data.find(space => space.id === entry.spaceId)?.scenes?.find(scene => scene.id === entry.sceneId)?.groups?.some(group => group.id === entry.groupId)).map(entry => entry.id);
      requireOwner(userId, scope);
      const recoveredMoveIds = invalidMoves.length ? store.recoverPendingMoves(userId, invalidMoves) : [];
      const entries = store.pending(userId).filter(entry => entry.kind !== 'inbox');
      const cloudData = JSON.stringify(value.data);
      const appliedIds = store.applyPending(value, entries, { inbox: false });
      if (!appliedIds.length) return { accountId: userId, appliedIds: [], pendingIds: entries.map(entry => entry.id), recoveredMoveIds };
      requireOwner(userId, scope);
      // A successful GET can confirm a retried/already-present item without
      // rewriting the whole account graph for a duplicate.
      if (JSON.stringify(value.data) !== cloudData) {
        const saved = await request('/api/shiyu/auth/account', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, data: value.data }) }, scope);
        requireOwner(userId, scope);
        if (!saved.response.ok || saved.value.userId !== userId) throw new Error(saved.value.message || '空间保存失败，请重试。');
      }
      // Merge only confirmed plugin additions into the latest local graph. Never
      // replace local non-plugin edits with the GET/PUT response's whole graph.
      const current = JSON.parse(localStorage.getItem(KEY) || '{}');
      const confirmed = new Set(appliedIds), remaining = store.pending(userId);
      const stillPending = remaining.filter(entry => confirmed.has(entry.id));
      const before = JSON.stringify(current.data);
      store.applyPending(current, stillPending, { inbox: false });
      requireOwner(userId, scope);
      if (JSON.stringify(current.data) !== before) localStorage.setItem(KEY, JSON.stringify(current));
      requireOwner(userId, scope);
      store.ackPending(userId, appliedIds);
      notify(store, scope);
      return { accountId: userId, appliedIds, pendingIds: store.pending(userId).filter(entry => entry.kind !== 'inbox').map(entry => entry.id), recoveredMoveIds };
    });
  }
  root.ShiyuAccountSync = Object.freeze({ request, withLock, flush, check, owner });
})(window);
