// Unit-tests the argument parsing and payload shaping in send.mjs. Runs without
// an API key and sends nothing:
//   node scripts/email/verify.mjs
import { parseArgs, buildPayload, send, DEFAULT_FROM } from "./send.mjs";
import { formatDomain } from "./status.mjs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n      got:  ${JSON.stringify(actual)}\n      want: ${JSON.stringify(expected)}`}`);
};
const throws = (name, fn, fragment) => {
  let msg = null;
  try { fn(); } catch (err) { msg = err.message; }
  const ok = msg !== null && msg.includes(fragment);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${msg === null ? "no error" : msg})`}`);
};

// ── parseArgs ──
check("parses --flag value pairs", parseArgs(["--to", "a@b.com"]), { to: "a@b.com" });
check("parses --flag=value pairs", parseArgs(["--to=a@b.com"]), { to: "a@b.com" });
check("treats a trailing flag as boolean", parseArgs(["--dry-run"]), { "dry-run": true });
check("treats a flag followed by a flag as boolean", parseArgs(["--dry-run", "--to", "a@b.com"]), { "dry-run": true, to: "a@b.com" });
check("keeps a subject containing spaces intact", parseArgs(["--subject", "Your home value"]), { subject: "Your home value" });
check("keeps an = inside a value", parseArgs(["--subject=a=b"]), { subject: "a=b" });

// ── buildPayload ──
check(
  "defaults From to the kareem@ address",
  buildPayload({ to: "a@b.com", subject: "Hi", text: "Body" }),
  { from: DEFAULT_FROM, to: ["a@b.com"], subject: "Hi", text: "Body" }
);
check(
  "splits comma-separated recipients and trims them",
  buildPayload({ to: "a@b.com, c@d.com", subject: "Hi", text: "Body" }).to,
  ["a@b.com", "c@d.com"]
);
check(
  "maps --reply-to onto Resend's reply_to field",
  buildPayload({ to: "a@b.com", subject: "Hi", text: "Body", "reply-to": "kareem@gmail.com" }).reply_to,
  ["kareem@gmail.com"]
);
check(
  "reads the body from --html-file",
  buildPayload({ to: "a@b.com", subject: "Hi", "html-file": "note.html" }, () => "<p>Hi</p>").html,
  "<p>Hi</p>"
);
check(
  "omits cc/bcc when not supplied",
  Object.keys(buildPayload({ to: "a@b.com", subject: "Hi", text: "Body" })),
  ["from", "to", "subject", "text"]
);
throws("rejects a missing --to", () => buildPayload({ subject: "Hi", text: "Body" }), "--to is required");
throws("rejects a missing --subject", () => buildPayload({ to: "a@b.com", text: "Body" }), "--subject is required");
throws("rejects an empty --subject", () => buildPayload({ to: "a@b.com", subject: "", text: "B" }), "--subject is required");
throws("rejects a missing body", () => buildPayload({ to: "a@b.com", subject: "Hi" }), "one of --text");

// ── send: error surfacing, with a stubbed fetch so nothing leaves the machine ──
const stub = (status, body) => async () => ({ ok: status < 400, status, json: async () => body });
const asyncThrows = async (name, fn, fragment) => {
  let msg = null;
  try { await fn(); } catch (err) { msg = err.message; }
  const ok = msg !== null && msg.includes(fragment);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  (got ${msg === null ? "no error" : msg})`}`);
};

await asyncThrows(
  "surfaces Resend's message on a 403 (the unverified-domain case)",
  () => send({}, "key", stub(403, { message: "The kareemjamaltherealtor.com domain is not verified." })),
  "domain is not verified"
);
check("returns the parsed body on success", await send({}, "key", stub(200, { id: "abc-123" })), { id: "abc-123" });

// ── formatDomain ──
const formatted = formatDomain({
  name: "kareemjamaltherealtor.com",
  status: "verified",
  records: [{ record: "DKIM", type: "TXT", name: "resend._domainkey", value: "p=xyz", status: "verified" }],
});
check("reports a verified domain as live", formatted.includes("sending as kareem@kareemjamaltherealtor.com is live"), true);
check(
  "counts records still pending",
  formatDomain({
    name: "kareemjamaltherealtor.com",
    status: "pending",
    records: [
      { record: "DKIM", type: "TXT", name: "resend._domainkey", value: "p=xyz", status: "verified" },
      { record: "SPF", type: "MX", name: "send", value: "feedback-smtp.us-east-1.amazonses.com", priority: 10, status: "not_started" },
    ],
  }).includes("1 record(s) not verified yet"),
  true
);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
