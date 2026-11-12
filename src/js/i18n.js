// i18n.js: EN ⇄ ML switching (Phase 1 version).
// Still uses data-en / data-ml attributes; Phase 2 replaces this with JSON locale files.
// Fixes vs legacy: textContent instead of innerText (faster, no forced layout),
// the choice is saved in localStorage, ?lang=ml|en is honoured, and <html lang> is updated.

const STORAGE_KEY = 'sixs-lang';
const SUPPORTED = ['en', 'ml'];

function readStoredLang() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode etc.)
  }
}

function storeLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

export function getInitialLang() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (SUPPORTED.includes(fromUrl)) return fromUrl;
  const stored = readStoredLang();
  return SUPPORTED.includes(stored) ? stored : 'en';
}

export function translateTo(lang) {
  const isMl = lang === 'ml';
  document.documentElement.lang = isMl ? 'ml' : 'en';
  document.body.classList.toggle('lang-ml', isMl);
  document.body.classList.toggle('lang-en', !isMl);

  document.querySelectorAll('[data-en]').forEach((el) => {
    const text = el.getAttribute(isMl ? 'data-ml' : 'data-en');
    if (text !== null && el.textContent !== text) el.textContent = text;
  });

  // Placeholders + validation hints: remember the English original on first switch.
  const swapAttr = (selector, attr, mlAttr, enAttr) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.hasAttribute(enAttr)) el.setAttribute(enAttr, el.getAttribute(attr) || '');
      el.setAttribute(attr, el.getAttribute(isMl ? mlAttr : enAttr));
    });
  };
  swapAttr('[data-placeholder-ml]', 'placeholder', 'data-placeholder-ml', 'data-placeholder-en');
  swapAttr('[data-title-ml]', 'title', 'data-title-ml', 'data-title-en');

  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

export function initI18n() {
  const langSwitch = document.getElementById('langSwitch');
  const lang = getInitialLang();
  if (langSwitch) langSwitch.checked = lang === 'ml';
  translateTo(lang);
  storeLang(lang);

  langSwitch?.addEventListener('change', (e) => {
    const next = e.target.checked ? 'ml' : 'en';
    translateTo(next);
    storeLang(next);
  });
}

