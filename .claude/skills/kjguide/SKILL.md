---
name: kjguide
description: Build a new conversation-format teaching guide (like /internet-bill-guide and /repair-credit-guide) for any real-estate-adjacent topic. Use when Kareem asks for a new guide, a new free resource in the conversation style, or says "/kjguide <topic>". Creates the page from the shared chassis, runs quality-critique loops until the guide is genuinely high-value, wires it into the site, verifies, and deploys.
---

# kjguide — the conversation-guide factory

Turn any topic where a Realtor's conversation IS the value into a published guide at
`/<slug>-guide`, in the exact style of the two live references:

- `repair-credit-guide.html` — **canonical chassis; always clone this one** (newest CSS/JS)
- `internet-bill-guide.html` — original of the format

Both live at the git root: `/Users/kareemjamal/Library/CloudStorage/GoogleDrive-showt010@gmail.com/My Drive/Coding/Codex`
(NOT the KJ-Realtor-Website-Copy session cwd — that is a stale copy).

## Step 0 — Intake

From the user's request, establish (ask only if genuinely unclear):
1. **Topic** — the conversation to showcase (e.g., appraisal gap, listing-launch pricing, lender rate-buydown).
2. **Audience** — buyer, seller, owner, or investor. Sets the vocabulary and the CTA.
3. **The counterpart(s)** — who Kareem talks to in the chats (listing agent, lender, appraiser, contractor, client). Max 2 speaker types per guide.
4. **The client's win** — the concrete outcome the conversation protects (money, certainty, options).

If the user just says "make the next guide," pick the highest-value unbuilt topic from the
backlog in this skill's **Backlog** section, say which one and why, and proceed.

## Step 1 — Design the 5 conversations

Every guide is exactly 5 panels following this arc (rename the steps to fit the topic):

| # | Arc beat | Panel contents |
|---|----------|----------------|
| 1 | **Prepare** — build the fact base | `objective` box, a triage/fields section, `fields` inputs that feed the SMS snapshot builder, first `ally-note`, `handoff` card |
| 2 | **Evidence** — create leverage before negotiating | `phone` chat with counterpart #1, `why` coaching notes, `copy-btn` script, `ally-note` |
| 3 | **The ask** — the main negotiation | `phone` chat with counterpart #2, the exact ask, `why` notes on tone/framing/deadline, `copy-btn`, `ally-note` |
| 4 | **Pushback** — objections | `objections` grid: 4 real objections, each answered in one calm chat exchange, `ally-note` |
| 5 | **In writing / decision** — lock the outcome | final `phone` chat confirming complete terms, `outcomes` grid with exactly 3 outcome cards (each with an `outcome-code`), closing `ally-note` about client control |

Content rules (non-negotiable):
- **Blue bubbles are Kareem, gray are the counterpart.** Gray bubbles set their speaker via
  `data-speaker="..."` attribute (the chassis CSS reads it).
- **All dollar figures are placeholders**: `$[amount]`, `$[low] to $[high]`, `[X] days`. Never
  invent specific deal numbers presented as real. The intro line "The dollar figures are
  placeholders — your deal fills them in" stays.
- **Every chat gets 2–3 `why` coaching notes** — the teaching layer. Each explains ONE move
  (why lead with the close, why ask for it in writing, why never overstate urgency).
- **Every panel gets exactly one `ally-note`** — the bridge from this conversation to how
  Kareem behaves with the client's real-estate money. Label format: `Powerful ally · <Theme>`.
- **Voice**: calm, kind, firm; no bluffing, no threats, no adjectives where documents will do.
  Kareem is raised by builders — use that lens where the topic touches the physical house.
- **Honesty over marketing**: at least one moment where Kareem concedes something true that
  costs him ("that buyer isn't wrong that...", "you can do this without me").
- **Compliance**: educational disclaimer in the bridge card; CPA/attorney/lender lanes named
  when the topic touches tax, legal, or lending advice. No personalized investment advice.

## Step 2 — Build the file

1. `cp repair-credit-guide.html <slug>-guide.html` (work at the git root).
2. Replace: `<title>`, meta description/OG/canonical (`https://kareemjamaltherealtor.com/<slug>-guide`),
   HowTo JSON-LD (5 steps mirroring the panels), hero copy + portrait-note quote, stepper
   labels, the `order` array in the JS, all 5 panels, bridge section, snapshot-builder fields
   and its SMS message lines in the JS.
