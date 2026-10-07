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
  const localPreview = ['127.0.0.1', 'localhost'].includes(location.hostname);
  const previewViewKey = 'shiyu-preview-view';
  const spaceContextKey = 'shiyu-space-context';
  const rememberPreviewView = next => { if (localPreview) try { sessionStorage.setItem(previewViewKey, next); } catch {} };
  const rememberSpaceContext = () => { try { sessionStorage.setItem(spaceContextKey, JSON.stringify({ accountId: accountId(), spaceId, sceneId })); } catch {} };
  const savedSpaceContext = () => { try { const saved = JSON.parse(sessionStorage.getItem(spaceContextKey) || 'null'); return saved?.accountId === accountId() ? saved : null; } catch { return null; } };
  let handoffSelection = null;
  let directSpacePending = location.hostname === 'space.shiyubox.com' || localPreview && (() => { try { return sessionStorage.getItem(previewViewKey) === 'space'; } catch { return false; } })();
  if (directSpacePending) {
    const guard = document.createElement('style');
    guard.textContent = 'html:not(.shiyu-account-ready) #main{visibility:hidden}';
    document.head.append(guard);
  }
  const rawPersist = persist;
  const appliedLogins = new WeakSet();
  function invalidateAccount() { accountEpoch++; membershipRequest++; verifiedUserId = null; accountDataRefreshPending = true; clearTimeout(syncTimer); clearTimeout(membershipExpiryTimer); document.documentElement.classList.remove('shiyu-account-ready'); }
  function markAccountReady() {
    const ready = !authBusy && verifiedUserId !== null && verifiedUserId === localIdentity();
    document.documentElement.classList.toggle('shiyu-account-ready', ready);
    if (ready) window.dispatchEvent(new CustomEvent('shiyu-session-ready', {detail:{authenticated:!!signed}}));
  }
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
    document.querySelectorAll('#account-center[open],#account-security[open],#profile-item-editor[open],#account-security-editor[open],#account-cancellation[open],#birthday-dialog[open]').forEach(dialog => dialog.close());
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
    if (user.cornerUiHints?.closeGuideAcknowledgedAt && prefs.cornerCloseGuideAcknowledgedV1?.[user.id] !== true) {
      prefs.cornerCloseGuideAcknowledgedV1 ??= {};
      prefs.cornerCloseGuideAcknowledgedV1[user.id] = true;
      window.dispatchEvent(new Event('shiyu-corner-guide-synced'));
    }
    if (Array.isArray(accountData)) { data = clone(accountData); prefs.accountDataUserId = user.id; accountDataRefreshPending = false; normalizeSelection(); }
    syncMembershipFromUser(user);
    return changed;
  }
  function clearAccount(preserveProfile = true) {
    if (preserveProfile) rememberProfile();
    invalidateAccount(); signed = false; verifiedUserId = '';
    prefs.accountProfile = {}; prefs.accountDataUserId = ''; prefs.membership = null; prefs.membershipDemo = null; prefs.demoMemberOrders = [];
    data = clone(seed); normalizeSelection(); view = location.hostname === 'space.shiyubox.com' ? 'space' : 'home'; pending = null;
    publishMembership(null); rawPersist();
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
    // Only a newly registered account starts with the default layout; ordinary
    // logins keep the user's saved choice, including independent space layouts.
    if (result.isNewUser === true) {
      prefs.width = defaults.width;
      prefs.spacePreferenceModes = { ...prefs.spacePreferenceModes, width: 'global' };
      prefs.registrationLayoutPendingUserId = result.user.id;
    }
    if (!Array.isArray(result.accountData) && previousOwner !== result.user.id) { data = clone(seed); prefs.accountDataUserId = result.user.id; normalizeSelection(); }
    rawPersist(); appliedLogins.add(result);
    window.dispatchEvent(new CustomEvent('shiyu-account-state', { detail: result }));
  }
  window.ShiyuAccountSession = {
    applyLogin,
    cancelled() {
      const id = accountId();
      syncEnabled = false; clearTimeout(syncTimer);
      if (id) { try { localStorage.removeItem(profileKey(id)); } catch {} }
      for (const key of ['cornerCollections', 'cornerModules', 'cornerPinnedModulesV1', 'cornerShelfOrderV1', 'cornerCloseGuideAcknowledgedV1']) {
        if (id && prefs[key]) delete prefs[key][id];
      }
      clearAccount(false);
      syncEnabled = true;
      markAccountReady();
    },
    // New private entry points must verify the server session, not cached `signed` alone.
    verify: () => refreshMembership(),
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
      expiresAt: source.expiresAt || null, planId: source.planId || 'free', planName: source.planName || '免费版', baseEntitlements: Array.isArray(source.baseEntitlements) ? source.baseEntitlements : undefined, limitedFree: source.limitedFree || [], entitlements: Array.isArray(source.entitlements) ? source.entitlements : [] };
    if (!active && source.member === true) { snapshot.planId = 'free'; snapshot.planName = free?.name || '免费版'; snapshot.entitlements = free?.entitlements || []; snapshot.baseEntitlements = snapshot.entitlements; }
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

  persist = function accountPersist() {
    if (!originalPersist()) return;
    if (!syncEnabled || !signed || !accountId() || prefs.accountDataUserId !== accountId()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { void saveAccountData(); }, 350);
  };

  function membershipFromUser(user) {
    if (!user || user.member !== true) return null;
    const label = String(user.memberExpiresAt || '').trim();
    if (user.permanent === true || user.membership?.permanent === true || /^永久$/.test(label)) return { ...user.membership, member: true, permanent: true, expiresAt: null, label: '永久' };
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
        else { verifiedUserId = ''; publishMembership({ ...result, member: false, entitlements: result.entitlements || [] }); }
        return false;
      }
      const previousMembership = JSON.stringify(prefs.membership || null), previousProfile = JSON.stringify(prefs.accountProfile || {});
      const changed = adoptUser(result.user);
      rawPersist();
      if (changed || accountDataRefreshPending || prefs.accountDataUserId !== result.user.id) {
        await loadAccountData(result.user.id);
      }
      if (verifiedUserId === result.user.id && (changed || previousMembership !== JSON.stringify(prefs.membership || null) || previousProfile !== JSON.stringify(prefs.accountProfile || {}))) render();
      return (!authBusy && requestId === membershipRequest && verifiedUserId === result.user.id && localIdentity() === result.user.id && sharedIdentity() === result.user.id) || undefined;
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
    const handoff = window.__shiyuNavigationHandoff;
    if (handoff?.spaceId && data.some(spaceItem => spaceItem.id === handoff.spaceId)) {
      spaceId = handoff.spaceId;
      const requestedSpace = data.find(spaceItem => spaceItem.id === spaceId);
      if (requestedSpace.scenes.some(sceneItem => sceneItem.id === handoff.sceneId)) sceneId = handoff.sceneId;
      handoffSelection = { spaceId, sceneId };
      delete window.__shiyuNavigationHandoff;
    }
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
    return target.closest?.('[data-action="space"],[data-v2="enter"],[data-space],[data-heading-space],.space-option,.dock-label');
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

  // Keep membership in sync when login completes through the shared account dialog.
  window.addEventListener('shiyu-account-state', event => {
    if (event.detail?.user && event.detail.user.id === accountId()) { syncMembershipFromUser(event.detail.user); originalPersist(); }
    else { if (!signed) { prefs.membership = null; publishMembership(null); } void refreshMembership(); }
  });

  const homeHost = ['shiyubox.com', 'www.shiyubox.com'].includes(location.hostname);
  const spaceHost = location.hostname === 'space.shiyubox.com';
  let domainNavigationPending = false;
  function navigateAfterCover(host) {
    const allowed = ['theme','mode','color','font','explicitFont','explicitColor','layout','width','flowStyle','homeEntryGesture','worldEntryGesture','spaceThemePolicy'];
    const appearance = Object.fromEntries(allowed.filter(name => typeof prefs[name] === 'boolean' || typeof prefs[name] === 'string' && prefs[name].length <= 120).map(name => [name, prefs[name]]));
    const handoff = { to: host, at: Date.now(), prefs: appearance, spaceId, sceneId };
    if (host === 'space.shiyubox.com' && prefs.registrationLayoutPendingUserId === accountId()) {
      handoff.widthMode = unifiedField('width') ? 'global' : 'space';
      delete prefs.registrationLayoutPendingUserId;
      rawPersist();
    }
    document.cookie = 'shiyu_nav_handoff=' + encodeURIComponent(JSON.stringify(handoff)) + '; Domain=.shiyubox.com; Path=/; Max-Age=30; SameSite=Lax; Secure';
    const target = 'https://' + host + '/';
    const animation = homeCoverTransition?.animation;
    if (animation) Promise.race([animation.finished.catch(() => {}), new Promise(resolve => setTimeout(resolve, 1800))]).then(() => location.assign(target));
    else requestAnimationFrame(() => location.assign(target));
  }
  const originalChangeView = changeView;
  changeView = function accountChangeView(next, ...args) {
    if (next === 'space' && !signed) { openLogin(); return; }
    const host = next === 'space' && homeHost ? 'space.shiyubox.com' : next === 'home' && spaceHost ? 'shiyubox.com' : '';
    if (!host) { const result = originalChangeView(next, ...args); if (view === next) rememberPreviewView(next); return result; }
    if (domainNavigationPending || view === next || Date.now() < transitionUntil) return;
    domainNavigationPending = true;
    const result = originalChangeView(next, ...args);
    if (view === next) navigateAfterCover(host); else domainNavigationPending = false;
    return result;
  };
  const originalGoSpace = goSpace;
  goSpace = function accountGoSpace(...args) {
    if (!signed) { openLogin(); return; }
    if (!homeHost) { const result = originalGoSpace(...args); if (view === 'space') rememberPreviewView('space'); return result; }
    if (domainNavigationPending) return;
    domainNavigationPending = true;
    const result = originalGoSpace(...args);
    if (view === 'space') navigateAfterCover('space.shiyubox.com'); else domainNavigationPending = false;
    return result;
  };
  const originalRender = render;
  render = function accountRender(...args) {
    const result = originalRender(...args);
    if (view === 'space' && signed && verifiedUserId === accountId() && !directSpacePending) rememberSpaceContext();
    if (homeHost && view === 'space' && signed && !domainNavigationPending) {
      domainNavigationPending = true;
      navigateAfterCover('space.shiyubox.com');
    }
    return result;
  };
  window.addEventListener('click', event => {
    if (!homeHost || !signed || !event.target.closest?.('button[data-action="space"]')) return;
    event.preventDefault(); event.stopImmediatePropagation(); changeView('space');
  }, true);
  const originalNavigationGesture = navigationGesture;
  navigationGesture = function accountNavigationGesture(delta, ...args) {
    if (view === 'home' && delta > 0 && !signed) { if (prefs.homeEntryGesture === 'click') return; const now = Date.now(); if (downArmedAt && now - downArmedAt < 2400) { downArmedAt = 0; openLogin('再向下滚动一次即可进入你的空间。登录后即可继续进入。'); return; } downArmedAt = now; toast('再向下滚动一次，进入你的空间。','bottom'); return; }
    return originalNavigationGesture(delta, ...args);
  };
  const originalWorkspace = workspace;
  workspace = function accountWorkspace(...args) {
    if (!signed || (location.hostname === 'space.shiyubox.com' && verifiedUserId !== accountId())) { view = 'home'; if (!directSpacePending) openLogin(); render(); return; }
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

  // Both the avatar menu and profile page use this one confirmation flow.
  function confirmSignout() {
    let d = document.querySelector('#account-signout-confirm');
    if (d?.open || logoutRequest) return;
    if (!d) { d = document.createElement('dialog'); d.id = 'account-signout-confirm'; document.body.append(d); }
    d.setAttribute('aria-labelledby', 'account-signout-title');
    d.innerHTML = '<div class="dialog-heading"><h2 id="account-signout-title">确认退出登录？</h2><button data-signout-cancel aria-label="关闭退出确认">×</button></div><p class="account-note">退出后，再次使用个人内容需要重新登录。</p><div class="organization-confirm"><button data-signout-cancel autofocus>取消</button><button class="primary" data-signout-confirm>确认退出</button></div>';
    const owner = localIdentity();
    d.querySelectorAll('[data-signout-cancel]').forEach(button => { button.onclick = () => d.close(); });
    d.querySelector('[data-signout-confirm]').onclick = () => {
      d.close();
      if (owner !== localIdentity() || !signed) return;
      void window.ShiyuAccountSession.logout();
    };
    d.showModal();
  }
  // Complete server sign-out before publishing the signed-out browser state.
  window.addEventListener('click', event => {
    if (event.target.closest?.('[data-account-signout]')) {
      event.preventDefault(); event.stopImmediatePropagation();
      confirmSignout();
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

  // Direct private URLs must wait for server verification and retain their destination.
  window.addEventListener('shiyu-session-ready', event => {
    if (!directSpacePending) return;
    if (!event.detail.authenticated) { rememberPreviewView('home'); directSpacePending = false; view = 'home'; render(); openLogin(); return; }
    window.ShiyuRestoreSpaceSelection?.(handoffSelection || savedSpaceContext());
    handoffSelection = null; directSpacePending = false; document.querySelector('#login[open]')?.close(); view = 'space'; render();
  });

  // Keep the account slot reserved but invisible until the first membership
  // snapshot has been checked. This prevents a stale badge from flashing on
  // refresh before the server-owned entitlement is applied.
  void hydrateAccountData(markAccountReady).finally(markAccountReady);
})();

/* Account cancellation stays separate from sign-out and never runs without server-side identity proof. */
(() => {
  const esc = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const loadAgreement = async () => {
    const response = await fetch('/api/shiyu/agreements', { credentials: 'same-origin', cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw Error(result.message || '注销协议暂时无法加载');
    const agreement = result.agreements?.find(item => item.key === 'account-cancellation');
    if (!agreement || agreement.version === 'draft') throw Error('注销协议暂时无法加载');
    return agreement;
  };
  const api = async (path, body) => {
    const response = await fetch('/api/shiyu/auth/' + path, { method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
    const value = await response.json();
    if (!response.ok) throw Error(value.message || '操作失败，请重试');
    return value;
  };
  const earlier = openAccountCenter;
  openAccountCenter = function () {
    earlier();
    const center = document.querySelector('#account-center');
    // The existing profile flow renders a separate setup dialog before the full account center.
    if (!signed || !center?.querySelector('[data-security-item="phone"]') || !center.querySelector('[data-security-item="email"]') || center.querySelector('[data-account-cancel]')) return;
    const entry = document.createElement('button');
    entry.type = 'button'; entry.className = 'account-cancel-entry'; entry.dataset.accountCancel = '';
    entry.textContent = '注销账号';
    const signout = center.querySelector('[data-account-signout]');
    if (signout) signout.after(entry); else center.append(entry);
    entry.addEventListener('click', () => { center.close(); void openCancellation(); });
  };

  async function openCancellation() {
    let session, agreement;
    try {
      [session, agreement] = await Promise.all([api('session'), loadAgreement()]);
      if (!session.authenticated || session.user?.id !== accountProfile().id) throw Error('登录状态已变化，请重新登录');
    } catch (error) { toast(error.message); return; }
    const user = session.user, hasEmail = !!user.email, hasPhone = !!user.phone;
    const channel = hasEmail ? 'email' : hasPhone ? 'phone' : user.wechatBound ? 'wechat' : '';
    const dialog = document.createElement('dialog');
    dialog.id = 'account-cancellation';
    dialog.innerHTML = `<div class="dialog-heading"><h2>注销账号</h2><button type="button" data-cancel-close aria-label="关闭">×</button></div>
      <div class="account-cancel-warning"><p>注销后需要确认的事项</p><ol><li>此账号将无法再次登录。</li><li>所有网址数据将被清空。</li><li>小计、待办、个人收藏、常用等数据将被清除。</li><li>已开通的会员权益立即终止并清除。</li></ol></div>
      <div class="account-cancel-verification"></div>
      <label class="account-cancel-agree"><input type="checkbox" data-cancel-agree><span>我已阅读并同意<button type="button" data-cancel-terms-link>《${esc(agreement.title)}》</button></span></label>
      <div class="account-cancel-actions"><button type="button" data-cancel-back>返回</button><button type="button" class="primary" data-cancel-confirm disabled>确认并注销（10）</button></div>`;
    document.body.append(dialog);
    let termsDialog = null;
    dialog.querySelector('[data-cancel-terms-link]').onclick = () => {
      if (termsDialog?.open) return;
      termsDialog = document.createElement('dialog');
      termsDialog.id = 'account-cancel-terms';
      termsDialog.innerHTML = `<div class="dialog-heading"><h2>${esc(agreement.title)}</h2><button type="button" data-terms-close aria-label="关闭协议">×</button></div><article class="account-cancel-agreement"></article>`;
      termsDialog.querySelector('article').innerHTML = agreement.body;
      const current = termsDialog;
      current.querySelector('[data-terms-close]').onclick = () => current.close();
      current.addEventListener('close', () => { current.remove(); if (termsDialog === current) termsDialog = null; }, { once: true });
      document.body.append(current);
      current.showModal();
    };
    const body = dialog.querySelector('.account-cancel-verification'), confirm = dialog.querySelector('[data-cancel-confirm]');
    let seconds = 10, ready = false, codeSent = false, busy = false, scene = '', polling = 0, timer = 0, stopped = false, finalDialog = null;
    const currentChannel = () => dialog.querySelector('[data-cancel-channel]')?.value || channel;
    const sync = () => { const agreed = dialog.querySelector('[data-cancel-agree]').checked; confirm.disabled = busy || seconds > 0 || !agreed || !ready; confirm.classList.toggle('is-ready', !confirm.disabled); confirm.textContent = seconds > 0 ? `确认并注销（${seconds}）` : '确认并注销'; const send = body.querySelector('[data-cancel-send], [data-cancel-refresh]'); if (send) send.disabled = busy || !agreed; };
    const close = () => { if (dialog.open) dialog.close(); };
    const cleanup = () => { stopped = true; clearInterval(timer); clearTimeout(polling); if (termsDialog?.open) termsDialog.close(); if (finalDialog?.open) finalDialog.close(); dialog.remove(); };
    dialog.addEventListener('close', cleanup, { once: true });
    dialog.querySelector('[data-cancel-close]').onclick = close;
    dialog.querySelector('[data-cancel-back]').onclick = close;
    dialog.querySelector('[data-cancel-agree]').onchange = sync;
    if (hasEmail || hasPhone) {
      const options = [...(hasEmail ? [['email', user.email]] : []), ...(hasPhone ? [['phone', user.phone]] : [])];
      body.innerHTML = `<label>当前账号 ${options.length > 1 ? `<select data-cancel-channel aria-label="选择验证账号">${options.map(([id, label]) => `<option value="${id}">${esc(label)}</option>`).join('')}</select>` : `<span>${esc(options[0][1])}</span>`}</label><label>验证码 <span class="account-input-row"><input data-cancel-code inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="请输入验证码"><button type="button" data-cancel-send>获取验证码</button></span></label>`;
      const code = body.querySelector('[data-cancel-code]'), send = body.querySelector('[data-cancel-send]');
      code.addEventListener('input', () => { ready = codeSent && /^\d{4,8}$/.test(code.value.trim()); sync(); });
      body.querySelector('[data-cancel-channel]')?.addEventListener('change', () => { code.value = ''; ready = false; codeSent = false; sync(); });
      send.onclick = async () => {
        if (!dialog.querySelector('[data-cancel-agree]').checked) return;
        send.disabled = true;
        const selected = currentChannel(), contact = selected === 'email' ? user.email : user.phone;
        try { await api(selected === 'email' ? 'email/send' : 'send-code', { [selected]: contact, purpose: 'account-cancel' }); codeSent = true; ready = /^\d{4,8}$/.test(code.value.trim()); toast('验证码已发送'); }
        catch (error) { toast(error.message); }
        finally { sync(); }
      };
    } else if (channel === 'wechat') {
      body.innerHTML = '<p>请用当前账号绑定的微信扫码验证。</p><div data-cancel-qr></div><button type="button" data-cancel-refresh>获取微信验证二维码</button>';
      const start = async () => {
        clearTimeout(polling); ready = false; scene = ''; sync();
        const qr = body.querySelector('[data-cancel-qr]'); qr.replaceChildren();
        try {
          const result = await api('wechat/qr?purpose=account-cancel');
          if (stopped) return;
          scene = result.scene;
          const image = document.createElement('img'); image.src = result.qrUrl; image.alt = '微信扫码验证注销'; qr.append(image);
          toast('请使用当前账号绑定的微信扫码');
          polling = setTimeout(poll, 1500);
        } catch (error) { if (!stopped) toast(error.message); }
      };
      const poll = async () => {
        if (stopped || !scene) return;
        try {
          const result = await api('wechat/status?scene=' + encodeURIComponent(scene));
          if (stopped) return;
          if (result.status === 'ready-to-cancel') { ready = true; toast('微信验证成功'); sync(); return; }
          polling = setTimeout(poll, 1500);
        } catch (error) { if (!stopped) toast(error.message); }
      };
      body.querySelector('[data-cancel-refresh]').onclick = () => { if (dialog.querySelector('[data-cancel-agree]').checked) void start(); };
    } else {
      body.textContent = '当前账号没有可用的身份验证方式，请联系管理员核验后处理。';
    }
    const submit = async () => {
      if (confirm.disabled) return;
      busy = true; sync();
      try {
        await api('cancel', { userId: user.id, agreed: true, agreementVersion: agreement.version, channel: currentChannel(), code: body.querySelector('[data-cancel-code]')?.value.trim(), scene });
        close();
        window.ShiyuAccountSession.cancelled();
        toast('账号已注销');
      } catch (error) { toast(error.message); busy = false; sync(); }
    };
    confirm.onclick = () => {
      if (confirm.disabled || finalDialog?.open) return;
      finalDialog = document.createElement('dialog');
      finalDialog.id = 'account-cancel-final';
      finalDialog.innerHTML = '<div class="dialog-heading"><h2>确定注销账号？</h2></div><p>注销后无法恢复账号与个人数据。</p><div class="account-cancel-actions"><button type="button" data-cancel-think>再想一想</button><button type="button" data-cancel-final>确定注销</button></div>';
      document.body.append(finalDialog);
      const secondary = finalDialog;
      secondary.addEventListener('close', () => { secondary.remove(); if (finalDialog === secondary) finalDialog = null; }, { once: true });
      const dismiss = () => secondary.close();
      finalDialog.querySelector('[data-cancel-think]').onclick = dismiss;
      finalDialog.querySelector('[data-cancel-final]').onclick = () => { dismiss(); void submit(); };
      finalDialog.showModal();
    };
    timer = setInterval(() => { seconds = Math.max(0, seconds - 1); sync(); if (!seconds) clearInterval(timer); }, 1000);
    dialog.showModal(); sync();
  }
})();
