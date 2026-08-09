import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * TDD §6.2's behaviour table, one test per row. The table is the specification
 * of `functions/_middleware.js`; this file is the only thing that holds the two
 * together, since a wrong rewrite leaves the build green (§6.3 records the
 * version that shipped with the whole design broken).
 *
 * A serve row asserts the body is byte-identical to the `dist/` file the row
 * names, not merely that the status is 200 — a rewrite landing on the wrong
 * page passes a status check.
 *
 * Every row of the table now has a live test: the last three skips closed when
 * T7.5 built /shop and T8.3 imported the events.
 */

const APEX = 'kaaya.org';

/** Cloudflare's own preview origin: outside the zone, so nothing is rewritten. */
const PREVIEW_HOST = 'kaaya-org.pages.dev';

function get(request: any, host: string, url: string) {
  return request.get(url, { headers: { Host: host }, maxRedirects: 0 });
}

async function expectRedirect(request: any, host: string, url: string, location: string) {
  const response = await get(request, host, url);
  expect(response.status()).toBe(301);
  // `wrangler pages dev` proxies to a local http origin and rewrites the scheme
  // of a same-host Location to match it, while leaving a cross-host one alone.
  // Production emits https for both, so the scheme is normalised rather than
  // asserted; the host, path and hash are what the table specifies.
  expect(response.headers()['location'].replace(/^http:/, 'https:')).toBe(location);
}

async function expectServes(request: any, host: string, url: string, distFile: string) {
  const response = await get(request, host, url);
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe(fs.readFileSync(distFile, 'utf8'));
}

test.describe('apex — section prefixes move to their own host', () => {
  test('kaaya.org/ serves the homepage', async ({ request }) => {
    await expectServes(request, APEX, '/', 'dist/index.html');
  });

  test('kaaya.org/place', async ({ request }) => {
    await expectRedirect(request, APEX, '/place', 'https://place.kaaya.org/');
  });

  test('kaaya.org/place/stay', async ({ request }) => {
    await expectRedirect(request, APEX, '/place/stay', 'https://place.kaaya.org/stay');
  });

  test('kaaya.org/community/learn — leak guard', async ({ request }) => {
    await expectRedirect(request, APEX, '/community/learn', 'https://community.kaaya.org/learn');
  });

  test('kaaya.org/events — leak guard', async ({ request }) => {
    await expectRedirect(request, APEX, '/events', 'https://events.kaaya.org/');
  });

  test('kaaya.org/gallery/shop — leak guard', async ({ request }) => {
    await expectRedirect(request, APEX, '/gallery/shop', 'https://gallery.kaaya.org/shop');
  });
});

test.describe('apex — legacy URLs', () => {
  test('kaaya.org/learn', async ({ request }) => {
    await expectRedirect(request, APEX, '/learn', 'https://community.kaaya.org/learn');
  });

  test('kaaya.org/incubate', async ({ request }) => {
    await expectRedirect(request, APEX, '/incubate', 'https://community.kaaya.org/incubate');
  });

  test('kaaya.org/exchange', async ({ request }) => {
    await expectRedirect(request, APEX, '/exchange', 'https://community.kaaya.org/exchange');
  });

  test('kaaya.org/visit lands on the homepage anchor', async ({ request }) => {
    // The anchor is why `id="visit"` on the homepage is load-bearing (T1.4).
    await expectRedirect(request, APEX, '/visit', 'https://kaaya.org/#visit');
  });

  test('kaaya.org/blog', async ({ request }) => {
    await expectRedirect(request, APEX, '/blog', 'https://happenings.kaaya.org/blog');
  });

  test('kaaya.org/blog/making-of-kaaya', async ({ request }) => {
    await expectRedirect(
      request,
      APEX,
      '/blog/making-of-kaaya',
      'https://happenings.kaaya.org/blog/making-of-kaaya',
    );
  });

  test('www.kaaya.org/* keeps the path', async ({ request }) => {
    await expectRedirect(request, `www.${APEX}`, '/place/stay', 'https://kaaya.org/place/stay');
  });
});

