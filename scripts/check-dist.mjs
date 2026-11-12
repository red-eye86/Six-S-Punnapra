// scripts/check-dist.mjs: post-build sanity checks on dist/.
//  - every local href/src/srcset in every page resolves to a file
//  - no third-party CDN scripts/styles remain
//  - unique <title> and meta description per page
//  - no href="#" placeholders, no inline event handlers
// Run: npm run build && npm run check
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const pages = readdirSync(DIST).filter((f) => f.endsWith('.html'));
const errors = [];
const titles = new Map();
const descs = new Map();

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

for (const page of pages) {
  const html = stripComments(readFileSync(path.join(DIST, page), 'utf8'));
  const refs = new Set();
  for (const m of html.matchAll(/\s(?:href|src|data-full)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(',').forEach((s) => refs.add(s.trim().split(/\s+/)[0]));

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:)/.test(ref)) {
      if (!/^https:\/\/(docs\.google\.com|www\.facebook\.com)\//.test(ref)) errors.push(`${page}: unexpected external URL ${ref}`);
      continue;
    }
    if (ref === '#') { errors.push(`${page}: href="#" placeholder`); continue; }
    const [file, hash] = ref.split('#');
    if (!file) {
      if (hash && !html.includes(`id="${hash}"`)) errors.push(`${page}: missing anchor #${hash}`);
      continue;
    }
    const target = path.join(DIST, file.startsWith('/') ? file.slice(1) : file);
    if (!existsSync(target) || !statSync(target).isFile()) errors.push(`${page}: broken link ${ref}`);
    else if (hash && target.endsWith('.html')) {
      const other = readFileSync(target, 'utf8');
      if (!other.includes(`id="${hash}"`)) errors.push(`${page}: missing anchor ${ref}`);
    }
  }

  if (/\son[a-z]+="/i.test(html)) errors.push(`${page}: inline event handler found`);
  if (/\sstyle="/i.test(html)) errors.push(`${page}: inline style attribute found`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  if (!title) errors.push(`${page}: missing <title>`);
  if (!desc) errors.push(`${page}: missing meta description`);
  if (titles.has(title)) errors.push(`${page}: duplicate title with ${titles.get(title)}`);
  if (descs.has(desc)) errors.push(`${page}: duplicate description with ${descs.get(desc)}`);
  titles.set(title, page);
  descs.set(desc, page);
}

if (errors.length) {
  console.error(errors.map((e) => '✗ ' + e).join('\n'));
  process.exit(1);
}
console.log(`✓ ${pages.length} pages OK: links, images, titles, descriptions, no inline handlers/styles`);

