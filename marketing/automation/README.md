# Daily Short-Form Content Engine — System Blueprint

A repeatable morning pipeline that turns fresh real estate data into one
ready-to-shoot 5–10 second micro-lesson for TikTok, Instagram Reels, and
YouTube Shorts — in Kareem's existing brand voice (see
`.claude/skills/kgj-content-engine`), not a generic national feed.

This doc maps the full pipeline concept to what's **actually reachable from
this environment today** vs. what needs a paid data license or a one-time
sign-off before it runs unattended. Nothing here auto-publishes to social —
that step is flagged for human approval on purpose (DRE #01998956 compliance
and brand-voice risk are real costs of a bad auto-post; a wrong headline
skipping a review is not).

---

## 1. Data sources — what's real vs. what needs a subscription

| Source (as requested) | Status here | Substitute in this pipeline |
|---|---|---|
| Zillow API | Requires Zillow's paid/partner API — not available | Zillow Research public reports via `WebSearch` (updated weekly/monthly, sufficient for a daily insight) |
| Redfin Data Center | Public CSVs exist (no key), scrape/download via `WebFetch` | Redfin's public "Data Center" download + `WebSearch` for their weekly housing-market commentary |
| MLS Data Feeds | Requires an RETS/RESO Web API credential from CRMLS — Kareem already has MLS access for the site's IDX widget; reuse that credential if zip-level stats are wanted later | Out of scope for v1 — national/regional stats don't need it |
| Federal Reserve / Mortgage News Daily | Public, no key | `WebSearch` (as pulled below) or FRED's free public API (`MORTGAGE30US` series) with a no-cost API key |
| Census Bureau API | Free, no key required for most endpoints | Direct API calls for housing starts/permits |
| NAR Reports | Public press releases | `WebSearch` / `WebFetch` on nar.realtor press room |
| Google Trends | No official free API | Approximate via `WebSearch` ("trending real estate searches") — good enough for a daily hook, not exact |
| Reddit (r/RealEstate, r/FirstTimeHomeBuyer, r/realestateinvesting) | Public JSON endpoints (`old.reddit.com/r/<sub>/top.json`) are fetchable without auth | `WebFetch` |
| BiggerPockets Blog / Inman RSS | Public RSS | `WebFetch`, same pattern as `scripts/market-pulse` (Firecrawl) |

**Bottom line:** every source in the request is reachable for free except a
true Zillow/Redfin enterprise feed and raw MLS sold data — and the site
already has an MLS relationship for IDX, so that's a future upgrade, not a
blocker.

---

## 2. The morning run — what actually executes each step

The original 7-step, minute-by-minute plan assumed a stack of separate
services (scraper → GPT API → Notion API → Slack bot). In this repo, one
tool already does steps 1–6 in a single pass: a scheduled Claude Code
session with `WebSearch`/`WebFetch`. That's what ran this morning to
produce the sample in `samples/2026-08-25-buyer-intel.md`.

| Step | Original plan | This pipeline |
|---|---|---|
| 1. Data pull | Hit every API | `WebSearch`/`WebFetch` across today's category's sources (see rotation below) |
| 2. Filter & rank | Separate GPT scoring call | Same Claude session scores candidates inline against: relevance to today's audience, novelty (not said yesterday), and a real number to anchor it |
| 3. Insight extraction | Separate call | Same pass, one sentence |
| 4. Categorization | Tag DATA STAT / TIP / MINDSET | Tag = today's weekday category (rotation below already implies the type) |
| 5. Micro-script | Hook → Lesson → CTA, 5–10s | Drafted against `kgj-content-engine`'s "The Number" / Reel voice rules (numbers over adjectives, source + date on every figure, no hype words, second person, ≤1 exclamation point) |
| 6. Visual brief | Freeform | Fixed template below, using the site's brand tokens (Navy `#0B1E3E`, Gold `#C9A84C`, Warm White `#FAF8F3`, Inter/Fraunces) so every asset matches the rest of the brand, not a generic stock look |
| 7. Delivery | Notion/Slack | Committed to `marketing/automation/samples/<date>-<category>.md` in this repo (versioned, diffable) + optionally mirrored to Notion once that connector is authorized |

