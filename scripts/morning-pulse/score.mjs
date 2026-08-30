// Scores raw candidate signals so the top one can be handed to the writing
// step. Pure functions only — no fetches — so verify.mjs can exercise every
// branch without a network call or an API key.

/**
 * A candidate is { title, kind: 'stat'|'reddit'|'rss', numeric?: boolean,
 * engagement?: number, publishedAt?: string|Date }.
 * Score components:
 *  - relevance: does the title touch the day's category angle keywords?
 *  - novelty: is there a concrete number in it? (stats beat vibes)
 *  - audience value: reddit engagement, or a flat weight for curated stats
 *  - recency: published today scores higher than a 3-day-old post
 */
export function scoreCandidate(candidate, { keywords = [] } = {}) {
  const title = (candidate.title || "").toLowerCase();
  let score = 0;

  const relevanceHits = keywords.filter((k) => title.includes(k.toLowerCase())).length;
  score += relevanceHits * 3;

  if (/\d/.test(title)) score += 2; // has a number: rate, price, percent, days
  if (/%|\$/.test(title)) score += 1; // has a unit that makes the number concrete

  if (candidate.kind === "stat") score += 4; // curated official data beats crowd chatter
  if (candidate.kind === "reddit") {
    score += Math.min(3, Math.log10((candidate.engagement || 1) + 1));
  }

  if (candidate.publishedAt) {
    const ageHours = (Date.now() - new Date(candidate.publishedAt).getTime()) / 36e5;
    if (ageHours <= 24) score += 2;
    else if (ageHours <= 72) score += 1;
  }

  return Number(score.toFixed(2));
}

/** Ranks candidates highest-first; ties break toward 'stat' kind (more durable, on-brand). */
export function rankCandidates(candidates, opts) {
  return [...candidates]
    .map((c) => ({ ...c, _score: scoreCandidate(c, opts) }))
    .sort((a, b) => b._score - a._score || (a.kind === "stat" ? -1 : 1));
}
