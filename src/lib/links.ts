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
