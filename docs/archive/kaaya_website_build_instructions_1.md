# Kaaya Website — Build Instructions

**For:** Website builder / developer
**Repo:** [add GitHub repo link]
**Prepared by:** [Name]
**Date:** [Date]

---

## 1. The Core Principle (read this first)

`kaaya.org` shows **only** the Art Gallery. This is the front door. Nothing else competes with it for space, navigation, or attention.

Two separate subdomains hold the deeper context, reached only by choice, never presented alongside the gallery as parallel options:

- **`place.kaaya.org`** — the campus, the land, and how learning happens there.
- **`ecosystem.kaaya.org`** — circular economy, incubation, exchange, community, internships.

**Do not** turn `kaaya.org` into a hub or landing page that lists "Gallery / Place / Ecosystem" as three equal choices. That recreates the exact dilution problem this restructuring is built to avoid. `kaaya.org` **is** the gallery — the two subdomains are reached only through a quiet link at the end of the gallery experience.

---

## 2. Repository & Domain Setup

Four domains, three of them real deployments:

- **`kaaya.org`** → the gallery site (canonical, primary build)
- **`gallery.kaaya.org`** → **301 redirect only**, points to `kaaya.org`. Not a second site — just a safety net for anyone who types or links to this URL directly.
- **`place.kaaya.org`** → separate microsite/deployment
- **`ecosystem.kaaya.org`** → separate microsite/deployment

**Assumption — please confirm/edit with your dev:** each of the three real domains can be its own repo and deployment, or one repo with three build targets and matching DNS CNAME records for the subdomains. Either works; pick whichever fits your existing GitHub/hosting workflow.

**DNS:** `place`, `ecosystem`, and `gallery` each need their own CNAME/A record. `gallery.kaaya.org`'s record just needs to point wherever the redirect rule lives (can be a one-line redirect config at the host, doesn't need a full deployment).

---

## 3. Main Site — `kaaya.org`

### Navigation (keep this short — 4 items max)
- **Exhibitions**
- **Artists**
- **Events**
- **Visit**

No other top-level nav items. Nothing here for market, stay, learning, or ecosystem content — that lives on the subdomains, reached only through the story teaser below.

### Homepage requirements
- Hero: current exhibition — imagery/title of the art itself, not a mission statement.
- Below the fold: artist profiles, upcoming/rotating exhibitions.
- **Events** page: openings, artist talks, gallery-hosted happenings — dates and RSVP/contact only, no separate booking engine needed unless ticketing is required.
- **Visit** page: hours, directions, and a contact link — practical only. No booking system needed; if someone wants to stay at the cottages or arrange something further, the contact link is enough to route that conversation.
- Near the end of the exhibition/homepage content, include the **Kaaya Story** teaser (copy below), ending in **two** quiet links — not one — pointing to the two subdomains. Footer-weight, not a hero CTA.

### Copy — Kaaya Story teaser (place near footer or end of exhibition page)

> Kaaya isn't a gallery built for art alone.
>
> It sits on a campus that has spent years quietly practicing a different way of living — testing what it means to grow food, build shelter, and share resources without taking more than the land can give back.
>
> The art here didn't arrive from elsewhere. It grew out of that same ground — shaped by the people who've lived, worked, and stayed on this land, in exchange with it and with each other.
>
> What you're seeing is one visible layer of something larger.
>
> *See how it's built, and where →* **Know the place**
> *Understand the wider circle →* **Know the ecosystem**

*(First link → `place.kaaya.org`, second → `ecosystem.kaaya.org`)*

### Things to avoid on the main site
- No mention of the farmer's market as a "shop" with hours/vendor listings.
- No "Programs" or "Workshops" nav item.
- No "Stay" or booking CTA in the primary nav or hero. A contact link on **Visit** is enough for cottage/dining inquiries.

---

## 4. Subdomain — `place.kaaya.org`

Holds the physical identity of the campus: mud architecture, rural setting, embedded in nature. Reads as description, not a services list.

- **Mud architecture** — the cottages and buildings themselves, how they're built, why that choice.
- **Rural & nature** — the land, trails, gardens, the campus's relationship to its surroundings.

No forms or CTAs beyond a simple link back to the gallery if wanted (see Section 6, cross-linking rule).

---

## 5. Subdomain — `ecosystem.kaaya.org`

The broadest section: circular economy, incubation, exchange, neighbourhoods, community, internships, and learning.

- **Learning** — workshops and programs, described as an ongoing practice. Links out to wherever people actually enroll — no booking/calendar system built here.
- The **farmer's market** is mentioned here — explicitly as *"a window Kaaya opens to the surrounding community,"* not a retail or rental offering. No commission rates, vendor fees, or shop-style listings.
- **Get involved** — the one place on this subdomain with a form or contact CTA: internships, collaborations, ways to participate. Keep this contained to one page/section so the rest stays narrative, not a pitch.

---

## 6. Tone & Content Rules (apply across all sites)

- Never use the words "circular economy," "incubation," "internships," or "sustainable living" on `kaaya.org`. These belong only on `ecosystem.kaaya.org`.
- No page on any site should read like a services brochure. Prefer narrative sentences over bullet-pointed feature lists, except on the Get Involved section, where a simple list/form is fine.
- The farmer's market is never described in commercial terms anywhere on any site.
- Cross-linking: `place.kaaya.org` and `ecosystem.kaaya.org` may include a quiet way back to the gallery (e.g. a small "← Back to the gallery" link), but shouldn't aggressively promote the gallery — each subdomain should feel complete on its own.

---

## 7. Open Items for You to Confirm

- [ ] Final hosting/deploy setup for the three domains and the `gallery.kaaya.org` redirect (see Section 2)
- [ ] Real photography/imagery direction (not covered in this brief — confirm separately with whoever is producing visual assets)
