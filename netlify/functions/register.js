// Netlify Serverless Function: POST /api/register
// Proxies registration to Google Forms securely without exposing form IDs in client HTML.
// Environment variables configured in Netlify Dashboard:
//   GOOGLE_FORM_ID: 1FAIpQLSefGXNf4WHA2k6JybfPVJQbuy9Ez1iPEmvA0ltv9ZNWEFdcPA (or fallback default)
//   TURNSTILE_SECRET: (Optional) Secret key from Cloudflare Turnstile if enabled
//   ALLOWED_ORIGINS: Comma-separated list (e.g., https://sixspunnapra.com)

const ENTRY = {
  parent: 'entry.303431855',
  child:  'entry.260754013',
  phone:  'entry.51502017',
};

const NAME_RE  = /^[\p{L}][\p{L}\p{M}\s.'-]{1,59}$/u; // Letters (English + Malayalam), no leading = + - @ formulas
const PHONE_RE = /^(?:\+?91[\s-]?)?([6-9]\d{9})$/;     // Valid Indian mobile numbers

const json = (obj, status = 200) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
  body: JSON.stringify(obj),
});

const clean = (v) =>
  String(v ?? '').normalize('NFC').replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim();

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405);
  }

  // 1. Origin check
  const allowed = (process.env.ALLOWED_ORIGINS || 'https://sixspunnapra.com,http://localhost:5173,http://localhost:8888')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = event.headers.origin || event.headers.Origin;
  if (origin && !allowed.includes(origin)) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }

  let body;
  try {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const params = new URLSearchParams(body);

  // 2. Honeypot check: if bot fills "website" field, return silent success without writing to Google
  if (clean(params.get('website'))) {
    return json({ ok: true });
  }

  // 3. Turnstile check (if configured in environment)
  const turnstileSecret = process.env.TURNSTILE_SECRET;
  if (turnstileSecret) {
    const token = clean(params.get('cf-turnstile-response'));
    try {
      const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: token,
          remoteip: event.headers['client-ip'] || '',
        }),
      });
      const ts = await tsRes.json();
      if (!ts.success) return json({ ok: false, error: 'captcha' }, 400);
    } catch {
      return json({ ok: false, error: 'captcha_failed' }, 400);
    }
  }

  // 4. Validate & Normalize
  const parent = clean(params.get('parent'));
  const child  = clean(params.get('child'));
  const phoneM = clean(params.get('phone')).match(PHONE_RE);

  if (!NAME_RE.test(parent) || !NAME_RE.test(child) || !phoneM) {
    return json({ ok: false, error: 'invalid' }, 422);
  }
  if (params.get('consent') !== 'yes') {
    return json({ ok: false, error: 'consent' }, 422);
  }

  // 5. Forward to Google Forms server-side
  const formId = process.env.GOOGLE_FORM_ID || '1FAIpQLSefGXNf4WHA2k6JybfPVJQbuy9Ez1iPEmvA0ltv9ZNWEFdcPA';
  const googleBody = new URLSearchParams({
    [ENTRY.parent]: parent,
    [ENTRY.child]:  child,
    [ENTRY.phone]:  phoneM[1], // Exact 10 digits (safe against formula injections)
  });

  try {
    const gRes = await fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: googleBody.toString(),
      redirect: 'manual',
    });

    if (gRes.status >= 400 && gRes.status !== 302 && gRes.status !== 303) {
      return json({ ok: false, error: 'upstream' }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'upstream_exception' }, 502);
  }
}
