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

const quoteSchema = z.object({
  quote: z.string(),
  attribution: z.string().optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/pages' }),
  schema: z.object({
    heroImage: z.string().nullish(),
    heroHeading: z.string().nullish(),
    heroSubheading: z.string().nullish(),

    // Home
    introHeading: z.string().optional(),
    introText: z.string().optional(),

    // Home — the Kaaya Story teaser (build doc §8), footer-weight. Its two
    // closing links are the only route off the homepage into Place and
    // Community, so `href` is a route path and renders through `link()`.
    storyParagraphs: z.array(z.string()).optional(),
    storyLinks: z.array(z.object({
      prompt: z.string(),
      label: z.string(),
      href: z.string(),
    })).optional(),

    // Place
    section1Paragraphs: z.array(z.string()).optional(),
    section2Paragraphs: z.array(z.string()).optional(),
    section2Quote: quoteSchema.optional(),
    principles: z.array(z.object({
      number: z.number(),
      title: z.string(),
      subtitle: z.string(),
      body: z.string(),
    })).optional(),
    neighbourhoods: z.array(z.object({
      title: z.string(),
      body: z.string().optional(),
      quote: z.string().optional(),
      attribution: z.string().optional(),
      linkLabel: z.string().optional(),
      linkHref: z.string().optional(),
    })).optional(),

    // Learn + Incubate + Place sub-pages (shared field name)
    introParagraphs: z.array(z.string()).optional(),

    // Place → Activities. The single canonical home for the pottery / trails /
    // nature art / farm picnic copy that used to be split between `learn.yaml`'s
    // `sessions` and `visit.yaml`'s `facilities` (TDD decision 11).
    activities: z.array(z.object({
      title: z.string(),
      description: z.string(),
      detail: z.string().optional(),
    })).optional(),

    // Place → Stay / Booking
    stayNote: z.string().optional(),
    bookingNote: z.string().optional(),

    // Events — the empty state shown until the `events` collection lands (E8).
    emptyStateHeading: z.string().optional(),
    emptyStateBody: z.string().optional(),

    // Section homes — the sub-routes a section index points at.
    sections: z.array(z.object({
      title: z.string(),
      body: z.string(),
      href: z.string(),
    })).optional(),

    // Learn
    programs: z.array(z.object({
      duration: z.string(),
      name: z.string(),
      description: z.string(),
    })).optional(),
    programsQuote: quoteSchema.optional(),

    // Incubate
    stat1Value: z.string().optional(),
    stat1Label: z.string().optional(),
    stat2Value: z.string().optional(),
    stat2Label: z.string().optional(),
    incubations: z.array(z.object({
      name: z.string(),
      by: z.string(),
      description: z.string(),
      links: z.array(z.object({
        label: z.string(),
        href: z.string(),
      })).optional(),
    })).optional(),
    incubationsQuote: quoteSchema.optional(),

    // Exchange
    exchangeHeaders: z.array(z.string()).optional(),
    exchangeRows: z.array(z.object({
      visitorAction: z.string(),
      kaayaGain: z.string(),
      communityBenefit: z.string(),
    })).optional(),
    marketParagraphs: z.array(z.string()).optional(),
    marketQuote: quoteSchema.optional(),
    institutionHeaders: z.array(z.string()).optional(),
    institutionRows: z.array(z.object({
      engagement: z.string(),
      kaayaRole: z.string(),
      communityBenefit: z.string(),
    })).optional(),
    pillars: z.array(z.object({
      number: z.number(),
      title: z.string(),
      body: z.string(),
    })).optional(),
    partners: z.array(z.string()).optional(),
    finalQuote: quoteSchema.optional(),

    // Visit
    accommodation: z.array(z.object({
      type: z.string(),
      details: z.string(),
      capacity: z.string(),
    })).optional(),
    priceRange: z.string().optional(),
    priceNote: z.string().optional(),
    mealPlans: z.array(z.object({
      name: z.string(),
      description: z.string(),
    })).optional(),
    facilities: z.array(z.string()).optional(),
    directionsNote: z.string().optional(),
  }),
});

export const collections = { blog, pages };
