# The Daily Real Estate Intel Engine — Automated Morning Content System

**Goal:** Become the go-to short-form education source for real estate — one micro-lesson (5–10 sec) every morning, sourced from fresh data, packaged and ready to hand to a video tool, with under 15 minutes of human review.

**Brand lens:** Every output routes through Kareem Jamal's voice — West San Fernando Valley, Rodeo Realty, "the local, not the salesman." See `kgj-content-engine` for tone calibration before scripts go out the door.

---

## 0. Reality check on Step 1's source list

Before building the pipeline, know what each source actually costs to pull, because this decides whether a step runs itself or needs a human hand every morning:

| Source | Access reality | Verdict |
|---|---|---|
| **Census Bureau API** | Free, public, keyed API. Housing starts/permits update monthly. | ✅ Automate directly |
| **Federal Reserve (FRED)** | Free, public, keyed API. Has 30-yr/15-yr mortgage rate series (`MORTGAGE30US`). | ✅ Automate directly |
| **Google Trends** | No official API; `pytrends` (unofficial) works but breaks without warning. | ⚠️ Automate with a fallback — cache last-good result |
| **Reddit (r/RealEstate, etc.)** | Official API (OAuth, free tier) via PRAW. | ✅ Automate directly |
| **BiggerPockets / Inman RSS** | Public RSS feeds. | ✅ Automate directly (`feedparser`) |
| **Mortgage News Daily** | No public API; site scraping is fragile and ToS-sensitive. | ⚠️ Prefer FRED for rate data; use MND only for the "why it moved" commentary, read by a human or fetched via `WebFetch` on demand |
| **Zillow API (Bridge/ZTRAX)** | Requires a paid data-partner agreement, not a self-serve key. | ❌ Not self-serve. Substitute: Zillow's public **Research CSV downloads** (median price, days on market, price cuts) — free, updated monthly, no key needed |
| **Redfin Data Center** | Publishes free downloadable CSVs (redfin.com/news/data-center), no key. | ✅ Automate as a scheduled CSV pull, not a live API |
| **MLS feeds** | Requires MLS/RETS or Spark API credentials tied to Kareem's own MLS access — this is the one source that's genuinely his advantage. | ⚠️ Wire this in via his existing MLS/CRM export if one exists; otherwise substitute local Redfin/Zillow zip-level CSVs for the Valley zips he covers (91311, 91304, 93063, Woodland Hills, West Hills, Calabasas, Encino, Hidden Hills) |
| **NAR reports** | Published as PDF/press release, not an API. | ⚠️ RSS/email digest ingestion, monthly cadence only |

**Bottom line:** 5 of 9 sources are cleanly automatable today. The rest (Zillow/Redfin) become free CSV pulls instead of "APIs," MLS becomes a local-market substitute unless Kareem's MLS export is wired in, and NAR/MND become monthly or on-demand rather than daily. The pipeline below is built around that reality — it doesn't pretend a live Zillow API key exists.

---

## 1. Architecture — what runs where

This account already has real, connected execution tools. Use them instead of a hypothetical stack:

| Job | Tool actually available | Notes |
|---|---|---|
| Orchestration / schedule | This Claude Code session, on a recurring `/loop` or scheduled trigger | Replaces "Zapier" — the agent *is* the automation layer |
| Data pull (APIs, RSS, CSV) | `WebFetch` / lightweight Python (`requests`, `feedparser`, `praw`, `pytrends`) run via Bash in a scratch pipeline script | One script, one run |
| Scoring & insight extraction | Claude itself (no separate GPT call needed) | Rank by relevance × novelty × audience value in one pass |
| Script + visual brief generation | Claude itself, using the framework in Section 3 | |
| Dashboard / daily delivery | **Notion MCP** (`notion-create-pages`) | Writes one page per day into a "Daily Intel" database — replaces the imagined "Notion API" step |
| Video/image generation | **higg (Higgsfield) MCP** — `generate_image`, `generate_video`, `shorts_studio_create` | Already connected; can go straight from visual brief → rendered short |
| Publishing | **higg `tiktok_publish`** (TikTok account already connectable via `tiktok_connect`) | IG Reels / YT Shorts still need manual cross-post or a Buffer/Metricool connection if added later |
| Morning delivery ping | **Gmail MCP** (`send_message`) to showt010@gmail.com, or a Slack webhook if one gets added | |
| Trend logging over time | A Google Sheet via **Google Drive MCP**, or a Notion database (simpler, already in the stack) | Notion database recommended — one less tool |

This collapses the originally-proposed 8-tool stack (OpenAI API, Notion API, Apify, Sheets, Slack bot, HeyGen, Runway, CapCut) down to **three already-connected systems** (Claude, Notion, higg) plus one lightweight data-pull script. Fewer moving parts, fewer failure points, less to maintain.

---

## 2. Morning workflow (runs on a schedule, ~25 min end-to-end, ~10 min human review)

