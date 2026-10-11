(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const clamp = x => Math.min(1, Math.max(0, x));
  const smooth = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
  const ramp = (a, b, x) => smooth((x - a) / (b - a));
  const scenes = [...document.querySelectorAll('.scene')];
  const copies = scenes.map(scene => scene.querySelector('.scene-copy'));
  const last = scenes.length - 1;
  const loopLength = last + 1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const light = $('.light-source'), cue = $('.scroll-cue'), fill = $('#progress-fill');
  const experience = $('.experience'), wash = $('.ambient-wash'), count = $('#scene-number');
  const progressTrack = $('#progress-track');
  const chapterButtons = [...document.querySelectorAll('[data-chapter-jump]')];
  const world = window.createShiyuWorld($('#atmosphere'));
  const audio = window.createShiyuAudio?.($('.sound-toggle'));
  const sceneNames = ['point', 'melody', 'birds', 'earth', 'solar-system', 'galaxy', 'atom'];
  let maxScroll = 1, progress = 0, target = 0, active = -1, raf = 0, previous = 0;
  let ambientTime = 0;

  function setActive(index) {
    if (index === active) return;
    active = index;
    scenes.forEach((scene, i) => {
      scene.inert = i !== index;
      scene.setAttribute('aria-hidden', String(i !== index));
    });
    count.textContent = String(index).padStart(2, '0');
    chapterButtons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    experience.dataset.chapter = String(index);
    experience.dataset.form = sceneNames[index];
  }
  function render(now) {
    const returning = progress > last;
    const base = returning ? last : Math.min(last, Math.floor(progress));
    const next = returning ? 0 : Math.min(last, base + 1), fraction = progress - base;
    // Long holds frame each transformation. The first scroll immediately opens the point.
    const morph = base === last ? 0 : ramp(base === 0 ? .02 : .27, .85, fraction);
    const textBlend = base === last ? 0 : ramp(.40, .83, fraction);
    setActive(textBlend > .5 ? next : base);
    scenes.forEach((scene, index) => {
      const weight = index === base ? 1 - textBlend : index === next ? textBlend : 0;
      scene.style.visibility = weight > .001 ? 'visible' : 'hidden';
      scene.style.opacity = String(weight);
      if (weight <= .001) return;
      const clarity = ramp(.50, .90, weight);
      copies[index].style.opacity = String(clarity);
      copies[index].style.filter = reduced.matches ? 'none' : 'blur(' + ((1 - clarity) * 6).toFixed(2) + 'px)';
      copies[index].style.transform = 'translate(-50%, -50%) scale(' + (reduced.matches ? 1 : .975 + clarity * .025).toFixed(4) + ')';
    });
    const opening = 1 - ramp(.025, .65, progress);
    const closing = ramp(5.65, 6, Math.min(last, progress));
    const returnBlend = ramp(6.25, 6.92, progress);
    light.style.opacity = String(Math.max(opening, closing));
    light.style.transform = 'translate(-50%, -50%) scale(' + (1 + Math.sin(ambientTime * .8) * .06).toFixed(3) + ')';
    wash.style.setProperty('--warmth', String(ramp(3.2, 5.7, Math.min(last, progress)) * .85 * (1 - returnBlend)));
    cue.style.opacity = String(Math.max((.55 + opening * .45) * (1 - closing), returnBlend * .75));
    const fillProgress = progress <= last ? progress / last : 1 - (progress - last);
    fill.style.transform = 'scaleX(' + clamp(fillProgress) + ')';
    audio?.setProgress(clamp(fillProgress));
    world.paint(base, next, morph, reduced.matches ? 0 : ambientTime);
  }
  function tick(now) {
    raf = 0;
    const dt = previous ? Math.min(64, now - previous) : 16;
    previous = now;
    if (!reduced.matches) ambientTime += dt / 1000;
    progress += (target - progress) * (reduced.matches ? 1 : 1 - Math.exp(-dt / 155));
    if (Math.abs(target - progress) < .0001) progress = target;
    render(now);
    if (target >= loopLength - .001 && progress >= loopLength - .002) {
      scrollTo({ top: 0, behavior: 'instant' });
      progress = target = 0;
      previous = now;
      render(now);
    }
    if (!document.hidden && (!reduced.matches || target !== progress)) requestFrame();
  }
  function requestFrame() { if (!raf && !document.hidden) raf = requestAnimationFrame(tick); }
  function readScroll() { target = clamp(scrollY / maxScroll) * loopLength; requestFrame(); }
  function measure() {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    world.resize(innerWidth, innerHeight); readScroll();
  }
  function jumpTo(index) {
    const chapter = Math.max(0, Math.min(last, index));
    scrollTo({ top: maxScroll * chapter / loopLength, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  history.scrollRestoration = 'manual';
  scrollTo({ top: 0, behavior: 'instant' });
  addEventListener('scroll', readScroll, { passive: true });
  let resizeFrame;
  addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(measure); }, { passive: true });
  addEventListener('pageshow', event => { if (event.persisted) { measure(); progress = target; requestFrame(); } });
  progressTrack.addEventListener('click', event => {
    const button = event.target.closest('[data-chapter-jump]');
    if (button) {
      jumpTo(Number(button.dataset.chapterJump));
      return;
    }
    const bounds = progressTrack.getBoundingClientRect();
    const position = clamp((event.clientX - bounds.left) / bounds.width);
    jumpTo(Math.round(position * last));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else { previous = 0; requestFrame(); }
  });
  reduced.addEventListener('change', () => { previous = 0; requestFrame(); });
  measure();
})();
