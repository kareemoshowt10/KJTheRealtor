# Morning Pulse — automated daily micro-lesson pipeline

**Goal:** every morning, automatically surface the single most valuable
real-estate insight from the last 24 hours and package it into a 5–10
second TikTok/Reels/Shorts script + a ready-to-use image/video generation
brief, with under 15 minutes of human review before it posts.

This doc is the system design. The runnable half of it lives in
`scripts/morning-pulse/` and `.github/workflows/morning-pulse.yml`, built
the same way as this repo's existing `market-pulse` pipeline (see
`scripts/market-pulse/` and `.github/workflows/market-pulse.yml`).

---

## What's actually free vs. what needs a subscription

The original data-source wishlist (Zillow API, Redfin Data Center, MLS
feeds, Census API, NAR reports, Google Trends, Reddit, BiggerPockets/Inman)
mixes sources with very different real-world access:

| Source | Reality | What this pipeline does |
|---|---|---|
| **Zillow API** | Retired in 2021. No public research API exists anymore. | Use the free **Zillow Research CSV downloads** (`zillow.com/research/data`) instead — updated monthly, no key. Not pulled daily; refresh weekly/monthly. |
| **Redfin Data Center** | No public API, ever. | Same pattern: free CSV downloads at `redfin.com/news/data-center`. Weekly/monthly refresh, not daily. |
| **MLS feeds** | Gated behind a paid RESO/IDX license tied to your MLS board membership (CRMLS for this brand). | Out of scope for an unattended script until Kareem's CRMLS IDX credentials are wired in. The site's existing `mls-search.html` CRMLS embed is the current MLS surface — leave listing-level automation to that. |
| **Fed / Mortgage News Daily** | Freddie Mac's PMMS 30-yr/15-yr series is mirrored on **FRED as a no-key CSV**. | `sources.mjs: fetchMortgageRate30yr/15yr()` — pulled fresh every run. |
| **Census Bureau** | Full API needs a free (instant, no approval wait) key; but the housing-starts series is also mirrored on FRED with no key. | `sources.mjs: fetchHousingStarts()` — no key needed for this series. Add a Census API key later for permit-level or metro-level detail. |
| **NAR reports** | Published as press releases/PDFs, no feed. | Not scraped automatically (fragile, low daily signal — NAR updates monthly). Pull the current release manually or via a monthly WebSearch/WebFetch pass; see "Manual monthly inputs" below. |
| **Google Trends** | No free JSON API; the unofficial scrapers break constantly. | Not automated. Treated as a monthly manual glance, not a daily dependency. |
| **Reddit** (r/RealEstate, r/FirstTimeHomeBuyer, r/realestateinvesting) | Read-only JSON endpoints work unauthenticated with a descriptive User-Agent. | `sources.mjs: fetchRedditTop()` — pulled fresh every run. |
| **BiggerPockets / Inman RSS** | Both publish real RSS feeds. | `sources.mjs: fetchRSS()` — pulled fresh every run. |

**Bottom line:** five of nine sources are genuinely automatable today with
zero paid subscriptions (mortgage rates, housing starts, Reddit x3,
BiggerPockets, Inman). Zillow/Redfin CSVs are real but monthly-cadence, not
a daily pull. MLS and NAR need either a paid license or a monthly manual
step. Google Trends isn't reliably automatable at all. The pipeline below
is built around what's real, with the rest flagged rather than faked.

---

## Daily automation workflow

Runs unattended via GitHub Actions (`.github/workflows/morning-pulse.yml`),
same pattern as the existing weekly `market-pulse.yml` cron in this repo.

