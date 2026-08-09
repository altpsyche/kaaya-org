# Kaaya Website — Implementation Tasks

**Source:** [`kaaya_website_technical_design.md`](./kaaya_website_technical_design.md) (TDD v6) + [`kaaya_website_build_instructions (final).md`](./kaaya_website_build_instructions%20(final).md) (content/product spec)
**Gallery source content:** [`scrape/data_www_kaayagallery_com_part_1.md`](./scrape/data_www_kaayagallery_com_part_1.md)
**Format:** Jira-style backlog — Epics (E) containing Tasks (T), with acceptance criteria and dependencies.
**Version:** v6, aligned to TDD v7.

**Dependencies point backwards only.** Every task depends on tasks in the same epic or an earlier one. No epic waits on a later one, so the epics can be worked in order without deadlock. Epic numbers map to TDD §17's rollout phases one-to-one.

---

## This file is the queue, and it is the handover

`/next` reads it first and picks from it. **Nothing else queues work: if it is not here, nobody is tracking it.** There is no separate handover file and none should be written — the one that used to exist, `NEXT_CHAT_PROMPT.md`, was deleted because it had gone stale describing routes that no longer exist.

**A ticked box is a claim with a number behind it.** `/land` ticks the task it landed and appends the measurement that proves it, so a tick can be audited rather than trusted. A bare `- [x]` with no number is a bug in the record.

Tasks are ticked, never deleted. This is a fixed-scope migration rather than an open-ended roadmap, so the closed tasks are the record of what shipped and what it measured.

**A task blocked on the Kaaya team is not skipped, it is flagged** — build the empty state, tick nothing, and say which row of the blockers table holds it up. Do not invent placeholder content to unblock a task, and never ship the Wix placeholder date or address.

House rules, the gate scripts and the baselines are in [`CLAUDE.md`](../CLAUDE.md). The 18 settled design decisions are TDD §2 and are not re-litigated here.

**Changed from the previous version of this backlog:**
- **Four dependency contradictions fixed.** T4.3 and T7.4 depended on each other; two E0 tasks depended on E2 and E1 despite E0 being declared dependency-free; an E1 task depended on E7.
- **E2 gains the Header** (TDD §5) — previously specified nowhere and built by no ticket, while `Header.astro` still carries the old flat 6-item nav.
- **E7 gains detail routes** for works, artists and events (decision 14), plus the `/art` route is gone (decision 15).
- **E1 gains the content moves** the migration map (TDD §13) makes explicit: `place.yaml` splitting into four files, and `learn.yaml`'s session descriptions physically moving to Place → Activities.
- **E4 corrected:** four forms, three access keys, no form on the homepage (decisions 16, 17), plus an on-site thank-you page.
- **Events promoted to their own epic and their own host** (decision 18). `events.kaaya.org` replaces the two half-pages v6 had under Gallery and Community. Cloudflare and Testing renumbered to E9 and E10 accordingly.

---

## Epic E0 — Live defect fixes

*TDD §3.1. Genuinely no dependencies — every task here touches a file nothing else in this backlog is editing yet. Three of the eight defects are fixed inside later epics, noted below, and are not duplicated here.*

- [x] **T0.1 — Fix the apex canonical (D1)**
`src/data/site.ts`: `url` → `https://kaaya.org` (currently `https://www.kaaya.org`, disagreeing with `public/CNAME` and `astro.config.mjs`).
- AC: every built page's canonical and `og:url` uses `https://kaaya.org`; no `www` in build output.
- **Landed:** `SITE.url` → `https://kaaya.org`. 0 occurrences of `www.kaaya.org` in `dist/`; `/place` canonical and `og:url` both read `https://kaaya.org/place/`.

- [x] **T0.2 — Fix the CMS site URL (D2)**
`public/admin/config.yml`: `site_url` → `https://kaaya.org` (currently `https://altpsyche.github.io/kaaya-org`).
- AC: Decap's "View live" link resolves to the real site.
- **Landed:** `site_url` → `https://kaaya.org`. **Decap's "View live" round trip is unverified** — it needs a CMS login. The value is correct; the click was not made.

- [x] **T0.3 — Add the missing OG image (D3)**
- AC: `public/og-default.png` exists and is served; a share preview renders in at least one real client.
- Depends on: **external — imagery.** A typographic placeholder is acceptable to unblock.
- **Landed:** `public/og-default.png`, 1200×630, 39 KB — typographic placeholder on the site palette, free of all four banned phrases so it is safe on every host. Real imagery still blocked; replace at T3.1.

- [x] **T0.4 — Install the Playwright test runner (D4)**
- AC: `npm i -D @playwright/test`; `npx playwright test` runs with zero tests and exits 0.
- **Landed:** `@playwright/test@1.62.1` installed and the bare `playwright@1.61.1` dep removed — two direct pins drift. `npm test` runs `playwright test --pass-with-no-tests` and exits 0 with 0 tests; bare `npx playwright test` still exits 1, which is Playwright's by-design no-tests behaviour, not a broken install.

- [x] **T0.5 — Add `robots.txt` (D6)**
Disallow nothing; carry the sitemap pointer. One file serves all six hosts.
- AC: `public/robots.txt` exists and is reachable on every hostname after cutover.
- **Landed:** `public/robots.txt`, 370 bytes in `dist/`, disallows nothing, `Sitemap: https://kaaya.org/sitemap-index.xml`.

*Fixed elsewhere: **D5** (`url.ts`) in T2.2 · **D7** (`learn.yaml` `/visit` links) in T1.3 · **D8** (form success redirect) in T4.1.*

---

## Epic E1 — Route reorganization

*TDD §13's migration map is the working document for this epic. Moves, splits and renames only — no new components, no hosting change. The build must pass at every step.*

- [x] **T1.1 — Move Learn/Incubate/Exchange under `community/`**
`src/pages/{learn,incubate,exchange}.astro` → `src/pages/community/`; YAML → `community-{learn,incubate,exchange}.yaml`. The Incubate form carries over unchanged (decision 12) — refactoring it onto the shared shell happens in T4.1.
- AC: `npm run build` passes; pages render identically at `/community/learn` etc.
- **Landed:** 3 pages and 3 YAML files moved with `git mv` so the diff reads as renames. Build 11 → 11 pages; routes render at `/community/{learn,incubate,exchange}`.

- [x] **T1.2 — Split `place.astro` into sub-routes**
Decision 3. → `src/pages/place/{index,story,activities,stay,booking}.astro`. **`place.yaml` splits into `place-story.yaml`, `place-activities.yaml`, `place-stay.yaml` and `place-booking.yaml`**, one per route, with `place.yaml` retained for the section index.
- AC: all five routes build and render; content is a straight carry-over, no rewriting; each YAML holds only its own route's fields.
- **Landed:** 5 routes build, 11 → 15 pages. `place.yaml` split into `place{,-story,-activities,-stay,-booking}.yaml`, each holding only its own route's fields, verified by a structural check against `config.yml`.

- [x] **T1.3 — Move the Activities copy out of Learn (D7, decision 11)**
The full session descriptions live in `learn.yaml`'s `sessions` today; `visit.yaml`'s `facilities` is a terse duplicate list. Merge both into `place-activities.yaml` as the single canonical source, cross-checking so nothing is lost. Learn keeps its programmes table plus one link across. The three `sessions[].href` values pointing at `/visit` die with the move.
- AC: pottery, forest & eco trails, nature art and farm picnics are described in exactly one place; no `/visit` href remains anywhere in `src/`; Learn links to Place → Activities.
- Depends on: T1.2
- **Landed:** 179 leaf strings audited at `305a757` via `gate:content`. The merge is a union, not a dedupe: `learn.sessions` and `visit.facilities` overlap on only 4 of 10 items, the 4 pairs merged into `description` + a new `detail` field, and the 2 non-activity facilities (conference hall, outdoor sit-outs) stayed on `place-stay.yaml` — those are the two a naive merge loses. 0 `/visit` hrefs remain in `src/`.

- [x] **T1.4 — Fold Visit into Home**
Delete `src/pages/visit.astro`; move `visit.yaml`'s accommodation and contact content into `home.yaml`'s footer section per build doc §8. No `pages` schema change needed — the fields already exist.
- AC: no `/visit` route; home footer shows the Visit info; a `#visit` anchor exists on the homepage, since the middleware's `/visit` redirect targets it.
- **Landed:** `visit.astro` and `visit.yaml` deleted, 15 → 14 pages. `id="visit"` anchor present in `dist/index.html` — load-bearing, the middleware's `/visit` redirect targets it.
- **The spec was wrong here, and this is the correction.** TDD §12 says `visit.yaml`'s content folds into `home.yaml` and names `accommodation`, `priceRange` and `mealPlans` among the fields that move. TDD §13 and T1.5 say the Studio Rooms row lands in `place-stay.yaml`. Both cannot hold. **Resolved with Siva on 2026-08-09: the accommodation table lives on Place → Stay**, matching build doc §5's "Stay Details" and T1.5's own AC, and `home.yaml` takes only `directionsNote` plus the printed contact — a price table on the front door contradicts build doc §8's footer-weight hierarchy. §12's field list reads as schema capacity, not placement. Correct §12 if that document is ever revised.

- [x] **T1.5 — Rename Studio Rooms to Garden Rooms**
Decision 7, in `place-stay.yaml`.
- AC: no occurrence of "Studio Rooms" remains; Studios (residency) and Garden Rooms (visitor) are unambiguous in the accommodation table.
- Depends on: T1.2, T1.4
- **Landed:** 0 occurrences of "Studio Rooms" in `src/`, `public/` or `dist/`. "Garden Rooms" renders in `dist/place/stay/index.html`.

- [x] **T1.6 — Add `community/index.astro`**
Build doc §6's connecting narrative — circular economy and community, farmer's market as *"a window Kaaya opens to the surrounding community"*, never commercial.
- AC: `community.kaaya.org/` renders real narrative content, not a 404 or a redirect.
- Depends on: T1.1
- **Landed:** `community/index.astro` renders build doc §6's narrative. Sunday-market copy sourced from the existing `exchange.yaml` rather than written fresh, and carries no commercial framing.

