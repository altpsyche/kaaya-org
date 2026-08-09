---
name: land
description: >
  Run the verification gate for a change in this repo, then commit it and tick the
  backlog step. Picks the gates the change actually earns, from the build up to the
  content audit, the banned-vocabulary check, the dead-link scan and the wrangler
  routing table. Use before committing any change to src/, functions/, public/ or
  astro.config.mjs, or when the user says "land it", "verify", "run the gate", "check it".
---

The gate. Nothing lands without the numbers it changed.

CLAUDE.md holds the gate table and the baselines, and **it is the source of truth for every count**. This file says which gates a change earns and what passing looks like.

## 0. Where the before-state lives

The diff is against **the state before this change**, not a stale one. For the content audit that is a git ref, so no capture is needed. For anything measured out of `dist/`, build `HEAD` first if you have already edited.

When the plan named a step as the one that re-baselines, that step quotes both the old and the new numbers, and every later step in the task diffs against the new baseline.

## 1. Pick the gates this change earns

| what the change touched | gates |
| --- | --- |
| anything at all | section 2 |
| `src/content/**`, or any move, split or merge of page content | sections 2, 3 |
| `src/pages/**`, `src/components/**`, `src/layouts/**` | sections 2, 4 |
| `src/data/site.ts`, `SEO.astro`, or any shared chrome | sections 2, 4, and say why 5 is or is not earned |
| `functions/_middleware.js`, `astro.config.mjs`, `src/lib/links.ts` | sections 2, 4, 5 |
| `public/admin/config.yml` | sections 2, 6 |
| a form, or `EnquiryForm` | sections 2, 4, 7 |
| **the commit that closes a task** | **all of them the task touched, plus section 3 against the task's first commit** |

Cheap gates on a final commit prove nothing about the steps before it, which is why the close-out runs everything.

## 2. Build

```
npm run build
```

Green, and the route count matches CLAUDE.md's baseline unless this change moved it — in which case say the old and new numbers and update the baseline in this commit.

**The build is the floor, not the check.** It is blind to a dead href, a lost YAML key, a banned phrase and a relative image path, and it passed green across all three defects the rules list names.

## 3. Content audit

```
npm run gate:content <ref>
```

`<ref>` is the commit before this change, or the task's first commit when closing.

**Exits non-zero.** Every line it prints is a string that existed at `<ref>` and is now nowhere — neither in a YAML file nor in a page's hardcoded fallback. The rule is that **every printed line gets named in the commit body as deliberate** — a rename, a merge, a field restructured into two — or it is a defect. A clean run needs no explanation; anything else needs one line each.

This is the only thing that catches a lost paragraph. Every schema field is optional, so a dropped key and a key that was never set look identical to Astro.

## 4. Vocabulary and links

```
npm run gate:vocab
npm run gate:links
```

Both exit non-zero.

- **Vocabulary: 0 hits.** The four phrases over `dist/index.html`, `dist/404.html` and `dist/gallery/**`. It reads built output rather than source because the violation it exists for lived in `SITE.description` — shared chrome no YAML grep reaches, rendering onto the gallery host through the shared 404.
- **Links: 0 dead.** Every internal href resolves to a file or a directory index. `astro build` does not check hrefs; four dead ones survived in `main`.

## 5. Routing

```
npx wrangler pages dev dist
```

One assertion per row of TDD §6.2's behaviour table — status and `Location`, driven with an explicit `Host` header. **Including the two asset rows**, `/_astro/*` and `/uploads/*` served unrewritten on a section host, since that is the exact failure the dropped Transform Rule design shipped with.

The suite itself lands in T10.2. Until it does, a middleware change is verified by hand against the table and the commit body says which rows were checked.

`link()` returns paths in dev, so nav hrefs are asserted against `astro build` output, **never** `astro dev`.

## 6. CMS

Every `file:` path in `public/admin/config.yml` resolves, every key in the YAML it points at is editable through some field, and no YAML file under `src/content/pages/` lacks an entry. A structural check covers all three; the login-gated round trip through `/admin` needs someone with CMS access and is called out as unverified rather than assumed.

## 7. Forms

Renders, carries its honeypot and its on-site redirect, posts the right subject, and the access key matches the inbox that form is supposed to reach. **A real submission landing in the right inbox is the only proof of the last one** — assert the markup, then say plainly whether a live submission was made or not.

## 8. Commit

Conventional commit, **lower-case subject**, one finding. The body quotes the before and after numbers this gate produced, with a blank line before any trailing IDs. Name the task: `T1.3`, not "the activities thing".

## 9. Record it

In the backlog, tick **the step that just landed**, with its measurement rather than a bare tick. The task itself stays open until every step under it is ticked and its acceptance criteria verified line by line.

Wrong: `- [x] Move the Activities copy out of Learn`
Right: `- [x] Move the Activities copy out of Learn — 179 leaf strings audited at 305a757, 16 unaccounted for and all 16 deliberate, 0 loss`

**If the backlog turned out to be wrong about the task, say so in the entry** rather than quietly fixing the wording. The reason a stale claim survived is worth more than the claim. If the work surfaced a fact that will cost the next session time, add it to CLAUDE.md's rules list in the same commit.

**A design call gets its own commit**, never bundled with a mechanical finding: a new numbered decision in TDD §2 with its reasoning, and its row in that table. If the call contradicts an existing decision, stop and raise it instead of writing a nineteenth that disagrees with a previous one.

Docs are a separate commit from code when the doc change records more than the one finding.

## When a gate fails

Report the shortest decisive line, not the log. Fix or revert. Never land a red gate, and never quote a number the gate did not produce.
