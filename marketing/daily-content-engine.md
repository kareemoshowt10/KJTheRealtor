# Daily Content Engine — Morning Micro-Lesson Pipeline

Automated 6 AM → 6:25 AM pipeline that turns overnight housing data into one
5–10 second TikTok/Reels/Shorts script, on-brand for **Kareem Jamal · Rodeo
Realty · DRE #01998956 · West San Fernando Valley + Simi Valley**. Built to
plug into what he already has: the `kgj-content-engine` voice engine, his
brand tokens, and his three content pillars (West Valley Expertise · ADU
Strategy · Generational Wealth).

Goal: become the go-to short-form real estate education source, on autopilot,
with **under 15 minutes of human review per day.**

---

## 0. Reality check on the data sources (read this before building anything)

The brief below assumes clean, free, daily APIs for Zillow, Redfin, MLS, and
NAR. That doesn't exist. Building the pipeline on that assumption produces
scripts that fail silently every morning. Here's what's actually true for
each source, and the substitute that works:

| Source | Reality | What to use instead |
|---|---|---|
| **Zillow API** | Public Zillow API (GetSearchResults / Zestimate) was shut down in 2021. No free live feed. | Zillow Research **data** page publishes CSVs (ZHVI, ZORI, inventory) updated monthly, not daily — fine for weekly stats, not a daily pull. |
| **Redfin Data Center** | No live API. Publishes downloadable TSV/CSV files (weekly housing market data), updated weekly. | Pull the weekly file once a week (e.g. Monday), cache it, reuse all week for "Market Pulse." |
| **MLS feeds** | Real MLS/RESO Web API access requires a vendor agreement + Kareem's own MLS credentials (CRMLS). Not a public scrape target. | Use Kareem's existing CRMLS IDX feed (already embedded in `mls-search.html`) or his own recent closings/listings as the sourced, first-party data point — stronger content anyway ("here's what just happened in 91311," not a generic national stat). |
| **Fed / Mortgage News Daily** | FRED (Federal Reserve Economic Data) has a genuine free daily API (`MORTGAGE30US`, weekly Freddie Mac PMMS series, updated Thursdays). Mortgage News Daily itself has no public API — its site would need permission-gated scraping. | Use **FRED's** `MORTGAGE30US` series via its free API key. Weekly update (Thursdays), not truly daily — treat Friday "Rate Watch" as the day this is guaranteed fresh. |
| **Census Bureau API** | Real, free, daily-callable API. Housing starts/permits release monthly (New Residential Construction release calendar). | Genuinely automatable — just don't expect new numbers every morning; cache last release, only trigger a "new data" alert on release days. |
| **NAR reports** | No API. Monthly PDF/press-release only (Existing-Home Sales, Affordability Index). | Treat as a monthly calendar event, not a daily pull — script pre-written the day the release drops. |
| **Google Trends** | No official free API. `pytrends` (unofficial) works but breaks without notice and Google can rate-limit/block it. | Usable as a soft signal for topic ideas, not as a guaranteed daily data point. Run it, but never let the whole pipeline depend on it succeeding. |
| **Reddit** | Official API now requires a paid tier for meaningful volume (post-2023 pricing changes); scraping violates ToS. | Use Reddit's API within free-tier limits for light, occasional pulls (a handful of thread titles), or skip it and rely on Kareem's own inbound client questions — which are a better, first-party pain-point source anyway. |
| **BiggerPockets / Inman RSS** | Genuinely free, no auth, built for this. | Fully automatable — this is the most reliable source in the list. |

**Implication for the design below:** treat FRED, Census, and RSS feeds as
the *automatable daily tier*. Treat Zillow/Redfin/NAR as a *weekly-refreshed
cache*. Treat MLS as *Kareem's own first-party numbers*, pulled by him or an
assistant, not scraped. Google Trends and Reddit are *optional flavor*, not
load-bearing. This is what makes the system actually run every morning
instead of erroring out on a source that no longer exists.

---

## 1. Morning pipeline (6:00–6:25 AM)

