/**
 * Build doc §9 bans four phrases from kaaya.org and gallery.kaaya.org. They are
 * allowed, and expected, on community.kaaya.org.
 *
 * Usage: node scripts/gate/banned-vocab.mjs        (run after `npm run build`)
 *
 * Exits non-zero on a hit.
 *
 * This runs over built HTML rather than source YAML because the violation this
 * check exists for lived in shared chrome, not page copy: `SITE.description`
 * renders into the meta description of any page that passes no description of
 * its own, and no grep over `src/content/` reaches it.
 *
 * `404.html` is in scope even though it is not a kaaya.org page. One build
 * serves six hostnames and an unmatched path on the gallery host resolves to
 * that same file, so a banned phrase in it appears on gallery.kaaya.org.
 */
import fs from 'node:fs';
import path from 'node:path';

const PHRASES = ['circular economy', 'incubation', 'internships', 'sustainable living'];

/** Everything reachable on kaaya.org or gallery.kaaya.org. */
const SCOPE = ['dist/index.html', 'dist/404.html', 'dist/gallery'];

function htmlFiles(target) {
  if (!fs.existsSync(target)) return [];
  if (fs.statSync(target).isFile()) return [target];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .flatMap((e) => htmlFiles(path.join(target, e.name)))
    .filter((f) => f.endsWith('.html'));
}

const files = SCOPE.flatMap(htmlFiles);
if (files.length === 0) {
  console.error('banned-vocab: nothing to check — run `npm run build` first');
  process.exit(1);
}

const hits = [];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const phrase of PHRASES) {
      const at = line.toLowerCase().indexOf(phrase);
      if (at !== -1) {
        hits.push({ file, line: i + 1, phrase, context: line.slice(Math.max(0, at - 40), at + 60).trim() });
      }
    }
  });
}

for (const h of hits) console.error(`${h.file}:${h.line}  "${h.phrase}"  …${h.context}…`);

console.log(
  hits.length === 0
    ? `banned-vocab: 0 hits across ${files.length} files on kaaya.org + gallery.kaaya.org`
    : `banned-vocab: ${hits.length} hit(s) — see above`
);
process.exit(hits.length === 0 ? 0 : 1);
