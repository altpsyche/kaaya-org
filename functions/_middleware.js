const APEX = 'kaaya.org';

// Hosts whose content lives in a same-named folder of the build.
const SECTIONS = new Set(['gallery', 'place', 'community', 'events']);

// Old kaaya.org URLs that do not simply map onto a section prefix.
const LEGACY = {
  '/learn':    `https://community.${APEX}/learn`,
  '/incubate': `https://community.${APEX}/incubate`,
  '/exchange': `https://community.${APEX}/exchange`,
  '/visit':    `https://${APEX}/#visit`,
};

// Served from the root of dist/ on every hostname — never rewritten. The `$`
// alternative covers the slash-less form: without it `/admin` on a section host
// rewrites to `/gallery/admin` and the CMS 404s on four of the six hosts.
const PASSTHROUGH = /^\/(_astro|uploads|admin)(\/|$)/;
const ROOT_FILE = /^\/[^/]+\.[a-z0-9]+$/i; // /favicon.svg, /rss.xml, /sitemap-index.xml

const redirect = (location) =>
  new Response(null, { status: 301, headers: { Location: location } });

// A route builds to `<route>/index.html`, and Pages answers the slash-less form
// with a 308 to the slash form. After a rewrite that 308's Location carries the
// internal prefix — `place.kaaya.org/stay` would advertise `/place/stay/` to the
// client, the leak TDD §6.3 exists to prevent. Rewriting straight to the slash
// form keeps the prefix inside the origin.
const asDirectory = (path) =>
  path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const host = url.hostname;
  const path = url.pathname;
  const first = path.split('/')[1] ?? '';
  const tail = () => `${path.slice(first.length + 1) || '/'}${url.search}`;

  if (host === `www.${APEX}`) {
    return redirect(`https://${APEX}${path}${url.search}`);
  }

  // Preview deploys (*.pages.dev) and `wrangler pages dev` serve the path form
  // unchanged, so the whole build stays browsable from a single origin.
  const inZone = host === APEX || host.endsWith(`.${APEX}`);
  if (!inZone) return next();

  // Shared assets are not namespaced — serve them as-is on every host.
  // This is the guard whose absence breaks the Transform Rule design (TDD §6.1).
  if (PASSTHROUGH.test(path) || ROOT_FILE.test(path)) return next();

  const sub = host === APEX ? '' : host.slice(0, -(APEX.length + 1));

  // An internal section prefix must never appear in a public URL. On the
  // section's own host it is stripped; anywhere else it moves to its host.
  // This is also the duplicate-content guard (TDD §6.3).
  if (SECTIONS.has(first)) {
    return first === sub
      ? redirect(`https://${host}${tail()}`)
      : redirect(`https://${first}.${APEX}${tail()}`);
  }

  if (SECTIONS.has(sub)) {
    url.pathname = `/${sub}${asDirectory(path)}`;
    return next(new Request(url, request));
  }

  // happenings owns /blog/* and nothing else.
  if (sub === 'happenings') {
    if (!path.startsWith('/blog')) return redirect(`https://${host}/blog`);
    url.pathname = asDirectory(path);
    return next(new Request(url, request));
  }

  if (host === APEX) {
    if (path in LEGACY) return redirect(LEGACY[path]);
    if (first === 'blog') return redirect(`https://happenings.${APEX}${path}${url.search}`);
  }

  return next();
}
