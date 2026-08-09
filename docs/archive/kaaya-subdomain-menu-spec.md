# Kaaya Website Reorganization — Menu & Content Spec

**Architecture:** 5 subdomains, each serving one visitor intent, unified under a hub homepage.
**Stack:** Astro + GitHub Pages + Decap CMS (repo structure TBD by tech lead)
**Source content audited from:** kaaya.org (WordPress) and kaayagallery.com (Wix) — July 2026

---

## Global elements (appear on all 5 sites)

**Cross-subdomain switcher** — thin bar above each site's own nav:
`Kaaya | Learn | Stay | Gallery | About`
— current subdomain highlighted, always links back to hub + siblings.

**Shared footer** — same on every subdomain:
- Kaaya Learning Centre, Village Tilwari, Dehradun 248197, Himalayan Foothills, India
- connect@kaaya.org · 8077264976 · 8279959201
- Managed by K-Green Life Pvt Ltd
- Social links

---

## 1. www.kaaya.org — Hub

**Purpose:** Directory / front door. No deep content of its own — routes visitors to the right subdomain fast.

**Nav:** Learn · Stay · Gallery · About

**Page: Home (/)**
- Hero: brand statement ("It's about Re-imagining")
- 4 directory cards, one per subdomain, each with a 1-line description + "Explore →":
  - **Learn** — Programmes for those who want to learn alongside us
  - **Stay** — Accommodation, rates, and how to find us
  - **Gallery** — Himalayan art, artists, and events
  - **About** — Who we are, what we're still learning
- **Updates** section — aggregated feed pulling latest posts from all subdomains (replaces the current single kaaya.org/blog)

**Content source:** kaaya.org homepage (hero + 5-tile grid + "Latest from Kaaya")

---

## 2. learn.kaaya.org

**Purpose:** Everyone coming for programmes, camps, residencies, and hands-on learning.

**Nav:** Programmes · Hands-on Sessions · Blog · Stay with us →

**Page: Learn (/)**
- Intro: "Learning alongside" philosophy, milk-journey example
- Source: kaaya.org/learn intro copy

**Page: Programmes (/programmes)**
- Table by duration, unchanged from current:
  - 1–5 days — Short immersions
  - 1–5 weeks — Project residencies
  - Up to 6 months — Live projects & internships
  - Summer — Detox camps
- Source: kaaya.org/learn programme table

**Page: Hands-on Sessions (/sessions)**
- Full detail on: Pottery, Forest & eco trails, Nature art classes, Farm day picnics
- Source: kaaya.org/learn session cards

**Cross-link:** CTA block → "Ready to book a stay?" → stay.kaaya.org

---

## 3. stay.kaaya.org

**Purpose:** Booking-intent visitors — accommodation, cost, logistics.

**Nav:** Accommodation · Rates & Meals · Facilities · Getting Here

**Page: Stay (/)**
- Intro + "Come and see what's happening here"
- Source: kaaya.org/visit intro

**Page: Accommodation (/accommodation)**
- Room table: Mud Huts, Family Rooms, Studio Rooms, Dormitory (type/details/capacity)
- Source: kaaya.org/visit accommodation table

**Page: Rates & Meals (/rates)**
- Cost range (₹1,200–₹2,100/bed/day), meal plans (Basic, Custom)
- Source: kaaya.org/visit cost + meal plan section

**Page: Facilities (/facilities)**
- Conference hall, outdoor sit-outs
- **Shortened** activities list (per decision: Stay keeps its own short version, does not duplicate Learn's full detail) — e.g. "Pottery, eco trails, art classes, and farm picnics available during your stay — full details on Learn"
- Source: kaaya.org/visit facilities list, trimmed

**Page: Getting Here (/getting-here)**
- Location (20 km from Dehradun), address, contact
- Source: kaaya.org/visit location block

**Cross-link:** "Want the full programme details?" → learn.kaaya.org/sessions

---

## 4. gallery.kaaya.org

**Purpose:** Art buyers, exhibition visitors, event attendees. Migrating off Wix.

**Nav:** Shop · Artists · Events · About the Gallery

**Page: Gallery Home (/)**
- Hero: "Art from the Himalayas"
- Featured products, Artist of the Month (e.g. Tenzin Norbu)
- Source: kaayagallery.com homepage

**Page: Shop (/shop)**
- Category filters: Artworks · Handmade · Collectibles
- Product grid (currently 5 live products)
- Source: kaayagallery.com/category/all-products

**Page: Artists (/artists)**
- Artist features / archive
- ⚠️ **Content gap:** current "Artists Archive" blog on kaayagallery.com has zero published posts — needs content before this section can launch meaningfully
- Source: kaayagallery.com/blog (structure only, no content yet)

**Page: Events (/events)**
- Event list + detail pages (venues: Studio 1, Nature Café — both on-campus)
- Source: kaayagallery.com/event-list + event-details pages

**Page: About the Gallery (/about)**
- Mission statement, contact
- Cross-link: "Part of the Kaaya ecosystem — see the Padav Fellowship" → about.kaaya.org/incubate
- Source: kaayagallery.com footer mission text

---

## 5. about.kaaya.org

**Purpose:** Org story, philosophy, and partnerships — aimed at press, funders, and curious visitors, not transactional.

**Nav:** Place · Incubate · Exchange · Partners

**Page: About (/)**
- Landing — short version of "It began simply enough"

**Page: Place (/place)**
- Origin story, mud-construction philosophy, K-Green Life Pvt Ltd, Annexe Project
- The "six things we keep asking" (Connect, Value, Creation, Knowing, Learning, Living)
- Source: kaaya.org/place, full content

**Page: Incubate (/incubate)**
- Plug 'n' Play model
- **Padav Fellowship** (Jagmohan Bangani / Bangani Art Foundation) — cross-link → gallery.kaaya.org/artists
- **Anutraaya** (Asambhava)
- "Bring your idea to life" contact form
- Source: kaaya.org/incubate, full content

**Page: Exchange (/exchange)**
- Value-exchange model table
- Sunday Market, UMSVY/Setu Aayog partnerships
- 5 strategic pillars for Tilwari cluster
- Source: kaaya.org/exchange, full content

**Page: Partners (/partners)**
- *(New, optional)* Pulled out of Exchange as its own page: partner logos (UMSVY, K-Green Life, PMKVY 2.0, Bhadraj Valley), "Become a Partner" CTA
- Source: kaaya.org/exchange footer section

---

## Open items for tech lead / content team

1. **Repo architecture** — pending: single monorepo vs. independent repos per subdomain (affects how shared header/footer/switcher component is maintained).
2. **Decap CMS OAuth** — GitHub Pages is static-only; needs a small OAuth proxy (e.g. Cloudflare Worker) for CMS login, regardless of repo structure chosen.
3. **DNS** — each subdomain needs its own CNAME record; each repo needs a matching `CNAME` file if using GitHub Pages' one-domain-per-repo model.
4. **Gallery Artists Archive** — currently empty on Wix; needs at least a few published artist features before gallery.kaaya.org/artists goes live.
5. **Blog/Updates aggregation** — hub's unified feed needs a decision on whether it's a shared content collection across repos, or each subdomain publishes independently and the hub polls/links out.
