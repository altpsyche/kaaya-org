# Kaaya Website — Build Instructions

**For:** Website builder / developer
**Repo:** [add GitHub repo link]
**Prepared by:** [Name]
**Date:** [Date]

**Context:** This is a repositioning of an existing, live site (currently at `kaaya.org` with subdirectory pages), not a build from scratch. See Section 3 for the migration/redirect plan this requires.

---

## Amendments after technical review (2026-08-09)

This spec stands as written except for the points below, resolved during technical review and recorded in full in [`kaaya_website_technical_design.md`](./kaaya_website_technical_design.md) §2. Noted here so this document is not read as still specifying them.

1. **Cart becomes Shop, and it is enquiry-only.** §4 describes Cart as a shop for work made at Kaaya, but no payment provider, order handling, inventory or shipping appears anywhere in this document. The section is renamed **Shop** (`gallery.kaaya.org/shop`), pieces are listed with their prices, and every buy affordance is an enquiry to `gallery@kaaya.org`. The small cart icon in the nav does not apply — there is no cart. Note this removes working checkout: the live Wix gallery currently has Add to Cart and Buy Now on all five artworks.

2. **Art and Shop merge; the gallery nav becomes Shop · Artist.** §4 lists Art and Cart as separate nav items, but there are five artworks in total and they are simultaneously the exhibition and the catalogue — two list pages over the same five pieces is near-duplicate content on one host. The exhibition narrative moves onto the gallery homepage, where the hero already lives; `/shop` is the works catalogue. There is no `/art` route. Gallery events are featured on that homepage but live on `events.kaaya.org` (amendment 11).

3. **Every work, artist and event gets its own page.** The gallery's content is substantial — full descriptions, six long artist biographies — and the Wix site already had a page per work and per artist. Losing that would make a ₹12,000 artwork impossible to link to or find in search.

4. **`kaaya.org` has no contact form.** §8 asks for footer-weight Visit info — hours, directions, contact. That ships as a printed address (`art@kaaya.org`), not a form. Forms exist on Incubate, Exchange, Booking and Shop only.

5. **`place.kaaya.org` gets real sub-routes.** §5's four sections (Story, Activities, Stay Details, Booking) become their own URLs — `/story`, `/activities`, `/stay`, `/booking` — rather than anchors on one long page, so each can be linked to directly and found in search on its own.

6. **"Studio Rooms" is renamed "Garden Rooms".** §5 flags the collision itself. Studios keeps its name, since those cottages genuinely contain working studios; the visitor accommodation moves.

7. **Gallery contact is `gallery@kaaya.org`, not `art@kaaya.org`.** §9's routing table is overridden for the gallery host only — `gallery@` is already published on the live gallery site. Home and Happenings still show `art@`, Place `info@`, Community `connect@`.

8. **Pottery, trails, nature art and farm picnics live on Place → Activities.** §10 flags the Learn/Visit overlap. Full descriptions sit at `place.kaaya.org/activities`; Learn keeps the structured programmes table and links across.

9. **The Incubate form keeps its live fields.** §6 specifies Name, Age, Phone, Brief idea. The live form has Name, Phone, "About you in short", "Your idea brief" and a work/portfolio link — richer, and already collecting real applications. It carries over unchanged; there is no Age field.

10. **Section 2's hosting question is settled.** One repo, one build, one Cloudflare Pages deployment serving all six hostnames. No separate repo or deployment per domain.

11. **Events gets its own subdomain: `events.kaaya.org`.** §6 puts Events under Community, but the events that actually exist are gallery-run (Studio 1, Nature Café) while §6's are institutional — so the same listing was being split across two sections, leaving an editor to guess where a new event belongs and a visitor to guess where to look. Every event now lives at `events.kaaya.org`, categorised on the page. The Gallery and Community homes each *feature* their own upcoming events and link across. This makes the nav five sections rather than four — Gallery · Place · Community · Events · Happenings — still a thin text nav, not the tile grid §1 warns against, and Gallery keeps its emphasis. Five is the ceiling; anything further belongs inside a section.

12. **Studios ships without residency terms.** §10 leaves pricing, duration and application process open. The Studios story and the Stay table row ship anyway, with enquiry as the only next step — nothing is published that has not been decided.

