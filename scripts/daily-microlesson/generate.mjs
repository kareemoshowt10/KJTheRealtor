// Runs the full 6am pipeline: pull every source, rank against today's
// rotation slot, draft the script + visual brief, write it to
// content/daily-microlessons/, and best-effort push it to Notion/Slack.
//
// Run manually with FIRECRAWL_API_KEY + ANTHROPIC_API_KEY set, or via
// .github/workflows/daily-microlesson.yml on a daily cron. Pure helpers
// (rank.mjs, script-writer.mjs's non-network exports) are unit-tested
// without any API key — see verify.mjs.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAll } from "./sources.mjs";
import { categoryForDate, rank } from "./rank.mjs";
import { requestScript, assemble, renderMarkdown } from "./script-writer.mjs";

const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

/** Best-effort delivery: never let a missing/broken webhook fail the run. */
async function deliver(packet, markdown) {
  const { NOTION_API_KEY, NOTION_DATABASE_ID, SLACK_WEBHOOK_URL } = process.env;

  if (NOTION_API_KEY && NOTION_DATABASE_ID) {
    try {
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            Name: { title: [{ text: { content: `${packet.contentDate} — ${packet.category}` } }] },
            Audience: { rich_text: [{ text: { content: packet.targetAudience } }] },
            "Content Type": { rich_text: [{ text: { content: packet.contentType } }] },
          },
          children: [{ object: "block", type: "code", code: { language: "plain text", rich_text: [{ text: { content: markdown.slice(0, 2000) } }] } }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) console.error("[deliver] Notion push failed:", res.status, await res.text());
    } catch (err) {
      console.error("[deliver] Notion push failed:", err.message || err);
    }
  }

  if (SLACK_WEBHOOK_URL) {
    try {
      const res = await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: `*${packet.category}* (${packet.targetAudience}) — today's micro-lesson is ready:\n\`\`\`${markdown}\`\`\`` }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) console.error("[deliver] Slack push failed:", res.status, await res.text());
    } catch (err) {
      console.error("[deliver] Slack push failed:", err.message || err);
    }
  }
}

export async function run({ now = new Date() } = {}) {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!firecrawlKey) throw new Error("FIRECRAWL_API_KEY is not set. Copy .env.example to .env and fill in a key from firecrawl.dev.");
  if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and fill in a key from console.anthropic.com.");

  const { Firecrawl } = await import("firecrawl");
  const firecrawlClient = new Firecrawl({ apiKey: firecrawlKey });

  const category = categoryForDate(now);
  console.log(`Today (${now.toDateString()}) is a "${category.label}" day — audience: ${category.audience}`);

  const items = await fetchAll(firecrawlClient);
  console.log(`Collected ${items.length} raw item(s) across all sources.`);

  const ranked = rank(items, category, now);
  const top3 = ranked.slice(0, 3);
  if (!top3.length) throw new Error("No usable items survived ranking — every source failed or returned nothing today.");

  console.log("Top 3 candidates:");
  top3.forEach((it, i) => console.log(`  ${i + 1}. [${it.score.toFixed(1)}] (${it.source}) ${it.title}`));

  const topItem = top3[0];
  const date = now.toISOString().slice(0, 10);
  const modelOutput = await requestScript({ item: topItem, category, date, apiKey: anthropicKey });
  const packet = assemble({ modelOutput, item: topItem, category, contentType: topItem.contentType, date });
  const markdown = renderMarkdown(packet);

  const outDir = path.resolve(fileURLToPath(import.meta.url), "../../../content/daily-microlessons");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, `${date}.json`), JSON.stringify({ ...packet, runnerUp: top3.slice(1) }, null, 2) + "\n");
  await writeFile(path.join(outDir, `${date}.md`), markdown);
  console.log(`Wrote content/daily-microlessons/${date}.{json,md}`);

  await deliver(packet, markdown);
  return packet;
}

if (isEntrypoint) {
  run().catch((err) => {
    console.error("daily-microlesson generate failed:", err.message || err);
    process.exit(1);
  });
}
