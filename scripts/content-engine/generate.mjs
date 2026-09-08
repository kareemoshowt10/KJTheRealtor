// Daily morning content pipeline for the short-form micro-lesson system.
//
// Every morning (see .github/workflows/content-engine.yml) this script:
//   1. Picks today's category from the 7-day rotation (Step 4 of the design doc).
//   2. Pulls current mortgage rates from FRED (Federal Reserve) and turns a rate
//      move into a real dollar-savings stat via standard amortization math.
//   3. Optionally pulls one supporting headline for the category via Firecrawl
//      (same provider/key as scripts/market-pulse).
//   4. Writes a Hook -> Lesson -> CTA script and a full visual brief.
//   5. Delivers the brief to web/public/data (site widget), content/daily-briefs
//      (human review file), and optionally Slack / Notion.
//
// Every stage that needs a key degrades gracefully — the pipeline always
// finishes with a usable brief, per the "deliver every single morning" and
// "<15 minutes of human review" requirements it was built against. See
// marketing/daily-micro-lesson-system.md for the full design.
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** Brand palette from HYBRID.md — reused so every brief stays on-brand by default. */
export const BRAND = {
  navy: "#0B1E33",
  gold: "#C9A227",
  cream: "#F5F1E8",
};

/**
 * 7-day rotation (Step 4). Index = Date#getDay() (0 = Sunday ... 6 = Saturday).
 * `audience` and copy below are what actually varies the script per category.
 */
