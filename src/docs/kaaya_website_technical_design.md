# Kaaya Website — Technical Design Document

**Companion to:** [`kaaya_website_build_instructions (final).md`](./kaaya_website_build_instructions%20(final).md)
**Status:** Draft v3 — architecture simplified to a single site/single deploy (superseded the earlier monorepo/5-Cloudflare-Pages-projects design after confirming a lighter option is feasible).
**Author:** Claude Code, drafted 2026-08-08 from repo audit + build instructions doc, revised same day after user asked for a simpler "one site, subdomains route to the right folder" approach.

---

## 1. Goal

Turn the current single-domain Astro site (`kaaya.org`, 6 flat pages) into the 5-site structure specified in the build instructions doc: a homepage/hero shell at `kaaya.org` plus four subdomains (`gallery`, `place`, `community`, `happenings`), with every existing URL 301-redirected to its new home — **without** taking on a second repo, a monorepo split, or multiple hosting deployments to get there.

## 2. Current State (as of this audit)

- **Framework:** Astro 7, single project. `astro.config.mjs` has one `site: 'https://kaaya.org'`.
- **Pages:** `src/pages/{index,place,learn,incubate,exchange,visit}.astro` + `src/pages/blog/`. No `gallery` route exists yet — Art/Artist/Cart/Studios content doesn't exist anywhere in the repo.
- **Content:** Per-page YAML in `src/content/pages/*.yaml`, edited through DecapCMS (`public/admin/config.yml`) via git-gateway (DecapBridge), backend repo `altpsyche/kaaya-org`, branch `main`. Blog posts are markdown in `src/content/blog/`.
- **Components:** Shared `Header`/`Footer`/`SEO` in `components/common`, presentational `ui/*` components (`Hero`, `NavCard`, `PriceTable`, `ProgramTable`, `ValueTable`, `PillarList`, `PrincipleList`, `IncubationCard`, `QuoteBlock`, etc.) — reusable for the new sections, not throwaway.
- **Media:** All images in `public/uploads/`, referenced by relative `/uploads/...` paths, uploaded through the CMS (`media_folder: public/uploads`).
- **Deploy:** `.github/workflows/deploy.yml` confirms **GitHub Pages** — `astro build` → `actions/upload-pages-artifact` → `actions/deploy-pages`. `public/CNAME` = `kaaya.org`.
- **Testing:** `playwright` is a devDependency but unconfigured — no `playwright.config.*`, no test directory.

## 3. Target Architecture — one repo, one Astro project, one deploy

**No monorepo. No workspaces. No separate `apps/`.** The repo stays exactly the shape it is today — routes get reorganized into folders, nothing gets split into siblings. This replaces an earlier draft of this doc that proposed a 5-app monorepo deployed as 5 separate Cloudflare Pages projects; that version is superseded, see §9 for why.

```
src/
├── pages/
│   ├── index.astro          # kaaya.org (home) — root, no rewrite needed
│   ├── place.astro           # single page w/ sections (Story/Activities/Stay/Booking) — unchanged shape from today
│   ├── gallery/
│   │   ├── art.astro
│   │   ├── artist.astro
│   │   └── cart.astro
│   ├── community/
│   │   ├── learn.astro
│   │   ├── incubate.astro
│   │   ├── exchange.astro
│   │   └── events.astro
│   └── blog/
│       ├── index.astro       # already happenings' only nav item lives at /blog
│       └── [...slug].astro
├── content/
│   ├── pages/*.yaml           # existing pattern, extended with gallery/community pages
│   ├── gallery/{art,artists,products}/   # new astro:content collections — repeating entities
│   └── blog/*.md
└── components/                # unchanged — ui/*, common/*
```

**One Cloudflare Pages project**, all 5 domains (`kaaya.org`, `gallery.kaaya.org`, `place.kaaya.org`, `community.kaaya.org`, `happenings.kaaya.org`) attached to it as custom domains. A small set of Cloudflare **Transform Rules** (edge-level, run before the request ever reaches the static build) rewrite the incoming path based on `http.host`, so each subdomain transparently serves the right folder from the one build:

| Host | Rewrite | Notes |
|---|---|---|
| `kaaya.org` | none (passthrough) | root content + `/uploads/*` live here directly |
| `gallery.kaaya.org` | `concat("/gallery", http.request.uri.path)` | `/art` → internally `/gallery/art` |
| `place.kaaya.org` | static rewrite to `/place` | single page, no subpaths, static mode is enough |
| `community.kaaya.org` | `concat("/community", http.request.uri.path)` | `/learn` → internally `/community/learn` |
| `happenings.kaaya.org` | none (passthrough) | its only content, `/blog/*`, already lives at that exact path |

**Fact-checked (2026-08-08):** attaching multiple custom domains to one Cloudflare Pages project is supported (up to 100 domains/project on Free, confirmed via Cloudflare's Limits docs). Transform Rules' Dynamic mode (`concat()` etc.) is available on the Free plan — only *regex* matching is paid-gated (Business+); Free allows 10 active Transform Rules, we need 3.

## 4. Why this over the 5-project monorepo design (superseded)

The earlier draft split the site into 5 Astro apps in a monorepo, each its own Cloudflare Pages project. Reasons that design is dropped in favor of this one, given the stated priority is **free and easy to maintain**:

- No workspace/package boundary to maintain (`packages/ui`, `packages/content-schema` don't need to exist) — components stay exactly where they are today, imported the way they already are.
- One build, one deploy, one set of Cloudflare project settings — not 5 to keep in sync (build watch paths, custom domains, environment variables ×5).
- One CMS config already worked this way (single `config.yml`, single repo) — this design doesn't change that at all, whereas the monorepo version needed the CMS's `file:` paths repointed across app boundaries.

**Trade-off accepted, and it's the real one:** a broken build now blocks *all five* domains at once, not just one. The 5-project design bought isolation — this one gives that up for simplicity. Worth revisiting only if the site grows enough that independent release cadence per subdomain actually matters; nothing in the build doc suggests that's needed for a site this size.

## 5. A risk this architecture introduces: duplicate/leaked internal paths

Because all content lives in **one** build, and `kaaya.org` has no rewrite rule, the internal paths are also directly reachable through the home domain unless explicitly blocked — e.g. `kaaya.org/gallery/art` would render the same page that's supposed to live only at `gallery.kaaya.org/art`. This didn't exist as a risk in the 5-project design (each project physically only contained its own content). Two consequences if left unguarded: duplicate content (SEO), and `kaaya.org` stops being the "thin front door" the build doc's §1 core principle insists on.

**Fix:** the same Cloudflare Redirect Rules that handle the old-URL migration (§6) also close this gap — see the `/gallery` and `/community` guard rules in the table below, which exist for no reason other than this.

## 6. Redirects — Cloudflare Redirect Rules, not the Pages `_redirects` file

**Fact-checked, and this corrects an assumption from the earlier draft:** Cloudflare Pages' `_redirects` file matches on URL **path only** — it has no Host-header awareness (confirmed: Cloudflare's own capabilities table lists "domain-level redirects" as unsupported in `_redirects`). With 5 domains sharing one project, a shared `_redirects` file's rules would fire identically across all 5 hosts — wrong, since e.g. the `/place` migration redirect must fire only for `kaaya.org`, not for `place.kaaya.org` itself.

Use Cloudflare's zone-level **Redirect Rules** instead (fact-checked: supports `http.host` in the match expression, available on Free, 10-rule cap — separate quota from Transform Rules, so 3 Transform + these below stays well within both limits):

| # | Match (all require `http.host eq "kaaya.org"`) | Rewrite to | Purpose |
|---|---|---|---|
| 1 | `uri.path eq "/place"` | `https://place.kaaya.org/` | historical URL migration (build doc §3) |
| 2 | `uri.path in {"/learn" "/incubate" "/exchange"}` | `concat("https://community.kaaya.org", uri.path)` | historical — old paths match new community paths 1:1 |
| 3 | `uri.path eq "/visit"` | `/` | historical — Visit folds into home footer |
| 4 | `uri.path starts_with "/blog"` | `concat("https://happenings.kaaya.org", uri.path)` | historical — covers index + all 3 posts + any future post, one rule instead of 4 |
| 5 | `uri.path starts_with "/gallery"` | `https://gallery.kaaya.org/` | **leak guard only** (§5) — no historical URL to preserve, net-new section |
| 6 | `uri.path starts_with "/community"` | `https://community.kaaya.org/` | **leak guard only** (§5) — guards the internal-only `/community` prefix |

Rules 1 and 4 do double duty: they're both the historical migration *and* the leak guard for those two sections, since the internal folder names happen to match the old public paths.

`sitemap.xml`: **needs a fix, not a default.** `@astrojs/sitemap` bakes a single `site` origin into every URL it emits — left alone, gallery/community/happenings pages would show up in the sitemap as `kaaya.org/gallery/art` instead of `gallery.kaaya.org/art`, which is wrong and actively works against the redirect rules above. Needs a custom `serialize()` in the sitemap integration config that rewrites each URL's hostname based on its path prefix (strip `/gallery` → swap host to `gallery.kaaya.org`, etc.) before output. Flagged as its own implementation task, not something to assume "just works."

## 7. Media & Cross-Domain Assets

Unchanged from the original design and still necessary here: images stay in `public/uploads/`, served from `kaaya.org/uploads/...` (home has no rewrite, so this is a direct passthrough). Every other section references images by **absolute URL** (`https://kaaya.org/uploads/foo.jpg`), not relative path — a relative `/uploads/foo.jpg` referenced from `gallery.kaaya.org` would get rewritten by the Transform Rule into `/gallery/uploads/foo.jpg`, which doesn't exist. `media_folder`/`public_folder` in `config.yml` stay pointed at the one folder; `public_folder` should be the absolute URL form.

## 8. CMS (DecapCMS) Restructuring

Simpler than the monorepo version: **nothing about the repo boundary changes**, since there's only ever been one repo and now still only one project. `public/admin/config.yml` changes needed:

- `collections.pages` grows with new entries for the new sections (Gallery pages if any are flat-page-shaped, Community's Events).
- New **collection-type** (folder-based, not single-file) entries for Art, Artist (+ Artist Archive), Cart — these are repeating entities, not single pages, same pattern already used for the `blog` collection.
- `public_folder` becomes the absolute URL (`https://kaaya.org/uploads`) per §7.
- No `file:` paths need to move across app/package boundaries — they just move within `src/content/`, e.g. `src/content/pages/place.yaml` stays exactly where it is.

## 9. Content Migration Map

| Existing file | New location | Notes |
|---|---|---|
| `src/pages/index.astro` + `home.yaml` | same, rebuilt per build doc §8 | drop the 5-tile grid, hero + thin nav + footer-weight story/visit |
| `src/pages/place.astro` + `place.yaml` | unchanged path | add Studios to accommodation table (build doc §5) |
| `src/pages/learn.astro` + `learn.yaml` | `src/pages/community/learn.astro`, `src/content/pages/community-learn.yaml` | |
| `src/pages/incubate.astro` + `incubate.yaml` | `src/pages/community/incubate.astro`, `.../community-incubate.yaml` | resolve form-field discrepancy first (build doc open item) |
| `src/pages/exchange.astro` + `exchange.yaml` | `src/pages/community/exchange.astro`, `.../community-exchange.yaml` | |
| `src/pages/visit.astro` + `visit.yaml` | folded into home footer, `visit.astro` deleted | Visit stops being a standalone page (build doc §3) |
| `src/pages/blog/`, `src/content/blog/*.md` | unchanged path | 3 existing posts carry over as-is |
| *(new)* | `src/pages/gallery/*`, `src/content/gallery/{art,artists,products}/*` | no source content exists yet |
| *(new)* | `src/pages/community/events.astro` | no current content |

## 10. Cross-Cutting Rules Enforced in Code

Unchanged reasoning from the original draft — still applies identically in this simpler architecture:

- **Contact routing** (build doc §9): `ContactBlock` component takes a `variant`/`email` prop — `home` → `art@kaaya.org`, `place` → `info@kaaya.org`, `community` (Incubate/Exchange) → `connect@kaaya.org`. One component, no copy-paste address drift.
- **Banned vocabulary on `home`/`gallery`**: "circular economy," "incubation," "internships," "sustainable living" must never appear on `kaaya.org` or `gallery.kaaya.org` sections. CI grep check over `src/content/pages/home.yaml` and `src/content/gallery/**` + `src/pages/gallery/**`.
- **Cross-linking** (Studios ↔ Gallery/Place, Pottery/Workshop ↔ Gallery): explicit, named props on the relevant sections — not a generic "related content" widget.

## 11. Hosting & DNS

**Cloudflare Pages, one project.** Confirmed feasible and fact-checked (§3, §6). Setup:
- one Cloudflare Pages project, GitHub-connected to this repo, standard `astro build` command, `dist` output — no root-directory-per-app juggling since there's only one app,
- attach all 5 custom domains to that one project,
- add the 3 Transform Rules (§3) and 6 Redirect Rules (§6) at the zone level,
- free tier (fact-checked): 500 builds/month, up to 100 custom domains/project, unlimited bandwidth — one project means the whole "is the 500/month shared across projects" ambiguity from the earlier draft is now moot, there's only one project to begin with,
- delete `.github/workflows/deploy.yml` and disable GitHub Pages in repo settings once cutover is verified stable.

DNS: 4 new CNAME records (`gallery`, `place`, `community`, `happenings`) plus repointing `kaaya.org` itself, all to the one Cloudflare Pages project.

## 12. Rollout Phases

1. **Route reorganization** — move `learn/incubate/exchange` into `community/`, keep `place`/`blog`/`index` where they are, fold `visit` into home. Verify build still passes at each step (pure file moves, no new content yet).
2. **Home rebuild** — hero + nav shell per build doc §8.
3. **Gallery build** — highest risk, zero existing content. Content schema (§9) → routes → real content (blocked on photography/inventory, external).
4. **Cloudflare Pages setup** — one project, attach 5 domains, add Transform + Redirect Rules (§3, §6), custom sitemap `serialize()` fix (§6).
5. **Cutover** — verify every rule live (curl -I / browser check per row in §6's table and §3's table), then DNS switch, then decommission GitHub Pages.
6. **Post-cutover** — resubmit sitemap to Search Console, spot-check old indexed URLs for crawl errors over following weeks.

## 13. Testing

`playwright` is already a devDependency but unconfigured — add `playwright.config.ts`. Minimum coverage before cutover:
- smoke test per section: page loads, nav links are correct absolute cross-subdomain URLs (can't verify actual cross-origin resolution against `localhost` — routing rewrite only exists at Cloudflare's edge, not in local dev; local dev naturally serves everything at one origin under different paths, so the *rewrite* itself can only be tested post-deploy against real subdomains, not locally),
- Transform + Redirect Rules (§3, §6): one live test per rule, asserting correct final URL/status — must run against the deployed Cloudflare edge, not local dev, since these rules don't exist in `astro dev`,
- banned-vocabulary grep (§10) as a CI script, not Playwright.

## 14. Open Items

- [ ] Gallery content collections schema — Art/Artist/Cart/Studios have no existing data model, needs design before any gallery build work starts
- [ ] Custom sitemap `serialize()` implementation (§6) — needed before cutover, not optional
- [ ] All open items already listed in build doc §10 (real photography, booking-inbox choice, Incubate form fields, Learn/Visit content overlap, Studios residency terms, Studios/Studio-Rooms naming) — unresolved, block content work regardless of technical structure
- [ ] Redirect Rule #2 above uses an `in {...}` list-match expression — if that syntax turns out unsupported in the Rules builder UI, fall back to 3 separate single-value rules (still only 8 Redirect Rules total, well under the 10 cap either way)