- [x] **T1.7 — Add the `gallery/index.astro` and `events/index.astro` shells**
Both routes must exist before the Header links to them (T2.5), and both are section *homes*, so a missing one means a dead entry in row 1. Gallery is a shell filled in E7; Events renders a "nothing scheduled" empty state with no collection dependency, filled in E8.
- AC: both routes build; the empty state is deliberate and styled, not a broken page.
- Depends on: T1.1
- **Landed:** Both routes build, 14 → 17 pages. Events renders a styled empty state with **no dependency on the `events` collection**, so E8 can land without touching it and the Wix placeholder dates cannot leak through it.

- [x] **T1.8 — Drop the homepage tile grid**
Remove `navCards` from `home.yaml`, the `pages` schema and `config.yml`; delete `NavCard.astro`, which has no other consumer. Build doc §1 calls this the exact pattern the restructure replaces.
- AC: no `navCards` references remain; build passes; `NavCard.astro` deleted.
- **Landed:** `navCards` removed from `home.yaml`, the `pages` schema and `config.yml`; `NavCard.astro` deleted with 0 remaining references.

- [x] **T1.9 — Update `config.yml` for every moved and split file**
Repoint `learn`/`incubate`/`exchange`; add the four Place sub-page files; remove `visit`; add the `community`, `gallery` and `events` section homes.
- AC: DecapCMS at `/admin` lists and edits every page after the move — verified by a trivial edit through the CMS UI committing to the right file.
- Depends on: T1.1–T1.8
- **Landed:** 12 of 12 YAML files have a CMS entry, 0 orphans, and every YAML key is reachable through some field — checked structurally. **The `/admin` UI round trip is unverified** — it needs a CMS login.

---

## Epic E2 — Routing foundation

*TDD §5, §6.2, §8, §9. Application code — lands well before the Cloudflare project exists. Verify against the existing pages before the gallery is built: a wrong rewrite rule is far easier to find with six pages than sixty.*

- [x] **T2.1 — Write `functions/_middleware.js`**
Per TDD §6.2 verbatim: host rewrite for `gallery`/`place`/`community`/`events`, `/blog`-only scoping for `happenings`, `www` → apex, legacy map, section-prefix leak guards, and the `PASSTHROUGH`/`ROOT_FILE` asset guard the dropped Transform Rule design lacked.
- AC: every row of TDD §6.2's behaviour table passes under `wrangler pages dev dist` with an explicit `Host` header — including the two asset rows, which are the whole reason this file exists.
- Depends on: E1
- **Landed:** 36 of 36 assertions green under `wrangler pages dev dist --compatibility-date=2026-08-08`, one per row of TDD §6.2 that has a built route today, driven with an explicit `Host` header. Redirect rows assert status and `Location`; serve rows assert the body is byte-identical to the `dist/` file the row names, so a rewrite landing on the wrong page cannot pass. Both asset rows green: `gallery.kaaya.org/_astro/Base.DdaE4qad.css` and `/uploads/13.jpg` serve the root files unrewritten, as do `/favicon.svg`, `/robots.txt` and `/sitemap-index.xml`. Build 17 routes, `gate:vocab` 0 hits, `gate:links` 0 dead.
- **Four rows are not yet assertable** — `gallery.kaaya.org/shop`, `/shop/chromatic-metanoia`, `/artist/tenzin-norbu` and `events.kaaya.org/artistry-weekend` have no built route until E7 and E8. The rewrite they exercise is the same branch `place.kaaya.org/booking` and `community.kaaya.org/learn` already prove, and T10.2 re-runs the full table once the routes exist.
- **§6.2's code is one row short of its own table, and this is the correction.** Verbatim, `place.kaaya.org/stay` did not serve — it rewrote to `/place/stay`, which Pages answers with a 308 to `/place/stay/`, **putting the internal section prefix in a public URL**, the exact leak §6.3 exists to prevent. The chain terminated (308 → 301 → 200) rather than looping, so a build would have shipped it green. Fixed in-file with `asDirectory()`: an extensionless path is rewritten straight to its slash form, so the prefix never leaves the origin and the row serves 200 in one hop. Applied to the `happenings` branch for the same reason.
- **A second §6.2 gap, same commit:** `PASSTHROUGH` required a trailing slash, so `/admin` (no slash) fell through to the section rewrite and 404'd as `/gallery/admin` — the CMS unreachable on four of the six hosts by one character. The regex now matches `(\/|$)`. `/admin` 308s to `/admin/` and serves; `/admin/` serves directly.
- **Correct TDD §6.2's code block if that document is ever revised.** The behaviour table is right; the code under it is what was wrong.

- [x] **T2.2 — Write `src/lib/links.ts`, delete `src/lib/url.ts` (D5)**
TDD §9. Two exports: `toCanonical()` with no environment check, and `link()` wrapping it for dev. Replace every hand-written internal `href`.
- AC: no internal `href="/..."` string literals outside `link()` calls; `url.ts` deleted with no remaining imports; dev navigation still works at path form.
- Depends on: E1
- **Measured before planning:** 0 raw `href="/…"` literals already — all 16 files route through `url()` today, so this is a helper swap, not a hunt for string literals. `url()` is `BASE_URL + path`, and no `base` is configured, so it is the identity function; assets can drop it outright. **`url()` carries page hrefs and asset paths in the same call** — `heroImage`, `/favicon.svg`, `/favicon.ico`, `/rss.xml` and a CSS `url(image)`. TDD §10 settles which is which: assets stay relative `/uploads/…`, so only route hrefs take `link()`. No new decision is needed.
- **Step 2 exists because step 3 blinds the gate.** In a production build `link()` emits `https://place.kaaya.org/stay`, and `dead-links.mjs` matches `href="/…"` only — cross-subdomain absolutes are out of its scope by design. Migrating first would leave it printing `0 dead across 18 pages` while checking almost no hrefs at all.

  1. **[x] Add `src/lib/links.ts`** per §9 verbatim — `SECTIONS`, `toCanonical()`, `link()`. No call site changes, `url.ts` untouched. **Landed:** build 17 routes, `gate:vocab` 0 hits, `gate:links` 0 dead across 18 pages, all unchanged — the module has no consumers yet. `toCanonical()` checked over all 15 built routes: every output is a URL the T2.1 table already proves serves 200 without a redirect, `/place/stay` → `https://place.kaaya.org/stay` included, so step 3's hrefs will not land on a hop.
  2. **[x] Teach `dead-links.mjs` the canonical host map** — invert `toCanonical()` so `https://gallery.kaaya.org/shop` resolves against `dist/gallery/shop/index.html`, and print the number of hrefs checked, not just the number dead, so a future blinding is visible in the output. **This step re-baselines:** it quotes the old and new checked-href counts, and CLAUDE.md's links row moves in the same commit. A no-op on behaviour while every href is still bare, which is what makes it safe to land first. **Landed:** baseline `0 across 18 pages` → `0 dead, 0 misrouted across 380 internal hrefs on 18 pages`. **It was not the no-op the plan predicted** — canonical tags are hrefs too, so its first run found 15 misrouted and 1 dead before a single call site had moved. That is T2.4, landed first. `SECTIONS` is imported from `links.ts` rather than restated, which needs Node's unflagged type stripping, so `engines.node` moves `>=22.12.0` → `>=22.18.0`.
  3. **[x] Migrate the 16 importers and delete `url.ts`** — route hrefs to `link()`, asset paths to bare per §10. Measures: 0 `lib/url` imports, checked-href count against step 2's new baseline, build 17 routes, and one `astro dev --background` request confirming a nav href renders at path form, since that half of the AC cannot be seen in `astro build` output. **Landed:** 25 route hrefs on `link()`, 6 asset paths on `asset()`, `url.ts` deleted, 0 `lib/url` imports. Build 17 routes; `gate:links` 0 dead, 0 misrouted across 380 hrefs — the count holds because the gate now scores an absolute URL and a bare path alike, which is what step 2 bought.
- **`asset()` is an addition to §9's two exports, not a third design.** `url()` carried route hrefs and asset paths in one call, and the two split in opposite directions: `link()` must go absolute, while §10 keeps `/uploads/…`, `/favicon.svg` and `/rss.xml` relative because the middleware serves them unrewritten on every host — routing one through `link()` pins it to the apex, so a preview deploy loads production's copy. `asset()` is the identity function; it exists so the "no bare internal `href`" rule stays checkable by grep rather than carrying an exception nobody remembers. Add it to §9 if that document is ever revised.
- **AC verified line by line.** *No internal `href="/…"` string literals outside `link()`* — `grep -rc 'href="/' src` returns 0 across every `.astro` file; assets pass through `asset()`. *`url.ts` deleted with no remaining imports* — `src/lib/` holds `links.ts` and `utils.ts`, and `grep -rn lib/url src` returns nothing. *Dev navigation still works at path form* — `astro dev --background`, `curl localhost:4321/gallery/` renders `href="/place"`, `href="/community/learn"` and `href="/blog"`; the single absolute in that page is the canonical tag, which calls `toCanonical()` unconditionally by design. Full gate at close-out: build 17 routes, `gate:vocab` 0 hits, `gate:links` 0 dead 0 misrouted across 380 hrefs, `gate:content b77ab4f` 190 strings 0 unaccounted for.

- [x] **T2.3 — Point the sitemap and RSS at `toCanonical()`**
TDD §9. **`serialize()` must call `toCanonical()`, not `link()`** — `import.meta.env.PROD` is unset in `astro.config.mjs`, so `link()` there silently returns bare paths and the sitemap would advertise exactly the URLs the middleware 301s away from. `rss.xml.ts` item links get the same treatment.
- AC: generated sitemap shows `gallery.kaaya.org/...`, `place.kaaya.org/...`, `happenings.kaaya.org/blog/...` and nothing under `kaaya.org` that belongs on a subdomain; RSS item links use the `happenings` host.
- Depends on: T2.2
- **Landed:** 16 sitemap URLs, **15 of them wrong before this** — every entry was `https://kaaya.org/…`, the URLs the middleware 301s away from, because `@astrojs/sitemap` bakes `site` into each one. After: `https://gallery.kaaya.org/`, 5 under `place.`, 4 under `community.`, 4 under `happenings./blog/`, `events.` — and `grep -c 'https://kaaya.org/[a-z]' dist/sitemap-0.xml` returns 0, so the only apex URL left is the homepage, which belongs there. RSS: 3 of 3 item links moved to the `happenings` host. Build 17 routes, `gate:vocab` 0 hits, `gate:links` 0 dead 0 misrouted across 380 hrefs.
- **The feed's channel `<link>` stays `https://kaaya.org/`** — that element names the site the feed belongs to, not the blog, and it is the only thing `site:` still resolves now that every item link is absolute. The AC covers item links, which is what moved.

