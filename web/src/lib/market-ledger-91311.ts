/**
 * Editorial source of truth for the Ownership Lab's dated ZIP 91311 market card.
 * Update only after verifying a current, ZIP-level primary source. Never stamp
 * the deployment date as the market reporting period.
 */
export const marketLedger91311 = {
  zip: "91311",
  area: "Chatsworth, California",
  reportingPeriod: "October 2026",
  reviewedOn: "November 14, 2026",
  source: "Redfin · 91311 Housing Market",
  sourceUrl: "https://www.redfin.com/zipcode/91311/housing-market",
  medianSoldPrice: 902038,
  medianSoldPriceYoYPercent: 0.2,
  closedSales: 78,
  closedSalesPriorYear: 86,
  medianDaysOnMarket: 50,
  medianDaysOnMarketPriorYear: 65,
  definition: "All home types in ZIP 91311, as published by Redfin for October 2026.",
  lesson: "The median sale price barely changed year over year, while fewer homes sold. Transaction volume and the median price describe different parts of a market. Neither alone determines a specific home's value.",
} as const;
