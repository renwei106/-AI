/* 幻境奇遇: a paused video controlled by pointer position. Availability is owned
 * by the existing backend theme catalog and theme-access policy. */
(() => {
  'use strict';
  const ID = 'forestCompanion';
  const POSTER = 'assets/forest-companion/poster.webp';
  const owner = () => signed ? String(accountProfile().id || '') : '';
  const selectionKey = id => 'shiyu-forest-selection:' + (id || 'guest');
  const readSelection = id => { try { return localStorage.getItem(selectionKey(id)); } catch { return null; } };
  const writeSelection = (id, value) => { try { localStorage.setItem(selectionKey(id), value); } catch {} };
  const db = new Promise(resolve => {
    try { const r = indexedDB.open('shiyu-forest-local', 1); r.onupgradeneeded = () => r.result.createObjectStore('accounts'); r.onsuccess = () => resolve(r.result); r.onerror = r.onblocked = () => resolve(null); } catch { resolve(null); }
  });
  async function localClips(id, value) {
    if (!id) return [];
    const store = await db; if (!store) throw Error('本机存储不可用，请允许浏览器保存网站数据');
    return new Promise((resolve, reject) => {
      const tx = store.transaction('accounts', value ? 'readwrite' : 'readonly'), objects = tx.objectStore('accounts');
      let result;
      if (value) objects.put(value, id); else { const r = objects.get(id); r.onsuccess = () => { result = r.result; }; }
      tx.oncomplete = () => resolve(result || []); tx.onerror = tx.onabort = () => reject(Error('本机存储失败，可能空间不足；原视频已保留'));
    });
  }
  function inspectUpload(file, signal) {
    if (!/\.mp4$/i.test(file.name) || file.size > 20 * 1024 * 1024 || !file.size) return Promise.reject(Error('请选择不超过 20 MB 的 MP4 视频'));
    return new Promise((resolve, reject) => {
      const source = URL.createObjectURL(file), probe = document.createElement('video');
      let finished = false;
      const end = (error, result) => { if (finished) return; finished = true; clearTimeout(timer); signal.removeEventListener('abort', abort); probe.removeAttribute('src'); probe.load(); URL.revokeObjectURL(source); error ? reject(error) : resolve(result); };
      const abort = () => end(Error('已取消读取'));
      const timer = setTimeout(() => end(Error('视频读取超时，请换用 H.264 编码的 MP4')), 20000);
      signal.addEventListener('abort', abort, { once:true });
      probe.muted = true; probe.playsInline = true; probe.preload = 'auto';
      probe.onerror = () => end(Error('视频无法解码，请换用 H.264 编码的 MP4'));
      probe.onloadedmetadata = () => {
        if (!Number.isFinite(probe.duration) || probe.duration < 2 || probe.duration > 10) return end(Error('个人视频时长须为 2～10 秒'));
        if (!probe.videoWidth || !probe.videoHeight || Math.max(probe.videoWidth, probe.videoHeight) > 3840) return end(Error('视频最长边不能超过 3840 像素'));
        probe.currentTime = probe.duration / 2;
      };
      probe.onseeked = () => {
        const c = document.createElement('canvas'), scale = Math.min(1, 1280 / probe.videoWidth);
        c.width = Math.round(probe.videoWidth * scale); c.height = Math.round(probe.videoHeight * scale);
        c.getContext('2d').drawImage(probe, 0, 0, c.width, c.height);
        c.toBlob(poster => poster ? end(null, { poster, duration:probe.duration }) : end(Error('无法提取视频封面')), 'image/webp', .88);
      };
      probe.src = source;
    });
  }
  const EPSILON = 1 / 60;
  let dispose = null, pointerX = null;
  THEMES[ID] = { ...THEMES.base, name: '幻境奇遇', en: 'FOREST COMPANION',
    desc: '轻移鼠标，和林间的小伙伴对上目光。', mini: '森' };
  THEME_IDENTITIES[ID] = ['幻境奇遇', 'lib-Sparkles'];
  COPY_DEFAULTS[ID] = { ...COPY_DEFAULTS.base };
  const previousArtwork = themeArtwork;
  themeArtwork = function(id) {
    return id === ID ? `<img class="forest-theme-thumbnail" src="${POSTER}" alt="林间毛绒小伙伴" loading="lazy">` : previousArtwork(id);
  };

  function mount(root) {
    dispose?.();
    const copy = currentCopy(ID), account = owner(), aborter = new AbortController();
    root.insertAdjacentHTML('afterbegin', `<div class="forest-backdrop" aria-hidden="true"><img class="forest-poster" src="${POSTER}" alt="" fetchpriority="high"><video class="forest-video" muted playsinline preload="auto" poster="${POSTER}" tabindex="-1" disablepictureinpicture></video><div class="forest-shade"></div></div><div class="base-composition forest-copy"><div class="eyebrow" data-live-date>${dateText()}</div><h1>${esc(copy.title)}</h1><p class="intro">${esc(copy.intro)}</p></div>`);
    root.insertAdjacentHTML('beforeend', '<div class="forest-picker" role="group" aria-label="切换互动视频"><div class="forest-dots"></div><button type="button" class="forest-upload" title="添加本地视频 · MP4，2～10 秒，最大 20 MB" aria-label="添加本地视频" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 16V4m-4 4 4-4 4 4M5 15v5h14v-5"/></svg></button><button type="button" class="forest-remove" title="移除此账号的当前本地视频" aria-label="移除当前本地视频" hidden>×</button><input type="file" accept="video/mp4,.mp4" hidden><span class="forest-status" role="status" aria-live="polite"></span></div>');
    const video = root.querySelector('video'), poster = root.querySelector('.forest-poster'), picker = root.querySelector('.forest-picker'), dots = root.querySelector('.forest-dots'), upload = root.querySelector('.forest-upload'), remove = root.querySelector('.forest-remove'), input = picker.querySelector('input'), status = root.querySelector('.forest-status');
    let config = null, personal = [], clips = [], active = null, busy = false, refreshId = 0, personalLoaded = false, personalLoading = false;
    const urls = new Map();
    const mine = () => !dead && account === owner();
    const objectUrl = blob => { if (!urls.has(blob)) urls.set(blob, URL.createObjectURL(blob)); return urls.get(blob); };
    const materialize = item => item.local ? { ...item, video:objectUrl(item.blob), poster:objectUrl(item.posterBlob) } : item;
    function controls() {
      dots.innerHTML = clips.map((item, index) => `<button type="button" class="forest-dot" data-clip="${esc(item.id)}" aria-label="${index + 1} · ${esc(item.name)}${item.local ? '（本机）' : ''}" title="${esc(item.name)}${item.local ? ' · 仅此账号本机可见' : ''}" aria-pressed="${item.id === active?.id}"><span></span></button>`).join('');
      upload.hidden = !config?.allowUpload; upload.disabled = busy; remove.hidden = !active?.local; remove.disabled = busy;
    }
    function selectClip(id, remember = true) {
      const item = clips.find(item => item.id === id) || clips[0];
      cancelAnimationFrame(raf); raf = 0; clearTimeout(watchdog);
      video.classList.remove('is-ready'); video.pause(); video.removeAttribute('src'); video.load();
      active = item ? materialize(item) : null; pending = false; initialized = false; failed = false;
      root.dataset.forestFraming = active?.id === 'forest' ? 'landscape' : 'portrait';
      if (active) { poster.src = active.poster; video.poster = active.poster; if (remember) writeSelection(account, active.id); }
      controls(); sync();
    }
    function reconcile() {
      clips = [...(config?.items || []), ...(config?.allowUpload && account ? personal : [])];
      const id = active?.id || readSelection(account);
      const replacement = clips.find(item => item.id === id);
      if (!active || !replacement || (!replacement.local && JSON.stringify(replacement) !== JSON.stringify(active))) selectClip(id, false);
      else controls();
    }
    async function refresh() {
      const ticket = ++refreshId;
      try {
        const response = await fetch('/api/shiyu/operations', { cache:'no-store', signal:aborter.signal });
        if (!response.ok) throw Error();
        const data = await response.json(), value = data.forestContent;
        if (!value || !Array.isArray(value.items)) throw Error();
        if (!mine() || ticket !== refreshId) return;
        config = { allowUpload:value.allowUpload === true, items:value.items.filter(item => /^[a-z0-9-]+$/.test(item.id) && item.video === `/api/shiyu/forest-assets/${item.id}.mp4` && item.poster === `/api/shiyu/forest-assets/${item.id}.webp`) };
        reconcile();
      } catch { if (mine() && !config) status.textContent = '视频配置暂不可用'; }
    }
    video.muted = true;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
    let dead = false, failed = false, visible = false, initialized = false;
    let pending = false, raf = 0, watchdog = 0, target = 0, pickerIdleTimer = 0;
    const listeners = [];
    const on = (node, event, fn) => { node.addEventListener(event, fn, { passive: true }); listeners.push(() => node.removeEventListener(event, fn)); };
    const revealPicker = () => { picker.classList.remove('is-idle'); clearTimeout(pickerIdleTimer); pickerIdleTimer = setTimeout(() => picker.classList.add('is-idle'), 10000); };
    on(window, 'pointermove', revealPicker);
    on(window, 'keydown', revealPicker);
    revealPicker();
    const eligible = () => mine() && !!active && !failed && !motion.matches && desktop.matches;
    const available = () => eligible() && visible && !document.hidden && root.isConnected;
    const bounded = time => Math.max(0, Math.min(time, video.duration - 1 / 30));
    const updateTarget = () => {
      const ratio = pointerX === null ? .5 : Math.max(0, Math.min(1, pointerX / Math.max(1, innerWidth)));
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      target = Math.max(0, video.duration - 1 / 30) * (active?.reverse ? 1 - ratio : ratio);
    };
    function fail() {
      failed = true;
      root.dataset.forestState = 'fallback';
      video.classList.remove('is-ready');
      cancelAnimationFrame(raf); raf = 0;
      clearTimeout(watchdog); pending = false;
      video.pause();
      video.removeAttribute('src'); video.load();
    }
    function reveal() {
      if (!available() || video.readyState < 2) return;
      video.classList.add('is-ready');
      root.dataset.forestState = 'ready';
    }
    function pump() {
      raf = 0;
      if (!available() || pending || video.seeking || video.readyState < 2 || !Number.isFinite(video.duration) || video.duration <= 0) return;
      const next = bounded(initialized ? target : (video.duration - 1 / 30) / 2);
      if (Math.abs(video.currentTime - next) < EPSILON) {
        initialized = true; reveal();
        if (Math.abs(video.currentTime - bounded(target)) >= EPSILON) schedule();
        return;
      }
      pending = true;
      clearTimeout(watchdog);
      watchdog = setTimeout(fail, 8000);
      try { video.currentTime = next; } catch { fail(); }
    }
    function schedule() { if (available() && !raf) raf = requestAnimationFrame(pump); }
    function seeked() {
      pending = false; clearTimeout(watchdog);
      initialized = true;
      reveal(); schedule();
    }
    function sync() {
      updateTarget();
      if (!available()) {
        cancelAnimationFrame(raf); raf = 0;
        clearTimeout(watchdog);
        if (!eligible()) {
          video.classList.remove('is-ready');
          root.dataset.forestState = failed ? 'fallback' : 'static';
          initialized = false; pending = false;
          if (video.hasAttribute('src')) { video.removeAttribute('src'); video.load(); }
        }
        return;
      }
      if (!video.hasAttribute('src')) {
        root.dataset.forestState = 'loading';
        video.src = active.video;
        // preload is a hint; a timeout leaves a usable still if data never arrives.
        clearTimeout(watchdog); watchdog = setTimeout(fail, 15000);
      } else if (pending && !video.seeking) pending = false;
      else if (pending) { clearTimeout(watchdog); watchdog = setTimeout(fail, 8000); }
      if (video.readyState < 2 && !pending) { clearTimeout(watchdog); watchdog = setTimeout(fail, 15000); }
      schedule();
    }
    on(window, 'mousemove', event => {
      // Preserve the latest pointer through asynchronous configuration rerenders.
      pointerX = event.clientX; updateTarget(); schedule();
    });
    on(window, 'resize', sync);
    on(document, 'visibilitychange', sync);
    on(motion, 'change', sync); on(desktop, 'change', sync);
    on(video, 'loadedmetadata', () => { updateTarget(); schedule(); });
    on(video, 'loadeddata', () => { updateTarget(); schedule(); }); on(video, 'canplay', schedule);
    on(video, 'seeked', seeked);
    on(video, 'error', () => { if (video.hasAttribute('src')) fail(); });
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; sync();
    });
    observer.observe(root);
    // The application sometimes replaces home() directly (e.g. search mode).
    // Disconnect promptly even when render() was not the caller.
    const removal = new MutationObserver(() => { if (!root.isConnected) cleanup(); });
    removal.observe(document.querySelector('#main'), { childList: true });
    function cleanup() {
      if (dead) return;
      dead = true; aborter.abort(); cancelAnimationFrame(raf); clearTimeout(watchdog); clearTimeout(pickerIdleTimer);
      observer.disconnect(); removal.disconnect(); listeners.forEach(remove => remove());
      video.pause(); video.removeAttribute('src'); video.load();
      urls.forEach(url => URL.revokeObjectURL(url)); urls.clear();
      if (dispose === cleanup) dispose = null;
    }
    dispose = cleanup;
    root.dataset.forestState = 'static';
    on(dots, 'click', event => { const button = event.target.closest('[data-clip]'); if (button && mine() && !busy) selectClip(button.dataset.clip); });
    on(upload, 'click', () => {
      if (!owner()) { if (typeof openLogin === 'function') openLogin('登录后可添加仅此账号可见的本地视频'); else show('#login'); return; }
      if (!mine() || !config?.allowUpload) return;
      if (personal.length >= 3) { toast('最多保存 3 个本地视频，请先移除一个'); return; }
      input.click();
    });
    on(input, 'change', async () => {
      const file = input.files?.[0]; input.value = ''; if (!file || !mine() || !account || busy || !config?.allowUpload) return;
      busy = true; controls(); status.textContent = '正在读取视频…';
      try {
        if (await window.ShiyuAccountSession?.verify() !== true || !mine()) return;
        const result = await inspectUpload(file, aborter.signal);
        if (!mine() || !config?.allowUpload) return;
        const item = { id:'local-' + crypto.randomUUID(), name:file.name.replace(/\.mp4$/i, '').slice(0,24), blob:file, posterBlob:result.poster, duration:result.duration, local:true, reverse:false };
        const next = [...personal, item]; await localClips(account, next);
        if (!mine()) return;
        personal = next; clips = [...config.items, ...personal]; selectClip(item.id); status.textContent = '已保存在此账号的本机浏览器';
      } catch (error) { if (mine()) { status.textContent = error.message; toast(error.message); } }
      finally { if (mine()) { busy = false; controls(); } }
    });
    on(remove, 'click', async () => {
      if (!mine() || !account || !active?.local || busy) return;
      busy = true; controls();
      try { const next = personal.filter(item => item.id !== active.id); await localClips(account, next); if (!mine()) return; personal = next; clips = [...config.items, ...personal]; selectClip(clips[0]?.id); const live = new Set(personal.flatMap(item => [item.blob, item.posterBlob])); for (const [blob, url] of urls) if (!live.has(blob)) { URL.revokeObjectURL(url); urls.delete(blob); } status.textContent = '已移除本地视频'; }
      catch (error) { if (mine()) toast(error.message); }
      finally { if (mine()) { busy = false; controls(); } }
    });
    on(window, 'focus', () => void refresh());
    async function loadPersonal() {
      if (!account || !mine() || personalLoaded || personalLoading || !document.documentElement.classList.contains('shiyu-account-ready')) return;
      personalLoading = true;
      try {
        const stored = await localClips(account); if (!mine()) return;
        personal = stored; personalLoaded = true; reconcile();
        const selected = readSelection(account);
        if (config?.allowUpload && personal.some(item => item.id === selected)) selectClip(selected, false);
      } catch (error) { if (mine()) status.textContent = error.message; }
      finally { personalLoading = false; }
    }
    on(window, 'shiyu-session-ready', () => void loadPersonal());
    void (async () => { if (account) { await window.ShiyuAccountSession?.verify(); if (mine()) await loadPersonal(); } if (mine()) await refresh(); })();
  }
  const previousHome = home;
  home = function() {
    dispose?.(); previousHome();
    if (view === 'home' && effective().theme === ID) {
      const root = document.querySelector('.home-forestCompanion');
      if (root) mount(root);
    }
  };
  const previousRender = render;
  render = function(...args) { dispose?.(); return previousRender(...args); };
  const previousCopy = applyHomeCopy;
  applyHomeCopy = function() {
    previousCopy();
    if (view !== 'home' || effective().theme !== ID) return;
    const copy = currentCopy(ID);
    const title = document.querySelector('.forest-copy h1'), intro = document.querySelector('.forest-copy .intro');
    if (title) title.textContent = copy.title;
    if (intro) intro.textContent = copy.intro;
  };
  window.addEventListener('shiyu-account-state', () => { if (view === 'home' && effective().theme === ID) home(); else dispose?.(); });
})();
