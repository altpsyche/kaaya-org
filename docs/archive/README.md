# Archive — superseded specs

Not buildable instructions. Kept as a record of the content audit and the editorial reasoning behind decisions that survive in the current docs. Do not implement from anything in this folder.

Current specs live one level up: [`kaaya_website_build_instructions (final).md`](../kaaya_website_build_instructions%20(final).md), [`kaaya_website_technical_design.md`](../kaaya_website_technical_design.md), [`kaaya_website_implementation_tasks.md`](../kaaya_website_implementation_tasks.md).

| File | What it was | Why retired |
|---|---|---|
| `kaaya_website_build_instructions_1.md` | "Spec A" — `kaaya.org` as an art gallery, `place` + `ecosystem` subdomains, gallery as a 301 redirect only | Superseded by `kaaya_website_build_instructions (final).md`. Its editorial discipline survives — narrative over brochure copy, the farmer's market never described commercially, quiet cross-linking — as §9 of the final build doc. |
| `kaaya-subdomain-menu-spec.md` | "Spec B" — `kaaya.org` as a hub of directory cards, `learn`/`stay`/`gallery`/`about` subdomains | Superseded by the same document. Its information architecture instinct survives in a different four-way split. |
| `TECH_DESIGN.md` | A technical design reconciling Spec A and Spec B, dated 2026-08-02 | Built on a subdomain set (`learn`/`stay`/`gallery`/`about`) that is not the one being built. Four of its technical decisions were ported into TDD v4 and are live: in-repo Pages Function routing with an asset passthrough guard, the `link()` helper, sitemap `serialize()` reusing that helper, and the apex canonical fix. |
