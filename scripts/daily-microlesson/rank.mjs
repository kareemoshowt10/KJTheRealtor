// Pure scoring + rotation logic for the daily micro-lesson pipeline.
// Kept dependency-free and API-key-free so verify.mjs can exercise it in CI.

/**
 * The 7-day rotation. `audience` and `keywords` steer which of the day's
 * scraped items gets picked; `contentTypeDefault` is the fallback tag when
 * classifyContentType() can't tell from the item text alone.
 */
export const ROTATION = [
  // index = Date#getDay() -> 0 is Sunday
  {
    key: "mindset",
    day: "Sunday",
    label: "Mindset / Motivation",
    audience: "All",
    keywords: ["wealth", "mindset", "discipline", "patience", "principle", "habit", "success", "long-term", "generational"],
    preferredSources: ["reddit", "biggerpockets"],
    contentTypeDefault: "MINDSET/INSPIRATION",
  },
  {
    key: "market-pulse",
    day: "Monday",
    label: "Market Pulse",
    audience: "All",
    keywords: ["median", "inventory", "days on market", "price cut", "price drop", "listings", "demand", "competitive"],
    preferredSources: ["redfin", "zillow", "mls"],
    contentTypeDefault: "DATA STAT",
  },
  {
    key: "buyer-intel",
    day: "Tuesday",
    label: "Buyer Intel",
    audience: "Buyers",
    keywords: ["buyer", "afford", "down payment", "pre-approval", "offer", "contingency", "first-time"],
    preferredSources: ["reddit", "nar", "zillow"],
    contentTypeDefault: "ACTIONABLE TIP",
  },
  {
    key: "investor-edge",
    day: "Wednesday",
    label: "Investor Edge",
    audience: "Investors",
    keywords: ["cash flow", "cap rate", "adu", "rental", "equity", "1031", "leverage", "roi", "appreciation"],
    preferredSources: ["biggerpockets", "census"],
    contentTypeDefault: "ACTIONABLE TIP",
  },
  {
    key: "agent-playbook",
    day: "Thursday",
    label: "Agent Playbook",
    audience: "Agents",
    keywords: ["listing", "commission", "script", "objection", "lead", "negotiat", "client", "close"],
    preferredSources: ["inman", "reddit"],
    contentTypeDefault: "ACTIONABLE TIP",
  },
  {
    key: "rate-watch",
    day: "Friday",
    label: "Rate Watch",
    audience: "All",
    keywords: ["mortgage rate", "30-year", "15-year", "arm", "fed", "basis point", "refinance", "apr"],
    preferredSources: ["mortgage-news-daily", "fed"],
    contentTypeDefault: "DATA STAT",
  },
  {
    key: "seller-strategy",
    day: "Saturday",
    label: "Seller Strategy",
    audience: "Sellers",
    keywords: ["seller", "list price", "staging", "repairs", "days on market", "sold over asking", "concession"],
    preferredSources: ["mls", "redfin", "zillow"],
    contentTypeDefault: "ACTIONABLE TIP",
  },
];

/** Category for a given Date (defaults to the runtime clock's day). */
export function categoryForDate(date = new Date()) {
  return ROTATION[date.getDay()];
}

const NUMERIC = /\$[\d,.]+|\d+(\.\d+)?%|\d+(\.\d+)?\s*(bps|basis points?)/i;
const MINDSET_WORDS = /mindset|discipline|patience|habit|principle|wealth-build|generational|legacy/i;
const TIP_WORDS = /\bhow to\b|\btip\b|\bshould\b|\bdo this\b|\bavoid\b|\bbefore you\b|\bstrategy\b/i;

/** Tag an item DATA STAT | ACTIONABLE TIP | MINDSET/INSPIRATION from its text. */
export function classifyContentType(item, category) {
  const text = `${item.title} ${item.snippet || ""}`;
  if (MINDSET_WORDS.test(text)) return "MINDSET/INSPIRATION";
  if (NUMERIC.test(text)) return "DATA STAT";
  if (TIP_WORDS.test(text)) return "ACTIONABLE TIP";
  return category.contentTypeDefault;
}

const SOURCE_WEIGHTS = {
  zillow: 3,
  redfin: 3,
  mls: 3,
  "mortgage-news-daily": 3,
  fed: 3,
  census: 2,
  nar: 3,
  "google-trends": 2,
  reddit: 2,
  biggerpockets: 2,
  inman: 2,
};

/** Hours between now and the item's date; large fallback for undated items. */
function ageHours(item, now) {
  if (!item.date) return 999;
  const t = Date.parse(item.date);
  if (Number.isNaN(t)) return 999;
  return Math.max(0, (now - t) / 36e5);
}

/**
 * Score one item for a category: recency + audience-keyword match + source
 * weight (boosted when the source is one of the category's preferred ones) +
 * a bonus for carrying an actual number, since a sourced stat beats a vague
 * headline for a 5-10 second script.
 */
export function scoreItem(item, category, now = new Date()) {
  const text = `${item.title} ${item.snippet || ""}`.toLowerCase();

  const recency = Math.max(0, 5 - ageHours(item, now) / 24); // full 24h window = up to +5, decays to 0 by day 5
  const keywordHits = category.keywords.filter((k) => text.includes(k)).length;
  const audienceMatch = Math.min(keywordHits * 2, 6);
  const baseWeight = SOURCE_WEIGHTS[item.source] || 1;
  const preferredBoost = category.preferredSources.includes(item.source) ? 2 : 0;
  const numericBonus = NUMERIC.test(text) ? 2 : 0;

  return recency + audienceMatch + baseWeight + preferredBoost + numericBonus;
}

/** Drop near-duplicate stories (same event covered by two outlets). */
export function dedupe(items) {
  const kept = [];
  const words = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
  for (const item of items) {
    const w = new Set(words(item.title));
    const isDupe = kept.some((prev) => {
      const pw = words(prev.title);
      const overlap = pw.filter((x) => w.has(x)).length;
      return overlap >= 4 || (pw.length > 0 && overlap / pw.length > 0.6);
    });
    if (!isDupe) kept.push(item);
  }
  return kept;
}

/**
 * Rank every collected item for today's category and return them best-first
 * with their score attached, so a human reviewer can see *why* #1 won and
 * skim #2/#3 as backups in under a minute.
 */
export function rank(items, category, now = new Date()) {
  return dedupe(items.filter((i) => i && i.title))
    .map((item) => ({ ...item, score: scoreItem(item, category, now), contentType: classifyContentType(item, category) }))
    .sort((a, b) => b.score - a.score);
}
