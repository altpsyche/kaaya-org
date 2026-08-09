# Kaaya Website — Implementation Tasks

**Source:** [`kaaya_website_technical_design.md`](./kaaya_website_technical_design.md) (TDD v3 — single site, single Cloudflare Pages deploy) + [`kaaya_website_build_instructions (final).md`](./kaaya_website_build_instructions%20(final).md) (content/product spec)
**Format:** Jira-style backlog — Epics (E) containing Stories/Tasks (T), with acceptance criteria and dependencies.
**Note:** this supersedes an earlier version of this doc built around a 5-app monorepo / 5 Cloudflare Pages projects design. That design was dropped (TDD §4) in favor of one Astro project, one Cloudflare Pages deployment, edge-level routing via Transform/Redirect Rules. No workspace scaffold epic exists in this version — there's no package boundary to build.

---

## Epic E1 — Route Reorganization

*TDD §3, §9, §12 phase 1. Pure file moves within the existing single project — no new content yet, no hosting change yet.*

**T1.1 — Move Learn/Incubate/Exchange under `community/`**
`src/pages/{learn,incubate,exchange}.astro` → `src/pages/community/{learn,incubate,exchange}.astro`; matching YAML `src/content/pages/{learn,incubate,exchange}.yaml` → `src/content/pages/community-{learn,incubate,exchange}.yaml`.
- AC: `npm run build` passes; pages render identically at their new local paths (`/community/learn` etc. in dev).
- Depends on: —

**T1.2 — Add Events placeholder under `community/`**
`src/pages/community/events.astro`, no real content yet (build doc §6 — moved here from an earlier revision, no current content exists).
- AC: route exists, renders a placeholder consistent with the rest of the site's design language.
- Depends on: T1.1

**T1.3 — Fold Visit into Home**
Delete `src/pages/visit.astro`; move `visit.yaml`'s accommodation/contact content into `home.yaml`'s footer section per build doc §8.
- AC: no `/visit` route remains; footer on home shows generic Visit info (hours, directions, contact) routed to `art@kaaya.org` (build doc §9).
- Depends on: —

**T1.4 — Update `config.yml` for moved files**
Repoint the `learn`/`incubate`/`exchange` collection entries' `file:` paths to their new locations (T1.1); remove the `visit` collection entry (T1.3); add an `events` entry.
- AC: DecapCMS admin at `/admin` still lists and correctly edits every page after the move — verify by making a trivial edit through the CMS UI and confirming it commits to the right file.
- Depends on: T1.1, T1.2, T1.3

---

## Epic E2 — Home Rebuild

*TDD §9, §12 phase 2. Build doc §8.*

**T2.1 — Hero + thin nav shell**
Full-bleed current-exhibition image (50–70% viewport, no competing CTAs), nav bar: Gallery (slightly emphasized), Place, Community, Happenings, small Cart icon.
- AC: matches build doc §8 layout spec.
- Depends on: E1

**T2.2 — Gallery content below the fold**
Artist highlights / gallery content appears before any mention of Place or Community, per build doc §8's scroll-order requirement.
- AC: visually verified scroll order matches spec.
- Depends on: T2.1, **soft dependency on E4 (Gallery)** for real content to feature — placeholder acceptable short-term.

**T2.3 — Footer-weight Kaaya Story teaser**
Exact copy block from build doc §8, ending in "Know the place" / "Know the community" links (rename from "ecosystem").
- AC: copy matches build doc §8 verbatim; links resolve to `place.kaaya.org` and `community.kaaya.org`.
- Depends on: T2.1

