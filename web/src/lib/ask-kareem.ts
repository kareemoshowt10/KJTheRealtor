/**
 * "Ask Kareem" persona — pre-written answers in Kareem's voice.
 *
 * These are NOT live AI responses. Every answer here is static copy that
 * ships with the site so it can be reviewed word-for-word before deploy.
 * Compliance rails for every entry:
 *   - no guarantees of appreciation, returns, timing, or approval
 *   - the honest trade-off is named, not buried
 *   - tax/legal topics carry the "not CPA/attorney advice" line
 *   - no steering or demographic targeting; life situations only
 */
export type AskKareemEntry = {
  id: string;
  /** Chip label the visitor taps. */
  question: string;
  /** Kareem's answer, 2–4 short paragraphs max, first person. */
  answer: string[];
  /** Optional deep link to the page that goes further. */
  more?: { href: string; label: string };
};

export const askKareemIntro =
  "Tap a question. These are my real answers — the same ones I give at the kitchen table — written down so you don't have to get on a call to hear them.";

export const askKareemDisclosure =
  "Pre-written answers Kareem reviewed and approved — not live chat, and not advice for your specific situation. Tax and legal questions deserve a licensed CPA or attorney; I'll say so when that's the case.";

export const askKareemEntries: AskKareemEntry[] = [
  {
    id: "zestimate",
    question: "Why is my Zestimate different from what you'd say?",
    answer: [
      "A portal estimate is a national algorithm doing its best without ever seeing your street. It doesn't know your lot is flat when the neighbor's isn't, that you re-piped in 2019, or that your pocket of the Valley trades differently than the zip code average.",
      "Sometimes the algorithm is close. But you can't tell from the number whether this is one of those times — and pricing a life decision on a guess is how families leave real money on the table, in either direction.",
      "My Equity Snapshot is a range built from actual nearby sales I can show you, with the reasoning attached. If the portal number turns out right, I'll tell you that too.",
    ],
    more: { href: "#equity-snapshot", label: "Get your Equity Snapshot" },
  },
  {
    id: "prop19",
    question: "What's the Prop 19 issue everyone mentions?",
    answer: [
      "Two sides of one law. If you're 55 or older, Prop 19 can let you move and take your low property-tax basis with you — that part helps. The harder part: when a home passes to children, the old rules that let them keep the parents' low tax basis mostly ended in 2021. Inheriting the family home can now come with a property tax bill several times larger than what mom and dad were paying.",
      "Whether that changes your family's plan depends on numbers I can help you lay out — but the tax and estate decisions themselves belong with a CPA or estate attorney. I'll walk the real estate side with you and tell you plainly when a question is theirs, not mine.",
    ],
    more: { href: "/living-trust-guide", label: "Read the living trust guide" },
  },
  {
    id: "hold-or-sell",
    question: "Should we sell the family house or rent it out?",
    answer: [
      "The honest answer: it depends on numbers most families never actually run. What would it rent for, really? What does deferred maintenance cost you as a landlord versus a seller? What happens to the capital-gains exclusion if you convert it to a rental and sell years later?",
      "Holding isn't automatically the wealth move, and selling isn't automatically the mistake. I've told families to keep a house I could have listed. The hold-vs-sell table on this page walks the trade-offs; your specific numbers take about one conversation.",
    ],
    more: { href: "#hold-vs-sell", label: "See the hold vs. sell breakdown" },
  },
  {
    id: "no-pressure",
    question: "If I reach out, what actually happens?",
    answer: [
      "You get one personal reply from me, on the channel you picked. No drip sequence, no list, no 'just checking in' texts six months later.",
      "If your smartest move is to wait, refinance, or not use me at all — that's what you'll hear. I'd rather be the person your family calls in three years than the agent who pushed you into something this quarter.",
    ],
    more: { href: "#start", label: "Start the conversation" },
  },
  {
    id: "adu",
    question: "Is an ADU actually worth it in the Valley?",
    answer: [
      "Sometimes — and I'll show you both columns. An ADU can add real rental income and long-term value on the right lot. It also comes with permit friction, construction cost that's regularly underestimated, months of timeline risk, and neighbors' setback rules that kill some projects before they start.",
      "I grew up around construction, so I'll walk your specific lot honestly: what it could carry, what it would cost, and where the plan most often goes sideways. No dollar committed until both columns are on the table.",
    ],
    more: { href: "/homeowners", label: "More homeowner resources" },
  },
  {
    id: "why-free",
    question: "Why do you give the strategy work away free?",
    answer: [
      "Because the gate is the problem. This industry hides basic answers behind signup walls so someone can chase the email address. That's backwards.",
      "The guides, calculators, and zip data on this site stay free and ungated. Use them with me, with another agent, or alone. Some readers become clients; enough of them, that the math works. The rest just make better decisions — which is the point of the site.",
    ],
    more: { href: "/free-reports", label: "Open the report library" },
  },
];
