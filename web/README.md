# Hybrid homepage (`web/`)

Next.js 16 + TypeScript + Tailwind + shadcn-style `components/ui` for a **side-by-side** rebuild of the marketing homepage.

**Production static site is unchanged** at the repo root (`index.html`, Vercel root deploy).

## Run locally

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What’s included

| Section | React components |
|---------|------------------|
| Hero + animated word cycle | `hero.tsx`, `ui/animated-text-cycle.tsx` |
| Zip cards | `zip-cards.tsx` |
| Kitchen-table belief | `belief.tsx` |
| Families strip | `family-table.tsx` |
| Testimonials marquee | `testimonials.tsx`, `ui/testimonials-columns-1.tsx` |
| Lead form | `start-cta.tsx` (Formspree) |

Brand tokens: navy / gold / cream in `tailwind.config.ts` + `globals.css`.  
UI path: **`src/components/ui`** (shadcn default via `components.json`).

## Dependencies

```bash
npm install framer-motion motion clsx tailwind-merge class-variance-authority lucide-react
```

Add more shadcn primitives:

```bash
npx shadcn@latest add button card
```

## Hybrid deploy plan (when ready)

### Option 1 — Preview project (safest)

1. In Vercel, create a **new project** from this repo.
2. Set **Root Directory** to `web`.
3. Deploy → get `*.vercel.app` preview URL.
4. Keep production domain on the static root project until you cut over.

### Option 2 — Same project, gradual cutover

1. Move static HTML pages into `web/public/` (or keep dual deploy).
2. Point domain to the Next project.
3. Deep guides stay as static files under `public/` until migrated.

**Do not** change the current production Vercel root until the hybrid homepage is reviewed.

## Link strategy during hybrid phase

- Deep content (library, guides, zip pages) links **out** to `https://kareemjamaltherealtor.com/...`
- New interactive UI lives here first
- Shared Formspree endpoint for leads

## Why this structure

| Path | Purpose |
|------|---------|
| Repo root HTML | Live production, SEO content |
| `web/` | Next hybrid homepage + React/shadcn components |
| `components/ui` at root | Earlier React source copies (optional mirror) |

Prefer importing from `web/src/components/ui` going forward.
