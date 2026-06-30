-- Movie/TV Tracker — initial schema
-- Phase 1 tables (active) + Phase 2 tables (reserved, RLS-locked until built)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  using (true);

create policy "users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- titles (cached TMDB metadata, shared across all users)
-- ---------------------------------------------------------------------
create table titles (
  id uuid primary key default gen_random_uuid(),
  tmdb_id int not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  name text not null,
  poster_path text,
  release_date date,
  overview text,
  created_at timestamptz not null default now(),
  unique (tmdb_id, media_type)
);

alter table titles enable row level security;

create policy "titles are publicly readable"
  on titles for select
  using (true);

create policy "authenticated users can cache titles"
  on titles for insert
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- user_titles (a user's relationship to a title: status + progress)
-- ---------------------------------------------------------------------
create table user_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  status text not null default 'watchlist'
    check (status in ('watchlist', 'watching', 'completed', 'dropped')),
  last_watched_at timestamptz,
  rewatch_count int not null default 0,
  current_season int,
  current_episode int,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, title_id)
);

alter table user_titles enable row level security;

create policy "users can read their own library"
  on user_titles for select
  using (auth.uid() = user_id);

create policy "anyone can read another user's library for profiles"
  on user_titles for select
  using (true);

create policy "users can insert into their own library"
  on user_titles for insert
  with check (auth.uid() = user_id);

create policy "users can update their own library entries"
  on user_titles for update
  using (auth.uid() = user_id);

create policy "users can delete their own library entries"
  on user_titles for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- ratings (append-only score history; latest row = current score)
-- ---------------------------------------------------------------------
create table ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  score numeric(3, 1) not null check (score >= 0 and score <= 10),
  reason text not null default 'manual'
    check (reason in ('initial', 'rewatch', 'finale', 'time_decay_review', 'manual')),
  created_at timestamptz not null default now()
);

create index ratings_user_title_idx on ratings (user_id, title_id, created_at desc);

alter table ratings enable row level security;

create policy "ratings are publicly readable"
  on ratings for select
  using (true);

create policy "users can insert their own ratings"
  on ratings for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- updated_at trigger for user_titles
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_titles_set_updated_at
  before update on user_titles
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Phase 2 — reserved tables (schema only, no app code yet)
-- ---------------------------------------------------------------------
create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);

alter table follows enable row level security;

create policy "follows are publicly readable"
  on follows for select
  using (true);

create policy "users manage their own follows"
  on follows for all
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

create table lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  is_collaborative boolean not null default false,
  created_at timestamptz not null default now()
);

alter table lists enable row level security;

create policy "lists are publicly readable"
  on lists for select
  using (true);

create policy "owners manage their lists"
  on lists for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create table list_items (
  list_id uuid not null references lists(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  rank int not null,
  added_by uuid not null references profiles(id) on delete cascade,
  primary key (list_id, title_id)
);

alter table list_items enable row level security;

create policy "list items are publicly readable"
  on list_items for select
  using (true);

create table discussion_threads (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references titles(id) on delete cascade,
  tab text not null check (tab in
    ('reviews', 'episode_reactions', 'rankings_debate', 'similar_titles', 'spoiler_talk')),
  created_at timestamptz not null default now()
);

alter table discussion_threads enable row level security;

create policy "discussion threads are publicly readable"
  on discussion_threads for select
  using (true);

create table discussion_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references discussion_threads(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  has_spoilers boolean not null default false,
  created_at timestamptz not null default now()
);

alter table discussion_posts enable row level security;

create policy "discussion posts are publicly readable"
  on discussion_posts for select
  using (true);

create policy "users can post their own discussion posts"
  on discussion_posts for insert
  with check (auth.uid() = user_id);
