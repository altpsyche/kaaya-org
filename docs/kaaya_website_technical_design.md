# Kaaya Website — Technical Design Document

**Companion to:** [`kaaya_website_build_instructions (final).md`](./kaaya_website_build_instructions%20(final).md)
**Backlog:** [`kaaya_website_implementation_tasks.md`](./kaaya_website_implementation_tasks.md)
**Gallery source content:** [`scrape/data_www_kaayagallery_com_part_1.md`](./scrape/data_www_kaayagallery_com_part_1.md)
**Status:** v7 — reviewed twice against the live repo and the gallery source data. Every design question is resolved; what remains open is content only (§18).
**History:** v1–v2 proposed a 5-app monorepo on 5 Cloudflare Pages projects (dropped, §7). v3 simplified to one project with edge Transform Rules. v4 replaced those with an in-repo Pages Function after review found they break asset delivery (§6.1). v5 resolved 13 open decisions and added the gallery content inventory (§4). v6 closed a completeness review: detail routes, the navigation spec (§5), the restored migration map (§13), a `link()` bug that would have silently broken the sitemap (§9), and four dependency contradictions in the backlog. v7 promotes Events to its own host (decision 18) — v6 had split the same collection across two section pages, which was confusing to author and to navigate.

---

## 1. Goal

Turn the current single-domain Astro site (`kaaya.org`, 6 flat pages) into the multi-site structure of the build instructions doc: a homepage/hero shell at `kaaya.org` plus five subdomains — `gallery`, `place`, `community`, `events` and `happenings` — with every existing URL 301-redirected to its new home, and **without** a second repo, a monorepo split, or multiple hosting deployments.

Build doc §1 names four subdomains. `events` is the fifth, added by decision 18.

---

## 2. Decisions log

Every design question, resolved. Recorded here so they are not re-litigated.

| # | Question | Decision | Reasoning |
|---|---|---|---|
| 1 | How does host-based routing work? | **`functions/_middleware.js` in this repo.** Not Cloudflare Transform Rules. | v3's Transform Rules rewrite the *whole* path, so every root-level asset 404s on the rewritten hosts (§6.1). Middleware fixes that with one guard, and unlike dashboard rules it is version-controlled, reviewable, and runnable locally. |
| 2 | Is the catalogue real commerce? | **Enquiry-only.** No payment provider, no cart state, no backend. Prices are display strings. | Confirmed knowingly: the live Wix gallery has working Add to Cart / Buy Now on all 5 artworks, so this *removes* functioning checkout rather than declining to build it. For one-of-a-kind originals up to ₹12,000 with size and medium variants, an enquiry is the better sales motion. |
| 3 | Is `place.kaaya.org` one page or several? | **Real sub-routes:** `/story`, `/activities`, `/stay`, `/booking`. | v3 rewrote the whole host to one page, making build doc §5's four sections unlinkable and unindexable. Sub-routes also make `place` behave like `gallery` and `community`, so one rewrite rule covers all three. |
| 4 | What is the catalogue called? | **Shop** — `gallery.kaaya.org/shop`. | Familiar and immediately understood. Note the tension with decision 2: the label implies a checkout every button will refuse, so the enquiry framing must be explicit on the page itself, not only in the button label. Build doc §4's small cart icon does not apply — there is no cart. |
| 5 | Where do enquiries go? | **Web3Forms, for all four forms.** | Already running in production on `incubate.astro` and `exchange.astro`. Unified, no half-and-half. Delivery, retries and spam filtering stay the vendor's problem. |
| 6 | `SITE.description` is a banned phrase | **Per-host descriptions.** The single global string goes away. | "A small experiment in sustainable living" is one of the four phrases build doc §9 bans from `kaaya.org` and `gallery.kaaya.org`, and it renders in the meta description of every page on every host. Per-host defaults remove the class of problem rather than patching one string. |
| 7 | "Studios" vs "Studio Rooms" | **Studios keeps the name** (artist residency cottages). The visitor accommodation becomes **Garden Rooms**. | Studios is accurate — those cottages contain working studios. The collision moves off the thing whose name carries meaning. |
| 8 | Studios residency terms are unknown | **Ship the story, defer the terms.** | Studios appear on Gallery → Artist as the residency narrative and as a row in the Stay table, with enquiry as the only next step. Nothing published that is not settled. |
| 9 | `place.kaaya.org` booking inbox | **New `info@kaaya.org`**, per build doc §9. | Separates stay enquiries from partnership enquiries. Must exist and be monitored before cutover, or bookings vanish. |
| 10 | Gallery inbox | **`gallery@kaaya.org`**, overriding build doc §9's `art@`. | Already published on the live gallery site alongside `+918279959201`. Home's printed contact address stays `art@kaaya.org`. |
| 11 | Learn / Activities content overlap | **Canonical on Place → Activities.** | Pottery, forest & eco trails, nature art and farm picnics live in full at `place.kaaya.org/activities`, matching build doc §5. Learn keeps the structured programmes table and links across. The descriptions physically move out of `learn.yaml` (§13). |
| 12 | Incubate form fields | **Keep the live form as-is.** | Live has Name*, Phone, "About you in short"*, "Your idea brief"*, "Your work / doc / video link". Build doc §6 specified Name, Age, Phone, Brief idea — written without sight of the live form, which is richer and already collecting applications. No Age field. |
| 13 | `kaayagallery.com` | **Out of scope.** No zone, no redirects, no DNS work. | The domain is being retired. The scrape is a content source only. |
| 14 | Detail routes | **Every repeating entity gets its own page:** `/shop/[slug]`, `/artist/[slug]`, `/events/[slug]`. | The content is 5 artworks with full descriptions, 6 substantial biographies and 3 events with their own copy. Wix already had a page per work and per artist. Without detail routes a ₹12,000 artwork cannot be linked to, and the Studios cross-link has no artist page to point at. |
| 15 | Art page vs Shop page | **Merged. There is no `/art` route.** The gallery home carries the exhibition narrative; `/shop` is the works catalogue. | With 5 works, two list pages over the same collection is near-duplicate content on one host. Departs from build doc §4's Art nav item — recorded in that document's amendments block. |
| 16 | Does the homepage have a form? | **No.** `ContactBlock` prints the address; there is no form on `kaaya.org`. | Build doc §8 specifies footer-weight Visit info — hours, directions, contact. That is an address, not a form. Four forms total, three access keys. |
| 17 | How unified is `EnquiryForm`? | **Shared shell, per-section fields.** The component owns the plumbing; each page passes its own field set. | DRY applies to the mechanism, not the questions. Booking needs dates and guest count; Shop needs a work reference; Incubate needs a portfolio link. Forcing one field set would push structured data into a free-text box. |
| 18 | Where do events live? | **`events.kaaya.org`** — a fifth section host. Not a page under Gallery and another under Community. | v6 had one `events` collection rendered by two section pages, which meant an editor had to know which host an event "belonged" to, and a visitor had to know too. One canonical home for every event, categorised on the page. Gallery and Community each *feature* their own on their section home, linking into `events.kaaya.org`. |
| 19 | Which host serves the thank-you page? | **One page, `kaaya.org/thank-you`, carrying `noindex`.** Every form on every host redirects to that one absolute URL. It is not reachable at `gallery.kaaya.org/thank-you` and is not meant to be. | The middleware rewrites any unprefixed path on a section host into that section's folder (§6.2), so `gallery.kaaya.org/thank-you` resolves to `dist/gallery/thank-you` and 404s. Serving it on all six would mean either a routing exception beside `PASSTHROUGH` or five more built pages, and either way six public URLs for one page — duplicate content on the one page with nothing to say. A form's redirect is an absolute URL, so the apex copy is reachable from every host regardless, and the apex is the thin front door whose row 1 nav leads straight back into the section the visitor came from. `noindex` keeps the URL out of search, where a thank-you page has no business appearing. **Which enquiry was received is carried as a query parameter** and read client-side: the build is static, so `Astro.url.searchParams` is empty at build time, and a page that named the form in its HTML would need one build per form. |
| 20 | How are the catalogue images optimised? | **A build-time `sharp` pass over `public/uploads/`**, writing webp derivatives to a generated `public/uploads/derived/`. The originals stay exactly where §10 puts them and are never deleted. | The images are photographs saved at full camera resolution: the five artworks are 2.2–3.0 MB each, so `kaaya.org` costs 7.8 MB of imagery and the gallery home 13.5 MB before any other asset loads, and `place.kaaya.org/stay` carries a 3.0 MB hero (T7.9). Astro's optimiser is not available here — `<Image>` only reaches files under `src/assets/`, and moving gallery imagery there contradicts §10 and takes it out of Decap's reach, which is the one thing §10's first bullet exists to protect. Cloudflare Image Resizing (`/cdn-cgi/image/…`) is rejected for a different reason: it is a zone-level paid feature that does not exist under `wrangler pages dev`, so no gate in this repo could see it and every check would have to wait for cutover. A build-time pass runs locally, in CI and on Pages identically, and `sharp` is already an Astro dependency, so it adds no runtime dependency. **A missing derivative must degrade, not break:** the emitting component checks which derivatives exist at build time and falls back to a plain `<img>` on the original, so a fresh CMS upload — which Decap writes as an original with no derivative — renders correctly, and so does a checkout where the pass has not run. |

