// Unit-tests the pure logic in rotation.mjs and score.mjs. Runs without any
// network access or API key:
//   node scripts/morning-pulse/verify.mjs
import { ROTATION, categoryForDate } from "./rotation.mjs";
import { scoreCandidate, rankCandidates } from "./score.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

// ── Rotation ──
check("covers all 7 days", Object.keys(ROTATION).length, 7);
check("Monday is Market Pulse", categoryForDate(new Date("2026-08-31T12:00:00Z")).category, "Market Pulse"); // Mon
check("Friday is Rate Watch", categoryForDate(new Date("2026-09-04T12:00:00Z")).category, "Rate Watch"); // Fri
check("Sunday is Mindset/Motivation", categoryForDate(new Date("2026-08-30T12:00:00Z")).category, "Mindset/Motivation"); // Sun

// ── Scoring ──
check(
  "a dated official stat outscores a vague reddit title",
  scoreCandidate({ kind: "stat", title: "30-year mortgage rate: 6.55% as of 2026-08-28" }, { keywords: ["mortgage", "rate"] }) >
    scoreCandidate({ kind: "reddit", title: "is now a good time to buy" }, { keywords: ["mortgage", "rate"] }),
  true
);
check(
  "keyword relevance raises score",
  scoreCandidate({ kind: "rss", title: "Rate cut changes affordability math" }, { keywords: ["rate"] }) >
    scoreCandidate({ kind: "rss", title: "Local diner reopens downtown" }, { keywords: ["rate"] }),
  true
);
check(
  "a stale reddit post scores below a fresh one, all else equal",
  scoreCandidate(
    { kind: "reddit", title: "should I buy now", engagement: 50, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
    {}
  ) <
    scoreCandidate(
      { kind: "reddit", title: "should I buy now", engagement: 50, publishedAt: new Date().toISOString() },
      {}
    ),
  true
);

// ── Ranking ──
const ranked = rankCandidates(
  [
    { kind: "reddit", title: "random chatter", engagement: 2 },
    { kind: "stat", title: "median home price up 2% to $434,100" },
  ],
  { keywords: ["price"] }
);
check("ranking puts the relevant stat first", ranked[0].kind, "stat");

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
