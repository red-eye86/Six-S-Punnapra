// vite.config.js
// Multi-page static build. A small custom plugin (no extra dependencies) handles:
//   <!-- @include navbar -->        -> contents of src/partials/navbar.html
//   <img data-pic="logo" ...>        -> responsive <picture> (AVIF + WebP) with width/height,
//                                        using src/data/images.json from `npm run images`
//   %SITE_URL%                       -> SITE_URL env var (e.g. https://punnaprasixes.com).
//                                        If SITE_URL is not set, tags that use it are removed
//                                        so we never publish a wrong canonical URL.
import { defineConfig, loadEnv } from 'vite';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = import.meta.dirname;
const PAGES = path.join(ROOT, 'src', 'pages');
const PARTIALS = path.join(ROOT, 'src', 'partials');
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.json');

function includePartials(html, depth = 0) {
  if (depth > 5) throw new Error('Partial include depth exceeded (circular include?)');
  return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
    includePartials(readFileSync(path.join(PARTIALS, `${name}.html`), 'utf8'), depth + 1),
  );
}

function expandPictures(html) {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  return html.replace(/<img\b([^>]*?)\bdata-pic="([^"]+)"([^>]*)>/g, (match, before, key, after) => {
    const entry = manifest[key];
    if (!entry) throw new Error(`data-pic="${key}" not found in src/data/images.json (run npm run images)`);
    let attrs = `${before} ${after}`.replace(/\s+/g, ' ').trim();
    const sizesMatch = attrs.match(/\bsizes="([^"]+)"/);
    const sizes = sizesMatch ? sizesMatch[1] : '100vw';
    attrs = attrs.replace(/\bsizes="[^"]+"\s*/, '');
    const vs = entry.variants;
    const largest = vs[vs.length - 1];
    const srcset = (ext) => vs.map((v) => `/images/${key}-${v.w}.${ext} ${v.w}w`).join(', ');
    // Boolean attribute data-full -> URL of the largest image (used by the lightbox)
    attrs = attrs.replace(/\bdata-full\b(?!=)/, `data-full="/images/${key}-${largest.w}.webp"`);
    return (
      `<picture>` +
      `<source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}">` +
      `<source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}">` +
      `<img src="/images/${key}-${largest.w}.webp" width="${largest.w}" height="${largest.h}" ${attrs}>` +
      `</picture>`
    );
  });
}

function applySiteUrl(html, siteUrl) {
  if (siteUrl) return html.replaceAll('%SITE_URL%', siteUrl.replace(/\/$/, ''));
  // No domain configured yet: drop any line containing the placeholder.
  return html
    .split('\n')
    .filter((line) => !line.includes('%SITE_URL%'))
    .join('\n');
}

function sitePlugin(siteUrl) {
  return {
    name: 'punnapra-site-html',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => applySiteUrl(expandPictures(includePartials(html)), siteUrl),
    },
    configureServer(server) {
      server.watcher.add([PARTIALS, MANIFEST]);
      server.watcher.on('change', (file) => {
        if (file.startsWith(PARTIALS) || file === MANIFEST) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ROOT, '');
  const input = Object.fromEntries(
    readdirSync(PAGES)
      .filter((f) => f.endsWith('.html'))
      .map((f) => [f.replace(/\.html$/, ''), path.join(PAGES, f)]),
  );
  return {
    root: PAGES,
    publicDir: path.join(ROOT, 'public'),
    envDir: ROOT,
    plugins: [sitePlugin(env.SITE_URL)],
    server: { fs: { allow: [ROOT] } },
    build: {
      outDir: path.join(ROOT, 'dist'),
      emptyOutDir: true,
      rollupOptions: { input },
    },
  };
});

