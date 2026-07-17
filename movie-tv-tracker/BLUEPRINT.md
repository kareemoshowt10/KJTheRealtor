# Movie/TV Tracker — App Blueprint

A shared "what we're watching" network combining Letterboxd-style movie logging
with Serializd-style TV progress tracking, with **dynamic** (not static)
ranking. Standalone app, deployed separately from the KJTheRealtor site.

Tagline: *"Track what you watch, rank what actually lasts, and discuss it
with people whose taste you trust."*

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + API routes
- **Firebase** — Firestore (data), Firebase Auth (email-link sign-in).
  Originally built on Supabase/Postgres; migrated to Firebase in Phase 5
  (see "Data model" below for what changed).
- **TMDB API** — title metadata/search/posters (movies + TV in one source)
- **Tailwind CSS** — styling
- Deploy target: Vercel (own project, own env vars, independent of the
  KJTheRealtor site)

## Pages (Phase 1)

| Route | Purpose |
|---|---|
| `/` | Activity feed / "currently watching" dashboard for the logged-in user |
| `/login` | Email-link (passwordless) auth |
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

## Data model (Firestore)

Collections mirror the original relational schema; deterministic doc IDs
(`src/lib/firestore-ids.ts`) replace SQL unique constraints, and a
separate `usernames/{username} → uid` collection reserves usernames
(written transactionally alongside profile creation).

```
profiles/{uid}          — username, avatar_url, bio, created_at
usernames/{username}    — { uid }  (uniqueness reservation)

titles/{media_type}_{tmdb_id}
  tmdb_id, media_type, name, poster_path, release_date, overview, created_at

userTitles/{uid}_{titleId}
  user_id, title_id, status, last_watched_at, rewatch_count,
  current_season, current_episode, started_at, completed_at,
  created_at, updated_at

ratings/{autoId}
  user_id, title_id, score, reason, created_at
  -- append-only score history; "current score" = latest doc per (user, title)

follows/{followerId}_{followeeId}       — follower_id, followee_id, created_at
lists/{autoId}                          — owner_id, title, description, is_collaborative, created_at
listItems/{listId}_{titleId}            — list_id, title_id, rank, added_by
discussionThreads/{titleId}_{tab}       — title_id, tab, created_at
discussionPosts/{autoId}                — thread_id, user_id, body, has_spoilers, created_at
reviewVotes/{voterId}_{postId}          — voter_id, post_id, vote, created_at
```

No SQL views exist in Firestore, so the aggregations they used to provide
(reputation, activity feed, community consensus) are computed in
application code — see "Data model notes" in `README.md` for details and
tradeoffs (`src/lib/reputation.ts`, `src/lib/feed.ts`,
`src/lib/discover.ts`).

**Security**: only the Next.js server touches Firestore, via the Admin
SDK (full trust, bypasses rules). The browser only ever talks to Firebase
Auth. `firestore.rules` denies all direct client access as defense in
depth; every real authorization check (ownership, no self-follow, etc.)
lives in the API routes under `src/app/api/`.

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
1. Auth (email-link sign-in) + profile creation
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

**Phase 3 (built)**
1. TV episode/season progress tracking
2. Score-history sparkline
3. People discovery / follow search
4. UI system pass (design tokens, loading states, micro-interactions)

**Phase 4 (built)**
1. Community consensus ranking (`/discover`) — the "community" +
   "confidence" dimensions from the original ranking spec: aggregate
   score across all raters, weighted toward trusted reviewers, gated by
   a minimum rating count so thin data doesn't masquerade as consensus

**Phase 5 (built)**
1. Full backend migration from Supabase/Postgres to Firebase
   (Firestore + Firebase Auth) — every `lib/*.ts` file, every API route,
   auth flow, and page rewritten; see "Data model" above
2. Edit/delete for your own discussion posts
