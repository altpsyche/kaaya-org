/**
 * Every internal href in the build resolves to something the build emits, on
 * the host that actually serves it.
 *
 * Usage: node scripts/gate/dead-links.mjs        (run after `npm run build`)
 *
 * Exits non-zero on a dead or misrouted link.
 *
 * `astro build` does not check hrefs, so a link to a page that was never
 * written, or was moved by a route reorganization, builds green and 404s in
 * front of a visitor. Four such links survived in `main` pointing at blog posts
 * that do not exist.
 *
 * Astro's default `build.format: 'directory'` means a route emits
 * `<route>/index.html`, so both spellings are accepted for the same href.
 *
 * A production build renders internal hrefs as absolute subdomain URLs, since
 * `link()` calls `toCanonical()` when `import.meta.env.PROD` is set. Those are
 * mapped back onto build paths here — inverting the middleware's rewrite — so
 * the gate keeps checking the same links it checked when they were bare. Left
 * unmapped it would skip nearly every href in the build and still report zero
 * dead, which is why the count of hrefs checked is printed alongside.
 *
 * `mailto:`, `tel:`, bare anchors and genuinely external URLs are out of scope.
 *
 * SECTIONS is imported rather than restated: a second copy of that list would
 * drift the first time a section host is added.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SECTIONS } from '../../src/lib/links.ts';

const DIST = 'dist';
const APEX = 'kaaya.org';

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

/**
 * An internal href -> the build path serving it, or null when the href is not
 * this site's. The section branches invert `toCanonical()`; the apex branch is
 * where a misrouted link shows up, because a section path left on the apex is
 * a URL the middleware 301s away from rather than serves.
 */
function toBuildPath(href) {
  if (href.startsWith('/')) return { path: href, misrouted: false };
  let url;
  try {
    url = new URL(href);
  } catch {
    return null; // mailto:, tel:, #anchor, and anything else unparseable
  }
  const host = url.hostname;
  if (host !== APEX && !host.endsWith(`.${APEX}`)) return null;

  const sub = host === APEX ? '' : host.slice(0, -(APEX.length + 1));
  const p = url.pathname;

  if (SECTIONS.includes(sub)) return { path: `/${sub}${p === '/' ? '' : p}`, misrouted: false };
  if (sub === 'happenings') return { path: p === '/' ? '/blog' : p, misrouted: false };

  // Apex and www. A leading section prefix here is the sitemap defect in link
  // form: the page exists in the build, so `resolves()` says yes, but the
  // visitor is served a 301 to the section host instead of the page.
  const first = p.split('/')[1] ?? '';
  return { path: p, misrouted: SECTIONS.includes(first) || first === 'blog' };
}

const dead = new Map();
const misrouted = new Map();
let checked = 0;

const note = (map, href, page) => {
  if (!map.has(href)) map.set(href, new Set());
  map.get(href).add('/' + path.relative(DIST, page).split(path.sep).join('/'));
};

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    const target = toBuildPath(href);
    if (!target) continue;
    checked++;
    if (target.misrouted) note(misrouted, href, page);
    else if (!resolves(target.path)) note(dead, href, page);
  }
}

const report = (map, label) => {
  for (const [href, from] of map) {
    const list = [...from];
    console.error(
      `${label} ${href}  ← ${list.slice(0, 3).join(', ')}${list.length > 3 ? ` +${list.length - 3} more` : ''}`,
    );
  }
};
report(dead, 'dead     ');
report(misrouted, 'misrouted');

const bad = dead.size + misrouted.size;
console.log(
  `dead-links: ${dead.size} dead, ${misrouted.size} misrouted across ${checked} internal hrefs on ${pages.length} pages`,
);
process.exit(bad === 0 ? 0 : 1);