---

## 3. Current state (verified against the repo, 2026-08-09)

- **Framework:** Astro 7.0.3, single project. `astro.config.mjs` sets `site: 'https://kaaya.org'`, integrations `[sitemap()]`, Tailwind 4 via `@tailwindcss/vite`. Node `>=22.12.0`. `build.format` is left at its default, `'directory'` — pages emit `<route>/index.html`.
- **Pages:** `src/pages/{index,place,learn,incubate,exchange,visit,404}.astro`, `src/pages/blog/`, `src/pages/rss.xml.ts`. No `gallery` route.
- **Content:** per-page YAML in `src/content/pages/*.yaml` (6 files), blog markdown in `src/content/blog/` (3 posts). One `pages` collection with a single flat schema of ~40 optional fields shared across every page.
- **Components:** `common/{Header,Footer,SEO,ThemeToggle}.astro`; 15 presentational `ui/*` components — reusable, not throwaway. `ContactBlock` and `CategoryFilter` already exist. `Header.astro` carries a flat 6-item nav (Place, Learn, Incubate, Exchange, Visit, Blog) that §5 replaces.
- **Forms:** `incubate.astro` and `exchange.astro` already POST to `https://api.web3forms.com/submit` with a shared `access_key`, subjects "Incubate Inquiry" and "Partner Inquiry". This is the existing enquiry pipeline and decision 5 extends it. Neither form has a honeypot, any other spam control, or a success-redirect — on submit the visitor lands on Web3Forms' own page.
- **Media:** `public/uploads/`, referenced by relative `/uploads/...`, uploaded via CMS.
- **CMS:** DecapCMS at `public/admin/config.yml`, git-gateway via DecapBridge, backend repo `altpsyche/kaaya-org`, branch `main`.
- **Deploy:** GitHub Pages — `.github/workflows/deploy.yml`. `public/CNAME` = `kaaya.org`.

### 3.1 Live defects found during review

These exist in `main` today, independent of the restructure. Several would silently corrupt the migration if carried forward.

