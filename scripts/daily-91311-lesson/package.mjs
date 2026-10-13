#!/usr/bin/env node
/**
 * Builds a draft lesson package for the 91311 short-form ritual.
 * Never sets compliance or posting to approved. Never renders or posts.
 *
 * Usage:
 *   node scripts/daily-91311-lesson/package.mjs
 *   node scripts/daily-91311-lesson/package.mjs --date 2026-08-16
 *   node scripts/daily-91311-lesson/package.mjs --out /tmp/91311-out
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const RITUAL = join(ROOT, "marketing/daily-91311-ritual");
const FIXED_CTA =
  "Every situation is different. Reach out for a tailored, direct, actionable plan.";
const DISCLAIMER =
  "General educational content only. Not legal, tax, lending, financial, or individualized real-estate advice. AI conceptual visuals, if used, are not actual property representations.";
const IDENTITY =
  "Kareem Jamal · CA DRE #01998956 · [RESPONSIBLE BROKER’S EXACT LICENSED IDENTITY]";
const HASHTAGS =
  "#Chatsworth #91311 #ChatsworthRealEstate #SanFernandoValley #KareemJamalRealtor #RodeoRealty";

function parseArgs(argv) {
  const out = { date: null, outDir: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--date") out.date = argv[++i];
    else if (argv[i] === "--out") out.outDir = argv[++i];
  }
  return out;
}

function laParts(dateStr) {
  const iso = dateStr
    ? `${dateStr}T14:00:00.000Z`
    : new Date().toISOString();
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function dayIndex(date) {
  const [y, m, d] = date.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const origin = Date.UTC(2026, 0, 1);
  const days = Math.floor((utc - origin) / 86400000);
  return ((days % 21) + 21) % 21;
}

function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function clipWords(s, max) {
  const words = s.trim().split(/\s+/);
  return words.slice(0, max).join(" ");
}

function buildScenes(seed) {
  const theory = clipWords(seed.coreIdea, 18);
  const strategy = clipWords(seed.bridgeRule, 18);
  const habit = clipWords(seed.habit, 18);
  const hook = clipWords(seed.principle, 9);
  return [
    {
      beat: "hook",
      headline: hook,
      body: "",
      caption: clipWords(seed.principle, 14),
    },
    {
      beat: "philosophy",
      headline: clipWords(seed.principle, 12),
      body: theory,
      caption: clipWords(`${seed.quoteStatus}: ${seed.coreIdea}`, 14),
    },
    {
      beat: "real-estate-strategy",
      headline:
        seed.bridgeDecision === "character-only"
          ? "Practice the character, not a pitch"
          : clipWords(seed.bridgeRule, 12),
      body: strategy,
      caption: clipWords(seed.bridgeRule, 14),
    },
    {
      beat: "character-trait",
      headline: clipWords(seed.trait, 12),
      body: `Today I am practicing ${seed.trait.toLowerCase()}.`,
      caption: clipWords(seed.trait, 14),
    },
    {
      beat: "keystone-habit",
      headline: "One action today",
      body: habit,
      caption: clipWords(seed.habit, 14),
    },
    {
      beat: "closing-question",
      headline: "Will you do the one action?",
      body: "Learn, test, apply, then write one honest note.",
      caption: "One question. One next step.",
    },
    {
      beat: "cta",
      headline: "Every situation is different",
      body: FIXED_CTA,
      caption: "Reach out for a tailored plan.",
    },
  ];
}

function captionText(seed, date) {
  const application =
    seed.bridgeDecision === "character-only"
      ? seed.habit
      : seed.bridgeRule;
  return [
    seed.principle,
    "",
    `(Paraphrase.) ${seed.coreIdea}`,
    "",
    application,
    "",
    `Today’s trait: ${seed.trait}`,
    "",
    `Today’s practice: ${seed.habit}`,
    "",
    FIXED_CTA,
    "",
    IDENTITY,
    "",
    DISCLAIMER,
    "",
    seed.ctaLink,
    "",
    seed.sourceNote,
    "",
    HASHTAGS,
    "",
    `Draft only · ${date} · not approved · not scheduled`,
  ].join("\n");
}

function complianceMd(seed) {
  return `# Compliance — PENDING (agent cannot approve)

Date lesson: ${seed.slug}
Escalation topic: ${seed.escalation ? "YES — broker/counsel before release" : "no"}

All boxes stay unchecked until a human + broker review:

- [ ] Theory attribution and quotation status verified
- [ ] Real-estate bridge is general, not individualized advice
- [ ] No invented prices, rates, medians, DOM, or results
- [ ] Licensee name + DRE #01998956 readable from frame one
- [ ] Responsible broker identity exact and verified
- [ ] Fair housing: no steering, schools, crime, demographics
- [ ] Each image has rights note + type
- [ ] AI conceptual visuals disclosed
- [ ] No altered actual-property photo
- [ ] No client/private transaction information
- [ ] Fixed CTA + education disclaimer present
- [ ] Kareem muted-QA approved
- [ ] Broker review approved

Video status: draft
Posting status: not-scheduled
`;
}

function sourceMd(seed) {
  return `# Source note

- Principle: ${seed.principle}
- School / lens: ${seed.school}
- Status: **${seed.quoteStatus}** (not a verified direct quotation)
- Note: ${seed.sourceNote}
- Bridge: ${seed.bridgeDecision}
- Rule: ${seed.bridgeRule}

Do not upgrade paraphrase to quote without a primary source.
Do not add market statistics in the scheduled run.
`;
}

function journalMd(seed, date) {
  return `# Journal row (draft)

| date | type | slug | trait | habit done? | posted? | keep / change / drop |
|---|---|---|---|---|---|---|
| ${date} | ${seed.type} | ${seed.slug} | ${seed.trait} | _fill after you do it_ | no | _one honest line_ |

Practice note: I am still learning how this changes my decisions.
`;
}

function visualsMd(visuals, seed) {
  const rows = visuals
    .map(
      (v) =>
        `- **${v.id}** (${v.type}) — ${v.metaphor}\n  - src: \`${v.src}\`\n  - rights: ${v.rightsNote}\n  - alt: ${v.alt}`,
    )
    .join("\n");
  return `# Visuals (reuse bank — do not generate new stills)

${rows}

Disclosure: ${seed.escalation ? "Also treat this lesson as a compliance escalation." : "Conceptual / public-land only."}
`;
}

function readmeMd(seed, date, day) {
  return `# ${date} · 91311 · ${seed.slug}

Type: **${seed.type}** (rotation day ${day} / 21)
Runtime target: 16–22 seconds · 7 beats · 3 reused stills

## Do today
1. Read POSTING.txt muted in your head.
2. Confirm visuals exist in the bank (or shoot one public-land still).
3. Complete the keystone habit yourself.
4. Only then render in The Practice Remotion project.
5. Licensee + broker approval. Then schedule.

This folder is a **draft**. Uploading to Drive is not publishing.
`;
}

async function main() {
  const args = parseArgs(process.argv);
  const { date } = laParts(args.date);
  const index = dayIndex(date);
  const rotation = JSON.parse(
    await readFile(join(RITUAL, "rotation.json"), "utf8"),
  );
  const bank = JSON.parse(
    await readFile(join(RITUAL, "visual-bank.json"), "utf8"),
  );
  const seed = rotation.seeds.find((s) => s.dayIndex === index);
  if (!seed) throw new Error(`No seed for dayIndex ${index}`);

  const byId = Object.fromEntries(bank.assets.map((a) => [a.id, a]));
  const visuals = seed.visualIds.map((id) => {
    if (!byId[id]) throw new Error(`Unknown visual ${id}`);
    return byId[id];
  });

  const scenes = buildScenes(seed);
  const lesson = {
    id: `philosophy-${date}-91311-${seed.slug}`,
    date,
    zip: "91311",
    place: "Chatsworth",
    format: "micro",
    targetSeconds: 18,
    lessonType: seed.type,
    rotationDay: index,
    principle: seed.principle,
    school: seed.school,
    coreIdea: seed.coreIdea,
    quoteStatus: seed.quoteStatus,
    sourceNote: seed.sourceNote,
    bridgeDecision: seed.bridgeDecision,
    bridgeRule: seed.bridgeRule,
    trait: seed.trait,
    habit: seed.habit,
    escalation: seed.escalation,
    cta: FIXED_CTA,
    ctaLink: seed.ctaLink,
    identityLine: IDENTITY,
    disclaimer: DISCLAIMER,
    videoStatus: "draft",
    postingStatus: "not-scheduled",
    licenseeIdentityVerified: false,
    brokerIdentityVerified: false,
    complianceReviews: {
      human: "pending",
      broker: "pending",
      fairHousing: "pending",
      claims: "pending",
      visualRights: "pending",
    },
    visuals,
    scenes,
    wordCounts: scenes.map((s) => ({
      beat: s.beat,
      headline: wordCount(s.headline),
      body: wordCount(s.body),
      caption: wordCount(s.caption),
    })),
  };

  const outDir =
    args.outDir ||
    join(ROOT, "marketing/daily-91311-ritual/output", date);
  await mkdir(outDir, { recursive: true });

  await writeFile(
    join(outDir, "lesson.json"),
    `${JSON.stringify(lesson, null, 2)}\n`,
  );
  await writeFile(join(outDir, "POSTING.txt"), `${captionText(seed, date)}\n`);
  await writeFile(join(outDir, "SOURCE.md"), sourceMd(seed));
  await writeFile(join(outDir, "COMPLIANCE.md"), complianceMd(seed));
  await writeFile(join(outDir, "journal-row.md"), journalMd(seed, date));
  await writeFile(join(outDir, "visuals.md"), visualsMd(visuals, seed));
  await writeFile(join(outDir, "README.md"), readmeMd(seed, date, index));

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        date,
        dayIndex: index,
        slug: seed.slug,
        type: seed.type,
        outDir,
        videoStatus: "draft",
        postingStatus: "not-scheduled",
      },
      null,
      2,
    ) + "\n",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
