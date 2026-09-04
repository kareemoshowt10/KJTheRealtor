# Morning Short-Form Content Engine

A daily, low-touch pipeline that turns real-estate news into a single
5–10 second TikTok / Reels / Shorts script, ready to hand to a video tool —
with less than 15 minutes of human review per day.

This builds on two things already in this repo rather than starting from
scratch:

- **`scripts/market-pulse/`** — the existing Firecrawl-based scraper that
  refreshes the hyperlocal "what's happening in your zip" widget. This
  engine reuses the same pattern (declarative source list → search →
  filter/dedupe → write JSON/markdown) for national/market-level content.
- **`.claude/skills/kgj-content-engine`** — Kareem's brand-voice skill for
  longer-form social posts (LinkedIn/Facebook/carousels). Use it whenever a
  human is turning a brief from this engine into a full caption or post —
  it already knows the voice; this pipeline should not try to duplicate it.

**Status: scaffolded and running in TEMPLATE mode today.** The code is real
and tested (`scripts/morning-pulse/verify.mjs`, 18/18 passing), and the
GitHub Action runs it daily. It is not yet pulling live Zillow/Redfin/Fed
numbers because that requires API keys this environment doesn't hold — see
**What's live vs. templated** below for the two-minute path to turning it
on for real.

---

## Step 1 — Data sources

Full parity with every source in the original brief (Zillow API, Redfin
Data Center, MLS feeds, Census, NAR, Google Trends) would mean paying for
and integrating half a dozen separate data providers, several of which
don't offer a self-serve API at all (Zillow's public API was deprecated;
MLS feeds require a broker RETS/IDX agreement Kareem already has via the
site's CRMLS embed, not a scrape-able feed). That's a real cost/ops
decision, not a code problem — so this engine ships with the subset that's
actually reachable today via search, and leaves the rest as a documented
upgrade path:

| Source | How it's pulled | Status |
|---|---|---|
| Mortgage News Daily / Fed rate commentary | Firecrawl news search | ✅ wired (`Rate Watch`) |
| Redfin / Zillow research **coverage** (news about their data, not the raw API) | Firecrawl news search | ✅ wired (`Market Pulse`) |
| NAR reports (existing home sales, affordability) | Firecrawl news search | ✅ wired (`Buyer Intel`) |
| BiggerPockets / investor commentary | Firecrawl news search | ✅ wired (`Investor Edge`) |
| Inman News | Firecrawl news search | ✅ wired (`Agent Playbook`) |
| Redfin competitiveness / seller data | Firecrawl news search | ✅ wired (`Seller Strategy`) |
| Zillow API (raw), Redfin Data Center (raw), MLS feed, Census API, Google Trends, Reddit API | Not wired | 📋 upgrade path below |

**Upgrade path for the raw-API sources:** each is a self-contained addition
— get the key/credential, add one function to `SOURCES_BY_CATEGORY` in
`scripts/morning-pulse/config.mjs` (or a new fetch helper next to it for a
source that isn't search-shaped, like Census's JSON API), and a secret in
GitHub repo settings. Nothing else in the pipeline needs to change; ranking,
scripting, and the visual brief all consume the same `{title, url, date}`
shape regardless of source.

---

## Step 2-4 — Filter, rank, categorize, script

Implemented as pure, unit-tested functions in `scripts/morning-pulse/`:

1. **Filter** (`toInsight`) — drops off-topic hits and anything sensational
   or fear-driven (`crash`, `doom`, `shocking`, …). A trust-first brand
   doesn't get there with clickbait.
2. **Rank** (`scoreInsight` / `rankInsights`) — favors headlines with a real
   number in them (a rate, a percent, a dollar figure) and a recent date,
   since those turn into the sharpest 5-second script.
3. **Categorize** — today's date maps deterministically to one of the seven
   rotating categories (Step 4 below); no AI call needed for this step.
4. **Script** (`buildScript`) — Hook → Lesson → CTA. The lesson is the
   winning headline itself (specific, sourced, not paraphrased into
   something less accurate); hook and CTA are pulled from a
   category-specific pool, chosen deterministically per day so the output
   is reviewable and reproducible rather than a fresh LLM roll each run.

The original brief calls for a GPT-API layer doing steps 2–5 end to end.
That's a valid upgrade (see below) but it's also the piece most likely to
quietly drift off-brand or misstate a stat if left unreviewed — which is
exactly the < 15-minutes-a-day human check exists for. Shipping the
deterministic version first means every script is traceable back to one
real headline, and an LLM pass can be layered in as a *rewrite* step over
this scaffold (varying phrasing while keeping the sourced fact fixed)
rather than a black box generating both the fact and the framing.

---

