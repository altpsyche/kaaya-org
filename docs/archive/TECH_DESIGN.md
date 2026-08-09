# Kaaya Website — Technical Design

**Status:** Approved architecture, ready to implement
**Supersedes:** `kaaya_website_build_instructions_1.md` (Spec A) and `kaaya-subdomain-menu-spec.md` (Spec B)
**Stack:** Astro 7 (static) · Tailwind 4 · Decap CMS via DecapBridge · Cloudflare Pages
**Date:** 2026-08-02

---

## 1. Why this document exists

Two specs were written independently and they contradict each other on nearly every structural point. Spec A makes `kaaya.org` an art gallery and forbids a hub page by name. Spec B makes `kaaya.org` a hub of directory cards routing to five subdomains. They cannot both ship.

This document records the resolved decisions, the reasoning, and the implementation plan. Where a decision overrides one of the specs, that is stated explicitly so nobody re-litigates it from the old file.

---

## 2. Conflicts and their resolutions

| # | Question | Spec A | Spec B | **Decision** |
|---|---|---|---|---|
| 1 | What is `kaaya.org`? | The gallery itself | Hub with 4 directory cards | **Narrative root.** One scrolling story page. No card grid, no gallery takeover. |
| 2 | Subdomain set | `place`, `ecosystem` (+ `gallery` as a redirect) | `learn`, `stay`, `gallery`, `about` | **Spec B's four:** `learn`, `stay`, `gallery`, `about`. |
| 3 | Gallery | 301 redirect only | Full site | **Full site** at `gallery.kaaya.org`. |
| 4 | Booking / commerce | Contact link only | Rates, room tables, product grid | **Info-rich, contact-only.** Full tables and prices shown; every conversion is an enquiry form. No cart, no payment provider, no booking engine. |
| 5 | Cross-site navigation | Two quiet links in the footer | Persistent switcher bar above each nav | **One shared header** with the four sections and an active state. No second switcher bar — with a single build the sites are already one system. |
| 6 | Vocabulary ban on root | "circular economy", "incubation", "internships", "sustainable living" forbidden | Used freely as nav labels | **Partially kept.** See §10. The tone rules survive; the hard word-ban does not, because the root is now narrative rather than a gallery front door. |
| 7 | Farmer's / Sunday Market | Never commercial, anywhere | Listed under Exchange | **Never commercial, anywhere.** Spec A's rule stands unchanged and applies to all five hosts. |
| 8 | Repo shape | Undecided | Undecided | **Single repo, single Astro build.** |
| 9 | Hosting | Undecided | GitHub Pages | **Cloudflare Pages.** GitHub Pages allows one custom domain per repo, which is incompatible with decision 8. |
| 10 | Blog / Updates | Not mentioned | Aggregated feed on hub; blog also under Learn | **One collection, canonical at `kaaya.org/updates`.** Each section renders a filtered view. |
| 11 | Gallery Artists page | n/a | Flagged: Wix archive is empty | **Build it, ship it unlinked.** Page and CMS collection exist; the nav entry stays off until content is published. |

### What survives from Spec A

Spec A's real contribution is editorial discipline, and it is kept in full: narrative over brochure copy, no services-list voice, the market never described in commercial terms, no aggressive cross-promotion between sections. The root being a story rather than a directory is Spec A's instinct honoured in a structure Spec B can carry.

### What survives from Spec B

The information architecture, the content audit, and the source-page mapping. Four sections matching four visitor intents is the right split, and the existing repo already holds most of the copy.

---

## 3. Information architecture

Canonical URLs are the subdomains. Path form is an internal build detail (§5).