| Time (approx, Pacific) | Step | What happens | Where |
|---|---|---|---|
| 6:00 AM | **1. Data Pull** | Hits FRED (rates, housing starts), Reddit x3, BiggerPockets + Inman RSS in parallel. Failures in one source don't kill the run. | `scripts/morning-pulse/sources.mjs` |
| 6:03 AM | **2. Filter & Ranking** | Every headline/stat becomes a candidate scored on relevance to today's category, novelty (has a concrete number), audience engagement, and recency. | `scripts/morning-pulse/score.mjs` |
| 6:04 AM | **3. Insight Extraction** | Highest-scored candidate becomes `topInsight`; next 5 are kept as `runnerUps` for the human reviewer to swap in if the top pick misses. | `scripts/morning-pulse/generate.mjs` |
| 6:05 AM | **4. Content Categorization** | Today's weekday maps to one of the 7 rotating categories (below), which also sets the target audience and the DATA STAT / ACTIONABLE TIP / MINDSET tag. | `scripts/morning-pulse/rotation.mjs` |
| 6:06 AM | *(commit)* | Steps 1–4's output is committed to `marketing/morning-pulse/<date>.json` — a durable, diffable record of what the pipeline saw and picked. | GitHub Action |
| 6:10 AM | **5. Micro-Script Generation** + **6. Visual Brief Output** | An LLM turns the JSON into the Hook→Lesson→CTA script and the visual brief. **This is the one step that needs a real writer, not string substitution** — see "Wiring the writing step" below. | Claude (scheduled session or API call) |
| 6:15 AM | **7. Delivery** | Finished script + brief posted to Notion/Slack/Google Doc for the human review pass. | Notion API or Slack webhook (see Tool Stack) |

Total unattended runtime: under 5 minutes for steps 1–4. Steps 5–7 add a
few more once the writing step is wired in. Either way, the human's job
each morning is a 5–10 minute glance and a thumbs-up, not authoring
anything from scratch.

### Wiring the writing step

The original brief calls for "OpenAI GPT API" here. Given this project
already runs on Claude Code, the natural choice is **Claude** instead of a
second AI vendor:

- **Cheapest/simplest:** a scheduled Claude Code session (cron trigger,
  ~6:10 AM) that reads today's `marketing/morning-pulse/<date>.json`,
  writes the script + visual brief in Kareem's voice (the `kgj-content-engine`
  skill already in this repo's skill set is built for exactly this — brand
  voice for Rodeo Realty / West San Fernando Valley), and posts the result
  to Notion or Slack.
- **Fully unattended alternative:** a small Node script
  (`scripts/morning-pulse/write-with-claude.mjs`, stubbed as a commented-out
  step in the workflow) that calls the Claude API directly with an
  `ANTHROPIC_API_KEY` repo secret. Same prompt, no human-in-the-loop needed
  to kick it off — useful once the format is proven out and Kareem trusts
  the output enough to skip the manual trigger.

Either way, steps 1–4 (data, ranking, categorization) stay pure code with
no API key and no per-run cost. Only the writing step touches an LLM.

---

## Micro-lesson content framework (5–10 second structure)

- **Hook (1–2s):** shocking stat, bold claim, or direct question.
- **Lesson (3–6s):** one clear, digestible insight or action — the number,
  translated into what it means for a real person.
- **CTA (1–2s):** simple next step or engagement prompt.

Every script gets tagged **DATA STAT**, **ACTIONABLE TIP**, or
**MINDSET/INSPIRATION** based on which of the three it leads with.

## 7-day rotating category calendar

Implemented as a pure lookup in `scripts/morning-pulse/rotation.mjs`
(`ROTATION[date.getDay()]`), tested in `verify.mjs`:

| Day | Category | Audience | Angle |
|---|---|---|---|
| Mon | Market Pulse | All | Fresh data stat (inventory, price trend, days on market) |
| Tue | Buyer Intel | Buyers | One actionable tip based on current conditions |
| Wed | Investor Edge | Investors | A wealth-building insight |
| Thu | Agent Playbook | Agents | A tactic or script |
| Fri | Rate Watch | All | Current mortgage rate + what it means in dollars |
| Sat | Seller Strategy | Sellers | Tips for today's market |
| Sun | Mindset/Motivation | All | An inspirational wealth/success principle |

