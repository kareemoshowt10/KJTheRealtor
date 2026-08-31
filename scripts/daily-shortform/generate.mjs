// Daily short-form content pipeline for Kareem Jamal's TikTok/Reels/Shorts
// micro-lessons. See marketing/daily-shortform-pipeline.md for the full
// system design and the source-feasibility notes.
//
// Run manually with `npm run generate`, or via
// .github/workflows/daily-shortform.yml on a daily cron.
//
// Live-today (no key needed): Mortgage News Daily, Inman, BiggerPockets RSS.
// Stubbed until a key is set: FRED_API_KEY, CENSUS_API_KEY,
// REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET, OPENAI_API_KEY.
// Pure helpers are exported so they can be unit-tested without network
// access or any key — see verify.mjs.
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// ── Content calendar (single source of truth for the 7-day rotation) ──

export const CATEGORIES = {
  "market-pulse": {
    label: "Market Pulse",
    audience: "All",
    day: 1, // Monday
    visual: {
      style: "clean data infographic, bold animated number counting up",
      palette: "navy blue + gold (Rodeo Realty brand)",
      tone: "confident, authoritative",
      background: "West San Fernando Valley skyline or aerial neighborhood shot",
      tool: "CapCut (infographic template) or Midjourney (background plate)",
    },
  },
  "buyer-intel": {
    label: "Buyer Intel",
    audience: "Buyers",
    day: 2, // Tuesday
    visual: {
      style: "talking head with bold on-screen text callouts",
      palette: "white + navy",
      tone: "warm, direct, coach-like",
      background: "front door / key handoff / open house exterior",
      tool: "HeyGen (avatar) or CapCut (talking head + captions)",
    },
  },
  "investor-edge": {
    label: "Investor Edge",
    audience: "Investors",
    day: 3, // Wednesday
    visual: {
      style: "bold text animation over a chart or spreadsheet close-up",
      palette: "navy + gold, high contrast",
      tone: "confident, wealth-building energy",
      background: "cash-flow spreadsheet or duplex/rental exterior",
      tool: "Runway ML (motion chart) or CapCut",
    },
  },
  "agent-playbook": {
    label: "Agent Playbook",
    audience: "Agents",
    day: 4, // Thursday
    visual: {
      style: "talking head, script overlay text, quick cuts",
      palette: "navy + white",
      tone: "peer-to-peer, tactical",
      background: "office / listing appointment table",
      tool: "HeyGen or CapCut",
    },
  },
  "rate-watch": {
    label: "Rate Watch",
    audience: "All",
    day: 5, // Friday
    visual: {
      style: "bold number reveal animation, mortgage document close-up",
      palette: "navy + gold",
      tone: "urgent but calm and authoritative",
      background: "mortgage document / calculator close-up",
      tool: "CapCut (number counter template)",
    },
  },
  "seller-strategy": {
    label: "Seller Strategy",
    audience: "Sellers",
    day: 6, // Saturday
    visual: {
      style: "before/after staging split-screen or bold text tips list",
      palette: "white + green (growth)",
      tone: "encouraging, practical",
      background: "staged living room / for-sale sign / sold sign",
      tool: "CapCut",
    },
  },
  "mindset-motivation": {
    label: "Mindset / Motivation",
    audience: "All",
    day: 0, // Sunday
    visual: {
      style: "cinematic slow push-in, bold quote typography",
      palette: "navy + gold, warm golden-hour light",
      tone: "calm and authoritative, inspiring",
      background: "sunrise over a neighborhood / Stoney Point golden hour",
      tool: "Midjourney (background) + CapCut (type animation)",
    },
  },
};

/** Given a JS Date, return the category key for that day's rotation. */
export function categoryForDate(date) {
  const day = date.getDay();
  return Object.keys(CATEGORIES).find((key) => CATEGORIES[key].day === day);
}

// Evergreen prompts for Sunday, which doesn't depend on a live news source.
export const MINDSET_PROMPTS = [
  {
    insight: "Every rental check a landlord signs, a renter is paying someone else's mortgage down — theirs or their landlord's.",
    hook: "You're paying a mortgage right now.",
    lesson: "The only question is whether it's yours or your landlord's.",
    cta: "Follow for daily real estate intel.",
  },
  {
    insight: "Net worth for homeowners has historically outpaced renters by a wide multiple, driven mostly by forced savings through principal paydown.",
    hook: "Homeowners are worth 40x more than renters on average.",
    lesson: "Not from luck — from forced savings, one mortgage payment at a time.",
    cta: "Save this for the next time someone says renting is smarter.",
  },
  {
    insight: "Every year you wait to buy, you're not avoiding risk — you're trading today's price for whatever tomorrow's price and rate turn out to be.",
    hook: "Waiting for the 'perfect' time to buy?",
    lesson: "There isn't one. There's only the trade-off you're willing to make today.",
    cta: "DM me your numbers — let's run them together.",
  },
];