```
kaaya.org                          Narrative root
  /                                The Kaaya story, one page, inline links out
  /updates                         All posts, canonical blog index
  /updates/[slug]                  Post detail
  /contact                         Single shared enquiry endpoint

learn.kaaya.org                    Nav: Programmes · Sessions · Updates
  /                                "Learning alongside" intro, milk-journey example
  /programmes                      Duration table: 1–5 days, 1–5 weeks, ≤6 months, Summer
  /sessions                        Pottery, forest & eco trails, nature art, farm picnics
  /updates                         Posts tagged learn

stay.kaaya.org                     Nav: Accommodation · Rates & Meals · Facilities · Getting Here
  /                                Intro, "Come and see what's happening here"
  /accommodation                   Mud Huts, Family Rooms, Studio Rooms, Dormitory
  /rates                           ₹1,200–₹2,100/bed/day, meal plans (Basic, Custom)
  /facilities                      Conference hall, sit-outs, short activities list
  /getting-here                    20 km from Dehradun, address, contact

gallery.kaaya.org                  Nav: Works · Events · About      (Artists hidden at launch)
  /                                "Art from the Himalayas", featured works
  /works                           Catalogue. Filters: Artworks · Handmade · Collectibles
  /works/[slug]                    Work detail + Enquire
  /artists                         BUILT, UNLINKED — awaiting content
  /artists/[slug]                  Artist feature
  /events                          Event list (venues: Studio 1, Nature Café)
  /events/[slug]                   Event detail
  /about                           Gallery mission, contact

about.kaaya.org                    Nav: Place · Incubate · Exchange · Partners
  /                                Short "It began simply enough"
  /place                           Origin story, mud construction, K-Green Life, Annexe
  /incubate                        Plug 'n' Play, Padav Fellowship, Anutraaya
  /exchange                        Value-exchange table, Sunday Market, UMSVY/Setu Aayog, 5 pillars
  /partners                        Partner logos, Become a Partner
```

Naming note: Spec B called the gallery catalogue "Shop". Given decision 4 there is no shop — it is renamed **Works** so the URL does not promise a checkout that will not exist.

---

## 4. Hosting and routing

### One build, five hostnames

A single `astro build` produces one `dist/`. Cloudflare Pages attaches all hostnames to that one project, and a Pages Function rewrites by `Host` header so each subdomain serves its own subtree.

```
                    astro build → dist/
                          │
        ┌─────────────────┴─────────────────┐
        │   Cloudflare Pages (one project)  │
        │   functions/_middleware.js        │
        └─────────────────┬─────────────────┘
                          │  rewrite by Host
   kaaya.org         →  dist/
   learn.kaaya.org   →  dist/learn/
   stay.kaaya.org    →  dist/stay/
   gallery.kaaya.org →  dist/gallery/
   about.kaaya.org   →  dist/about/
```

### DNS

| Record | Type | Target | Notes |
|---|---|---|---|
| `kaaya.org` | CNAME (flattened) | Pages project | Apex, proxied |
| `www` | CNAME | Pages project | 301s to apex in middleware |
| `learn` | CNAME | Pages project | |
| `stay` | CNAME | Pages project | |
| `gallery` | CNAME | Pages project | |
| `about` | CNAME | Pages project | |

All six added as Custom Domains on the same Pages project. `public/CNAME` is a GitHub Pages artifact and should be deleted.

### Middleware

`functions/_middleware.js` — Cloudflare Pages picks this up from the repo root automatically; it sits outside `dist/` and needs no Astro configuration.

