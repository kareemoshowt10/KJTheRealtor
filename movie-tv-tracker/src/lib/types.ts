export type MediaType = 'movie' | 'tv';

export type WatchStatus = 'watchlist' | 'watching' | 'completed' | 'dropped';

export type RatingReason =
  | 'initial'
  | 'rewatch'
  | 'finale'
  | 'time_decay_review'
  | 'manual';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Title {
  id: string;
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
}

export interface UserTitle {
  id: string;
  user_id: string;
  title_id: string;
  status: WatchStatus;
  last_watched_at: string | null;
  rewatch_count: number;
  current_season: number | null;
  current_episode: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  title_id: string;
  score: number;
  reason: RatingReason;
  created_at: string;
}

export interface TmdbSearchResult {
  tmdb_id: number;
  media_type: MediaType;
  name: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
}

export interface RankedEntry {
  userTitle: UserTitle;
  title: Title;
  latestRating: Rating | null;
  dynamicScore: number | null;
}

// ── Phase 2 ─────────────────────────────────────────────────────────

export interface Follow {
  follower_id: string;
  followee_id: string;
  created_at: string;
}

export type DiscussionTab =
  | 'reviews'
  | 'episode_reactions'
  | 'rankings_debate'
  | 'similar_titles'
  | 'spoiler_talk';

export interface DiscussionThread {
  id: string;
  title_id: string;
  tab: DiscussionTab;
  created_at: string;
}

export interface DiscussionPost {
  id: string;
  thread_id: string;
  user_id: string;
  body: string;
  has_spoilers: boolean;
  created_at: string;
}

export interface ReviewVote {
  id: string;
  voter_id: string;
  post_id: string;
  vote: 1 | -1;
  created_at: string;
}

export interface ListRecord {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_collaborative: boolean;
  created_at: string;
}

export interface ListItem {
  list_id: string;
  title_id: string;
  rank: number;
  added_by: string;
}

export type ActivityType = 'rating' | 'watch_status';

export interface ActivityEvent {
  activity_type: ActivityType;
  created_at: string;
  user_id: string;
  username: string;
  title_id: string;
  title_name: string;
  media_type: MediaType;
  tmdb_id: number;
  poster_path: string | null;
  metadata: string;
  is_trusted?: boolean;
}

export interface PostWithMeta extends DiscussionPost {
  username: string;
  net_votes: number;
  user_vote: 1 | -1 | null;
  is_trusted: boolean;
}
