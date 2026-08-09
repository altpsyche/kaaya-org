import { defineConfig } from '@playwright/test';

/**
 * The suite runs against `wrangler pages dev dist`, not `astro dev`.
 *
 * Neither of the two things this repo has to test exists under `astro dev`:
 * `functions/_middleware.js` never runs there, so every routing row of TDD §6.2
 * is unassertable, and `link()` returns bare paths in dev, so nav hrefs are not
 * the absolute cross-subdomain URLs production serves. Both only appear in a
 * production build behind the middleware.
 *
 * `--compatibility-date` is pinned because wrangler refuses to start when the
 * date is newer than its own binary supports, and it otherwise defaults to
 * today. `wrangler` is a devDependency (T10.6), so `npx` resolves the pinned
 * version out of node_modules rather than fetching one — which is what makes
 * the date above auditable against a known binary instead of whatever npx
 * happened to download.
 */
const PORT = 8788;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run build && npx wrangler pages dev dist --port ${PORT} --ip 127.0.0.1 --compatibility-date=2026-08-08`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