```js
const SECTIONS = new Set(['learn', 'stay', 'gallery', 'about']);

// Never rewrite these — they are served from the root of dist/ on every host.
const PASSTHROUGH = /^\/(_astro|uploads|admin|assets)\//;
const HAS_EXTENSION = /\.[a-z0-9]+$/i;

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const host = url.hostname;
  const segments = url.pathname.split('/');
  const first = segments[1];

  // www → apex
  if (host === 'www.kaaya.org') {
    return Response.redirect(`https://kaaya.org${url.pathname}${url.search}`, 301);
  }

  const sub = host.endsWith('.kaaya.org')
    ? host.slice(0, -'.kaaya.org'.length)
    : null;

  if (sub && SECTIONS.has(sub)) {
    // Shared assets are not namespaced — serve them as-is.
    if (PASSTHROUGH.test(url.pathname) || HAS_EXTENSION.test(url.pathname)) {
      return next();
    }
    // A section path reached on the wrong host: send it to the right one.
    if (SECTIONS.has(first)) {
      const rest = url.pathname.slice(first.length + 1) || '/';
      return Response.redirect(`https://${first}.kaaya.org${rest}${url.search}`, 301);
    }
    url.pathname = `/${sub}${url.pathname}`;
    return next(new Request(url, request));
  }

  // Apex: section paths belong on their subdomain.
  if (SECTIONS.has(first)) {
    const rest = url.pathname.slice(first.length + 1) || '/';
    return Response.redirect(`https://${first}.kaaya.org${rest}${url.search}`, 301);
  }

  return next();
}
```

The `PASSTHROUGH` guard is the part that is easy to get wrong. Astro emits absolute asset references like `/_astro/index.abc.css`. Without the guard, a request for that on `learn.kaaya.org` would be rewritten to `/learn/_astro/index.abc.css` and 404. Every hashed asset, upload, and the CMS admin bundle lives at the root of `dist/` and must bypass the rewrite on all hosts.

The two `Response.redirect` branches are what prevent duplicate content: exactly one hostname can serve any given page, and the other one 301s to it.

### Build settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 |
| Root directory | `/` |

`.github/workflows/deploy.yml` is deleted — Cloudflare Pages builds from the Git integration directly.

---

## 5. Links and canonical URLs

Because one build serves five hostnames, a bare `/stay/rates` link is ambiguous: on `learn.kaaya.org` the middleware would read it as a section path and redirect, and in local dev there is no middleware at all. The rule that removes the ambiguity:

**Every internal link goes through the `link()` helper. No hand-written internal `href` strings.**

`src/lib/links.ts`:

```ts
export const SECTIONS = ['learn', 'stay', 'gallery', 'about'] as const;
export type Section = (typeof SECTIONS)[number];

const APEX = 'https://kaaya.org';

/**
 * Takes a build-time path ('/stay/rates') and returns the URL to link to.
 * In production that is the canonical subdomain URL; in dev it stays a path,
 * because the dev server has no host-based rewrite.
 */
export function link(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  if (!import.meta.env.PROD) return path;

  const [, first, ...rest] = path.split('/');
  if ((SECTIONS as readonly string[]).includes(first)) {
    const tail = rest.length ? `/${rest.join('/')}` : '/';
    return `https://${first}.kaaya.org${tail}`;
  }
  return `${APEX}${path}`;
}
```

This replaces `src/lib/url.ts`, whose `BASE_URL` prefixing is a GitHub Pages subpath workaround that no longer applies.

`SEO.astro` derives its canonical from the same function, so the canonical tag always names the subdomain even though the page was built at a path. `SITE.url` in `src/data/site.ts` must change from `https://www.kaaya.org` to `https://kaaya.org` — it currently disagrees with `public/CNAME`, which is a live bug that would emit canonicals pointing at a host that 301s away.

Sitemap needs the same mapping, otherwise it advertises the path URLs that the middleware redirects away from:

```js
sitemap({
  serialize: (item) => ({ ...item, url: link(new URL(item.url).pathname) }),
})
```

---

## 6. Repo structure

```
functions/
  _middleware.js            NEW — host-based routing
src/
  pages/
    index.astro             Narrative root
    contact.astro           NEW
    updates/
      index.astro           NEW — replaces /blog
      [...slug].astro       Moved from blog/
    learn/
      index.astro           From learn.astro
      programmes.astro      NEW — split out of learn.astro
      sessions.astro        NEW — split out of learn.astro
      updates.astro         NEW — filtered view
    stay/
      index.astro           From visit.astro
      accommodation.astro   NEW — split out of visit.astro
      rates.astro           NEW — split out of visit.astro
      facilities.astro      NEW — split out of visit.astro
      getting-here.astro    NEW — split out of visit.astro
    gallery/
      index.astro           NEW
      works/
        index.astro         NEW
        [slug].astro        NEW
      artists/
        index.astro         NEW — built, unlinked
        [slug].astro        NEW
      events/
        index.astro         NEW
        [slug].astro        NEW
      about.astro           NEW
    about/
      index.astro           NEW
      place.astro           From place.astro
      incubate.astro        From incubate.astro
      exchange.astro        From exchange.astro — Partners section removed
      partners.astro        NEW — Partners split out of exchange
    rss.xml.ts              Keep, point at updates
    404.astro               Keep
  components/
    common/
      Header.astro          Rewritten — section-aware nav
      Footer.astro          Keep, shared across all hosts
      SEO.astro             Canonical via link()
      ThemeToggle.astro     Keep
    ui/                     Existing 15 components, mostly reusable
      EnquiryForm.astro     NEW
      WorkCard.astro        NEW
      EventCard.astro       NEW
  lib/
    links.ts                NEW — replaces url.ts
    utils.ts                Keep
  data/
    site.ts                 url → https://kaaya.org
  content/
    pages/                  YAML, one per page (expanded)
    blog/                   Markdown posts, + section field
    works/                  NEW
    artists/                NEW
    events/                 NEW
public/
  admin/config.yml          Extended collections
  CNAME                     DELETE — GitHub Pages artifact
```

