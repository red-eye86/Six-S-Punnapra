# Security Policy & Operational Guidelines

This document outlines the security architecture, data handling rules, and incident response procedures for the **Six S Punnapra** website.

---

## 1. Architecture & Threat Model

The site is built with a static front-end (Vite) and serverless backend functions (Netlify):
- **No Client-side Secrets:** No API keys, Google Form IDs, or Turnstile secrets are stored in the client codebase or public HTML.
- **Serverless Form Proxy:** All registration requests are routed via `/api/register` (`netlify/functions/register.js`). The serverless handler validates origins, handles honeypots, verifies CAPTCHA challenges, normalizes phone and name fields against formula injection, and communicates with Google Forms server-to-server.
- **Content Security Policy (CSP):** Configured in `public/_headers` to block unauthorized script injection, restrict frames, prevent clickjacking (`frame-ancestors 'none'`), and enforce HTTPS.
- **Data Minimization:** Only minimal, necessary details for children's sports training are requested.

---

## 2. Child Safety & Personal Data (DPDP / Privacy)

- **Mandatory Consent:** Registrations require affirmative consent from a parent or legal guardian.
- **No Public Identification:** Children's full names or identifiable portraits are never published to public pages or galleries without explicit parental approval.
- **Restricted Access:** Access to the Google Sheet holding registration responses must be restricted to 2–3 named club officials with 2-Factor Authentication enabled.
- **Safe CSV Exports:** When exporting registration responses to Excel or CSV, import values as plain text to avoid spreadsheet formula execution.

---

## 3. Vulnerability Disclosure & Contact

In accordance with RFC 9116, our security contact is published at:
`/.well-known/security.txt`

- **Contact:** mailto:contact@sixspunnapra.com
- **Preferred Languages:** English, Malayalam (മലയാളം)

---

## 4. Operational Checklist (Monthly)

1. Review Google Form response sheet for spam or abnormal entries.
2. Review Netlify deployment logs and check for function errors.
3. Ensure GitHub 2-Factor Authentication is active for all repository collaborators.
4. Run `npm audit` to verify dependencies remain free of vulnerabilities.
