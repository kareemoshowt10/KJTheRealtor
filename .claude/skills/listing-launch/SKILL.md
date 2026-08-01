---
name: listing-launch
description: "Takes one listing from signed to launch-ready — area intel, pricing pressure-test, all copy, and a hard brand/compliance gate — following Research → Plan → Plan Review → Revise → Implement → Adversarial Review → Revise. Invoke as /listing-launch <address>."
---

# listing-launch

One listing → a launch-ready package: verified area intel, a pricing argument that survives a sharp seller, MLS remarks, single-property page, neighbor farming piece, and open-house collateral — every asset through a hard brand + compliance gate before it's shown to anyone.

**Nothing here publishes, sends, or posts.** Drafts only, Kareem approves. That's rule 37 and this skill does not have an exception to it.

## Step 0 — Intake the real property

Never proceed on assumed facts. Establish, from Kareem or from an existing presentation file in the repo:

- Address, APN, beds/baths/sqft/lot/year built
- Condition specifics — and **what's documented** (permits, invoices, warranties) vs. merely stated
- Seller's actual priority: **top dollar** / **speed and certainty** / **specific closing date**. This single answer drives the entire pricing recommendation — get it before doing pricing work, not after.
- Any deadline: listing appointment date, target launch date, photo shoot date

If a fact is missing, ask once, in one short message, listing everything you need. Then use bracketed placeholders (`[X sq ft — confirm]`) rather than inventing anything.

## Step 1 — Research (`area-analyst`)

Spawn `area-analyst` for the ZIP and sub-market. It produces/refreshes `data/area-intel-<zip>.md` with sourced, dated figures, flags conflicts between sources, and identifies which figures need a CRMLS pull before they can be used in front of a seller.

Explicitly ask it to identify **which sub-market pocket** the subject property sits in — the ZIP median is rarely the right benchmark on its own.

## Step 2 — Plan the pricing argument

Draft the pricing strategy: the benchmark being used and why, the comp set (or the labeled gap where comps must come from CRMLS), the strategy options with their implied $/sqft shown, and a single **recommended** option tied to the seller's stated priority from Step 0.

Show the arithmetic inline. Every strategy band states its implied $/sqft.

## Step 3 — Plan Review (`listing-strategist`)

Spawn `listing-strategist` on the draft argument. It checks thesis/recommendation coherence, recomputes the math, interrogates whether the benchmark can bear the weight, and steelmans the seller's three toughest objections.

Treat "internally inconsistent" as blocking — do not proceed to copy on a pricing argument that contradicts itself. Copy written on a broken argument just makes the contradiction more persuasive.

## Step 4 — Revise (single pass)

Fix what Step 3 raised. One pass. If a finding can't be resolved without information only Kareem has (a comp set, the seller's real priority, whether the roof is documented), stop and ask rather than papering over it.

## Step 5 — Implement (`listing-copy`)

Spawn `listing-copy` for the asset set: MLS public remarks · single-property page copy · neighbor/farming piece · open-house one-pager · seller-facing summary of the strategy.

For social/organic (LinkedIn, Facebook, Instagram carousel, Reels), **hand off to the `kgj-content-engine` skill** — it owns those formats and their checklist. Don't duplicate it here.

Any visual asset uses the KGJ tokens: Navy `#0B1E3E`, Gold `#C9A84C`, Warm White `#FAF8F3`, Fraunces + Inter, ≤10% gold. Two type families, never three.

## Step 6 — Adversarial Review (parallel)

Spawn both in the same turn:
- `brand-compliance-gate` — palette hex values, type families, ratios, DRE line, Fair Housing, TCPA on any form, sourced-and-dated numbers, no guarantees.
- `listing-strategist` — second pass on the finished package: does the copy still match the pricing argument after being written?

`brand-compliance-gate` returning **REVISE** is blocking. Fair Housing findings are never "ship it and fix later."

## Step 7 — Revise (single pass)

Fold both reviews in. One pass. If the compliance gate would still fail on the same structural issue after this pass, stop and surface it to Kareem — that's a judgment call, not a rewrite loop.

## Step 8 — Package

Write everything to `listings/<address-slug>/`:
- `strategy.md` — the pricing argument, comps or labeled gaps, the recommendation and its reasoning
- `copy.md` — every asset, labeled
- `review.md` — both review passes and what was changed
- `open-questions.md` — every bracketed placeholder and CRMLS pull still outstanding

Commit to a branch, do **not** push to `main` and do **not** deploy. End with: the recommendation in one line, the top three open questions, and anything the compliance gate flagged that Kareem overrode or needs to decide.

## Model fallback

`listing-copy` runs on Fable. If Fable returns a usage-limit error, re-invoke that stage once on Sonnet and note it in `review.md`. If the session itself hits a limit, stop cleanly — don't ship a half-built package.