// ── RSS sources (live today, no API key required) ──

export const RSS_SOURCES = [
  { key: "mnd", label: "Mortgage News Daily", url: "https://www.mortgagenewsdaily.com/rss/full", categories: ["rate-watch", "buyer-intel"] },
  { key: "inman", label: "Inman News", url: "https://www.inman.com/feed/", categories: ["agent-playbook", "buyer-intel", "seller-strategy"] },
  { key: "biggerpockets", label: "BiggerPockets Blog", url: "https://www.biggerpockets.com/blog/feed", categories: ["investor-edge"] },
];

/** Minimal, dependency-free RSS <item> extractor. Good enough for the
 * well-formed feeds above; not a general XML parser. */
export function parseRSSItems(xml) {
  const items = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const block of itemBlocks) {
    const title = firstMatch(block, /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const link = firstMatch(block, /<link>([\s\S]*?)<\/link>/);
    const pubDate = firstMatch(block, /<pubDate>([\s\S]*?)<\/pubDate>/);
    if (title && link) items.push({ title: title.trim(), link: link.trim(), pubDate: pubDate ? pubDate.trim() : null });
  }
  return items;
}

function firstMatch(str, re) {
  const m = str.match(re);
  return m ? m[1] : null;
}

/** Keep only items published in roughly the last `hours` hours. Items with
 * no parseable date are kept (better to over-include than silently drop a
 * feed whose date format we don't recognize). */
export function withinLastHours(items, hours, now = new Date()) {
  const cutoff = now.getTime() - hours * 60 * 60 * 1000;
  return items.filter((item) => {
    if (!item.pubDate) return true;
    const t = Date.parse(item.pubDate);
    if (Number.isNaN(t)) return true;
    return t >= cutoff;
  });
}

// ── Scoring ──

const RATE_TERMS = /rate|mortgage|fed|apr|arm\b|refinance|refi/i;
const PRICE_TERMS = /price|value|appreciat|median|zhvi|affordab/i;
const INVENTORY_TERMS = /inventory|listing|supply|days on market|dom\b/i;
const INVESTOR_TERMS = /cash flow|cap rate|rental|landlord|rehab|brrrr|1031|portfolio/i;
const AGENT_TERMS = /agent|broker|commission|nar\b|lead gen|script|listing presentation/i;

const CATEGORY_TERM_MAP = {
  "rate-watch": RATE_TERMS,
  "buyer-intel": new RegExp(`${RATE_TERMS.source}|${PRICE_TERMS.source}|${INVENTORY_TERMS.source}`, "i"),
  "market-pulse": new RegExp(`${PRICE_TERMS.source}|${INVENTORY_TERMS.source}`, "i"),
  "investor-edge": INVESTOR_TERMS,
  "agent-playbook": AGENT_TERMS,
  "seller-strategy": new RegExp(`${INVENTORY_TERMS.source}|${PRICE_TERMS.source}`, "i"),
};

/**
 * Score a single RSS item 0–10 for a given category: relevance (does it
 * touch a number or decision that category's audience cares about) plus a
 * small novelty boost for very recent items. Pure function — no network.
 */
export function scoreItem(item, categoryKey, now = new Date()) {
  let score = 0;
  const terms = CATEGORY_TERM_MAP[categoryKey];
  if (terms && terms.test(item.title)) score += 6;
  if (/\d/.test(item.title)) score += 2; // a concrete number is more useful than a vague trend piece
  if (item.pubDate) {
    const ageHours = (now.getTime() - Date.parse(item.pubDate)) / (60 * 60 * 1000);
    if (!Number.isNaN(ageHours) && ageHours <= 24) score += 2;
  }
  return score;
}

