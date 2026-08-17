// Refreshes web/public/data/market-pulse-<slug>.json for the community pages.
//
// IMPORTANT: output goes to web/public/data/ — that is the directory Vercel
// actually serves. An earlier version wrote to a repo-root data/ folder that
// sits outside the build root, so every widget fetch 404'd and the feature
// never rendered in production. Keep the output path inside web/public.
//
// Run manually with FIRECRAWL_API_KEY set, or via .github/workflows/market-pulse.yml
// on a weekly cron. Pure helpers are exported so they can be unit-tested
// without an API key (see verify.mjs).
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Every community with a page on the site. `slug` matches the widget's
 * data-pulse attribute and the output filename. `terms` are the tokens a
 * headline must plausibly touch to count as local — without this gate the
 * search happily returned a Malibu arts festival for Simi Valley.
 */
export const AREAS = [
  { slug: "91311", place: "Chatsworth", terms: ["chatsworth", "91311", "porter ranch", "northwest valley"] },
  { slug: "91304", place: "West Hills Canoga Park", terms: ["west hills", "canoga park", "91304"] },
  { slug: "93063", place: "Simi Valley", terms: ["simi valley", "93063", "ventura county"] },
  { slug: "woodland-hills", place: "Woodland Hills", terms: ["woodland hills", "warner center", "91364", "91367"] },
  { slug: "calabasas", place: "Calabasas", terms: ["calabasas", "91302", "las virgenes"] },
  { slug: "hidden-hills", place: "Hidden Hills", terms: ["hidden hills", "91302"] },
  { slug: "encino", place: "Encino", terms: ["encino", "91316", "91436"] },
  { slug: "northridge", place: "Northridge", terms: ["northridge", "91324", "91325", "csun", "cal state northridge"] },
  { slug: "west-hills", place: "West Hills", terms: ["west hills", "91307", "91304"] },
  { slug: "porter-ranch", place: "Porter Ranch", terms: ["porter ranch", "91326", "aliso canyon", "northwest valley"] },
  { slug: "granada-hills", place: "Granada Hills", terms: ["granada hills", "91344", "91394", "knollwood"] },
  { slug: "tarzana", place: "Tarzana", terms: ["tarzana", "91356", "ventura boulevard"] },
  { slug: "reseda", place: "Reseda", terms: ["reseda", "91335", "west van nuys"] },
];

/**
 * Homeowner-relevant, not tourist-relevant. The previous query set asked for
 * "community events festival park news", which is why the widget surfaced
 * things a homeowner has no stake in. These ask about the decisions and
 * conditions that actually move a property's value or carrying cost.
 */
export const QUERY_ANGLES = [
  (place) => `${place} California city council housing development planning approval`,
  (place) => `${place} California homeowners property insurance fire zone school district`,
];

/** Topics worth surfacing to a homeowner. A hit must match locality AND one of these. */
const RELEVANCE =
  /housing|home|homeowner|property|real estate|develop|construction|build|zoning|planning|permit|council|city hall|school|district|insurance|fire|brush|defensible|tax|assessment|infrastructure|road|traffic|water|utility|park|library|renovat|adu|market/i;

/**
 * The widget sits next to "this is your hometown" copy — keep grim or
 * anxiety-inducing headlines out of it entirely.
 */
export const DENYLIST =
  /murder|homicide|kill|shooting|shot|stab|assault|rape|robbery|burglar|carjack|kidnap|arrest|suspect|felony|dead|death|dies|died|fatal|crash|collision|evacuat|virus|west nile|outbreak|epidemic|disease|infection|overdose|lawsuit|scandal|fraud|bankrupt|arson|looting/i;

/** Normalize a raw search hit into an item, or null if it fails any gate. */
export function toItem(hit, terms) {
  if (!hit || !hit.url || !hit.title) return null;
  const title = String(hit.title).trim();
  if (title.length < 25) return null;
  if (DENYLIST.test(title)) return null;

  // Locality gate: the headline or the URL must actually name the place.
  const haystack = `${title} ${hit.url}`.toLowerCase();
  if (!terms.some((t) => haystack.includes(t))) return null;

  // Usefulness gate: it has to be about something a homeowner has a stake in.
  if (!RELEVANCE.test(title)) return null;

  return { title, url: hit.url, date: hit.date || null };
}

/** Drop near-duplicate stories (same event covered by two outlets). */
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

// ── everything below needs the API key; skipped when imported for tests ──
const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntrypoint) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error("FIRECRAWL_API_KEY is not set. Copy .env.example to .env and fill in a key from firecrawl.dev.");
    process.exit(1);
  }
  const { Firecrawl } = await import("firecrawl");
  const client = new Firecrawl({ apiKey });

  const dataDir = path.resolve(fileURLToPath(import.meta.url), "../../../web/public/data");
  await mkdir(dataDir, { recursive: true });

  for (const { slug, place, terms } of AREAS) {
    const collected = [];
    for (const angle of QUERY_ANGLES) {
      try {
        const result = await client.search(angle(place), { sources: ["news"], limit: 10, tbs: "qdr:m" });
        const hits = result.news && result.news.length ? result.news : result.web || [];
        collected.push(...hits.map((h) => toItem(h, terms)).filter(Boolean));
      } catch (err) {
        console.error(`Search failed for ${slug} (${angle(place)}):`, err.message || err);
      }
    }
    const items = dedupe(collected).slice(0, 3);
    const payload = { slug, place, generatedAt: new Date().toISOString(), items };
    const outPath = path.join(dataDir, `market-pulse-${slug}.json`);
    await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n");
    console.log(`${slug}: wrote ${items.length} item(s) -> ${outPath}`);
  }
}
