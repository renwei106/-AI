/* 森间绒伴: a paused video controlled by pointer position. Availability is owned
 * by the existing backend theme catalog and theme-access policy. */
(() => {
  'use strict';
  const ID = 'forestCompanion';
  const POSTER = 'assets/forest-companion/poster.webp';
  const VIDEO = 'assets/forest-companion/look.mp4';
  // Source inspection: the supplied clip looks RIGHT first, then LEFT. Trim
  // the static holds and map either side through the actual front-facing frame.
  const LOOK = { left: 3.8, center: 1.65, right: 0.35 };
  const EPSILON = 1 / 60;
  let dispose = null, pointerX = null;
  THEMES[ID] = { ...THEMES.base, name: '森间绒伴', en: 'FOREST COMPANION',
    desc: '轻移鼠标，和林间的小伙伴对上目光。', mini: '森' };
  THEME_IDENTITIES[ID] = ['森间绒伴', 'lib-Sparkles'];
  COPY_DEFAULTS[ID] = { ...COPY_DEFAULTS.base };
  const previousArtwork = themeArtwork;
  themeArtwork = function(id) {
    return id === ID ? `<img class="forest-theme-thumbnail" src="${POSTER}" alt="林间毛绒小伙伴" loading="lazy">` : previousArtwork(id);
  };

  function mount(root) {
    dispose?.();
    const copy = currentCopy(ID);
    root.insertAdjacentHTML('afterbegin', `<div class="forest-backdrop" aria-hidden="true"><img class="forest-poster" src="${POSTER}" alt="" fetchpriority="high"><video class="forest-video" muted playsinline preload="auto" poster="${POSTER}" tabindex="-1" disablepictureinpicture></video><div class="forest-shade"></div></div><div class="base-composition forest-copy"><div class="eyebrow" data-live-date>${dateText()}</div><h1>${esc(copy.title)}</h1><p class="intro">${esc(copy.intro)}</p></div>`);
    const video = root.querySelector('video');
    video.muted = true;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
    let dead = false, failed = false, visible = false, initialized = false;
    let pending = false, raf = 0, watchdog = 0, target = LOOK.center;
    const listeners = [];
    const on = (node, event, fn) => { node.addEventListener(event, fn, { passive: true }); listeners.push(() => node.removeEventListener(event, fn)); };
    const eligible = () => !dead && !failed && !motion.matches && desktop.matches;
    const available = () => eligible() && visible && !document.hidden && root.isConnected;
    const bounded = time => Math.max(0, Math.min(time, video.duration - 1 / 30));
    const updateTarget = () => {
      const ratio = pointerX === null ? .5 : Math.max(0, Math.min(1, pointerX / Math.max(1, innerWidth)));
      target = ratio <= .5 ? LOOK.left + (LOOK.center - LOOK.left) * ratio * 2
        : LOOK.center + (LOOK.right - LOOK.center) * (ratio - .5) * 2;
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
      const next = bounded(initialized ? target : LOOK.center);
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
        video.src = VIDEO;
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
    on(video, 'loadeddata', schedule); on(video, 'canplay', schedule);
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
      dead = true; cancelAnimationFrame(raf); clearTimeout(watchdog);
      observer.disconnect(); removal.disconnect(); listeners.forEach(remove => remove());
      video.pause(); video.removeAttribute('src'); video.load();
      if (dispose === cleanup) dispose = null;
    }
    dispose = cleanup;
    root.dataset.forestState = 'static';
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
})();