export const CATEGORIES = [
  {
    key: "mindset-motivation",
    label: "Mindset/Motivation",
    audience: "All",
    hook: () => "Every homeowner you admire started with one decision.",
    lesson: (ctx) =>
      ctx.rate
        ? `Rates, prices, timing — none of it matters until you decide to start. The market rewards people who act, not people who wait for perfect.`
        : `Wealth in real estate isn't built by timing the market perfectly — it's built by owning something and holding on.`,
    visualStyle: "Bold text animation over slow-motion sunrise/skyline b-roll",
    palette: `${BRAND.gold} + ${BRAND.cream} for warmth and aspiration`,
    voTone: "Calm, confident, almost cinematic",
    background: "Golden-hour city skyline or a family walking into a new home",
  },
  {
    key: "market-pulse",
    label: "Market Pulse",
    audience: "All",
    hook: (ctx) =>
      ctx.insight
        ? `Here's what's actually happening in the housing market right now.`
        : `The housing market moved again this week — here's the number that matters.`,
    lesson: (ctx) =>
      ctx.insight
        ? `${ctx.insight.title.replace(/\s+/g, " ").trim()}. That's the shift buyers and sellers both need to plan around.`
        : `Inventory, price cuts, and days-on-market all tell the same story: the market is local. Know your zip code's numbers before you make a move.`,
    visualStyle: "Clean data infographic, animated bar/line chart",
    palette: `${BRAND.navy} + ${BRAND.cream} for authority`,
    voTone: "Confident, informative",
    background: "Aerial neighborhood footage or a rising/falling chart overlay",
  },
  {
    key: "buyer-intel",
    label: "Buyer Intel",
    audience: "Buyers",
    hook: (ctx) =>
      ctx.rate
        ? `Mortgage rates are at ${ctx.rate.rate30.toFixed(2)}% right now — here's what that means for you.`
        : `Here's the one thing every first-time buyer gets wrong.`,
    lesson: (ctx) =>
      ctx.rate && ctx.savings
        ? `A ${Math.abs(ctx.rate.deltaPct).toFixed(2)}-point rate move changes your payment by about $${Math.round(ctx.savings.monthly)}/month — that's $${Math.round(ctx.savings.total).toLocaleString()} over the life of the loan. Get pre-approved now so you're ready to move when the right home hits.`
        : `Get pre-approved before you fall in love with a house, not after. It tells you your real number and makes your offer competitive on day one.`,
    visualStyle: "Talking head + on-screen stat callouts",
    palette: `${BRAND.navy} + ${BRAND.gold}`,
    voTone: "Direct, reassuring",
    background: "Mortgage document / calculator close-up, then a front-door reveal",
  },
  {
    key: "investor-edge",
    label: "Investor Edge",
    audience: "Investors",
    hook: () => "Cash flow isn't the only way real estate builds wealth.",
    lesson: (ctx) =>
      ctx.insight
        ? `${ctx.insight.title.replace(/\s+/g, " ").trim()}. Watch how that changes your cap rate math this quarter.`
        : `Appreciation, principal paydown, tax benefits, and cash flow all compound at the same time — that's the part a spreadsheet on rent alone misses.`,
    visualStyle: "Clean infographic with a compounding-growth chart",
    palette: `${BRAND.navy} + ${BRAND.gold} for authority and growth`,
    voTone: "Confident, slightly urgent",
    background: "Multi-family property exterior or a portfolio chart overlay",
  },
  {
    key: "agent-playbook",
    label: "Agent Playbook",
    audience: "Agents",
    hook: () => "Steal this script for your next buyer call.",
    lesson: (ctx) =>
      ctx.insight
        ? `Lead with this: "${ctx.insight.title.replace(/\s+/g, " ").trim()}." It gives the client a reason to act today instead of "thinking about it."`
        : `Stop pitching yourself first. Open every call with one market fact your client didn't know — trust gets built before rapport does.`,
    visualStyle: "Talking head, bold text overlay for the script line",
    palette: `${BRAND.navy} + ${BRAND.cream}`,
    voTone: "Coach-like, energetic",
    background: "Office/desk setting or a phone call re-enactment",
  },
  {
    key: "rate-watch",
    label: "Rate Watch",
    audience: "All",
    hook: (ctx) =>
      ctx.rate
        ? `Mortgage rates just went ${ctx.rate.direction} — here's what that means for YOU.`
        : `Everyone's watching mortgage rates. Here's what actually matters.`,
    lesson: (ctx) =>
      ctx.rate && ctx.savings
        ? `The 30-year is at ${ctx.rate.rate30.toFixed(2)}%${ctx.rate.rate15 ? ` (15-year at ${ctx.rate.rate15.toFixed(2)}%)` : ""}. A move that size saves or costs the average buyer about $${Math.round(ctx.savings.monthly)}/month — roughly $${Math.round(ctx.savings.total).toLocaleString()} over 30 years.`
        : `A 1-point rate move can swing a monthly payment by hundreds of dollars. Always run YOUR numbers — don't shop off the headline rate.`,
    visualStyle: "Bold stat callouts, ticking-number animation",
    palette: `${BRAND.navy} + white for authority`,
    voTone: "Urgent, precise",
    background: "Mortgage rate chart or a Fed/rate headline close-up",
  },
  {
    key: "seller-strategy",
    label: "Seller Strategy",
    audience: "Sellers",
    hook: (ctx) =>
      ctx.insight
        ? `Selling soon? This changes your pricing strategy.`
        : `Overpricing your home is the #1 way to leave money on the table.`,
    lesson: (ctx) =>
      ctx.insight
        ? `${ctx.insight.title.replace(/\s+/g, " ").trim()}. Price to today's buyer pool, not last year's comps.`
        : `Homes priced right in the first 7 days sell faster and closer to list price. Every price cut after that resets the buyer psychology against you.`,
    visualStyle: "Before/after listing photo comparison, clean infographic",
    palette: `${BRAND.gold} + ${BRAND.cream} for growth and warmth`,
    voTone: "Calm, authoritative",
    background: "Staged living room or a 'for sale' sign at golden hour",
  },
];

/** Maps Date#getDay() output to a category. Pure — no Date.now() inside. */
export function categoryForDate(date) {
  return CATEGORIES[date.getDay()];
}

const CTA_POOL = [
  "Follow for daily real estate intel.",
  "Save this before your next move.",
  "Follow @kareemjamaltherealtor for more.",
  "DM me your zip code for a free market snapshot.",
];

/** Rotates CTAs by day-of-year so the same one doesn't repeat every week. */
export function pickCta(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return CTA_POOL[dayOfYear % CTA_POOL.length];
}

// ── Mortgage math ──────────────────────────────────────────────────────────

