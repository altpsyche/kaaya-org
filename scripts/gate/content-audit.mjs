/**
 * Did a content move lose anything?
 *
 * Usage: node scripts/gate/content-audit.mjs [git-ref]     (default HEAD)
 *
 * Exits non-zero when any string from the ref is unaccounted for.
 *
 * Every leaf string in `src/content/pages/*.yaml` at the given ref is searched
 * for in the working tree — both the YAML and the `.astro` files, because each
 * page duplicates its YAML as a hardcoded fallback and content genuinely lives
 * in both places. Whitespace is normalised, since a re-wrapped YAML block is
 * the same prose.
 *
 * A green build proves nothing about this. Splitting one page into five, or
 * merging two overlapping lists into one, drops a paragraph without any error:
 * the schema fields are optional, so a lost key is indistinguishable from a key
 * that was never set.
 *
 * The output is a worklist, not a verdict. A deliberate deletion still shows up
 * here, and the rule is that every line printed gets named in the commit body
 * as intended — a rename, a merge, a field that was restructured — or it is a
 * defect. Silence is the only thing that needs no explanation.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const ref = process.argv[2] ?? 'HEAD';
const YAML_DIR = 'src/content/pages';

/** Trailing whitespace and line wrapping are formatting, not content. */
const norm = (s) => s.replace(/\s+/g, ' ').trim();

function* leaves(node, at = '') {
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const [k, v] of Object.entries(node)) yield* leaves(v, `${at}.${k}`);
  } else if (Array.isArray(node)) {
    for (const [i, v] of node.entries()) yield* leaves(v, `${at}[${i}]`);
  } else if (typeof node === 'string') {
    yield [at, node];
  }
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28 });
}

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name), ext) : path.join(dir, e.name)
    )
    .filter((f) => f.endsWith(ext));
}

const wasThere = new Map();
for (const line of git('ls-tree', '--name-only', ref, `${YAML_DIR}/`).trim().split('\n')) {
  if (!line.endsWith('.yaml')) continue;
  const name = path.basename(line, '.yaml');
  for (const [at, value] of leaves(parse(git('show', `${ref}:${line}`)))) {
    wasThere.set(`${name}${at}`, norm(value));
  }
}

const haystack = norm(
  [...walk(YAML_DIR, '.yaml'), ...walk('src/pages', '.astro')]
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join(' ')
);
/** `.astro` fallbacks sit in single-quoted JS, so their apostrophes are escaped. */
const unescaped = haystack.replace(/\\'/g, "'");

const missing = [];
for (const [where, value] of wasThere) {
  if (value.length < 4) continue;
  if (haystack.includes(value) || unescaped.includes(value)) continue;
  missing.push([where, value]);
}

for (const [where, value] of missing) {
  console.error(`${where}\n    "${value.slice(0, 140)}${value.length > 140 ? '…' : ''}"`);
}

console.log(
  `content-audit: ${wasThere.size} strings at ${ref}, ${missing.length} unaccounted for` +
    (missing.length ? ' — name each in the commit body or fix it' : '')
);
process.exit(missing.length === 0 ? 0 : 1);