| # | Defect | Evidence | Impact |
|---|---|---|---|
| D1 | `SITE.url` is `https://www.kaaya.org`, but `public/CNAME` is `kaaya.org` | `src/data/site.ts` | Every canonical and `og:url` points at a hostname that will 301 away. Search engines are being told the wrong canonical right now. |
| D2 | CMS `site_url` is `https://altpsyche.github.io/kaaya-org` | `public/admin/config.yml` | Stale GitHub Pages URL. Decap's "View live" links are already broken. |
| D3 | `SEO.astro` references `/og-default.png`, which does not exist | `public/` holds only `admin/`, `CNAME`, `favicon.ico`, `favicon.svg`, `uploads/` | Every page emits an `og:image` that 404s — no preview card on any share. |
| D4 | `playwright` is installed, not `@playwright/test` | `package.json`; `node_modules/@playwright` absent | `npx playwright test` cannot run. |
| D5 | `src/lib/url.ts` prefixes `import.meta.env.BASE_URL` | `src/lib/url.ts` | A GitHub Pages subpath workaround, currently a no-op since no `base` is set. Dead code that looks load-bearing. Replaced by §9. |
| D6 | No `robots.txt` | `public/` | One build on six hostnames, nothing steering crawlers. |
| D7 | `learn.yaml`'s session links point at `/visit` | `src/content/pages/learn.yaml` | `/visit` is deleted by the restructure. Three links break at cutover unless repointed (decision 11). |
| D8 | Live forms have no success redirect | `incubate.astro`, `exchange.astro` | Submitting drops the visitor on Web3Forms' branded confirmation page, off the Kaaya site entirely. |

Noted but not blocking: the `pages` collection schema is one flat union of ~40 optional fields, so nothing prevents `programs` appearing on `place` or `pillars` on `home`, and adding gallery and community pages grows it further. Splitting it into per-page schemas is optional cleanup — do it before or well after the migration, not during.

---

## 4. Gallery source content

Earlier drafts called Gallery "net-new, zero existing content". That is wrong. `docs/scrape/data_www_kaayagallery_com_part_1.md` is a scrape of the live Wix gallery and contains real, usable content. The domain itself is out of scope (decision 13) — this is a content source only.

**Migrating:**

| What | Detail |
|---|---|
| 5 artworks | Chromatic metanoia ₹12,000 (Vijay Vikram Singh) · The fox within ₹400 (Rishabh Rawat) · The rhythms of the coastal line ₹400 (Kashish Riyaz) · Hampta pass trek ₹400 (Chetan Joshi) · Living through it ₹250 (Nisha Chauhan). Each has a full description, medium and size. |
| 6 artist biographies | Rishabh Rawat, Tenzin Norbu, Vijay Vikram Singh, Nisha Chauhan, Kashish Riyaz, Chetan Joshi. Substantial paragraphs covering training, region and practice. |
| Mission and hero copy | "Art from the Himalayas"; the mission statement about value staying close to the place it came from; the Padav Fellowship / Bangani Art Foundation origin; the founder quote about ordinary people and original art. |
| Artist of the Month | Tenzin Norbu, "The Visionary of Mustang", with 6 named works. A recurring slot — it needs an owner or it goes stale. |
| 3 events | Himalayan Painting Masterclass · Artistry Weekend · Taste of the Himalayas. Titles, descriptions and venues (Studio 1, Nature Café) are real. |

**Not migrating:** the 3 generic SEO blog posts, the 2 junk test posts ("Sugam"/"Newdcfy", "HELOOW"/"VAFBAB"), and the Handmade and Collectibles categories, which hold 0 products.

**Must be replaced before publishing — Wix placeholder data:** all three events carry the date `08 Aug 2026, 1:41 am – 3:41 am` and the address `123 Art Ln, Sweetwater, TN 37874, USA`. Real dates and the Kaaya campus address are required. Hard gate on the events pages.

Images live on `static.wixstatic.com` and must be pulled into `public/uploads/` — those URLs stop being a dependency the moment that domain goes.

---

## 5. Navigation

Nothing in v3–v5 specified this, and `Header.astro` still carries the old flat 6-item nav. One `Header` component serves all six hosts, driven by which section the current route sits in.

**Row 1 — cross-site nav, on every host.** The five sections, with the current one marked active. Gallery listed first and slightly emphasised per build doc §8. Every href goes through `link()` (§9), so in production these are absolute cross-subdomain URLs and in dev they stay paths.

> Gallery · Place · Community · Events · Happenings

**Row 2 — the current section's own nav.** Absent on three hosts: `kaaya.org` (build doc §1 keeps the homepage nav thin), `happenings` (one destination), and `events` (one page whose categories are filters, not routes).

| Host | Row 2 |
|---|---|
| `kaaya.org` | *(none)* |
| `gallery.kaaya.org` | Shop · Artist |
| `place.kaaya.org` | Story · Activities · Stay · Booking |
| `community.kaaya.org` | Learn · Incubate · Exchange |
| `events.kaaya.org` | *(none — categories are filters)* |
| `happenings.kaaya.org` | *(none)* |

Gallery's row 2 has no Art entry — decision 15 merged it into the gallery home, which is what the wordmark links to. Neither Gallery nor Community carries an Events entry either: decision 18 gave Events its own host, so it sits in row 1 for everyone.

Build doc §1 warns against the homepage presenting sections as equal tiles. Row 1 is a thin text nav, not a grid, and the emphasis on Gallery survives the fifth entry — but five is the ceiling. Anything further belongs inside a section.

**Footer** is shared and identical on all six hosts: `ContactBlock` with the section's address variant (§14), the cross-site links, and the legal line. It does not carry a section nav.

---

## 6. Target architecture — one repo, one Astro project, one deploy

**No monorepo. No workspaces. No separate `apps/`.** The repo keeps its current shape — routes get reorganized into folders, nothing is split into siblings.