export function monthlyPayment(principal, annualRatePct, years = 30) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Positive = the lower rate saves money vs. the higher one. */
export function paymentDelta(principal, higherRatePct, lowerRatePct, years = 30) {
  const monthly = monthlyPayment(principal, higherRatePct, years) - monthlyPayment(principal, lowerRatePct, years);
  return { monthly, total: monthly * years * 12 };
}

export function savingsFromRateMove(rate, loanAmount) {
  if (!rate || rate.deltaPct === 0) return null;
  const [hi, lo] = rate.deltaPct > 0 ? [rate.rate30, rate.rate30 - rate.deltaPct] : [rate.rate30 - rate.deltaPct, rate.rate30];
  return paymentDelta(loanAmount, hi, lo);
}

// ── FRED (Federal Reserve) rate data ───────────────────────────────────────

export function parseFredSeries(json) {
  if (!json || !Array.isArray(json.observations)) return [];
  return json.observations
    .filter((o) => o.value && o.value !== ".")
    .map((o) => ({ date: o.date, rate: Number(o.value) }))
    .filter((o) => Number.isFinite(o.rate));
}

/** series is FRED-ordered most-recent-first (sort_order=desc). */
export function rateSummary(series30, series15) {
  if (!series30.length) return null;
  const latest30 = series30[0];
  const prior30 = series30[1] || series30[0];
  const deltaPct = Number((latest30.rate - prior30.rate).toFixed(3));
  const latest15 = series15[0] || null;
  return {
    rate30: latest30.rate,
    rate15: latest15 ? latest15.rate : null,
    asOf: latest30.date,
    deltaPct,
    direction: deltaPct > 0.005 ? "up" : deltaPct < -0.005 ? "down" : "flat",
  };
}

async function fetchFredSeries(seriesId, apiKey) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId} returned ${res.status}`);
  return parseFredSeries(await res.json());
}

// ── Firecrawl supporting headline (optional enrichment) ────────────────────

const FIRECRAWL_QUERIES = {
  "market-pulse": "national housing market median home price inventory report",
  "buyer-intel": "first time home buyer tips advice mortgage",
  "investor-edge": "real estate investing strategy cash flow appreciation",
  "agent-playbook": "real estate agent script listing lead generation tip",
  "rate-watch": "mortgage rate forecast outlook",
  "seller-strategy": "home seller pricing strategy tips market",
  "mindset-motivation": "real estate wealth building mindset success",
};

/** Picks the first result whose title clears a basic quality bar. */
export function selectInsight(hits) {
  if (!Array.isArray(hits)) return null;
  const hit = hits.find((h) => h && h.title && h.url && String(h.title).trim().length >= 25);
  return hit ? { title: String(hit.title).trim(), url: hit.url } : null;
}

async function fetchInsight(categoryKey, apiKey) {
  const { Firecrawl } = await import("firecrawl");
  const client = new Firecrawl({ apiKey });
  const query = FIRECRAWL_QUERIES[categoryKey];
  const result = await client.search(query, { sources: ["news"], limit: 5, tbs: "qdr:w" });
  const hits = result.news && result.news.length ? result.news : result.web || [];
  return selectInsight(hits);
}

// ── Script + visual brief ───────────────────────────────────────────────────

export function buildScript(category, ctx) {
  return {
    hook: category.hook(ctx),
    lesson: category.lesson(ctx),
    cta: pickCta(ctx.date),
  };
}

export function buildBrief(category, script, ctx) {
  const onScreenText = ctx.rate
    ? `${ctx.rate.rate30.toFixed(2)}% 30-yr rate`
    : ctx.insight
      ? ctx.insight.title.slice(0, 60)
      : category.label;
  return {
    date: ctx.date.toISOString().slice(0, 10),
    category: category.label,
    audience: category.audience,
    platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    script,
    visualStyle: category.visualStyle,
    colorPalette: category.palette,
    onScreenText,
    voiceoverTone: category.voTone,
    backgroundVisual: category.background,
    toolRecommendation: "CapCut for editing; HeyGen for an avatar voiceover; Midjourney for static B-roll stills",
    source: ctx.insight ? ctx.insight.url : null,
    rate: ctx.rate,
  };
}

export function briefToMarkdown(brief) {
  return `CONTENT DATE: ${brief.date}