### Still needed from you

- **Real event dates and the campus address.** The three gallery events carry Wix placeholder data — `08 Aug 2026, 1:41 am – 3:41 am` and `123 Art Ln, Sweetwater, TN 37874, USA`. These cannot ship.
- **`info@kaaya.org` created and monitored** before launch, or Place bookings go nowhere.
- **`art@kaaya.org` confirmed as a real, monitored mailbox** — it is the printed contact on `kaaya.org`, `events.kaaya.org` and `happenings.kaaya.org`. If events warrant their own address, say so.
- **Replacement site descriptions.** The global description shown on every page of every host is currently *"A small experiment in sustainable living"* — one of the four phrases §9 bans from `kaaya.org` and `gallery.kaaya.org`. It is being replaced with one short description per host — five strings — and that copy is yours to write.
- **An owner for the Artist of the Month slot**, which goes stale without one.
- **Confirmation of the event categories** — currently exhibition, workshop, talk, market, other. A first draft; extend it before the CMS collection is locked.

---

## 1. The Core Principle (read this first)

`kaaya.org` is the homepage and front door — a hero built around the current exhibition, with a thin, understated nav to four subdomains. The nav exists for people who already know where they're going; the homepage itself should still read as "this is an art space" through sheer visual weight and sequence, not through how many items sit in navigation.

- **`gallery.kaaya.org`** — Art, Artist, Cart. The gallery's own dedicated site.
- **`place.kaaya.org`** — Story, Activities, Stay Details, Booking. Mud architecture, rural setting, embedded in nature.
- **`community.kaaya.org`** — Learn, Incubate, Exchange, Events. Circular economy, incubation, exchange, and the learning programmes that are the heart of what Kaaya does. (Renamed from "Ecosystem" — reads softer, fades into the background more easily.)
- **`happenings.kaaya.org`** — Blog. The connective thread across everything.

**Do not** let the homepage present these four as equal tiles in a grid. See Section 5 for the homepage layout/hierarchy spec — nav can be flat, but the page itself should not be.

**Note for context:** the current live homepage shows Place, Learn, Incubate, Exchange, and Visit as five equal tiles — exactly the parallel-menu pattern this restructuring replaces. The rebuild is a genuine repositioning, not just an addition.

---

## 2. Repository & Domain Setup

