// particles.js: background particles, loaded lazily (separate chunk) and bundled from npm
// instead of the jsDelivr CDN. Same configuration as the legacy site.
// Skipped for prefers-reduced-motion. Phase 3 replaces this with particles inside the WebGL scene.

const CONFIG = {
  particles: {
    number: { value: 40, density: { enable: true, value_area: 800 } },
    color: { value: ['#00d2ff', '#ff5722'] },
    shape: { type: 'circle' },
    opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
    size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
    line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.1, width: 1 },
    move: { enable: true, speed: 1, direction: 'top', random: true, straight: false, out_mode: 'out', bounce: false },
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
    modes: { grab: { distance: 140, line_linked: { opacity: 0.5 } }, push: { particles_nb: 4 } },
  },
  retina_detect: true,
};

export async function loadParticles() {
  if (!document.getElementById('particles-js')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  await import('particles.js'); // defines window.particlesJS
  window.particlesJS?.('particles-js', CONFIG);
}