## Step 5 — Visual/video generation brief

`buildVisualBrief()` emits the exact format requested, e.g. today's file
(`marketing/daily-shorts/2026-09-04.md`):

```
CONTENT DATE: 2026-09-04
CATEGORY: Rate Watch
TARGET AUDIENCE: Buyers
PLATFORM: TikTok | Instagram Reels | YouTube Shorts

SCRIPT (5-10 sec):
[Hook] -> [Lesson] -> [CTA]

VISUAL STYLE: bold stat reveal, animated number counter
COLOR PALETTE: navy + gold (authority)
ON-SCREEN TEXT: [key stat]
VOICEOVER TONE: urgent, precise
BACKGROUND VISUAL: mortgage document / calculator close-up
TOOL RECOMMENDATION: CapCut

SOURCE: [link back to the original headline]
CONTENT TYPE TAG: DATA STAT
```

Visual style/palette/tone/tool are pre-set per category (`VISUAL_DEFAULTS`
in `generate.mjs`) so every Rate Watch post looks and sounds consistent
with the last one, and every Mindset post does too — that consistency is
most of what "go-to source" brand recognition is built from.

---

## Step 6 — Automation stack (what's actually in place)

| Recommended in the brief | What this repo uses instead, and why |
|---|---|
| Apify/Octoparse for scraping | **Firecrawl** — already paid for and proven in `scripts/market-pulse`, no reason to add a second scraping vendor |
| Google Sheets for logging | **Git history** — every day's brief is a committed markdown file in `marketing/daily-shorts/`; `git log` is the trend log, free and already backed up |
| Notion/Slack dashboard | **`marketing/daily-shorts/latest.md`** in the repo today; **Slack webhook delivery is wired** (`SLACK_WEBHOOK_URL` secret) — set it and every run posts the brief to a channel automatically. Notion delivery is a ~20-line addition once a Notion integration token exists for this workspace. |
| OpenAI GPT API | Not required for the deterministic version; see the LLM upgrade note above if a rewrite pass is wanted later |
| HeyGen / Runway ML / CapCut | Unchanged — those still take the visual brief as input, by hand, same as the brief describes |

---

## What's live vs. templated, and how to flip the switch

Right now `scripts/morning-pulse/generate.mjs` runs daily via
`.github/workflows/morning-pulse.yml` and writes a clearly-labeled
`(TEMPLATE — no live data source configured)` brief when `FIRECRAWL_API_KEY`
isn't set, so nothing fabricated ever gets presented as a real market
number. To go fully live:

1. Add repo secret `FIRECRAWL_API_KEY` (same key already used by
   `market-pulse`, or a second key if quota is a concern).
2. Optionally add `SLACK_WEBHOOK_URL` for morning delivery to a channel.
3. Re-run the workflow (or wait for the next 6 AM UTC-adjusted run) —
   output switches from template to a real, sourced headline automatically,
   no code change needed.

---

## Content calendar (Step 4)

| Day | Category | Content type | Audience |
|---|---|---|---|
| Monday | Market Pulse | DATA STAT | All |
| Tuesday | Buyer Intel | ACTIONABLE TIP | Buyers |
| Wednesday | Investor Edge | ACTIONABLE TIP | Investors |
| Thursday | Agent Playbook | ACTIONABLE TIP | Agents |
| Friday | Rate Watch | DATA STAT | Buyers |
| Saturday | Seller Strategy | ACTIONABLE TIP | Sellers |
| Sunday | Mindset/Motivation | MINDSET/INSPIRATION | All |

Defined once in `CONTENT_CALENDAR` (`scripts/morning-pulse/config.mjs`) —
change a hook, CTA, or the day-to-category mapping in one place.

---

## Daily human review (< 15 min)

1. Open `marketing/daily-shorts/latest.md` (or the Slack post).
2. Confirm the sourced stat is accurate and still current — the filter
   catches sensational language, not factual drift.
3. Hand the `SCRIPT` line + `VISUAL STYLE`/`TOOL RECOMMENDATION` to
   HeyGen/CapCut/Runway.
4. If it needs a full caption to go with the video, run it through the
   `kgj-content-engine` skill for Kareem's voice — this brief is the seed,
   not the finished post.

## Files

- `scripts/morning-pulse/config.mjs` — calendar, source map, filters, scoring (pure, tested)
- `scripts/morning-pulse/generate.mjs` — pipeline entrypoint + script/brief builders
- `scripts/morning-pulse/verify.mjs` — `node scripts/morning-pulse/verify.mjs`, no API key needed
- `.github/workflows/morning-pulse.yml` — daily cron, commits `marketing/daily-shorts/*.md`
- `marketing/daily-shorts/` — one file per day + `latest.md`