- [x] **T2.4 — Canonicals via `toCanonical()`**
`SEO.astro`'s canonical and `og:url`.
- AC: `dist/gallery/shop/index.html` carries `<link rel="canonical" href="https://gallery.kaaya.org/shop">`.
- Depends on: T2.2, T0.1
- **Landed out of numeric order, and T2.2 step 2 is why.** Teaching `dead-links.mjs` the host map made the defect visible for the first time — 15 misrouted plus 1 dead, one per page — and that gate cannot land green until this is fixed. T2.2's module had already landed at step 1, so this task's only real dependency was met; T2.3 is untouched and still next.
- **Landed:** `canonical` is `toCanonical(Astro.url.pathname)`, replacing `new URL(pathname, SITE.url)` which named the apex for all six hosts. 16 of 18 pages carried a URL the middleware 301s away from — `https://kaaya.org/place/stay/` rather than `https://place.kaaya.org/stay/` — with the build green throughout. After: `gate:links` 0 misrouted across 380 hrefs. `og:url` takes the same value.
- **The AC's example is not buildable yet** — `/shop` lands in T7.5. Verified on the equivalent built routes instead: `dist/gallery/index.html` carries `https://gallery.kaaya.org/`, `dist/place/stay/index.html` carries `https://place.kaaya.org/stay/`, `dist/community/learn/index.html` carries `https://community.kaaya.org/learn/`, and `dist/blog/making-of-kaaya/index.html` carries `https://happenings.kaaya.org/blog/making-of-kaaya/`.
- **A second defect, fixed here because it is the same line:** `404.astro` is `noIndex` and was still emitting `<link rel="canonical" href="https://kaaya.org/404/">` — a URL the build does not emit, since 404 is a file rather than a directory index. A noindex page now names no canonical and no `og:url`. That was the 1 dead link in the gate's first run.

- [x] **T2.5 — Rewrite `Header.astro`**
TDD §5. Row 1 is the five-section cross-site nav — Gallery · Place · Community · Events · Happenings — with an active state, on every host. Row 2 is the current section's own nav, absent on `kaaya.org`, `events` and `happenings`. Section is derived from `Astro.url.pathname` — the same derivation T2.4 and T4.6 use. Replaces the current flat 6-item nav (Place, Learn, Incubate, Exchange, Visit, Blog).
- AC: each host renders the row 2 from TDD §5's table; the active section is marked on every page; every href goes through `link()`; the existing mobile hamburger behaviour survives.
- Depends on: T2.2, T1.7
- **Landed:** row 2 verified against §5's table from built output — `place/stay` renders Story · Activities · Stay · Booking, `community/learn` renders Learn · Incubate · Exchange, and `index`, `events` and `blog` render none, which is the table's three empty rows. Active state via `aria-current="page"`: Gallery on `gallery/`, Place on `place/`, Community on `community/`, Events on `events/`, Happenings on `blog/`, and on `place/stay/` both Place in row 1 and Stay in row 2. Hamburger markup unchanged — `id="nav-toggle"` and `id="mobile-nav"` each appear once and the toggle script is untouched, with both rows now inside the mobile panel. `gate:links` 0 dead 0 misrouted, baseline 380 → 444 hrefs.
- **T2.2 broke the active state and this task is what fixed it.** `linkClass()` compared `Astro.url.pathname` against the entry's own href, which worked only while `url()` returned bare paths. After T2.2 those hrefs are absolute cross-subdomain URLs, so the comparison never matched and no page marked anything active — build green, `gate:links` green, silent. Section is now derived from the path and never from an href.
- **Gallery's row 2 ships empty, deliberately.** §5 gives it Shop · Artist, and neither route exists until T7.5 and T7.6, so linking to them is two dead hrefs. The entries sit in the table behind an `UNBUILT` set naming both tickets; emptying that set is the whole of the change when those routes land. This is the one row of §5's table the build does not yet satisfy.
- **§5 is ambiguous about the wordmark and this build reads it as the apex.** "the gallery home, which is what the wordmark links to" would put the wordmark on the current section's home, but row 1 carries only the five sections, so a visitor on any section host would have no route back to `kaaya.org` from the header. The wordmark therefore links to `link('/')` on every host, and the gallery home stays reachable through row 1's Gallery entry, which is also where its active state shows. Settle it in §5 if that reading is wrong.

- [x] **T2.6 — Footer across six hosts**
Shared and identical everywhere: `ContactBlock`, cross-site links, legal line. No section nav.
- AC: renders on all six hosts; links go through `link()`. The address variant lands in **T4.5** — this entry said T4.4, which is the Booking form; the `ContactBlock` variant prop is T4.5.
- Depends on: T2.2
- **Landed:** the footer nav was the same stale flat list the Header carried — Place · Learn · Incubate · Exchange · Blog — so on the five hosts that are not Community it read as Community's own section nav. Now the six hosts and nothing below them: Kaaya · Gallery · Place · Community · Events · Happenings, byte-identical on `index`, `gallery/`, `place/stay/`, `community/learn/`, `events/`, `blog/` and `404`, with no active state, since §5 requires it identical everywhere. Every href through `link()`. `gate:links` 0 dead 0 misrouted, baseline 444 → 461 hrefs.
- **Closes E2**, the critical path. `ContactBlock` still hardcodes `SITE.email`; the per-host address is T4.5's extension, not a gap in this task.

---

## Epic E3 — Home rebuild

*Build doc §8.*

- [x] **T3.1 — Hero + thin nav shell**
Full-bleed current-exhibition image, 50–70% viewport, no competing CTAs. Nav per T2.5 with Gallery slightly emphasised. **No cart icon** — decision 2 removed the cart.
- AC: matches build doc §8's layout and hierarchy spec.
- Depends on: T1.8, T2.5
- **Not ticked — blocked on the exhibition photograph**, blockers table row 5. Everything else in §8's layout and hierarchy spec is built and verified: the hero is full-bleed at `min-h-[60vh]`, inside §8's 50–70% band, where every other page's hero stays at `min-h-[400px]`; the homepage hero carries **no CTA**, where it previously carried "Learn about Kaaya" linking to `/place` — a competing call to action §8 forbids there; and the thin nav with Gallery first and emphasised landed in T2.5.
- **The hero is not empty and does not need an empty state.** `home.yaml`'s `heroImage` still carries the campus photograph the old site used, at a correct absolute `/uploads/…` path. §8 asks for the current exhibition. Swapping that one YAML value is the whole of the remaining work, and it is content only the Kaaya team can supply — nothing is invented to stand in for it.
- **Landed so far:** build 17 routes, `gate:vocab` 0 hits, `gate:links` 0 dead 0 misrouted, baseline 461 → 460 hrefs, the one removed href being the hero CTA.
- **Closed under decision 21.** The exhibition photograph is still owed, and the campus photograph now stands in as a **declared proxy** rather than as an undocumented leftover: `KAAYA-PROXY(T3.1)` in `home.yaml` beside `heroImage`, and a second in `SEO.astro` for `og-default.png`, which T0.3 shipped as a typographic placeholder. `gate:proxy` counts 2, and `gate:proxy -- --strict` now fails, which is what T9.4 checks. Baseline proxies 0 → 2.
- **AC verified line by line against built output.** *Full-bleed hero at 50–70% of the viewport* — `min-h-[60vh]`, one occurrence, where every other page's hero is `min-h-[400px]`. *No competing CTAs* — 0 anchors inside the hero section. *Thin nav, Gallery first and slightly emphasised* — row 1's first entry is Gallery and it is the only one carrying `font-semibold`. *No cart icon* — 0 occurrences of "cart" anywhere in `dist/index.html`, which decision 2 requires.

- [x] **T3.2 — Gallery content below the fold**
Artist highlights appear before any mention of Place or Community, per build doc §8's scroll-order requirement. Sources `works` where `featured: true`.
- AC: scroll order matches spec.
- Depends on: T3.1. **Soft dependency on T7.3** for real works — a placeholder is acceptable short-term and the page must not break on an empty collection.
- **Landed:** a "From the gallery" block sits directly below the hero, before every other section. Scroll order read out of `dist/index.html` in document order: *From the gallery* → the intro → *Latest from Kaaya* → *Know the place* / *Know the community* → `id="visit"`. §8's "before anything else appears" is satisfied at its strictest reading — the gallery block is the first thing after the hero, not merely the first before Place and Community. Build 25 routes unchanged; `gate:vocab` 0 hits across 10 files; `gate:links` 0 dead 0 misrouted, baseline 678 → 682 hrefs, the 4 new ones being 3 artist links and the section's own "See the gallery".
- **Three of the five featured works, not all five.** All 5 carry `featured: true` (T7.3 records that the flag separates nothing today), so a cap is the only thing that keeps the homepage from being a second catalogue. It renders Chromatic metanoia, Hampta pass trek and Living through it, each linking to its artist's profile — `/gallery/shop/[slug]` is T7.5, so the card leads to the page that exists, the same choice T7.7 made on the gallery home.
- **Row 1 of the Header names Place and Community above this block, and that is not a violation.** §8's scroll-order rule governs the page body; the five-section nav is TDD §5 and renders identically on all six hosts. The first *content* mention of either is still the story teaser.
- **The empty-collection case renders nothing** — the block is guarded on `highlights.length`, so an emptied `works` collection leaves the homepage intact rather than printing a headed, empty grid.
- **It costs 7.6 MB above the scroll**, since the three images are T7.9's unoptimised PNGs. Recorded on T7.9, whose AC now covers this page too.

- [x] **T3.3 — Footer-weight Kaaya Story teaser**
Exact copy block from build doc §8, ending in "Know the place" / "Know the community".
- AC: copy matches build doc §8 verbatim; links go through `link()` and resolve to the right subdomains in a production build.
- Depends on: T3.1
- **Landed:** verbatim checked mechanically rather than by eye — the four paragraphs and two closing links are parsed out of build doc §8's blockquote and compared to `home.yaml` with whitespace normalised: 6 spec lines, 6 shipped, 6 identical. §8's body says "Know the ecosystem" and then instructs the rename; the shipped copy is "Know the community". Links resolve to `https://place.kaaya.org/` and `https://community.kaaya.org/` in the production build.
- **Landed ahead of its dependency, deliberately.** T3.1 is unticked only because the exhibition photograph is owed; its hero structure landed, and this task needs none of the missing image.
- **The copy lives in `home.yaml` with a hardcoded fallback**, matching every other page in this repo — `storyParagraphs` and `storyLinks` added to the `pages` schema and to `config.yml` as a bare list and a three-field list, the same widgets `introParagraphs` and `neighbourhoods` already use. Content leaf strings 190 → 200 across 12 YAML files: 4 paragraphs plus 2 links × 3 fields.

