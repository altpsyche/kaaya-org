# kaaya.org — house rules

Astro 7 · Tailwind 4 · DecapCMS · static export to `dist/`. One build, six hostnames, one Cloudflare Pages project.

## Style: caveman ultra

Pinned per-repo in `.caveman/config.json` (`defaultMode: "ultra"`), which the plugin's resolver reads above user config — so every session in this repo starts ultra with no `/caveman` command. **That file is the source of truth for the level; do not restate a level here.**

Every response, every session. No revert after many turns. Off only on "stop caveman" / "normal mode".

Drop articles, filler (just/really/basically/simply), pleasantries, hedging. Fragments OK. Short synonyms. No tool-call narration, no decorative tables, no emoji, no long raw log dumps — quote the shortest decisive line. Technical terms, error strings, API names, CLI commands exact. Standard acronyms (DNS/API/HTTP/CMS) fine; never invent abbreviations. Pattern: `[thing] [action] [reason]. [next step].`

**Write normal prose in:** commit messages, PR bodies, code comments, everything under `docs/`, security warnings, irreversible-action confirmations, and any multi-step sequence where dropped conjunctions would make the order ambiguous.

Never name the style.

### Comments

**A comment explains the code. That is the whole rule.**

Do write what the code does that reading it will not tell you, and what it has to survive: a spec behaviour, a reason a correct-looking alternative fails, a defect it prevents, an invariant two places share. `id="visit"` is load-bearing because the middleware redirects onto it — that is a comment. So is the reason `PASSTHROUGH` exists.

Do not write plumbing or gates — which script measures this, which test fails if it drifts. State the invariant instead. Do not address a reader ("Siva's call", "this cost a session"); that belongs in the commit body or the backlog. Do not restate the signature, narrate the file's structure, or explain how the file came to be this way.

Ticket IDs are the exception this repo makes to altpsyche's rule: `T4.6`, `decision 11`, `build doc §9` are the only names a reader can look up, and the backlog outlives the session. Cite them where a line exists because a ticket says so.

## The work

[`docs/kaaya_website_implementation_tasks.md`](docs/kaaya_website_implementation_tasks.md) is the backlog **and the handover**. Read it first. Nothing else queues work: if a task is not in it, nobody is tracking it. There is no separate handover file and you must not write one.

Its companions are reference, not queue:

- [`docs/kaaya_website_technical_design.md`](docs/kaaya_website_technical_design.md) — architecture. **§2 is a decisions log of 18 resolved questions.** Read the §2 table before calling anything a design call. Those were settled with Siva across several rounds; do not re-litigate them. If implementation proves one wrong, say so and stop — do not quietly pick differently.
- [`docs/kaaya_website_build_instructions (final).md`](<docs/kaaya_website_build_instructions (final).md>) — content and product spec. **Its amendments block at the top overrides its own body in 12 places** and the body is not corrected inline, so the amendments win.
- `docs/archive/` — superseded. Never implement from it.
- `docs/scrape/` — raw scrape of the retired Wix gallery. A content source for E7 and E8 only; that domain is out of scope.

Start a session with `/next`. Land a step with `/land`.

**Epics run E0 → E10 in order.** Dependencies point backwards only, so nothing deadlocks. Every task's acceptance criteria are its done-criteria — closing a task is a verification, not an opinion.

**Keep a session under half the context window.** `node .claude/context-used.mjs` reads the real number out of the session transcript and returns CONTINUE / FINISH / HAND OVER. Check it at session start and after every `/land` — not at the end. Above 40%, land what is in hand and hand over; above 50%, hand over without starting anything.

## Rules that cost real time when broken

