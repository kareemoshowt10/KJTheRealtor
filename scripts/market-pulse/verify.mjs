// Unit-tests the pure filtering logic in generate.mjs. Runs without an API key:
//   node scripts/market-pulse/verify.mjs
// Every case below is drawn from output the previous generator actually shipped,
// so a regression here means the widget would go back to surfacing the wrong thing.
import { toItem, dedupe, AREAS } from "./generate.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${actual}, want ${expected})`}`);
};

const simi = AREAS.find((a) => a.slug === "93063").terms;
const chatsworth = AREAS.find((a) => a.slug === "91311").terms;

// ── The three items that actually shipped on the Simi Valley page ──
check(
  "rejects generic SoCal listicle on a Simi Valley page",
  toItem({ title: "23 free fun things to do in Southern California in August", url: "https://www.ocregister.com/2026/07/31/23-free-fun-things/" }, simi),
  null
);
check(
  "rejects a Malibu arts festival on a Simi Valley page",
  toItem({ title: "Local Event: Art On Ocean: Palisades Park Arts Festival", url: "https://patch.com/california/malibu/calendar/event/x/" }, simi),
  null
);
check(
  "rejects an undated regional happenings roundup",
  toItem({ title: "Happenings: Week of July 30, 2026", url: "https://www.vcreporter.com/calendar/happenings-week-of-july-30-2026/" }, simi),
  null
);

// ── Things a homeowner genuinely has a stake in ──
check(
  "keeps a Simi Valley council housing decision",
  toItem({ title: "Simi Valley council approves 120-unit housing development on Cochran Street", url: "https://vcstar.com/x" }, simi)?.title,
  "Simi Valley council approves 120-unit housing development on Cochran Street"
);
check(
  "keeps a Chatsworth fire-zone insurance story",
  toItem({ title: "Chatsworth homeowners face new fire hazard zone insurance rules", url: "https://dailynews.com/x" }, chatsworth)?.title,
  "Chatsworth homeowners face new fire hazard zone insurance rules"
);
check(
  "matches locality via URL when the headline omits the place",
  toItem({ title: "New school district boundary plan advances after board vote", url: "https://patch.com/california/chatsworth/schools-plan" }, chatsworth)?.title,
  "New school district boundary plan advances after board vote"
);

// ── Guardrails preserved from the original implementation ──
check(
  "still blocks grim headlines next to hometown copy",
  toItem({ title: "Chatsworth property owner arrested after fatal collision downtown", url: "https://x.com/y" }, chatsworth),
  null
);
check("still blocks very short headlines", toItem({ title: "Chatsworth news", url: "https://x.com/y" }, chatsworth), null);
check("still blocks malformed hits", toItem({ title: "Chatsworth housing development approved by council", url: null }, chatsworth), null);

// ── Dedupe ──
const deduped = dedupe([
  { title: "Simi Valley council approves 120-unit housing development on Cochran", url: "a" },
  { title: "Council approves 120-unit housing development on Cochran in Simi Valley", url: "b" },
  { title: "Encino property tax assessment appeals deadline approaching for owners", url: "c" },
]);
check("collapses the same story from two outlets", deduped.length, 2);

// ── Config sanity ──
check("covers every community page", AREAS.length, 12);
check("every area has locality terms", AREAS.every((a) => a.terms.length > 0), true);
check("every area has a unique slug", new Set(AREAS.map((a) => a.slug)).size, AREAS.length);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
