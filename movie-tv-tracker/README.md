# Reels & Reruns — Movie/TV Tracker

Phase 1 MVP of a Letterboxd/Serializd-style tracker with dynamic (not
static) ranking. See [`BLUEPRINT.md`](./BLUEPRINT.md) for the full product
design (pages, schema, ranking formula, feature priorities).

Standalone app — its own `package.json` and deploy config, independent of
the KJTheRealtor site this repo also contains.

## Stack

- Next.js 14 (App Router, TypeScript)
- Supabase (Postgres, Auth via magic link, RLS)
- TMDB API for title search/metadata
- Tailwind CSS

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the migration in `supabase/migrations/0001_init.sql` against it
   (via the SQL editor, or `supabase db push` if using the CLI).
3. Get a [TMDB API key](https://www.themoviedb.org/settings/api) (v3 auth).
4. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
     Supabase project settings → API
   - `TMDB_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev
5. In Supabase Auth settings, add `http://localhost:3000/auth/callback`
   (and your production URL's equivalent) to the redirect allow-list.

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check with no emit

## What's implemented (Phase 1)

- Magic-link auth, auto-created profile on first login
- TMDB search → add a movie/show to your library
- Status tracking (watchlist / watching / completed / dropped)
- Rewatch logging and last-watched date
- Append-only rating history (`ratings` table) feeding a dynamic score —
  see `src/lib/scoring.ts` for the recency/completion/rewatch formula
- Personal ranked list (`/rankings`) and public profile pages
  (`/profile/[username]`)

## Not yet built (Phase 2, schema reserved)

Follow graph, friends feed, per-title discussion tabs, collaborative
lists, reputation weighting. Tables already exist in the migration
(`follows`, `lists`, `list_items`, `discussion_threads`,
`discussion_posts`) so this can be built without a schema migration.

## Known follow-ups

- Next.js is pinned to the latest `14.2.x` patch; a handful of advisories
  in `npm audit` only have fixes in the Next 16 major — worth revisiting
  before a production launch.
- ESLint isn't wired up yet (`next lint` wants to install a v9-only config
  by default); `npm run typecheck` and `npm run build` are the current
  correctness gates.
- This was scaffolded and typechecked/build-validated with dummy env vars;
  it has **not** been exercised against a real Supabase project or TMDB
  key, so the auth → add-title → rate flow should be smoke-tested end to
  end before relying on it.
