import { test, expect } from '@playwright/test';

/**
 * Proves the harness itself: the build is served, the middleware is in front of
 * it, and an explicit Host header reaches the worker. Everything downstream —
 * the routing table (T10.2) and the per-section smoke tests (T10.3) — depends
 * on those three facts, so they are asserted once here rather than assumed.
 */
test('the apex serves the homepage', async ({ request }) => {
  const response = await request.get('/', { headers: { Host: 'kaaya.org' } });
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('id="visit"');
});

test('the middleware is running in front of the build', async ({ request }) => {
  // A bare /place on the apex is a section prefix, which only the middleware
  // rewrites. Served straight from dist/ it would return the page instead.
  const response = await request.get('/place', {
    headers: { Host: 'kaaya.org' },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(301);
  expect(response.headers()['location']).toContain('place.kaaya.org/');
});
