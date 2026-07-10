// Refreshes data/market-pulse-<zip>.json for the three zip-code story pages.
// Run manually with FIRECRAWL_API_KEY set, or via .github/workflows/market-pulse.yml on a weekly cron.
import { Firecrawl } from "firecrawl";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("FIRECRAWL_API_KEY is not set. Copy .env.example to .env and fill in a key from firecrawl.dev.");
  process.exit(1);
}

const client = new Firecrawl({ apiKey });

const ZIPS = [
  { zip: "91311", query: "Chatsworth Los Angeles community events festival park news" },
  { zip: "93063", query: "Simi Valley community events festival park news" },
  { zip: "91304", query: "West Hills Canoga Park community events festival park news" },
];

const dataDir = path.resolve(fileURLToPath(import.meta.url), "../../../data");

// The widget sits next to "this is your hometown" copy — keep grim or
// anxiety-inducing headlines out of it entirely.
const DENYLIST =
  /murder|homicide|kill|shooting|shot|stab|assault|rape|robbery|burglar|carjack|kidnap|arrest|suspect|felony|dead|death|dies|died|fatal|crash|collision|wildfire|evacuat|virus|west nile|outbreak|epidemic|disease|infection|overdose|lawsuit|scandal|fraud|bankrupt/i;

function toItem(hit) {
  if (!hit || !hit.url || !hit.title) return null;
  if (DENYLIST.test(hit.title)) return null;
  return { title: hit.title, url: hit.url, date: hit.date || null };
}

// Drop near-duplicate stories (same event covered by two outlets).
function dedupe(items) {
  const kept = [];
  for (const item of items) {
    const words = new Set(
      item.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3)
    );
    const isDupe = kept.some((prev) => {
      const prevWords = prev.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
      const overlap = prevWords.filter((w) => words.has(w)).length;
      return overlap >= 4 || (prevWords.length > 0 && overlap / prevWords.length > 0.6);
    });
    if (!isDupe) kept.push(item);
  }
  return kept;
}

for (const { zip, query } of ZIPS) {
  let items = [];
  try {
    const result = await client.search(query, { sources: ["news"], limit: 10, tbs: "qdr:w" });
    const hits = result.news && result.news.length ? result.news : result.web || [];
    items = dedupe(hits.map(toItem).filter(Boolean)).slice(0, 3);
  } catch (err) {
    console.error(`Search failed for ${zip}:`, err.message || err);
  }

  const payload = { zip, generatedAt: new Date().toISOString(), items };
  const outPath = path.join(dataDir, `market-pulse-${zip}.json`);
  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`${zip}: wrote ${items.length} item(s) -> ${outPath}`);
}
