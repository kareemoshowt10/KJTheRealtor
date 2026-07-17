import type { MediaType } from './types';

/** Deterministic doc IDs so upserts and uniqueness are enforced by the doc ID itself. */

export function titleDocId(mediaType: MediaType, tmdbId: number): string {
  return `${mediaType}_${tmdbId}`;
}

export function userTitleDocId(uid: string, titleId: string): string {
  return `${uid}_${titleId}`;
}

export function followDocId(followerId: string, followeeId: string): string {
  return `${followerId}_${followeeId}`;
}

export function threadDocId(titleId: string, tab: string): string {
  return `${titleId}_${tab}`;
}

export function voteDocId(voterId: string, postId: string): string {
  return `${voterId}_${postId}`;
}
