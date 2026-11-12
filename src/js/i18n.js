// i18n.js: Version 2.0 JSON-based internationalization system.
// Supports:
//  - data-i18n="Key" -> textContent
//  - data-i18n-placeholder="Key" -> placeholder attribute
//  - data-i18n-title="Key" -> title attribute
//  - data-i18n-aria="Key" -> aria-label attribute
//  - Backward compatibility with legacy data-en / data-ml attributes during migration
//  - Persisted language in localStorage ('sixs-lang') + ?lang=ml / ?lang=en URL override
//  - Dynamic html lang attribute and body classes (.lang-en, .lang-ml)

const STORAGE_KEY = 'sixs-lang';
const SUPPORTED = ['en', 'ml'];
let currentLang = 'en';
const cache = {};

export function getInitialLang() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (SUPPORTED.includes(fromUrl)) return fromUrl;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) return stored;
  } catch {
    /* ignore localStorage error */
  }
  // Browser language detection (if user default is Malayalam)
  if (navigator.language && navigator.language.startsWith('ml')) {
    return 'ml';
  }
  return 'en';
}

async function loadLocale(lang) {
  if (cache[lang]) return cache[lang];
  try {
    const res = await fetch(`/locales/${lang}.json`);
    if (res.ok) {
      cache[lang] = await res.json();
      return cache[lang];
    }
  } catch (e) {
    console.warn(`Could not load /locales/${lang}.json:`, e);
  }
  return {};
}

export async function translateTo(lang) {
  currentLang = SUPPORTED.includes(lang) ? lang : 'en';
  const isMl = currentLang === 'ml';

  document.documentElement.lang = currentLang;
  document.body.classList.toggle('lang-ml', isMl);
  document.body.classList.toggle('lang-en', !isMl);

  try {
    localStorage.setItem(STORAGE_KEY, currentLang);
  } catch {
    /* ignore */
  }

  const dict = await loadLocale(currentLang);

  // 1. data-i18n text replacement
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = dict[key];
    if (val !== undefined && el.textContent !== val) {
      el.textContent = val;
    }
  });

  // 2. data-i18n-placeholder attribute
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = dict[key];
    if (val !== undefined) el.setAttribute('placeholder', val);
  });

  // 3. data-i18n-title attribute
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    const val = dict[key];
    if (val !== undefined) el.setAttribute('title', val);
  });

  // 4. Backward compatibility with data-en / data-ml attributes
  document.querySelectorAll('[data-en]').forEach((el) => {
    const val = isMl ? el.getAttribute('data-ml') : el.getAttribute('data-en');
    if (val && el.textContent !== val) el.textContent = val;
  });

  document.querySelectorAll('[data-placeholder-ml]').forEach((el) => {
    if (isMl) {
      if (!el.hasAttribute('data-placeholder-en')) {
        el.setAttribute('data-placeholder-en', el.getAttribute('placeholder') || '');
      }
      el.setAttribute('placeholder', el.getAttribute('data-placeholder-ml'));
    } else {
      if (el.hasAttribute('data-placeholder-en')) {
        el.setAttribute('placeholder', el.getAttribute('data-placeholder-en'));
      }
    }
  });

  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
}

export function getCurrentLang() {
  return currentLang;
}

export function initI18n() {
  const langSwitch = document.getElementById('langSwitch');
  const lang = getInitialLang();

  if (langSwitch) {
    langSwitch.checked = lang === 'ml';
    langSwitch.addEventListener('change', (e) => {
      translateTo(e.target.checked ? 'ml' : 'en');
    });
  }

  // Preload English and Malayalam dictionaries
  loadLocale('en');
  loadLocale('ml');

  translateTo(lang);
}
