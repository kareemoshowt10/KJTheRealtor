# Reels & Reruns — Movie/TV Tracker

A Letterboxd/Serializd-style tracker with dynamic (not static) ranking.
See [`BLUEPRINT.md`](./BLUEPRINT.md) for the full product design (pages,
schema, ranking formula, feature priorities).

Standalone app — its own `package.json` and deploy config, independent of
the KJTheRealtor site this repo also contains.

## Stack

- Next.js 14 (App Router, TypeScript)
- Supabase (Postgres, Auth via magic link, RLS)
- TMDB API for title search/metadata
- Tailwind CSS

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Run the migrations in `supabase/migrations/` in order (`0001_init.sql`,
   `0002_phase2.sql`, `0003_community_rankings.sql`) via the SQL editor,
   or `supabase db push` if using the CLI.
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

## What's implemented (Phase 2)

- Follow graph — follow/unfollow from profiles or the People page
- Friends activity feed (`/feed`) — ratings and status changes from people
  you follow, via the `following_activity` Postgres view
- Per-title discussion (`/title/[type]/[id]/discuss`) with five tabs:
  Reviews, Episode Reactions, Rankings Debate, Similar Titles (live from
  TMDB), and Spoiler Talk — posts support ▲/▼ voting and spoiler-hiding
- Collaborative ranked lists (`/lists`) — inline TMDB search-and-add,
  reorder, optional "others can add" mode
- Reputation — net votes on a user's posts (`user_reputation` view);
  ≥ 10 net votes earns a ★ trusted-reviewer badge shown in feeds,
  discussions, and the People page

## What's implemented (Phase 3)

- Episode/season progress for TV shows — save S/E on the title page,
  shown as a chip in ranked lists
- Score-history sparkline on the title page (append-only ratings enable
  seeing how a title aged for you)
- People discovery (`/people`) — search members by username, see follower
  counts and trusted badges, follow inline
- UI system pass — design tokens (`card`, `btn-primary`, `btn-ghost`,
  `input`, `skeleton` classes in `globals.css`), sticky blurred navbar
  with active-link states, landing hero, dashboard stat tiles, route-level
  loading skeletons, hover/press micro-interactions

## What's implemented (Phase 4)

- Community consensus ranking (`/discover`) — the "community" and
  "confidence" ranking dimensions from the original spec: a per-title
  weighted average across every rater (trusted reviewers weighted 1.5x),
  gated behind a minimum rating count (`CONFIDENCE_THRESHOLD` in
  `src/lib/discover.ts`) so a single rating can't look like consensus.
  Toggle Movies/TV and Trending (last 30 days) vs All-time. Publicly
  readable — the landing page links logged-out visitors straight to it.
- Backed by two new views in `0003_community_rankings.sql`:
  `latest_ratings` (one row per user/title) and `title_community_stats`
  (rating_count, avg_score, weighted_score, last_rated_at).

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
