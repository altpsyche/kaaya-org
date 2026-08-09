/**
 * Every internal href in the build resolves to something the build emits.
 *
 * Usage: node scripts/gate/dead-links.mjs        (run after `npm run build`)
 *
 * Exits non-zero on a dead link.
 *
 * `astro build` does not check hrefs, so a link to a page that was never
 * written, or was moved by a route reorganization, builds green and 404s in
 * front of a visitor. Four such links survived in `main` pointing at blog posts
 * that do not exist.
 *
 * Astro's default `build.format: 'directory'` means a route emits
 * `<route>/index.html`, so both spellings are accepted for the same href.
 *
 * External URLs, `mailto:`, `tel:` and anchors are out of scope. So is any
 * cross-subdomain absolute URL that `link()` emits in a production build —
 * those name a host this build does not resolve locally, and the middleware
 * behaviour table is what covers them.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';

function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

if (!fs.existsSync(DIST)) {
  console.error('dead-links: no dist/ — run `npm run build` first');
  process.exit(1);
}

const all = walk(DIST);
const pages = all.filter((f) => f.endsWith('.html'));

/** A path is served if the build emits it as a file or as a directory index. */
const served = new Set(all.map((f) => '/' + path.relative(DIST, f).split(path.sep).join('/')));
const resolves = (href) => {
  const clean = href.replace(/[?#].*$/, '');
  const trimmed = clean.replace(/\/$/, '');
  return (
    clean === '/' ||
    served.has(clean) ||
    served.has(trimmed) ||
    served.has(`${trimmed}/index.html`)
  );
};

const dead = new Map();
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const [, href] of html.matchAll(/href="(\/[^"]*)"/g)) {
    if (resolves(href)) continue;
    if (!dead.has(href)) dead.set(href, new Set());
    dead.get(href).add('/' + path.relative(DIST, page).split(path.sep).join('/'));
  }
}

for (const [href, from] of dead) {
  console.error(`${href}  ← ${[...from].slice(0, 3).join(', ')}${from.size > 3 ? ` +${from.size - 3} more` : ''}`);
}

console.log(
  dead.size === 0
    ? `dead-links: 0 dead across ${pages.length} pages`
    : `dead-links: ${dead.size} dead href(s) — see above`
);
process.exit(dead.size === 0 ? 0 : 1);
