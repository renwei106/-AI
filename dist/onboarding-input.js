// Registered before existing page gestures; inert backgrounds must not navigate during a tour.
(() => {
  const active = () => document.body?.classList.contains('sy-tour-active');
  window.addEventListener('wheel', event => {
    if (!active()) return;
    event.stopImmediatePropagation();
    if (!event.target.closest?.('.sy-tour-panel')) event.preventDefault();
  }, { capture: true, passive: false });
  window.addEventListener('touchstart', event => { if (active()) event.stopImmediatePropagation(); }, { capture: true, passive: true });
  window.addEventListener('touchmove', event => {
    if (!active()) return;
    event.stopImmediatePropagation();
    if (!event.target.closest?.('.sy-tour-panel')) event.preventDefault();
  }, { capture: true, passive: false });
})();
