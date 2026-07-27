"use client";

import { Accordion } from "@/components/ui/accordion";
import { faqItems } from "@/lib/faq";

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
        <Accordion items={faqItems} />
      </div>
    </section>
  );
}