```
functions/
└── _middleware.js              # NEW — host-based routing (§6.2)
src/
├── pages/
│   ├── index.astro             # kaaya.org — root, no rewrite
│   ├── gallery/
│   │   ├── index.astro         # NEW — hero, exhibition narrative, featured works
│   │   ├── shop/
│   │   │   ├── index.astro     # NEW — catalogue, filters, enquiry-only
│   │   │   └── [slug].astro    # NEW — work detail (decision 14)
│   │   └── artist/
│   │       ├── index.astro     # NEW — profiles, Archive, Artist of the Month, Studios
│   │       └── [slug].astro    # NEW — artist detail
│   ├── events/                 # NEW — events.kaaya.org (decision 18)
│   │   ├── index.astro         # NEW — all events, categorised and filterable
│   │   └── [slug].astro        # NEW — event detail
│   ├── place/
│   │   ├── index.astro         # NEW
│   │   ├── story.astro         # split from place.astro (decision 3)
│   │   ├── activities.astro    # canonical for pottery/trails/etc (decision 11)
│   │   ├── stay.astro
│   │   └── booking.astro
│   ├── community/
│   │   ├── index.astro         # NEW — build doc §6 narrative
│   │   ├── learn.astro
│   │   ├── incubate.astro
│   │   └── exchange.astro
│   ├── blog/                   # unchanged path — happenings.kaaya.org/blog/*
│   ├── rss.xml.ts
│   └── 404.astro
├── content/
│   ├── pages/*.yaml
│   ├── works/, artists/, events/   # NEW collections (§12)
│   └── blog/*.md
├── lib/
│   ├── links.ts                # NEW — replaces url.ts (§9)
│   └── utils.ts
└── components/
    ├── common/                 # Header rewritten per §5
    └── ui/
        └── EnquiryForm.astro   # NEW — shared shell (§14)
```

Every event lives at `events.kaaya.org`, once (decision 18). Gallery and Community *feature* their own — the gallery home shows upcoming events where `section: gallery`, the community home the same for `section: community` — and both link into `events.kaaya.org/[slug]` rather than rendering a second copy.

**One Cloudflare Pages project**, all six hostnames plus `www` attached as custom domains. A Pages Function at the repo root rewrites by `Host` header so each subdomain serves its own subtree of the one build.

```
                    astro build → dist/
                          │
        ┌─────────────────┴──────────────────┐
        │   Cloudflare Pages (one project)   │
        │   functions/_middleware.js         │
        └─────────────────┬──────────────────┘
                          │  rewrite by Host
   kaaya.org           →  dist/
   gallery.kaaya.org   →  dist/gallery/
   place.kaaya.org     →  dist/place/
   community.kaaya.org →  dist/community/
   events.kaaya.org    →  dist/events/
   happenings.kaaya.org→  dist/blog/        (already at the right path)
```

**Fact-checked (2026-08-08):** multiple custom domains on one Cloudflare Pages project is supported — up to 100 per project on Free. Pages Functions are available on Free.

### 6.1 Why not Transform Rules (v3's design, dropped)

v3 routed with three Transform Rules, e.g. `gallery.kaaya.org` → `concat("/gallery", http.request.uri.path)`. That rewrites **every** path, including ones that are not page routes:

| Request | Rewritten to | Result |
|---|---|---|
| `/_astro/index.abc123.css` | `/gallery/_astro/index.abc123.css` | 404 — **page renders unstyled** |
| `/_astro/*.js` | `/gallery/_astro/*.js` | 404 — theme toggle and mobile nav dead |
| `/uploads/foo.jpg` | `/gallery/uploads/foo.jpg` | 404 — every image broken |
| `/admin/` | `/gallery/admin/` | 404 — CMS unreachable |
| `/sitemap-index.xml`, `/rss.xml`, `/favicon.svg` | prefixed | 404 |

v3 §7 caught only `/uploads`, and fixed it by mandating absolute image URLs throughout — which does not help `/_astro/*` at all, and is fragile besides, since Decap writes relative paths by default. The `place.kaaya.org` static rewrite was worse: it rewrote *everything* to `/place`, so an image request would have been served an HTML page.

Transform Rules can be made to work with an exclusion clause appended to each rule, but that is dashboard state no PR can review, it must be edited in three places whenever a root asset is added, and it cannot be exercised before cutover because zone rules do not apply to `*.pages.dev` previews.

### 6.2 The middleware

`functions/_middleware.js` — Cloudflare Pages picks this up from the repo root automatically. It sits outside `dist/` and needs no Astro configuration.

```js
const APEX = 'kaaya.org';

// Hosts whose content lives in a same-named folder of the build.
const SECTIONS = new Set(['gallery', 'place', 'community', 'events']);

// Old kaaya.org URLs that do not simply map onto a section prefix.
const LEGACY = {
  '/learn':    `https://community.${APEX}/learn`,
  '/incubate': `https://community.${APEX}/incubate`,
  '/exchange': `https://community.${APEX}/exchange`,
  '/visit':    `https://${APEX}/#visit`,
};

// Served from the root of dist/ on every hostname — never rewritten.
const PASSTHROUGH = /^\/(_astro|uploads|admin)\//;
const ROOT_FILE = /^\/[^/]+\.[a-z0-9]+$/i; // /favicon.svg, /rss.xml, /sitemap-index.xml

