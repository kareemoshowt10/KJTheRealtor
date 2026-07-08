# Life OS

Your daily operating system — a mobile-first React app for setting a daily objective, planning your day in time blocks, tracking eating/sleep/exercise/meditation/reading, logging contacts, and running an evening reflection with an Awareness Points score.

## Modules

- **Today** — daily objective, Awareness Points, schedule preview, streaks, quick-log
- **Schedule** — hourly time-block planner with a plan/retrospective (task → what happened → lesson → next action) flow
- **Track** — one hub for logging Eat, Sleep, Poop, Meditate, Read, Exercise, and Contacts
- **Reflect** — evening journal prompts scored as Awareness Points, plus a customizable daily avoidance list
- **Insights** — 7-day trend charts across every module, plus a Weekly Review recap
- **Settings** — export/import a full JSON backup, customize the avoidance list, wipe data

## Stack

React 19 + Vite + Tailwind CSS 4 + Recharts + date-fns + lucide-react. Data persists to `localStorage` — no backend.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build to dist/
```
