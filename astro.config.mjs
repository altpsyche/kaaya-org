// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://altpsyche.github.io',
  base: '/kaaya-org',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
