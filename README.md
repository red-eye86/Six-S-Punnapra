# Punnapra Sixes (Six S Punnapra) - Website

Official website for the Six S Punnapra club. Built with vanilla modern JavaScript, Vite, self-hosted fonts and assets, bilingual support (English + Malayalam), and responsive AVIF/WebP image generation.

## Development & Build

### Prerequisites
- Node.js 18+ (tested with Node 24)

### Setup
```bash
npm install
```

### Optimize Images
Processes raw source images from `originals/images` into responsive AVIF + WebP sets in `public/images`, emitting metadata to `src/data/images.json`:
```bash
npm run images
```

### Dev Server
Starts local Vite development server:
```bash
npm run dev
```

### Production Build
Builds static pages, hashed CSS/JS assets, and copies public files into `dist/`:
```bash
npm run build
```

### Dist Verification
Runs integrity checks across `dist/` verifying valid HTML anchors, image references, meta tags, and absence of external CDN leaks:
```bash
npm run check
```

## Structure
```
/src
  /pages        # Static pages: index.html, sports.html, officials.html, etc.
  /partials     # Shared components (navbar, footer, toast, icons, head)
  /js           # Modular scripts: main.js, i18n.js, nav.js, lightbox.js, etc.
  /css          # Modular styling: tokens, base, components, pages, responsive
  /data         # Generated image manifests
/public         # Static assets directly copied to dist/ (images, fonts, _headers)
/originals      # High-res raw source assets (untracked / not deployed)
```

