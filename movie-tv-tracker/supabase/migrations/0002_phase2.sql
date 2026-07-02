-- Phase 2: review votes, reputation view, following activity view

-- ---------------------------------------------------------------------
-- review_votes (upvote/downvote on discussion_posts)
-- ---------------------------------------------------------------------
create table review_votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references discussion_posts(id) on delete cascade,
  vote int not null check (vote in (1, -1)),
  created_at timestamptz not null default now(),
  unique (voter_id, post_id)
);

alter table review_votes enable row level security;

create policy "vote tallies are publicly readable"
  on review_votes for select
  using (true);

create policy "users can insert their own votes"
  on review_votes for insert
  with check (auth.uid() = voter_id);

create policy "users can change their own votes"
  on review_votes for update
  using (auth.uid() = voter_id);

create policy "users can delete their own votes"
  on review_votes for delete
  using (auth.uid() = voter_id);

-- ---------------------------------------------------------------------
-- user_reputation view
-- Net votes received on all discussion posts a user has written.
-- ---------------------------------------------------------------------
create or replace view user_reputation as
select
  p.id as user_id,
  p.username,
  coalesce(sum(rv.vote), 0)::int as net_votes
from profiles p
left join discussion_posts dp on dp.user_id = p.id
left join review_votes rv on rv.post_id = dp.id
group by p.id, p.username;

-- Trusted reviewer threshold: net_votes >= 10
-- Used in app logic; no separate table needed.

-- ---------------------------------------------------------------------
-- following_activity view
-- Recent ratings + watch-status changes from everyone, filtered in app
-- to the users you follow.
-- ---------------------------------------------------------------------
create or replace view following_activity as
select
  'rating'              as activity_type,
  r.created_at,
  r.user_id,
  p.username,
  r.title_id,
  t.name                as title_name,
  t.media_type,
  t.tmdb_id,
  t.poster_path,
  r.score::text         as metadata,
  null::text            as extra
from ratings r
join profiles p on p.id = r.user_id
join titles t   on t.id = r.title_id

union all

select
  'watch_status'        as activity_type,
  ut.updated_at         as created_at,
  ut.user_id,
  p.username,
  ut.title_id,
  t.name                as title_name,
  t.media_type,
  t.tmdb_id,
  t.poster_path,
  ut.status             as metadata,
  null::text            as extra
from user_titles ut
join profiles p on p.id = ut.user_id
join titles t   on t.id = ut.title_id;