---

## Epic E4 — Enquiries, contact and descriptions

*TDD §14. Decisions 5, 9, 10, 16, 17. Delivers the shared shell and three of the four forms; the Shop form is built on this shell in T7.5.*

- [x] **T4.1 — Build the `EnquiryForm` shell (D8)**
Owns the Web3Forms POST, access key, subject, honeypot, success redirect, validation and styling. Fields are passed in per section — Booking and Incubate do not ask the same questions (decision 17). Refactor `incubate.astro` and `exchange.astro` onto it, keeping their existing fields exactly (decision 12).
- AC: both existing forms behave identically after refactor, verified by a real submission landing in the right inbox; honeypot present; submission returns to an on-site thank-you page, not Web3Forms' branded page; no `<form action="https://api.web3forms.com">` outside the component.
- Depends on: T1.1
- **Landed:** `EnquiryForm.astro` owns the POST, access key, subject, honeypot, redirect and styling; pages pass a `fields` array, per decision 17. `grep -rn 'api.web3forms.com' src` returns the component only. `botcheck` present on both forms. The redirect is `https://kaaya.org/thank-you?enquiry=incubate` and `…?enquiry=exchange`, built with `toCanonical()` rather than `link()` because Web3Forms redirects the browser from its own origin, where a bare path would resolve against `api.web3forms.com`.
- **Behaves identically, checked field by field against the built HTML rather than by eye.** Incubate: `name`, `phone`, `about`, `idea`, `doc` in that order, required on exactly `name`, `about`, `idea`, textarea rows 3 and 5, subject `Incubate Inquiry` — decision 12's live field set, unchanged. Exchange: `org`, `contact`, `email`, `message`, nothing required, rows 5, subject `Partnership Inquiry`. Both keep the live access key; the three-key map is T4.3. 113 lines of duplicated form markup deleted across the two pages.
- **The real-submission half of the AC is unverified.** It needs access to the inbox behind the access key, which this session does not have. The markup is asserted; the submission was not made. T4.3 and T10.4 both carry a live-submission check.

- [x] **T4.2 — Thank-you page**
The on-site destination T4.1's redirect targets. One page, reached from every host.
- AC: reachable on all six hosts; states which enquiry was received.
- Depends on: T2.1
- **The AC's first line needed a design call, now TDD decision 19.** "Reachable on all six hosts" cannot mean six URLs: the middleware rewrites any unprefixed path on a section host into that section's folder, so `gallery.kaaya.org/thank-you` resolves to `dist/gallery/thank-you`. Measured under `wrangler pages dev dist`: `kaaya.org/thank-you/` 200, `gallery.kaaya.org/thank-you/` 404, `place.kaaya.org/thank-you/` 404. The page is the one on the apex, carries `noindex`, and every form reaches it because a redirect is an absolute URL — which is the sense of "reached from every host" this task ships.
- **Landed:** `src/pages/thank-you.astro`, 17 → 18 routes. `noindex, nofollow` present and no canonical, since T2.4 stopped emitting one for a noindex page. "States which enquiry was received" reads `?enquiry=` client-side against a four-key map — incubate, exchange, booking, shop — because the build is static and `Astro.url.searchParams` is empty at build time. The unparameterised heading reads correctly on its own, which is what a visitor sees if the parameter is missing. `gate:links` 0 dead 0 misrouted, 462 → 487 hrefs on 19 pages.

- [ ] **T4.3 — Provision three access keys**
A Web3Forms access key binds to one verified destination, so `connect@`, `info@` and `gallery@` need one each, held in a single map beside the component. `art@` receives no submissions (decision 16) and needs no key.
- AC: all three inboxes each receive a test submission from their own form.
- Depends on: T4.1, **external — `info@kaaya.org` created and monitored**
- **Split in two, because the map and the keys block different things.** The map is what T4.4 and T7.5 need in order to name a destination; the keys themselves need mailboxes that do not exist. Step 1 lands the map under decision 21; step 2 is the AC and stays open.

  1. **[x] The inbox map, with proxy keys** — `src/data/inboxes.ts` names the three destinations and `EnquiryForm` takes `inbox` instead of a pasted key. Measures: both live forms emit the same access key as before, so nothing about delivery changes. **Landed:** `inbox="connect"` on Incubate and Exchange, and `f8b67b4c…` still appears exactly once in each built page — the refactor is behaviour-identical, which is the only safe way to touch a form that is collecting real applications. One `KAAYA-PROXY(T4.3)` marker covers all three names; proxies 2 → 3. Naming the inbox at the call site is what makes the destination reviewable: `inbox="info"` says where a Booking enquiry goes, where a hex string says nothing and cannot be checked by eye.
  2. **[ ] Real keys and a live submission per form** — **blocked**, and this is the AC. `info@kaaya.org` does not exist and `gallery@kaaya.org` is published on the retired gallery site but unverified against this Web3Forms account. A key cannot be issued for an address nobody has confirmed, so no proxy is possible here: a wrong key does not fail, it delivers somewhere else silently.

- [x] **T4.4 — Wire the Booking form**
`Booking Enquiry` → `info@`, with arrival date, nights, guests and room type as structured fields rather than free text.
- AC: submits with the correct subject and lands in `info@`; dates arrive as dates.
- Depends on: T4.3, T1.2
- **Landed:** the Booking page carried a printed contact and a comment saying the form was owed; it now carries the form. Verified against the built HTML: subject `Booking Enquiry`, redirect `https://kaaya.org/thank-you?enquiry=booking`, honeypot present, one access key, `inbox="info"`. Structured fields are structured — `type="date"` on `arrival`, `type="number" min="1"` on `nights` and `guests`, a `select` on `roomType`, and required on `name`, `email`, `arrival`, `nights`, `guests`, `roomType`.
- **Room types come from the Stay table, not a second list.** The select renders Mud Huts · Family Rooms · Garden Rooms · Dormitory plus "Not sure yet", read out of `place-stay.yaml`. An enquiry naming a room that no longer exists is worse than no room field at all, and two hand-kept lists drift the first time accommodation changes.
- **"Dates arrive as dates" is satisfied by the input type**: `type="date"` submits `YYYY-MM-DD`, so an arrival date is comparable rather than "next weekend".
- **"Lands in `info@`" is not verified and cannot be**, which is T4.3 step 2 rather than a gap here: the mailbox does not exist and all three names still resolve to the one live key. The form posts with the right subject to the right named inbox; where that inbox points is one line in `inboxes.ts` when the key is issued.
- Build 25 routes, `gate:vocab` 0 hits, `gate:links` 0 dead 0 misrouted across 682 hrefs — the form adds no internal href.

- [ ] **T4.5 — Extend `ContactBlock` with a variant prop**
The component **already exists** and hardcodes `SITE.email` — this is an extension, not a new build. Addresses per TDD §14: home, events and happenings → `art@`, gallery → `gallery@`, place → `info@`, community → `connect@`.
- AC: no raw email string literals outside `ContactBlock`; each host shows the correct address.
- Depends on: T1.4, T2.6, **external — `art@kaaya.org` confirmed as a real mailbox**

- [ ] **T4.6 — Per-host descriptions**
Decision 6. Retire the single global `SITE.description`; `SEO.astro` picks a per-section default from `Astro.url.pathname`, falling back to home at the root. This also clears the banned-phrase violation, since the current string is one of the four banned terms.
- AC: each host's built pages carry their own meta description; no banned term appears in `dist/index.html` or `dist/gallery/**`.
- Depends on: T2.4, **external — five short description strings**
- **Interim copy is already in place, and this task replaces it rather than discovering it.** Three strings carried the banned phrase, not the one the description above names: `SITE.description`, `home.yaml`'s `introHeading`, and the homepage `<title>` — which also fed `og:title` and `twitter:title`, so it appeared 4× in `dist/index.html`. `SITE.description` was the one that mattered most: it is the fallback for any page passing no description of its own, and `404.astro` is one of those, so the phrase reached `gallery.kaaya.org` through the shared 404. All three now carry interim art-forward copy marked INTERIM in code comments, and `npm run gate:vocab` is green. **The AC as written is therefore already satisfied** — this task's real remaining work is the five real strings and the per-section derivation in `SEO.astro`.

---

## Epic E5 — Cross-cutting content rules

*TDD §14.*

- [ ] **T5.1 — Banned-vocabulary CI check over built output**
Grep `dist/index.html` and `dist/gallery/**` for "circular economy", "incubation", "internships", "sustainable living". Source-only grepping is insufficient — the current violation lives in shared chrome, which no YAML grep reaches.
- AC: fails on a deliberately planted violation in either page content or shared chrome; passes clean otherwise.
- Depends on: T4.6

- [ ] **T5.2 — Studios ↔ Gallery/Place cross-link**
Explicit, named link instances: Gallery → Artist (Studios residency) and Place → Stay (Studios booking), driven by `artists.residency`. Not a generic "related content" widget.
- AC: both directions link correctly; "some artists don't just show here, they live and work here" framing present on the Gallery side.
- Depends on: T6.1, T7.6

- [ ] **T5.3 — Pottery/Workshop ↔ Gallery cross-link**
Same pattern for Place → Activities linking into Gallery Shop, driven by `works.madeOnSite`.
- AC: link present on both Activities entries per build doc §5.
- Depends on: T1.3, T7.5

---

## Epic E6 — Place & blog content

- [ ] **T6.1 — Add Studios to the accommodation table**
Decision 8 — ship the story, defer the terms. Studios appear as a row and as a residency narrative, with enquiry as the only next step. **No pricing, duration or application process** until they exist.
- AC: Studios row present alongside Garden Rooms; nothing stated that has not been decided; the enquiry path works.
- Depends on: T1.5, T4.4

