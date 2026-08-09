/**
 * Decision 20: `scripts/images.mjs` writes webp derivatives of everything in
 * `public/uploads/` into a generated, gitignored `public/uploads/derived/`.
 * This is the build-time lookup over that directory, shared by the two things
 * that render an upload: `ResponsiveImage.astro` and `Hero.astro`.
 *
 * Every function here answers "what exists", never "what should exist" — the
 * directory can legitimately be empty, because Decap writes an upload with no
 * derivative and the pass may not have run. A caller that finds nothing must
 * render the original rather than a broken URL.
 *
 * Node-only: it reads the filesystem, so it runs in `.astro` frontmatter during
 * the build and never in the browser.
 */
import fs from 'node:fs';
import path from 'node:path';

const DERIVED_DIR = 'public/uploads/derived';

export interface Derivative {
  /** Site-root path, e.g. `/uploads/derived/hero-960.webp`. */
  src: string;
  width: number;
}

/** Every derivative of `source`, narrowest first. Empty when there are none. */
export function derivativesFor(source: string): Derivative[] {
  if (!source.startsWith('/uploads/') || !fs.existsSync(DERIVED_DIR)) return [];
  const stem = path.basename(source, path.extname(source));
  const pattern = new RegExp(`^${stem}-(\\d+)\\.webp$`);
  return fs
    .readdirSync(DERIVED_DIR)
    .map((file) => file.match(pattern))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ src: `/uploads/derived/${m[0]}`, width: Number(m[1]) }))
    .sort((a, b) => a.width - b.width);
}

/**
 * The derivative closest to `width` without going under it, or the widest that
 * exists, or `source` itself when the pass has produced nothing. Always returns
 * something renderable, which is what keeps a missing derivative from becoming
 * a missing image.
 */
export function derivativeAt(source: string, width: number): string {
  const options = derivativesFor(source);
  if (options.length === 0) return source;
  return (options.find((d) => d.width >= width) ?? options[options.length - 1]).src;
}
