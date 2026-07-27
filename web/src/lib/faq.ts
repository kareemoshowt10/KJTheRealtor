/**
 * Homepage FAQ copy — single source of truth.
 *
 * Lives outside the client component on purpose: `faq-section.tsx` is a
 * "use client" module, and importing a value across that boundary into a
 * server component yields a client reference proxy rather than the array,
 * which breaks prerendering. Keeping the data here lets the visible accordion
 * (client) and the FAQPage JSON-LD (server) render from the same copy.
 *
 * Google requires FAQ schema text to match what the user can actually see, so
 * edit the copy here and both stay in sync automatically.
 */
export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Do I need to be ready to list before we talk?",
    answer:
      "No. Many of the best conversations start months early — especially for parents and adult children sorting Prop 19, timing, or whether to keep a home as a rental. Clarity first; a listing only if it still makes sense.",
  },
  {
    question: "Will I get drip emails or cold calls if I reach out?",
    answer:
      "No. I only reply if you explicitly ask — on the channel you choose. One personal answer. No sequences, no shared lists, no “just checking in” six months later unless you invite it.",
  },
  {
    question: "How is this different from a typical Valley agent?",
    answer:
      "I combine tax literacy (not CPA advice), construction literacy, real estate negotiation, and technology — and I grew up in Chatsworth. The goal isn’t a faster close; it’s a decision your family can stand behind. For formal tax or legal work, we loop in the right licensed professionals.",
  },
  {
    question: "Can you help if we’re deciding whether to sell a parent’s home?",
    answer:
      "Yes. That’s one of the most common kitchen-table situations I walk through: hold vs sell, ADU potential, Prop 19 risk, and how to keep the conversation respectful when siblings disagree.",
  },
  {
    question: "Are the guides and calculators really free?",
    answer:
      "Yes. Strategy sessions, reports, and tools stay ungated. Use them with me, with another agent, or alone. The library exists to make your decision better — not to trap an email address.",
  },
];