## Visual brief output format

Every finished micro-lesson gets this exact block, ready to hand to
Midjourney/DALL·E/Runway/HeyGen/CapCut:

```
CONTENT DATE: [Date]
CATEGORY: [e.g., Market Pulse]
TARGET AUDIENCE: [Buyers / Sellers / Investors / Agents / All]
PLATFORM: TikTok | Instagram Reels | YouTube Shorts

SCRIPT (5–10 sec):
[Hook] → [Lesson] → [CTA]

VISUAL STYLE: [...]
COLOR PALETTE: [...]
ON-SCREEN TEXT: [...]
VOICEOVER TONE: [...]
BACKGROUND VISUAL: [...]
TOOL RECOMMENDATION: [Midjourney / DALL·E / Runway ML / HeyGen / CapCut]
```

See `marketing/morning-pulse/2026-08-30.md` for a live filled-out example,
built from real data pulled the day this system was designed.

---

## Tool stack (mapped to what's actually available here)

| Need | Recommended | Why |
|---|---|---|
| Data pull + ranking | Plain Node (`scripts/morning-pulse/`), zero deps | No npm install, no key, runs in any CI. Matches the repo's existing `market-pulse` pattern. |
| Insight → script + visual brief | **Claude** (scheduled Claude Code session, or Claude API for a fully unattended run) | Already the AI this project runs on; no second vendor/key needed. Use the `kgj-content-engine` skill for brand voice. |
| Delivery / dashboard | **Notion** (MCP tools already available in this environment) or a Slack webhook | Notion gives Kareem a reviewable daily card with the script + brief; Slack is lower-friction if a phone ping is enough. |
| Data logging / trend tracking | The committed JSON files in `marketing/morning-pulse/*.json` | Free, versioned, diffable — no separate Google Sheet needed unless Kareem wants a spreadsheet view later. |
| AI avatar / talking-head video | **HeyGen** (an MCP connector for this exists in this environment but needs the user to authorize it first) | Turns the script directly into a presenter-style video. |
| B-roll / generative video & images | **higg** tools already available in this environment (`generate_image`, `generate_video`, TikTok publish) | Covers the Midjourney/Runway/DALL·E slot without a separate subscription. |
| Final edit/captions | CapCut or Adobe Express (manual, part of the <15 min review) | Neither has an automation-friendly API worth wiring up yet. |

---

## What still needs Kareem

1. **Approve the writing step's trigger** — scheduled Claude session vs. a
   Claude API key as a GitHub secret (cost tradeoff: near-zero either way,
   but the API route removes the daily manual kick-off).
2. **Pick delivery target** — Notion dashboard or Slack channel. If Notion:
   which workspace/page.
3. **Authorize HeyGen** (or confirm using `higg`'s generation tools instead)
   for turning scripts into finished video without leaving this pipeline.
4. **NAR / Google Trends** stay manual monthly glances unless Kareem wants
   to pay for a data vendor that mirrors them — flagging rather than faking
   automation there.

---

## Files in this system

- `scripts/morning-pulse/sources.mjs` — the real, free, no-key fetchers.
- `scripts/morning-pulse/score.mjs` — pure ranking logic.
- `scripts/morning-pulse/rotation.mjs` — the 7-day category calendar.
- `scripts/morning-pulse/generate.mjs` — orchestrates 1–4, writes the daily JSON brief.
- `scripts/morning-pulse/verify.mjs` — no-network unit tests (wired into `.github/workflows/checks.yml`).
- `.github/workflows/morning-pulse.yml` — the daily cron.
- `marketing/morning-pulse/<date>.json` — each day's raw pipeline output (steps 1–4).
- `marketing/morning-pulse/<date>.md` — each day's finished script + visual brief (steps 5–6, once written).
