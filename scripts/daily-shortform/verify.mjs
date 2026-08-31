// Unit-tests the pure logic in generate.mjs. Runs without network access or
// any API key:
//   node scripts/daily-shortform/verify.mjs
import {
  CATEGORIES,
  categoryForDate,
  parseRSSItems,
  withinLastHours,
  scoreItem,
  rankItems,
  buildScript,
  buildVisualBrief,
  MINDSET_PROMPTS,
} from "./generate.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

// ── Rotation ──
check("Monday is Market Pulse", categoryForDate(new Date("2026-08-31T12:00:00Z")), "market-pulse"); // Mon
check("Tuesday is Buyer Intel", categoryForDate(new Date("2026-09-01T12:00:00Z")), "buyer-intel");
check("Wednesday is Investor Edge", categoryForDate(new Date("2026-09-02T12:00:00Z")), "investor-edge");
check("Thursday is Agent Playbook", categoryForDate(new Date("2026-09-03T12:00:00Z")), "agent-playbook");
check("Friday is Rate Watch", categoryForDate(new Date("2026-09-04T12:00:00Z")), "rate-watch");
check("Saturday is Seller Strategy", categoryForDate(new Date("2026-09-05T12:00:00Z")), "seller-strategy");
check("Sunday is Mindset/Motivation", categoryForDate(new Date("2026-08-30T12:00:00Z")), "mindset-motivation");
check("every category maps to a unique weekday", new Set(Object.values(CATEGORIES).map((c) => c.day)).size, 7);

// ── RSS parsing ──
const sampleXml = `<rss><channel>
  <item><title>30-year rates drop to 6.5%</title><link>https://example.com/a</link><pubDate>Mon, 31 Aug 2026 06:00:00 GMT</pubDate></item>
  <item><title><![CDATA[Inventory rises in the Valley]]></title><link>https://example.com/b</link><pubDate>Mon, 31 Aug 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`;
const parsed = parseRSSItems(sampleXml);
check("parses two RSS items", parsed.length, 2);
check("unwraps CDATA titles", parsed[1].title, "Inventory rises in the Valley");
check("extracts link", parsed[0].link, "https://example.com/a");

// ── Recency filter ──
const now = new Date("2026-08-31T12:00:00Z");
const items = [
  { title: "fresh", pubDate: "Mon, 31 Aug 2026 06:00:00 GMT" }, // 6h old
  { title: "stale", pubDate: "Tue, 25 Aug 2026 06:00:00 GMT" }, // way old
  { title: "undated", pubDate: null }, // kept by design
];
check("drops stale, keeps fresh and undated", withinLastHours(items, 24, now).map((i) => i.title), ["fresh", "undated"]);

// ── Scoring ──
check(
  "rate headline scores higher for rate-watch than an unrelated one",
  scoreItem({ title: "Mortgage rates fall to 6.5% this week", pubDate: null }, "rate-watch", now) >
    scoreItem({ title: "Local park renovation completed", pubDate: null }, "rate-watch", now),
  true
);
check(
  "a headline with a number outranks one without, same category",
  scoreItem({ title: "Inventory up 12% in the Valley", pubDate: null }, "market-pulse", now) >
    scoreItem({ title: "Inventory rising in the Valley", pubDate: null }, "market-pulse", now),
  true
);

// ── Ranking ──
const ranked = rankItems(
  [
    { title: "Local bakery opens downtown", pubDate: null },
    { title: "Cap rate compresses as investors chase yield", pubDate: null },
  ],
  "investor-edge",
  now
);
check("investor-relevant headline ranks first", ranked[0].title, "Cap rate compresses as investors chase yield");

// ── Script building ──
const script = buildScript("rate-watch", "30-year mortgage rates drop to 6.5% this week, the lowest since March");
check("script has hook/lesson/cta", Object.keys(script).sort(), ["cta", "hook", "lesson", "overCeiling", "wordCount"].sort());
check("short headline stays under the 10-second word ceiling", script.overCeiling, false);

const longScript = buildScript(
  "rate-watch",
  "This is a deliberately long headline written to blow past the ten second spoken word ceiling that the pipeline enforces so the over-ceiling flag actually trips in this test case here"
);
check("very long headline trips the over-ceiling flag", longScript.overCeiling, true);

// ── Visual brief formatting ──
const brief = buildVisualBrief({ date: "2026-08-31", categoryKey: "market-pulse", script });
check("brief names the category", brief.includes("CATEGORY: Market Pulse"), true);
check("brief carries the content date", brief.includes("CONTENT DATE: 2026-08-31"), true);
check("brief fixes aspect ratio to 9:16", brief.includes("Aspect ratio: 9:16"), true);

// ── Config sanity ──
check("mindset prompts all have hook/lesson/cta", MINDSET_PROMPTS.every((p) => p.hook && p.lesson && p.cta), true);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
