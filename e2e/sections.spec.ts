import { test, expect } from '@playwright/test';

/**
 * One smoke test per section host (T10.3): the section's own page loads, row 1
 * carries the five cross-site links as absolute cross-subdomain URLs, the
 * current section is marked active, and row 2 matches TDD §5's table.
 *
 * Asserted over the fetched HTML rather than through a browser page, because
 * `Host` is a forbidden header for a browser fetch and every one of these
 * behaviours depends on which host asked. `link()` returns bare paths under
 * `astro dev`, so only a production build behind the middleware shows them.
 */

const ROW1 = [
  ['Gallery', 'https://gallery.kaaya.org/'],
  ['Place', 'https://place.kaaya.org/'],
  ['Community', 'https://community.kaaya.org/'],
  ['Events', 'https://events.kaaya.org/'],
  ['Happenings', 'https://happenings.kaaya.org/blog'],
] as const;

/** Row 2 per §5's table, complete since T7.5 built /shop. */
const SECTIONS = [
  { name: 'home', host: 'kaaya.org', url: '/', active: null, row2: [] },
  { name: 'gallery', host: 'gallery.kaaya.org', url: '/', active: 'Gallery', row2: ['Shop', 'Artist'] },
  {
    name: 'place',
    host: 'place.kaaya.org',
    url: '/stay',
    active: 'Place',
    row2: ['Story', 'Activities', 'Stay', 'Booking'],
  },
  {
    name: 'community',
    host: 'community.kaaya.org',
    url: '/learn',
    active: 'Community',
    row2: ['Learn', 'Incubate', 'Exchange'],
  },
  { name: 'events', host: 'events.kaaya.org', url: '/', active: 'Events', row2: [] },
  {
    name: 'happenings',
    host: 'happenings.kaaya.org',
    url: '/blog',
    active: 'Happenings',
    row2: [],
  },
] as const;

/** The label carrying `aria-current="page"` in row 1, or null when none does. */
function activeSection(html: string) {
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  const match = header.match(/aria-current="page"[^>]*>([^<]+)</);
  const label = match?.[1];
  return ROW1.some(([name]) => name === label) ? label : null;
}

/** Row 2's labels, in order. Empty when the host renders no section nav. */
function row2Labels(html: string, section: string) {
  const open = html.indexOf(`aria-label="${section} section"`);
  if (open === -1) return [];
  const nav = html.slice(open, html.indexOf('</nav>', open));
  return [...nav.matchAll(/aria-current="page"[^>]*>([^<]+)<|class="[^"]*">([^<]+)</g)].map(
    (m) => (m[1] ?? m[2]).trim(),
  );
}

for (const { name, host, url, active, row2 } of SECTIONS) {
  test(`${name}: page loads, row 1 is absolute, row 2 matches §5`, async ({ request }) => {
    const response = await request.get(url, { headers: { Host: host }, maxRedirects: 0 });
    expect(response.status(), `${host}${url} should serve, not redirect`).toBe(200);
    const html = await response.text();

    for (const [label, href] of ROW1) {
      expect(html, `row 1 is missing ${label} as an absolute URL`).toContain(`href="${href}"`);
    }
    // A bare path in the header would mean link() took its dev branch, which is
    // the failure mode this suite exists to catch on a section host.
    expect(html.slice(html.indexOf('<header'), html.indexOf('</header>'))).not.toMatch(
      /href="\/(gallery|place|community|events|blog)/,
    );

    expect(activeSection(html)).toBe(active);
    expect(row2Labels(html, name)).toEqual(row2);
  });
}
