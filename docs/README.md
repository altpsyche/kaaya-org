# Kaaya website — documentation

Read in this order.

| Document | What it is |
|---|---|
| [`kaaya_website_build_instructions (final).md`](./kaaya_website_build_instructions%20(final).md) | The content and product spec — what the five sites say and who they say it to. Carries an amendments block recording where technical review overrode it. |
| [`kaaya_website_technical_design.md`](./kaaya_website_technical_design.md) | How it is built. Architecture, routing, content model, and the decisions log (§2) that resolves every open question. |
| [`kaaya_website_implementation_tasks.md`](./kaaya_website_implementation_tasks.md) | The backlog. Epics and tasks with acceptance criteria, dependencies, and what is blocked on content rather than code. |
| [`scrape/`](./scrape/) | Raw scrape of the live Wix gallery. A **content source** for the gallery build — the domain itself is out of scope. |
| [`archive/`](./archive/) | Superseded specs. Not buildable instructions. |

**Start implementing at** the technical design's §15 rollout phases, or the backlog's Epic E0 — the live defect fixes, which have no dependencies.
