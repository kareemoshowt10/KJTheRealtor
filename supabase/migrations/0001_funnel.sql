-- ============================================================================
-- KJTheRealtor funnel backend — schema
--
-- Applies four patterns from the system-design notes, sized honestly for a
-- solo-agent site (see FUNNEL.md for the back-of-the-envelope math):
--
--   Ch.04 Rate Limiter          -> rate_limits + consume_token()
--   Ch.07 Unique ID Generator   -> text ids, time-sortable, minted app-side
--   Ch.10 Notification System   -> outbox with retry/backoff + dead-lettering
--   Ch.19 Distributed Queue     -> outbox table IS the queue (no broker)
--   Ch.21 Event Aggregation     -> funnel_events (raw) -> funnel_daily (rollup)
--   Ch.22 Hotel Reservation     -> slots + bookings, double-booking prevented
--                                  by a partial unique index, not app logic
--
-- Every table is RLS-enabled with NO policies. That is deliberate: the anon
-- key is public on a static site, so nothing here is reachable except through
-- the service role held by the server routes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- LEADS — the thing the whole funnel exists to produce
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id                 text primary key,
  created_at         timestamptz not null default now(),

  name               text not null,
  email              text,
  phone              text,
  message            text,
  intent             text,            -- which chip / goal they tapped
  consent            boolean not null default false,

  -- where in the site it happened
  source             text,            -- form identifier e.g. 'homepage-hero'
  page_path          text,
  visitor_id         text,
  session_id         text,

  -- attribution, carried over from track.js (first + last touch)
  lead_source        text,
  first_touch_source text,
  utm_source         text,
  utm_medium         text,
  utm_campaign       text,
  utm_term           text,
  utm_content        text,
  gclid              text,
  fbclid             text,
  referrer           text,
  landing_page       text,

  -- Idempotency. hash(email|phone + 10-minute bucket). A double-tapped submit,
  -- a retry after a flaky network, or a bot replaying the request all collapse
  -- into one row instead of three alerts to Kareem's phone.
  fingerprint        text unique,

  status             text not null default 'new'
    check (status in ('new','contacted','booked','won','lost','spam'))
);

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_source_idx  on public.leads (lead_source, created_at desc);
create index if not exists leads_status_idx  on public.leads (status, created_at desc);

-- ---------------------------------------------------------------------------
-- FUNNEL EVENTS — Ch.21, append-only, highest volume table here
-- ---------------------------------------------------------------------------
create table if not exists public.funnel_events (
  id          bigserial primary key,
  ts          timestamptz not null default now(),
  event       text not null,        -- page_view, cta_click, form_start, ...
  visitor_id  text,
  session_id  text,
  page_path   text,
  lead_source text,
  props       jsonb not null default '{}'::jsonb
);

create index if not exists funnel_events_ts_idx      on public.funnel_events (ts desc);
create index if not exists funnel_events_event_idx   on public.funnel_events (event, ts desc);
create index if not exists funnel_events_visitor_idx on public.funnel_events (visitor_id, ts);

-- Pre-aggregated rollup. Raw events answer "what happened"; this answers
-- "which of the 36 guide pages actually produces appointments" without
-- scanning millions of rows every time the dashboard loads.
create table if not exists public.funnel_daily (
  day       date not null,
  page_path text not null,
  event     text not null,
  visitors  bigint not null default 0,
  hits      bigint not null default 0,
  primary key (day, page_path, event)
);

-- Idempotent rollup: safe to re-run for the same day, which matters because
-- late-arriving beacons keep trickling in after midnight.
create or replace function public.rollup_funnel(target_day date default (current_date - 1))
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  insert into public.funnel_daily (day, page_path, event, visitors, hits)
  select
    target_day,
    coalesce(page_path, '(none)'),
    event,
    count(distinct visitor_id),
    count(*)
  from public.funnel_events
  where ts >= target_day::timestamptz
    and ts <  (target_day + 1)::timestamptz
  group by 2, 3
  on conflict (day, page_path, event) do update
    set visitors = excluded.visitors,
        hits     = excluded.hits;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- ---------------------------------------------------------------------------
