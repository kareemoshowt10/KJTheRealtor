# Reels & Reruns — Movie/TV Tracker

A Letterboxd/Serializd-style tracker with dynamic (not static) ranking.
See [`BLUEPRINT.md`](./BLUEPRINT.md) for the full product design (pages,
schema, ranking formula, feature priorities).

Standalone app — its own `package.json` and deploy config, independent of
the KJTheRealtor site this repo also contains.

## Stack

- Next.js 14 (App Router, TypeScript)
- Firebase — Firestore (data), Firebase Auth (email-link sign-in)
- TMDB API for title search/metadata
- Tailwind CSS

## Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Add a Web app** (Project settings → General → Your apps → </> icon).
   Copy the resulting config values — you'll need `apiKey`, `authDomain`,
   `projectId`, and `appId`.
3. **Enable Authentication** → Sign-in method → Email/Password → toggle on
   **Email link (passwordless sign-in)**.
4. **Add authorized domains** (Authentication → Settings → Authorized
   domains): add `localhost` for local dev, and your production domain
   once deployed.
5. **Create a Firestore database** (Build → Firestore Database → Create
   database). Native mode, pick a region.
6. **Generate a service account key** (Project settings → Service
   accounts → Generate new private key). This downloads a JSON file —
   you need its `client_email` and `private_key` fields for the Admin SDK.
7. Get a [TMDB API key](https://www.themoviedb.org/settings/api) (v3 auth).
8. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` / `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` /
     `NEXT_PUBLIC_FIREBASE_PROJECT_ID` / `NEXT_PUBLIC_FIREBASE_APP_ID` —
     from step 2
   - `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` — from
     the service account JSON in step 6 (paste `private_key` as-is,
     including the `\n` sequences — the code un-escapes them)
   - `TMDB_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev
9. Deploy the Firestore rules/indexes so composite queries don't 404 on
   first use:
   ```bash
   npm install -g firebase-tools   # if you don't have it
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes --project <your-project-id>
   ```
   (Alternatively, skip this and just click the "create index" link
   Firestore prints in the server logs the first time each composite
   query runs — slower, but works without the CLI.)

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check with no emit

## Data model notes (Firestore)

Firestore has no joins or `GROUP BY`, so a few things work differently
than a typical Postgres app:

- **Deterministic doc IDs** enforce uniqueness in place of SQL unique
  constraints — e.g. `titles/{media_type}_{tmdb_id}`,
  `userTitles/{uid}_{titleId}`, `follows/{followerId}_{followeeId}`,
  `discussionThreads/{titleId}_{tab}`, `reviewVotes/{voterId}_{postId}`.
  See `src/lib/firestore-ids.ts`.
- **Usernames** are reserved via a `usernames/{username} → {uid}`
  collection, written in a transaction alongside profile creation
  (`src/app/api/auth/session/route.ts`), so two concurrent signups can't
  collide.
- **Reputation, activity feed, and community rankings** — Postgres views
  (`user_reputation`, `following_activity`, `title_community_stats`) have
  no Firestore equivalent, so that aggregation now happens in application
  code (`src/lib/reputation.ts`, `src/lib/feed.ts`, `src/lib/discover.ts`).
  Community rankings in particular scan a capped, recency-biased window
  of the `ratings` collection (`RATINGS_SCAN_LIMIT` in
  `src/lib/discover.ts`) rather than the full history — fine at MVP
  scale; worth moving to a scheduled rollup if that collection grows large.
- **People search** (`/people`) is a "starts with" prefix match on
  username, not a substring search — Firestore can't do `ILIKE '%q%'`
  without a third-party search index (Algolia/Typesense), which is out
  of scope here.
- **Security model**: only the Next.js server (via the Admin SDK) ever
  reads/writes Firestore — the browser only ever talks to Firebase Auth,
  never Firestore directly. `firestore.rules` denies all direct
  client access as defense in depth; every actual authorization check
  (ownership, follow-not-yourself, etc.) lives in the API routes.

## What's implemented (Phase 1)

- Email-link (passwordless) auth, auto-created profile on first login
- TMDB search → add a movie/show to your library
- Status tracking (watchlist / watching / completed / dropped)
- Rewatch logging and last-watched date
- Append-only rating history (`ratings` collection) feeding a dynamic
  score — see `src/lib/scoring.ts` for the recency/completion/rewatch
  formula
- Personal ranked list (`/rankings`) and public profile pages
  (`/profile/[username]`)

## What's implemented (Phase 2)

- Follow graph — follow/unfollow from profiles or the People page
- Friends activity feed (`/feed`) — ratings and status changes from people
  you follow
- Per-title discussion (`/title/[type]/[id]/discuss`) with five tabs:
  Reviews, Episode Reactions, Rankings Debate, Similar Titles (live from
  TMDB), and Spoiler Talk — posts support ▲/▼ voting, spoiler-hiding, and
  edit/delete for your own posts
- Collaborative ranked lists (`/lists`) — inline TMDB search-and-add,
  reorder, optional "others can add" mode
- Reputation — net votes on a user's posts; ≥ 10 net votes earns a ★
  trusted-reviewer badge shown in feeds, discussions, and the People page

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

## Known follow-ups

- Next.js is pinned to the latest `14.2.x` patch; a handful of `npm
  audit` advisories only have fixes in the Next 16 major — worth
  revisiting before a production launch.
- ESLint isn't wired up yet (`next lint` wants to install a v9-only
  config by default); `npm run typecheck` and `npm run build` are the
  current correctness gates.
- This was migrated to Firebase and typechecked/build-validated with
  dummy env vars; it has **not** been exercised against a real Firebase
  project or TMDB key yet, so the auth → add-title → rate → discuss flow
  should be smoke-tested end to end before relying on it.
- Community rankings (`/discover`) aggregate in application code over a
  capped ratings window rather than a true database-side rollup — see
  "Data model notes" above.
