# Daily Short-Form Content Pipeline — System Design

**Goal:** every morning, automatically surface the single most valuable real-estate
insight from the last 24 hours and package it as a ready-to-shoot 5–10 second
script for TikTok / Reels / Shorts — positioning Kareem as the go-to real estate
educator for the West San Fernando Valley and beyond.

**Owner:** Kareem Jamal · Rodeo Realty Fine Estates
**Status:** designed + scaffolded. Live data pulls need the API keys listed in
[Source feasibility](#source-feasibility) before the cron job produces real output.
**Companion voice pass:** run the raw script through the `kgj-content-engine`
skill before shooting — this pipeline gets the *insight and structure* right,
that skill gets it sounding like Kareem.

---

## How it fits the repo

This mirrors the existing `scripts/market-pulse/` pattern (Firecrawl → JSON →
GitHub Actions cron → commit back to the repo), because that pattern already
works here and needs no new infrastructure:

| Layer | Location |
|---|---|
| Pipeline code | `scripts/daily-shortform/generate.mjs` |
| Pure-logic tests | `scripts/daily-shortform/verify.mjs` |
| Daily output (the deliverable) | `marketing/daily-shortform/YYYY-MM-DD.md` |
| Scheduler | `.github/workflows/daily-shortform.yml` (cron) |

The committed Markdown file *is* the "Notion dashboard / Google Doc / Slack
post" from the original brief — it's reviewable in a PR diff, versioned for
free, and needs no new SaaS account to stand up today. Swapping the last step
to push into Notion or Slack instead (or in addition) is a small addition
once those integrations are connected — see [Delivery upgrade path](#delivery-upgrade-path).

---

## Source feasibility

Not every source in the original brief has a real, keyless API. Being honest
about this up front is what keeps the pipeline from silently shipping fake
numbers. Each source below is marked by what it actually takes to wire up:

| Source | Reality | What this pipeline does |
|---|---|---|
| **Mortgage News Daily** | Public RSS feed, no key | ✅ Wired — pulled live in `generate.mjs` |
| **Inman News** | Public RSS feed, no key | ✅ Wired — pulled live |
| **BiggerPockets Blog** | Public RSS feed, no key | ✅ Wired — pulled live |
| **FRED (Federal Reserve)** | Free API, needs a free key (`FRED_API_KEY`) | 🔌 Stubbed — activates the moment the key is set |
| **Census Bureau API** | Free API, needs a free key (`CENSUS_API_KEY`) | 🔌 Stubbed — same |
| **Zillow API** | No public real-estate-data API since 2021 (Zillow shut it down) | ⚠️ Not directly available. Substitute: Zillow Research publishes free downloadable CSVs (ZHVI, ZORI, inventory) updated monthly — a scheduled *file* pull, not an API. Documented, not wired, because monthly data doesn't fit a daily cadence — better used to season Monday's Market Pulse. |
| **Redfin Data Center** | No public API; publishes downloadable TSVs | Same shape as Zillow — good for a weekly/monthly refresh of the local `scripts/market-pulse` pipeline this repo already has, not a daily API hit. |
| **MLS data feeds** | Requires an RETS/RESO Web API license through the local MLS board (CRMLS) | Out of reach without Kareem's own MLS vendor credentials. The site's `mls-search.html` IDX embed is the existing sanctioned channel — this pipeline should quote *aggregate* CRMLS-derived stats a human pulls (e.g. from Kareem's MLS dashboard) rather than scrape MLS data directly, which violates most IDX terms of use. |
| **NAR reports** | No API; monthly PDF/press release | Treated as an RSS-adjacent source: NAR publishes press releases via a public feed, picked up alongside Inman. |
| **Google Trends** | No official API; unofficial libraries (`pytrends`) scrape the site and break often | Documented as a manual weekly spot-check, not a daily automated pull — an unofficial scraper is the wrong thing to depend on for a production cron job. |
| **Reddit** (r/RealEstate etc.) | Free API, but requires a registered app + OAuth (`REDDIT_CLIENT_ID/SECRET`) | 🔌 Stubbed — activates once an app is registered at reddit.com/prefs/apps. |

**Bottom line:** the pipeline runs for real today on rates + industry news
(Mortgage News Daily, Inman, BiggerPockets), which is enough to cover
Friday's Rate Watch and Thursday's Agent Playbook out of the box. The other
categories (Market Pulse, Buyer/Seller/Investor days) lean on the monthly
Zillow/Redfin files and Kareem's own MLS numbers until those keys are added —
see the per-day fallback logic in `generate.mjs`.

---

## Morning automation workflow

```
06:00  Data Pull        generate.mjs fetches every wired source (RSS + any
                         API keys present) for items from the last 24h.

06:05  Filter & Rank     Each item is scored 0–10 on:
                           relevance  — does it touch price, rate, inventory,
                                        or a buy/sell/hold decision?
                           novelty    — is it new since yesterday's run?
                           audience   — does it map cleanly to a
                                        buyer/seller/investor/agent takeaway?
                         Today's content-calendar category (see below) also
                         boosts matching items so Monday favors a market
                         stat, Friday favors a rate story, etc.

06:10  Insight Extract   Top-ranked item is reduced to one sentence: what
                         changed, what number moved, why it matters right now.

06:12  Categorize        Tagged DATA STAT | ACTIONABLE TIP | MINDSET.

06:15  Micro-Script      Hook → Lesson → CTA, built from the day's template
                         (see Content Framework). If OPENAI_API_KEY is set,
                         an LLM pass tightens the language; otherwise a
                         rules-based template fills it in — the pipeline
                         degrades gracefully rather than failing outright.

06:20  Visual Brief      Filled into the exact format spec below, ready to
                         paste into Midjourney / Runway / HeyGen / CapCut.

06:25  Delivery          Everything is written to
                         marketing/daily-shortform/YYYY-MM-DD.md and
                         committed by the workflow. Kareem reviews the PR
                         diff/email digest — under 15 minutes — then a human
                         (or the kgj-content-engine voice pass) finalizes
                         wording before recording.
```

---

## Content framework (every script, every day)

- **Hook (1–2 sec):** a stat, a claim, or a direct question.
- **Lesson (3–6 sec):** one clear, sayable insight or action — no more than
  two numbers.
- **CTA (1–2 sec):** one instruction — follow, save, DM, or visit a page.

Kept to 5–10 seconds *spoken*, which caps a script at roughly 25–35 words
total. `generate.mjs` enforces a word-count ceiling on the generated script
and flags anything over it instead of shipping a script no one can say in
10 seconds.

---

## 7-day rotation

| Day | Category | Primary source | Audience |
|---|---|---|---|
| Mon | Market Pulse | Zillow/Redfin monthly file, seasoned daily by news hits | All |
| Tue | Buyer Intel | Mortgage News Daily + Inman | Buyers |
| Wed | Investor Edge | BiggerPockets | Investors |
| Thu | Agent Playbook | Inman + BiggerPockets | Agents |
| Fri | Rate Watch | Mortgage News Daily | All |
| Sat | Seller Strategy | Market-pulse local data + Inman | Sellers |
| Sun | Mindset / Motivation | Curated evergreen prompts (no live source needed) | All |

`generate.mjs` exports `CATEGORY_FOR_DAY` so the rotation is one source of
truth the scheduler, the scorer, and the tests all read from.

---

## Visual brief output format

Every entry in the daily Markdown file follows this exact block, matching
what a video/image tool operator (or HeyGen/CapCut/Runway) needs with zero
back-and-forth:

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
TOOL RECOMMENDATION: [...]

PLATFORM NOTES:
  Aspect ratio: 9:16
  Text placement: [safe-zone note per platform]
  Audio: [captioned / voiceover / trending-sound note]
```

---

## Tools stack (what to actually turn on, in order)

Cheapest, least-new-infrastructure first — each step only gets added once the
one before it is actually being used daily:

1. **RSS + rules-based templates** (live today, no signup) — covers Rate
   Watch and Agent Playbook fully.
2. **FRED + Census free API keys** — five-minute signups, unlocks real
   population/permit/rate-trend numbers for Market Pulse and Investor Edge.
3. **OpenAI API key** — swaps the rules-based script template for an LLM
   pass that tightens phrasing; the format and word-count ceiling stay fixed
   either way so output doesn't drift out of Kareem's voice.
4. **Reddit API app** — adds real buyer/seller pain-point sourcing for
   Tuesday/Saturday.
5. **Zillow/Redfin monthly file ingestion** — a small monthly job (separate
   cron, `scripts/market-pulse` already has the shape for this) that seasons
   Monday's Market Pulse with a real ZHVI/inventory number instead of the
   evergreen fallback.
6. **HeyGen / Runway / CapCut** — stay manual for now: the brief is
   structured so pasting it into any of these takes under a minute. Only
   worth automating with their APIs once the daily brief itself has been
   running reliably for a few weeks.
7. **Delivery upgrade** — see below.

## Delivery upgrade path

Today: a committed Markdown file per day, reviewed as a diff.

Next, in order of effort: (a) a Slack webhook post of the same content the
moment the workflow finishes — a few lines added to the GitHub Action, no new
service; (b) a Notion database write via the Notion API, once a Notion
integration token is available to the repo's secrets; (c) a Google Doc via
the Docs API, same shape. None of these change `generate.mjs` — they're all
just a different last step consuming the same JSON the script already
produces internally before it's rendered to Markdown.

---

## Review load

Target: **under 15 minutes/day**. The workflow does the pulling, ranking,
scripting, and brief-formatting; the human pass is: read one Markdown file,
confirm the number is real and not stale, run it through the voice skill if
it reads stiff, and hit record. Nothing in the pipeline auto-posts — every
video still has a human in the loop before it goes out, which is also what
keeps the brand's numbers accurate.
