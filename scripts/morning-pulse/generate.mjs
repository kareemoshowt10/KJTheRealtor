// Morning short-form content engine — Steps 1-7 of
// marketing/short-form-content-engine.md, automated.
//
// Pulls this morning's real-estate headlines for today's rotating category
// (Step 1-2), ranks them (Step 2-3), turns the winner into a 5-10 second
// Hook -> Lesson -> CTA script (Step 3), and emits a ready-to-hand-off
// visual brief in the Step 5 format. Writes to marketing/daily-shorts/.
//
// Runs in two modes:
//   - Live mode  (FIRECRAWL_API_KEY set): searches real sources, ranks real
//     headlines.
//   - Template mode (no key): still produces a fully-formed, clearly
//     labeled example so the pipeline is reviewable/testable end to end
//     without paid API access. CI should treat template-mode output as a
//     signal to add the secret, not as the day's real post.
//
// Run manually with FIRECRAWL_API_KEY set, or via
// .github/workflows/morning-pulse.yml on a daily cron.
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  CONTENT_CALENDAR,
  categoryForDate,
  SOURCES_BY_CATEGORY,
  toInsight,
  rankInsights,
  pickFromPool,
} from "./config.mjs";

const PLATFORMS = "TikTok | Instagram Reels | YouTube Shorts";

const VISUAL_DEFAULTS = {
  "Market Pulse": {
    style: "clean data infographic, animated bar/line chart",
    palette: "navy blue + gold (authority)",
    tone: "confident, data-first",
    background: "city skyline or neighborhood aerial b-roll",
    tool: "CapCut (infographic template) or Runway ML",
  },
  "Buyer Intel": {
    style: "talking head with bold text overlay callouts",
    palette: "white + navy (trust)",
    tone: "direct, coaching",
    background: "front door / keys-in-hand close-up",
    tool: "HeyGen or CapCut",
  },
  "Investor Edge": {
    style: "bold text animation over a simple equity/cash-flow diagram",
    palette: "navy + gold (wealth-building)",
    tone: "calm and authoritative",
    background: "duplex/rental exterior or spreadsheet close-up",
    tool: "Runway ML or CapCut",
  },
  "Agent Playbook": {
    style: "talking head, script text synced on screen",
    palette: "white + navy (professional)",
    tone: "confident, tactical",
    background: "office / phone call close-up",
    tool: "HeyGen",
  },
  "Rate Watch": {
    style: "bold stat reveal, animated number counter",
    palette: "navy + gold (authority)",
    tone: "urgent, precise",
    background: "mortgage document / calculator close-up",
    tool: "CapCut",
  },
  "Seller Strategy": {
    style: "clean infographic + before/after framing",
    palette: "white + green (growth)",
    tone: "confident, reassuring",
    background: "for-sale sign / staged living room",
    tool: "Runway ML or CapCut",
  },
  "Mindset/Motivation": {
    style: "cinematic talking head or text-on-black quote reveal",
    palette: "navy + gold (authority)",
    tone: "calm and inspiring",
    background: "sunrise skyline or luxury home exterior",
    tool: "HeyGen or Runway ML",
  },
};

const FALLBACK_INSIGHTS = {
  "Market Pulse": {
    title: "TEMPLATE — plug in this week's Zillow/Redfin inventory or price-cut % here",
    url: null,
  },
  "Buyer Intel": {
    title: "TEMPLATE — plug in this week's top buyer-relevant condition (rate move, inventory, concession trend)",
    url: null,
  },
  "Investor Edge": {
    title: "TEMPLATE — plug in this week's investor-relevant data point (cap rate, rent growth, cash-flow trend)",
    url: null,
  },
  "Agent Playbook": {
    title: "TEMPLATE — plug in this week's Inman/agent-community tactic or objection trend",
    url: null,
  },
  "Rate Watch": {
    title: "TEMPLATE — plug in this week's actual 30-yr/15-yr rate from Mortgage News Daily",
    url: null,
  },
  "Seller Strategy": {
    title: "TEMPLATE — plug in this week's seller-relevant data point (days on market, price cuts, competitiveness)",
    url: null,
  },
  "Mindset/Motivation": {
    title: "TEMPLATE — plug in this week's wealth-building principle or investor success theme",
    url: null,
  },
};

