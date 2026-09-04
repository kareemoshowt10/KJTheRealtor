// Shared config for the morning short-form content engine.
// Pure data + pure helpers only — no network calls — so verify.mjs can
// exercise all of it without an API key.

/**
 * 7-day rotation (Step 4 of the design doc). Keyed by JS Date#getDay()
 * (0 = Sunday .. 6 = Saturday) so `categoryForDate()` needs no lookup table
 * duplication.
 */
export const CONTENT_CALENDAR = [
  {
    day: "Sunday",
    category: "Mindset/Motivation",
    contentType: "MINDSET/INSPIRATION",
    audience: "All",
    hooks: [
      "Nobody buys a house on a Sunday. Everybody decides to on one.",
      "The house you want is on the other side of a decision you're avoiding.",
      "Wealth in real estate isn't luck. It's boring, repeated discipline.",
    ],
    ctas: ["Follow for daily real estate intel.", "Save this for the week you need it."],
  },
  {
    day: "Monday",
    category: "Market Pulse",
    contentType: "DATA STAT",
    audience: "All",
    hooks: [
      "Here's what actually moved in the housing market last week.",
      "The number every buyer and seller should know this Monday:",
    ],
    ctas: ["Follow for the market number that matters, every Monday.", "Comment your zip for a local read."],
  },
  {
    day: "Tuesday",
    category: "Buyer Intel",
    contentType: "ACTIONABLE TIP",
    audience: "Buyers",
    hooks: [
      "If you're buying right now, do this before you tour another house.",
      "Buyers are leaving leverage on the table. Here's how to take it back.",
    ],
    ctas: ["Follow for daily buyer intel.", "DM me your budget — I'll tell you what it actually buys."],
  },
  {
    day: "Wednesday",
    category: "Investor Edge",
    contentType: "ACTIONABLE TIP",
    audience: "Investors",
    hooks: [
      "The wealth move most homeowners never make:",
      "This is how equity quietly turns into a second property.",
    ],
    ctas: ["Follow for the investor edge nobody explains simply.", "Save this before you refi."],
  },
  {
    day: "Thursday",
    category: "Agent Playbook",
    contentType: "ACTIONABLE TIP",
    audience: "Agents",
    hooks: [
      "Agents: here's the exact line to use on your next listing call.",
      "The script that turns a cold objection into a signed agreement:",
    ],
    ctas: ["Follow for daily scripts that actually work.", "Save this for your next listing appointment."],
  },
  {
    day: "Friday",
    category: "Rate Watch",
    contentType: "DATA STAT",
    audience: "Buyers",
    hooks: [
      "Mortgage rates just moved. Here's what that means for YOU.",
      "This week's rate move, translated into real dollars:",
    ],
    ctas: ["Follow for weekly rate breakdowns.", "Comment your loan amount for the exact math."],
  },
  {
    day: "Saturday",
    category: "Seller Strategy",
    contentType: "ACTIONABLE TIP",
    audience: "Sellers",
    hooks: [
      "Selling this year? Don't list until you've done this.",
      "The pricing mistake that costs sellers the most right now:",
    ],
    ctas: ["Follow for seller strategy every Saturday.", "DM me before you pick a list price."],
  },
];

export function categoryForDate(date = new Date()) {
  return CONTENT_CALENDAR[date.getDay()];
}

/**
 * Step 1 source map. Each entry becomes a Firecrawl `search()` query when
 * FIRECRAWL_API_KEY is present. Kept declarative so new sources are a
 * one-line addition, matching the AREAS/QUERY_ANGLES pattern already used
 * in scripts/market-pulse/generate.mjs.
 */
export const SOURCES_BY_CATEGORY = {
  "Market Pulse": [
    (d) => `Zillow median home price inventory report ${d.getFullYear()}`,
    (d) => `Redfin housing market data days on market price cuts`,
  ],
  "Buyer Intel": [
    () => `first time home buyer tips current housing market`,
    () => `NAR housing affordability index existing home sales`,
  ],
  "Investor Edge": [
    () => `BiggerPockets real estate investing strategy this week`,
    () => `real estate investor cash flow BRRRR house hacking news`,
  ],
  "Agent Playbook": [
    () => `Inman News real estate agent listing script tactic`,
    () => `real estate agent objection handling script 2026`,
  ],
  "Rate Watch": [
    () => `Mortgage News Daily 30 year mortgage rate today`,
    () => `Federal Reserve mortgage rate outlook this week`,
  ],
  "Seller Strategy": [
    () => `home seller pricing strategy current market conditions`,
    () => `Redfin seller competitiveness score housing market`,
  ],
  "Mindset/Motivation": [
    () => `real estate wealth building mindset principle`,
    () => `real estate investing success story lesson`,
  ],
};

/** Keeps sensational/fear-driven language out of a trust-first brand. */
export const DENYLIST =
  /crash(ing)?\b|collapse|doom|plummet|scam|shocking|you won'?t believe|clickbait|bubble burst/i;

/** A hit must at least gesture at housing/finance to count as on-topic. */
export const RELEVANCE =
  /home|hous|mortgage|rate|rent|realtor|real estate|property|buyer|seller|invest|equity|market|afford|inventory|listing|zillow|redfin|nar\b/i;

export function toInsight(hit) {
  if (!hit || !hit.url || !hit.title) return null;
  const title = String(hit.title).trim();
  if (title.length < 20) return null;
  if (DENYLIST.test(title)) return null;
  if (!RELEVANCE.test(title)) return null;
  return { title, url: hit.url, date: hit.date || null, snippet: hit.snippet || hit.description || null };
}

/** Score = recency + specificity (numbers/percent signal a real data point). */
export function scoreInsight(insight) {
  let score = 0;
  if (insight.date) score += 2;
  if (/%|\$[\d,]+|\d+(\.\d+)?\s?(percent|pts?|points)/i.test(insight.title)) score += 3;
  if (insight.snippet) score += 1;
  score += Math.min(insight.title.length / 40, 2); // mild bonus for a fuller headline
  return score;
}

export function rankInsights(insights) {
  return [...insights].sort((a, b) => scoreInsight(b) - scoreInsight(a));
}

/**
 * Deterministic pick from a rotating pool so output varies day to day
 * without needing an LLM call — `seed` is typically the ISO date string.
 */
export function pickFromPool(pool, seed) {
  let hash = 0;
  for (const ch of String(seed)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[hash % pool.length];
}