| Time | Step | What runs |
|---|---|---|
| 6:00 | **Pull** | Cron trigger fires. Fetch: FRED `MORTGAGE30US` (daily check, real update weekly), Census housing-starts/permits (checks for new release), BiggerPockets + Inman RSS (last 24h items), cached Zillow ZHVI/Redfin weekly file (re-fetch only if stale >7 days), Kareem's own latest closings/listings log (manual entry or CRMLS export). |
| 6:05 | **Filter & rank** | LLM pass scores each pulled item 1–10 on: relevance to one of the 3 pillars, novelty (is this actually new vs. repeated last week), and audience value (buyer/seller/investor/agent). Discard anything under a threshold; if everything's stale, fall back to the day's fixed rotation category (below) using an evergreen angle. |
| 6:10 | **Insight extraction** | Top-ranked item is reduced to one sentence: the single fact or action a viewer needs. |
| 6:12 | **Categorize** | Tag: `DATA STAT` / `ACTIONABLE TIP` / `MINDSET`, plus the day's rotation slot and target audience. |
| 6:15 | **Script draft** | Route the insight into the `kgj-content-engine` skill as the seed, requesting the **Reel** format (0–3s hook / 3–10s stakes / 10–30s beats / 30–40s rule / last 3s question) — this enforces Kareem's actual voice rules automatically (sourced numbers, no hype words, second person, closing question) instead of reinventing tone rules from scratch. |
| 6:20 | **Visual brief** | Fill the template in §4 using Kareem's real brand tokens (§5), not generic colors. |
| 6:25 | **Deliver** | Push the finished packet to Kareem's dashboard (Notion page or Google Doc) with a "🟢 ready to film/generate" flag, and drop a short delivery message (Slack/Notion comment/email) so it's the first thing he sees. |

**Human review budget (<15 min/day):** approve or edit the one script, approve
the visual brief, hit "generate" on the video tool. Everything upstream is
already filtered and drafted.

---

## 2. Content categories — 7-day rotation

Mapped onto Kareem's existing pillars and pages so nothing is invented from
scratch — each slot has a first-party page to point back to.

| Day | Category | Audience | Pulls from | Links to |
|---|---|---|---|---|
| Mon | **Market Pulse** | All | Cached Zillow ZHVI / Redfin weekly file, or Kareem's own last week of closings | `mls-search.html`, zip pages (91311/91304/93063) |
| Tue | **Buyer Intel** | Buyers | Rate move + one actionable step | `buyers.html`, `buyer-presentation.html` |
| Wed | **Investor Edge** | Investors | ADU/cash-flow angle (his pillar) | `investor-mindset.html`, `house-hacking.html`, `real-estate-partnerships.html` |
| Thu | **Agent Playbook** | Agents | A tactic from his own practice | `mission.html` / his own scripts |
| Fri | **Rate Watch** | All | FRED `MORTGAGE30US` (guaranteed-fresh day) | `rate-buydown-guide.html`, `assumable-loan-guide.html` |
| Sat | **Seller Strategy** | Sellers | Days-on-market / price-cut signal | `sellers.html`, `seller-presentation.html` |
| Sun | **Mindset / Generational Wealth** | All | No data pull needed — pillar content | `family-wealth-preservation.html`, `wealth-tools.html` |

---

## 3. Micro-lesson script shape (5–10 sec)

This is the same shape `kgj-content-engine` already writes to, compressed to
short-form beats:

- **Hook (1–2s):** the number or the claim, nothing else. On screen + spoken.
- **Lesson (3–6s):** one sourced fact + what it means for the viewer, second person.
- **CTA (1–2s):** one line. Default: *"Follow for daily West Valley real estate intel."* Rotate in a question only when the lesson naturally invites one.

Every number carries a **source + date**, same rule as long-form. No hype
words (banned list from the skill: *stunning, dream home, don't miss out,
act now, hot market, unbelievable, luxury* unless literal).

---

## 4. Visual brief output (auto-generated per script)

```
CONTENT DATE: [Date]
CATEGORY: [Market Pulse / Buyer Intel / Investor Edge / Agent Playbook / Rate Watch / Seller Strategy / Mindset]
TARGET AUDIENCE: [Buyers / Sellers / Investors / Agents / All]
PLATFORM: TikTok | Instagram Reels | YouTube Shorts
ASPECT RATIO: 9:16, safe text zone (avoid bottom 15% / top 10% — UI overlap)

SCRIPT (5–10 sec):
Hook → Lesson → CTA (see §3)

VISUAL STYLE: bold text-on-navy card cuts, or talking-head with lower-third stat card
COLOR PALETTE: Navy #0B1E3E · Gold #C9A84C · Warm White #FAF8F3 (≤10% gold, one focal number only)
TYPE: Fraunces (headline number/claim, never all-caps) + Inter (eyebrow/CTA, all caps, +0.18em tracking)
ON-SCREEN TEXT: [the one number or claim worth remembering, Gold on Navy]
VOICEOVER TONE: confident, coach explaining the play — not selling the ticket
BACKGROUND VISUAL: [West Valley streetscape / Chatsworth rocks / mortgage doc close-up / talking head]
TOOL RECOMMENDATION: HeyGen or Higgsfield avatar for talking-head; CapCut for text-card cuts
COMPLIANCE FOOTER (last frame, 2s): Kareem Jamal · REALTOR® · Rodeo Realty · DRE #01998956
```

