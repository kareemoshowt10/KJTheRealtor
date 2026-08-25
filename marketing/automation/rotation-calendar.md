# 7-Day Rotation Calendar

Each day pulls from a narrower slice of sources so the daily search stays
fast and the insight stays sharp — a Monday market stat and a Sunday
mindset post shouldn't be fished from the same query.

| Day | Category | Content type | Audience | Pillar tie-in | Primary sources |
|---|---|---|---|---|---|
| Mon | **Market Pulse** | Data stat | All | West Valley Expertise | Zillow Research, Redfin housing-market commentary |
| Tue | **Buyer Intel** | Actionable tip | Buyers | West Valley Expertise | Redfin/Zillow inventory + NAR affordability index |
| Wed | **Investor Edge** | Wealth-building insight | Investors | Generational Wealth · ADU Strategy | BiggerPockets, Census housing starts/permits |
| Thu | **Agent Playbook** | Tactic/script | Agents | West Valley Expertise | Inman News, r/RealEstate top threads |
| Fri | **Rate Watch** | Mortgage rate update | Buyers, Sellers | West Valley Expertise | Mortgage News Daily, FRED `MORTGAGE30US` |
| Sat | **Seller Strategy** | Actionable tip | Sellers | Generational Wealth | Redfin days-on-market / price-cut data, NAR existing-home sales |
| Sun | **Mindset/Motivation** | Inspiration | All | Generational Wealth | r/realestateinvesting, BiggerPockets — real quotes/questions, never invented |

**Novelty guard:** before drafting, the run checks the last 7 files in
`marketing/automation/samples/` so the same stat doesn't repeat inside a
week (e.g., don't run the 28-month inventory streak two Tuesdays in a row
once it's stale).

**Anti-doom guard (same denylist logic as `scripts/market-pulse`):** reject
headlines about crashes, fraud, lawsuits, or disaster framing as the day's
hook. The brand teaches; it doesn't fearmonger.
