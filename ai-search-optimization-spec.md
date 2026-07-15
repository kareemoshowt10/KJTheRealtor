# AI Search Optimization Spec — Addendum to All Queued Content Specs

**Applies to:** Zip code pages (93063, 91311, 91304), ADU Playbook, guideme.kareemjamaltherealtor.com process hub, and all future content pages.

**Why this exists:** AI engines (ChatGPT, Perplexity, Claude, Google AI Overviews) are becoming the first stop for buyers. When someone asks "can I afford to buy in Simi Valley," I want my content to be the answer that gets cited — with my name on it. This spec makes every page we ship citable by default.

---

## Rule 1: Answer First. Then Explain.

Every section on every page opens with the direct answer in the first sentence. No warm-up, no market context preamble, no "great question" energy. Answer, then teach.

**Wrong:**
> The Simi Valley market has seen a lot of changes over the past few years, and timing your sale depends on several factors including inventory, rates, and seasonality...

**Right (structure only — insert verified MLS data before publish):**
> [VERIFIED ANSWER — sourced from current MLS/market data, with source and date cited]. Here's why that window works and when it doesn't apply to you.

No market claim ships without a verifiable source and a date. "Sells faster" or "closer to asking" only appears if I can cite the MLS stat behind it.

**Implementation:** Audit every existing spec section before deployment. If the answer isn't in sentence one, restructure. This is a hard rule, not a style preference.

## Rule 2: Headers Are Real Questions, Not Topics

Nobody types "ADU Financing Options" into ChatGPT. They type "can I use a HELOC to build an ADU?" Headers should sound like something a real person would actually say out loud.

**Convert all H2/H3 headers from topic-style to question-style:**

| Topic header (old) | Question header (new) |
|---|---|
| ADU Permit Costs | How much do ADU permits actually cost in Simi Valley? |
| First-Time Buyer Programs | What programs help first-time buyers in the West Valley? |
| Renting vs. Buying | My lease is up soon — is buying actually realistic for me? |
| Chatsworth Market Overview | Is Chatsworth a good place to buy right now? |

**Voice check:** Headers should sound like a client texting me, not a textbook chapter. Messy and specific beats clean and generic.

## Rule 3: Every Page Gets 3-5 FAQs + FAQPage Schema

Add an FAQ block to the bottom of every page. Rules for the questions:

- **Real questions clients actually ask.** Pull from actual conversations, not what sounds good.
- **Hyper-local and specific.** "How much are HOA fees in Porter Ranch gated communities?" not "Why hire an agent?"
- **Answers follow Rule 1:** direct answer first, 2-4 sentences total, no fluff.
- **Full information, freely given.** No teaser answers that gate the real info behind a call. (Consistent with the give-it-all-away positioning.)

**Schema implementation — non-negotiable:**

Every FAQ block gets wrapped in JSON-LD FAQPage schema in the page `<head>` or inline:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much do ADU permits cost in Simi Valley?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[VERIFIED DATA REQUIRED — pull current permit and impact fee figures directly from the City of Simi Valley Building & Safety fee schedule before publish, and cite the source and date. Do not publish estimated or remembered numbers.]"
      }
    }
  ]
}
</script>
```

**Validation step:** After deployment, run every page through Google's Rich Results Test. Schema that doesn't validate doesn't count.

## Rule 4: Stack My Name + Market on Every Page

AI builds authority by seeing a name next to a market repeatedly. Every page reinforces the pairing: **Kareem Jamal + West San Fernando Valley / Simi Valley.**

**Site-wide schema (add to layout/template once, ships everywhere):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Kareem Jamal",
  "url": "https://kareemjamaltherealtor.com",
  "areaServed": [
    { "@type": "Place", "name": "Simi Valley, CA" },
    { "@type": "Place", "name": "Chatsworth, Los Angeles, CA" },
    { "@type": "Place", "name": "West Hills, Los Angeles, CA" },
    { "@type": "Place", "name": "Canoga Park, Los Angeles, CA" }
  ],
  "memberOf": { "@type": "Organization", "name": "Rodeo Realty" },
  "identifier": { "@type": "PropertyValue", "propertyID": "CA DRE", "value": "01998956" },
  "knowsAbout": ["first-time home buying", "ADUs", "renter to buyer transition", "West San Fernando Valley real estate", "Simi Valley real estate"]
}
</script>
```

**Page-level:** Every content page gets an author byline ("By Kareem Jamal, Simi Valley & West Valley Realtor — DRE #01998956") and `author` schema referencing the Person entity.

**Off-site checklist (manual, not Claude Code):**
- [ ] Google Business Profile — name + market in description, weekly posts
- [ ] Rodeo Realty agent bio page — confirm backlink to kareemjamaltherealtor.com
- [ ] Every social bio: "Kareem Jamal | Simi Valley + West SFV Realtor" pairing
- [ ] Baseline test: ask ChatGPT and Perplexity "who's the best real estate agent in Simi Valley" — screenshot results, re-test quarterly

## Rule 5: The Compliance Standard — Nothing Ships Unverified

This is the new self-imposed bar, higher than what DRE requires. It applies to this spec, all three queued specs, and every piece of content going forward. Add this rule to style-rules.md so it persists across all future work.

**The standard:**

1. **No fabricated or estimated figures — ever.** Every number (fees, prices, days on market, rates, program limits) comes from a named primary source with a pull date. If I can't source it, it doesn't publish. Placeholder text in drafts is fine; placeholder data in production is not.
2. **Primary sources only for regulated claims.** Permit fees → city fee schedule. Market stats → MLS. Loan programs → lender/agency documentation. State law claims → the actual code section. No secondhand blog stats.
3. **Date-stamp anything that expires.** Fees, rates, and market conditions get an "as of [date]" and a review cadence. Stale data gets pulled or refreshed, not left up.
4. **DRE advertising compliance on every page:** name, Rodeo Realty, and DRE #01998956 present and legible; no superlative claims I can't substantiate ("best," "#1," "guaranteed"); Fair Housing compliant language throughout — describe the property and the process, never the people or who "belongs" in a neighborhood.
5. **No implied outcomes.** Nothing that promises appreciation, ROI, approval, or savings. Educational framing only: here's how it works, here's what it costs, here's how to verify it yourself.
6. **AI answers inherit my liability.** If ChatGPT cites my page, my name is on that answer whether it's right or wrong. That's exactly why the bar is higher, not lower, than a normal blog post.

**Claude Code enforcement:** Any content containing `[VERIFIED DATA REQUIRED]` or an unsourced numeric claim fails the build. Verification is a pre-deploy gate, not a post-launch cleanup.

---

## Deployment Order

1. Add RealEstateAgent schema to site layout (one-time, ships site-wide)
2. Update the three queued specs (zip pages, ADU Playbook, guideme hub) with Rules 1-3 before their deployment pass
3. Deploy all three specs
4. Validate every page in Rich Results Test
5. Run the baseline AI search test and log results

## Acceptance Criteria

- [ ] Every section's first sentence is the answer
- [ ] Zero topic-style headers on content pages — all questions
- [ ] Every page has 3-5 local FAQs with validated FAQPage schema
- [ ] RealEstateAgent + author schema on every page
- [ ] Baseline AI search results documented
- [ ] Zero unsourced numeric claims — every figure has a primary source and pull date
- [ ] No `[VERIFIED DATA REQUIRED]` markers remain in production
- [ ] Name / brokerage / DRE # present on every page; no unsubstantiated superlatives; Fair Housing language check passed
