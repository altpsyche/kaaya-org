export function url(path: string): string {
  if (path.startsWith('http') || path.startsWith('//')) return path;
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