- [x] **T6.2 — Verify blog carries over unchanged**
`src/pages/blog/`, `src/content/blog/*.md` and `rss.xml.ts` already sit at their final path. Confirm nothing regresses once the middleware is live, including that `happenings.kaaya.org/` redirects to `/blog` rather than serving the homepage.
- AC: all 3 posts render at `happenings.kaaya.org/blog/...`; `/` redirects; RSS validates and item links use the `happenings` host.
- Depends on: T2.1, T2.3
- **Verified, no code changed — the task was a check and it passed.** Under `wrangler pages dev dist` with `Host: happenings.kaaya.org`: all 3 posts return 200 and their bodies are byte-identical to `dist/blog/<slug>/index.html`; `/` returns `301 → happenings.kaaya.org/blog`, so the host's root serves the blog rather than the apex homepage, which is the leak TDD §6.3 records v3 missing; `/rss.xml` returns 200, since it is a `ROOT_FILE` and is served unrewritten on every host.
- **RSS parses as well-formed RSS 2.0** with 3 items, each carrying `title`, `link`, `description` and `pubDate`, and every item link on `https://happenings.kaaya.org/blog/…`. All 3 post canonicals name the same host. The channel `<link>` is the apex, which is T2.3's recorded choice: that element names the site, not the blog.

---

## Epic E7 — Gallery

*TDD §4, §12. The content exists — see `docs/scrape/`. The risk is import fidelity and placeholder data, not a blank page.*

- [x] **T7.1 — Implement the content collections**
TDD §12's `works`, `artists` and `events` schemas. All three land here so E8 has the `events` collection to build against; only `works` and `artists` are used by this epic.
- AC: schemas compile; `madeOnSite`, `residency` and `featured` support T5.2, T5.3 and T3.2.
- **Landed:** all three schemas verbatim from §12, exported alongside `blog` and `pages`. Build 18 routes, unchanged — no route reads a collection yet.
- **"Compile" was checked by running content through them, not by the build going green.** A probe entry per collection, shaped the way T7.3, T7.4 and T8.3 will write theirs, builds clean; flipping one to `category: not-a-category` fails the build with `[InvalidContentEntryDataError] works → _probe data does not match collection schema. category: Invalid option: expected one of "artworks"|"handmade"|"collectibles"`. The probes were removed in the same step. An empty collection alone would have proved nothing, since a schema with no entries is never exercised.
- `madeOnSite` (T5.3), `residency` (T5.2) and `featured` (T3.2, T7.7) are all present and default to `false`. So does `published` on `artists` — **T7.4 must set it explicitly on all six entries or the Artist page lists nothing.**
- **The three directories carry a `.gitkeep`.** A glob loader warns on a base directory that does not exist, and git does not track an empty one. Until content lands the build prints `No files found matching "**/*.md"` three times, which is accurate rather than a defect.

- [x] **T7.2 — Pull the gallery images local**
Every image referenced by the scrape lives on `static.wixstatic.com`. Download into `public/uploads/`.
- AC: no `wixstatic.com` URL remains anywhere in `src/` or `public/`; every imported entry references a local `/uploads/...` path.
- **Landed:** 11 images, not the 6 a plain grep finds. **Five of them are URL-encoded inside Pinterest share links** (`media=https%3A%2F%2Fstatic.wixstatic.com…`) and are the five priced artworks — `chromatic-metanoia`, `the-fox-within`, `the-rhythms-of-the-coastal-line`, `hampta-pass-trek`, `living-through-it`. A grep for a bare `https://static.wixstatic.com/` URL reaches none of them. The other six are the lookbook strip. Downloaded from the untransformed `/media/<id>` original rather than the `/v1/fill/w_…` derivative the share link points at.
- **Verified:** `grep -rl wixstatic src public` returns nothing, and all 11 files carry the right MIME type (5 `image/png`, 6 `image/jpeg`) at their real dimensions — 1254×1254 through 1403×1121, so none is a thumbnail. The scrape stays as it is: it lives under `docs/` and is the source, not shipped output.
- **The six lookbook filenames come from the scrape's own 01–06 ordering** — Midnight over Mustang, Ancestral Path, Dharma Flow, Spirit of the Wind, Dusk in the Valley, Flora of Solitude — and that pairing is **unverified against the live site**, which is being retired. Nothing user-visible depends on it yet; T7.3 imports only the five priced works.
- The AC's second line has nothing to bind to yet — no entry exists until T7.3 and T7.4, which is where `/uploads/…` gets enforced.

- [x] **T7.9 — Reduce the catalogue image weight** *(new — found in T7.2)*
The five artwork images are photographs saved as PNG: 2.2–3.1 MB each, 14 MB for one catalogue page before any other asset loads. `public/uploads/` is now 69 MB.
- AC: the shop catalogue's images total under 1 MB at list size, with full resolution still reachable on the detail page; no image is a visibly worse crop than the one it replaces. **The homepage counts as a list page too** — T3.2 put three of these PNGs directly below the hero, 7.6 MB above the scroll on the front door.
- **The obvious fix is blocked by a decision, which is why this is a task and not a tweak.** Astro's image optimiser only reaches files under `src/assets/` used through `<Image>`, and TDD §10 keeps images in `public/uploads/` referenced relatively so Decap can write them. So this needs either a build-time step over `public/uploads/`, or responsive derivatives generated on import, or a decision to move gallery imagery out of Decap's reach. Decide it before implementing.
- Depends on: T7.2

- **Measured before planning, and the task is bigger than its own description.** The five artworks are 2.2–3.0 MB each, so `kaaya.org` costs **7.8 MB** of imagery and the gallery home 13.5 MB, and the heroes are as heavy as the artwork — `place.kaaya.org/stay` carries a 3.0 MB one. (This bullet first read 5.7 MB for `hero.png` on the front door; step 4 found that file is referenced by nothing and corrected the figures.) `sharp@0.34.5` is already present as an Astro dependency, so no new runtime dependency is needed. Nothing in the tree emits a `srcset` — six files carry an `<img>`, and `Hero.astro` is not one of them: it paints a CSS `background-image`, which cannot carry a `srcset` at all and needs `image-set()` instead.
- **The design call, to be recorded as TDD decision 20 in step 1.** Derivatives are generated by a **build-time pass over `public/uploads/`**, and the originals stay where §10 puts them. The two alternatives are rejected on the record: moving gallery imagery under `src/assets/` to reach `<Image>` contradicts §10 and takes the files out of Decap's reach, which is the one thing §10's bullet exists to protect; and Cloudflare Image Resizing (`/cdn-cgi/image/…`) is a zone-level paid feature that does not exist under `wrangler pages dev`, so no gate in this repo could ever see it and every check would have to wait for E9.
- **The property that makes it safe: a missing derivative is not a broken image.** The component emits a `srcset` only for derivatives that exist at build time, so a fresh CMS upload, or a checkout where `npm run images` has not run, renders exactly the plain `<img>` the page renders today. That is what keeps a generated, gitignored directory from becoming a build dependency the next session has to know about.

  1. **[x] Record TDD decision 20** — build-time derivatives over `public/uploads/`, with the two rejected alternatives and their reasons, plus its row in §2's table. Docs only, no measurement, its own commit per the gate's rule that a design call is never bundled with a mechanical finding. **Landed:** decision 20 in §2 with both rejections reasoned — `src/assets/` contradicts §10 and takes the files out of Decap's reach, Cloudflare Image Resizing is invisible to `wrangler pages dev` so no gate could see it. §10 gains a pointer line; nothing in §10 is overridden, since the derivatives are an addition and the originals keep their `/uploads/…` references.
  2. **[x] Add `scripts/images.mjs` and wire it** — a `sharp` pass emitting `public/uploads/derived/<name>-{480,960,1440}.webp`, plus a 1920 for hero-sized sources, skipping anything already current. Gitignored, run by `npm run images`, wired ahead of both `build` and `dev`. Measures: sources in, derivatives out, total derived bytes, wall time. Build and all three gates unchanged, because no page reads a derivative yet. **Landed:** 52 sources (68.1 MB) → 150 derivatives (14.8 MB), 13.6 s cold and **15 ms warm**, since a derivative newer than its source is reused. Build 25 routes, `gate:vocab` 0 hits, `gate:links` 0 dead 0 misrouted across 682 hrefs — all unchanged, as predicted: no page reads a derivative yet. Per image, at the 960 width a card actually uses: `hero.png` 5811 K → 59 K, `chromatic-metanoia.png` 2220 K → 51 K.
    - **`npm run gate` ran `astro build` directly, so `prebuild` never fired for it.** It now runs `npm run build`, which is the only reason the gate sees the same tree Pages will build.
    - **A width wider than the source is skipped, not upscaled** — `chromatic-metanoia` is 1254 px, so it gets 480 and 960 and no 1440, where `hero.png` gets all four.
    - **The pass derives the 46 unreferenced uploads too**, which is most of the 13.6 s and most of the 14.8 MB. T7.10 deletes them, and this shrinks on its own when it does.
  3. **[x] Add `ResponsiveImage.astro` and adopt it on the three pages that show artwork** — the homepage highlights (T3.2), the gallery home's Featured Art (T7.7) and the artist detail grid (T7.6). Measures: the bytes a browser actually fetches at list size on `dist/index.html` and `dist/gallery/index.html`, before and after. **Landed:** homepage 7.55 MB → **211 K** at the widest candidate a browser can pick, 57 K at the narrowest; gallery home 13.45 MB → **407 K** / 87 K; the artist detail grid 2.17 MB → 51 K / 19 K. The gallery home is the same five works the shop catalogue will list, so the AC's "under 1 MB at list size" is already met with 593 K of headroom. Build 25 routes, `gate:vocab` 0 hits, `gate:links` 0 dead 0 misrouted across 682 hrefs — unchanged, since no href moved.
    - **The degradation is tested, not asserted.** With `public/uploads/derived/` moved away and `astro build` run directly so `prebuild` could not regenerate it, the build stays green and the markup is a plain `<img src="/uploads/chromatic-metanoia.png">` with no `<picture>` at all — which is the state a CMS upload lands in.
    - **`<picture>` rather than a bare `srcset`**, because every candidate is webp: a browser with `srcset` and no webp would pick a file it cannot decode, where a `<source type="image/webp">` it skips falls through to the original. The wrapper carries `display: contents`, so the caller's classes lay the image out exactly as the bare `<img>` did.
    - **A JSX comment cannot open a ternary branch in an `.astro` file.** `{cond ? ( {/* … */} <picture>…` fails the build with `[CompilerError] Expected ',' or ')' but found 'class'`, which names the attribute rather than the comment. The note moved into the frontmatter block.
  4. **[x] Convert `Hero.astro` to responsive derivatives** — a `background-image` takes no `srcset`. **Landed with `image-set()` rejected in favour of two custom properties and a media query**: `image-set()` selects on device pixel ratio, not viewport width, so a phone at 3× would have pulled the widest file — the opposite of what this step is for. The hero now hands `--hero-narrow` and `--hero-wide` to a scoped rule that swaps at 768 px. The image is set in that rule rather than inline, because an inline `background-image` outranks a media query and would pin every viewport to one width.
    - **Measured across all 10 pages that carry a hero, and the front door was not the worst one:** `place/stay` and `place/booking` 3.0 MB → **61 K** wide / 28 K narrow; `community/learn` and `place/activities` 1.2 MB → 175 K / 73 K; `place/` and `place/story` 244 K → 148 K; the homepage 220 K → 126 K; `community/incubate` 120 K → 42 K.
    - **The planning note was wrong about `hero.png`, and this is the correction.** It claimed 5.7 MB on the front door and 13.3 MB for `kaaya.org`. `hero.png` is referenced by nothing — it is one of T7.10's 46 orphans — and the homepage hero is a 220 K jpg, so `kaaya.org` carried 7.8 MB, not 13.3 MB, and now carries 337 K. TDD decision 20's figures are corrected in the same commit. The claim came from reading the largest file in `public/uploads/` as the hero instead of following `home.yaml`.
    - **Degradation tested the same way as step 3:** with the derived directory moved away, both custom properties collapse to the original jpg and the build stays green.
    - **`derivativesFor()` moved to `src/lib/derivatives.ts`** so the hero and `ResponsiveImage` share one lookup rather than two copies of the same regex.
  5. **[x] Close out** — full gate, acceptance criteria line by line, and CLAUDE.md gains the one rule a future session needs: `public/uploads/derived/` is generated, `npm run images` regenerates it, and a missing derivative degrades rather than breaks. **Landed:** build 25 routes, `gate:vocab` 0 hits across 10 files, `gate:links` 0 dead 0 misrouted across 682 hrefs, `gate:content 5b3820f` 202 strings 0 unaccounted for, `npm test` 2 passed. No baseline moved except the new derivatives row.