Section splitting is mechanical: the existing `learn.astro` and `visit.astro` are long single pages whose sections map one-to-one onto the new routes. The content already exists in `src/content/pages/*.yaml`; the work is routing and layout, not rewriting copy.

### Header

One header component, driven by which section the current route sits in. It renders the four section links, marks the current one active, and renders that section's own sub-nav beneath. On the narrative root there is no sub-nav. This is decision 5: one header doing both jobs rather than a switcher bar stacked on a nav.

---

## 7. Content model

### Existing collections

`blog` gains a `section` field (`learn` | `stay` | `gallery` | `about` | `kaaya`) so the root `/updates` can show everything while each section filters to its own. `pages` keeps its current shape and gains entries for the new routes.

### New collections

```ts
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    artist: z.string().optional(),
    category: z.enum(['artworks', 'handmade', 'collectibles']),
    price: z.string().optional(),      // display only — no checkout
    available: z.boolean().default(true),
    images: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    description: z.string().optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artists' }),
  schema: z.object({
    name: z.string(),
    portrait: z.string().optional(),
    origin: z.string().optional(),
    featuredMonth: z.string().optional(),
    published: z.boolean().default(false),   // gates the hidden Artists page
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    venue: z.enum(['Studio 1', 'Nature Café']).or(z.string()),
    heroImage: z.string().optional(),
    rsvpNote: z.string().optional(),   // contact-only, no ticketing
  }),
});
```

`price` is a string, not a number, and no code sums it or passes it anywhere. That is deliberate: it makes decision 4 structural rather than a matter of remembering not to build checkout.

`artists.published` is what keeps the Artists page shippable while empty — the page builds, lists only published entries, and the nav link is added when that list is non-empty.

### CMS

DecapBridge already handles auth (`public/admin/config.yml` points at `auth.decapbridge.com`), so the Cloudflare move needs no OAuth proxy — Spec B's open item 2 is already solved. Two changes: `site_url` becomes `https://kaaya.org`, and the new folder collections are added alongside the existing `pages` and `blog` file collections.

Editors keep one login at `kaaya.org/admin` for all five sites. This is the main practical dividend of the single-repo decision.

---

## 8. Migration and redirects

Live URLs that must not break. Handled in `functions/_middleware.js` as a lookup checked before the section logic.

| Old | New |
|---|---|
| `kaaya.org/place` | `about.kaaya.org/place` |
| `kaaya.org/incubate` | `about.kaaya.org/incubate` |
| `kaaya.org/exchange` | `about.kaaya.org/exchange` |
| `kaaya.org/learn` | `learn.kaaya.org/` |
| `kaaya.org/visit` | `stay.kaaya.org/` |
| `kaaya.org/blog` | `kaaya.org/updates` |
| `kaaya.org/blog/[slug]` | `kaaya.org/updates/[slug]` |
| `kaayagallery.com/*` | `gallery.kaaya.org/*` |
| `kaayagallery.com/category/all-products` | `gallery.kaaya.org/works` |
| `kaayagallery.com/event-list` | `gallery.kaaya.org/events` |

