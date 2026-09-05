// Pure data-shaping helpers for the daily micro-lesson pipeline: what to
// search for per content category, and how to filter/score/dedupe what
// comes back. No network calls live here — generate.mjs does the fetching
// and imports these — so this whole file (and its behavior) is testable
// from verify.mjs without an API key, same split as scripts/market-pulse.
//
// SOURCE COVERAGE — read this before wiring new feeds in.
// Zillow, Redfin, and MLS/CRMLS all gate their bulk data behind paid
// partner agreements; NAR and Census publish through report pages and
// dashboards, not a clean public API. None of that is scrapeable honestly
// through a search API. What Firecrawl *can* reach today is the public web:
// rate desks, RSS-syndicated trade press, and open forums. So Phase 1 below
// covers Rate Watch, Buyer/Investor/Seller/Agent commentary, and community
// sentiment — real, sourced, dated. Market Pulse (Zillow/Redfin/MLS-grade
// stats) stays search-sourced and clearly labeled until a licensed feed is
// wired in — see the "Phase 2" section of marketing/daily-content-automation-system.md.

/** Search queries per content category. Each carries a citable `source` label. */
export const CATEGORY_QUERIES = {
  "Market Pulse": [
    { query: "national median home price inventory days on market this month", source: "Redfin Data Center / Zillow Research" },
    { query: "San Fernando Valley Los Angeles housing market report this month", source: "Local MLS / CRMLS coverage" },
  ],
  "Buyer Intel": [
    { query: "site:reddit.com first time home buyer question 2026", source: "r/FirstTimeHomeBuyer" },
    { query: "home buyer tips current mortgage rates inventory this week", source: "Inman News" },
  ],
  "Investor Edge": [
    { query: "site:biggerpockets.com blog ADU cash flow real estate investing", source: "BiggerPockets Blog" },
    { query: "site:reddit.com realestateinvesting cash flow question 2026", source: "r/realestateinvesting" },
  ],
  "Agent Playbook": [
    { query: "site:inman.com agent tactic listing objection script", source: "Inman News" },
  ],
  "Rate Watch": [
    { query: "mortgage news daily 30 year fixed rate today", source: "Mortgage News Daily" },
    { query: "federal reserve mortgage rate this week", source: "Federal Reserve / Freddie Mac PMMS" },
  ],
  "Seller Strategy": [
    { query: "home seller pricing strategy market this month price cuts", source: "Redfin Data Center / Zillow Research" },
  ],
  "Mindset & Motivation": [
    { query: "site:biggerpockets.com blog wealth building real estate mindset", source: "BiggerPockets Blog" },
    { query: "site:reddit.com realestateinvesting first deal lesson", source: "r/realestateinvesting" },
  ],
};

/** Grim, sensational, or off-topic hits never belong in an educational feed. */
export const DENYLIST =
  /murder|homicide|kill|shooting|shot|stab|assault|robbery|burglar|carjack|kidnap|arrest|felony|dead|death|dies|died|fatal|crash|lawsuit|scandal|fraud|bankrupt|scam|arson|foreclosure horror|clickbait/i;

/** A hit has to touch something an audience of buyers/sellers/investors/agents actually cares about. */
const RELEVANCE =
  /rate|mortgage|price|afford|inventory|listing|market|buy|sell|invest|equity|cash flow|adu|down payment|closing|appraisal|escrow|loan|refinance|wealth|tenant|rent|cap rate|comps|days on market/i;

/** Normalize a raw search hit into a candidate, or null if it fails a gate. */
export function toCandidate(hit, category, source) {
  if (!hit || !hit.url || !hit.title) return null;
  const title = String(hit.title).trim();
  if (title.length < 20) return null;
  if (DENYLIST.test(title)) return null;
  if (!RELEVANCE.test(title) && !RELEVANCE.test(hit.description || "")) return null;

  return {
    title,
    url: hit.url,
    snippet: (hit.description || hit.snippet || "").trim(),
    date: hit.date || null,
    source,
    category,
  };
}

/** Drop near-duplicate stories (the same rate move or stat covered by two outlets). */
export function dedupe(items) {
  const kept = [];
  const words = (s) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
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
 * Score a candidate by recency and how squarely it lands in the category's
 * subject matter. Higher is better. This is a heuristic pre-filter, not the
 * final editorial call — it just keeps the LLM prompt small and on-topic
 * when a search returns a wide spread of results.
 */
export function score(item) {
  let s = 0;
  if (item.date) {
    const ageDays = (Date.now() - new Date(item.date).getTime()) / 86_400_000;
    if (Number.isFinite(ageDays)) {
      if (ageDays <= 1) s += 5;
      else if (ageDays <= 7) s += 3;
      else if (ageDays <= 30) s += 1;
    }
  }
  const numberish = /\$[\d,.]+|\d+(\.\d+)?%|\d{3,}/.test(item.title);
  if (numberish) s += 2; // a concrete figure beats a vague headline
  return s;
}

/** Rank candidates best-first; ties keep original (search) order. */
export function rank(items) {
  return [...items]
    .map((item, i) => ({ item, i, s: score(item) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map(({ item }) => item);
}