const redirect = (location) =>
  new Response(null, { status: 301, headers: { Location: location } });

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const host = url.hostname;
  const path = url.pathname;
  const first = path.split('/')[1] ?? '';
  const tail = () => `${path.slice(first.length + 1) || '/'}${url.search}`;

  if (host === `www.${APEX}`) {
    return redirect(`https://${APEX}${path}${url.search}`);
  }

  // Preview deploys (*.pages.dev) and `wrangler pages dev` serve the path form
  // unchanged, so the whole build stays browsable from a single origin.
  const inZone = host === APEX || host.endsWith(`.${APEX}`);
  if (!inZone) return next();

  // Shared assets are not namespaced — serve them as-is on every host.
  // This is the guard whose absence breaks the Transform Rule design (§6.1).
  if (PASSTHROUGH.test(path) || ROOT_FILE.test(path)) return next();

  const sub = host === APEX ? '' : host.slice(0, -(APEX.length + 1));

  // An internal section prefix must never appear in a public URL. On the
  // section's own host it is stripped; anywhere else it moves to its host.
  // This is also the duplicate-content guard (§6.3).
  if (SECTIONS.has(first)) {
    return first === sub
      ? redirect(`https://${host}${tail()}`)
      : redirect(`https://${first}.${APEX}${tail()}`);
  }

  if (SECTIONS.has(sub)) {
    url.pathname = `/${sub}${path}`;
    return next(new Request(url, request));
  }

  // happenings owns /blog/* and nothing else.
  if (sub === 'happenings') {
    return path.startsWith('/blog') ? next() : redirect(`https://${host}/blog`);
  }

  if (host === APEX) {
    if (path in LEGACY) return redirect(LEGACY[path]);
    if (first === 'blog') return redirect(`https://happenings.${APEX}${path}${url.search}`);
  }

  return next();
}
```

Behaviour table — every row is a test case (§16). Astro's default `build.format: 'directory'` means a route emits `<route>/index.html`; the paths below are what Cloudflare Pages resolves to.

| Request | Response |
|---|---|
| `kaaya.org/` | homepage |
| `kaaya.org/place` | 301 → `place.kaaya.org/` |
| `kaaya.org/place/stay` | 301 → `place.kaaya.org/stay` |
| `kaaya.org/learn` | 301 → `community.kaaya.org/learn` |
| `kaaya.org/incubate` | 301 → `community.kaaya.org/incubate` |
| `kaaya.org/exchange` | 301 → `community.kaaya.org/exchange` |
| `kaaya.org/visit` | 301 → `kaaya.org/#visit` |
| `kaaya.org/blog` | 301 → `happenings.kaaya.org/blog` |
| `kaaya.org/blog/making-of-kaaya` | 301 → `happenings.kaaya.org/blog/making-of-kaaya` |
| `kaaya.org/community/learn` | 301 → `community.kaaya.org/learn` (leak guard) |
| `kaaya.org/gallery/shop` | 301 → `gallery.kaaya.org/shop` (leak guard) |
| `www.kaaya.org/*` | 301 → `kaaya.org/*` |
| `gallery.kaaya.org/` | serves `dist/gallery/index.html` |
| `gallery.kaaya.org/shop` | serves `dist/gallery/shop/index.html` |
| `gallery.kaaya.org/shop/chromatic-metanoia` | serves `dist/gallery/shop/chromatic-metanoia/index.html` |
| `gallery.kaaya.org/artist/tenzin-norbu` | serves `dist/gallery/artist/tenzin-norbu/index.html` |
| `gallery.kaaya.org/gallery/shop` | 301 → `gallery.kaaya.org/shop` |
| `gallery.kaaya.org/place` | 301 → `place.kaaya.org/` |
| `gallery.kaaya.org/events` | 301 → `events.kaaya.org/` |
| `gallery.kaaya.org/_astro/x.css` | serves `dist/_astro/x.css` — **not** rewritten |
| `gallery.kaaya.org/uploads/a.jpg` | serves `dist/uploads/a.jpg` — **not** rewritten |
| `place.kaaya.org/stay` | serves `dist/place/stay/index.html` |
| `events.kaaya.org/` | serves `dist/events/index.html` |
| `events.kaaya.org/artistry-weekend` | serves `dist/events/artistry-weekend/index.html` |
| `kaaya.org/events` | 301 → `events.kaaya.org/` (leak guard) |
| `happenings.kaaya.org/` | 301 → `happenings.kaaya.org/blog` |
| `happenings.kaaya.org/blog/x` | serves `dist/blog/x/index.html` |
| `happenings.kaaya.org/anything` | 301 → `happenings.kaaya.org/blog` |
| `*.pages.dev/gallery/shop` | serves the path form, no redirect (preview) |

### 6.3 Duplicate content, and the `happenings` root

Because all content lives in one build and `kaaya.org` has no rewrite, internal paths would be reachable on the apex unless blocked — `kaaya.org/gallery/shop` would render the page that belongs only at `gallery.kaaya.org/shop`. Two consequences: duplicate content, and `kaaya.org` stops being the thin front door build doc §1 insists on. The `SECTIONS.has(first)` branch closes this for all four prefixes at once.

v3 missed a second leak in the same family: `happenings.kaaya.org` was specified as pure passthrough, so its **root would have served the `kaaya.org` homepage** — wrong content, wrong host, no rule anywhere covering it. The `sub === 'happenings'` branch fixes it.

The shared `404.astro` is reached on every host, since an unmatched path on a section host rewrites into a folder that has no such page. Its Header renders whichever section the URL implies, which is the correct behaviour and needs no special handling.

**Trade-off accepted:** a broken build blocks all five domains at once. The 5-project design bought isolation; this one gives that up for simplicity. Worth revisiting only if independent release cadence per subdomain starts to matter.

---

## 7. Why this over the 5-project monorepo design (superseded)

The v1 draft split the site into 5 Astro apps in a monorepo, each its own Pages project. Dropped, given the stated priority is **free and easy to maintain**: no workspace boundary to maintain, one build and one set of project settings rather than five to keep in sync, and the CMS already worked as a single `config.yml` in a single repo.

---

## 8. Redirects

All redirects live in `functions/_middleware.js` (§6.2). **No Cloudflare Redirect Rules, and no Pages `_redirects` file.**

