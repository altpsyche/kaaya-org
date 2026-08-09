/**
 * Decision 20: webp derivatives for `public/uploads/`, generated at build time.
 *
 * Usage: node scripts/images.mjs        (runs automatically before `npm run build`)
 *
 * TDD §10 keeps images in `public/uploads/` referenced by a relative
 * `/uploads/...`, which is what Decap writes and what the middleware serves
 * unrewritten on every host. That puts them out of reach of Astro's optimiser,
 * which only sees files under `src/assets/`, so the derivatives are made here.
 *
 * Originals are never touched or deleted — `/uploads/<name>.png` stays the full
 * resolution file a detail page links to. The output directory is generated and
 * gitignored, so Cloudflare Pages regenerates it on every deploy through the
 * `prebuild` hook rather than serving whatever a contributor happened to commit.
 *
 * A missing derivative must degrade rather than break: `ResponsiveImage.astro`
 * reads this directory at build time and emits a plain `<img>` on the original
 * when it finds nothing, so an image uploaded through the CMS after the last
 * run renders correctly.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'public/uploads';
const OUT_DIR = path.join(SOURCE_DIR, 'derived');

const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

/**
 * Card, half-width and full-width on a normal display, then 1920 for a hero,
 * which is the only thing on the site painted edge to edge.
 */
const WIDTHS = [480, 960, 1440, 1920];

/** Below this a webp derivative saves less than the extra request costs. */
const MIN_SOURCE_BYTES = 100 * 1024;

/** Sharp's default is 80; 72 holds up on photographs at these sizes. */
const QUALITY = 72;

const started = Date.now();
fs.mkdirSync(OUT_DIR, { recursive: true });

const sources = fs
  .readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && EXTENSIONS.has(path.extname(e.name).toLowerCase()))
  .map((e) => path.join(SOURCE_DIR, e.name))
  .filter((f) => fs.statSync(f).size >= MIN_SOURCE_BYTES);

let written = 0;
let reused = 0;
let bytes = 0;

for (const source of sources) {
  const stem = path.basename(source, path.extname(source));
  const sourceStat = fs.statSync(source);
  const { width: sourceWidth } = await sharp(source).metadata();

  for (const width of WIDTHS) {
    // Never upscale: a 480px source enlarged to 1440 is a bigger file that
    // looks worse than the original.
    if (!sourceWidth || width > sourceWidth) continue;

    const out = path.join(OUT_DIR, `${stem}-${width}.webp`);
    const current = fs.existsSync(out) && fs.statSync(out).mtimeMs >= sourceStat.mtimeMs;

    if (current) {
      reused += 1;
    } else {
      await sharp(source).resize({ width }).webp({ quality: QUALITY }).toFile(out);
      written += 1;
    }
    bytes += fs.statSync(out).size;
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
const sourceBytes = sources.reduce((sum, f) => sum + fs.statSync(f).size, 0);

console.log(
  `images: ${sources.length} sources (${mb(sourceBytes)} MB) → ${written + reused} derivatives ` +
    `(${mb(bytes)} MB), ${written} written, ${reused} reused, ${Date.now() - started} ms`,
);
