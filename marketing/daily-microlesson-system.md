# Daily micro-lesson system

A fully automated 6am pipeline that turns overnight real-estate data and news
into one ready-to-shoot 5–10 second script + visual brief for TikTok,
Instagram Reels, and YouTube Shorts — in Kareem Jamal's brand voice (Rodeo
Realty, West San Fernando Valley + Simi Valley). Goal: become the go-to
short-form real estate education source, at under 15 minutes/day of human
review.

**Status: built and wired.** Code lives in `scripts/daily-microlesson/`,
runs on `.github/workflows/daily-microlesson.yml`, and writes to
`content/daily-microlessons/`. What's below is both the design and a map of
where each piece actually lives, so this doc stays true to the repo instead
of drifting into aspiration.

## Why this shape, not a literal read of the six steps

The original brief calls for the Zillow API, Redfin Data Center, raw MLS
feeds, and NAR reports as four separate pulls. In practice: Zillow's and
NAR's data products require a paid data license or a Zillow/NAR partner
agreement neither this repo nor Kareem's brokerage currently holds, and a
live cross-metro MLS feed needs broker-level CRMLS credentials beyond the
IDX embed already used on `/mls-search`. Building fetchers against APIs that
don't exist yet would ship code that 401s on day one. Instead:

| Spec source | What actually runs |
|---|---|
| Zillow API | Firecrawl search against Zillow Research's public commentary (`sources.mjs: fetchZillowResearch`) |
| Redfin Data Center | Firecrawl search against Redfin's public Data Center reporting (`fetchRedfinDataCenter`) |
| MLS Data Feeds | The site's own local-market signal: `web/public/data/market-pulse-*.json`, already scraped weekly per zip by `scripts/market-pulse` (`fetchLocalMarketPulse`) — this *is* Kareem's real MLS-adjacent local data, zip by zip |
| Fed / Mortgage News Daily | Mortgage News Daily's public RSS feed (`fetchMortgageNewsDaily`) + a Firecrawl search for same-day Fed rate news (`fetchFedRates`) |
| Census Bureau API | The real, keyless Census Building Permits Survey time-series endpoint (`fetchCensusPermits`) |
| NAR reports | Firecrawl search for the current NAR existing-home-sales / affordability headline (`fetchNAR`) |
| Google Trends | Firecrawl search for trending real-estate queries — there's no free official Trends API, so this is a same-day news proxy, not a scrape of trends.google.com (`fetchGoogleTrends`) |
| Reddit (3 subs) | Firecrawl search scoped to the three subreddits — Reddit's own API needs OAuth app registration this repo doesn't have (`fetchReddit`) |
| BiggerPockets / Inman RSS | Both publish real public feeds, fetched directly (`fetchBiggerPockets`, `fetchInman`) |

Every fetcher in `sources.mjs` is wrapped so one dead feed shrinks today's
candidate pool instead of failing the run — same defensive pattern as
`scripts/market-pulse/generate.mjs`.

## Pipeline (runs on `.github/workflows/daily-microlesson.yml`, 13:00 UTC = 6am PDT)

1. **Data pull** — `fetchAll()` hits all nine sources concurrently, each
   scoped to the last 24h (`tbs: "qdr:d"` for Firecrawl searches, feed order
   for RSS).
2. **Filter & rank** — `rank.mjs` scores every item against *today's*
   rotation slot (see below): recency, audience-keyword overlap, source
   weight (boosted further when the source is one of that slot's preferred
   sources), and a bonus for actually carrying a number. `dedupe()` collapses
   the same story reported by two outlets.
