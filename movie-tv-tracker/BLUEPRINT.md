# Movie/TV Tracker — App Blueprint

A shared "what we're watching" network combining Letterboxd-style movie logging
with Serializd-style TV progress tracking, with **dynamic** (not static)
ranking. Standalone app, deployed separately from the KJTheRealtor site.

Tagline: *"Track what you watch, rank what actually lasts, and discuss it
with people whose taste you trust."*

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + API routes
- **Supabase** — Postgres, Auth (magic link), Row Level Security
- **TMDB API** — title metadata/search/posters (movies + TV in one source)
- **Tailwind CSS** — styling
- Deploy target: Vercel (own project, own env vars, independent of the
  KJTheRealtor site)

## Pages (Phase 1)

| Route | Purpose |
|---|---|
| `/` | Activity feed / "currently watching" dashboard for the logged-in user |
| `/login` | Magic-link auth |
| `/search` | Search TMDB for a movie or show, add to library |
| `/title/[type]/[tmdbId]` | Title detail page: poster, overview, your status, score, rating control |
| `/profile/[username]` | A user's library, split by movies/TV, with ranked list |
| `/rankings` | Personal ranked list (sortable by dynamic score) |

## Pages (Phase 2 — not built yet, reserved in schema)

| Route | Purpose |
|---|---|
| `/feed` | Friends/following activity feed |
| `/title/[type]/[tmdbId]/discuss` | Tabs: Reviews, Episode Reactions, Rankings Debate, Similar Titles, Spoiler Talk |
| `/lists` , `/lists/[id]` | Collaborative ranked lists |
| `/u/[username]/following` | Follow graph |

## Database schema (Supabase Postgres)

```sql
profiles(id uuid pk -> auth.users, username unique, avatar_url, bio, created_at)

titles(
  id uuid pk,
  tmdb_id int,
  media_type text check in ('movie','tv'),
  name text,
  poster_path text,
  release_date date,
  overview text,
  unique(tmdb_id, media_type)
)

user_titles(
  id uuid pk,
  user_id uuid -> profiles,
  title_id uuid -> titles,
  status text check in ('watchlist','watching','completed','dropped'),
  last_watched_at timestamptz,
  rewatch_count int default 0,
  current_season int,
  current_episode int,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, title_id)
)

ratings(
  id uuid pk,
  user_id uuid -> profiles,
  title_id uuid -> titles,
  score numeric(3,1) check (score between 0 and 10),
  reason text check in ('initial','rewatch','finale','time_decay_review','manual'),
  created_at timestamptz default now()
)
-- append-only score history; "current score" = latest row per (user, title)

-- Phase 2 reserved tables
follows(follower_id uuid, followee_id uuid, created_at, pk(follower_id, followee_id))
lists(id uuid pk, owner_id uuid, title text, description text, is_collaborative bool, created_at)
list_items(list_id uuid, title_id uuid, rank int, added_by uuid, pk(list_id, title_id))
discussion_threads(id uuid pk, title_id uuid, tab text, created_at)
discussion_posts(id uuid pk, thread_id uuid, user_id uuid, body text, has_spoilers bool, created_at)
```

RLS: every table scoped so a user can write only their own `user_titles` /
`ratings` rows; `profiles`, `titles` readable by anyone; writes to `titles`
happen via the server (service role) when caching TMDB results.

## Dynamic ranking formula (v1)

```
dynamic_score =
    latest_rating.score
  + recency_boost(last_watched_at)      -- decays over ~90 days, max +0.5
  + completion_modifier(status)         -- "watching" titles get a small
                                          --   damp factor until "completed"
  + rewatch_weight(rewatch_count)       -- +0.1 per rewatch, capped at +0.5
```

Each rewatch, finale, or manual re-rate inserts a new `ratings` row instead
of overwriting — the title detail page shows score history as a sparkline.
This directly implements the "interactive scoring" requirement: a movie can
climb after a rewatch, a show can rise or fall as new episodes land.

## Feature priorities

**Phase 1 (this build)**
1. Auth (magic link) + profile creation
2. TMDB search → add title to library (creates `titles` + `user_titles` rows)
3. Mark watchlist / watching / completed, track last-watched date and
   season/episode progress for TV
4. Submit a rating → appends to `ratings`, recomputes dynamic score
5. Personal ranked list sorted by dynamic score

**Phase 2 (reserved schema, future work)**
1. Follow graph + friends activity feed
2. Per-title discussion tabs (Reviews / Episode Reactions / Rankings Debate /
   Similar Titles / Spoiler Talk)
3. Collaborative lists
4. Reputation system weighting trusted reviewers in discovery
