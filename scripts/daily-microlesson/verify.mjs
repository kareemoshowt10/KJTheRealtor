// Unit-tests the pure logic in rank.mjs and script-writer.mjs. Runs without
// any API key:
//   node scripts/daily-microlesson/verify.mjs
import { ROTATION, categoryForDate, classifyContentType, scoreItem, dedupe, rank } from "./rank.mjs";
import { buildPrompt, parseModelJSON, assemble, renderMarkdown } from "./script-writer.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

// ── Rotation ──
check("covers all 7 days", ROTATION.length, 7);
check("every slot has a unique key", new Set(ROTATION.map((r) => r.key)).size, 7);
check("Monday is Market Pulse", categoryForDate(new Date("2026-09-07T12:00:00Z")).label, "Market Pulse"); // a Monday
check("Sunday is Mindset / Motivation", categoryForDate(new Date("2026-09-06T12:00:00Z")).label, "Mindset / Motivation"); // a Sunday
check("Friday is Rate Watch", categoryForDate(new Date("2026-09-04T12:00:00Z")).label, "Rate Watch");

// ── classifyContentType ──
const marketPulse = ROTATION.find((r) => r.key === "market-pulse");
const mindset = ROTATION.find((r) => r.key === "mindset");
check(
  "tags a percentage/dollar item as DATA STAT",
  classifyContentType({ title: "Median home price up 3.2% to $612,000 in the Valley" }, marketPulse),
  "DATA STAT"
);
check(
  "tags a mindset-worded item as MINDSET/INSPIRATION even on a data day",
  classifyContentType({ title: "The discipline that builds generational wealth in real estate" }, marketPulse),
  "MINDSET/INSPIRATION"
);
check(
  "tags a how-to item as ACTIONABLE TIP",
  classifyContentType({ title: "How to avoid overpaying on your next offer" }, mindset),
  "ACTIONABLE TIP"
);
check("falls back to the day's default when nothing matches", classifyContentType({ title: "Local council meeting recap" }, marketPulse), "DATA STAT");

// ── scoreItem ──
const now = new Date("2026-09-07T12:00:00Z");
const fresh = { source: "redfin", title: "Redfin: inventory up 12% this month", date: "2026-09-07T00:00:00Z" };
const stale = { source: "redfin", title: "Redfin: inventory up 12% this month", date: "2026-01-01T00:00:00Z" };
check("a fresh item outscores an otherwise-identical stale one", scoreItem(fresh, marketPulse, now) > scoreItem(stale, marketPulse, now), true);

const onTopic = { source: "zillow", title: "Zillow: median days on market falls to 28", date: "2026-09-07T00:00:00Z" };
const offTopic = { source: "inman", title: "Agent conference recap: five takeaways", date: "2026-09-07T00:00:00Z" };
check("a preferred-source, on-keyword item outscores an off-topic one", scoreItem(onTopic, marketPulse, now) > scoreItem(offTopic, marketPulse, now), true);

// ── dedupe (same shape as market-pulse's) ──
const deduped = dedupe([
  { title: "Mortgage rates fall to lowest level in eighteen months this week" },
  { title: "This week mortgage rates fall to their lowest level in eighteen months" },
  { title: "Census permits data shows housing starts climbing in the Sun Belt" },
]);
check("collapses the same story reported two ways", deduped.length, 2);

// ── rank ──
const ranked = rank([onTopic, offTopic, { title: "" }, null], marketPulse, now);
check("rank drops empty/null items and sorts best-first", ranked[0].title, onTopic.title);
check("rank output length excludes junk", ranked.length, 2);

// ── script-writer: prompt building stays fact-bound ──
const prompt = buildPrompt({ item: { title: "Rate drops to 6.1%", source: "mortgage-news-daily", date: "2026-09-07", url: "https://x", snippet: "" }, category: marketPulse, date: "2026-09-07" });
check("prompt embeds the source title", prompt.includes("Rate drops to 6.1%"), true);
check("prompt forbids inventing numbers", /do not add numbers/i.test(prompt), true);

// ── parseModelJSON ──
const validJSON = JSON.stringify({
  hook: "h", lesson: "l", cta: "c", onScreenText: "t", visualStyle: "v", colorPalette: "p", voiceoverTone: "o", backgroundVisual: "b", toolRecommendation: "CapCut",
});
check("parses clean JSON", parseModelJSON(validJSON).hook, "h");
check("strips a ```json fence", parseModelJSON("```json\n" + validJSON + "\n```").hook, "h");
let threw = false;
try {
  parseModelJSON(JSON.stringify({ hook: "h" }));
} catch {
  threw = true;
}
check("rejects a response missing required fields", threw, true);

// ── assemble + renderMarkdown ──
const packet = assemble({
  modelOutput: JSON.parse(validJSON),
  item: { title: "Rate drops to 6.1%", source: "mortgage-news-daily", date: "2026-09-07", url: "https://x", score: 9.4 },
  category: marketPulse,
  contentType: "DATA STAT",
  date: "2026-09-07",
});
check("assemble carries the platform trio", packet.platform, ["TikTok", "Instagram Reels", "YouTube Shorts"]);
check("assemble carries the source citation", packet.source.title, "Rate drops to 6.1%");
const md = renderMarkdown(packet);
check("rendered markdown carries the CONTENT DATE header", md.includes("CONTENT DATE: 2026-09-07"), true);
check("rendered markdown carries the sourced hook/lesson/cta", md.includes("[Hook] h") && md.includes("[Lesson] l") && md.includes("[CTA] c"), true);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
