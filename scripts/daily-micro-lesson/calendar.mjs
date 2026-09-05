// The 7-day rotating content calendar. Pure config + one date helper — no
// network, no API key — so verify.mjs can check it and generate.mjs can
// import it without side effects.
//
// Categories map onto the two things every KGJ post already has to declare:
// a pillar (West Valley Expertise · ADU Strategy · Generational Wealth) and
// a template shape (see the kgj-content-engine skill). Keeping the mapping
// here — instead of inventing a parallel taxonomy — means a generated brief
// slots into the existing content system instead of sitting next to it.

export const CALENDAR = [
  {
    day: "Sunday",
    category: "Mindset & Motivation",
    audience: "All",
    pillar: "Generational Wealth",
    template: "Personal Proof",
    focus: "A wealth-building or ownership principle, grounded in something real — never a generic hustle quote.",
  },
  {
    day: "Monday",
    category: "Market Pulse",
    audience: "All",
    pillar: "West Valley Expertise",
    template: "The Number",
    focus: "One fresh, sourced stat on inventory, price trend, or days on market — West Valley first, national second.",
  },
  {
    day: "Tuesday",
    category: "Buyer Intel",
    audience: "Buyers",
    pillar: "West Valley Expertise",
    template: "Correction",
    focus: "One actionable move a buyer should make TODAY given current rates/inventory — corrects a myth if one fits.",
  },
  {
    day: "Wednesday",
    category: "Investor Edge",
    audience: "Investors",
    pillar: "ADU Strategy",
    template: "The Number",
    focus: "A wealth-building math lesson — ADU economics, cash-flow math, or a leverage/equity insight.",
  },
  {
    day: "Thursday",
    category: "Agent Playbook",
    audience: "Agents",
    pillar: "West Valley Expertise",
    template: "Personal Proof",
    focus: "A tactic from Kareem's own process — how he actually verifies zoning, prices a pocket, or handles an objection.",
  },
  {
    day: "Friday",
    category: "Rate Watch",
    audience: "All",
    pillar: "West Valley Expertise",
    template: "The Number",
    focus: "This week's mortgage rate move and the concrete monthly-payment/affordability math it changes.",
  },
  {
    day: "Saturday",
    category: "Seller Strategy",
    audience: "Sellers",
    pillar: "Generational Wealth",
    template: "The Quiet Cost",
    focus: "What today's conditions mean for pricing, timing, or holding — the cost of waiting or the case for it.",
  },
];

/** Look up a calendar entry by JS day-of-week index (0 = Sunday). */
export function entryForDayIndex(index) {
  const entry = CALENDAR.find((_, i) => i === index);
  if (!entry) throw new Error(`No calendar entry for day index ${index}`);
  return entry;
}

/**
 * Today's entry in the brand's home timezone. Rotation is anchored to
 * America/Los_Angeles, not UTC — a job that fires at 13:00 UTC would land
 * on the wrong day of the LA week for part of the year (DST) if we used
 * `date.getUTCDay()` directly.
 */
export function entryForDate(date = new Date()) {
  const laWeekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
  }).format(date);
  const entry = CALENDAR.find((e) => e.day === laWeekday);
  if (!entry) throw new Error(`Could not resolve calendar entry for weekday "${laWeekday}"`);
  return entry;
}

/** YYYY-MM-DD in America/Los_Angeles, used for filenames and the brief header. */
export function laDateStamp(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
