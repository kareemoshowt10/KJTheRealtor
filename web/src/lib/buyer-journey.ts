/**
 * The 10-step buying journey for /buy, ported from the guideme funnel.
 *
 * Deliberately left OUT of the port (unverified — needs Kareem's sourcing
 * before it can appear): every client example ("Maya & Jordan"), dollar
 * "savings" figures, average-days stats, named lenders, per-step timelines
 * and cost ranges, and any promise about fees, refunds, or paid inspections.
 * Keep this file to process education a buyer can verify elsewhere.
 */
export type JourneyStep = {
  title: string;
  you: { headline: string; body: string; points: string[] };
  me: { headline: string; body: string; points: string[] };
  redFlags: string[];
  ask: string[];
  terms: [term: string, meaning: string][];
};

export const buyerJourney: JourneyStep[] = [
  {
    title: "Discovery",
    you: {
      headline: "Picture the life you're buying into.",
      body: "Before a single listing, we talk about how you actually live: the drive, the space, the budget you can sleep on. You leave with clarity, not pressure.",
      points: ["Lifestyle and timeline", "Commute and daily routine", "Must-haves vs. dealbreakers"],
    },
    me: {
      headline: "Building your search around you.",
      body: "I turn what you told me into search criteria, set up alerts, and map which pockets of the West Valley and Simi fit your number.",
      points: ["Saved-search alerts", "Street-level comps, not zip averages", "Agent-network outreach"],
    },
    redFlags: [
      "An agent who sends listings before asking what you actually want",
      "Pressure to tour the same week you call",
    ],
    ask: [
      "How many buyers in my price range have you helped recently?",
      "What does inventory look like in the areas I'm considering?",
    ],
    terms: [
      ["Buyer representation agreement", "The written agreement that spells out what your agent does for you and how they're paid. You'll sign one before touring with an agent. Read it — terms and length are negotiable."],
    ],
  },
  {
    title: "Pre-approval",
    you: {
      headline: "Know your number before you fall in love.",
      body: "A lender verifies your income, assets, and credit and issues a pre-approval letter. That letter is what makes your offer credible.",
      points: ["Income and credit review", "A payment you're comfortable with", "A letter ready before you tour"],
    },
    me: {
      headline: "Making sure the letter can win.",
      body: "I connect you with more than one lender so you can compare, and I check that your pre-approval is written to support the offers you'll actually make.",
      points: ["Compare Loan Estimates side by side", "Reserve and payment check", "Letter wording that fits each offer"],
    },
    redFlags: [
      "A pre-qualification sold to you as a pre-approval",
      "Being steered to a single lender with no comparison",
    ],
    ask: [
      "Which loan types fit my situation — conventional, FHA, VA, jumbo?",
      "How much cash should I keep after closing?",
    ],
    terms: [
      ["Debt-to-income (DTI)", "Your monthly debts ÷ gross monthly income. Each lender and loan program sets its own limit."],
      ["Pre-approval vs. pre-qualification", "Pre-approval means a lender verified your documents. Pre-qualification is based on what you told them."],
      ["Loan Estimate", "The standard three-page form every lender must give you. It's the only apples-to-apples way to compare offers."],
    ],
  },
  {
    title: "The search",
    you: {
      headline: "Tour homes that actually fit.",
      body: "Curated showings, not a tour of everything on the market. You'll get sharper at judging homes after every visit.",
      points: ["Private tours and open houses", "Side-by-side comparisons", "Quick debrief after each tour"],
    },
    me: {
      headline: "Screening before you ever park.",
      body: "Before you see a home, I look at permit history, HOA documents, disclosures, and how long it's really been for sale.",
      points: ["Permit and disclosure pre-check", "HOA documents and reserves", "Pricing by street, not zip"],
    },
    redFlags: [
      "HOA dues or special assessments you hear about late",
      "Unpermitted additions — they can affect appraisal, insurance, and resale",
      "A listing that was pulled and relisted to reset its days on market",
    ],
    ask: [
      "What does the permit history show?",
      "How long has this seller really been trying to sell?",
    ],
    terms: [
      ["MLS", "The Multiple Listing Service — the shared database agents use to list homes."],
      ["Days on market (DOM)", "How long a listing has been active. Longer can mean more room to negotiate."],
    ],
  },
  {
    title: "The offer",
    you: {
      headline: "Write a strong offer that still protects you.",
      body: "Price is one lever. Contingencies, timing, deposit, and credits all matter — and all of it gets explained before you sign.",
      points: ["Price strategy walkthrough", "Contingencies in plain English", "E-sign when you're ready"],
    },
    me: {
      headline: "Negotiating on facts.",
      body: "I run comps, talk to the listing agent about what the seller actually needs, and structure terms that make your offer easy to say yes to.",
      points: ["Comparative market analysis", "Listing-agent conversation", "Terms built around the seller's real priorities"],
    },
    redFlags: [
      "Pressure to waive your inspection contingency to win",
      "Escalation clauses with no hard cap",
      "Verbal promises that aren't written into the offer",
    ],
    ask: [
      "What do recent comparable sales say this home is worth?",
      "Which contingencies can I keep without weakening my offer?",
    ],
    terms: [
      ["Earnest money deposit", "A good-faith deposit held in escrow. Whether you get it back depends on your contract and its contingencies."],
      ["Contingency", "A condition — inspection, appraisal, loan — that lets you cancel under the contract's terms."],
      ["Seller credit", "Money the seller agrees to put toward your costs at closing. It's negotiable, and your lender sets limits."],
    ],
  },
  {
    title: "Under contract",
    you: {
      headline: "Offer accepted. Now the clock starts.",
      body: "You deposit earnest money, line up inspections and insurance, and keep your finances steady. The contract sets every deadline.",
      points: ["Earnest money wire", "Deadline calendar", "Insurance quotes early"],
    },
    me: {
      headline: "Tracking every deadline.",
      body: "I build your contract calendar, coordinate escrow, title, inspectors, and the lender, and tell you what's due before it's due.",
      points: ["Contingency tracking", "Vendor scheduling", "Regular check-ins"],
    },
    redFlags: [
      "Missed contingency deadlines",
      "Opening new credit or making big purchases before closing",
      "Wire instructions that arrive or change by email",
    ],
    ask: [
      "What are my exact deadlines, and what happens if one slips?",
      "When should I get insurance quotes for this property?",
    ],
    terms: [
      ["Escrow", "The neutral third party that holds money and documents until every condition is met."],
      ["Title insurance", "Protects against ownership problems from before you bought the home."],
    ],
  },
  {
    title: "Inspection",
    you: {
      headline: "Know exactly what you're buying.",
      body: "A licensed inspector goes through the home and you get a written report. Specialists follow where the report says to.",
      points: ["Attend the inspection", "Read the report with me", "Decide what matters"],
    },
    me: {
      headline: "Turning findings into a plan.",
      body: "I help you separate real issues from cosmetic noise, bring in specialists where needed, and negotiate repairs or credits backed by written estimates.",
      points: ["Specialist referrals as needed", "Repair vs. credit strategy", "Written estimates behind every ask"],
    },
    redFlags: [
      "A roof, sewer line, or foundation concern with no follow-up inspection",
      "Being rushed to remove your inspection contingency",
    ],
    ask: [
      "Which findings are safety or structural, and which are cosmetic?",
      "Should we order a sewer scope or other specialist inspection?",
    ],
    terms: [
      ["Sewer scope", "A camera inspection of the main sewer line from the house to the street."],
      ["Repair credit", "Money off at closing instead of the seller doing the repair. You control the fix."],
    ],
  },
  {
    title: "Appraisal & loan",
    you: {
      headline: "Your lender finalizes the loan.",
      body: "The appraiser values the home for the lender and underwriting reviews your file. Your job: answer document requests fast and keep your finances unchanged.",
      points: ["Answer lender requests quickly", "Insurance in place", "No new debt"],
    },
    me: {
      headline: "Keeping the loan on track.",
      body: "I make sure the appraiser has the relevant comparable sales, stay in contact with your lender, and plan ahead if the appraisal comes in low.",
      points: ["Comparable sales for the appraiser", "Lender check-ins", "Low-appraisal game plan"],
    },
    redFlags: [
      "A low appraisal with no plan to challenge or renegotiate",
      "A rate lock about to expire with no extension plan",
    ],
    ask: [
      "If the appraisal comes in low, what are my options under this contract?",
      "When does my rate lock expire?",
    ],
    terms: [
      ["Underwriting", "The lender's final review of you and the property before the loan is approved."],
      ["Appraisal gap", "The difference between the price and a lower appraised value — cash you'd need to cover or negotiate."],
    ],
  },
  {
    title: "Final walkthrough",
    you: {
      headline: "Verify the home before you fund.",
      body: "Shortly before closing we walk the home together: agreed repairs done, systems working, condition matching the contract.",
      points: ["Repair verification", "Systems and appliances check", "Issues raised before signing"],
    },
    me: {
      headline: "Your last enforcement window.",
      body: "I document what we find and raise any problems with the listing agent right away, while there's still leverage to fix them.",
      points: ["Photo documentation", "Repair receipts check", "Escalation before closing"],
    },
    redFlags: [
      "Negotiated repairs not completed",
      "New damage from the seller's move-out",
      "Included appliances or fixtures removed",
    ],
    ask: [
      "What are our options if a major item isn't resolved?",
      "Should we ask for a holdback in escrow?",
    ],
    terms: [["Holdback", "Money left in escrow at closing to cover an unfinished item."]],
  },
  {
    title: "Closing day",
    you: {
      headline: "Sign, fund, get the keys.",
      body: "You sign the final documents, your funds are wired, the deed records with the county, and the home is yours.",
      points: ["Verify wire instructions by phone", "Review your Closing Disclosure", "Keys, remotes, and codes"],
    },
    me: {
      headline: "Checking the numbers with you.",
      body: "I review your Closing Disclosure with you against your Loan Estimate and the contract, and confirm when the deed records.",
      points: ["Closing Disclosure review", "Wire-fraud safeguards", "Recording confirmation"],
    },
    redFlags: [
      "Last-minute changes to wire instructions — treat as fraud until verified by phone",
      "Closing Disclosure numbers that don't match your Loan Estimate without explanation",
    ],
    ask: [
      "Does my Closing Disclosure match my Loan Estimate?",
      "When will the deed record in my name?",
    ],
    terms: [
      ["Closing Disclosure", "Your final loan terms and costs. You receive it at least three business days before closing."],
      ["Recording", "The deed being filed with the county — when ownership officially transfers."],
    ],
  },
  {
    title: "Beyond the keys",
    you: {
      headline: "You're home. The relationship doesn't end.",
      body: "Property tax bills, the homeowners' exemption, maintenance, and future refinance timing — questions keep coming after closing.",
      points: ["Homeowners' exemption filing", "Supplemental tax bill heads-up", "Home value check-ins"],
    },
    me: {
      headline: "Still your call to make.",
      body: "When a question about your home comes up — value, a contractor, a refinance, a tax bill — you know who to call.",
      points: ["Home value updates on request", "Local vendor referrals", "Long-term equity planning"],
    },
    redFlags: [
      "Forgetting to file the California homeowners' exemption with your county assessor",
      "Being surprised by a supplemental property tax bill after you buy",
    ],
    ask: [
      "What is my home worth today compared to what I paid?",
      "When would a refinance actually make sense?",
    ],
    terms: [
      ["Homeowners' exemption", "A California property tax exemption for your primary residence. You file it with your county assessor."],
      ["Supplemental tax bill", "A one-time California bill that adjusts your property tax to the new assessed value after a purchase."],
    ],
  },
];
