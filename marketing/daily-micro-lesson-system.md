# Daily Real Estate Micro-Lesson System

**Goal:** become the go-to real estate education source on TikTok/Reels/Shorts by
shipping one sharp, data-backed, 5–10 second lesson every single morning, with
under 15 minutes of human review. This doc is the design; `scripts/content-engine/`
is the working implementation of it.

## What's actually running vs. what needs a key

Everything below produces a full brief with zero setup — the pipeline is built
to never show up empty-handed. Each key you add upgrades one stage from an
evergreen template to live data. None of these are required to ship tomorrow's
brief; add them in whatever order matches your budget.

| Stage | Status today | Add this to go live |
|---|---|---|
| 7-day category rotation | **Live**, no key needed | — |
| Hook/Lesson/CTA script | **Live**, template-based | — |
| Visual brief (style/palette/tone) | **Live**, on-brand (navy/gold/cream) | — |
| Mortgage rate data + payment-savings math | Template copy | `FRED_API_KEY` (free, [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html)) |
| Supporting headline (Redfin/Zillow/NAR/BiggerPockets/Inman/Reddit coverage) | Template copy | `FIRECRAWL_API_KEY` (already used by `scripts/market-pulse`) |
| Slack delivery | Skipped | `SLACK_WEBHOOK_URL` |
| Notion delivery | Skipped | `NOTION_API_KEY` + `NOTION_DATABASE_ID` |
| Avatar video from the script | Manual | Connect the HyperFrames (HeyGen) integration, or paste the script into HeyGen/Synthesia directly |

A few sources from the original brief are genuinely not reachable by an
unattended script without a paid seat or brokerage credentials: **Zillow's
public API was deprecated for new partners**, **raw MLS/CRMLS feeds require a
broker data license**, and **NAR's monthly reports aren't published via API**.
Firecrawl's news search covers all three indirectly (it surfaces the
Redfin/NAR/Zillow *research-blog* posts that report those same numbers), which
is why it's the enrichment source instead of hitting those APIs directly. If a
direct MLS feed becomes available, swap it in as another optional enrichment
call in `generate.mjs` — the script is built to degrade gracefully around any
one source going missing.

## The morning run (`.github/workflows/content-engine.yml`)

Runs daily at ~6:00 AM Pacific, plus on-demand via `workflow_dispatch`:

1. **Pick today's category** — pure day-of-week lookup, Step 4 below.
2. **Pull mortgage rates** — FRED's `MORTGAGE30US`/`MORTGAGE15US` series (the
   Federal Reserve's own weekly survey data). A rate move is converted into a
   real dollar figure via standard amortization math against an assumed
   $420,000 loan (~80% LTV on the national median existing-home price) —
   the exact "$200/month, $72,000 over 30 years" style stat from the brief.
3. **Pull one supporting headline** — a category-specific Firecrawl news
   search (buyer tips, investor strategy, agent scripts, seller pricing,
   market data, mindset), reusing the same locality/quality gating pattern as
   `scripts/market-pulse`.
4. **Write the script** — Hook → Lesson → CTA, in the category's voice.
5. **Write the visual brief** — the exact format in Step 5 below.
6. **Deliver** — `web/public/data/daily-brief.json` (so the site can render a
   "Today's Insight" widget the same way the zip pages already render market
   pulse data), `content/daily-briefs/<date>.md` (the human-review file), and
   optionally Slack/Notion.
7. **Commit** — the workflow pushes the day's brief back to the repo, so
   `content/daily-briefs/` becomes a running archive of every lesson shipped.

Local dry run: `cd scripts/content-engine && npm install && npm run verify && npm run generate`.

## Micro-lesson framework (5–10 second delivery)

- **Hook (1–2s):** a stat, a claim, or a direct question.
- **Lesson (3–6s):** one idea, stated plainly, tied to a real number when one
  is available.
- **CTA (1–2s):** one next step — follow, save, or DM.

Keep every script under ~30 words total. If it needs a second breath to read
out loud, it's too long for the format.

## 7-day content calendar

| Day | Category | Audience |
|---|---|---|
| Monday | Market Pulse | All |
| Tuesday | Buyer Intel | Buyers |
| Wednesday | Investor Edge | Investors |
| Thursday | Agent Playbook | Agents |
| Friday | Rate Watch | All |
| Saturday | Seller Strategy | Sellers |
| Sunday | Mindset/Motivation | All |

## Visual brief output format

Exactly what `briefToMarkdown()` writes to `content/daily-briefs/<date>.md`:

```
CONTENT DATE: [Date]
CATEGORY: [e.g., Market Pulse]
TARGET AUDIENCE: [Buyers / Sellers / Investors / Agents / All]
PLATFORM: TikTok | Instagram Reels | YouTube Shorts

SCRIPT (5-10 sec):
Hook: [...]
Lesson: [...]
CTA: [...]

VISUAL STYLE: [...]
COLOR PALETTE: [...]
ON-SCREEN TEXT: [...]
VOICEOVER TONE: [...]
BACKGROUND VISUAL: [...]
TOOL RECOMMENDATION: [...]

PLATFORM NOTES: [aspect ratio, safe-text zone, caption/audio guidance]
```

## Daily human-review checklist (<15 minutes)

1. Open `content/daily-briefs/<today>.md`.
2. Read the script out loud once — if it's clean at 5–10 seconds, keep it; if
   not, trim it (don't rewrite the structure).
3. Run it through the `kgj-content-engine` skill/voice pass if it needs more
   of Kareem's tone before it goes out.
4. Paste the script + visual brief into CapCut/HeyGen/Midjourney per the
   `TOOL RECOMMENDATION` line.
5. Post, then log the post URL back into the day's file for the archive.

## Tool stack

- **FRED API** — free, official Federal Reserve rate data. Wired in.
- **Firecrawl** — same provider already paid for and used by `market-pulse`.
  Wired in.
- **Slack webhook / Notion API** — optional delivery, wired in behind env
  vars; either can be the "morning inbox" for the finished brief.
- **HeyGen (HyperFrames)** — connected as an MCP integration; needs
  authorization once (see `/mcp` or claude.ai connector settings) to turn a
  script into an avatar-narrated video automatically.
- **CapCut** — final platform-specific export and captioning.
- **Midjourney/DALL·E** — static B-roll stills for categories without a clean
  stock-footage angle (Mindset/Motivation, Investor Edge infographics).

## Extending it

- New enrichment source → add a fetch function in `generate.mjs`, feed its
  result into `ctx`, and reference it from a category's `hook`/`lesson`
  function. Keep it wrapped in `try/catch` so a failed source never blocks
  the morning's brief.
- New category or a calendar change → edit the `CATEGORIES` array; day
  mapping is `Date#getDay()`-indexed and covered by `verify.mjs`.
- Site widget → `web/public/data/daily-brief.json` is written every morning
  in the same location/pattern as `market-pulse-*.json`, so a "Today's
  Insight" component can fetch it the same way the zip-page widgets already
  fetch pulse data.
