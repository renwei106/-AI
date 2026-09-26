/* Adapted from Fabio Ottaviani (@supah), MIT.
 * https://codepen.io/supah/pen/xxJMbbg
 * Original source: memo-paper/upstream/codepen-xxJMbbg.js.
 * Retains progress, relative active position, z-order and drag direction.
 * Original CSS transform / easing: memo-paper.css. A ten-card spatial window
 * keeps the reference geometry independent of collection size.
 */
export function createMemoCarousel(items, {initial = 0, onChange = () => {}} = {}) {
  let progress = 0, active = -1, wheelRemainder = 0;
  const count = items.length;
  const getZindex = (array, index) => array.map((_, i) => index === i ? array.length : array.length - Math.abs(index - i));
  const animate = (sound = true) => {
    progress = Math.max(0, Math.min(progress, 100));
    const next = Math.round(progress / 100 * (count - 1));
    if (active === next) return;
    const previous = active; active = next;
    const layers = getZindex(items, active);
    items.forEach((item, index) => {
      const distance = Math.abs(index - active);
      item.style.setProperty('--zIndex', layers[index]);
      item.style.setProperty('--active', (index - active) / 10);
      item.style.setProperty('--card-opacity', Math.max(.18, 1 - distance * .19));
      item.classList.toggle('is-active', index === active);
      item.inert = distance > 4;
      item.setAttribute('aria-current', String(index === active));
    });
    onChange(active, sound && previous >= 0);
  };
  const focus = (index, sound = false) => {
    progress = count > 1 ? Math.max(0, Math.min(count - 1, index)) / (count - 1) * 100 : 0;
    animate(sound);
  };
  focus(initial);
  return {
    get index() { return active; }, focus,
    step(direction) { focus(active + direction, true); },
    wheel(delta) {
      if (!delta) return;
      // No cooldown: every wheel notch advances even mid-transition.
      if (Math.abs(delta) >= 40) { wheelRemainder = 0; focus(active + Math.sign(delta), true); return; }
      if (Math.sign(wheelRemainder) !== Math.sign(delta)) wheelRemainder = 0;
      wheelRemainder += delta;
      while (Math.abs(wheelRemainder) >= 24) {
        const direction = Math.sign(wheelRemainder); wheelRemainder -= direction * 24;
        focus(active + direction, true);
      }
    },
    drag(deltaX) {
      const speedDrag = -.1;
      progress += count > 1 ? deltaX * speedDrag * (100 / (count - 1)) / 8 : 0;
      animate(true);
    }
  };
}
