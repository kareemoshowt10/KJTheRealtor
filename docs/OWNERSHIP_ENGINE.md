# The Ownership Engine — operations manual v1.0

**Site:** kareemjamaltherealtor.com · **Primary market:** Chatsworth 91311  
**Status:** Editorial and conversion system. Content stays in draft until agent/brokerage approval.

## Philosophy

- **Dale Carnegie:** genuine interest, listening, sincere appreciation, respectful questions, and helping people feel understood.
- **Jeb Blount:** protect time for consistent prospecting, maintain opportunity flow, learn from real conversations, and replace opportunities that leave the pipeline.
- **Kareem Jamal:** questions cost nothing; mistakes cost thousands. Explain property ownership without pressuring anyone to buy.
- **Non-negotiable:** owning property can be beneficial but is not appropriate for everyone or at every point in life.

Do not imply a personal relationship, client interaction, inspection, property visit, or sale occurred unless confirmed. No invented leads or performance.

## Lead magnet catalogue

| Magnet | Audience | Existing site resource | Next step |
| --- | --- | --- | --- |
| Buyer Math Kit | Renters/future buyers | /ownership-lab#ownership-math-kit | Private calculator; optional question |
| First Home Plan | First-time buyers | /first-home-plan | Optional clarity conversation |
| Seller Walkthrough | Potential sellers | /seller-presentation | Compare selling and holding |
| Inherited Home Guide | Estate/family decision makers | /inherited-home-guide | Ask a family-home question |
| 91311 Field Guide | Chatsworth buyers/owners | /91311 | Ask for current comparable sales |
| Commute Check | Relocating households | /commute-check | Review actual time/budget trade-offs |

Keep core educational value ungated. The existing LeadForm handles voluntary questions with a one-reply consent checkbox and Formspree. **Do not add automated email nurture or SMS drip** without a separately reviewed consent flow, privacy-policy update, and operational opt-out process.

## Weekly content machine

1. **Monday · 91311 Market Ledger:** inspect source dates and definitions. Update `src/lib/market-ledger-91311.ts` only with a verified ZIP-specific published period and URL. ZIP data and neighborhood data are not interchangeable.
2. **Tuesday · Ownership Equation:** one practical buyer/seller calculation; clear assumption labels.
3. **Wednesday · Field Notes:** a real local observation or explicitly identified desk-based public-record review.
4. **Thursday · Explain the mechanism:** mortgage costs, taxes, supply, inspections, construction, household budgets.
5. **Friday · The Field Report:** five insights, one overlooked trade-off, and one optional next step.
6. **Prospecting block weekdays (75 minutes):** review pipeline (10m); compliant relationship outreach (25m); useful follow-ups (20m); local network (10m); accurate CRM records (10m).

One topic may produce a carousel, short video, LinkedIn explanation, web article, email lesson for opted-in subscribers, and one downloadable worksheet. Reuse research, not identical captions.

## Required campaign dossier

- Campaign ID, title, version, market, audience, problem, and goal.
- Primary research citations, snapshot date, publication date, geography, property type.
- One measurable educational takeaway and one worked example.
- A useful resource with ungated delivery.
- Three hooks; one primary CTA; landing destination.
- Three optional relationship-first outreach drafts (new contact, follow-up, referral).
- Brokerage review status, DRE/ad compliance checks, accessibility/privacy review.
- Evidence log of real activity; no false claims.
- Measurement plan and a specific experiment.

## Research and compliance gate

Stop release if:
- Broker affiliation, DRE identifiers, first-contact advertising disclosures, or ownership claims are unverified.
- A local figure is unsourced, mixes active listings with sales, lacks dates, or mixes 91311 with Chatsworth neighborhood data.
- The language implies guaranteed appreciation, automatic eligibility, or universal ownership advice.
- Property images are modified or misleading; maintain originals and disclose alterations where required.
- Fair-housing targeting or copy creates legal risk.
- A form collects unnecessarily sensitive information, claims a subscriber list that does not exist, or violates stated one-reply preferences.
- A supposed test result has no actual data.

Never automatically publish a market brief just because a scheduled research task ran. Human verification and approval are required.

## CRM fields

`lead_id, created_at, source, campaign_id, resource_id, contact_channel, consent_scope, consent_timestamp, status, interest, time_horizon, last_contact_at, next_action_at, next_action, assigned_agent`.

Use a protected CRM, not a public repo. Do not put client identity, debt, income, or private disclosures into analytics payloads.

**Stages:** new inquiry → permission confirmed → conversation → qualified need → consultation proposed → consultation booked → active client → closed / resolved / opted out.

A guide view or download is engagement, not an automatically qualified lead.

## Events and reporting

- Existing `LeadForm` emits `generate_lead` with `form_source: ownership-lab` after a successful Formspree submission.
- Buyer calculator emits `ownership_worksheet_print` when visitor chooses Print/Save.
- Existing tracking script may record page and CTA visits; verify live GA4/GTM configuration before claiming events are collected.
- KPI: unique tool visitors, guide engagement, inquiries, meaningful two-way conversations, booked consultations, signed clients, actual transaction outcomes.
- Compare one change at a time: hook, promise, CTA, landing-page placement, or calculator clarity.
- Weekly review: top questions, evidence, real rates, what improved, what to stop, next experiment.

## Site implementation

- `/ownership-lab`: centralized 91311-led free resources + dynamic private buyer-cost calculator + source-backed market card + existing permission-based lead form.
- Homepage: featured Ownership Lab entry.
- `/91311`: direct local entry.
- Footer and sitemap: route discovery.
- Source file: `web/src/lib/market-ledger-91311.ts`.

## Suggested testing flow

1. Verify brokerage / DRE license & approved email address before approval.
2. Visit mobile and desktop. Open each resource.
3. Check 0% loan interest, 20% down (no simulated PMI), and reset behavior.
4. Verify rate/tax/insurance example is clearly illustrative.
5. Confirm browser printing does not expose client information.
6. Submit **one approved internal test** using a business test address. Confirm Formspree receipt and attribution, then remove test data from CRM.
7. Check privacy policy, accessibility, links, meta tags, and that source dates remain visible.
8. Publish only after human/broker approval.
