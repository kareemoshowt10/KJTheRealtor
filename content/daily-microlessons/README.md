# Daily micro-lessons

One file pair per day, written by `scripts/daily-microlesson/generate.mjs` on the
`Daily Micro-Lesson` GitHub Actions cron (6am Pacific — see
`marketing/daily-microlesson-system.md` for the full pipeline design).

- `YYYY-MM-DD.md` — the ready-to-read visual brief, in the exact block format
  a video editor or HeyGen/Runway/CapCut operator needs: script (hook →
  lesson → CTA), visual style, palette, on-screen text, voiceover tone,
  background, tool recommendation, and the sourced citation.
- `YYYY-MM-DD.json` — the same packet as structured data, plus the two
  runner-up candidates the ranker considered, so a 15-minute human review
  can swap #1 for #2 without re-running the pipeline.

This is the "Notion dashboard" from the spec, versioned in git instead of a
third-party tool — every day's output, and every day's near-misses, stay
auditable in the repo history. If `NOTION_API_KEY` / `NOTION_DATABASE_ID` or
`SLACK_WEBHOOK_URL` are set as repo secrets, the same packet is also pushed
there; either delivery channel is optional and failing one never blocks the
commit.