-- SLOTS + BOOKINGS — Ch.22
-- ---------------------------------------------------------------------------
create table if not exists public.slots (
  id        text primary key,
  starts_at timestamptz not null unique,
  ends_at   timestamptz not null,
  kind      text not null default 'consult'
    check (kind in ('consult','walkthrough','listing_visit')),
  is_open   boolean not null default true,
  check (ends_at > starts_at)
);

create index if not exists slots_open_idx on public.slots (starts_at)
  where is_open;

create table if not exists public.bookings (
  id              text primary key,
  slot_id         text not null references public.slots (id) on delete restrict,
  lead_id         text references public.leads (id) on delete set null,

  name            text not null,
  email           text,
  phone           text not null,
  topic           text,
  notes           text,

  status          text not null default 'confirmed'
    check (status in ('pending','confirmed','cancelled','no_show','completed')),

  -- Ch.22's reservation idempotency key. Client sends the same key on retry,
  -- so a double-tapped "Confirm" produces one appointment, not two.
  idempotency_key text unique,

  -- Holds expire. A 'pending' row that is never confirmed must not squat on a
  -- slot forever; the dispatcher sweeps these back to 'cancelled'.
  hold_expires_at timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---- The single most important line in this file --------------------------
-- Double-booking is prevented by the database, not by application code.
-- Two concurrent requests for the same slot both pass any "is it free?" check
-- you write in JS; exactly one of them survives this index. The loser gets a
-- unique-violation, which the route turns into a clean "just taken" response.
create unique index if not exists bookings_one_active_per_slot
  on public.bookings (slot_id)
  where status in ('pending','confirmed');
-- ---------------------------------------------------------------------------

create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx  on public.bookings (status, created_at desc);

-- Convenience view: slots that are genuinely bookable right now.
create or replace view public.open_slots as
select s.id, s.starts_at, s.ends_at, s.kind
from public.slots s
where s.is_open
  and s.starts_at > now()
  and not exists (
    select 1 from public.bookings b
    where b.slot_id = s.id
      and b.status in ('pending','confirmed')
  )
order by s.starts_at;

-- Generate weekday slots in a window. Idempotent — re-running never
-- duplicates, because starts_at is unique.
create or replace function public.generate_slots(
  from_day    date,
  to_day      date,
  hours       int[] default array[9,10,11,13,14,15,16],
  slot_kind   text  default 'consult',
  tz          text  default 'America/Los_Angeles'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  d          date;
  h          int;
  local_ts   timestamptz;
  made       integer := 0;
begin
  d := from_day;
  while d <= to_day loop
    -- weekdays only (1=Mon .. 5=Fri)
    if extract(isodow from d) between 1 and 5 then
      foreach h in array hours loop
        local_ts := (d::text || ' ' || lpad(h::text, 2, '0') || ':00:00')::timestamp
                    at time zone tz;
        insert into public.slots (id, starts_at, ends_at, kind)
        values (
          'slot_' || to_char(local_ts at time zone tz, 'YYYYMMDD_HH24MI'),
          local_ts,
          local_ts + interval '30 minutes',
          slot_kind
        )
        on conflict (starts_at) do nothing;
        if found then made := made + 1; end if;
      end loop;
    end if;
    d := d + 1;
  end loop;
  return made;
end;
$$;

-- ---------------------------------------------------------------------------
-- OUTBOX — Ch.10 + Ch.19
--
-- This is the message queue. Not Kafka, not SQS: one table, polled by a cron
-- route. It has the properties that actually matter at this scale — durable,
-- at-least-once, retryable with backoff, dead-letterable, and deduped — and
-- none of the ops cost. Chapter 19 exists to tell you which properties you
-- need; it does not oblige you to run a broker to get them.
-- ---------------------------------------------------------------------------
create table if not exists public.outbox (
  id              bigserial primary key,
  topic           text not null,      -- 'lead.alert' | 'booking.alert'
  payload         jsonb not null,
  status          text not null default 'pending'
    check (status in ('pending','done','dead')),
  attempts        int not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error      text,
  dedupe_key      text unique,
  created_at      timestamptz not null default now()
);

create index if not exists outbox_ready_idx
  on public.outbox (next_attempt_at)
  where status = 'pending';

-- Claim a batch for delivery. SKIP LOCKED means two overlapping cron
-- invocations never hand the same message to two senders.
create or replace function public.claim_outbox(batch_size int default 10)
returns setof public.outbox
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.outbox o
     set attempts        = o.attempts + 1,
         next_attempt_at = now() + (interval '1 minute' * power(3, o.attempts))
   where o.id in (
     select id from public.outbox
      where status = 'pending'
        and next_attempt_at <= now()
      order by next_attempt_at
      limit batch_size
      for update skip locked
   )
  returning o.*;
end;
$$;

-- ---------------------------------------------------------------------------
-- RATE LIMITS — Ch.04, token bucket
--
-- Kept in Postgres rather than in memory because serverless routes are
-- horizontally scaled and regionally spread: an in-process counter limits one
-- lambda instance, not one visitor. One row per bucket, refilled lazily on
-- read so there is no background job.
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket     text primary key,
  tokens     real not null,
  updated_at timestamptz not null default now()
);

create or replace function public.consume_token(
  p_bucket   text,
  p_capacity real,
  p_refill   real,   -- tokens per second
  p_cost     real default 1
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cur      real;
  last_at  timestamptz;
  refilled real;
begin
  insert into public.rate_limits (bucket, tokens, updated_at)
  values (p_bucket, p_capacity, now())
  on conflict (bucket) do nothing;

  select tokens, updated_at into cur, last_at
    from public.rate_limits
   where bucket = p_bucket
     for update;

  refilled := least(
    p_capacity,
    cur + extract(epoch from (now() - last_at))::real * p_refill
  );

  if refilled < p_cost then
    update public.rate_limits
       set tokens = refilled, updated_at = now()
     where bucket = p_bucket;
    return false;
  end if;

  update public.rate_limits
     set tokens = refilled - p_cost, updated_at = now()
   where bucket = p_bucket;
  return true;
end;
$$;

-- Housekeeping: drop idle buckets and aged raw events. Raw events are the only
-- table that grows without bound; the daily rollup is what you keep forever.
create or replace function public.funnel_gc(
  events_retention interval default interval '90 days'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.rate_limits where updated_at < now() - interval '1 day';
  delete from public.funnel_events where ts < now() - events_retention;
  delete from public.outbox
   where status = 'done' and created_at < now() - interval '30 days';

  -- expire abandoned holds so the slot returns to inventory
  update public.bookings
     set status = 'cancelled', updated_at = now()
   where status = 'pending'
     and hold_expires_at is not null
     and hold_expires_at < now();
end;
$$;

-- ---------------------------------------------------------------------------
-- LOCK IT DOWN — RLS on, zero policies. Service role only.
-- ---------------------------------------------------------------------------
alter table public.leads         enable row level security;
alter table public.funnel_events enable row level security;
alter table public.funnel_daily  enable row level security;
alter table public.slots         enable row level security;
alter table public.bookings      enable row level security;
alter table public.outbox        enable row level security;
alter table public.rate_limits   enable row level security;

revoke all on public.leads, public.funnel_events, public.funnel_daily,
              public.slots, public.bookings, public.outbox, public.rate_limits
  from anon, authenticated;

revoke all on function public.consume_token(text, real, real, real) from anon, authenticated;
revoke all on function public.claim_outbox(int)                      from anon, authenticated;
revoke all on function public.rollup_funnel(date)                    from anon, authenticated;
revoke all on function public.generate_slots(date, date, int[], text, text) from anon, authenticated;
revoke all on function public.funnel_gc(interval)                    from anon, authenticated;
