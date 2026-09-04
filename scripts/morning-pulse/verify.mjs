// Unit-tests the pure logic in config.mjs and generate.mjs. Runs without an
// API key:
//   node scripts/morning-pulse/verify.mjs
import {
  CONTENT_CALENDAR,
  categoryForDate,
  toInsight,
  scoreInsight,
  rankInsights,
  pickFromPool,
  SOURCES_BY_CATEGORY,
} from "./config.mjs";
import { buildScript, buildVisualBrief } from "./generate.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

// ── Calendar coverage ──
check("covers all 7 days", CONTENT_CALENDAR.length, 7);
check("every slot has a category and content type", CONTENT_CALENDAR.every((s) => s.category && s.contentType), true);
check("every slot has a source map entry", CONTENT_CALENDAR.every((s) => Array.isArray(SOURCES_BY_CATEGORY[s.category])), true);
check("Friday is Rate Watch (per the Step 4 rotation)", categoryForDate(new Date("2026-09-04T12:00:00Z")).category, "Rate Watch");
check("Monday is Market Pulse", categoryForDate(new Date("2026-09-07T12:00:00Z")).category, "Market Pulse");
check("Sunday is Mindset/Motivation", categoryForDate(new Date("2026-09-06T12:00:00Z")).category, "Mindset/Motivation");

// ── Insight filtering ──
check(
  "rejects a sensational/fear headline",
  toInsight({ title: "Housing market about to CRASH, experts warn buyers", url: "https://x.com/y" }),
  null
);
check("rejects malformed hits", toInsight({ title: "Mortgage rates drop this week for buyers", url: null }), null);
check("rejects off-topic headlines", toInsight({ title: "Local team wins championship game last night", url: "https://x.com/y" }), null);
check(
  "keeps an on-topic, non-sensational headline",
  toInsight({ title: "30-year mortgage rate falls to 6.2% this week", url: "https://x.com/y" })?.title,
  "30-year mortgage rate falls to 6.2% this week"
);

// ── Scoring / ranking ──
const withStat = { title: "Median home price up 3.2% year over year", date: "2026-09-03" };
const withoutStat = { title: "Homebuyers weigh options in changing market" };
check("a dated headline with a real number scores higher", scoreInsight(withStat) > scoreInsight(withoutStat), true);
check("rankInsights sorts highest score first", rankInsights([withoutStat, withStat])[0], withStat);

// ── Deterministic pool picking ──
const pool = ["a", "b", "c"];
check("pickFromPool is deterministic for the same seed", pickFromPool(pool, "2026-09-04"), pickFromPool(pool, "2026-09-04"));

// ── Script + brief rendering ──
const slot = CONTENT_CALENDAR.find((s) => s.category === "Rate Watch");
const insight = { title: "30-year mortgage rate falls to 6.2% this week", url: "https://example.com/rates" };
const script = buildScript(insight, slot, "2026-09-04");
check("script includes the hook, lesson, and CTA", script.full.includes(script.hook) && script.full.includes(insight.title) && script.full.includes(script.cta), true);

const brief = buildVisualBrief({ date: new Date("2026-09-04T12:00:00Z"), slot, insight, script, isTemplate: false });
check("brief carries the content date", brief.includes("CONTENT DATE: 2026-09-04"), true);
check("brief carries the category", brief.includes("CATEGORY: Rate Watch"), true);
check("brief carries the platform list", brief.includes("TikTok | Instagram Reels | YouTube Shorts"), true);
check("brief carries the content type tag", brief.includes("CONTENT TYPE TAG: DATA STAT"), true);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
