# Next Task — CMS-managed images & page content

## What was completed (this session)

Full site build is done and verified:
- All 6 pages (/, /place, /learn, /incubate, /exchange, /visit)
- 3 blog posts with full content
- 15 UI components in `src/components/ui/`
- Header (6-item nav + active state), Footer (address + contact)
- CategoryFilter on /blog with client-side JS
- Sveltia CMS fields: author, readTime, categories
- `@tailwindcss/typography` installed and wired
- Google Fonts loaded (Inter + JetBrains Mono)
- Zero build errors

**Current image situation:**
- Blog post heroes: Wix CDN URLs (`static.wixstatic.com/...`) — marked with `<!-- TODO: replace -->`
- Page heroes: CSS gradient fallback — no images at all
- Wix CDN is temporary and will be removed

---

## Goal for this session

**Make images manageable through Sveltia CMS for both blog posts AND main pages.**

The client should be able to:
1. Upload a photo in `/admin/` and have it appear as the hero on `/place`, `/learn`, etc.
2. Continue uploading blog post hero images via CMS as they do now
3. Not touch any code to swap an image

---

## The problem to solve

Currently main pages (place, learn, incubate, exchange, visit, home) are static Astro `.astro` files. Their content — including any future `image` prop passed to `<Hero>` — is hardcoded in the file. The client can't change it without a code deploy.

**Solution direction: Sveltia CMS "files" collection for page settings**

Sveltia CMS (Netlify CMS compatible) supports two collection types:
- `folder` — one entry per file (already used for blog posts)
- `files` — a fixed set of named files, each with its own field schema

A `files` collection called `pages` can store one YAML/JSON file per page:
```
src/content/pages/place.yaml
src/content/pages/learn.yaml
src/content/pages/home.yaml
...
```

Each file holds the CMS-editable fields for that page: `heroImage`, and potentially `heroHeading`, `heroSubheading`.

Astro pages would then read this data at build time via `getEntry('pages', 'place')` and pass it to the `<Hero>` component.

---

## Implementation plan for this session

### 1. Add `pages` content collection to `src/content.config.ts`

```ts
const pages = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/pages' }),
  schema: z.object({
    heroImage: z.string().optional(),
    heroHeading: z.string().optional(),
    heroSubheading: z.string().optional(),
  }),
});
export const collections = { blog, pages };
```

### 2. Create initial YAML files in `src/content/pages/`

One per page with placeholder values (no image yet = gradient fallback):
- `home.yaml`, `place.yaml`, `learn.yaml`, `incubate.yaml`, `exchange.yaml`, `visit.yaml`

### 3. Update each page to read from CMS

```ts
// in place.astro frontmatter
import { getEntry } from 'astro:content';
const pageData = await getEntry('pages', 'place');
const { heroImage, heroHeading, heroSubheading } = pageData?.data ?? {};
```

Then pass to `<Hero>`:
```astro
<Hero
  heading={heroHeading ?? 'Place'}
  subheading={heroSubheading}
  image={heroImage}
/>
```

### 4. Add `files` collection to `public/admin/config.yml`

```yaml
- name: "pages"
  label: "Page Settings"
  files:
    - name: "home"
      label: "Home"
      file: "src/content/pages/home.yaml"
      fields:
        - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
        - { label: "Hero Heading", name: "heroHeading", widget: "string", required: false }
        - { label: "Hero Subheading", name: "heroSubheading", widget: "string", required: false }
    - name: "place"
      label: "Place"
      file: "src/content/pages/place.yaml"
      fields:
        - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
    - name: "learn"
      label: "Learn"
      file: "src/content/pages/learn.yaml"
      fields:
        - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
    - name: "incubate"
      label: "Incubate"
      file: "src/content/pages/incubate.yaml"
      fields:
        - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
    - name: "exchange"
      label: "Exchange"
      file: "src/content/pages/exchange.yaml"
      fields:
        - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
    - name: "visit"
      label: "Visit"
      file: "src/content/pages/visit.yaml"
      fields:
        - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
```

### 5. Replace Wix blog post images

Once the client uploads the 3 images via CMS:
- Open each blog `.md` in the CMS or manually update `heroImage` frontmatter
- Remove the `<!-- TODO: replace heroImage -->` comments

---

## Media storage note

CMS uploads currently go to `src/assets/uploads/` (configured in `public/admin/config.yml`). This is correct — Netlify serves them from the built output. No change needed here.

---

## Files to touch

| File | Change |
|------|--------|
| `src/content.config.ts` | Add `pages` collection |
| `src/content/pages/*.yaml` | Create 6 files (one per page) |
| `src/pages/index.astro` | Read from `pages/home` entry |
| `src/pages/place.astro` | Read from `pages/place` entry |
| `src/pages/learn.astro` | Read from `pages/learn` entry |
| `src/pages/incubate.astro` | Read from `pages/incubate` entry |
| `src/pages/exchange.astro` | Read from `pages/exchange` entry |
| `src/pages/visit.astro` | Read from `pages/visit` entry |
| `public/admin/config.yml` | Add `pages` files collection |
| `src/content/blog/*.md` | Swap Wix URLs → CMS-uploaded paths |

---

## Done when

- Client can go to `/admin/` → "Page Settings" → "Place" → upload an image → save → Netlify builds → `/place` shows the new hero image
- Blog post images are no longer hosted on Wix CDN
- Gradient fallback still works if no image is set for a page