Pages' `_redirects` matches on path only — no Host-header awareness — so with five domains on one project a rule fires identically on all five, which is wrong (the `/place` migration redirect must fire on `kaaya.org` but not on `place.kaaya.org`). Zone-level Redirect Rules do support `http.host`, but they are dashboard state: invisible to review, absent from previews, on a separate quota. Since a Pages Function is already required for the rewrites, the redirects live in the same file — one source of truth, one place to test.

`kaayagallery.com` needs no redirect work (decision 13).

---

## 9. Internal links — one helper, no hand-written hrefs

Because one build serves six hostnames, a bare `/community/learn` href is ambiguous: in production the middleware reads it as a leaked internal path and 301s, and in local `astro dev` there is no middleware at all.

**Every internal link goes through `link()`. No hand-written internal `href` strings.**

The helper is deliberately split in two. `toCanonical()` does the host mapping and always returns an absolute URL. `link()` adds the dev-mode behaviour on top. That split is not cosmetic — see the warning below.

```ts
// src/lib/links.ts
export const SECTIONS = ['gallery', 'place', 'community', 'events'] as const;

const APEX = 'https://kaaya.org';

/**
 * Build-time path ('/gallery/shop') -> the public URL it is served at.
 * Always absolute, never environment-dependent.
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
 * subdomain URL; in dev it stays a path, because the dev server has no
 * host-based rewrite and everything is served from one origin.
 */
export function link(path: string): string {
  if (/^(https?:)?\/\//.test(path)) return path;
  return import.meta.env.PROD ? toCanonical(path) : path;
}
```

**Anything that runs outside a page must call `toCanonical()`, never `link()`.** `import.meta.env.PROD` is a page-build-time value; in `astro.config.mjs` it is not set, so `link()` there would take the dev branch and silently emit bare paths. Three consumers are affected:

| Consumer | Calls | Why |
|---|---|---|
| Page and component hrefs | `link()` | Must stay navigable in `astro dev`. |
| `SEO.astro` canonical and `og:url` | `toCanonical()` | A canonical must always name the real host. |
| Sitemap `serialize()` in `astro.config.mjs` | `toCanonical()` | Runs in config context where `import.meta.env.PROD` is undefined. |
| `rss.xml.ts` item links | `toCanonical()` | Feed items are consumed off-site; a bare path is meaningless there. |

```js
// astro.config.mjs
import { toCanonical } from './src/lib/links.ts';

sitemap({
  serialize: (item) => ({ ...item, url: toCanonical(new URL(item.url).pathname) }),
})
```

Without this, `@astrojs/sitemap` bakes the single `site` origin into every URL and advertises `kaaya.org/gallery/shop` — exactly the URL the middleware 301s away from.

`links.ts` replaces `src/lib/url.ts` (D5). `SITE.url` must move to `https://kaaya.org` first (D1), or every canonical points at a host that 301s away.

---

## 10. Media and assets

The middleware's passthrough guard means root-level assets resolve identically on every hostname:

- Images stay in `public/uploads/`, referenced by **relative** `/uploads/...` — exactly as today, and exactly what Decap writes by default.
- `media_folder: public/uploads` and `public_folder: /uploads` unchanged.
- **v3 §7's absolute-image-URL mandate is withdrawn.** It existed only to work around the Transform Rule rewrite, never covered `/_astro/*`, and would have broken on the first CMS upload.

Add `public/og-default.png` (D3) and `public/robots.txt` (D6). One `robots.txt` serves all six hosts; it should carry the sitemap pointer and disallow nothing, since every host serves distinct content once the leak guards are in place.

Gallery images must be pulled off `static.wixstatic.com` into `public/uploads/` (§4).

Optimisation is **decision 20**: a build-time `sharp` pass writes webp derivatives into a generated `public/uploads/derived/`, leaving the originals and their `/uploads/…` references untouched. Nothing above changes — the derivatives are an addition, and a page whose derivative is missing renders the original.

---

## 11. CMS (DecapCMS)

Nothing about the repo boundary changes. `public/admin/config.yml` changes:

- **`site_url` → `https://kaaya.org`** (D2).
- `collections.pages` grows with entries for the new sections, including the four Place sub-page files (§13).
- New **folder collections** for Works, Artists and Events — same pattern as the existing `blog` collection.
- `file:` paths repointed within `src/content/` — no cross-package moves.
- `media_folder`/`public_folder` unchanged (§10).

The admin bundle is served from `/admin` on every hostname via the passthrough guard, so editors keep one login at `kaaya.org/admin` for all five sites.

---

## 12. Content model

### Existing collections

`pages` and `blog` keep their current shape. `pages` gains entries for the new routes. `visit.yaml`'s content folds into `home.yaml` — no schema change needed, since `accommodation`, `priceRange`, `mealPlans`, `facilities` and `directionsNote` already exist in the shared schema.

### New collections

Fields are drawn from the real inventory (§4), not invented.

```ts
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    artist: z.string().optional(),          // slug into `artists`
    category: z.enum(['artworks', 'handmade', 'collectibles']),
    medium: z.string().optional(),          // "Acrylic on canvas"
    size: z.string().optional(),            // "36 x 36", "30 X 36 Inch"
    price: z.string().optional(),           // display only — no checkout (decision 2)
    available: z.boolean().default(true),
    madeOnSite: z.boolean().default(false), // Pottery/Workshop provenance, build doc §4
    featured: z.boolean().default(false),   // surfaces on the gallery home and kaaya.org
    images: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artists' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string().optional(),         // "The Visionary of Mustang"
    portrait: z.string().optional(),
    origin: z.string().optional(),          // "Almora, Uttarakhand"
    residency: z.boolean().default(false),  // Studios cottages, build doc §4
    featuredMonth: z.string().optional(),   // Artist of the Month
    published: z.boolean().default(false),  // gates the listing
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    section: z.enum(['gallery', 'community']), // which section home features it
    type: z.enum(['exhibition', 'workshop', 'talk', 'market', 'other']),
    featured: z.boolean().default(false),   // pinned at the top of events.kaaya.org
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    venue: z.string(),                      // "Studio 1", "Nature Café"
    heroImage: z.string().optional(),
    rsvpNote: z.string().optional(),        // contact-only, no ticketing
  }),
});
```