`/place`, `/learn`, `/incubate`, `/exchange` and `/visit` are all indexed today, so these are 301s, permanently, not a temporary shim.

`kaayagallery.com` is a separate registrable domain and needs its own Cloudflare zone with a Bulk Redirect rule; it cannot be served by the Pages middleware. Wix product data and images must be exported into `src/content/works/` and `public/uploads/` before that redirect is switched on.

---

## 9. Build phases

**Phase 1 — Routing foundation.** Cloudflare Pages project, six custom domains, `functions/_middleware.js`, `src/lib/links.ts`, `SEO.astro` and sitemap on canonical URLs, `site.ts` apex fix, delete `public/CNAME` and the GitHub Actions workflow. Verify with the existing pages before restructuring anything — a wrong rewrite rule is much easier to find with six pages than sixty.

**Phase 2 — Restructure what exists.** Move `place`/`incubate`/`exchange` under `about/`, split `learn.astro` and `visit.astro` into their section routes, split Partners out of Exchange, move `/blog` to `/updates` with the `section` field. Wire the redirect table. No new content — this phase should be provably behaviour-preserving.

**Phase 3 — Narrative root.** Rewrite `index.astro` as the story page with inline links out. Retire `NavCard` from the homepage. This is where decision 1 actually lands.

**Phase 4 — Gallery.** New collections and routes, Wix export, `EnquiryForm`, Artists built and unlinked, `kaayagallery.com` redirect zone.

**Phase 5 — Editorial pass.** Apply §10 across every page, add the CMS collections, hand over.

Phases 1 and 2 are prerequisites for everything. Phases 3 and 4 are independent of each other and can run in parallel.

---

## 10. Tone and content rules

These apply to every host and are the part of Spec A that survives intact.

1. Narrative sentences over bullet-pointed feature lists. Exceptions where a list is genuinely the clearest form: the programme duration table, the accommodation table, the rates table, and Get Involved.
2. No page reads like a services brochure.
3. The Sunday / farmer's market is never described in commercial terms anywhere. No commission rates, no vendor fees, no shop-style listings. It is "a window Kaaya opens to the surrounding community".
4. Cross-links between sections are quiet and factual. Each section reads as complete on its own; none aggressively promotes another.
5. The narrative root tells the story. It does not list the sections as four equivalent options — that is the failure mode Spec A was written to prevent, and it survives the change of root format.

On decision 6, the vocabulary ban: Spec A forbade "circular economy", "incubation", "internships" and "sustainable living" on `kaaya.org` because the root was going to be a gallery, where that language would read as institutional throat-clearing over the art. The root is now the story of the place, so the ban no longer fits — the root is precisely where that story gets told. What is kept is the reason behind the rule: this language must read as description of something being practiced, never as a pitch. Note that `site.ts` currently carries `description: 'A small experiment in sustainable living'`, which is a good example of the acceptable register.

---

## 11. Open items

| # | Item | Owner | Blocks |
|---|---|---|---|
| 1 | Wix export — 5 products, images, event history | Content | Phase 4 |
| 2 | Artist features written and published | Content | Artists nav link only |
| 3 | Photography direction for section heroes | Whoever produces visual assets | Nothing — gradients hold |
| 4 | Where enquiry form submissions go — email relay, Formspree, or a Pages Function | Tech lead | Phase 4 |
| 5 | `kaayagallery.com` zone added to Cloudflare | Tech lead | Phase 4 redirect |
| 6 | Root narrative copy — does the story get rewritten or assembled from existing `/place` copy? | Content | Phase 3 |

Item 4 is the only one that could quietly reintroduce a backend. Recommendation: a Pages Function posting to email. It stays in this repo, needs no third-party account, and cannot grow into a booking system by accident.

---

## Appendix — retired specs

`kaaya_website_build_instructions_1.md` and `kaaya-subdomain-menu-spec.md` should be moved to `docs/archive/` once Phase 1 lands. They are useful as a record of the content audit and the editorial reasoning, but they are no longer buildable instructions and leaving them at the repo root invites someone to follow them.
