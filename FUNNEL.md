# Funnel backend — design notes

What this is: the lead-capture and appointment layer for kareemjamaltherealtor.com,
built by taking the handful of patterns from
[liquidslr/system-design-notes](https://github.com/liquidslr/system-design-notes)
that actually apply at this scale, and deliberately leaving the rest alone.

The goal is two numbers: **contact details captured** and **appointments set**.
Everything below exists to move one of those, or to stop them being lost.

---

## 1. Sizing first (Ch.02 — Back-of-the-Envelope Estimation)

This is the most important chapter in the book for us, because it is the one
that tells us what *not* to build.

Planning for a peak an order of magnitude above today's traffic:

| Quantity | Assumption | Result |
|---|---|---|
| Visitors | 50,000 / month (≈10× today) | ~1,700 / day |
| Request rate | flat average | **0.02 req/s** |
| Peak hour | 10× average | **0.2 req/s** |
| Viral spike | 5,000 visitors in one hour | **1.4 req/s** |
| Funnel events | ~12 per visit, batched ~2 writes/session | ~100k writes / month |
| Raw event storage | ~200 bytes/row, 600k rows/month | **~120 MB / month** |
| Leads | 1.5% conversion | ~750 / month, **25 / day** |
| Appointments | 20% of leads | ~150 / month, **5 / day** |

**What that rules out.** At 1.4 req/s in the worst case, a single small Postgres
instance is operating at a rounding error of its capacity. So: no sharding, no
consistent hashing (Ch.05), no read replicas, no cache tier, no message broker,
no streaming aggregation layer. Reaching for any of them here would be cargo
cult — the designs in those chapters are answers to a load we will not see.

**What it does rule in.** Raw events at 120 MB/month against a 500 MB free tier
is the one number that actually binds. That is why `funnel_gc()` enforces a
90-day retention window on `funnel_events` while `funnel_daily` keeps the
aggregates forever. The rollup is not premature optimisation; it is the thing
that keeps this on the free tier indefinitely.

---

## 2. What was taken, and where it lives

| Chapter | Applied as | File |
|---|---|---|
| 04 · Rate Limiter | Token bucket per IP, state in Postgres, fails open | `web/src/lib/funnel/ratelimit.ts`, `consume_token()` |
| 07 · Unique ID Generator | Time-sortable base36 IDs; dedupe fingerprints | `web/src/lib/funnel/ids.ts` |
| 10 · Notification System | Async lead alerts, retry + backoff + dead-letter | `web/src/lib/funnel/notify.ts` |
| 19 · Distributed Message Queue | An `outbox` table with `SKIP LOCKED`, not a broker | `claim_outbox()`, `/api/cron/dispatch` |
| 21 · Ad Click Event Aggregation | Batched beacons → raw events → nightly rollup | `web/public/funnel.js`, `/api/events`, `/api/cron/rollup` |
| 22 · Hotel Reservation System | Slot inventory + booking with idempotency | `/api/book`, `bookings_one_active_per_slot` |

Chapters 05, 06, 09, 11–18, 20, 23–28 were read and deliberately not applied.

---

## 3. How the capture path works

```
visitor submits
      │
      ├─ 1. rate limit by IP ──────── Ch.04 · fails OPEN
      │      a lost lead costs a commission; a spam lead costs ten seconds
      │
      ├─ 2. honeypot + validation
      │
      ├─ 3. mint lead id + fingerprint ─ Ch.07
      │      fingerprint = sha256(email|phone + 10-minute bucket)
      │      double-tapped submits collapse into one row
      │
      ├─ 4. INSERT ... ON CONFLICT DO NOTHING   ← durable point
      │
      ├─ 5. enqueue alert into outbox ── Ch.19
      │
      └─ 6. return 202 ────────────────  visitor is done here
             │
             └─ after() → poke dispatcher → Resend email  (out of band)
```

**The load-bearing idea is step 6.** The visitor's spinner is bounded by one
Postgres insert. It is not bounded by whether an email provider is having a bad
afternoon. Today every form on the site posts straight to Formspree and waits —
if Formspree is slow, the form is slow, and if Formspree is down, the lead is
gone. Writing the lead down *first* and delivering the alert *second* is the
entire contribution of Ch.10, and it is worth more than every other change here.

Formspree is kept as a fallback in `lead-form.tsx`: if `/api/lead` returns 5xx,
the client retries against Formspree before ever showing an error. A lead that
reaches neither sink is the only outcome that is genuinely unacceptable.

---

## 4. How booking works (and why it can't double-book)

Ch.22's central problem: two people click the same slot at the same moment. The
obvious implementation is a race:

```
  request A: SELECT → free ─┐
  request B: SELECT → free ─┤ both read "free"
  request A: INSERT ────────┤ both insert
  request B: INSERT ────────┘ two people, one slot
```

No amount of application-level checking fixes this, because the check and the
write are not atomic. The fix is one line of DDL:

```sql
create unique index bookings_one_active_per_slot
  on bookings (slot_id)
  where status in ('pending','confirmed');
```

Both requests still race. Postgres serialises them, exactly one INSERT survives,
and the loser gets error `23505`. `/api/book` translates that into a `409` and
the UI refreshes the grid in place, keeping the visitor's details. **Correctness
lives in the constraint; the route's only job is not to swallow the error.**

The second Ch.22 idea is idempotency. The booker mints an idempotency key *once
per attempt* and reuses it across retries, so a double-tapped Confirm — or a
retry after a response is lost in flight — produces one appointment. Minting the
key per-request would defeat the whole mechanism.

`/api/slots` is explicitly advisory. What it returns is a snapshot, cached 30s at
the edge. It is never the source of truth about availability, and the UI is
written on the assumption that a slot may vanish between render and confirm.

---

## 5. How the analytics work

The question worth answering: **which of the 36 guide pages produces
appointments**, as opposed to which ones merely get traffic.

`funnel.js` runs on every page (Next routes and static guides alike) and:

- buffers events in memory, flushing on batch-of-20, a 10s timer, or `pagehide`
- uses `navigator.sendBeacon` on exit — the only transport browsers promise to
  complete after the page is gone, which matters because the most valuable
  events (scroll depth, time on page, form abandonment) are only known at exit
- stamps events client-side, so a whole session doesn't collapse onto the
  moment the tab closed
- auto-tracks `page_view`, `scroll_depth` at 25/50/75/100, `form_start`,
  `cta_click`, `contact_click`, `page_exit`

The gap between `form_start` and `generate_lead` is the abandonment rate, and
it is the single most actionable number the site can produce.

`/api/events` appends raw rows; `/api/cron/rollup` aggregates into `funnel_daily`
nightly, re-processing the last two days because late beacons are normal and
`rollup_funnel()` is idempotent. This is Ch.21's batch layer. The streaming layer
is skipped outright — nobody needs sub-minute funnel numbers here, and the raw
table is queryable directly for live figures.

Useful query once data accumulates:

```sql
-- which guide pages actually convert
select page_path,
       sum(hits) filter (where event = 'page_view')     as views,
       sum(hits) filter (where event = 'form_start')    as starts,
       sum(hits) filter (where event = 'generate_lead') as leads
from funnel_daily
where day > current_date - 30
group by page_path
order by leads desc nulls last;
```

---

## 6. Deliberate trade-offs

- **The rate limiter fails open.** If Postgres is unreachable, requests pass.
  Asymmetric cost: a missed spam lead is free, a missed real lead is not.
- **Delivery is at-least-once, not exactly-once.** If the email sends and then
  `markDone` fails, Kareem gets a duplicate alert. Exactly-once would cost a
  distributed transaction to protect against the *cheaper* failure.
- **Analytics loss is acceptable.** Every path in `/api/events` and `funnel.js`
  swallows errors and returns 204. Breaking the page to save a beacon is a bad
  trade.
- **Booking is confirmed, not held.** Slots go straight to `confirmed` rather
  than a `pending` hold, because at ~5 bookings/day contention is negligible and
  a hold state is one more thing to expire. The `pending` status and
  `hold_expires_at` column exist for when that stops being true.
- **RLS on, zero policies.** The anon key is public on a static site. Every
  table is reachable only through the service role held by server routes.

---

## 7. Deployment

### Environment variables (Vercel project → Settings → Environment Variables)

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_URL` | yes | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Server only.** Bypasses RLS — never expose to the browser |
| `RESEND_API_KEY` | yes | For lead + booking alerts |
| `LEAD_ALERT_FROM` | no | Defaults to `leads@kareemjamaltherealtor.com` — the domain must be verified in Resend |
| `LEAD_ALERT_TO` | no | Defaults to `kjamal@rodeore.com`; comma-separated for multiple |
| `CRON_SECRET` | recommended | Guards `/api/cron/*`; unset means open |
| `NEXT_PUBLIC_SITE_URL` | recommended | Used to poke the dispatcher after capture |

Everything degrades safely when unset: `/api/lead` returns 503 and the client
falls back to Formspree, `/api/slots` reports no availability and the booker
shows the call-me fallback, and `/api/events` silently no-ops.

### Database

```bash
# apply the schema
psql "$DATABASE_URL" -f supabase/migrations/0001_funnel.sql

# generate a month of weekday slots (9–11am, 1–4pm PT, 30 min each)
psql "$DATABASE_URL" -c "select generate_slots(current_date, current_date + 30);"
```

`generate_slots` is idempotent — re-run it monthly, or from a cron, without
producing duplicates.

### Resend

`LEAD_ALERT_FROM` must be on a domain verified in Resend. The only domain on the
account today is `timelesstreasuresart.com`, and it is in a `failed` state —
`kareemjamaltherealtor.com` needs to be added and its DNS records verified
before alerts will deliver. Until then the outbox retries and dead-letters after
five attempts; **the leads themselves are still captured**, which is the point of
writing them down before sending anything.
