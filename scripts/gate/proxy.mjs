/**
 * Two jobs, and they are deliberately in one file: find every proxy standing in
 * for content the Kaaya team owes (decision 21), and refuse the Wix placeholder
 * data outright.
 *
 * Usage: node scripts/gate/proxy.mjs [--strict]   (run after `npm run build`)
 *
 * Exits non-zero on Wix placeholder data always, and on any outstanding proxy
 * under `--strict`. A bare run lists the proxies and exits 0, because the whole
 * point of a proxy is that the tree keeps building while the real value is
 * owed. `--strict` is the cutover gate: T9.4 must not go to production with a
 * proxy still in the build.
 *
 * A proxy is declared by a `KAAYA-PROXY(<ticket>): <what is owed>` comment
 * beside the value it stands in for. Comments never render, work in YAML,
 * markdown frontmatter, `.astro` and `.ts` alike, and grep finds them — a
 * register held in a separate file would drift from the tree the first time
 * someone deleted a proxy without updating it.
 *
 * The Wix strings are checked over built output rather than source. Every page
 * duplicates its YAML as a hardcoded fallback, so a date deleted from an entry
 * can still reach a visitor through the component underneath it.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * The retired Wix gallery's placeholder event date and address. Hard gate: this
 * is the one class of content in the repo that has no acceptable proxy, because
 * it reads as real and is wrong in a way a visitor would act on.
 */
const WIX_PLACEHOLDERS = ['1:41 am', '3:41 am', '123 Art Ln', 'Sweetwater', 'TN 37874'];

const MARKER = /KAAYA-PROXY\((T[\d.]+)\):\s*(.+?)\s*(?:\*\/|-->|$)/;

const SOURCE_DIRS = ['src', 'public/admin', 'functions', 'scripts', 'e2e'];
const SKIP_DIRS = new Set(['node_modules', 'derived']);

const strict = process.argv.includes('--strict');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : walk(full);
    return [full];
  });
}

// --- proxies -----------------------------------------------------------------

const proxies = [];
for (const file of SOURCE_DIRS.flatMap(walk)) {
  let lines;
  try {
    lines = fs.readFileSync(file, 'utf8').split('\n');
  } catch {
    continue; // a binary upload, which cannot carry a marker of its own
  }
  lines.forEach((line, i) => {
    const match = line.match(MARKER);
    if (match) proxies.push({ file, line: i + 1, ticket: match[1], owed: match[2] });
  });
}

for (const { file, line, ticket, owed } of proxies) {
  console.log(`  ${ticket}  ${file}:${line}  ${owed}`);
}

// --- Wix placeholders --------------------------------------------------------

function htmlFiles(target) {
  if (!fs.existsSync(target)) return [];
  return walk(target).filter((f) => f.endsWith('.html'));
}

const built = htmlFiles('dist');
if (built.length === 0) {
  console.error('proxy: nothing to check — run `npm run build` first');
  process.exit(1);
}

const wixHits = [];
for (const file of built) {
  const html = fs.readFileSync(file, 'utf8');
  for (const phrase of WIX_PLACEHOLDERS) {
    if (html.includes(phrase)) wixHits.push({ file, phrase });
  }
}

for (const { file, phrase } of wixHits) {
  console.error(`proxy: WIX PLACEHOLDER "${phrase}" in ${file}`);
}

const summary = `proxy: ${proxies.length} outstanding across ${new Set(proxies.map((p) => p.file)).size} files, ${wixHits.length} Wix placeholders across ${built.length} built pages`;

if (wixHits.length > 0) {
  console.error(summary);
  process.exit(1);
}

console.log(summary);

if (strict && proxies.length > 0) {
  console.error(`proxy: --strict, and ${proxies.length} proxies are still in the build`);
  process.exit(1);
}
