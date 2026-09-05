// Daily micro-lesson pipeline for short-form (TikTok / Reels / Shorts) content.
//
// Pulls today's category from calendar.mjs, searches for a fresh, sourced
// data point via Firecrawl, then (if ANTHROPIC_API_KEY is set) asks Claude
// to turn the single best candidate into a Hook -> Lesson -> CTA script plus
// a full visual brief, written in Kareem's actual brand voice (see the
// kgj-content-engine skill and marketing/daily-content-automation-system.md).
//
// Run manually with FIRECRAWL_API_KEY (and optionally ANTHROPIC_API_KEY) set,
// or via .github/workflows/daily-micro-lesson.yml on a daily cron.
//
// Output:
//   web/public/data/daily-lesson-<YYYY-MM-DD>.json   (machine-readable)
//   marketing/daily-briefs/<YYYY-MM-DD>.md            (human-readable, ready to hand to a video tool)
//
// Without ANTHROPIC_API_KEY, the script still runs: it writes the ranked raw
// candidates and a scaffold brief with bracketed placeholders instead of a
// finished script. Per the kgj-content-engine rule this pipeline inherits —
// bracketed gaps are honest, fabricated numbers are not — it never invents a
// script or stat to fill the gap.
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CATEGORY_QUERIES, toCandidate, dedupe, rank } from "./sources.mjs";
import { entryForDate, laDateStamp } from "./calendar.mjs";

const BRAND = {
  name: "Kareem Jamal",
  title: "REALTOR® · Rodeo Realty",
  dre: "DRE #01998956",
  phone: "818.402.7326",
  email: "kjamal@rodeore.com",
  site: "kareemjamaltherealtor.com",
  colors: { navy: "#0B1E3E", gold: "#C9A84C", warmWhite: "#FAF8F3", white: "#FFFFFF", black: "#111111" },
  fonts: { display: "Fraunces (weight 300-500, no all-caps)", utility: "Inter" },
};

const HYPE_WORDS = ["stunning", "dream home", "don't miss out", "act now", "hot market", "unbelievable", "luxury"];

/** Ask Firecrawl for candidates across every query configured for this category. */
async function collectCandidates(client, category) {
  const queries = CATEGORY_QUERIES[category] || [];
  const collected = [];
  for (const { query, source } of queries) {
    try {
      const result = await client.search(query, { sources: ["web", "news"], limit: 10, tbs: "qdr:w" });
      const hits = [...(result.news || []), ...(result.web || [])];
      collected.push(...hits.map((h) => toCandidate(h, category, source)).filter(Boolean));
    } catch (err) {
      console.error(`Search failed for "${query}":`, err.message || err);
    }
  }
  return rank(dedupe(collected));
}

/** Build the prompt that turns the top candidates into a finished brief. */
function buildPrompt({ entry, dateStamp, candidates }) {
  const candidateBlock = candidates
    .slice(0, 5)
    .map((c, i) => `${i + 1}. "${c.title}" — ${c.source}${c.date ? ` (${c.date})` : ""}\n   ${c.url}\n   ${c.snippet || "(no snippet)"}`)
    .join("\n\n");

  return `You are writing ONE short-form video micro-lesson for a real estate education brand.

BRAND VOICE (non-negotiable):
- Straight talk, coach energy — explaining the play, not selling the ticket.
- Second person ("you need", not "one needs").
- Numbers over adjectives, and every number carries a source + date.
- Never invent a statistic. If the candidate sources below don't give you a clean, citable number, use a bracketed placeholder like [$X, source, month] instead of making one up.
- Banned words: ${HYPE_WORDS.join(", ")}.
- No filler openings ("In today's market...", "As a realtor..."). Start with the claim.
- At most one exclamation point, usually zero.
- Client is the hero. The agent is the one who did the math, never the hero.
- Closing question must be answerable in one sentence by someone with zero real estate expertise.

TODAY: ${dateStamp}
CATEGORY: ${entry.category}
AUDIENCE: ${entry.audience}
PILLAR: ${entry.pillar}
TEMPLATE SHAPE: ${entry.template}
EDITORIAL FOCUS: ${entry.focus}

CANDIDATE SOURCE MATERIAL (ranked, pick the single strongest — combine at most two if they support the same point):
${candidateBlock || "(no candidates found this run — write a scaffold with bracketed placeholders only, do not invent a lesson)"}

Return ONLY a JSON object, no markdown fence, matching exactly this shape:
{
  "insight": "one sentence naming the single most valuable takeaway",
  "sourceLine": "e.g. Mortgage News Daily, Sept 2026 — or null if no candidate was usable",
  "script": {
    "hook": "1-2 seconds, spoken and on-screen",
    "lesson": "3-6 seconds, one clear insight or action",
    "cta": "1-2 seconds, simple next step"
  },
  "onScreenText": "the single stat or phrase to display, all caps",
  "visualStyle": "e.g. bold text animation, clean infographic, talking head",
  "backgroundVisual": "e.g. luxury home exterior, city skyline, mortgage document close-up",
  "voiceoverTone": "e.g. confident, urgent, calm and authoritative",
  "toolRecommendation": "one of: Midjourney, DALL-E, Runway ML, HeyGen, CapCut",
  "needsHumanReview": true or false,
  "reviewNote": "why a human should double-check this before it ships, or null"
}`;
}