CATEGORY: ${brief.category}
TARGET AUDIENCE: ${brief.audience}
PLATFORM: ${brief.platforms.join(" | ")}

SCRIPT (5-10 sec):
Hook: ${brief.script.hook}
Lesson: ${brief.script.lesson}
CTA: ${brief.script.cta}

VISUAL STYLE: ${brief.visualStyle}
COLOR PALETTE: ${brief.colorPalette}
ON-SCREEN TEXT: ${brief.onScreenText}
VOICEOVER TONE: ${brief.voiceoverTone}
BACKGROUND VISUAL: ${brief.backgroundVisual}
TOOL RECOMMENDATION: ${brief.toolRecommendation}
${brief.source ? `\nSOURCE: ${brief.source}` : ""}

PLATFORM NOTES: Export 1080x1920 (9:16). Keep key text inside the center-safe
80% of frame width (TikTok/Reels UI overlays the outer edges). Captions
burned in — most viewers watch muted. Lead with the hook in the first
frame; do not fade in.
`;
}

// ── entrypoint ───────────────────────────────────────────────────────────

const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntrypoint) {
  const date = new Date();
  const category = categoryForDate(date);
  const loanAmount = Number(process.env.CONTENT_LOAN_AMOUNT) || 420000;

  let rate = null;
  if (process.env.FRED_API_KEY) {
    try {
      const [series30, series15] = await Promise.all([
        fetchFredSeries("MORTGAGE30US", process.env.FRED_API_KEY),
        fetchFredSeries("MORTGAGE15US", process.env.FRED_API_KEY),
      ]);
      rate = rateSummary(series30, series15);
    } catch (err) {
      console.error("FRED fetch failed, continuing without live rate data:", err.message || err);
    }
  } else {
    console.log("FRED_API_KEY not set — skipping live rate data (template copy will be used).");
  }

  let insight = null;
  if (process.env.FIRECRAWL_API_KEY) {
    try {
      insight = await fetchInsight(category.key, process.env.FIRECRAWL_API_KEY);
    } catch (err) {
      console.error("Firecrawl enrichment failed, continuing without a supporting headline:", err.message || err);
    }
  } else {
    console.log("FIRECRAWL_API_KEY not set — skipping supporting headline search.");
  }

  const savings = rate ? savingsFromRateMove(rate, loanAmount) : null;
  const ctx = { date, rate, insight, savings, loanAmount };
  const script = buildScript(category, ctx);
  const brief = buildBrief(category, script, ctx);
  const markdown = briefToMarkdown(brief);

  const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");
  const dataDir = path.join(repoRoot, "web/public/data");
  const briefsDir = path.join(repoRoot, "content/daily-briefs");
  await mkdir(dataDir, { recursive: true });
  await mkdir(briefsDir, { recursive: true });

  await writeFile(path.join(dataDir, "daily-brief.json"), JSON.stringify(brief, null, 2) + "\n");
  await writeFile(path.join(briefsDir, `${brief.date}.md`), markdown);

  console.log(`Generated ${category.label} brief for ${brief.date}`);
  console.log(markdown);

  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `*Today's micro-lesson (${brief.category})*\n\`\`\`${markdown}\`\`\`` }),
      });
      if (!res.ok) throw new Error(`Slack webhook returned ${res.status}`);
      console.log("Posted to Slack.");
    } catch (err) {
      console.error("Slack delivery failed (non-fatal):", err.message || err);
    }
  }

  if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
    try {
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DATABASE_ID },
          properties: {
            Name: { title: [{ text: { content: `${brief.date} - ${brief.category}` } }] },
          },
          children: [
            {
              object: "block",
              type: "code",
              code: { rich_text: [{ text: { content: markdown } }], language: "plain text" },
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Notion API returned ${res.status}`);
      console.log("Posted to Notion.");
    } catch (err) {
      console.error("Notion delivery failed (non-fatal):", err.message || err);
    }
  }
}