/** Step 3-4: turn the winning insight into a Hook -> Lesson -> CTA script. */
export function buildScript(insight, slot, seed) {
  const hook = pickFromPool(slot.hooks, `${seed}-hook`);
  const cta = pickFromPool(slot.ctas, `${seed}-cta`);
  const lesson = insight.title;
  return { hook, lesson, cta, full: `${hook} ${lesson} ${cta}` };
}

/** Step 5: exact visual-brief output format, ready to hand to an image/video tool. */
export function buildVisualBrief({ date, slot, insight, script, isTemplate }) {
  const v = VISUAL_DEFAULTS[slot.category];
  const dateStr = date.toISOString().slice(0, 10);
  return `CONTENT DATE: ${dateStr}
CATEGORY: ${slot.category}${isTemplate ? " (TEMPLATE — no live data source configured)" : ""}
TARGET AUDIENCE: ${slot.audience}
PLATFORM: ${PLATFORMS}

SCRIPT (5-10 sec):
${script.hook} -> ${script.lesson} -> ${script.cta}

VISUAL STYLE: ${v.style}
COLOR PALETTE: ${v.palette}
ON-SCREEN TEXT: ${script.lesson}
VOICEOVER TONE: ${v.tone}
BACKGROUND VISUAL: ${v.background}
TOOL RECOMMENDATION: ${v.tool}

SOURCE: ${insight.url || "n/a — template placeholder, replace before posting"}
CONTENT TYPE TAG: ${slot.contentType}
`;
}

async function pullInsightsLive(apiKey, category) {
  const { Firecrawl } = await import("firecrawl");
  const client = new Firecrawl({ apiKey });
  const angles = SOURCES_BY_CATEGORY[category] || [];
  const today = new Date();
  const collected = [];
  for (const angle of angles) {
    try {
      const result = await client.search(angle(today), { sources: ["news"], limit: 8, tbs: "qdr:d" });
      const hits = result.news && result.news.length ? result.news : result.web || [];
      collected.push(...hits.map(toInsight).filter(Boolean));
    } catch (err) {
      console.error(`Search failed for "${category}":`, err.message || err);
    }
  }
  return collected;
}

async function postToSlack(webhookUrl, { slot, brief }) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `*Morning content brief — ${slot.category}*\n\`\`\`${brief}\`\`\`` }),
    });
  } catch (err) {
    console.error("Slack delivery failed:", err.message || err);
  }
}

const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isEntrypoint) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  const date = new Date();
  const slot = categoryForDate(date);
  const seed = date.toISOString().slice(0, 10);

  let insight;
  let isTemplate = false;
  if (apiKey) {
    const pulled = await pullInsightsLive(apiKey, slot.category);
    const ranked = rankInsights(pulled);
    insight = ranked[0] || FALLBACK_INSIGHTS[slot.category];
    isTemplate = ranked.length === 0;
  } else {
    console.warn("FIRECRAWL_API_KEY not set — writing TEMPLATE mode output. See .env.example.");
    insight = FALLBACK_INSIGHTS[slot.category];
    isTemplate = true;
  }

  const script = buildScript(insight, slot, seed);
  const brief = buildVisualBrief({ date, slot, insight, script, isTemplate });

  const outDir = path.resolve(fileURLToPath(import.meta.url), "../../../marketing/daily-shorts");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${seed}.md`);
  await writeFile(outPath, brief);
  await writeFile(path.join(outDir, "latest.md"), brief);
  console.log(`Wrote ${outPath}${isTemplate ? " (template mode)" : ""}`);

  if (process.env.SLACK_WEBHOOK_URL) {
    await postToSlack(process.env.SLACK_WEBHOOK_URL, { slot, brief });
  }
}
