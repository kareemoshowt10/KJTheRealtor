// Reports whether kareemjamaltherealtor.com is verified for sending, and which
// DNS records are still missing:
//   node scripts/email/status.mjs
// Run it after pasting the records into Vercel → Domains → DNS. Propagation is
// usually minutes, so a "not_started" record right after adding it is normal.
const DOMAIN = "kareemjamaltherealtor.com";

export function formatDomain(domain) {
  const lines = [`${domain.name} — status: ${domain.status}`, ""];
  for (const r of domain.records || []) {
    const name = r.name === "" || r.name === "@" ? "@" : r.name;
    lines.push(`  [${r.status}] ${r.record} ${r.type}  ${name}`);
    lines.push(`      ${r.value}${r.priority ? `  (priority ${r.priority})` : ""}`);
  }
  const pending = (domain.records || []).filter((r) => r.status !== "verified");
  lines.push("");
  lines.push(
    domain.status === "verified"
      ? "Verified — sending as kareem@kareemjamaltherealtor.com is live."
      : `${pending.length} record(s) not verified yet.`
  );
  return lines.join("\n");
}

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set. See scripts/email/README.md.");
  const headers = { Authorization: `Bearer ${apiKey}` };

  const listRes = await fetch("https://api.resend.com/domains", { headers });
  const list = await listRes.json();
  if (!listRes.ok) throw new Error(`Resend API error (${listRes.status}): ${list.message || ""}`);

  const match = (list.data || []).find((d) => d.name === DOMAIN);
  if (!match) throw new Error(`${DOMAIN} is not in this Resend account.`);

  const detailRes = await fetch(`https://api.resend.com/domains/${match.id}`, { headers });
  const detail = await detailRes.json();
  if (!detailRes.ok) throw new Error(`Resend API error (${detailRes.status}): ${detail.message || ""}`);

  console.log(formatDomain(detail));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