3. **Insight extraction + categorization** — the top-ranked item is tagged
   `DATA STAT` / `ACTIONABLE TIP` / `MINDSET/INSPIRATION` by
   `classifyContentType()` (keyword + numeric-pattern heuristics), then the
   top 3 (not just #1) are kept so a human reviewer has two backups.
4. **Micro-script generation** — `script-writer.mjs` sends the #1 item plus
   the KGJ brand-voice rules (straight talk, second person, every number
   sourced and dated, no hype words, ≤1 exclamation point, viewer-as-hero)
   to Claude, and gets back hook / lesson / CTA plus the visual-brief fields
   as structured JSON. The prompt explicitly forbids citing a number that
   isn't in the source item — bracketed-placeholder discipline from
   `kgj-content-engine`, enforced at the model layer instead of by hoping.
5. **Visual brief + delivery** — `assemble()` + `renderMarkdown()` produce
   the exact block format from the spec (see below) and write it to
   `content/daily-microlessons/YYYY-MM-DD.{json,md}`, committed straight to
   the repo. If `NOTION_API_KEY`/`NOTION_DATABASE_ID` or `SLACK_WEBHOOK_URL`
   secrets are set, the same packet is also pushed there — optional, and
   never blocks the commit if it fails.

Total wall-clock: a few seconds of RSS/API calls, a handful of Firecrawl
searches, one Claude call. No 6:00/6:05/6:10 staged cron entries needed —
one job does the whole thing in well under a minute.

## Micro-lesson framework (enforced, not just described)

Hook (1–2s) → Lesson (3–6s, sourced number or one clear action) → CTA
(1–2s). `script-writer.mjs`'s prompt encodes this shape and the full KGJ
voice checklist directly, so drift gets caught in the model's own output
rather than in a later editing pass.

## 7-day rotation (`rank.mjs: ROTATION`)

| Day | Category | Audience | Default content type |
|---|---|---|---|
| Monday | Market Pulse | All | DATA STAT |
| Tuesday | Buyer Intel | Buyers | ACTIONABLE TIP |
| Wednesday | Investor Edge | Investors | ACTIONABLE TIP |
| Thursday | Agent Playbook | Agents | ACTIONABLE TIP |
| Friday | Rate Watch | All | DATA STAT |
| Saturday | Seller Strategy | Sellers | ACTIONABLE TIP |
| Sunday | Mindset / Motivation | All | MINDSET/INSPIRATION |

`categoryForDate()` reads the rotation off the actual calendar day, so the
pipeline needs no manual "which day is it" input.

## Output format (`script-writer.mjs: renderMarkdown`)

```
CONTENT DATE: [Date]
CATEGORY: [rotation label]
TARGET AUDIENCE: [Buyers / Sellers / Investors / Agents / All]
PLATFORM: TikTok | Instagram Reels | YouTube Shorts

SCRIPT (5-10 sec):
[Hook] ...
[Lesson] ...
[CTA] ...

VISUAL STYLE: ...
COLOR PALETTE: ...
ON-SCREEN TEXT: ...
VOICEOVER TONE: ...
BACKGROUND VISUAL: ...
TOOL RECOMMENDATION: ...

CONTENT TYPE: DATA STAT | ACTIONABLE TIP | MINDSET/INSPIRATION
SOURCE: [title] — [feed], [date] ([url])
```

The `SOURCE` line isn't in the original spec's block — it's added because
every KGJ post's credibility moat is a sourced, dated number, and a script
handed to a video tool with no citation trail can't be checked by Kareem in
his 15-minute review.

## Tool stack — what's wired vs. what's a human's next click

| Layer | Tool | Status |
|---|---|---|
| Scraping (Redfin/Zillow/NAR/Trends/Reddit) | Firecrawl | Wired — same `FIRECRAWL_API_KEY` secret as `market-pulse` |
| RSS (Mortgage News Daily, Inman, BiggerPockets) | `rss-parser` | Wired |
| Housing starts/permits | Census Bureau API | Wired, keyless (optional `CENSUS_API_KEY` for rate limit) |
| Insight extraction + script writing | Claude (Anthropic Messages API) | Wired — `ANTHROPIC_API_KEY` secret. (Spec suggested OpenAI's GPT API; Claude does the same job and keeps this repo on one AI vendor.) |
| Dashboard / delivery | Git-committed `content/daily-microlessons/` (always) + Notion API / Slack webhook (optional) | Wired |
| AI avatar video | HeyGen / Synthesia | Not wired — human step: paste the script into either tool |
| AI video generation | Runway ML / Pika Labs | Not wired — human step |
| Final edit/caption/export | CapCut / Adobe Express | Not wired — human step |

The spec's Steps 1–5 (data → insight → script → visual brief → delivery) are
fully automated. Steps that require an actual rendered video (HeyGen/Runway/
CapCut) stay a deliberate human click — none of those tools currently have
an API key provisioned in this repo, and video generation is exactly the
kind of output worth a human's 15 minutes before it goes out under Kareem's
name.

## Setup

1. Add repo secrets: `FIRECRAWL_API_KEY` (already exists for market-pulse),
   `ANTHROPIC_API_KEY`. Optional: `CENSUS_API_KEY`, `NOTION_API_KEY` +
   `NOTION_DATABASE_ID`, `SLACK_WEBHOOK_URL`.
2. The workflow runs itself daily at 13:00 UTC. Trigger a run manually from
   the Actions tab (`workflow_dispatch`) to test before relying on the cron.
3. Local dry run: `cd scripts/daily-microlesson && npm install && cp
   .env.example .env` (fill in keys) `&& npm run generate`.

## The 15-minute daily review

1. Open today's `content/daily-microlessons/YYYY-MM-DD.md`.
2. Sanity-check the cited number against its source URL (one click).
3. If the #1 pick is weak, swap in runner-up #2 or #3 from the `.json` file
   — no rerun needed.
4. Paste the script into HeyGen/Runway/CapCut, record or generate the
   visual, caption, and post.

## Known limitations (stated plainly, not glossed over)

- **No literal Zillow/NAR API or raw MLS feed.** Those need paid data
  licenses this repo doesn't hold. The substitutes above are real, public,
  and directionally the same signal, but they are not the vendor's own
  numbers — the sourced citation on every output makes that traceable.
- **Google Trends** has no free official API; the "trending searches" source
  is same-day news about real-estate search behavior, not a live Trends
  scrape.
- **Reddit** is fetched via search, not the Reddit API, since that needs an
  OAuth app registration. Good enough for "what are people asking," not for
  vote counts or comment threads.
- **One Claude call per day** means one script, not several variants —
  matches the spec's "single powerful micro-lesson" requirement exactly.