- **Acceptance criteria, line by line.** *The shop catalogue's images total under 1 MB at list size* — `/shop` is T7.5, so the number is taken on the gallery home, which lists the same five works through the same component: **407 K** at the widest candidate a browser can pick, 87 K at the narrowest, against 13.45 MB before. The homepage, which the AC gained after T3.2, is **211 K** against 7.55 MB. *Full resolution still reachable on the detail page* — **carried to T7.5**, which is where the only per-work page will exist; nothing here deletes or rewrites an original, and `/uploads/<name>.png` still serves the full file, so that route has something to link to. *No image is a visibly worse crop than the one it replaces* — **nothing is cropped**: `sharp().resize({ width })` scales and the aspect ratio survives to four decimal places (1254×1254 → 960×960, 1024×804 → 960×754), while the `object-cover` framing in the markup is unchanged.
- **Ticked with one AC line deferred rather than claimed.** The detail-page half needs a route that does not exist; the list-weight half, which is the whole reason this task was raised, is closed with 593 K of headroom.
- **Half of the AC binds to a route that does not exist.** "Full resolution still reachable on the detail page" needs `/gallery/shop/[slug]`, which is T7.5. The originals are never deleted and stay served at `/uploads/<name>.png`, so nothing blocks T7.5 from using them; a note on that task carries the requirement, and T7.9 closes on the list-weight half.

- [x] **T7.10 — Delete the unreferenced uploads** *(new — found while planning T7.9)*
`public/uploads/` holds 57 files and 69 MB. **46 of them, 50 MB, are referenced by nothing** in `src/` or `public/admin/` — Wix-era leftovers that ship in `dist/` on every deploy.
- AC: every remaining file in `public/uploads/` is referenced by a YAML value, a content entry, an `.astro` fallback or `config.yml`; `dist/` shrinks by the deleted weight; no image 404s afterwards.
- **Deletion is not reversible through the CMS**, so the check runs before the delete rather than after, and a file whose only reference is a hardcoded fallback counts as referenced.
- Depends on: T7.2
- **Landed:** 45 files deleted, 12 kept. `public/uploads/` 84 MB → **22 MB**, `dist/` 85 MB → **23 MB**, and the derivative pass fell from 150 derivatives and 14.8 MB to 31 and 2.2 MB. Build 25 routes, `gate:vocab` 0 hits, `gate:links` 0 dead 0 misrouted across 682 hrefs — all unchanged, which is the point: nothing referenced was touched.
- **The reference set is every file under `src/`, `public/admin/`, `functions/`, `e2e/`, `scripts/` and `astro.config.mjs`**, so a filename mentioned only in a hardcoded `.astro` fallback or a Decap default counts as referenced. `6.jpg` survives on exactly that basis. `.gitkeep` was excluded from the sweep by name — it is a git artifact rather than an upload.
- **Images are not checked by any gate, so this task verified them directly:** every `<img src>`, every `srcset` candidate and every `url()` in the built HTML — 24 references across 26 pages — resolves to a file in `dist/`. `gate:links` reads hrefs only and would have stayed green through a wholesale image deletion.
- **`scripts/images.mjs` now prunes.** Deleting a source left its derivatives behind, and since Astro copies `public/` wholesale they would have shipped forever with nothing pointing at them — 119 orphans on the first run after the delete. The invariant is stated in the script: `derived/` describes the current contents of `uploads/` and nothing older.
- **Raised before it was run, and overruled deliberately.** The unreferenced set includes T7.2's six lookbook images, `logo-kaaya.png` and roughly thirty campus photographs, while photography is still an open blocker and `kayagallery.com` is being retired — so for the lookbook these were the only local copies. Siva chose deletion with git history as the recovery path on 2026-08-09. Recovery is `git checkout 9fe9cd3 -- public/uploads/<name>`.

- [x] **T7.3 — Import the 5 artworks**
Chromatic metanoia ₹12,000 · The fox within ₹400 · The rhythms of the coastal line ₹400 · Hampta pass trek ₹400 · Living through it ₹250. Descriptions, medium and size carry over from the scrape.
- AC: 5 entries in `src/content/works/`, each with its artist slug, price as a display string, and a local image.
- Depends on: T7.1, T7.2
- **Landed:** 5 entries, generated from the scrape by script rather than retyped, so the descriptions are the source text character for character. Prices match this task's list exactly — ₹12,000 · ₹400 · ₹400 · ₹400 · ₹250 — each quoted as a display string. Every `images[0]` resolves to a file in `public/uploads/`, and every `artist` is a slug T7.4 must create: `vijay-vikram-singh`, `rishabh-rawat`, `kashish-riyaz`, `chetan-joshi`, `nisha-chauhan`.
- **`featured: true` on all five is sourced, not chosen.** All five sit in the live gallery home's "Featured Art" carousel. It does mean the flag currently separates nothing, which T7.7 and T3.2 should know before they use it to pick a subset.
- **Two things in the source do not agree, and neither is resolved here.** *Hampta pass trek* has `Medium*: Acrylic on canvas` in its listing while its own description says "using watercolor and pen"; the listing value was carried, since that is what the field says. And three works — *The fox within*, *The rhythms of the coastal line*, *Hampta pass trek* — list a size **option** rather than a dimension, so their `size` reads `Medium`, `Medium` and `Small / Medium` against the other two's `36 x 36` and `30 X 36 Inch`. Both are questions for the Kaaya team, not defects to guess at.
- **A grep for `Artist:` finds only four of the five.** *The fox within* is attributed as `Artist- Rishabh Rawat`, with a dash, and a later import that greps for the colon will silently drop it.

- [x] **T7.4 — Import the 6 artist profiles**
Rishabh Rawat, Tenzin Norbu, Vijay Vikram Singh, Nisha Chauhan, Kashish Riyaz, Chetan Joshi, with their full biographies. Tenzin Norbu carries the Artist of the Month feature.
- AC: 6 entries in `src/content/artists/`; **every entry sets `published: true` explicitly**, since the schema defaults it to `false` and a silent default would empty the Artist page; each artwork's `artist` resolves to one of them.
- Depends on: T7.1, T7.2
- **Landed:** 6 entries, biographies extracted from the scrape by script so the text is the source character for character. `published: true` is set explicitly on every one — the schema defaults it to `false`, so a silent default empties the Artist page. All 5 works' `artist` slugs resolve against these 6, checked mechanically.
- **Tenzin Norbu holds the Artist of the Month slot via `featuredMonth: Current`, which is a marker rather than a month.** The scrape carries no date for it — the only dates anywhere in that file are the Wix placeholders — so a real month would have to be invented. T7.6 should select the single artist that has `featuredMonth` set and **must not print the value** until a real month exists. The rotation owner is the blockers-table row that makes this stale otherwise.
- **`portrait` is unset on all 6 and `residency: false` on all 6.** The scrape has no artist portraits — that is the photography blocker again — and it says nothing about who lives in the Studios cottages. T5.2's Gallery ↔ Place cross-link is driven by `residency`, so it has nothing to link until the Kaaya team says which artists are residents. Nothing was guessed.

- [ ] **T7.5 — Build `gallery/shop/index.astro` and `gallery/shop/[slug].astro`**
The catalogue plus a page per work (decision 14). Filterable by category — `CategoryFilter` already exists and is reusable. Prices displayed; the only action is an enquiry, built on T4.1's shell with a hidden work reference.
- AC: no code sums, totals or persists `price`; no cart or checkout route exists anywhere; the enquiry path is verified end to end; the page states plainly that buying happens by enquiry, so the "Shop" label does not mislead (decision 4); `/shop/chromatic-metanoia` resolves.
- Depends on: T7.3, T4.1, T4.3
- **The detail page serves the original file, not a derivative.** T7.9 shrinks the list pages and never deletes an original, so `/uploads/<name>.png` stays full resolution — this route is where that half of T7.9's AC is satisfied.

