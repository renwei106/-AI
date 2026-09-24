// Account access and per-user workspace data.
// The public home page stays browseable; private workspace entry points require login.
(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const accountId = () => prefs.accountProfile?.id || '';
  let syncTimer = 0;
  let syncEnabled = true;
  let membershipRequest = 0;
  let membershipExpiryTimer = 0;
  const storageKey = 'yiyu-prototype-v1';
  const localIdentity = () => signed ? accountId() : '';
  const sharedIdentity = () => {
    try { const state = JSON.parse(localStorage.getItem(storageKey) || 'null'); return state?.signed ? state.prefs?.accountProfile?.id || '' : ''; }
    catch { return localIdentity(); }
  };
  let accountEpoch = 0, verifiedUserId = null, authBusy = false, authQueue = Promise.resolve(), logoutRequest = null;
  let accountDataRefreshPending = true;
  const rawPersist = persist;
  const appliedLogins = new WeakSet();
  function invalidateAccount() { accountEpoch++; membershipRequest++; verifiedUserId = null; accountDataRefreshPending = true; clearTimeout(syncTimer); clearTimeout(membershipExpiryTimer); document.documentElement.classList.remove('shiyu-account-ready'); }
  function markAccountReady() { document.documentElement.classList.toggle('shiyu-account-ready', !authBusy && verifiedUserId !== null && verifiedUserId === localIdentity()); }
  const profileKey = id => 'shiyu-account-profile:' + id;
  const profileFields = ['name', 'avatar', 'realName', 'gender', 'birthday', 'profileCompleted'];
  function savedProfile(id) {
    try {
      const value = JSON.parse(localStorage.getItem(profileKey(id)) || '{}');
      return Object.fromEntries(profileFields.filter(key => typeof value?.[key] === (key === 'profileCompleted' ? 'boolean' : 'string')).map(key => [key, value[key]]));
    } catch { return {}; }
  }
  function rememberProfile() {
    const profile = prefs.accountProfile;
    if (!profile?.id) return;
    try {
      const key = profileKey(profile.id);
      // Migrate old local-only display fields to their original owner, never to the next login.
      if (localStorage.getItem(key) !== null && (verifiedUserId !== profile.id || sharedIdentity() !== profile.id)) return;
      localStorage.setItem(key, JSON.stringify(Object.fromEntries(profileFields.filter(field => profile[field] !== undefined).map(field => [field, profile[field]]))));
    } catch { /* profile caching is optional when browser storage is unavailable */ }
  }
  function closeAccountDialogs() {
    document.querySelectorAll('#account-center[open],#account-security[open],#profile-item-editor[open],#account-security-editor[open],#birthday-dialog[open]').forEach(dialog => dialog.close());
  }
  const requestTicket = () => ({ epoch: accountEpoch, identity: sharedIdentity() });
  const currentTicket = ticket => !authBusy && ticket.epoch === accountEpoch && ticket.identity === sharedIdentity();
  function originalPersist() {
    // An old tab must never replace a newer login with its in-memory account.
    if (authBusy || localIdentity() !== sharedIdentity()) { if (!authBusy) void refreshMembership(); return false; }
    rememberProfile();
    rawPersist();
    return true;
  }
  function adoptUser(user, accountData) {
    const previousId = accountId(), changed = !signed || previousId !== user.id;
    if (changed) {
      rememberProfile();
      invalidateAccount();
      data = clone(seed);
      prefs.accountDataUserId = '';
      prefs.membershipDemo = null;
      prefs.demoMemberOrders = [];
      prefs.accountProfile = savedProfile(user.id);
      closeAccountDialogs();
    }
    signed = true;
    verifiedUserId = user.id;
    prefs.accountProfile = { ...prefs.accountProfile, id: user.id, name: prefs.accountProfile?.name || user.name, phone: user.phone || '', email: user.email || '', avatar: prefs.accountProfile?.avatar || ACCOUNT_AVATARS[0] };
    if (Array.isArray(accountData)) { data = clone(accountData); prefs.accountDataUserId = user.id; accountDataRefreshPending = false; normalizeSelection(); }
    syncMembershipFromUser(user);
    syncCornerLoginState();
    return changed;
  }
  function clearAccount() {
    rememberProfile();
    invalidateAccount(); signed = false; verifiedUserId = '';
    prefs.accountProfile = {}; prefs.accountDataUserId = ''; prefs.membership = null; prefs.membershipDemo = null; prefs.demoMemberOrders = [];
    data = clone(seed); normalizeSelection(); view = location.hostname === 'space.shiyubox.com' ? 'space' : 'home'; pending = null;
    publishMembership(null); syncCornerLoginState(); rawPersist();
    closeAccountDialogs();
    window.dispatchEvent(new CustomEvent('shiyu-account-state', { detail: { authenticated: false } }));
    render();
  }
  function withAuthLock(action) {
    const run = () => navigator.locks?.request ? navigator.locks.request('shiyu-account-session', action) : action();
    const task = authQueue.then(run, run); authQueue = task.catch(() => {}); return task;
  }
  function applyLogin(result) {
    if (appliedLogins.has(result)) return;
    invalidateAccount();
    const previousOwner = prefs.accountDataUserId;
    adoptUser(result.user, result.accountData);
    if (!Array.isArray(result.accountData) && previousOwner !== result.user.id) { data = clone(seed); prefs.accountDataUserId = result.user.id; normalizeSelection(); }
    rawPersist(); appliedLogins.add(result);
    window.dispatchEvent(new CustomEvent('shiyu-account-state', { detail: result }));
  }
  window.ShiyuAccountSession = {
    applyLogin,
    login(payload) {
      return withAuthLock(async () => {
        authBusy = true; invalidateAccount();
        try {
          const response = await fetch('/api/shiyu/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          const result = await response.json(); if (!response.ok) throw Error(result.message || '登录失败');
          applyLogin(result); return result;
        } finally { authBusy = false; markAccountReady(); if (verifiedUserId === null) void refreshMembership(); }
      });
    },
    logout() {
      if (logoutRequest) return logoutRequest;
      authBusy = true; invalidateAccount();
      logoutRequest = withAuthLock(async () => {
        authBusy = true;
        try {
          const response = await fetch('/api/shiyu/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' });
          if (!response.ok) throw Error('退出登录失败，请重试');
          clearAccount(); toast('愿你下次回来时，喜欢依然在。');
        } catch (error) { toast(error.message || '退出登录失败，请重试'); }
        finally { authBusy = false; logoutRequest = null; markAccountReady(); void refreshMembership(); }
      });
      return logoutRequest;
    },
  };
  function publishMembership(user, ready = true) {
    const source = user?.membership || user || {};
    const active = signed && source.member === true && (source.permanent === true || Number(source.expiresAt) > Date.now());
    const free = (window.__shiyuMemberCatalog?.plans || []).find(plan => plan.id === 'free');
    const snapshot = { ready, member: active, permanent: active && source.permanent === true,
      expiresAt: source.expiresAt || null, planId: source.planId || 'free', planName: source.planName || '免费版', entitlements: Array.isArray(source.entitlements) ? source.entitlements : [] };
    if (!active && source.member === true) { snapshot.planId = 'free'; snapshot.planName = free?.name || '免费版'; snapshot.entitlements = free?.entitlements || []; }
    clearTimeout(membershipExpiryTimer);
    if (active && !snapshot.permanent) membershipExpiryTimer = setTimeout(() => {
      if (snapshot.expiresAt <= Date.now()) {
        prefs.membership = null;
        const currentFree = (window.__shiyuMemberCatalog?.plans || []).find(plan => plan.id === 'free');
        publishMembership({ member: false, entitlements: currentFree?.entitlements || [] });
        originalPersist();
        if (typeof updateHeader === 'function') updateHeader();
      }
      void refreshMembership();
    }, Math.min(snapshot.expiresAt - Date.now() + 25, 2147483647));
    window.__shiyuUserEntitlements = snapshot;
    window.dispatchEvent(new CustomEvent('shiyu-user-entitlements', { detail: snapshot }));
  }
  publishMembership(null, false);

  // The bottom "我的一隅" preview is only discoverable after login. Keep the
  // entry itself visible so an unsigned visitor can click it and open login.
  const syncCornerLoginState = () => {
    document.body.classList.toggle('account-unsigned', !signed);
  };
  syncCornerLoginState();

  persist = function accountPersist() {
    if (!originalPersist()) return;
    if (!syncEnabled || !signed || !accountId() || prefs.accountDataUserId !== accountId()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { void saveAccountData(); }, 350);
  };

  function membershipFromUser(user) {
    if (!user || user.member !== true) return null;
    const label = String(user.memberExpiresAt || '').trim();
    if (user.permanent === true || user.membership?.permanent === true || label === '永久') return { ...user.membership, member: true, permanent: true, expiresAt: null, label: '永久' };
    const parsed = typeof user.expiresAt === 'number' ? user.expiresAt : Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(label) ? `${label}T23:59:59+08:00` : label);
    return Number.isFinite(parsed) && parsed > Date.now() ? { ...user.membership, member: true, permanent: false, expiresAt: parsed, label } : null;
  }

  function syncMembershipFromUser(user) {
    if (!user) return false;
    publishMembership(user);
    const next = membershipFromUser(user);
    if (JSON.stringify(prefs.membership || null) === JSON.stringify(next)) return false;
    prefs.membership = next;
    return true;
  }

  async function refreshMembership(forceData = false) {
    if (forceData) accountDataRefreshPending = true;
    if (authBusy) return;
    const requestId = ++membershipRequest;
    const ticket = requestTicket();
    try {
      const response = await fetch('/api/shiyu/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const result = await response.json();
      if (requestId !== membershipRequest || !currentTicket(ticket)) return;
      if (result.authenticated !== true || !result.user?.id) {
        if (signed || sharedIdentity()) clearAccount();
        else { verifiedUserId = ''; publishMembership({ member: false, entitlements: result.entitlements || [] }); }
        return;
      }
      const previousMembership = JSON.stringify(prefs.membership || null), previousProfile = JSON.stringify(prefs.accountProfile || {});
      const changed = adoptUser(result.user);
      rawPersist();
      if (changed || accountDataRefreshPending || prefs.accountDataUserId !== result.user.id) {
        await loadAccountData(result.user.id);
      }
      if (verifiedUserId === result.user.id && (changed || previousMembership !== JSON.stringify(prefs.membership || null) || previousProfile !== JSON.stringify(prefs.accountProfile || {}))) render();
    } catch { if (requestId === membershipRequest && currentTicket(ticket)) { verifiedUserId = null; publishMembership(null, false); } }
    finally { markAccountReady(); }
  }
  window.refreshShiyuMembership = refreshMembership;
  window.addEventListener('shiyu-member-catalog', () => { void refreshMembership(); });

  async function saveAccountData() {
    if (authBusy || !signed || !accountId() || verifiedUserId !== accountId() || sharedIdentity() !== accountId() || prefs.accountDataUserId !== accountId()) return;
    const userId = accountId(), ticket = requestTicket();
    try {
      const response = await fetch('/api/shiyu/auth/account', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data }),
      });
      if (!currentTicket(ticket) || accountId() !== userId) return;
      if (!response.ok) { const result = await response.json(); toast(result.message || '空间保存失败'); await hydrateAccountData(); }
    } catch { /* local storage remains the fallback for offline preview */ }
  }

  function normalizeSelection() {
    if (!data.length) return;
    if (!data.some(spaceItem => spaceItem.id === spaceId)) spaceId = data[0].id;
    const selectedSpace = data.find(spaceItem => spaceItem.id === spaceId);
    if (!selectedSpace.scenes.some(sceneItem => sceneItem.id === sceneId)) sceneId = selectedSpace.scenes[0]?.id || null;
  }

  function openLogin() {
    if (signed) return false;
    show('#login');
    const status = $('#login .account-status');
    if (status) status.textContent = '';
    return true;
  }

  function isSpaceEntry(target) {
    return target.closest?.('[data-action="space"],[data-v2="enter"],[data-space],[data-heading-space],.space-option,.dock-label')
      || target.closest?.('.corner-entry:not(.corner-close-entry)');
  }

  // Capture before the existing navigation handlers so an unsigned visitor cannot enter a space.
  window.addEventListener('click', event => {
    if (signed) return;
    const target = event.target;
    const button = target.closest?.('button,a,[role="button"]');
    if (!button || button.matches('[data-action="home"],[data-v2="return"]')) return;
    if (!isSpaceEntry(button)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openLogin();
  }, true);

  // Login UI upgrades can complete through the shared account dialog. Keep
  // the corner preview in sync when that flow finishes outside this module.
  window.addEventListener('shiyu-account-state', event => {
    syncCornerLoginState();
    if (event.detail?.user && event.detail.user.id === accountId()) { syncMembershipFromUser(event.detail.user); originalPersist(); }
    else { if (!signed) { prefs.membership = null; publishMembership(null); } void refreshMembership(); }
  });

  const originalChangeView = changeView;
  changeView = function accountChangeView(next, ...args) {
    if (next === 'space' && !signed) { openLogin(); return; }
    return originalChangeView(next, ...args);
  };
  const originalGoSpace = goSpace;
  goSpace = function accountGoSpace(...args) {
    if (!signed) { openLogin(); return; }
    return originalGoSpace(...args);
  };
  const originalNavigationGesture = navigationGesture;
  navigationGesture = function accountNavigationGesture(delta, ...args) {
    if (view === 'home' && delta > 0 && !signed) { const now = Date.now(); if (downArmedAt && now - downArmedAt < 2400) { downArmedAt = 0; openLogin('再向下滚动一次即可进入你的空间。登录后即可继续进入。'); return; } downArmedAt = now; toast('再向下滚动一次，进入你的空间。','bottom'); return; }
    return originalNavigationGesture(delta, ...args);
  };
  const originalWorkspace = workspace;
  workspace = function accountWorkspace(...args) {
    if (!signed && location.hostname !== 'space.shiyubox.com') { view = 'home'; openLogin(); render(); return; }
    return originalWorkspace(...args);
  };

  async function loadAccountData(userId) {
    const ticket = requestTicket();
    if (authBusy || !signed || verifiedUserId !== userId || accountId() !== userId) return;
    try {
      const response = await fetch('/api/shiyu/auth/account', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const result = await response.json();
      if (!currentTicket(ticket) || accountId() !== userId || verifiedUserId !== userId || result.userId !== userId) return;
      accountDataRefreshPending = false;
      if (Array.isArray(result.data)) {
        syncEnabled = false;
        data = clone(result.data);
        prefs.accountDataUserId = userId;
        normalizeSelection();
        originalPersist();
        syncEnabled = true;
        render();
      }
    } catch { /* unauthenticated/static hosting keeps the local prototype available */ }
  }
  async function hydrateAccountData(onMembershipReady) {
    await refreshMembership(true);
    onMembershipReady?.();
  }

  async function login(button) {
    const dialog = $('#login');
    const inputs = dialog?.querySelectorAll('.account-login-content input') || [];
    const status = dialog?.querySelector('.account-status');
    const account = inputs[0]?.value.trim();
    const credential = inputs[1]?.value.trim();
    if (!account || !credential) { if (status) status.textContent = '请填写账号和验证码或密码。'; return; }
    const previousId = prefs.accountDataUserId || (signed ? accountId() : '');
    button.disabled = true;
    if (status) status.textContent = '正在登录…';
    try {
      const result = await window.ShiyuAccountSession.login({ account, credential, mode: accountLoginTab === 'password' ? 'password' : 'code', invitationCode: window.shiyuInvitationCode || sessionStorage.getItem('shiyu-invitation-code') || undefined });
      if (!Array.isArray(result.accountData) && previousId === result.user.id && Array.isArray(data)) {
        // A legacy account has no server copy yet; migrate the same browser's existing data once.
        await saveAccountData();
      }
      dialog.close();
      render();
      toast('已与你相识，欢迎来到拾隅。');
    } catch (error) {
      if (status) status.textContent = error.message || '登录失败';
    } finally {
      button.disabled = false;
      delete button.dataset.accountHandled;
    }
  }

  // Replace the preview-only login action with the account API action.
  window.addEventListener('click', event => {
    const button = event.target.closest?.('[data-shiyu-login]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!button.dataset.accountHandled) {
      button.dataset.accountHandled = 'true';
      void login(button);
    }
  }, true);

  // Complete server sign-out before publishing the signed-out browser state.
  window.addEventListener('click', event => {
    if (event.target.closest?.('[data-account-signout]')) {
      event.preventDefault(); event.stopImmediatePropagation();
      void window.ShiyuAccountSession.logout();
    }
  }, true);

  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    if (localIdentity() === sharedIdentity()) return;
    invalidateAccount();
    document.documentElement.classList.remove('shiyu-account-ready');
    void hydrateAccountData().finally(markAccountReady);
  });

  // Membership can be granted or revoked from the admin while the public page
  // is still open. Re-read the server-owned entitlement when the user returns
  // to the page so the header and membership surfaces do not stay stale.
  window.addEventListener('focus', () => { void refreshMembership(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void refreshMembership(); });

  // Keep the account slot reserved but invisible until the first membership
  // snapshot has been checked. This prevents a stale badge from flashing on
  // refresh before the server-owned entitlement is applied.
  void hydrateAccountData(markAccountReady).finally(markAccountReady);
})();
