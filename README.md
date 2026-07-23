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

## Repo structure

This branch (`life-os-main`) contains only Life OS, at repo root — no real-estate site
code. It lives in the `kjtherealtor` GitHub repo alongside the real-estate site's `main`
branch purely because the tooling used to build it was scoped to that one repo. The two
projects share no files and Vercel builds this branch as an independent app via the
`vercel.json` in this branch.

To move this into its own repository later:

```bash
git clone --branch life-os-main --single-branch <this-repo-url> life-os
cd life-os
git remote set-url origin <new-empty-repo-url>
git push -u origin life-os-main:main
```
