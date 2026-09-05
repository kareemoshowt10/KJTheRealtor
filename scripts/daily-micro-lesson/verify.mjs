// Unit-tests the pure logic in calendar.mjs and sources.mjs. Runs without
// any API key:
//   node scripts/daily-micro-lesson/verify.mjs
import { CALENDAR, entryForDayIndex, entryForDate } from "./calendar.mjs";
import { toCandidate, dedupe, rank, CATEGORY_QUERIES } from "./sources.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

// ── Calendar ──
check("covers all seven days", CALENDAR.length, 7);
check("every day is unique", new Set(CALENDAR.map((e) => e.day)).size, 7);
check("every entry has a category, audience, pillar, template, and focus", CALENDAR.every((e) => e.category && e.audience && e.pillar && e.template && e.focus), true);
check("every category has at least one search query configured", CALENDAR.every((e) => (CATEGORY_QUERIES[e.category] || []).length > 0), true);
check("Monday is Market Pulse", entryForDayIndex(1).category, "Market Pulse");
check("Friday is Rate Watch", entryForDayIndex(5).category, "Rate Watch");

// A known Tuesday (2026-09-08 is a Tuesday) should resolve to Buyer Intel
// regardless of the machine's local timezone, since entryForDate anchors to
// America/Los_Angeles explicitly.
check("entryForDate resolves by LA weekday, not server-local time", entryForDate(new Date("2026-09-08T23:00:00Z")).category, "Buyer Intel");

// ── Candidate filtering ──
check(
  "rejects a headline with no real-estate relevance",
  toCandidate({ title: "Local high school wins state championship game last night", url: "https://x.com/y" }, "Buyer Intel", "test"),
  null
);
check(
  "rejects a grim headline even if it mentions housing",
  toCandidate({ title: "Homeowner dead after fatal crash near new development", url: "https://x.com/y" }, "Market Pulse", "test"),
  null
);
check(
  "rejects a malformed hit",
  toCandidate({ title: "Mortgage rates drop this week", url: null }, "Rate Watch", "test"),
  null
);
check(
  "keeps a relevant, dated rate headline",
  toCandidate({ title: "30-year fixed mortgage rate falls to 6.1% this week", url: "https://x.com/y", date: "2026-09-01" }, "Rate Watch", "Mortgage News Daily")?.title,
  "30-year fixed mortgage rate falls to 6.1% this week"
);

// ── Dedupe + rank ──
const deduped = dedupe([
  { title: "30-year fixed mortgage rate falls to 6.1 percent this week", url: "a" },
  { title: "Mortgage rate falls to 6.1 percent this week for 30-year fixed", url: "b" },
  { title: "San Fernando Valley inventory rises for third straight month", url: "c" },
]);
check("collapses the same rate story from two sources", deduped.length, 2);

const ranked = rank([
  { title: "General housing commentary with no figures", date: null },
  { title: "Rate drops to 6.1% this week", date: new Date().toISOString() },
]);
check("ranks a fresh, numeric candidate above a vague undated one", ranked[0].title, "Rate drops to 6.1% this week");

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