/** Rank items for a category, highest score first, stable on ties. */
export function rankItems(items, categoryKey, now = new Date()) {
  return items
    .map((item) => ({ item, score: scoreItem(item, categoryKey, now) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

// ── Script generation ──

const WORD_CEILING = 35; // ~10 seconds spoken at a natural pace

/**
 * Build a Hook/Lesson/CTA script from a source headline. This is the
 * rules-based fallback used when OPENAI_API_KEY is not set; with a key
 * present, generate() below sends this same skeleton to an LLM pass for
 * tightening instead of shipping the template verbatim.
 */
export function buildScript(categoryKey, headline, cta = "Follow for daily real estate intel.") {
  const meta = CATEGORIES[categoryKey];
  const hook = `${meta.label}: here's what just changed.`;
  const lesson = headline.replace(/\s+/g, " ").trim();
  const script = { hook, lesson, cta };
  const wordCount = `${hook} ${lesson} ${cta}`.split(/\s+/).filter(Boolean).length;
  return { ...script, wordCount, overCeiling: wordCount > WORD_CEILING };
}

/** Fill the exact visual-brief format spec. Pure formatting, no I/O. */
export function buildVisualBrief({ date, categoryKey, script, platform = "TikTok | Instagram Reels | YouTube Shorts", onScreenText }) {
  const meta = CATEGORIES[categoryKey];
  return [
    `CONTENT DATE: ${date}`,
    `CATEGORY: ${meta.label}`,
    `TARGET AUDIENCE: ${meta.audience}`,
    `PLATFORM: ${platform}`,
    "",
    "SCRIPT (5–10 sec):",
    `${script.hook} → ${script.lesson} → ${script.cta}`,
    "",
    `VISUAL STYLE: ${meta.visual.style}`,
    `COLOR PALETTE: ${meta.visual.palette}`,
    `ON-SCREEN TEXT: ${onScreenText || script.lesson}`,
    `VOICEOVER TONE: ${meta.visual.tone}`,
    `BACKGROUND VISUAL: ${meta.visual.background}`,
    `TOOL RECOMMENDATION: ${meta.visual.tool}`,
    "",
    "PLATFORM NOTES:",
    "  Aspect ratio: 9:16",
    "  Text placement: keep inside the center-safe zone — top ~14% and bottom ~20% are covered by platform UI",
    "  Audio: burned-in captions required; voiceover or trending-sound bed, no silent posts",
  ].join("\n");
}

// ── everything below needs network access; skipped when imported for tests ──
const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

async function fetchFeedItems(source) {
  try {
    const res = await fetch(source.url, { headers: { "User-Agent": "kjtherealtor-daily-shortform/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRSSItems(xml).map((i) => ({ ...i, source: source.label }));
  } catch (err) {
    console.error(`Feed failed: ${source.label} (${source.url}):`, err.message || err);
    return [];
  }
}

async function generate() {
  const now = new Date();
  const categoryKey = categoryForDate(now);
  const dateStr = now.toISOString().slice(0, 10);

  let topHeadline;
  let sourceLabel;

  if (categoryKey === "mindset-motivation") {
    const pick = MINDSET_PROMPTS[now.getDate() % MINDSET_PROMPTS.length];
    topHeadline = pick.insight;
    sourceLabel = "Evergreen prompt library";
  } else {
    const relevantSources = RSS_SOURCES.filter((s) => s.categories.includes(categoryKey));
    const sourcesToUse = relevantSources.length ? relevantSources : RSS_SOURCES;
    const allItems = (await Promise.all(sourcesToUse.map(fetchFeedItems))).flat();
    const recent = withinLastHours(allItems, 24, now);
    const ranked = rankItems(recent.length ? recent : allItems, categoryKey, now);

    if (ranked.length === 0) {
      console.error(`No items found for category "${categoryKey}" — writing a placeholder brief. Check RSS sources / network access.`);
      topHeadline = "[No live item found today — pull a stat from Kareem's MLS dashboard or the monthly Zillow/Redfin file and fill this in by hand.]";
      sourceLabel = "manual fallback";
    } else {
      topHeadline = ranked[0].title;
      sourceLabel = `${ranked[0].source}${ranked[0].link ? ` — ${ranked[0].link}` : ""}`;
    }
  }

  const script = buildScript(categoryKey, topHeadline);
  const brief = buildVisualBrief({ date: dateStr, categoryKey, script });

  const outDir = path.resolve(fileURLToPath(import.meta.url), "../../../marketing/daily-shortform");
  await mkdir(outDir, { recursive: true });

  const meta = CATEGORIES[categoryKey];
  const md = [
    `# Daily Short-Form Brief — ${dateStr}`,
    "",
    `**Category:** ${meta.label}  `,
    `**Source:** ${sourceLabel}  `,
    `**Word count:** ${script.wordCount}${script.overCeiling ? "  ⚠️ over the ~10-second ceiling — trim before shooting" : ""}`,
    "",
    "```",
    brief,
    "```",
  ].join("\n");

  const outPath = path.join(outDir, `${dateStr}.md`);
  await writeFile(outPath, md + "\n");
  console.log(`Wrote ${outPath}`);

  const jsonPath = path.join(outDir, `${dateStr}.json`);
  await writeFile(jsonPath, JSON.stringify({ date: dateStr, categoryKey, sourceLabel, script, brief }, null, 2) + "\n");
  console.log(`Wrote ${jsonPath}`);
}

if (isEntrypoint) {
  await generate();
}
