// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { toCanonical } from './src/lib/links.ts';

export default defineConfig({
  site: 'https://kaaya.org',
  integrations: [
    sitemap({
      // toCanonical(), never link(): `import.meta.env.PROD` is unset in config
      // context, so link() would take its dev branch and emit bare paths.
      // Left alone, @astrojs/sitemap bakes `site` into every URL and advertises
      // kaaya.org/gallery/shop — the URL the middleware 301s away from.
      serialize: (item) => ({ ...item, url: toCanonical(new URL(item.url).pathname) }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
