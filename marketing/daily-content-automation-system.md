# Daily Micro-Lesson Automation System

A fully systemized morning routine that pulls fresh real estate data, distills it into one
5–10 second micro-lesson, and packages a ready-to-shoot script + visual brief for
TikTok, Instagram Reels, and YouTube Shorts — built to make Kareem the go-to source
for real estate education on short-form social.

**Status: Phase 1 is live in this repo.** `scripts/daily-micro-lesson/` runs daily via
GitHub Actions, writes a machine-readable brief to `web/public/data/`, and a
human-readable one to `marketing/daily-briefs/`. Everything below documents how it
works today and what Phase 2 adds once licensed data feeds are in place.

---

## 1. Data sources

| Source in the original brief | Status | Why |
|---|---|---|
| Zillow API, Redfin Data Center, MLS/CRMLS feeds | **Phase 2** — search-sourced proxy for now | Bulk/API access to all three requires a paid partner agreement (MLS access also requires board membership + compliance). Until one is signed, Market Pulse and Seller Strategy pull public reporting *about* Zillow/Redfin/MLS data via search instead of the raw feed, and the brief always names the outlet + date rather than presenting it as a live feed. |
| NAR reports, Census Bureau API | **Phase 2** | Same shape of problem — NAR distributes through report pages, not a clean API; Census has an API but the metrics that matter here (existing home sales, affordability index) live in NAR's monthly release. Worth wiring directly once someone owns ongoing maintenance of a second data client. |
| Mortgage News Daily / Fed rate data | **Live** (search-sourced) | `Rate Watch` queries hit rate-desk coverage directly. |
| BiggerPockets Blog, Inman News | **Live** (search-sourced) | `Investor Edge`, `Agent Playbook`, `Mindset & Motivation` queries target these by domain. |
| Reddit (r/RealEstate, r/FirstTimeHomeBuyer, r/realestateinvesting) | **Live** (search-sourced) | `Buyer Intel` and `Investor Edge` queries target these subreddits by domain. |
| Google Trends | **Not implemented** | No reliable public API; the unofficial ones break often enough that they'd be the pipeline's single flakiest link. Worth adding back in if a maintained wrapper API exists when this is revisited. |

All of Phase 1 runs through **Firecrawl** — the same search tool already wired into
`scripts/market-pulse/` for the site's community-news widget — so there's one API
relationship to manage, not nine.

## 2. Morning automation workflow

Implemented as `.github/workflows/daily-micro-lesson.yml`, cron `0 13 * * *` (~6:00 AM
Pacific; shifts to 5:00 AM during PST — cron doesn't know DST, so the date-stamping
logic anchors to `America/Los_Angeles` explicitly instead of trusting the cron clock).

1. **Data pull** — `scripts/daily-micro-lesson/generate.mjs` resolves today's category
   from the calendar (below), then fires the Firecrawl searches configured for that
   category in `sources.mjs`.
2. **Filter & rank** — every hit passes a relevance gate (has to touch rate/price/
   afford/inventory/equity/etc.) and a denylist (no grim or off-topic headlines next
   to educational content), then near-duplicates collapse and survivors rank by
   recency + whether the headline carries a concrete figure.
3. **Insight extraction + script + visual brief** — the top-ranked candidates go to
   Claude with the brand voice rules embedded in the prompt (see §3). Claude returns
   one JSON object: the insight, the Hook/Lesson/CTA script, and the full visual brief.
   **No `ANTHROPIC_API_KEY`, or no usable candidate found** → the script writes a
   scaffold brief with bracketed placeholders instead of guessing. This mirrors the
   kgj-content-engine rule the whole system inherits: *bracketed gaps are honest,
   fabricated numbers are not.*
4. **Delivery** — writes `web/public/data/daily-lesson-<date>.json` (machine-readable,
   same convention as the market-pulse widget data) and
   `marketing/daily-briefs/<date>.md` (the exact visual-brief format from §5, ready to
   paste into Midjourney/HeyGen/CapCut). Both commit straight to the repo — no
   separate Notion/Slack app to maintain — see §6 for why.

Trigger a run any time without waiting for the cron: **Actions → Daily Micro-Lesson →
Run workflow**.

## 3. Brand voice (enforced in the prompt, not left to chance)

Every generated script is graded against the same rules a human draft would be
(`kgj-content-engine` skill):

- Straight talk, coach energy — explaining the play, not selling the ticket.
- Second person. Numbers over adjectives. Every number carries a source + date.
- Banned: *stunning, dream home, don't miss out, act now, hot market, unbelievable,
  luxury* (unless literal).
- No filler openings ("In today's market…"). Start with the claim.
- At most one exclamation point, usually zero.
- The client is the hero — the agent is the one who did the math.
- Closing question answerable in one sentence by someone with zero expertise.

Script shape (5–10 seconds total):

- **Hook (1–2s):** a shocking stat, bold claim, or direct question.
- **Lesson (3–6s):** one clear, digestible insight or action.
- **CTA (1–2s):** a simple next step.

## 4. Seven-day rotation

Defined in `scripts/daily-micro-lesson/calendar.mjs`, mapped onto Kareem's existing
pillars (**West Valley Expertise · ADU Strategy · Generational Wealth**) and the
`kgj-content-engine` template shapes so a generated brief slots into the same system
as a manually drafted post, instead of running as a second taxonomy next to it.

