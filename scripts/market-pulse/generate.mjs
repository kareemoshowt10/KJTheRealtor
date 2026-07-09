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
  { zip: "91311", query: "Chatsworth Los Angeles neighborhood council news this week" },
  { zip: "93063", query: "Simi Valley community news events this week" },
  { zip: "91304", query: "West Hills Canoga Park Los Angeles community news this week" },
];

const dataDir = path.resolve(fileURLToPath(import.meta.url), "../../../data");

function toItem(hit) {
  if (!hit || !hit.url || !hit.title) return null;
  return { title: hit.title, url: hit.url, date: hit.date || null };
}

for (const { zip, query } of ZIPS) {
  let items = [];
  try {
    const result = await client.search(query, { sources: ["news"], limit: 5, tbs: "qdr:w" });
    const hits = result.news && result.news.length ? result.news : result.web || [];
    items = hits.map(toItem).filter(Boolean).slice(0, 3);
  } catch (err) {
    console.error(`Search failed for ${zip}:`, err.message || err);
  }

  const payload = { zip, generatedAt: new Date().toISOString(), items };
  const outPath = path.join(dataDir, `market-pulse-${zip}.json`);
  await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`${zip}: wrote ${items.length} item(s) -> ${outPath}`);
}
