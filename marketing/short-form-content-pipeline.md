# Daily Short-Form Content Pipeline

**Owner:** Kareem Jamal · Rodeo Realty · DRE #01998956
**Goal:** an automated 6:00 AM routine that turns overnight real-estate data into one on-brand, 5–10 second TikTok/Reels/Shorts script + visual brief, with under 15 minutes of human review before it ships.

This spec is written against what's actually in this repo and what this account can actually run today — not a generic tool list. Two pieces already exist and this pipeline extends them rather than replacing them:

- `scripts/market-pulse/` — a working Firecrawl scraper + GitHub Actions cron (`.github/workflows/market-pulse.yml`) that already refreshes local-news data weekly. Same pattern, new job.
- `kgj-content-engine` skill — already encodes Kareem's voice, the 5 content templates, the banned-words list, and the compliance footer. Step 5 below (script generation) is a direct call into it, not a new voice model.

---

## 1. Data sources — what's actually reachable, and how

The brief's source list mixes sources with real free APIs against sources that don't have one. Building against fantasy endpoints produces a pipeline that silently breaks. Here's the honest mapping:

| Source | Reality | Integration |
|---|---|---|
| **Mortgage rates (Fed / Mortgage News Daily)** | FRED (Federal Reserve Economic Data) publishes 30-yr/15-yr fixed rate series free, no scraping needed | FRED API, `MORTGAGE30US` / `MORTGAGE15US` series, daily pull |
| **Census (population, housing starts, permits)** | Free public API, no key needed for most series | Census API, `NEW RESIDENTIAL CONSTRUCTION` + population estimates |
| **NAR existing home sales / affordability index** | Published as a monthly PDF/press release, not an API | Firecrawl scrape of nar.realtor press-release page, monthly not daily — feeds the "Investor Edge" / "Rate Watch" days, not every morning |
| **Zillow (median price, DOM, price cuts)** | No free public API; ZHVI/ZORI research files are downloadable CSVs, updated monthly | Scheduled CSV pull, cached, refreshed monthly — do not pretend this is a live daily feed |
| **Redfin Data Center** | Same shape as Zillow: downloadable CSV/TSV, not a live API | Same monthly-cache pattern |
| **MLS feed (new listings, sold price, price cuts by zip)** | Requires CRMLS/RETS-Trestle credentials Kareem already holds through Rodeo Realty for the IDX widget on `mls-search.html` | Reuse those credentials for a lightweight local-zip pull — this is the pipeline's best source because it's proprietary and hyper-local (West Valley + Simi Valley zips already tracked in `scripts/market-pulse/generate.mjs`'s `AREAS` list) |
| **Google Trends** | No official API; `pytrends` (unofficial) works but breaks without warning | Nice-to-have, not a dependency — treat a Trends miss as a soft failure, never a pipeline blocker |
| **Reddit (r/RealEstate etc.)** | Official API requires an app registration; free tier is fine at this volume | Reddit API, top posts (last 24h) from 3 subreddits, for "Buyer Intel" pain-point mining |
| **BiggerPockets / Inman RSS** | Real RSS feeds, no auth | Standard RSS parse |

**Design rule:** every source above degrades independently. If FRED is down, the pipeline still runs on MLS + RSS. Step 2 never blocks on a single source — it scores whatever data points cleared, and if nothing did, it fails loudly to Kareem's DM instead of shipping a stale or generic post.

---

## 2. Morning workflow (GitHub Actions cron, same pattern as `market-pulse.yml`)

```
6:00 AM  Pull      → scripts/content-pipeline/pull.mjs
                     Hits FRED, Census, MLS/Firecrawl, RSS, Reddit in parallel.
                     Writes web/public/data/content-pipeline-raw-<date>.json (30-day retention).

6:05 AM  Rank       → scripts/content-pipeline/rank.mjs
                     Claude scores each data point 0-100 on: relevance to a West Valley
                     audience, novelty (delta vs. yesterday's cache), and which audience
                     it serves (buyer/seller/investor/agent). Rejects anything that isn't
                     actually new information — "rates are around 6.5%" two days running
                     doesn't ship twice.

6:10 AM  Extract     → top-ranked point becomes one flat, sourced claim.
                       e.g. "30-yr fixed dropped to 6.38% — FRED, 8/29/26."
                       No number without a source + date. Same non-negotiable as the
                       kgj-content-engine voice rules.

6:12 AM  Categorize  → tagged DATA STAT | ACTIONABLE TIP | MINDSET, and mapped to
                       today's slot in the 7-day rotation (Section 4).

6:15 AM  Script       → invoke the kgj-content-engine skill's Reel template with the
                       extracted claim as the seed. This is the one step that must stay
                       a real skill call, not a bare GPT prompt — it's what keeps every
                       script passing the voice checklist (sourced numbers, no hype
                       words, second person, closing question) instead of drifting.

6:20 AM  Visual brief → scripts/content-pipeline/brief.mjs formats Section 5's template,
                        pre-filled with KGJ brand tokens (Navy/Gold/Warm White, Fraunces/
                        Inter) so it never needs re-branding by hand.

6:25 AM  Deliver      → posted to a Notion page (or a private Slack DM to Kareem) as one
                        card: script + brief + a single "approve" / "regenerate" action.
                        Nothing auto-publishes. See Section 6.
```

Cron entry (new workflow file, `.github/workflows/content-pipeline.yml`, mirroring the existing `market-pulse.yml` shape):

```yaml
on:
  schedule:
    - cron: "0 13 * * *"   # 6:00 AM Pacific (13:00 UTC in PDT; adjust to 14:00 in PST)
  workflow_dispatch: {}
```

---

## 3. Micro-lesson structure (5–10 sec)

Directly inherits the kgj-content-engine Reel beat structure, compressed:

- **Hook (0–2s):** the sourced number or a direct question. Never a generic opener — banned words list applies even at this length.
- **Lesson (3–7s):** one action or implication, in second person. "You" not "buyers."
- **CTA (8–10s):** "Follow for daily West Valley market intel" — plain, no pressure language.

On-screen text: Inter, all caps, Warm White on Navy bar. Gold reserved for the one number worth remembering — same rule as long-form.

---

## 4. 7-day rotation → source mapping

| Day | Category | Primary source | Audience |
|---|---|---|---|
| Mon | Market Pulse | MLS local-zip pull + Zillow/Redfin monthly cache | All |
| Tue | Buyer Intel | Reddit r/FirstTimeHomeBuyer pain points + MLS DOM data | Buyers |
| Wed | Investor Edge | Census permits/starts + NAR affordability | Investors |
| Thu | Agent Playbook | BiggerPockets/Inman commentary, reframed as a script Kareem actually uses | Agents |
| Fri | Rate Watch | FRED 30-yr/15-yr series | All |
| Sat | Seller Strategy | MLS price-cut / DOM by zip | Sellers |
| Sun | Mindset/Motivation | No external pull — drawn from the Personal Proof template, seeded by Kareem manually the night before (this is the one day the pipeline should not try to synthesize a personal memory) | All |

---

## 5. Visual brief output format

```
CONTENT DATE: [Date]
CATEGORY: [Market Pulse / Buyer Intel / Investor Edge / Agent Playbook / Rate Watch / Seller Strategy / Mindset]
TARGET AUDIENCE: [Buyers / Sellers / Investors / Agents / All]
PLATFORM: TikTok | Instagram Reels | YouTube Shorts   (9:16, 1080x1920)

SCRIPT (5–10 sec):
[Hook] → [Lesson] → [CTA]

VISUAL STYLE: clean infographic / talking-head with lower-third stat card — match kgj-content-engine
COLOR PALETTE: Navy #0B1E3E + Gold #C9A84C + Warm White #FAF8F3 (brand tokens, not ad hoc)
ON-SCREEN TEXT: [the one sourced number, Inter all-caps, Warm White on Navy]
VOICEOVER TONE: confident, coach energy — explaining the play, not selling the ticket
BACKGROUND VISUAL: [West Valley zip-appropriate: Chatsworth hillside, Woodland Hills skyline, etc.]
TOOL RECOMMENDATION: HeyGen avatar (talking-head) or CapCut template (stat-card style)
COMPLIANCE FOOTER: Kareem Jamal · REALTOR® · Rodeo Realty · DRE #01998956
```

---

## 6. Delivery & the 15-minute human loop

Nothing auto-publishes — the brief calls for "ready-to-use," not "unsupervised." Every card lands as a single approval unit:

1. Notion card (or Slack DM) with script + brief + source links.
2. Kareem taps **Approve** → the same card triggers video generation.
3. Kareem taps **Regenerate** → re-runs Steps 4–5 against the #2-ranked data point instead of the whole pipeline.

This keeps the daily review to reading one card and tapping once — well under 15 minutes, and it's the only point in the pipeline a compliance issue (a wrong number, a stray hype word the checklist missed) gets caught before anything goes out under a DRE license.

---

## 7. Tool stack — mapped to what this account can actually call

| Job | Tool | Why |
|---|---|---|
| Scraping (RSS, NAR press releases, MLS-adjacent pages) | Firecrawl (already a repo dependency in `scripts/market-pulse`) | Proven, already paid for, already has the local-zip term lists this needs |
| Rate / Census data | FRED + Census public APIs | Free, official, no scraping fragility |
| Insight ranking + script generation | Claude, via the `kgj-content-engine` skill | Already encodes the voice rules; a bare LLM call would need to re-derive them every day and drift |
| Scheduling | GitHub Actions cron | Already the pattern in this repo (`market-pulse.yml`); no new infra |
| Dashboard / delivery | Notion API (`mcp__Notion__*` available in this workspace) | One card per day, approve/regenerate |
| Avatar video generation | HeyGen (`HyperFrames-by-HeyGen` connector — **not yet authorized in this workspace**; needs connecting before this step can run) | Talking-head delivery of the script |
| Short-form video assembly + virality check | `higg` MCP tools already available here: `shorts_studio_create`, `generate_video`, `virality_predictor` | Can assemble the stat-card style video and score hook strength before it ships |
| Direct TikTok publish | `higg`'s `tiktok_publish` (requires `tiktok_connect` first — not yet connected) | Optional last-mile automation once Kareem is comfortable skipping manual upload |

**What's genuinely automatable today vs. blocked on setup:**
- ✅ Data pull, ranking, script + brief generation — buildable now with existing repo tooling and the `kgj-content-engine` skill.
- ⏳ Avatar video (HeyGen) and direct TikTok publish — both need a one-time OAuth connection Kareem has to do himself (`claude mcp` / connector settings); can't be completed from an automated session.

---

## 8. Build order

1. `scripts/content-pipeline/pull.mjs` — FRED + Census + MLS/Firecrawl + RSS, degrading gracefully per source (extends the existing `market-pulse` scraper rather than duplicating its Firecrawl setup).
2. `scripts/content-pipeline/rank.mjs` — Claude scoring pass, JSON in/out, unit-testable like `verify.mjs` does for market-pulse today.
3. Wire Step 5 (script) to the `kgj-content-engine` skill directly — do not reimplement the voice rules in a prompt.
4. `scripts/content-pipeline/brief.mjs` — Section 5 template, brand tokens hard-coded.
5. Notion delivery card with the two-button approve/regenerate loop.
6. `.github/workflows/content-pipeline.yml` cron, mirroring `market-pulse.yml`.
7. Only after 1–6 are running reliably: connect HeyGen + TikTok and automate the last mile.

Steps 1–6 need no new credentials beyond a Reddit app registration and reuse of the MLS/Firecrawl access this repo already has. Step 7 is the only piece blocked on Kareem doing a one-time connector authorization.
