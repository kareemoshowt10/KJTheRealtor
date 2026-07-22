# Hybrid upgrade path (Path B)

## Status

| Layer | Location | Role |
|-------|----------|------|
| **Production (target)** | `web/` Next.js · Vercel `kjtherealtor-hybrid` | Homepage + `/91311` + static deep pages in `public/` |
| **Legacy static project** | Repo root · Vercel `kjtherealtor` | Previous host of domain; keep as backup |

### Live URLs

- **https://kareemjamaltherealtor.com** — production (hybrid after cutover)  
- **https://kjtherealtor-hybrid.vercel.app** — same project alias  

Deep guides / zip HTML live under `web/public/*.html` (cleanUrls). Next owns `/` and `/91311`.

Redeploy production:

```bash
cd web
vercel --prod --yes
```

## Quick start

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

## Hybrid routes

| Route | Status |
|-------|--------|
| `/` | Homepage (hero cycle, zips, families, testimonials, form) |
| `/91311` | Chatsworth chapter (story, pockets, families, owners, connect) |

Still on production static until cutover: deep guides, 93063, 91304, library pages.

## What’s in the hybrid homepage

1. Hero + animated word cycle (`explained / protected / planned / handed down`)
2. Three zip cards (91311 is internal; 93063 / 91304 still link live)
3. Kitchen-table belief section
4. Families strip (Prop 19 · hold/sell · Equity Snapshot)
5. Testimonials columns (motion)
6. Lead form (Formspree)

## What’s in hybrid `/91311`

1. Chatsworth hero (cliffside art)
2. Ledger numbers (1861 · 2,000+ · 1904 · K zoning)
3. Condensed origin story timeline
4. Six-pocket market map
5. Families kitchen-table strip (Chatsworth-specific)
6. Owner’s playbook
7. Connect form with ask-chips (Formspree)

## Stack

- Next.js App Router + TypeScript  
- Tailwind CSS + brand tokens (navy/gold/cream)  
- shadcn-style `src/components/ui` + `components.json`  
- `framer-motion` + `motion`  

## Cutover when ready

1. Vercel → new project, **Root Directory = `web`**
2. Preview URL review
3. Optional: move deep HTML into `web/public/` for single deploy
4. Point domain only after QA

See `web/README.md` for detail.