**T2.4 — Contact routing component**
Build `ContactBlock` variant/prop per TDD §10 (`art@kaaya.org` / `info@kaaya.org` / `connect@kaaya.org`), replace hardcoded addresses site-wide.
- AC: grep for raw email strings outside `ContactBlock` usage returns nothing; each section shows the correct address per build doc §9 table.
- Depends on: T1.3 (visit's contact info folds into this)

---

## Epic E3 — Cross-Cutting Content Rules (enforced in code)

*TDD §10.*

**T3.1 — Banned-vocabulary CI check**
Script grepping `src/content/pages/home.yaml`, `src/content/gallery/**`, `src/pages/gallery/**` for "circular economy," "incubation," "internships," "sustainable living"; fails CI on match.
- AC: verified to fail on a deliberately-planted violation, passes clean otherwise.
- Depends on: —

**T3.2 — Studios ↔ Gallery/Place cross-link**
Explicit, named link component instances connecting Gallery → Artist (Studios residency) and Place → Stay Details (Studios booking) — not a generic "related content" widget.
- AC: both directions link correctly; "some artists don't just show here, they live and work here" framing present on Gallery side.
- Depends on: E4 (Gallery), T4.x (Place's Studios row)

**T3.3 — Pottery/Workshop ↔ Gallery cross-link**
Same pattern for Place → Activities (Pottery, Workshop) linking to Gallery Art/Cart.
- AC: link present on both Activities entries per build doc §5.
- Depends on: E4

---

## Epic E4 — Place & Blog Content Updates

*Lower risk — existing pages, existing components, staying at their current paths.*

**T4.1 — Add Studios to Place's accommodation table**
Update `place.yaml`'s accommodation list with the Studios row per build doc §5; add the naming-clarity note about "Studios" vs. "Studio Rooms" once resolved (blocked — see cross-epic blockers).
- AC: table matches build doc §5's spec once terms are confirmed.
- Depends on: **external — Studios residency terms + naming resolution**

**T4.2 — Verify blog carries over unchanged**
`src/pages/blog/`, `src/content/blog/*.md`, `rss.xml.ts` already live at the correct final path (TDD §9 — no move needed). Confirm nothing regresses once Redirect Rules (E6) are in place.
- AC: all 3 posts render at `happenings.kaaya.org/blog/...` post-cutover; RSS feed validates.
- Depends on: E6

---

## Epic E5 — Gallery (net-new)

*TDD §9, §12 phase 3. Highest risk — no existing content or data model.*

**T5.1 — Design content schema for Art, Artist, Cart**
`astro:content` collections: exhibitions (provenance flag for on-site-made pieces), artist profiles + Artist Archive (repeating, blog-equivalent), products (pottery/wood/craft, linkable to originating activity).
- AC: schema reviewed against build doc §4; supports the Studios (T3.2) and Activities (T3.3) cross-links.
- Depends on: —

**T5.2 — Build `src/pages/gallery/art.astro`**
Exhibition listing + detail pages, provenance surfaced on-piece where true.
- AC: matches build doc §4 Art section.
- Depends on: T5.1

**T5.3 — Build `src/pages/gallery/artist.astro`**
Profiles + Artist Archive + Studios/residency feature section.
- AC: matches build doc §4 Artist section, Studios framed as a prominent feature.
- Depends on: T5.1

**T5.4 — Build `src/pages/gallery/cart.astro`**
Shop for pottery/wood/craft pieces; small iconographic cart icon in nav, not a labeled competing nav item.
- AC: matches build doc §4 Cart section and nav-treatment note.
- Depends on: T5.1

**T5.5 — CMS collections for Gallery**
Add folder-based Decap collections for Art/Artist/Cart to `config.yml` (TDD §8) — repeating-entity pattern, same shape as the existing `blog` collection.
- AC: editor can create/edit/delete individual art pieces, artist profiles, products through `/admin`.
- Depends on: T5.1

**T5.6 — Real content population**
Actual exhibition/artist/product data entered via CMS — blocked on real photography and actual gallery inventory, not a code task.
- AC: at least one real exhibition, one real artist profile, one real product live before cutover.
- Depends on: T5.2–T5.5, **external: real photography/content from Kaaya team**

---

## Epic E6 — Cloudflare Pages Setup & Cutover

*TDD §3, §6, §11, §12 phase 4–5. Everything here is edge configuration, not application code — none of it exists in local `astro dev`.*

**T6.1 — Create the one Cloudflare Pages project**
GitHub-connected, standard `astro build` / `dist` output. No root-directory config needed — single app.
- AC: builds and deploys successfully from a push to `main`, reachable on its `*.pages.dev` URL.
- Depends on: E1–E5 substantially complete (needs real routes to test against)

**T6.2 — Attach all 5 custom domains**
`kaaya.org`, `gallery.kaaya.org`, `place.kaaya.org`, `community.kaaya.org`, `happenings.kaaya.org` → the one project (TDD §11).
- AC: all 5 resolve to the project over HTTPS with a valid Cloudflare-issued cert (pre-DNS-cutover, can verify via Cloudflare's staging hostname mechanism or after CNAME is live).
- Depends on: T6.1

**T6.3 — Transform Rules (3)**
Per TDD §3's table: `gallery.kaaya.org` → `concat("/gallery", path)`, `place.kaaya.org` → static `/place`, `community.kaaya.org` → `concat("/community", path)`. `kaaya.org` and `happenings.kaaya.org` need no rule (passthrough).
- AC: each rule live-verified — e.g. `gallery.kaaya.org/art` actually serves the content built at `/gallery/art`, not a 404.
- Depends on: T6.2

**T6.4 — Redirect Rules (6)**
Per TDD §6's table — 4 historical migration rules + 2 leak-guard rules, all scoped to `http.host eq "kaaya.org"`.
- AC: all 6 rules live-verified (`curl -I`), confirming 301 + correct `Location` header for every case in the table, including that `place.kaaya.org/place` (if such a path were requested) is unaffected by rule #1 — proving the host-scoping actually works, not just the path-matching.
- Depends on: T6.2
- **Note:** if the rule #2 `in {...}` list-match expression isn't supported in the Cloudflare Rules builder UI, split into 3 single-value rules instead (TDD §14) — still within the 10-rule Free cap.

**T6.5 — Custom sitemap `serialize()` fix**
TDD §6 — without this, `@astrojs/sitemap` emits every URL under the single `site` origin, contradicting the Redirect Rules in T6.4.
- AC: generated `sitemap.xml` shows `gallery.kaaya.org/...`, `place.kaaya.org/...`, etc. — not everything under `kaaya.org`.
- Depends on: T6.1

**T6.6 — DNS cutover**
Point all 5 domains' DNS at the Cloudflare Pages project (CNAME records for the 4 subdomains, repoint `kaaya.org` itself from GitHub Pages).
- AC: all 5 domains serve the live site; spot-check every row in TDD §3 and §6's tables against production, not just preview URLs.
- Depends on: T6.3, T6.4, T6.5, sign-off on content readiness (E2, E4, E5)

**T6.7 — Decommission GitHub Pages**
Delete `.github/workflows/deploy.yml`, disable GitHub Pages in repo settings.
- AC: confirmed old workflow no longer runs; recommend a short soak period post-T6.6 before deleting, not same-day.
- Depends on: T6.6 confirmed stable

**T6.8 — Sitemap resubmission**
Submit the (now-correct, per T6.5) sitemap to Search Console.
- AC: submitted, no crawl errors after first re-crawl.
- Depends on: T6.6

---

## Epic E7 — Testing

*TDD §13.*

**T7.1 — Configure Playwright**
Add `playwright.config.ts` at the project root.
- AC: `npx playwright test` runs (even with zero tests) against the local dev server.
- Depends on: —

**T7.2 — Per-section smoke tests**
Page loads, nav links are well-formed absolute cross-subdomain URLs. Note: the actual host-based rewrite only exists at Cloudflare's edge (T6.3) — local `astro dev` serves everything under one origin at the unrewritten paths, so these tests check markup/links locally, not live routing.
- AC: one passing smoke test per section.
- Depends on: T7.1, E1–E5

**T7.3 — Live Transform + Redirect Rule tests**
One test per rule in TDD §3 and §6, run against production (post T6.6), not local dev.
- AC: 3/3 Transform Rules + 6/6 Redirect Rules verified.
- Depends on: T6.6

**T7.4 — Banned-vocabulary check wired into CI**
Confirm T3.1's script runs as part of the same CI/PR gate as everything else.
- AC: a PR introducing a banned term fails CI; a clean PR passes.
- Depends on: T3.1, T7.1

---

## Cross-Epic Blockers (not code — need answers before these tickets can close)

| Blocker | Blocks | Owner |
|---|---|---|
| Real photography/imagery | T2.2 (hero/gallery highlights), T5.6 | Kaaya team |
| `place.kaaya.org` booking inbox: new `info@kaaya.org` or keep `connect@kaaya.org` + phone | T2.4 | Kaaya team |
| Incubate form field discrepancy (spec vs. live site) | T1.1 (content carried over) | Kaaya team |
| Learn/Visit content overlap — single canonical source for pottery/trails/nature-art/picnic content | T1.1, T3.3 | Kaaya team |
| Studios residency terms (pricing, duration, application) | T4.1, T5.3 | Kaaya team |
| "Studios" vs. "Studio Rooms" naming clarity | T4.1, T5.3 | Kaaya team |
| Gallery inventory (real exhibitions/artists/products) | T5.6 | Kaaya team |

---

## Suggested Sequencing

```
E1 (route reorg) → E2 (home rebuild) ↘
                                        E6 (Cloudflare setup + cutover) → E7.T7.3 (live rule tests)
E5 (gallery, longest lead time — start once E1 lands, gated on T5.1)  ↗
E3 (cross-cutting rules) — trails E4 + E5, needs both to have real link targets
E4 (place/blog updates) — mostly blocked on external Studios-naming answer, otherwise quick
E7.T7.1–T7.2 — as soon as E1 lands, trail each section as it's built
```

Compared to the earlier monorepo version of this backlog: no workspace-scaffold epic, no per-app CI matrix, no build-watch-paths configuration — those tickets don't exist in this design because there's only one thing to build and deploy.
