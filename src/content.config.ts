import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string(),
    heroImage: z.string().optional(),
    categories: z.array(z.string()).optional().default([]),
    author: z.string().optional(),
    readTime: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/pages' }),
  schema: z.object({
    heroImage: z.string().nullish(),
    heroHeading: z.string().nullish(),
    heroSubheading: z.string().nullish(),
  }),
});

export const collections = { blog, pages };
