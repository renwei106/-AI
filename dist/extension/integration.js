/* Narrow integration: one avatar-menu entry, local extension bridge, explicit deep links. */
(function () {
  'use strict';
  const store = window.ShiyuExtensionStore;
  const previousHeader = updateHeader;
  updateHeader = function () {
    previousHeader();
    const menu = document.querySelector('.account-menu');
    if (!menu || menu.querySelector('[data-menu-extension]')) return;
    const button = document.createElement('button');
    button.dataset.menuExtension = ''; button.setAttribute('role', 'menuitem');
    button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4H4v6a3 3 0 1 1 0 6v4h6a3 3 0 1 1 6 0h4v-6a3 3 0 1 0 0-6V4h-5a3 3 0 1 0-6 0Z"/></svg>浏览器插件';
    button.onclick = () => window.open('/extension/', '_blank', 'noopener,noreferrer');
    const exit = menu.querySelector('[data-account-signout]');
    if (exit) exit.before(button); else menu.append(button);
  };
  function decorateWorkspace() {
    if (view !== 'space') return;
    const actions = document.querySelector('.space-top-actions') || document.querySelector('.workspace-top');
    if (!actions || actions.querySelector('[data-space-inbox]')) return;
    const count = Array.isArray(prefs.extensionInbox) ? prefs.extensionInbox.length : 0;
    const button = document.createElement('button');
    button.className = 'space-inbox-entry'; button.dataset.spaceInbox = '';
    button.title = '打开稍后整理'; button.setAttribute('aria-label', `稍后整理，${count ? count + ' 条待整理' : '当前为空'}`);
    button.innerHTML = `<span class="space-inbox-drawer" aria-hidden="true"><i></i><i></i><b></b></span><span><strong>稍后整理</strong><small>${count ? count + ' 条待整理' : '回头再归类'}</small></span>`;
    button.onclick = () => signed ? window.open('/extension/inbox.html', '_blank', 'noopener,noreferrer') : show('#login');
    const add = actions.querySelector('[data-action="add"]');
    if (add) actions.insertBefore(button, add); else actions.append(button);
  }
  const renderBeforeExtension = render;
  render = function () { renderBeforeExtension(); decorateWorkspace(); };
  function refresh() {
    const value = JSON.parse(localStorage.getItem(store.KEY) || '{}');
    if (!Array.isArray(value.data)) return;
    data = value.data; prefs = { ...defaults, ...value.prefs }; signed = !!value.signed;
    overrides = value.overrides || {}; styles = value.styles || {};
    if (value.themeMemory) themeMemory = value.themeMemory;
    render();
  }
  window.addEventListener('shiyu-extension-change', refresh);
  window.addEventListener('storage', event => { if (event.key === store.EVENT_KEY) refresh(); });
  window.shiyuExtensionBridge = Object.freeze({ dispatch(request) {
    try {
      if (request?.type === 'state') {
        const value = store.snapshot();
        if (value.signed) { const theme = effective(); value.theme = { color: theme.color || '#48614c', mode: theme.mode || 'system' }; }
        return { ok: true, value };
      }
      if (request?.type === 'save') return { ok: true, value: store.save(request.payload) };
      return { ok: false, error: '不支持的插件操作。' };
    } catch (error) { return { ok: false, error: error.message }; }
  } });
  updateHeader(); decorateWorkspace();
  const query = new URLSearchParams(location.search);
  if (query.get('extension') === 'login' && !signed) show('#login');
  if (query.get('extension') === 'collection' && signed) {
    const s = data.find(x => x.id === query.get('space')) || data[0];
    if (s) { goSpace(s.id); const c = s.scenes.find(x => x.id === query.get('scene'));
      if (c) { sceneId = c.id; const g = c.groups.find(x => x.id === query.get('group')); if (g) activeGroups[c.id] = g.id; render(); }
    }
  }
})();