async function callClaude({ apiKey, model, prompt }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  return JSON.parse(text);
}

/** Scaffold brief used when no candidates or no LLM key are available — honest gaps, not invented copy. */
function scaffoldBrief(entry, candidates) {
  const top = candidates[0];
  return {
    insight: top ? `[Confirm insight from: ${top.title}]` : "[No candidate found this run — needs manual research]",
    sourceLine: top ? `${top.source}${top.date ? `, ${top.date}` : ""}` : null,
    script: { hook: "[NEEDS SCRIPT]", lesson: "[NEEDS SCRIPT]", cta: "Follow for daily real estate intel." },
    onScreenText: "[KEY STAT]",
    visualStyle: "clean infographic",
    backgroundVisual: "[choose based on final script]",
    voiceoverTone: "confident",
    toolRecommendation: "CapCut",
    needsHumanReview: true,
    reviewNote: "Generated without an LLM pass (ANTHROPIC_API_KEY not set) — script and stat are placeholders.",
  };
}

function renderMarkdown({ entry, dateStamp, brief, candidates }) {
  const platforms = "TikTok | Instagram Reels | YouTube Shorts";
  return `CONTENT DATE: ${dateStamp}
CATEGORY: ${entry.category}
TARGET AUDIENCE: ${entry.audience}
PLATFORM: ${platforms}

SCRIPT (5-10 sec):
Hook: ${brief.script.hook}
Lesson: ${brief.script.lesson}
CTA: ${brief.script.cta}

VISUAL STYLE: ${brief.visualStyle}
COLOR PALETTE: Navy ${BRAND.colors.navy} + Gold ${BRAND.colors.gold} (KJ brand tokens)
ON-SCREEN TEXT: ${brief.onScreenText}
VOICEOVER TONE: ${brief.voiceoverTone}
BACKGROUND VISUAL: ${brief.backgroundVisual}
TOOL RECOMMENDATION: ${brief.toolRecommendation}

SOURCE: ${brief.sourceLine || "none — verify before publishing"}
NEEDS HUMAN REVIEW: ${brief.needsHumanReview ? `YES — ${brief.reviewNote}` : "no"}

Compliance footer: ${BRAND.name} · ${BRAND.title} · ${BRAND.dre}
${BRAND.phone} · ${BRAND.email} · ${BRAND.site}

---
Candidates considered this run:
${candidates.slice(0, 5).map((c) => `- ${c.title} (${c.source}) — ${c.url}`).join("\n") || "(none found)"}
`;
}

const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntrypoint) {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlKey) {
    console.error("FIRECRAWL_API_KEY is not set. Copy .env.example to .env and fill in a key from firecrawl.dev.");
    process.exit(1);
  }
  const { Firecrawl } = await import("firecrawl");
  const client = new Firecrawl({ apiKey: firecrawlKey });

  const now = new Date();
  const entry = entryForDate(now);
  const dateStamp = laDateStamp(now);

  console.log(`${dateStamp} — ${entry.category} (${entry.audience} / ${entry.pillar})`);
  const candidates = await collectCandidates(client, entry.category);
  console.log(`Found ${candidates.length} candidate(s) after filtering + ranking.`);

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  let brief;
  if (anthropicKey && candidates.length > 0) {
    try {
      brief = await callClaude({
        apiKey: anthropicKey,
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        prompt: buildPrompt({ entry, dateStamp, candidates }),
      });
    } catch (err) {
      console.error("Claude call failed, falling back to scaffold:", err.message || err);
      brief = scaffoldBrief(entry, candidates);
    }
  } else {
    if (!anthropicKey) console.log("ANTHROPIC_API_KEY not set — writing a scaffold brief instead of a finished script.");
    brief = scaffoldBrief(entry, candidates);
  }

  const root = path.resolve(fileURLToPath(import.meta.url), "../../..");
  const dataDir = path.join(root, "web/public/data");
  const briefsDir = path.join(root, "marketing/daily-briefs");
  await mkdir(dataDir, { recursive: true });
  await mkdir(briefsDir, { recursive: true });

  const payload = { date: dateStamp, generatedAt: now.toISOString(), entry, brief, candidates: candidates.slice(0, 5) };
  await writeFile(path.join(dataDir, `daily-lesson-${dateStamp}.json`), JSON.stringify(payload, null, 2) + "\n");
  await writeFile(path.join(briefsDir, `${dateStamp}.md`), renderMarkdown({ entry, dateStamp, brief, candidates }));

  console.log(`Wrote web/public/data/daily-lesson-${dateStamp}.json and marketing/daily-briefs/${dateStamp}.md`);
}
