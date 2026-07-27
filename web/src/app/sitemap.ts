import type { MetadataRoute } from "next";

/**
 * robots.ts advertises /sitemap.xml. Before this route existed the hybrid
 * cutover left that URL returning a 404 HTML page — the legacy sitemap.xml
 * lived at the repo root and was never copied into web/public/ — so every
 * page below was dropped from Google's discovery feed.
 *
 * Every path here was verified to return HTTP 200 on production. A sitemap
 * that lists dead URLs is worse than no sitemap, so keep this list honest:
 * if a page is retired, remove it here in the same change.
 *
 * lastModified is deliberately omitted rather than stamped with build time —
 * a build does not mean the content changed, and a wrong freshness signal is
 * worse than none.
 */

/** Highest intent: the routes that should rank and convert. */
const PRIMARY = ["/", "/91311", "/93063", "/91304"];

/** Neighborhood / local-intent pages. */
const LOCAL = [
  "/west-hills",
  "/woodland-hills",
  "/calabasas",
  "/hidden-hills",
  "/encino",
];

/** Interactive tools and strategy sessions — the lead-generating library. */
const TOOLS = [
  "/buyer-presentation",
  "/seller-presentation",
  "/wealth-tools",
  "/mls-search",
  "/free-reports",
  "/91311/home-value",
];

/** Evergreen guides and reference content. */
const GUIDES = [
  "/answers",
  "/homeowners",
  "/investor-mindset",
  "/family-wealth-preservation",
  "/house-hacking",
  "/landlord-leasing",
  "/real-estate-partnerships",
  "/living-trust-guide",
  "/rate-buydown-guide",
  "/assumable-loan-guide",
  "/repair-credit-guide",
  "/appraisal-gap-guide",
  "/contractor-handyman-guide",
  "/yard-sale-guide",
  "/internet-bill-guide",
];

/** Brand / about pages. */
const ABOUT = ["/about", "/mission", "/buyers", "/sellers"];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://kareemjamaltherealtor.com"
  ).replace(/\/$/, "");

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  ) => ({
    url: path === "/" ? `${site}/` : `${site}${path}`,
    changeFrequency,
    priority,
  });

  return [
    ...PRIMARY.map((p) => entry(p, p === "/" ? 1 : 0.9, "weekly" as const)),
    ...LOCAL.map((p) => entry(p, 0.8, "monthly" as const)),
    ...TOOLS.map((p) => entry(p, 0.8, "monthly" as const)),
    ...GUIDES.map((p) => entry(p, 0.7, "monthly" as const)),
    ...ABOUT.map((p) => entry(p, 0.6, "yearly" as const)),
  ];
}