| Day | Category | Audience | Pillar | Template |
|---|---|---|---|---|
| Sunday | Mindset & Motivation | All | Generational Wealth | Personal Proof |
| Monday | Market Pulse | All | West Valley Expertise | The Number |
| Tuesday | Buyer Intel | Buyers | West Valley Expertise | Correction |
| Wednesday | Investor Edge | Investors | ADU Strategy | The Number |
| Thursday | Agent Playbook | Agents | West Valley Expertise | Personal Proof |
| Friday | Rate Watch | All | West Valley Expertise | The Number |
| Saturday | Seller Strategy | Sellers | Generational Wealth | The Quiet Cost |

## 5. Visual brief output format

Exactly what `generate.mjs` writes to `marketing/daily-briefs/<date>.md`:

```
CONTENT DATE: [Date]
CATEGORY: [e.g., Market Pulse]
TARGET AUDIENCE: [Buyers / Sellers / Investors / Agents / All]
PLATFORM: TikTok | Instagram Reels | YouTube Shorts

SCRIPT (5–10 sec):
Hook: [...]
Lesson: [...]
CTA: [...]

VISUAL STYLE: [e.g., bold text animation, clean infographic, talking head]
COLOR PALETTE: Navy #0B1E3E + Gold #C9A84C (KJ brand tokens — Fraunces display / Inter utility)
ON-SCREEN TEXT: [key stat or phrase, all caps]
VOICEOVER TONE: [e.g., confident, urgent, calm and authoritative]
BACKGROUND VISUAL: [e.g., luxury home exterior, city skyline, mortgage document close-up]
TOOL RECOMMENDATION: [Midjourney / DALL·E / Runway ML / HeyGen / CapCut]

SOURCE: [outlet, date — or "verify before publishing"]
NEEDS HUMAN REVIEW: [yes + why / no]

Compliance footer: Kareem Jamal · REALTOR® · Rodeo Realty · DRE #01998956
818.402.7326 · kjamal@rodeore.com · kareemjamaltherealtor.com
```

**Platform formatting notes** (apply when producing the final cut, not generated
per-brief since they don't change day to day):

- **Aspect ratio:** 9:16 vertical, safe text zone in the middle third (all three
  platforms crop the top ~10% and bottom ~15% for UI).
- **On-screen text:** Inter, all caps, Warm White `#FAF8F3` on a Navy `#0B1E3E` bar;
  Gold `#C9A84C` reserved for the single number worth remembering. Never small Gold
  text on white, never black text on navy.
- **Audio:** captions burned in regardless of platform (most viewers watch muted);
  voiceover leads, no music competing with speech during the Lesson beat.

## 6. Tool stack — what's actually wired vs. recommended

| Layer | Choice | Why |
|---|---|---|
| Search / scraping | **Firecrawl** | Already the site's search dependency (`scripts/market-pulse/`) — one relationship, one API key to rotate. |
| Insight extraction, ranking, script + brief writing | **Claude API** (`ANTHROPIC_API_KEY`, `claude-sonnet-5` default) | This repo's automation is already Claude-authored end to end; using the same vendor for the generation step avoids a second LLM account and key. GPT works as a drop-in swap in `generate.mjs`'s `callClaude` function if preferred — the prompt itself is vendor-agnostic. |
| Scheduling + delivery | **GitHub Actions cron**, commit straight to the repo | No Notion/Slack app to authenticate, host, or lose access to — the brief lands as a normal file in a PR-able repo Kareem already owns. Add a Slack/Discord webhook step to the workflow later if a push notification (not just a committed file) is wanted each morning. |
| Video/image generation | **Runway ML, HeyGen, Midjourney/DALL·E** (per-brief recommendation) | Human-in-the-loop step — the brief is the handoff artifact, not something this pipeline auto-submits to a paid render API. |
| Final edit/caption/export | **CapCut / Adobe Express** | Same — human step, brief specifies aspect ratio and on-screen text already. |

## 7. What ships every morning

1. The day's ranked source candidates (title, outlet, date, URL) — the audit trail
   for the one insight chosen.
2. The #1 insight, with a source + date, or an honest placeholder if nothing cleared
   the bar that day.
3. A 5–10 second Hook → Lesson → CTA script in brand voice.
4. A complete visual brief in the exact format above, ready to hand to a
   generation tool.
5. Category + pillar + audience tag, matching the rotation.

## 8. Daily human review (~10–15 min)

The system is built to shrink review to a checklist, not a rewrite:

- [ ] `needsHumanReview` is `false`, or the reason it's `true` is addressed
- [ ] Every number in the script has a real, checkable source line (never ship a
      bracketed placeholder)
- [ ] No banned hype words slipped through
- [ ] Closing question is answerable in one sentence
- [ ] Visual brief matches brand tokens (Navy/Gold, Fraunces/Inter)
- [ ] Compliance footer present

If a day's brief comes back as a scaffold (no usable candidate, or the LLM call
failed), that's the pipeline being honest about a gap, not a bug to route around —
draft that day's post manually via `kgj-content-engine` instead.

## Setup

```bash
cd scripts/daily-micro-lesson
npm install
cp .env.example .env   # fill in FIRECRAWL_API_KEY, optionally ANTHROPIC_API_KEY
npm run verify          # pure logic, no API key needed
npm run generate         # full run, needs FIRECRAWL_API_KEY at minimum
```

For the scheduled run, add `FIRECRAWL_API_KEY` and `ANTHROPIC_API_KEY` as repository
secrets (Settings → Secrets and variables → Actions) — the workflow already
references both.
