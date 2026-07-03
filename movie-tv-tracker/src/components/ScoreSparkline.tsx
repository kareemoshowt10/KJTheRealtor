import type { Rating } from '@/lib/types';

interface Props {
  /** Ratings newest-first (as fetched); rendered oldest → newest. */
  ratings: Rating[];
}

const W = 220;
const H = 56;
const PAD = 6;

export default function ScoreSparkline({ ratings }: Props) {
  if (ratings.length < 2) return null;

  const chronological = [...ratings].reverse();
  const scores = chronological.map((r) => r.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = chronological.map((r, i) => {
    const x = PAD + (i / (chronological.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((r.score - min) / range) * (H - PAD * 2);
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${PAD},${H - PAD} ${polyline} ${W - PAD},${H - PAD}`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-14 w-56"
      role="img"
      aria-label={`Score history from ${scores[0].toFixed(1)} to ${scores[scores.length - 1].toFixed(1)}`}
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8c42" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ff8c42" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark-fill)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#ff8c42"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 2} fill="#ff8c42" />
      ))}
      <circle cx={last.x} cy={last.y} r={5.5} fill="none" stroke="#ff8c42" strokeOpacity="0.4" />
    </svg>
  );
}
