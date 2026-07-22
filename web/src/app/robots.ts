import type { MetadataRoute } from "next";

/**
 * Production indexing for kareemjamaltherealtor.com cutover.
 * Set ALLOW_INDEX=false only on pure staging deploys.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEX === "false") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL || "https://kareemjamaltherealtor.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${site.replace(/\/$/, "")}/sitemap.xml`,
  };
}
