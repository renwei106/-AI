/* One public registration configuration for home and space, independent of theme/locale. */
(() => {
  let config = null;
  let queued = false;
  let idleTimer = 0;
  const endpoint = '/api/shiyu/filing';
  function reveal() {
    if (!matchMedia('(pointer: fine)').matches) return;
    document.documentElement.classList.remove('site-filing-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.documentElement.classList.add('site-filing-idle'), 3000);
  }
  function footer() {
    const node = document.createElement('footer');
    node.className = 'site-filing';
    node.setAttribute('aria-label', config.label || '备案号');
    const label = document.createElement('span');
    label.textContent = config.label || '备案号';
    node.append(label);
    for (const item of [config.icp, config.police]) {
      if (!item?.number) continue;
      const link = document.createElement(item.url ? 'a' : 'span');
      link.textContent = item.number;
      if (item.url && /^https?:\/\//i.test(item.url)) {
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      node.append(link);
    }
    return node;
  }
  function mount() {
    queued = false;
    if (!config || !(config.icp?.number || config.police?.number)) return;
    const main = document.querySelector('#main');
    const targets = [];
    if (document.body.dataset.view === 'home' && main) targets.push(main);
    if (document.body.dataset.view === 'space') {
      targets.push(...document.querySelectorAll('#groups > .group'));
      const atlas = document.querySelector('#space-atlas');
      if (atlas) targets.push(atlas);
    }
    document.querySelectorAll('.site-filing').forEach(node => {
      if (!targets.includes(node.parentElement)) node.remove();
    });
    for (const target of targets) {
      if (target.matches('.group') && !target.hidden) {
        target.style.setProperty('--filing-group-start', `${Math.max(0, target.getBoundingClientRect().top + window.scrollY)}px`);
      }
      const current = target.querySelector(':scope > .site-filing');
      if (!current) target.append(footer());
      else if (target.lastElementChild !== current) target.append(current);
    }
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(mount); }
  }
  let loading = false;
  async function load() {
    if (loading) return;
    loading = true;
    try {
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (!response.ok) return;
      const next = (await response.json()).filing;
      if (next && JSON.stringify(next) !== JSON.stringify(config)) {
        config = next;
        document.querySelectorAll('.site-filing').forEach(node => node.remove());
        schedule();
      }
    } catch { /* Retain the last successful configuration during a connection failure. */ }
    finally { loading = false; }
  }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-view'] });
  window.addEventListener('focus', load);
  window.addEventListener('resize', schedule);
  if (document.querySelector('#main')) new ResizeObserver(schedule).observe(document.querySelector('#main'));
  document.fonts?.ready.then(schedule);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void load(); });
  document.addEventListener('pointermove', reveal, { passive: true });
  reveal();
  void load();
})();
