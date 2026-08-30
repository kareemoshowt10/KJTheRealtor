// Pure fetchers for the morning-pulse pipeline. Every source here is either
// a genuinely free public endpoint (no API key, no ToS-violating scrape) or
// clearly marked as needing a credential the user has to supply.
//
// Design note: Zillow's and Redfin's paid "research APIs" don't exist as
// such — Zillow retired its public API in 2021, and Redfin has no public
// API at all. What both companies actually publish for free, no key
// required, is CSV data dumps:
//   Zillow Research  -> https://www.zillow.com/research/data/
//   Redfin Data Center -> https://www.redfin.com/news/data-center/
// Those are large monthly files, not something to refetch every morning —
// see fetchZillowZHVI/fetchRedfinMedianSalePrice below, which pull the
// national-level CSV and read the latest column. Fine for a daily cron;
// don't hammer them more than once a day.

const UA = "kjtherealtor-morning-pulse/1.0 (+https://kareemjamaltherealtor.com)";

async function getText(url, extraHeaders = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...extraHeaders } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

/** Freddie Mac PMMS 30-year fixed rate, published weekly (Thursdays), free CSV, no key. */
export async function fetchMortgageRate30yr() {
  // FRED mirrors Freddie Mac's PMMS series and serves it as a no-key CSV.
  const csv = await getText("https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US");
  const rows = csv.trim().split("\n").slice(1).filter((r) => !r.endsWith(",."));
  const last = rows.at(-1);
  if (!last) throw new Error("MORTGAGE30US: no rows returned");
  const [date, value] = last.split(",");
  return { series: "MORTGAGE30US", date, rate: Number(value) };
}

/** Same source, 15-year fixed — used for the Friday Rate Watch comparison. */
export async function fetchMortgageRate15yr() {
  const csv = await getText("https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE15US");
  const rows = csv.trim().split("\n").slice(1).filter((r) => !r.endsWith(",."));
  const last = rows.at(-1);
  if (!last) throw new Error("MORTGAGE15US: no rows returned");
  const [date, value] = last.split(",");
  return { series: "MORTGAGE15US", date, rate: Number(value) };
}

/** Census housing starts (national), free CSV via FRED, no key required. */
export async function fetchHousingStarts() {
  const csv = await getText("https://fred.stlouisfed.org/graph/fredgraph.csv?id=HOUST");
  const rows = csv.trim().split("\n").slice(1);
  const last = rows.at(-1);
  const prev = rows.at(-2);
  const [date, value] = last.split(",");
  const [, prevValue] = prev.split(",");
  return {
    series: "HOUST",
    date,
    thousandsOfUnits: Number(value),
    momChangePct: Number((((Number(value) - Number(prevValue)) / Number(prevValue)) * 100).toFixed(1)),
  };
}

/**
 * Reddit's read JSON endpoints work unauthenticated with a descriptive
 * User-Agent (Reddit rate-limits/blocks the default one). Pulls today's
 * top posts as raw pain-point signal, not for reposting verbatim.
 */
export async function fetchRedditTop(subreddit, { limit = 10 } = {}) {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=day`;
  const json = JSON.parse(await getText(url));
  return (json.data?.children || []).map((c) => ({
    title: c.data.title,
    score: c.data.score,
    numComments: c.data.num_comments,
    url: `https://reddit.com${c.data.permalink}`,
    flair: c.data.link_flair_text || null,
  }));
}

/** Minimal RSS <item> extractor — deliberately dependency-free, matches the house style. */
export async function fetchRSS(feedUrl, { limit = 10 } = {}) {
  const xml = await getText(feedUrl);
  const items = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  const tag = (block, name) => {
    const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (!m) return null;
    return m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
  };
  for (const block of xml.match(itemRe) || []) {
    items.push({
      title: tag(block, "title"),
      link: tag(block, "link"),
      pubDate: tag(block, "pubDate"),
    });
    if (items.length >= limit) break;
  }
  return items;
}

export const RSS_FEEDS = {
  biggerPockets: "https://www.biggerpockets.com/blog/feed",
  inman: "https://www.inman.com/feed/",
};

/**
 * Google Trends has no free JSON API. `google-trends-api` (npm) scrapes an
 * undocumented endpoint and breaks often; treat trending-term detection as
 * a nice-to-have pulled from the Reddit/RSS titles already in hand rather
 * than a hard dependency. See README "What this does NOT automate."
 */
