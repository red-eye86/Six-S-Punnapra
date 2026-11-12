// utils/safe.js: Safe DOM manipulation utilities to prevent XSS and malicious URL schemes.

/**
 * Safely sets plain text content on an element without risking HTML/XSS injection.
 */
export const setText = (el, value) => {
  if (el) el.textContent = String(value ?? '');
};

/**
 * Validates and normalizes URLs, preventing javascript: and data: URI injection.
 */
export const safeUrl = (value, { allowedHosts = [] } = {}) => {
  try {
    const u = new URL(String(value), window.location.origin);
    if (!['https:', 'http:'].includes(u.protocol)) return '#';
    if (allowedHosts.length && !allowedHosts.includes(u.hostname)) return '#';
    return u.href;
  } catch {
    return '#';
  }
};

/**
 * Ensures image sources originate from our own origin or approved media CDN.
 */
export const safeImg = (value) => {
  const u = safeUrl(value);
  return u.startsWith(window.location.origin) ? u : '';
};
