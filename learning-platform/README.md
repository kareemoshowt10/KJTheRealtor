# Distill

A microlearning app for consuming personal-development books one small, animated idea at a time — an alternative to video-based content consumption.

Standalone React app, independent from the rest of this repository (own `package.json`, own build). It can be lifted into its own repo/deploy target with no changes.

## Stack

- React 19 + TypeScript + Vite
- React Router (hash-based, so it deploys as static files with no server rewrite config needed)
- Framer Motion for animation (card flip, progress rings, staggered reveals, page transitions)
- Tailwind CSS v4
- Progress/streak state persisted in `localStorage` — no backend

## Content

Four books, each broken into ~7 short lessons (core idea, why it matters, a "try today" action step). All lesson text is original, paraphrased in our own words — not reproduced from the source books.

- Atomic Habits — James Clear
- The One Thing — Gary Keller
- Limitless — Jim Kwik
- Deep Work — Cal Newport

Content lives in `src/data/books.ts`. Add a book by appending an entry to the `books` array — the Library, book detail, lesson viewer, and daily-idea rotation all pick it up automatically.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs static files to dist/
npm run preview # serve the production build locally
```

## App structure

- `src/pages/Home.tsx` — "Today's idea": one flip-card lesson per day, deterministic by date so it doesn't change if you mark it done partway through
- `src/pages/Library.tsx` — the 4 books with per-book progress rings
- `src/pages/BookDetail.tsx` — lesson list for a book
- `src/pages/LessonView.tsx` — full lesson reader with prev/next navigation
- `src/context/ProgressContext.tsx` — completion + streak tracking (localStorage)
