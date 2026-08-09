export const SECTIONS = ['gallery', 'place', 'community', 'events'] as const;

const APEX = 'https://kaaya.org';

/**
 * Build-time path ('/gallery/shop') -> the public URL it is served at.
 *
 * Always absolute and never environment-dependent, because its callers run
 * where `import.meta.env.PROD` is not set. TDD §9 has the table.
 */
export function toCanonical(path: string): string {
  const [, first, ...rest] = path.split('/');
  if ((SECTIONS as readonly string[]).includes(first)) {
    return `https://${first}.kaaya.org${rest.length ? `/${rest.join('/')}` : '/'}`;
  }
  if (first === 'blog') return `https://happenings.kaaya.org${path}`;
  return `${APEX}${path}`;
}

/**
 * The href to render for an internal link. In production that is the canonical
 * subdomain URL; in dev it stays a path, because `astro dev` has no host-based
 * rewrite and serves the whole build from one origin.
 *
 * Assets do not belong here — TDD §10 keeps `/uploads/…`, `/favicon.svg` and
 * `/rss.xml` relative, since the middleware serves them unrewritten on every
 * hostname and an absolute apex URL would make a preview deploy load them from
 * production.
 */
export function link(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  return import.meta.env.PROD ? toCanonical(path) : path;
}

/**
 * A root-level asset: `/uploads/…`, `/favicon.svg`, `/rss.xml`.
 *
 * Identity, and that is the point — TDD §10 keeps these relative, because the
 * middleware serves them unrewritten on every hostname. Routing one through
 * `link()` would pin it to the apex, so a preview deploy would load production's
 * copy. Naming the two cases apart is what keeps "no bare internal `href`"
 * checkable by grep instead of by memory.
 */
export function asset(path: string): string {
  return path;
}

/**
 * Which section a path belongs to, for anything that has to vary by host —
 * the Header's active state, `ContactBlock`'s address, `SEO`'s description.
 * Derived from the path and never from an href: in a production build `link()`
 * returns an absolute cross-subdomain URL, so comparing a path against one
 * matches nothing (T2.5 records that breaking silently).
 *
 * `/blog` is `happenings` because that host serves the blog and nothing else.
 * Anything unrecognised is `home`, which is what the apex serves.
 */
export type Section = 'home' | (typeof SECTIONS)[number] | 'happenings';

export function sectionFor(pathname: string): Section {
  const first = (pathname.replace(/\/+$/, '') || '/').split('/')[1] ?? '';
  if (first === 'blog') return 'happenings';
  return (SECTIONS as readonly string[]).includes(first) ? (first as Section) : 'home';
}