3. Keep untouched: the full CSS block, the stepper/reveal/copy/snapshot JS machinery,
   header/footer structure, `track.js` include, asset paths
   (`/assets/kareem-jamal-headshot-2026-web.jpg` hero, `-thumb.jpg` everywhere else).
4. Header nav: link `/#library`, one sibling guide, `#why`, and the `sms:+18184027326` CTA
   with a topic-specific prefilled body.

## Step 3 — Quality loop (do not skip; this is the point)

Iterate until ALL three critique passes come back clean. Re-read the full file each pass:

- **Pass A — Value**: Would a stranger with this exact problem get real, standalone value with
  zero contact with Kareem? Is every script copy-able and usable verbatim? Does each `why`
  note teach something a first-timer wouldn't know? If any panel is filler, rewrite it.
- **Pass B — Authenticity**: Does every bubble sound like a real conversation (contractions,
  interruptions, concessions), not marketing copy with speech marks? Would a listing agent /
  lender reading this nod rather than roll their eyes? Fix any bubble that reads staged.
- **Pass C — Mechanics & compliance**: placeholders not real numbers; disclaimer present;
  professional lanes named; JSON-LD valid (parse it); panel ids == `order` array == stepper
  `data-step`s; `data-copy` ids exist; snapshot field ids match the JS `fields` map; single h1.

Loop A→B→C, fixing and re-checking, until a full pass produces no edits. Typically 2–3 rounds.

## Step 4 — Wire into the site

All at the git root:
1. **Homepage card**: add the next-numbered `library-card` panel (`lib-num` 10, 11, …) to the
   `#library` grid in `index.html`, kicker `<Topic> · New`, meta chip `Conversation guide · no signup`.
   Drop the `· New` from the previous guide's card kicker.
2. **Sitemap**: add `<url>` entry with today's date, priority 0.8.
3. **Cross-links**: add the new guide to the sibling guides' header nav if there's room
   (keep header links ≤ 4; otherwise skip).

## Step 5 — Verify, ship, record

1. `mcp__Claude_Browser__preview_start` name `kj-realtor`; open `/​<slug>-guide`.
2. Verify via DOM (screenshots in this driver can go stale — computed styles + DOM are truth):
   stepper labels/panels/order alignment, chat row count > 15, snapshot link updates on input,
   copy buttons present, zero console errors, JSON-LD parses.
3. Screenshot the hero if the renderer cooperates.
4. Commit at the git root (message: `Add <topic> conversation guide`), push `origin main`,
   poll `https://kareemjamaltherealtor.com/<slug>-guide` until live.
5. Update the memory file `conversation-guides.md` (add the new guide, remove the topic from
   candidates) and the **Backlog** below (delete the built topic, add any new ideas raised).
6. Remind Kareem to request indexing in Search Console.

## Backlog — high-value unbuilt topics (what people need from a Realtor)

Ordered by likely demand; each names the counterpart(s) and the client win.
BUILT: appraisal gap (/appraisal-gap-guide, 2026-07-12); handyman vs contractor
(/contractor-handyman-guide, 2026-07-15 — also covers the old "contractor bid review" topic);
yard/garage sale (/yard-sale-guide, 2026-07-20 — counterparts: homeowner client + shoppers/characters).

1. **Listing-launch pricing** — Kareem ↔ seller client; the honest pricing conversation:
   comps, the first-price-is-the-strategy talk, saying no to flattery pricing. Seller audience.
3. **Rate buydown / lender shopping** — Kareem ↔ two lenders; comparing complete loan offers
   the way the ISP guide compares plans (points, credits, the real APR conversation). Buyer.
4. **The low offer** — Kareem ↔ listing agent; presenting a below-ask offer without killing
   the relationship (evidence framing, seller-need discovery, escalation paths). Buyer/investor.
5. **Accidental landlord's first lease** — Kareem ↔ prospective tenant + owner client;
   screening, pricing the rent, and protecting the asset. Owner/investor audience.
6. **The estate/inherited home call** — Kareem ↔ heirs + probate professional; the calm
   first conversation after inheriting property (tax basis, Prop 19, sell vs keep). Family.
7. **HOA / condo document review** — Kareem ↔ HOA manager; the questions that surface
   special assessments and litigation before they're your problem. Buyer audience.
