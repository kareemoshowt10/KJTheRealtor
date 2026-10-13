# Daily 91311 lesson ritual

Every morning at **7:00 America/Los_Angeles**, produce one high-value Chatsworth lesson package and drop it on Google Drive. Humans still approve, render, and post.

## Why this is the cheap path

- One scheduled Oz agent on an efficient model (text only).
- No daily image generation — 12-still visual bank.
- No cloud Remotion — render locally after you like the copy.
- rclone + a Google service account, not a paid middleware.
- Publishing stays gated (`draft` / `not-scheduled`).

## What you get each day

`My Drive/The Practice/91311/YYYY-MM-DD/`

| File | Role |
|---|---|
| `lesson.json` | Canonical seven beats + statuses |
| `POSTING.txt` | Caption template filled |
| `SOURCE.md` | Paraphrase + source note |
| `COMPLIANCE.md` | Checklist, all pending |
| `journal-row.md` | One practice row |
| `visuals.md` | Three bank stills + rights |
| `README.md` | Human 5-minute path |

Rotation (21 days): **place/history → pocket teachable → owner practice**, then repeat.

## Local dry run

```bash
node scripts/daily-91311-lesson/package.mjs
node scripts/daily-91311-lesson/package.mjs --date 2026-08-16
```

Output defaults to `marketing/daily-91311-ritual/output/YYYY-MM-DD/` (gitignored).

## One-time Drive + schedule

1. Google Cloud: service account with access to a Shared Drive or a folder shared with the SA email.
2. Oz secret `GDRIVE_SERVICE_ACCOUNT_JSON` (the JSON key).
3. Environment already has this repo.
4. Create the schedule (PDT = 14:00 UTC):

```bash
oz schedule create \
  --name "91311 daily lesson 7am PT" \
  --cron "0 14 * * *" \
  --environment "$ENVIRONMENT_ID" \
  --model auto-efficient \
  --prompt "Read marketing/daily-91311-ritual/SKILL.md and run it for today. Package the draft, upload to Google Drive The Practice/91311/<date>, do not render or post."
```

After the November time change, update cron to `0 15 * * *` (PST).

5. `oz schedule` → Run now once. Confirm the Drive folder.

## After 7am (you, ~5 minutes)

1. Open today's Drive folder on your phone.
2. Read `POSTING.txt` as if the video were muted.
3. Do the keystone habit.
4. If it is an escalation day (Prop 19, ADU permits, trust), send to broker/counsel or skip.
5. Render in The Practice Remotion project only after you keep the lesson.
6. Licensee + broker approval, then schedule the post.

## Do not automate

Auto-post, daily new AI images, cloud Remotion, live price charts, tax/lending advice.
