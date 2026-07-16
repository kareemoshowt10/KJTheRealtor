-- Phase 4: community consensus ranking (the "community" + "confidence"
-- dimensions from the original ranking spec — distinct from a user's
-- personal dynamic score).

-- ---------------------------------------------------------------------
-- latest_ratings: one row per (user, title) — their current score.
-- ---------------------------------------------------------------------
create or replace view latest_ratings as
select distinct on (r.user_id, r.title_id)
  r.user_id,
  r.title_id,
  r.score,
  r.created_at
from ratings r
order by r.user_id, r.title_id, r.created_at desc;

-- ---------------------------------------------------------------------
-- title_community_stats: consensus score per title across all raters,
-- weighting trusted reviewers (net_votes >= 10) 1.5x, plus a rating_count
-- so the UI can express confidence (few ratings = less certain).
-- ---------------------------------------------------------------------
create or replace view title_community_stats as
select
  lr.title_id,
  count(*)::int as rating_count,
  avg(lr.score)::numeric(4, 2) as avg_score,
  (
    sum(lr.score * case when coalesce(ur.net_votes, 0) >= 10 then 1.5 else 1 end)
    / sum(case when coalesce(ur.net_votes, 0) >= 10 then 1.5 else 1 end)
  )::numeric(4, 2) as weighted_score,
  max(lr.created_at) as last_rated_at
from latest_ratings lr
left join user_reputation ur on ur.user_id = lr.user_id
group by lr.title_id;
