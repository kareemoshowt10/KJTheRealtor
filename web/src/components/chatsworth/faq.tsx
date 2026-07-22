"use client";

import { Accordion } from "@/components/ui/accordion";

const items = [
  {
    question: "Is Chatsworth still a real horse community?",
    answer:
      "Yes — and it’s defended. Equestrian zoning in foothill and northern pockets is real, but it runs parcel by parcel. I verify horse-keeping rights before anyone pays a premium for the word “equestrian” in a listing.",
  },
  {
    question: "Chatsworth or Porter Ranch?",
    answer:
      "They solve different problems. Porter Ranch is newer and planned, at a premium. Chatsworth is land, character, and entitlements you can’t replicate. If your wealth plan values optionality on the lot, Chatsworth is usually the more interesting instrument.",
  },
  {
    question: "Do the trains make it loud?",
    answer:
      "Near the corridor, yes. The useful math: rail-adjacent pockets often trade at a discount that can outweigh the noise for Metrolink commuters. Stand in the yard when one passes — I’ll time the showing so you can.",
  },
  {
    question: "Should we sell a long-held 91311 home — or keep it?",
    answer:
      "Run three numbers first: realistic rent, current payment, and what the equity would do in the next property. Big lots and ADU potential often make keep-as-rental a serious option. I’ll run both paths before anyone lists.",
  },
];

export function ChatsworthFaq() {
  return (
    <section id="faq" className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="mb-8 text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Straight answers · 91311
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium text-navy">
            Questions people ask about{" "}
            <em className="font-normal italic text-gold-deep">Chatsworth.</em>
          </h2>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}
