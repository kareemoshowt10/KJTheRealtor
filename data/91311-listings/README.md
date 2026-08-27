# 91311 SFR Listing Intake

Drop MLS CSV exports here (Active + Coming Soon, 91311 single-family) so
every snapshot is on file and comparable to the last pull.

**Cadence:** every other Monday (see `marketing/91311-market-entry.md` →
"91311 Listing Intake System").

**File naming:** `YYYY-MM-DD-full-sfr.csv` (e.g. `2026-08-27-full-sfr.csv`)
— matches the order the sort puts them in, so the newest file is always
last.

**What happens with each drop:** hand the file to Claude in this repo (or
in chat) and ask for a fresh 91311 SFR snapshot. It will:
- update the price-segment split (flatland vs. foothill/equestrian)
- flag anything newly stale (90+ days, no price cut) — seller outreach list
- flag anything new or coming soon — buyer-conversation fuel
- flag anything that dropped price since the last file in this folder
- note any listing that went pending/sold since last pull

Nothing in this folder is served on the live site — it's raw MLS data,
kept private for market-read purposes only.
