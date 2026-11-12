// scripts/optimize-images.mjs
// Generates responsive AVIF + WebP variants from /originals into /public/images
// and writes src/data/images.json (used by the build to emit <picture> tags with
// correct width/height). Run: npm run images
import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'originals', 'images');
const OUT = path.join(ROOT, 'public', 'images');

// key (output path without extension) -> { src, widths }
// Widths are chosen from the largest rendered CSS size (x2 for retina).
const jobs = {
  'logo': { src: 'logo.png', widths: [120, 240] },
  'sports/volleyball': { src: 'volleyball.png', widths: [200, 400] },
  'sports/football': { src: 'football.png', widths: [200, 400] },
  'sports/cricket': { src: 'cricket.png', widths: [120, 240] },
  'sports/shuttlecock': { src: 'shuttlecock.png', widths: [140, 280] },
  'youth': { src: 'youth.png', widths: [400, 800] },
  'payment-options': { src: 'Payment Options.jpeg', widths: [600, 1200] },
  'volleyball-court-sketch': { src: 'volleyball court sketch.jpeg', widths: [400, 800] },
  'six-s-club/president-sebastian': { src: 'six-s-club/Bush.png', widths: [300, 600] },
  'six-s-club/secretary-sajan': { src: 'six-s-club/Sajan.jpeg', widths: [300, 600] },
  'six-s-club/six-s-group': { src: 'six-s-club/Six S.png', widths: [400, 1600] },
  'six-s-club/construction-update-1': { src: 'six-s-club/Image-01.jpeg', widths: [400, 800] },
  'six-s-club/construction-update-2': { src: 'six-s-club/Image-02.jpeg', widths: [400, 800] },
};

// Legacy team photos: rename Facebook-ID filenames to team-01, team-02, ...
const legacyDir = path.join(SRC, 'legacy-teams');
for (const team of await readdir(legacyDir)) {
  const files = (await readdir(path.join(legacyDir, team)))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  files.forEach((f, i) => {
    const n = String(i + 1).padStart(2, '0');
    jobs[`legacy-teams/${team}/${team}-${n}`] = {
      src: `legacy-teams/${team}/${f}`,
      widths: [400, 1400],
    };
  });
}

const manifest = {};
for (const [key, { src, widths }] of Object.entries(jobs)) {
  const input = path.join(SRC, src);
  const meta = await sharp(input).metadata();
  const outDir = path.dirname(path.join(OUT, key));
  await mkdir(outDir, { recursive: true });
  const variants = [];
  for (const w of widths) {
    const width = Math.min(w, meta.width);
    const height = Math.round((meta.height / meta.width) * width);
    const base = path.join(OUT, `${key}-${width}`);
    const img = sharp(input).rotate().resize({ width, withoutEnlargement: true });
    await img.clone().webp({ quality: 78, effort: 5 }).toFile(`${base}.webp`);
    await img.clone().avif({ quality: 55, effort: 5 }).toFile(`${base}.avif`);
    variants.push({ w: width, h: height });
  }
  manifest[key] = { source: src, variants };
  console.log(`✓ ${key}  (${variants.map((v) => v.w).join(', ')})`);
}

// Open Graph share image (1200x630): logo centred on the brand background.
const logo = await sharp(path.join(SRC, 'logo.png')).resize({ height: 420 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0b0f19' } })
  .composite([{ input: logo, gravity: 'center' }])
  .jpeg({ quality: 82 })
  .toFile(path.join(OUT, 'og-default.jpg'));

// Favicons
await sharp(path.join(SRC, 'logo.png')).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(ROOT, 'public', 'favicon-32.png'));
await sharp(path.join(SRC, 'logo.png')).resize(180, 180, { fit: 'contain', background: '#0b0f19' }).png().toFile(path.join(ROOT, 'public', 'apple-touch-icon.png'));

await mkdir(path.join(ROOT, 'src', 'data'), { recursive: true });
await writeFile(path.join(ROOT, 'src', 'data', 'images.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nWrote ${Object.keys(manifest).length} images + og-default.jpg + favicons`);

