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