- **VERIFY, DON'T ASSUME.** A doc claiming something is broken gets confirmed against the tree first. Three of this migration's findings were the reverse — defects nobody had written down.
- **`npm run build` is blind to nearly everything that matters here.** It does not check an href, a lost YAML key, a banned phrase, or an image path. It passed green across all three defects below. Build is the floor, not the check.
- **`toCanonical()` in config context, `link()` in pages.** `import.meta.env.PROD` is unset inside `astro.config.mjs`, so `link()` there silently takes the dev branch and emits bare paths — the sitemap then advertises exactly the URLs the middleware 301s away from, with no error anywhere. TDD §9 has the table. Config, `SEO.astro` and `rss.xml.ts` call `toCanonical()`; nothing else does.
- **No internal `href="/…"` string literals.** Everything routes through `link()`, because a bare path is ambiguous across six hostnames.
- **The middleware's `PASSTHROUGH` / `ROOT_FILE` guard is load-bearing.** Without it every root asset 404s on the section hosts — `/_astro/*`, `/uploads/*`, `/admin/`. That is the failure that killed the Transform Rule design; TDD §6.1 has the table.
- **A rewrite must target the slash form.** Pages answers a slash-less directory path with a 308 to its slash form, and after a rewrite that `Location` carries the internal prefix — `place.kaaya.org/stay` advertised `/place/stay/`, the leak §6.3 exists to prevent, with the build green. `asDirectory()` in the middleware is what stops it.
- **`wrangler pages dev` needs `--compatibility-date` pinned behind the binary's newest supported date**, or it refuses to start: `This Worker requires compatibility date "…", but the newest date supported by this server binary is "…"`. Nothing in the repo sets one yet; the Pages project's date lands in T9.1.
- **A relative image path renders as relative.** `heroImage: public/uploads/x.jpg` resolved to `/place/public/uploads/x.jpg` and 404'd on four pages in `main`, for months, with the build green. Decap writes `/uploads/…` when `public_folder` is set; anything hand-authored gets checked.
- **Every page duplicates its YAML as a hardcoded fallback.** Edit one and the other diverges silently, and the fallback is reachable — clearing a field in the CMS falls through to it. Content moves change both.
- **A green build says nothing about a content move.** Splitting one page into five, or merging two overlapping lists, drops a paragraph without an error, because every schema field is optional. `npm run gate:content <ref>` is the only thing that catches it.
- **Banned vocabulary lives in shared chrome, not just copy.** "circular economy", "incubation", "internships", "sustainable living" are banned on `kaaya.org` and `gallery.kaaya.org` and fine on `community.kaaya.org`. The live violation was in `SITE.description`, which renders on any page passing no description of its own — including `404.astro`, which the gallery host serves. A grep over `src/content/` reaches none of that, which is why the check runs over built output.
- **No checkout, cart, payment provider or order state, anywhere.** `works.price` is a display string and no code may sum, total or persist it. Decision 2 is structural, not a matter of remembering.
- **Wix placeholder data must never ship:** the date `08 Aug 2026, 1:41 am – 3:41 am` and the address `123 Art Ln, Sweetwater, TN 37874, USA`. Hard gate on the events pages.
- **Do not invent content to unblock yourself.** Real event dates, `info@kaaya.org`, the five per-host descriptions and the photography are blocked on the Kaaya team — the backlog's blockers table is the list. Build the empty state and flag it.
- **`astro dev --background`**, never a foreground dev server. Manage with `astro dev stop`, `astro dev status`, `astro dev logs`.
- **Routing is verified with `wrangler pages dev dist` and an explicit `Host` header**, one assertion per row of TDD §6.2 — before cutover, not after. `link()` returns paths in dev, so nav assertions run against `astro build` output, never `astro dev`.

## Gate — `scripts/gate/`, committed, do not rebuild

| file | what |
| --- | --- |
| `banned-vocab.mjs` | the four phrases over `dist/index.html`, `dist/404.html`, `dist/gallery/**`. Exits non-zero |
| `dead-links.mjs` | every internal href in `dist/` resolves to a file or a directory index. Exits non-zero |
| `content-audit.mjs <ref>` | every YAML leaf string at `<ref>` still present in the tree, YAML or `.astro` fallback. Exits non-zero |

`npm run gate` is build + vocab + links. `npm run gate:content <ref>` is separate because it takes an argument and only a content move earns it.

Not built yet, and named in the backlog rather than here: the `wrangler` routing suite (T10.2), per-section smoke tests (T10.3), form tests (T10.4).

## Baselines

Numbers a session can check against. Update them in the same commit that moves them.

| what | value | measured |
| --- | --- | --- |
| routes built | 17 | `npm run build` after E1 |
| banned-vocab hits | 0 across 3 files | `npm run gate:vocab` |
| dead internal links | 0 across 18 pages | `npm run gate:links` |
| content leaf strings | 190 across 12 YAML files | `npm run gate:content HEAD` |
| Playwright tests | 0 | `npm test` — suite lands in T10.1 |

## Commits

Conventional, lower-case subject, one finding. The body quotes the before and after numbers the gate produced. A task's tick in the backlog goes in the same commit as the work.

## What is out of scope

`kayagallery.com` — being retired, no zone, no redirects, no DNS work. GitHub Pages — decommissioned at T9.5; `public/CNAME` and `.github/workflows/deploy.yml` are artifacts of it.