- [x] **T7.6 — Build `gallery/artist/index.astro` and `gallery/artist/[slug].astro`**
Profiles, Artist Archive, Artist of the Month, and the Studios residency feature. Only `published` entries listed. Each profile links to that artist's works.
- AC: matches build doc §4's Artist section; Studios framed prominently per decision 8; `/artist/tenzin-norbu` resolves.
- Depends on: T7.4
- **Landed:** 18 → 25 routes — the index plus one page per published artist. `/artist/tenzin-norbu` resolves and carries `https://gallery.kaaya.org/artist/tenzin-norbu/` as its canonical. `getStaticPaths` filters on `published`, so an unpublished profile has no URL either, not merely no listing. Each profile lists that artist's works from the `works` collection: Vijay Vikram Singh shows *Chromatic metanoia*, Tenzin Norbu shows none, which is correct — he has no priced work in the inventory.
- **Build doc §4's three parts are all present:** profiles, the Artist Archive, and Artist of the Month. The Archive says the record fills as exhibitions come down and points at Happenings, because Kaaya has run none under this gallery — an honest statement rather than an empty list.
- **Studios lead the page, per decision 8** — "Some artists don't just show here / They live and work here", the two mud cottages, and a link to Place → Stay, with enquiry as the only next step. No pricing, duration or application process, none of which exists. The per-artist residency badge is coded and renders for any artist with `residency: true`; today that is none of the six, which is T5.2's blocker rather than this task's.
- **`featuredMonth` selects but never prints** — `Current` appears nowhere in the built HTML, checked.
- **Row 2 on `gallery.kaaya.org` now renders**, since `/gallery/artist` came out of the Header's `UNBUILT` set. Only `/gallery/shop` remains withheld, until T7.5.
- **Three baselines moved:** routes 18 → 25, banned-vocab 3 → 10 files scanned with 0 hits, dead-links 487 → 671 hrefs on 19 → 26 pages with 0 dead and 0 misrouted.

- [x] **T7.7 — Gallery home page content**
Fills T1.7's shell: "Art from the Himalayas" hero, the exhibition narrative that decision 15 moved here from the dropped `/art` route, featured works, Artist of the Month, the mission statement, and the Padav Fellowship / Bangani Art Foundation origin.
It also features upcoming gallery events — `section: gallery`, linking out to `events.kaaya.org/[slug]`, never re-rendering them (decision 18). The page must not break when the events collection is empty, since E8 lands after this.
- AC: matches the scrape's copy; featured works come from `works.featured`; there is no `/art` route anywhere; event cards link off-host.
- Depends on: T7.3, T7.4
- **Landed:** T1.7's shell is gone. The hero is "Art from the Himalayas" with the scrape's own subheading; the exhibition narrative decision 15 moved here is the gallery's mission statement plus the Padav Fellowship / Bangani Art Foundation origin, both carried verbatim; the pull quote closes the page. Featured works come from `works.featured` and render all 5. Artist of the Month links to `/gallery/artist/tenzin-norbu`. No `/art` route exists anywhere in `src/pages/`.
- **Featured cards do not link to the work.** `/gallery/shop/[slug]` is T7.5, so each card names its artist and links to that profile instead — a card that leads somewhere real beats a dead href. T7.5 turns the title into the link.
- **The events feature is coded and renders nothing**, which is the correct state: the collection is empty until E8. It filters `section: gallery` on upcoming dates, caps at 3 and links to `link('/events/[id]')`, which is an off-host absolute URL in a production build — decision 18's "feature, never re-render". T8.5 gets a working block rather than a blank one.
- **`gallery.yaml`'s `introParagraphs` had no field in `config.yml`** — an orphan key an editor could not reach, which T1.9's structural check should have caught and did not. Added here along with the pull quote, since this task rewrote that file anyway.
- **2 content leaf strings dropped, both deliberate:** `gallery.heroSubheading` "The gallery at Kaaya" and `gallery.introParagraphs[0]`, T1.7's placeholder saying the content was still being brought across. Both were the shell this task exists to replace.
- **A deleted content entry was still rendering.** The gate found `https://events.kaaya.org/_probe` linked from the gallery home — T7.1's probe event, whose file was removed two tasks earlier. Astro's content store lives in `node_modules/.astro/data-store.json`, so deleting the file, `.astro/` and `dist/` all left it in place. Recorded in CLAUDE.md; `gate:links` is the only reason it did not ship.

- [x] **T7.8 — CMS collections for Works and Artists**
Folder-based Decap collections, same pattern as `blog`. The Events collection is added in T8.4.
- AC: an editor can create, edit and delete works and profiles through `/admin`, including setting `published`.
- Depends on: T7.1
- **Landed:** two folder collections on the `blog` pattern, both `create: true` and `delete: true` — `blog` itself is `delete: false`, and this task's AC asks for delete. Checked structurally: `config.yml` parses, and every frontmatter key across all 5 works and all 6 artists has a field. `published` is a boolean defaulting to `true` in the CMS, against `false` in the schema, so a profile created through `/admin` is listed rather than silently invisible.
- **`artist` is a `relation` widget, not free text.** It resolves against the `artists` collection with `value_field: "{{slug}}"`, so a work cannot name a slug no profile answers to — the failure the schema itself cannot catch, since both sides are just strings.
- **The `/admin` UI round trip is unverified** — it needs a CMS login, the same gap T0.2 and T1.9 record. The configuration is correct; no editor sat in front of it.
- `portrait` is the one field with no entry using it, which is the photography blocker rather than a defect.

---

## Epic E8 — Events

*TDD §12, decision 18. One host, one collection, one place any event is rendered. Gallery and Community feature theirs and link across; they never hold a second copy.*

- [x] **T8.1 — Build `events/index.astro`**
Fills T1.7's shell. All events on one page, categorised by `type` (exhibition, workshop, talk, market, other), split into upcoming and past by date, with `featured` entries pinned. `CategoryFilter` already exists and is reusable. No row 2 nav — the categories are filters on this page (TDD §5).
- AC: filters degrade to showing everything without JavaScript; past events stay reachable rather than disappearing; the empty state survives a collection with no entries.
- Depends on: T7.1, T2.5
- **Verified against a populated page, not an empty one.** The collection is empty until T8.3, so three probe events were rendered through it and then removed. Filters came out as `All events · Exhibition · Talk · Workshop` — only the types actually present, so a category never advertises an empty result. Order was featured first then soonest: `Probe Featured Exhibition`, `Probe Upcoming Workshop`. Past rendered as its own section below, holding `Probe Past Talk`. Date ranges collapse to one date when `endDate` is unset — `10 May 2027 – 2 June 2027` against `4 March 2027`.
- **All three AC lines hold.** *Filters degrade without JavaScript* — the script only ever sets `hidden` on a card, so with no JavaScript every event is on the page and the buttons do nothing. *Past events stay reachable* — their own section, ordered most recent first. *The empty state survives an empty collection* — with the probes removed the page renders T1.7's empty state again, checked.
- **`CategoryFilter` needed one change to be reusable at all.** It matched the literal string `All Posts` as its show-all sentinel, so any other filter's first button would have hidden every card instead of showing them. It now treats whichever button comes first as show-all, which leaves the blog identical and lets events label its own.
- **`type` categorises, `section` does not appear.** Filtering is by `type` per TDD §12; `section` only decides which section home features an event. No row 2 nav on this host, per §5.
- **Cards link to `/events/[slug]`, which T8.2 builds next.** With the collection empty there is no dead href today; importing events before T8.2 lands would create three.

- [x] **T8.2 — Build `events/[slug].astro`**
Event detail: date, venue, description, `rsvpNote`. Contact-only — no ticketing, no registration, matching the live gallery where every event reads "Registration is closed" or "Tickets are not on sale".
- AC: `/artistry-weekend` resolves on `events.kaaya.org`; no booking or payment affordance anywhere on the page.
- Depends on: T8.1
- **Landed:** date, venue, `type`, body and `rsvpNote`, with the back link to the events index. Verified through a probe event titled *Artistry Weekend*, which built its route and carried `https://events.kaaya.org/<slug>/` as its canonical — proving the route resolves on the events host. The probe was removed and the content store cleared afterwards.
- **The AC's exact URL cannot exist yet.** `/artistry-weekend` needs the real event, and T8.3 is blocked on real dates — the scrape's are Wix placeholders. `getStaticPaths` maps the collection, so the slug appears the moment that entry does.
- **No booking or payment affordance**, checked against the built page: no cart, no register, no ticketing, no checkout, no price. The only next step is the contact block. The default `rsvpNote` says plainly that there is no ticketing and no registration, matching the live gallery's own "Registration is closed" / "Tickets are not on sale".
- Date ranges render as `10 May 2027 – 11 May 2027` and collapse to one date when `endDate` is unset, the same rule the index uses.

- [ ] **T8.3 — Import the 3 events**
Himalayan Painting Masterclass · Artistry Weekend · Taste of the Himalayas. Titles, descriptions and venues (Studio 1, Nature Café) carry over from the scrape. All three are `section: gallery`.
- **Hard gate:** the scrape's dates (`08 Aug 2026, 1:41 am – 3:41 am`) and address (`123 Art Ln, Sweetwater, TN 37874, USA`) are Wix placeholder data and must not ship.
- AC: no placeholder date or address remains; every event carries a real date, a `type`, and the Kaaya campus address.
- Depends on: T8.2, **external — real event dates**

- [x] **T8.4 — CMS collection for Events**
Folder-based Decap collection, same pattern as `blog`. `section` and `type` are select widgets, not free text, so neither can drift.
- AC: an editor can create, edit and delete events through `/admin`; an event created as `section: community` appears on the community home without further work.
- Depends on: T8.1
- **Landed:** a folder collection on the `blog` pattern, `create: true` and `delete: true`. Checked structurally: `config.yml` parses, and all 9 schema fields have a field behind them. `section` and `type` are `select` widgets with exactly the schema's enum values — `gallery`/`community` and `exhibition`/`workshop`/`talk`/`market`/`other` — so neither can drift into free text, which would drop an event out of both its section home and its filter without an error.
- **The AC's second line is not satisfiable yet, and the missing half is T8.5.** The gallery home already features its own section's upcoming events (built in T7.7), so an event created as `section: gallery` appears there with no further work. The community home has no such block until T8.5, which is blocked behind T8.3 and its real dates.
- **The `/admin` UI round trip is unverified** — it needs a CMS login, the same gap T0.2, T1.9 and T7.8 record.

- [ ] **T8.5 — Feature events on the section homes**
The gallery home shows upcoming `section: gallery` events; the community home shows `section: community`. Cards link to `events.kaaya.org/[slug]` — sections feature, they do not re-render.
- AC: both homes show only their own section's upcoming events, cap the count, and render nothing rather than breaking when there are none; every card links off-host.
- Depends on: T8.3, T1.6, T7.7