| Time | Step | What happens |
|---|---|---|
| 6:00 AM | **Data Pull** | Script hits FRED (rates), Census (permits/starts), Redfin/Zillow CSVs (price/inventory/DOM), Reddit API (top 24h threads from the 3 subs), BiggerPockets + Inman RSS, Google Trends (cached fallback if it fails). Everything lands in one JSON scratch file. |
| 6:05 AM | **Filter & Score** | Claude scores each data point 1–10 on: *relevance* (does it change what someone should do this week), *novelty* (is this new vs. yesterday's pull), *audience value* (buyer/seller/investor/agent). Discard anything under a 6. |
| 6:10 AM | **Insight Extraction** | Top-scored item becomes one sentence: the single fact + why it matters, in plain language, no jargon. |
| 6:12 AM | **Categorization** | Tag as DATA STAT / ACTIONABLE TIP / MINDSET, and match to that day's rotation slot (Section 4) — if the day's category has no strong data point, fall back to the evergreen mindset/tip bank rather than forcing weak data on air. |
| 6:15 AM | **Micro-Script** | Hook → Lesson → CTA, 5–10 seconds, in Kareem's voice (direct, local, no sales pitch — see brand lens above). |
| 6:20 AM | **Visual Brief** | Full brief in the Section 5 format, platform-adapted (9:16, on-screen text placement, caption hook for the algorithm). |
| 6:25 AM | **Delivery** | One Notion page created with all of the above, plus an optional first-draft render via higg if the script clears a self-check (no unverified numbers, no compliance-risk claims like guaranteed returns). Gmail ping sent: "Today's script is ready — [Notion link]." |
| Human (≤10 min) | **Review** | Kareem/team opens the Notion page, sanity-checks the number against the source, tweaks tone if needed, approves the render or requests a redo, hits publish. |

**Weekly maintenance (5 min, once):** spot-check that FRED/Census/Redfin URLs haven't changed and Reddit OAuth token hasn't expired — the only real "someone should glance at this" item in the whole system.

---

## 3. Micro-lesson framework (unchanged core — this part was already right)

- **Hook (1–2 sec):** shocking stat, bold claim, or direct question
- **Lesson (3–6 sec):** one clear, digestible insight or action
- **CTA (1–2 sec):** simple next step

Guardrail: never state a number the pipeline can't point to a source for. If the top-ranked insight is compelling but the source is soft (a Reddit anecdote, a Google Trends spike with no underlying cause), it gets flagged as MINDSET/commentary, not DATA STAT — never dressed up as a hard number.

---

## 4. 7-day rotation (Valley-flavored)

| Day | Category | Primary source | Audience |
|---|---|---|---|
| Mon | **Market Pulse** | Redfin/Zillow CSV — Valley zips (91311, 91304, 93063, Woodland Hills, West Hills, Encino, Calabasas) | All |
| Tue | **Buyer Intel** | This week's rate + inventory combo → one action | Buyers |
| Wed | **Investor Edge** | BiggerPockets RSS + Census permits/starts | Investors |
| Thu | **Agent Playbook** | Reddit pain points (real objections agents can script an answer to) | Agents |
| Fri | **Rate Watch** | FRED `MORTGAGE30US` / `MORTGAGE15US` week-over-week | Buyers/Sellers |
| Sat | **Seller Strategy** | Redfin DOM + price-cut data, local zips | Sellers |
| Sun | **Mindset/Motivation** | Evergreen bank (no live data dependency — this is the one day the pipeline doesn't need a fresh pull) | All |

Today is **Wednesday, September 2, 2026 → Investor Edge.** Worked example below.

---

## 5. Visual brief — output format

```
CONTENT DATE: 2026-09-02
CATEGORY: Investor Edge
TARGET AUDIENCE: Investors
PLATFORM: TikTok | Instagram Reels | YouTube Shorts

SCRIPT (5–10 sec):
[Hook] "Building permits in the Valley just did something builders notice before buyers do."
[Lesson] "Single-family permits are up while multi-family stalls — that's less future competition for you as a buy-and-hold investor in 12–18 months."
[CTA] "Follow for the number behind every headline."

VISUAL STYLE: Clean infographic bar chart animation, cut to aerial West Valley rooftops
COLOR PALETTE: Navy blue + gold (authority)
ON-SCREEN TEXT: "Permits ↑ Single-Family / ↓ Multi-Family"
VOICEOVER TONE: Confident, calm, insider — not hyped
BACKGROUND VISUAL: Census chart overlay → West San Fernando Valley rooftops, golden hour
TOOL RECOMMENDATION: higg generate_video (shorts_studio) for the render; Notion holds the brief until approved
```

Platform notes: 9:16 vertical, on-screen text upper third (safe from TikTok's UI overlay), caption leads with the hook line verbatim so the algorithm and the sound-off viewer both get it.

---

## 6. Rollout plan

**Phase 1 (this week):** Wire the data-pull script (FRED + Census + RSS + Reddit — the four sources with clean free APIs). Manual Redfin/Zillow CSV check twice a week until that step is scripted.

**Phase 2:** Notion database live as the daily dashboard; Gmail morning ping.

**Phase 3:** higg render-on-approval, so the human step is "approve the script" not "also go build the video."

**Phase 4:** TikTok auto-publish via higg once a week of manually-approved renders has proven the tone is right — never auto-publish before that trust is earned.

---

## Output checklist (every morning)

1. ✅ Top insight from the last 24h, source-cited
2. ✅ 5–10 sec script (Hook → Lesson → CTA) in brand voice
3. ✅ Complete visual brief, platform-formatted
4. ✅ Category tag + audience label
5. ✅ ≤10 min human review before anything ships
