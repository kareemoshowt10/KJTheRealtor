---
name: daily-91311-lesson
description: Produce the daily 7am PT 91311 short-form lesson package (history, pocket teachable, or owner practice), save it locally, and copy it to Google Drive. Use when running the scheduled ritual, packaging today's Chatsworth reel, or uploading The Practice draft to Drive. Never publish or mark compliance approved.
---

# Daily 91311 lesson packager

You prepare **one draft** for Kareem's short-form system. You do not render Remotion in the cloud. You do not generate new images. You do not post. You do not flip any review from `pending` to `approved`.

## Inputs (already in the repo)

- `marketing/daily-91311-ritual/rotation.json` — 21-day cycle
- `marketing/daily-91311-ritual/visual-bank.json` — reused stills
- `scripts/daily-91311-lesson/package.mjs` — writes the folder
- Voice + gates: ritual rules, agent playbook, compliance playbook, caption template (The Practice attachments / those filenames if present)

## Procedure

1. `cd` to the KJTheRealtor repo root.
2. Run:
   ```bash
   node scripts/daily-91311-lesson/package.mjs
   ```
   Optional: `--date YYYY-MM-DD` only for backfills.
3. Read the printed `outDir`. Open `lesson.json` and `POSTING.txt`.
4. Light rewrite only if a line is dull or over the word caps (headline ≤12, body ≤18, caption ≤14, hook ~9 words). Keep one idea, paraphrase labeled, no prices/rates/medians.
5. If `escalation` is true, leave a loud note in `COMPLIANCE.md` and still do **not** approve.
6. Upload the dated folder to Google Drive (create parents as needed):

   ```bash
   rclone copy "$OUT_DIR" "gdrive:The Practice/91311/$DATE" --create-empty-src-dirs
   ```

   Auth: Oz secret `GDRIVE_SERVICE_ACCOUNT_JSON` written to a temp file, then:

   ```bash
   rclone config create gdrive drive scope drive \
     service_account_file "$SA_FILE" \
     --non-interactive || true
   ```

   If rclone or the secret is missing, leave the local folder and report the path. Do not invent a successful upload.

7. End the run with:
   - Drive path or local path
   - slug + type
   - `videoStatus: draft` / `postingStatus: not-scheduled`
   - one sentence Kareem can do before coffee (the habit)

## Stop rules

- Missing Drive secret → local package only, then stop.
- Temptation to invent this week's numbers → delete the number.
- Temptation to post or schedule → stop.
- Visual bank file missing on disk → still package; point at the `src` paths; do not call an image API.

## Cost rule

Reuse the visual bank. Do not call image models. Do not run Remotion. Text package + rclone only.
