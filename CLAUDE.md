# Project: KJTheRealtor

Branded static real-estate site for Kareem Jamal, Rodeo Realty Fine Estates.
Hand-authored HTML/CSS/JS, deployed on Vercel with clean URLs.

## Stack
- Static HTML pages at repo root (one file per route, e.g. `buyers.html` -> `/buyers`).
- Shared JS: `contact-widget.js`, `progressive-form.js`, `track.js`, `upgrade.js`.
- Shared CSS: `polish.css`.
- Routing/headers: `vercel.json`. Sitemap: `sitemap.xml`. AI crawl hints: `llms.txt`.
- Node scripts under `scripts/` (currently `market-pulse/`). Local preview: `node serve.js` (port 3019).

## Layout
- `*.html` (root)      — pages; each is self-contained (inline `<style>`/`<script>` common).
- `assets/`            — images and static media.
- `data/`             — generated JSON consumed by pages (e.g. `market-pulse-*.json`).
- `scripts/`          — Node generators/loops.
- `.github/workflows/` — scheduled loops (market-pulse cron).
- `.claude/skills/`    — repo skills (`kjguide`).
- `Archive-NonProject/`, `*.zip` — snapshots; do not treat as live source.

## Commands
- `node serve.js`                — local preview at http://localhost:3019
- `node scripts/verify.mjs`      — validate internal links + referenced assets exist
- `node scripts/verify.mjs <file.html>` — validate a single page
- `cd scripts/market-pulse && npm run generate` — refresh market-pulse data (needs FIRECRAWL_API_KEY)

## Conventions
- Match the surrounding page: mirror its markup, class names, and inline-style idiom. Do not introduce a framework or a build step.
- Guides live at `/<slug>-guide` and are cloned from `repair-credit-guide.html` via the `kjguide` skill.
- Internal links use clean URLs (`/buyers`, not `/buyers.html`) to match `vercel.json`.
- Keep the market-pulse widget copy positive — the generator's DENYLIST filters grim headlines; do not weaken it.

## Never
- Edit files in `Archive-NonProject/` or unzip/commit the `*.zip` snapshots as source.
- Hand-edit `data/market-pulse-*.json` — it is generated; change `scripts/market-pulse/generate.mjs` instead.
- Commit secrets. `FIRECRAWL_API_KEY` and any keys live in env / GitHub Actions secrets, never in the repo.
- Add third-party runtime dependencies or a bundler to the static site.

## Brand (canonical — keep consistent across every page)
- Agent: Kareem Jamal · Rodeo Realty Fine Estates · CA DRE #01998956
- Email: kjamal@rodeore.com · Phone: (818) 402-7326
- Office: 21031 Ventura Blvd., #100, Woodland Hills, CA 91364