test.describe('gallery.kaaya.org', () => {
  test('/ serves the gallery home', async ({ request }) => {
    await expectServes(request, 'gallery.kaaya.org', '/', 'dist/gallery/index.html');
  });

  test('/artist/tenzin-norbu serves the profile', async ({ request }) => {
    await expectServes(
      request,
      'gallery.kaaya.org',
      '/artist/tenzin-norbu',
      'dist/gallery/artist/tenzin-norbu/index.html',
    );
  });

  test('/shop serves the catalogue', async ({ request }) => {
    await expectServes(request, 'gallery.kaaya.org', '/shop', 'dist/gallery/shop/index.html');
  });

  test('/shop/chromatic-metanoia serves the work', async ({ request }) => {
    await expectServes(
      request,
      'gallery.kaaya.org',
      '/shop/chromatic-metanoia',
      'dist/gallery/shop/chromatic-metanoia/index.html',
    );
  });

  test('/gallery/shop — the prefix is stripped on its own host', async ({ request }) => {
    await expectRedirect(request, 'gallery.kaaya.org', '/gallery/shop', 'https://gallery.kaaya.org/shop');
  });

  test('/place moves to the place host', async ({ request }) => {
    await expectRedirect(request, 'gallery.kaaya.org', '/place', 'https://place.kaaya.org/');
  });

  test('/events moves to the events host', async ({ request }) => {
    await expectRedirect(request, 'gallery.kaaya.org', '/events', 'https://events.kaaya.org/');
  });
});

test.describe('root assets are never rewritten', () => {
  // The two rows the dropped Transform Rule design could not satisfy (§6.1):
  // without the PASSTHROUGH guard both 404 as /gallery/_astro/... on every
  // section host.
  test('/_astro/* on a section host', async ({ request }) => {
    const css = fs.readdirSync('dist/_astro').find((f) => f.endsWith('.css'));
    expect(css, 'the build emitted no CSS to assert against').toBeDefined();
    const response = await get(request, 'gallery.kaaya.org', `/_astro/${css}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe(fs.readFileSync(path.join('dist/_astro', css!), 'utf8'));
  });

  test('/uploads/* on a section host', async ({ request }) => {
    const response = await get(request, 'gallery.kaaya.org', '/uploads/16.jpg');
    expect(response.status()).toBe(200);
    expect(Buffer.from(await response.body())).toEqual(fs.readFileSync('dist/uploads/16.jpg'));
  });

  test('/admin/ reaches the CMS on a section host', async ({ request }) => {
    // PASSTHROUGH matched a trailing slash only until T2.1, so a bare /admin
    // fell through to the section rewrite and 404'd as /gallery/admin.
    await expectServes(request, 'gallery.kaaya.org', '/admin/', 'dist/admin/index.html');
  });

  test('a root file is served on a section host', async ({ request }) => {
    const response = await get(request, 'place.kaaya.org', '/robots.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe(fs.readFileSync('dist/robots.txt', 'utf8'));
  });
});

test.describe('place and events', () => {
  test('place.kaaya.org/stay serves in one hop', async ({ request }) => {
    // Not two: an extensionless rewrite target makes Pages 308 to the slash
    // form, and that Location carries the internal /place prefix — the leak
    // §6.3 exists to prevent. asDirectory() in the middleware is what stops it.
    await expectServes(request, 'place.kaaya.org', '/stay', 'dist/place/stay/index.html');
  });

  test('events.kaaya.org/ serves the events index', async ({ request }) => {
    await expectServes(request, 'events.kaaya.org', '/', 'dist/events/index.html');
  });

  test('events.kaaya.org/artistry-weekend serves the event', async ({ request }) => {
    await expectServes(
      request,
      'events.kaaya.org',
      '/artistry-weekend',
      'dist/events/artistry-weekend/index.html',
    );
  });
});

test.describe('happenings owns /blog and nothing else', () => {
  test('/ redirects to the blog', async ({ request }) => {
    await expectRedirect(request, 'happenings.kaaya.org', '/', 'https://happenings.kaaya.org/blog');
  });

  test('/blog/<slug> serves the post', async ({ request }) => {
    await expectServes(
      request,
      'happenings.kaaya.org',
      '/blog/making-of-kaaya',
      'dist/blog/making-of-kaaya/index.html',
    );
  });

  test('anything else redirects to the blog', async ({ request }) => {
    await expectRedirect(request, 'happenings.kaaya.org', '/random', 'https://happenings.kaaya.org/blog');
  });

  test('a section prefix outranks the catch-all', async ({ request }) => {
    // The table's "anything" row reads as unconditional, and it is not: the
    // leak guard runs first, so a section prefix on this host moves to that
    // section rather than to /blog.
    await expectRedirect(request, 'happenings.kaaya.org', '/place/stay', 'https://place.kaaya.org/stay');
  });
});

test('a preview host serves the path form with no redirect', async ({ request }) => {
  // Outside the zone the middleware calls next() unchanged, which is what keeps
  // the whole build browsable from one *.pages.dev origin. The slash form is
  // requested because Pages answers a slash-less directory path with its own
  // 308 — that hop is the static host, not the middleware.
  await expectServes(
    request,
    PREVIEW_HOST,
    '/gallery/artist/tenzin-norbu/',
    'dist/gallery/artist/tenzin-norbu/index.html',
  );
});
