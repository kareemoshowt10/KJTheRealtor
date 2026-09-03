# Hero (`hero/`)

Single-page video hero. Vite + React + TypeScript + Tailwind CSS v4.
The whole page is `src/App.tsx` — there are no other sections, no routing, no backend.

## Run locally

```bash
cd hero
npm install
npm run dev
```

## Swapping in your own video

The background clip is the `VIDEO_SRC` constant at the top of `src/App.tsx`.

To use your own footage, drop the file into `public/` and point the constant at it:

```ts
const VIDEO_SRC = '/hero.mp4'   // file lives at hero/public/hero.mp4
```

Notes for the clip:

- It is muted, looping and `playsInline`, which is what lets browsers autoplay it.
- It is `object-cover` behind the content, so it is cropped to fill the viewport —
  keep the subject near the centre and expect the edges to be trimmed on
  narrow screens.
- Hero copy sits bottom-left over the video, so leave that corner reasonably calm.
- Compress before committing (H.264 MP4, a few seconds, ideally under ~5 MB) —
  it loads on first paint.

## Structure

| File | Purpose |
|------|---------|
| `src/App.tsx` | The entire page: background video, nav, hero copy |
| `src/index.css` | `@import "tailwindcss";` — nothing else |
| `vite.config.ts` | React + Tailwind v4 Vite plugins |
