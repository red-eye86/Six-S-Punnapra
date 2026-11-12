// parallax.js: scroll parallax for the hero's floating sport icons.
// Legacy code ran on every scroll event and set `transform`, which the CSS float
// animation overrode, so the effect never showed. Now: rAF-throttled, runs only while
// the hero is on screen, and uses the separate `translate` property so it combines with
// the float animation instead of fighting it. Disabled for prefers-reduced-motion.

export function initParallax() {
  const hero = document.querySelector('.hero');
  const items = [...document.querySelectorAll('.float-item')];
  if (!hero || !items.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let visible = true;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    items.forEach((item, i) => {
      item.style.translate = `0 ${y * (i + 1) * 0.15}px`;
    });
  };

  const onScroll = () => {
    if (!visible || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) onScroll();
  }).observe(hero);

  window.addEventListener('scroll', onScroll, { passive: true });
}