---

## 5. Brand tokens (do not substitute generic colors)

Navy `#0B1E3E` · Gold `#C9A84C` · Warm White `#FAF8F3` · White `#FFFFFF` ·
Black `#111111`. Display face **Fraunces** (300–500 weight, −0.02em
tracking, never all-caps); utility face **Inter**. Balance ~70%
Navy/Warm White, ~20% White/Black, ≤10% Gold as one focal detail. Approved:
Warm White on Navy, Gold on Navy (large/bold only), Navy on Warm White.
Never: small Gold on White, Black text on Navy.

---

## 6. Tool stack — mapped to what's actually available, not a wishlist

| Job | Tool |
|---|---|
| Scheduling the 6 AM run | A cron trigger (`CronCreate`) that wakes an agent session daily |
| Data pull (FRED, Census, RSS) | Plain HTTP fetch — all three are genuinely free/keyless or free-with-key |
| Filter, rank, script draft | This session, routed through `kgj-content-engine` for voice enforcement |
| Dashboard delivery | Notion page (via the Notion connector) — one page per day, checklist-style |
| Data logging over time | A Google Sheet (via the Google Drive/Sheets connector) — one row per day: date, category, source, script, status |
| Avatar / talking-head video | HeyGen (once Kareem authorizes that connector) or Higgsfield `shorts_studio_create` / `marketing_studio_v2` |
| Text-card / B-roll video | Higgsfield `generate_video` / `generate_image` from the visual brief |
| TikTok publish | Higgsfield `tiktok_publish` once his TikTok account is connected via `tiktok_connect` |
| Final edit/captions | CapCut (manual, ~5 min of the 15-min review budget) |

**Setup Kareem needs to do once, not something this pipeline can do for
itself:** connect the Notion workspace, connect a TikTok account through the
publishing tool, and (optional) authorize a HeyGen avatar connector. Nothing
above requires MLS scraping or a paid Zillow/Redfin API — the whole thing
runs on free tiers plus his own first-party listing data.

---

## 7. Worked example — one full day's output (Friday · Rate Watch)

Illustrative only — the rate and date are placeholders until the pipeline
pulls a live FRED value; never post a rate that wasn't pulled fresh that
morning.

```
CONTENT DATE: [Fri, date]
CATEGORY: Rate Watch
TARGET AUDIENCE: All
PLATFORM: TikTok | Instagram Reels | YouTube Shorts
ASPECT RATIO: 9:16

SCRIPT (5–10 sec):
HOOK (0–2s): "The 30-year just moved. Here's what it does to your payment."
LESSON (2–8s): "A 1% rate drop saves roughly $200/month on a $500K loan — [rate, Freddie Mac PMMS via FRED, date]. That's real room in your budget, not a headline."
CTA (8–10s): "Follow for daily West Valley rate + market intel."

VISUAL STYLE: text-card cuts, navy background
COLOR PALETTE: Navy #0B1E3E · Gold #C9A84C · Warm White #FAF8F3
ON-SCREEN TEXT: "[X.XX%] → ~$[Y]/mo saved" in Gold on Navy
VOICEOVER TONE: calm, confident
BACKGROUND VISUAL: mortgage document close-up, then West Valley streetscape
TOOL RECOMMENDATION: CapCut text cards + Higgsfield voiceover
COMPLIANCE FOOTER: Kareem Jamal · REALTOR® · Rodeo Realty · DRE #01998956
```

---

## 8. What ships every morning (checklist)

```
□ #1 insight from the last 24h, sourced + dated
□ 5–10 sec script (Hook → Lesson → CTA), voice-checked against kgj-content-engine rules
□ Visual brief filled from §4, brand tokens only
□ Category tag + audience label (§2 rotation)
□ Delivered to dashboard before 6:30 AM, <15 min human review to approve + generate
```