Four real deployments now (Gallery is no longer a redirect — it's a full site):

- **`kaaya.org`** → homepage/hero + nav shell
- **`gallery.kaaya.org`** → the gallery site (Art, Artist, Cart)
- **`place.kaaya.org`** → separate microsite/deployment
- **`community.kaaya.org`** → separate microsite/deployment (formerly planned as `ecosystem.kaaya.org`)
- **`happenings.kaaya.org`** → blog microsite/deployment

**Assumption — please confirm/edit with your dev:** each domain can be its own repo and deployment, or one repo with multiple build targets and matching DNS CNAME records. Either works; pick whichever fits your GitHub/hosting workflow.

**DNS:** `gallery`, `place`, `community`, and `happenings` each need their own CNAME/A record pointed at wherever they're hosted.

---

## 3. Migration & Redirects (required — this site is already live)

The current site is indexed by search engines and its URLs may already be shared elsewhere. Every old URL needs a 301 redirect to its new home — don't just delete the old pages.

| Old URL (current site) | New URL | Notes |
|---|---|---|
| `kaaya.org/` | `kaaya.org/` | Content replaced with the new homepage/hero |
| `kaaya.org/place` | `place.kaaya.org` | |
| `kaaya.org/learn` | `community.kaaya.org/learn` | |
| `kaaya.org/incubate` | `community.kaaya.org/incubate` | |
| `kaaya.org/exchange` | `community.kaaya.org/exchange` | |
| `kaaya.org/visit` | `kaaya.org` (footer/contact section) | Visit is no longer a standalone page — folded into the homepage as generic contact info (see Section 5) |
| `kaaya.org/blog` | `happenings.kaaya.org/blog` | |
| `kaaya.org/blog/if-everyone-is-a-social-enterprise-what-does-the-term-actually-mean` | `happenings.kaaya.org/blog/...` | |
| `kaaya.org/blog/making-of-kaaya` | `happenings.kaaya.org/blog/...` | |
| `kaaya.org/blog/re-imagining-the-kaccha-ghar` | `happenings.kaaya.org/blog/...` | |

---

## 4. Subdomain — `gallery.kaaya.org`

### Nav: Art
Exhibitions — current and rotating. Note on provenance: some pieces are made on-site, in Kaaya's own Pottery and Workshop facilities (see Section 6) — worth surfacing on individual pieces where true, since it's a stronger story than imported work.

### Nav: Artist
Profiles, plus the **Artist Archive** (ongoing record of past exhibitions — functions as this subdomain's blog-equivalent, though the actual Blog lives on `happenings.kaaya.org`).

**New: the Studios / residency story.** Two mud cottages where artists live on the ground floor and work in a studio on the upper floor. This is one of the strongest pull-story additions available — feature it prominently here as "some artists don't just show here, they live and work here." Booking/logistics for a Studios stay live on `place.kaaya.org` (see Section 5) — cross-link both directions.

### Nav: Cart
Shop for work made at Kaaya — including pottery and wood/craft pieces from the Pottery and Workshop facilities. Keep the cart icon small and iconographic in the nav (utility signal), not a labeled nav item competing with Art/Artist for attention.

---

## 5. Subdomain — `place.kaaya.org`

### Section: Story
Real founding content, already live and worth carrying over:
- "Kaaya" means "body" in Sanskrit — reflecting a focus on the physical, tangible sides of sustainable living.
- Mud construction using locally excavated soil, campus laid out cluster-style, following the land's contours.
- Founder quote: *"We didn't want to spend too much money, so we had to save cost. Instead of importing materials or outside labour, Kaaya relied on what already existed within the village — local soil, local skills, and local knowledge."*
- The Annexe — a newer space blending the same building tradition with more comfort, for longer stays and deeper learning.

### Section: Activities
- Pottery — hands-on terracotta making. **Some finished pieces feed into `gallery.kaaya.org`'s Art and Cart pages** — note this connection here so visitors understand their work might end up in the gallery or shop.
- Workshop — wood working and tools, for visitors creating their own designs and installations. **Same cross-link to Gallery applies.**
- Forest & eco trail, nature art class, farm day picnic (as before).

### Section: Stay Details
Updated accommodation table — **Studios added**:

| Type | Details | Capacity |
|---|---|---|
| Studios | 2 mud cottages — ground floor stay, upper floor working studio | Artist residencies — see Gallery → Artist for the residency programme |
| Mud Huts | Large mud-walled hall, single beds | Max 12 |
| Family Rooms | 3 units, double beds, attached bucket baths | Max 6 |
| Studio Rooms *(visitor accommodation type, distinct from Studios above)* | 2 units, one double + floor beds | Max 8 |
| Dormitory | 2 units, twin sets, two floors | Max 8 |

*Note: "Studio Rooms" (existing visitor accommodation) and "Studios" (new artist residency cottages) are named similarly — worth a naming pass with your builder to avoid visitor confusion between the two.*

**Cost:** ₹1,200–₹2,100 per bed per day for standard stays; Studios residency terms TBD separately (see open items). **Meal plans:** Basic or Custom. **Booking:** 50% advance required.

### Section: Booking CTA
Routes to **info@kaaya.org**.

---

## 6. Subdomain — `community.kaaya.org` (renamed from Ecosystem)

**Home** — connecting narrative: circular economy and community, farmer's market as *"a window Kaaya opens to the surrounding community,"* never in commercial terms.

### Nav: Learn
The heart of what Kaaya does — restored here after being dropped from an earlier list. Real content already live, worth carrying over:

Framing: *"Kaaya is not running courses. It is not in the business of teaching. What happens here is closer to a shared inquiry."*

| Duration | Programme | Description |
|---|---|---|
| 1–5 days | Short immersions | Curriculum-linked outdoor camps (seed/milk/soil journeys) |
| 1–5 weeks | Project residencies | Students work collaboratively on a specific local challenge |
| Up to 6 months | Live projects & internships | For college students/young professionals |
| Summer | Detox camps | Unstructured nature time for urban children |

Links out to wherever people actually enroll — no booking/calendar system built here.

---

### Nav: Incubate
Space, mentorship, and funding for selected concepts. Application form (fields as specified — Name, Age, Phone, Brief idea, Submit — see the flagged discrepancy with the live site's actual form in open items). Routes to **connect@kaaya.org**.

Current examples: **Padav Fellowship** (Jagmohan Bangani), **Anutraaya** (Asambhava).

### Nav: Exchange
Partnership specifics for institutions — the Value Exchange System, live partnerships (Setu Aayog/ISVC, UMSVY), five strategic pillars, partner inquiry form. Routes to **connect@kaaya.org**.

### Nav: Events
*(moved here from `kaaya.org` in an earlier revision)* — openings, talks, and institutional/community happenings relevant to this audience.

## 7. Subdomain — `happenings.kaaya.org`

### Nav: Blog
The connective thread — stories that span Gallery, Place, and Community rather than sitting neatly in one. All three existing posts migrate here: *"Making of Kaaya,"* *"Re-imagining the Kaccha Ghar,"* and *"If Everyone Is a Social Enterprise, What Does the Term Actually Mean?"*

---

## 8. Main Site — `kaaya.org` Homepage

### Layout & hierarchy (see companion visual mockup)
- **Nav bar:** thin, understated. Gallery, Place, Community, Happenings, plus a small Cart icon. Gallery listed first and slightly emphasized — not dramatically, just enough to read as primary.
- **Hero:** full-bleed image of the current exhibition, dominating 50–70% of the viewport. No competing CTAs here.
- **Below the hero:** more gallery content (artist highlights) before anything else appears — a visitor should scroll past real gallery content before reaching any mention of Place or Community.
- **Footer-weight only:** the Kaaya Story teaser, ending in two quiet links ("Know the place," "Know the ecosystem" — update copy to "Know the community" per the rename) plus generic Visit info (hours, directions, contact routing to **art@kaaya.org**).

### Copy — Kaaya Story teaser (footer-weight)

> Kaaya isn't a gallery built for art alone.
>
> It sits on a campus that has spent years quietly practicing a different way of living — testing what it means to grow food, build shelter, and share resources without taking more than the land can give back.
>
> The art here didn't arrive from elsewhere. It grew out of that same ground — shaped by the people who've lived, worked, and stayed on this land, in exchange with it and with each other.
>
> What you're seeing is one visible layer of something larger.
>
> *See how it's built, and where →* **Know the place**
> *Understand the wider circle →* **Know the community**

---

## 9. Tone & Content Rules (apply across all sites)

- Never use the words "circular economy," "incubation," "internships," or "sustainable living" on `kaaya.org` or `gallery.kaaya.org`. These belong only on `community.kaaya.org`.
- The farmer's market is never described in commercial terms anywhere on any site.
- **Contact routing:** `kaaya.org` (Visit/homepage) routes to **art@kaaya.org**; `place.kaaya.org` bookings route to **info@kaaya.org**; `community.kaaya.org`'s Incubate and Exchange both route to **connect@kaaya.org**.
- Cross-linking between Gallery, Place, and Community should be quiet and purposeful (e.g. Studios, Pottery/Workshop provenance) — not a general "explore more" pattern.

---

## 10. Open Items for You to Confirm

- [ ] Final hosting/deploy setup for all four domains (see Section 2)
- [ ] Real photography/imagery direction
- [ ] Confirm `place.kaaya.org` booking routing: new **info@kaaya.org** inbox, or keep the existing **connect@kaaya.org** + phone numbers already live
- [ ] Resolve the Incubate form field discrepancy — your specified 5 fields vs. the live site's actual fields
- [ ] Confirm the Learn/Visit-era content overlap (pottery, trails, nature art, farm picnics) gets a single canonical source, now that Pottery has its own dedicated section
- [ ] Studios residency terms (pricing, duration, application process) — not yet defined, distinct from standard nightly stay pricing
- [ ] Naming clarity between "Studios" (artist residency cottages) and "Studio Rooms" (existing visitor accommodation) — recommend resolving before build to avoid visitor confusion
