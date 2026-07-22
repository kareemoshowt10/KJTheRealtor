# Hybrid upgrade path (Path B)

## Status

| Layer | Location | Role |
|-------|----------|------|
| **Production** | Repo root static HTML | Live `kareemjamaltherealtor.com` |
| **Hybrid preview** | `web/` Next.js app | New homepage + React/shadcn stack |

Production is **not** cut over until you deploy `web/` deliberately.

## Quick start

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

## What’s in the hybrid homepage

1. Hero + animated word cycle (`explained / protected / planned / handed down`)
2. Three zip cards (links to live 91311 / 93063 / 91304)
3. Kitchen-table belief section
4. Families strip (Prop 19 · hold/sell · Equity Snapshot)
5. Testimonials columns (motion)
6. Lead form (Formspree)

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