## 3. Turning this into an unattended daily job

Everything above ran manually today to prove the pipeline produces something
usable. To make it run every morning without a person kicking it off:

1. **Schedule it.** A recurring cron-triggered Claude Code session (same
   mechanism as this session) fires at 6:00 AM Pacific with a short fixed
   prompt: *"Run the daily short-form pipeline in
   `marketing/automation/README.md` for today's rotation category, commit
   the output to `marketing/automation/samples/`, and notify me."*
2. **Notion dashboard.** Once the Notion connector is authorized (it's
   listed as connecting/unauthenticated in this environment), each day's
   output also gets written as a Notion page so review takes < 2 minutes on
   a phone.
3. **Visual/video generation.** This environment already has the `higg`
   MCP tools (`generate_image`, `generate_video`, `shorts_studio_create`,
   `tiktok_publish`, `virality_predictor`). The visual brief below is
   written to drop straight into `generate_image`/`shorts_studio_create` —
   but **do not wire `tiktok_publish` into the unattended job**. Auto-data
   is disposable; a bad auto-post to a licensed agent's public account
   isn't. Publish stays a one-tap human step until a run-history shows the
   drafts are consistently on-brand.
4. **Cost control.** Each run is one Claude session doing a handful of
   searches — cheap and bounded, unlike a 24/7 scraper fleet.

**This design doc does not itself turn on the recurring schedule.** Say the
word and it gets created (`CronCreate`) — flagging it here rather than
enabling it silently, since it's a standing recurring job on the account.

---

## 4. Micro-lesson script framework (enforced every day)

- **Hook (1–2s):** a stat, bold claim, or direct question — no filler
  opening (never "Today in real estate...").
- **Lesson (3–6s):** one insight, one number, sourced and dated.
- **CTA (1–2s):** one line. Default: *"Follow for daily real estate intel."*
  Rotate in a link-in-bio CTA on Buyer/Seller/Rate days.

Same voice rules as every other Kareem asset: second person, numbers over
adjectives, zero hype words (stunning / dream home / act now / hot market),
≤1 exclamation point, client is the hero, teach something or it doesn't
ship. Every script closes with the compliance footer in the visual brief:

> Kareem Jamal · REALTOR® · Rodeo Realty · DRE #01998956

## 5. Visual brief format (generated with every script)

```
CONTENT DATE: [Date]
CATEGORY: [Monday–Sunday rotation category]
TARGET AUDIENCE: [Buyers / Sellers / Investors / Agents / All]
PLATFORM: TikTok | Instagram Reels | YouTube Shorts

SCRIPT (5–10 sec):
[Hook] → [Lesson] → [CTA]

VISUAL STYLE: [bold text animation / clean infographic / talking head]
COLOR PALETTE: Navy #0B1E3E + Warm White #FAF8F3, Gold #C9A84C on the one number worth remembering
ON-SCREEN TEXT: Inter, all caps for eyebrows/stat; Fraunces (300–500 weight) for the headline line, never all-caps
VOICEOVER TONE: [confident / urgent / calm and authoritative]
BACKGROUND VISUAL: [description]
TOOL RECOMMENDATION: higg (generate_image / generate_video / shorts_studio_create) or CapCut for manual edit
COMPLIANCE FOOTER (last frame): Kareem Jamal · REALTOR® · Rodeo Realty · DRE #01998956 · 818.402.7326
```

## 6. Category calendar

See `rotation-calendar.md` for the full 7-day rotation mapped to Kareem's
three content pillars (West Valley Expertise · ADU Strategy · Generational
Wealth) and the source angles pulled each day.

## 7. Human review budget

Target: **< 15 minutes/day.** The script is drafted; a human reads one
short brief, approves or edits the hook line, and taps generate/publish.
Nothing here removes that tap — it removes everything before it.
