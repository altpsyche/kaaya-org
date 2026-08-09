import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../data/site';
import { toCanonical } from '../lib/links';
import type { APIContext } from 'astro';
import { SECTION_DESCRIPTION } from '../data/descriptions';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  return rss({
    title: SITE.title,
    // The feed is the blog's, so it takes the happenings description rather
    // than a site-wide one, which decision 6 removed.
    description: SECTION_DESCRIPTION.happenings,
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        // toCanonical(), never link(): a feed item is read off-site, where a
        // bare path resolves against whichever host served the feed.
        link: toCanonical(`/blog/${post.id}/`),
      })),
  });
}
