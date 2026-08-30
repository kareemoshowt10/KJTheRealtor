// The 7-day content category rotation. Pure lookup, no I/O — kept separate
// from generate.mjs so verify.mjs can test it without touching the network.

export const ROTATION = {
  1: { category: "Market Pulse", audience: "All", angle: "Fresh data stat from Zillow/Redfin (inventory, price trend, days on market)." },
  2: { category: "Buyer Intel", audience: "Buyers", angle: "One actionable tip for buyers based on current conditions." },
  3: { category: "Investor Edge", audience: "Investors", angle: "A wealth-building insight for real estate investors." },
  4: { category: "Agent Playbook", audience: "Agents", angle: "A tactic or script for real estate agents." },
  5: { category: "Rate Watch", audience: "All", angle: "Current mortgage rate update and what it means in dollars." },
  6: { category: "Seller Strategy", audience: "Sellers", angle: "Tips for sellers in today's market." },
  0: { category: "Mindset/Motivation", audience: "All", angle: "An inspirational real estate wealth or success principle." },
};

/** date: a JS Date. Returns the day's category entry. Sunday = 0 per Date#getDay(). */
export function categoryForDate(date) {
  return ROTATION[date.getDay()];
}