`price` is a string, and no code sums it, totals it, or passes it anywhere. That makes decision 2 structural rather than a matter of remembering not to build checkout.

`published` defaults to `false`, so **every imported artist must set it explicitly** or the Artist page lists nothing.

**`section` and `type` do different jobs.** `section` decides which section home features the event, and nothing else — it never appears as a category on `events.kaaya.org`. `type` is the visitor-facing categorisation on that page, alongside a date split between upcoming and past. `featured` pins an event to the top of the events page itself.

The `type` list is a first draft covering the three known events plus the market and talks the build doc mentions. It is cheap to extend; confirm it against a real season's programme before the CMS collection is locked (§18).

---

## 13. Content migration map

The table an implementer works from during the route reorganization.

| Existing | New location | Notes |
|---|---|---|
| `src/pages/index.astro` + `home.yaml` | same path, rebuilt per build doc §8 | Drop the 5-tile `navCards` grid — the exact parallel-menu pattern build doc §1 replaces. `NavCard.astro` becomes unused; delete it. `navCards` leaves the `pages` schema and `config.yml`. |
| `src/pages/place.astro` + `place.yaml` | `src/pages/place/{index,story,activities,stay,booking}.astro` | **`place.yaml` splits into `place-story.yaml`, `place-activities.yaml`, `place-stay.yaml`, `place-booking.yaml`**, one per route, plus `place.yaml` retained for the section index. Decap needs one `file:` entry per YAML (§11). |
| `learn.yaml`'s `sessions` array | **moves into `place-activities.yaml`** | Decision 11. The full descriptions live only in `learn.yaml` today; `visit.yaml`'s `facilities` is a terse list. The text physically moves — Learn keeps the programmes table and a single link across. Cross-check both sources so nothing is lost in the merge. |
| `src/pages/learn.astro` + `learn.yaml` | `src/pages/community/learn.astro`, `src/content/pages/community-learn.yaml` | |
| `src/pages/incubate.astro` + `incubate.yaml` | `src/pages/community/incubate.astro`, `community-incubate.yaml` | Form carries over unchanged (decision 12). |
| `src/pages/exchange.astro` + `exchange.yaml` | `src/pages/community/exchange.astro`, `community-exchange.yaml` | |
| `src/pages/visit.astro` + `visit.yaml` | folded into `home.yaml`; `visit.astro` deleted | Needs a `#visit` anchor on the homepage — the middleware's `/visit` redirect targets it. |
| `visit.yaml`'s "Studio Rooms" row | `place-stay.yaml`, renamed **Garden Rooms** | Decision 7. |
| `src/pages/blog/`, `src/content/blog/*.md`, `rss.xml.ts` | unchanged paths | Served at `happenings.kaaya.org/blog/*`. `rss.xml.ts` item links switch to `toCanonical()` (§9). |
| `src/lib/url.ts` | deleted, replaced by `src/lib/links.ts` | D5. |
| `public/CNAME` | deleted | GitHub Pages artifact. |
| `.github/workflows/deploy.yml` | deleted after cutover soak | |
| *(new)* | `src/pages/gallery/**`, `src/content/{works,artists}/` | Content from §4. |
| *(new)* | `src/pages/events/{index,[slug]}.astro`, `src/content/events/` | Decision 18. The only place any event is rendered; sections feature, they do not re-render. |
| *(new)* | `src/pages/community/index.astro` | |
| *(new)* | `src/components/ui/EnquiryForm.astro` | §14. |

---

## 14. Cross-cutting rules enforced in code

### Enquiries — one shell, four forms

Decisions 5, 16 and 17. `EnquiryForm` owns everything identical across forms: the Web3Forms POST, the access key, the subject, the honeypot, the success redirect, validation and styling. Each page passes its own fields, because Booking and Incubate do not ask the same questions.

| Form | Subject | Inbox | Fields beyond the shared shell |
|---|---|---|---|
| Incubate | `Incubate Inquiry` | `connect@kaaya.org` | Name*, Phone, About you*, Idea brief*, work/doc link — unchanged (decision 12) |
| Exchange | `Partner Inquiry` | `connect@kaaya.org` | as live today |
| Place → Booking | `Booking Enquiry` | `info@kaaya.org` *(new inbox — must exist before cutover)* | arrival date, nights, guests, room type |
| Gallery → Shop | `Shop Enquiry` | `gallery@kaaya.org` | hidden work reference (title + slug) |

**Four forms, three inboxes, three access keys.** A Web3Forms access key is bound to one verified destination address, so `connect@`, `info@` and `gallery@` need one key each, held in a single map beside the component rather than scattered across templates. Keys are public by design — they ship in the client-side form either way — which is precisely why the missing spam control (§3) matters: the shared shell adds Web3Forms' honeypot field, covering all four forms at once instead of none.

The shell also sets a `redirect` field to an on-site thank-you page (D8). Today submitting either live form drops the visitor on Web3Forms' branded page, off the Kaaya site entirely.

**`kaaya.org` has no form** (decision 16). Its footer prints the address via `ContactBlock`.

### Contact addresses

`ContactBlock` already exists but hardcodes `SITE.email` (`connect@kaaya.org`). It needs a `variant` prop, not a new component.

| Host | Printed address |
|---|---|
| `kaaya.org` | `art@kaaya.org` |
| `gallery.kaaya.org` | `gallery@kaaya.org` |
| `place.kaaya.org` | `info@kaaya.org` |
| `community.kaaya.org` | `connect@kaaya.org` |
| `events.kaaya.org` | `art@kaaya.org` — events span sections, so the general address applies |
| `happenings.kaaya.org` | `art@kaaya.org` — inherits home, since the blog spans all sections |

