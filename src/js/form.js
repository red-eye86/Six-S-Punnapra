// form.js: Parent Registration → Google Form (POST into a hidden iframe).
// Replaces the inline onsubmit/onload handlers (needed for a strict CSP later).
// The form action URL and entry.* field names are unchanged.
// Consent, honeypot and failure feedback come in Phase 6.

export function showToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

export function initRegistrationForm() {
  const form = document.getElementById('regForm');
  const iframe = document.getElementById('hidden_iframe');
  if (!form || !iframe) return;

  let submitted = false;

  // Trim and normalise the phone number before it is sent
  form.addEventListener('submit', () => {
    const phone = form.querySelector('input[type="tel"]');
    if (phone) phone.value = phone.value.replace(/[\s-]/g, '');
    submitted = true;
  });

  iframe.addEventListener('load', () => {
    if (!submitted) return;
    submitted = false;
    showToast();
    form.reset();
  });
}

// Kept for backwards compatibility with any external caller
window.showToast = showToast;

