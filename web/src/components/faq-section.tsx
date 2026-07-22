"use client";

import { Accordion } from "@/components/ui/accordion";

const items = [
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
      "I combine tax strategy, construction literacy, real estate negotiation, and technology — and I grew up in Chatsworth. The goal isn’t a faster close; it’s a decision your family can stand behind.",
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

export function FaqSection() {
  return (
    <section id="faq" className="bg-paper py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:px-8">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Straight answers
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium text-navy">
            Questions families ask{" "}
            <em className="font-normal italic text-gold-deep">before they commit.</em>
          </h2>
          <p className="mt-4 text-slateink">
            If your question isn&apos;t here, bring it to the form — same-day personal
            reply is the norm.
          </p>
          <a
            href="#start"
            className="mt-6 inline-flex text-sm font-semibold text-gold-deep hover:underline"
          >
            Ask something specific →
          </a>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}
