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
  /** Feature length for movies, typical episode length for TV. Null when TMDB has none. */
  runtime_minutes: number | null;
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
  /** Only populated by the detail endpoints — /search/multi does not return runtime. */
  runtime_minutes: number | null;
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

// ── Phase 4 ─────────────────────────────────────────────────────────

export interface CommunityStat {
  title_id: string;
  rating_count: number;
  avg_score: number;
  weighted_score: number;
  last_rated_at: string;
}

export interface CommunityEntry {
  title: Title;
  stat: CommunityStat;
}

// ── Phase 6 ─────────────────────────────────────────────────────────

export interface PlannedWatch {
  user_id: string;
  title_id: string;
  /** YYYY-MM-DD, local calendar date the user plans to watch this. */
  scheduled_date: string;
  created_at: string;
}

export interface PlannerEntry {
  userTitle: UserTitle;
  title: Title;
  /** null when not yet scheduled onto the calendar. */
  scheduledDate: string | null;
}

// ── Phase 7: watch behavior tracking ────────────────────────────────

/**
 * One viewing session: a single movie, or a single TV episode.
 *
 * This is the append-only record the whole behavior layer is built on.
 * `UserTitle.last_watched_at` / `current_episode` are current-state pointers
 * that overwrite themselves — they can say what you're up to, but not how
 * often you watch. These events keep the history that answers that.
 */
export interface WatchEvent {
  id: string;
  user_id: string;
  title_id: string;
  media_type: MediaType;
  /** ISO timestamp. May be backdated — you often log a watch the next morning. */
  watched_at: string;
  /** Local YYYY-MM-DD, denormalized so day/week bucketing needs no timezone math on read. */
  watched_date: string;
  /** null for movies. */
  season_number: number | null;
  episode_number: number | null;
  /** Minutes credited to this event, resolved at log time so later TMDB edits can't rewrite history. */
  runtime_minutes: number;
  is_rewatch: boolean;
}

/** A watch event joined with its title, for rendering a readable log. */
export interface WatchEventWithTitle {
  event: WatchEvent;
  title: Title;
}

/** One ISO-week bucket of watch activity. */
export interface WeekBucket {
  /** YYYY-MM-DD of that week's Monday. */
  weekStart: string;
  tvMinutes: number;
  movieMinutes: number;
  episodes: number;
  movies: number;
}

export interface DayBucket {
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  tvMinutes: number;
  movieMinutes: number;
}

export interface TopTitle {
  title: Title;
  minutes: number;
  plays: number;
}

/** Everything the behavior dashboard renders. */
export interface WatchStats {
  totalMinutes: number;
  episodeCount: number;
  movieCount: number;
  /** Distinct local dates with at least one logged watch. */
  activeDays: number;
  /** Consecutive weeks with activity, counting back from the current week. */
  currentStreakWeeks: number;
  longestStreakWeeks: number;
  /** Mean minutes per week across weeks since the first logged watch. */
  avgMinutesPerWeek: number;
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  weeks: WeekBucket[];
  days: DayBucket[];
  topTitles: TopTitle[];
  recent: WatchEventWithTitle[];
}
