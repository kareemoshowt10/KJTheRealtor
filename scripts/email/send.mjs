// Sends mail as kareem@kareemjamaltherealtor.com through Resend.
//   node scripts/email/send.mjs --to someone@example.com --subject "Hi" --text "Body"
// No dependencies: Resend's REST API over fetch is all this needs.
//
// Requires RESEND_API_KEY in the environment (see README.md in this folder).
import { readFileSync } from "node:fs";

export const DEFAULT_FROM = "Kareem Jamal <kareem@kareemjamaltherealtor.com>";
const API = "https://api.resend.com/emails";

// Flags are `--name value` or `--name=value`; `--dry-run` is a bare boolean.
export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq !== -1) {
      out[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

// Turns CLI flags into the JSON body Resend expects. Throws on anything the
// API would reject anyway, so a typo fails here instead of costing a send.
export function buildPayload(args, readFile = (p) => readFileSync(p, "utf8")) {
  const list = (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

  const to = list(args.to);
  if (!to.length) throw new Error("--to is required (comma-separate multiple recipients)");

  const subject = typeof args.subject === "string" ? args.subject : "";
  if (!subject) throw new Error("--subject is required");

  let html = typeof args.html === "string" ? args.html : undefined;
  let text = typeof args.text === "string" ? args.text : undefined;
  if (typeof args["html-file"] === "string") html = readFile(args["html-file"]);
  if (typeof args["text-file"] === "string") text = readFile(args["text-file"]);
  if (!html && !text) throw new Error("one of --text, --html, --text-file, --html-file is required");

  const payload = { from: typeof args.from === "string" ? args.from : DEFAULT_FROM, to, subject };
  if (html) payload.html = html;
  if (text) payload.text = text;

  const cc = list(args.cc);
  const bcc = list(args.bcc);
  const replyTo = list(args["reply-to"]);
  if (cc.length) payload.cc = cc;
  if (bcc.length) payload.bcc = bcc;
  if (replyTo.length) payload.reply_to = replyTo;

  return payload;
}

export async function send(payload, apiKey, fetchImpl = fetch) {
  const res = await fetchImpl(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Resend puts the useful part in `message`; fall back to the raw body.
    throw new Error(`Resend rejected the send (${res.status}): ${body.message || JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const payload = buildPayload(args);

  if (args["dry-run"]) {
    console.log(JSON.stringify(payload, null, 2));
    console.log("\nDry run — nothing sent.");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set. See scripts/email/README.md.");

  const result = await send(payload, apiKey);
  console.log(`Sent to ${payload.to.join(", ")} as ${payload.from}`);
  console.log(`Message id: ${result.id}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
