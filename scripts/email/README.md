# Sending as kareem@kareemjamaltherealtor.com

The domain is registered in Resend (region `us-east-1`, sending enabled). Once the
three DNS records below are live in Vercel, anything in this folder — or any app
holding the API key — can send with `kareem@kareemjamaltherealtor.com` in the From
line, signed with DKIM and SPF so it lands in the inbox rather than spam.

This is **sending only**. Nothing here receives mail: a reply to that address goes
nowhere until a mailbox exists for it, so set `--reply-to` to an address you
actually read (see "Replies" below).

## 1. DNS records (Vercel)

Vercel dashboard → the `kareemjamaltherealtor.com` project → **Settings → Domains
→ kareemjamaltherealtor.com → DNS Records**. Add all three. Vercel appends the
domain automatically, so enter the short names exactly as written.

| Type | Name | Value | Priority | TTL |
| --- | --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCprbYOlrDGUmbrMgK1D+pvgG1S0k8zFXnvAsfMQIZx1huVesH0E8ad+uHjoc6OmUDy/FTIKzYD2GIqBMhtZ71wwuNDwxdlQKt77beL8laMz3UQdbF/8TqEkpKV6kW+EW3E19aKn3W2XIqELdTaqj1hkQbTepBzD1hk+1gebBQKbQIDAQAB` | — | Auto |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 | 60 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — | 60 |

Two things that trip this up:

- The DKIM value is one long unbroken string. Paste it whole — no line breaks, no
  quotes, and don't let an editor insert a space.
- The MX and SPF records both sit on the `send` subdomain, not the root. That is
  deliberate: it leaves the root `MX` free, so adding a real mailbox later
  (Google Workspace, Zoho) won't collide with this.

Then confirm:

```sh
RESEND_API_KEY=re_xxx node scripts/email/status.mjs
```

It prints each record's state. Propagation usually takes minutes; `not_started`
immediately after adding a record is normal. Resend re-checks on its own, and the
status flips to `verified` when all three resolve.

### Worth adding once verified

A DMARC record tells receivers what to do with mail that fails the checks above,
and Gmail/Yahoo now expect one. Start in monitor mode:

| Type | Name | Value |
| --- | --- | --- |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:kareem@kareemjamaltherealtor.com` |

`p=none` only reports — it never blocks your mail. Tighten to `p=quarantine`
later, after a few weeks of clean reports.

## 2. The API key

Create one at [resend.com/api-keys](https://resend.com/api-keys) with **Sending
access**, scoped to `kareemjamaltherealtor.com`. It is shown once.

Keep it out of the repo — `.env` and `.env.local` are already gitignored:

```sh
echo 'RESEND_API_KEY=re_xxx' >> .env.local
```

For anything running on Vercel, add `RESEND_API_KEY` under the project's
**Settings → Environment Variables** instead. The key must never reach the
browser: a static page that fetches Resend directly would expose it to anyone
who opens devtools.

## 3. Sending

```sh
set -a && source .env.local && set +a   # load the key into this shell

node scripts/email/send.mjs \
  --to "client@example.com" \
  --subject "The Chatsworth comps you asked about" \
  --text "Hi Dana — here's what sold on your block this month." \
  --reply-to "showt010@gmail.com"
```

Flags:

| Flag | Meaning |
| --- | --- |
| `--to` | Required. Comma-separate multiple recipients. |
| `--subject` | Required. |
| `--text` / `--html` | Body. One of these (or a `*-file` variant) is required. |
| `--text-file` / `--html-file` | Read the body from a file — better for anything longer than a line. |
| `--reply-to` | Where replies land. Set this on every send. |
| `--cc` / `--bcc` | Optional, comma-separated. |
| `--from` | Override the From line. Any address `@kareemjamaltherealtor.com` works once verified. |
| `--dry-run` | Print the payload and send nothing. |

Start with `--dry-run`, then drop it.

## Replies

`kareem@kareemjamaltherealtor.com` can send but not receive. Until a mailbox
exists, always pass `--reply-to` with an inbox you monitor, or a reply is lost.
Two ways to close that gap when you want it:

- **A real mailbox** (Google Workspace, ~$7/mo) — adds root `MX` records and gives
  you a proper inbox on the domain. Coexists with this setup untouched.
- **Resend inbound receiving** — enable `receiving` on the domain and route
  incoming mail to a webhook. Useful for automation, not for reading mail by hand.

## Tests

```sh
node scripts/email/verify.mjs
```

Covers argument parsing, payload shaping, and error surfacing with a stubbed
fetch. No API key needed and nothing is sent.
