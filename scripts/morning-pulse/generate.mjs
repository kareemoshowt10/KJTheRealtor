// Morning Pulse — steps 1-4 of the pipeline documented in
// marketing/morning-pulse-system.md:
//   1. Data Pull       -> fetch*() calls below
//   2. Filter & Ranking -> rankCandidates()
//   3. Insight Extraction -> top of the ranked list
//   4. Content Categorization -> categoryForDate() (7-day rotation)
//
// Steps 5-6 (script writing + visual brief) are deliberately NOT done here
// with a hard-coded template — turning "median price up 2%" into a script
// that doesn't sound like a robot wrote it is a writing task, not a string
// substitution. That step is Claude's job: this script hands its JSON
// output to a Claude session (scheduled the same morning) that writes the
// final script + visual brief and posts them to Notion/Slack. See the
// "Wiring the writing step" section of the README.
//
// Run manually: node generate.mjs
// Scheduled via .github/workflows/morning-pulse.yml at ~6am local.
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  fetchMortgageRate30yr,
  fetchMortgageRate15yr,
  fetchHousingStarts,
  fetchRedditTop,
  fetchRSS,
  RSS_FEEDS,
} from "./sources.mjs";
import { rankCandidates } from "./score.mjs";
import { categoryForDate } from "./rotation.mjs";

const REDDIT_SUBS = ["RealEstate", "FirstTimeHomeBuyer", "realestateinvesting"];

/** Pulls every source, tolerating individual failures (a dead feed shouldn't kill the run). */
async function pullAll() {
  const candidates = [];
  const errors = [];

  const record = async (label, fn) => {
    try {
      return await fn();
    } catch (err) {
      errors.push(`${label}: ${err.message || err}`);
      return null;
    }
  };

  const rate30 = await record("mortgage-30yr", fetchMortgageRate30yr);
  if (rate30) {
    candidates.push({
      kind: "stat",
      source: "FRED/Freddie Mac PMMS",
      title: `30-year fixed mortgage rate: ${rate30.rate}% as of ${rate30.date}`,
      publishedAt: rate30.date,
      raw: rate30,
    });
  }

  const rate15 = await record("mortgage-15yr", fetchMortgageRate15yr);
  if (rate15) {
    candidates.push({
      kind: "stat",
      source: "FRED/Freddie Mac PMMS",
      title: `15-year fixed mortgage rate: ${rate15.rate}% as of ${rate15.date}`,
      publishedAt: rate15.date,
      raw: rate15,
    });
  }

  const starts = await record("housing-starts", fetchHousingStarts);
  if (starts) {
    candidates.push({
      kind: "stat",
      source: "Census/FRED (HOUST)",
      title: `Housing starts ${starts.momChangePct >= 0 ? "up" : "down"} ${Math.abs(starts.momChangePct)}% to ${starts.thousandsOfUnits}k units as of ${starts.date}`,
      publishedAt: starts.date,
      raw: starts,
    });
  }

  for (const sub of REDDIT_SUBS) {
    const posts = await record(`reddit-${sub}`, () => fetchRedditTop(sub, { limit: 5 }));
    for (const p of posts || []) {
      candidates.push({
        kind: "reddit",
        source: `r/${sub}`,
        title: p.title,
        engagement: p.score + p.numComments,
        url: p.url,
      });
    }
  }

  for (const [name, feedUrl] of Object.entries(RSS_FEEDS)) {
    const items = await record(`rss-${name}`, () => fetchRSS(feedUrl, { limit: 5 }));
    for (const item of items || []) {
      candidates.push({
        kind: "rss",
        source: name,
        title: item.title,
        publishedAt: item.pubDate,
        url: item.link,
      });
    }
  }

  return { candidates, errors };
}

async function main() {
  const today = new Date();
  const { category, audience, angle } = categoryForDate(today);
  const keywords = angle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const { candidates, errors } = await pullAll();
  const ranked = rankCandidates(candidates, { keywords });
  const top = ranked[0] || null;

  const brief = {
    date: today.toISOString().slice(0, 10),
    category,
    audience,
    angle,
    topInsight: top,
    runnerUps: ranked.slice(1, 6),
    sourceErrors: errors,
    generatedAt: today.toISOString(),
    nextStep:
      "Hand topInsight + category + audience to Claude to write the Hook/Lesson/CTA script and visual brief (see marketing/morning-pulse-system.md).",
  };

  const outDir = path.resolve(fileURLToPath(import.meta.url), "../../../marketing/morning-pulse");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${brief.date}.json`);
  await writeFile(outPath, JSON.stringify(brief, null, 2) + "\n");
  console.log(`Wrote ${outPath}`);
  console.log(`Category: ${category} | Audience: ${audience}`);
  console.log(`Top insight: ${top ? top.title : "(none — check sourceErrors)"}`);
  if (errors.length) console.log(`Source errors:\n- ${errors.join("\n- ")}`);
}

const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isEntrypoint) await main();
