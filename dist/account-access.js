// Account access and per-user workspace data.
// The public home page stays browseable; private workspace entry points require login.
(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const accountId = () => prefs.accountProfile?.id || '';
  let syncTimer = 0;
  let syncEnabled = true;

  // The bottom "我的一隅" preview is only discoverable after login. Keep the
  // entry itself visible so an unsigned visitor can click it and open login.
  const syncCornerLoginState = () => {
    document.body.classList.toggle('account-unsigned', !signed);
  };
  syncCornerLoginState();

  const originalPersist = persist;
  persist = function accountPersist() {
    originalPersist();
    if (!syncEnabled || !signed || !accountId() || prefs.accountDataUserId !== accountId()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { void saveAccountData(); }, 350);
  };

  function membershipFromUser(user) {
    if (!user || user.member !== true) return null;
    const label = String(user.memberExpiresAt || '').trim();
    if (!label || label === '永久') return { expiresAt: Number.MAX_SAFE_INTEGER, label: '永久' };
    const parsed = Date.parse(`${label}T23:59:59+08:00`);
    return { expiresAt: Number.isFinite(parsed) && parsed > 0 ? parsed : Number.MAX_SAFE_INTEGER, label };
  }

  function syncMembershipFromUser(user) {
    if (!user) return false;
    const next = membershipFromUser(user);
    if (JSON.stringify(prefs.membership || null) === JSON.stringify(next)) return false;
    prefs.membership = next;
    return true;
  }

  async function refreshMembership() {
    if (!signed || !accountId()) return;
    try {
      const response = await fetch('/api/shiyu/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const result = await response.json();
      if (result.authenticated !== true || result.user?.id !== accountId()) return;
      if (syncMembershipFromUser(result.user)) {
        originalPersist();
        syncCornerLoginState();
        render();
      }
    } catch { /* the local membership snapshot remains the fallback */ }
  }

  async function saveAccountData() {
    if (!signed || !accountId() || prefs.accountDataUserId !== accountId()) return;
    try {
      await fetch('/api/shiyu/auth/account', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
    } catch { /* local storage remains the fallback for offline preview */ }
  }

  function normalizeSelection() {
    if (!data.length) return;
    if (!data.some(spaceItem => spaceItem.id === spaceId)) spaceId = data[0].id;
    const selectedSpace = data.find(spaceItem => spaceItem.id === spaceId);
    if (!selectedSpace.scenes.some(sceneItem => sceneItem.id === sceneId)) sceneId = selectedSpace.scenes[0]?.id || null;
  }

  function openLogin(message = '登录后即可进入你的空间。') {
    if (signed) return false;
    show('#login');
    const status = $('#login .account-status');
    if (status && message) status.textContent = message;
    return true;
  }

  function isSpaceEntry(target) {
    return target.closest?.('[data-action="space"],[data-v2="enter"],[data-space],[data-heading-space],.space-option,.dock-label')
      || target.closest?.('.corner-entry,.corner-dock-preview');
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
  window.addEventListener('shiyu-account-state', syncCornerLoginState);

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
    if (view === 'home' && delta > 0 && !signed) { openLogin(); return; }
    return originalNavigationGesture(delta, ...args);
  };
  const originalWorkspace = workspace;
  workspace = function accountWorkspace(...args) {
    if (!signed) { view = 'home'; openLogin(); render(); return; }
    return originalWorkspace(...args);
  };

  async function hydrateAccountData(onMembershipReady) {
    if (!signed || !accountId()) { onMembershipReady?.(); return; }
    await refreshMembership();
    onMembershipReady?.();
    try {
      const response = await fetch('/api/shiyu/auth/account', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return;
      const result = await response.json();
      if (Array.isArray(result.data)) {
        syncEnabled = false;
        data = clone(result.data);
        prefs.accountDataUserId = accountId();
        normalizeSelection();
        originalPersist();
        syncEnabled = true;
        render();
      }
    } catch { /* unauthenticated/static hosting keeps the local prototype available */ }
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
      const response = await fetch('/api/shiyu/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account, credential, mode: accountLoginTab === 'password' ? 'password' : 'code', name: prefs.accountProfile?.name || '任伟' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '登录失败');
      signed = true;
      syncCornerLoginState();
      prefs.accountProfile = { ...(prefs.accountProfile || {}), id: result.user.id, name: result.user.name, phone: result.user.phone, email: result.user.email, avatar: prefs.accountProfile?.avatar || ACCOUNT_AVATARS[0] };
      syncMembershipFromUser(result.user);
      prefs.accountDataUserId = result.user.id;
      if (Array.isArray(result.accountData)) {
        syncEnabled = false;
        data = clone(result.accountData);
        normalizeSelection();
        originalPersist();
        syncEnabled = true;
      } else if (previousId === result.user.id && Array.isArray(data)) {
        // A legacy account has no server copy yet; migrate the same browser's existing data once.
        await saveAccountData();
      } else {
        syncEnabled = false;
        data = clone(seed);
        normalizeSelection();
        originalPersist();
        syncEnabled = true;
      }
      dialog.close();
      render();
      toast('登录成功');
    } catch (error) {
      if (status) status.textContent = error.message || '登录失败';
    } finally {
      button.disabled = false;
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

  // The account menu handles sign-out in the existing account UI. Refresh the
  // preview visibility after that handler changes the shared `signed` flag.
  window.addEventListener('click', event => {
    if (event.target.closest?.('[data-account-signout],[data-action="demo-login"]')) {
      setTimeout(syncCornerLoginState, 0);
    }
  }, true);

  // Membership can be granted or revoked from the admin while the public page
  // is still open. Re-read the server-owned entitlement when the user returns
  // to the page so the header and membership surfaces do not stay stale.
  window.addEventListener('focus', () => { void refreshMembership(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void refreshMembership(); });

  // Keep the account slot reserved but invisible until the first membership
  // snapshot has been checked. This prevents a stale badge from flashing on
  // refresh before the server-owned entitlement is applied.
  const markAccountReady = () => document.documentElement.classList.add('shiyu-account-ready');
  void hydrateAccountData(markAccountReady).finally(markAccountReady);
})();