`art@kaaya.org` receives no form submissions but is printed on two hosts, so it must exist as a real, monitored mailbox.

### Per-host descriptions

Decision 6. `SITE.description` stops being a single global string. `SEO.astro` derives the section from `Astro.url.pathname` — the same derivation the canonical and the Header already use — and falls back to the home description at the root.

| Host | Description |
|---|---|
| `kaaya.org`, `gallery.kaaya.org` | art-forward, free of all four banned phrases |
| `place.kaaya.org` | the campus, mud construction, staying there |
| `community.kaaya.org` | learning, incubation and exchange — banned vocabulary is fine here |
| `events.kaaya.org` | what is on at Kaaya |
| `happenings.kaaya.org` | stories from Kaaya |

### Banned vocabulary

"circular economy", "incubation", "internships", "sustainable living" must never appear on `kaaya.org` or `gallery.kaaya.org`. A grep over authored content is necessary but not sufficient — it does not reach shared chrome, which is exactly where the current violation lives. The check runs over **built output** for those two hosts (`dist/index.html`, `dist/gallery/**`), not only over source YAML.

### Cross-linking

Studios ↔ Gallery/Place and Pottery/Workshop ↔ Gallery: explicit, named props on the relevant sections, driven by `works.madeOnSite` and `artists.residency` — not a generic "related content" widget. The Studios link from Place → Stay targets `gallery.kaaya.org/artist` and, once a residency artist is published, their detail page.

---

## 15. Hosting and DNS

- One Cloudflare Pages project, GitHub-connected, build `npm run build`, output `dist`, Node 22. No root-directory config.
- Seven custom domains: `kaaya.org`, `www.kaaya.org`, `gallery.`, `place.`, `community.`, `events.`, `happenings.`.
- Free tier (fact-checked): 500 builds/month, up to 100 custom domains per project, unlimited bandwidth.
- DNS: 6 CNAMEs (`www`, `gallery`, `place`, `community`, `events`, `happenings`) plus repointing the apex (CNAME, flattened), all proxied.
- Delete `.github/workflows/deploy.yml` and disable GitHub Pages after cutover is stable. Delete `public/CNAME`.

---

## 16. Testing

Install `@playwright/test` first — `playwright` alone is not the test runner (D4).

- **Routing tests are the important ones**, and unlike dashboard rules they run *before* cutover. `wrangler pages dev dist` runs the Function locally; each row of §6.2's behaviour table is one assertion on status and `Location`, driven with an explicit `Host` header. The same suite reruns against production after DNS.
- **Per-section smoke tests:** page loads; nav hrefs are the expected absolute cross-subdomain URLs. `link()` returns paths in dev, so assert against `astro build` output, not `astro dev`.
- **Form tests:** each of the four forms renders, carries its honeypot and redirect, and posts the right subject.
- **Banned-vocabulary check** as a CI grep over built output, not Playwright.

---

## 17. Rollout phases

These map one-to-one onto the backlog's epics, so the two documents cannot drift.

| Phase | Epic | What |
|---|---|---|
| 1 | E0 | Defect fixes D1–D8. No dependencies. |
| 2 | E1 | Route reorganization — moves, splits, the content migration map (§13). |
| 3 | E2 | Routing foundation — middleware, `links.ts`, sitemap, canonicals, Header (§5). |
| 4 | E3 | Home rebuild. |
| 5 | E4 | Enquiries, contact addresses, per-host descriptions. |
| 6 | E5 | Cross-cutting rules — banned vocabulary, cross-links. |
| 7 | E6 | Place and blog content. |
| 8 | E7 | Gallery — collections, routes, §4 content import. |
| 9 | E8 | Events — `events.kaaya.org`, the content import, section featuring. |
| 10 | E9 | Cloudflare setup and cutover. |
| 11 | E10 | Testing, trailing each epic as it lands. |

Phases 1–3 are prerequisites for everything. Phases 4 and 8 are independent of each other and can run in parallel.

---

## 18. Open items

Design is closed. What remains is content, plus one optional cleanup.

**Technical:**

- [ ] Whether the `pages` collection schema gets split per page (§3.1) — optional, not during the migration.

**Content — owned by the Kaaya team:**

- [ ] **Real event dates and campus address.** All three scraped events carry Wix placeholder data (`08 Aug 2026, 1:41 am – 3:41 am`, `123 Art Ln, Sweetwater, TN 37874, USA`). Hard gate on publishing the events pages.
- [ ] **`info@kaaya.org` created and monitored** before cutover, or Place bookings go nowhere (decision 9).
- [ ] **`art@kaaya.org` confirmed as a real, monitored mailbox** — it is printed on `kaaya.org`, `events.kaaya.org` and `happenings.kaaya.org` (§14). If events should route somewhere of their own, say so and it becomes a fourth address rather than an inherited one.
- [ ] **Per-host description copy** (decision 6) — five short strings, none using the four banned phrases on home or gallery.
- [ ] Real photography and imagery direction, including the `og-default.png` share image (D3) and the homepage exhibition hero.
- [ ] Studios residency terms — pricing, duration, application process. Not blocking launch (decision 8); the section stays enquiry-only until they exist.
- [ ] Who owns the Artist of the Month slot (§4) — it goes stale without a rotation owner.
- [ ] Gallery inventory beyond the 5 scraped artworks; Handmade and Collectibles are both empty, so those filters would show nothing.
- [ ] **Confirm the event `type` taxonomy** (§12) — currently exhibition, workshop, talk, market, other. A first draft covering the three known events plus the market and talks the build doc mentions; cheap to extend before the CMS collection is locked.