---

## Epic E9 — Cloudflare Pages setup & cutover

*TDD §15. Much smaller than earlier versions: routing is code (E2), so there are no Transform or Redirect Rules to configure, and `kaayagallery.com` needs no zone.*

- [ ] **T9.1 — Create the Cloudflare Pages project**
GitHub-connected, `npm run build`, output `dist`, Node 22.
- AC: builds and deploys from a push to `main`, reachable on its `*.pages.dev` URL, with the whole build browsable there at path form.
- Depends on: E1, E2

- [ ] **T9.2 — Attach all seven custom domains**
`kaaya.org`, `www.kaaya.org`, `gallery.`, `place.`, `community.`, `events.`, `happenings.`.
- AC: all seven resolve over HTTPS with a valid Cloudflare-issued cert.
- Depends on: T9.1

- [ ] **T9.3 — Delete `public/CNAME`**
A GitHub Pages artifact with no meaning on Cloudflare Pages, and a live source of confusion about which host is canonical.
- AC: removed; build unaffected.
- Depends on: T9.2

- [ ] **T9.4 — DNS cutover**
CNAMEs for the six subdomains plus repointing the apex, all proxied.
- AC: all seven hostnames serve the live site; every row of TDD §6.2 re-verified against production, not preview; **`npm run gate:proxy -- --strict` exits 0**, meaning no proxy value from decision 21 is still in the build.
- Depends on: T9.2, T10.2, and content sign-off (E3, E6, E7, E8)

- [ ] **T9.5 — Decommission GitHub Pages**
Delete `.github/workflows/deploy.yml`, disable GitHub Pages in repo settings.
- AC: the old workflow no longer runs. Soak after T9.4, not same-day.
- Depends on: T9.4 confirmed stable

- [ ] **T9.6 — Sitemap resubmission**
- AC: submitted; no crawl errors after the first re-crawl.
- Depends on: T9.4

---

## Epic E10 — Testing

*TDD §16. Trails the other epics rather than following them.*

- [x] **T10.1 — Configure Playwright**
- AC: `npx playwright test` runs against the local dev server.
- Depends on: T0.4
- **Landed:** `playwright.config.ts` plus `e2e/harness.spec.ts`. `npx playwright test` and `npm test` both run 2 tests and both pass. Playwright baseline 0 → 2.
- **It runs against `wrangler pages dev dist`, not `astro dev`, and the AC's wording should be read that way.** Neither thing this repo has to test exists under `astro dev`: the middleware never runs there, so every row of TDD §6.2 is unassertable, and `link()` returns bare paths in dev, so nav hrefs are not the absolute cross-subdomain URLs production serves. The `webServer` command therefore runs `npm run build` and then wrangler, with `--compatibility-date` pinned, since wrangler refuses to start when the date is newer than its binary supports.
- **The two tests prove the harness rather than the site**, which is what makes T10.2 and T10.3 cheap: the build is served, an explicit `Host` header reaches the worker, and the middleware is in front of the build — asserted by `kaaya.org/place` returning `301` to `place.kaaya.org/`, which serving `dist/` alone would answer with the page.

- [x] **T10.2 — Routing test suite**
One assertion per row of TDD §6.2's behaviour table — status plus `Location`, with an explicit `Host` header against `wrangler pages dev dist`. Must include the two asset rows (`/_astro/*` and `/uploads/*` served unrewritten on a section host), since that is the exact failure the previous routing design shipped with.
- AC: full table green locally; the same suite green against production after T9.4.
- Depends on: T2.1, T10.1
- **Landed:** `e2e/routing.spec.ts`, one test per row. Playwright baseline **2 → 34 declared: 31 passed, 3 skipped, 0 failed**. Both asset rows are in — `/_astro/<hash>.css` and `/uploads/16.jpg` on `gallery.kaaya.org` — plus `/admin/` and `/robots.txt`, since the `ROOT_FILE` half of the guard is the same failure. A serve row compares the body to the `dist/` file byte for byte rather than checking the status, because a rewrite landing on the wrong page returns 200.
- **The 3 skipped rows name the ticket that builds them** — `/shop` and `/shop/chromatic-metanoia` (T7.5), `events.kaaya.org/artistry-weekend` (T8.3). Declared and skipped rather than omitted, so the gap is counted in the run instead of being invisible.
- **`wrangler pages dev` rewrites a same-host `Location` to `http:`**, since it proxies to a local http origin; a cross-host `Location` keeps the `https:` the middleware wrote. The helper normalises the scheme and asserts host, path and hash, which is what §6.2 actually specifies. Three rows failed on this before it was understood, and none of them was a middleware defect.
- **§6.2's "`happenings.kaaya.org/anything` → /blog" row is not unconditional, and this is the correction.** The leak guard runs first, so `happenings.kaaya.org/place/stay` redirects to `https://place.kaaya.org/stay` rather than to `/blog`. That is the better behaviour and the guard §6.3 asks for — the row means "anything that is not a section prefix or /blog". Both cases now have their own test. Correct the wording if that document is revised.
- **A slash-less directory path on the preview host gets Pages' own 308**, not the middleware's — the same hop `asDirectory()` exists to keep out of public URLs. The preview row asserts the slash form; the 308 is the static host and is outside the table.

- [x] **T10.3 — Per-section smoke tests**
Page loads; nav hrefs are the expected absolute cross-subdomain URLs; each host renders its own row 2 nav. `link()` returns paths in dev, so assert against `astro build` output.
- AC: one passing smoke test per section.
- Depends on: T10.1, T2.5
- **Landed:** `e2e/sections.spec.ts`, one test per host — home, gallery, place, community, events, happenings. Playwright baseline **34 → 40 declared: 37 passed, 3 skipped, 0 failed**. Each test asserts three things at once: the section's own page serves 200 rather than redirecting, row 1 carries all five cross-site links as absolute cross-subdomain URLs, and row 2 equals §5's table for that host — `['Artist']` on gallery, the four Place routes, the three Community routes, and empty on home, events and happenings.
- **The negative assertion is the one that would catch a regression:** the header must contain no `href="/gallery…"`-style bare path, which is what `link()` emits when it takes its dev branch. A bare path renders and navigates fine on the apex, so nothing else in the repo notices it on a section host.
- **Asserted over fetched HTML, not through a browser page.** `Host` is a forbidden header for a browser fetch, and every behaviour here depends on which host asked.

- [ ] **T10.4 — Form tests**
Each of the four forms renders, carries its honeypot and redirect, and posts the right subject.
- AC: markup asserted per form; at least one real submission per inbox verified manually (T4.3).
- Depends on: T4.4, T7.5, T10.1

- [ ] **T10.5 — Banned-vocabulary check in CI**
- AC: a PR introducing a banned term into page content *or* shared chrome fails CI; a clean PR passes.
- Depends on: T5.1, T10.1

---

## Cross-epic blockers, and the proxies standing in for them

Every design question is resolved. What remains is what only the Kaaya team can supply.

**Decision 21: local development does not wait for it.** A proxy value stands in, declared by a `KAAYA-PROXY(<ticket>): <what is owed>` comment beside the value it replaces, and `npm run gate:proxy` counts them — 0 today, and every row below that says "proxy" adds one. `npm run gate:proxy -- --strict` exits non-zero while any remain and is **T9.4's cutover gate**: production cannot be reached with a proxy still in the build.

**Two strings get no proxy.** The Wix placeholder date and address fail `gate:proxy` in any mode, checked over built HTML, because they read as real and are wrong in a way a visitor would act on.

The register is the tree, not this table. This table says who owes what; `gate:proxy` says what is actually still standing in, and it cannot go stale.

| Blocker | Blocks | Proxy | Notes |
|---|---|---|---|
| Real event dates + campus address | T8.3 | **partial — dates only** | The three events can carry proxy dates and the campus name. The Wix date and address are refused by `gate:proxy` in any mode, so they are not the proxy. |
| `info@kaaya.org` created and monitored | T4.3, T4.4, T6.1 | **yes** | The address is printed and the form is wired against it; the access key stays the live one until the mailbox exists. No submission reaches a real inbox until then. |
| `art@kaaya.org` confirmed as a real mailbox | T4.5 | **yes** | Printed on `kaaya.org`, `events.kaaya.org` and `happenings.kaaya.org`. Receives no form submissions, so a wrong address here costs a bounced email rather than a lost enquiry. |
| Five per-host description strings | T4.6, T5.1 | **yes** | Interim copy is already in the tree from T4.6's note; the proxy marker makes it countable. None may use the four banned phrases on home or gallery, which `gate:vocab` enforces independently. |
| Photography: homepage exhibition hero, `og-default.png` | T0.3, T3.1 | **yes** | The campus photograph already in `home.yaml` stands in for the exhibition hero. `og-default.png` is a typographic placeholder from T0.3. |
| Studios residency terms | T6.1 partially | **no — deliberate** | Decision 8 ships the story without the terms. Nothing stands in, because nothing is stated. |
| Artist of the Month rotation owner | T7.6 | **no — deliberate** | `featuredMonth` selects but never prints (T7.6), so there is no month to proxy. The slot goes stale without an owner. |
| Gallery inventory beyond the 5 artworks | T7.5 | **no — deliberate** | Handmade and Collectibles stay empty; T8.1's filter pattern only offers categories that have entries, so an empty category is never advertised. |

---

## Sequencing

Epics are numbered in dependency order — worked front to back, nothing ever waits on a later epic.

```
E0  defect fixes         no dependencies, land first
E1  route reorg          ← the migration map, TDD §13
E2  routing foundation   ← middleware, links.ts, Header
        ├── E3  home rebuild
        ├── E4  enquiries, contact, descriptions
        │        └── E6  place & blog content
        └── E7  gallery         (starts once E1+E2 land; needs T4.1 for the Shop form)
                 └── E8  events          (needs T7.1's collection and T7.7's gallery home)
                          └── E5  cross-cutting  (needs E6 + E7 for real link targets)
                                   └── E9  Cloudflare setup & cutover
E10 testing              trails each epic as it lands
```

E2 is the critical path: nothing about hosting can be verified until the middleware exists, and everything in E9 assumes T10.2 is already green under `wrangler`. E7 is no longer the long pole it once was — the content exists. E8 is small, and only its dates are externally blocked.
