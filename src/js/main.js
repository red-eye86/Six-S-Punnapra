// main.js: entry point for every page (bundled + hashed by Vite).
import { initI18n } from './i18n.js';
import { initNav } from './nav.js';
import { initTabs } from './tabs.js';
import { initLightbox } from './lightbox.js';
import { initParallax } from './parallax.js';
import { initRegistrationForm } from './form.js';
import { loadParticles } from './particles.js';

// Language first, so translated text is in place as early as possible.
initI18n();
initNav();
initTabs();
initLightbox();
initParallax();
initRegistrationForm();

// Decorative background: load after the page is interactive (not on the critical path).
const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
if (document.readyState === 'complete') idle(loadParticles);
else window.addEventListener('load', () => idle(loadParticles), { once: true });

