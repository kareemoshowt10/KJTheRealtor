// Unit-tests the pure logic in generate.mjs. Runs without any API key:
//   node scripts/content-engine/verify.mjs
import {
  CATEGORIES,
  categoryForDate,
  pickCta,
  monthlyPayment,
  paymentDelta,
  savingsFromRateMove,
  parseFredSeries,
  rateSummary,
  selectInsight,
  buildScript,
  buildBrief,
  briefToMarkdown,
} from "./generate.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

// ── Calendar rotation (Step 4) ──
check("covers all 7 days", CATEGORIES.length, 7);
check("every category has a unique key", new Set(CATEGORIES.map((c) => c.key)).size, 7);
check("Monday is Market Pulse", categoryForDate(new Date("2026-08-31T12:00:00Z")).label, "Market Pulse");
check("Tuesday is Buyer Intel", categoryForDate(new Date("2026-09-01T12:00:00Z")).label, "Buyer Intel");
check("Wednesday is Investor Edge", categoryForDate(new Date("2026-09-02T12:00:00Z")).label, "Investor Edge");
check("Thursday is Agent Playbook", categoryForDate(new Date("2026-09-03T12:00:00Z")).label, "Agent Playbook");
check("Friday is Rate Watch", categoryForDate(new Date("2026-09-04T12:00:00Z")).label, "Rate Watch");
check("Saturday is Seller Strategy", categoryForDate(new Date("2026-09-05T12:00:00Z")).label, "Seller Strategy");
check("Sunday is Mindset/Motivation", categoryForDate(new Date("2026-08-30T12:00:00Z")).label, "Mindset/Motivation");

// ── CTA rotation ──
check("same date always yields same CTA", pickCta(new Date("2026-08-28T00:00:00")), pickCta(new Date("2026-08-28T23:00:00")));

// ── Mortgage math (verified against a standard amortization calculator) ──
check("30yr $420k @ 7% monthly payment", Math.round(monthlyPayment(420000, 7, 30)), 2794);
check("30yr $420k @ 6% monthly payment", Math.round(monthlyPayment(420000, 6, 30)), 2518);
const delta = paymentDelta(420000, 7, 6, 30);
check("a 1pt drop on $420k saves ~$276/month", Math.round(delta.monthly), 276);
check("that compounds to ~$99k over 30 years", Math.round(delta.total / 1000), 99);

check("no savings computed when rate is flat", savingsFromRateMove({ rate30: 6.5, deltaPct: 0 }, 420000), null);
const move = savingsFromRateMove({ rate30: 6.5, deltaPct: -0.25 }, 420000);
check("a rate drop returns a positive monthly savings", move.monthly > 0, true);

// ── FRED parsing ──
const fredSample = {
  observations: [
    { date: "2026-08-21", value: "6.45" },
    { date: "2026-08-14", value: "6.58" },
    { date: "2026-08-07", value: "." }, // FRED's own "no data" marker
  ],
};
const parsed = parseFredSeries(fredSample);
check("drops FRED's missing-value marker", parsed.length, 2);
check("parses the latest rate as a number", parsed[0].rate, 6.45);

const summary = rateSummary(parsed, []);
check("rate direction reads as down when it fell", summary.direction, "down");
check("rate15 is null when no 15yr series is passed", summary.rate15, null);
check("rateSummary handles an empty series", rateSummary([], []), null);

// ── Insight selection (Firecrawl enrichment) ──
check(
  "rejects a headline that's too short to be useful",
  selectInsight([{ title: "Rates up", url: "https://x.com" }]),
  null
);
check(
  "picks the first well-formed hit",
  selectInsight([
    { title: "Existing home sales rose for the third straight month", url: "https://a.com" },
  ])?.title,
  "Existing home sales rose for the third straight month"
);
check("handles a non-array input", selectInsight(null), null);

// ── Script + brief assembly (no network) ──
const rateWatch = CATEGORIES.find((c) => c.key === "rate-watch");
const ctx = {
  date: new Date("2026-09-04T12:00:00Z"), // a Friday
  rate: { rate30: 6.45, rate15: 5.7, asOf: "2026-08-21", deltaPct: -0.13, direction: "down" },
  insight: null,
  savings: paymentDelta(420000, 6.58, 6.45, 30),
  loanAmount: 420000,
};
const script = buildScript(rateWatch, ctx);
check("hook mentions the rate direction", script.hook.includes("down"), true);
check("lesson includes the 30yr rate figure", script.lesson.includes("6.45%"), true);
check("cta is non-empty", script.cta.length > 0, true);

const brief = buildBrief(rateWatch, script, ctx);
check("brief carries the category label", brief.category, "Rate Watch");
check("brief lists all three platforms", brief.platforms.length, 3);
check("on-screen text falls back to the rate figure", brief.onScreenText, "6.45% 30-yr rate");

const markdown = briefToMarkdown(brief);
for (const requiredHeader of [
  "CONTENT DATE:",
  "CATEGORY:",
  "TARGET AUDIENCE:",
  "PLATFORM:",
  "SCRIPT (5-10 sec):",
  "VISUAL STYLE:",
  "COLOR PALETTE:",
  "ON-SCREEN TEXT:",
  "VOICEOVER TONE:",
  "BACKGROUND VISUAL:",
  "TOOL RECOMMENDATION:",
]) {
  check(`markdown brief includes "${requiredHeader}"`, markdown.includes(requiredHeader), true);
}

// ── Fallback copy works with zero external data (must ship every morning) ──
for (const category of CATEGORIES) {
  const bareCtx = { date: new Date("2026-08-28T12:00:00Z"), rate: null, insight: null, savings: null, loanAmount: 420000 };
  const s = buildScript(category, bareCtx);
  check(`${category.key}: hook renders with no live data`, typeof s.hook === "string" && s.hook.length > 0, true);
  check(`${category.key}: lesson renders with no live data`, typeof s.lesson === "string" && s.lesson.length > 0, true);
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
