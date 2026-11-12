// form.js: Modernized secure registration form handling.
// Replaces the insecure hidden iframe submission with direct /api/register proxy calls,
// validation reporting, status feedback in both English and Malayalam, and honeypot protection.

export function showToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

export function initRegistrationForm() {
  const form = document.getElementById('regForm');
  if (!form) return;

  const status = document.getElementById('formStatus');
  const btn = form.querySelector('button[type="submit"]');
  const isMl = () => document.body.classList.contains('lang-ml');

  const MSG = {
    invalid: { en: 'Please check your details and try again.', ml: 'വിവരങ്ങൾ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.' },
    consent: { en: 'Please agree to the parent/guardian consent.', ml: 'ദയവായി രക്ഷിതാവിന്റെ സമ്മതപത്രം അംഗീകരിക്കുക.' },
    captcha: { en: 'Please complete the verification.', ml: 'ദയവായി പരിശോധന പൂർത്തിയാക്കുക.' },
    rate:    { en: 'Too many attempts. Please wait a minute.', ml: 'ഒരുപാട് ശ്രമങ്ങൾ. ഒരു മിനിറ്റ് കാത്തിരിക്കുക.' },
    failed:  { en: 'Could not submit. Please try again later.', ml: 'സമർപ്പിക്കാനായില്ല. പിന്നീട് ശ്രമിക്കുക.' },
    network: { en: 'Network problem. Check your connection.', ml: 'നെറ്റ്‌വർക്ക് പ്രശ്നം. കണക്ഷൻ പരിശോധിക്കുക.' },
  };

  const say = (key, color = '#ff5722') => {
    if (!status) return;
    status.style.color = color;
    status.textContent = key && MSG[key] ? MSG[key][isMl() ? 'ml' : 'en'] : '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    say(null);

    // Client-side HTML5 validation check
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Consent check
    const consent = form.querySelector('input[name="consent"]');
    if (consent && !consent.checked) {
      say('consent');
      return;
    }

    if (btn) btn.disabled = true;

    try {
      const formData = new FormData(form);
      const urlEncoded = new URLSearchParams(formData);

      const res = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: urlEncoded.toString(),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        form.reset();
        showToast();
      } else if (res.status === 429) {
        say('rate');
      } else if (data.error === 'consent') {
        say('consent');
      } else if (data.error === 'captcha') {
        say('captcha');
      } else if (res.status === 422) {
        say('invalid');
      } else {
        say('failed');
      }
    } catch {
      say('network');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// Backwards compatibility
window.showToast = showToast;
