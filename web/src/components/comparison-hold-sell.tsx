"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const rows = [
  {
    label: "Protects Prop 13 base options",
    hold: true,
    sell: false,
    note: "Structure matters either way",
  },
  {
    label: "Keeps land optionality (ADU / rental)",
    hold: true,
    sell: false,
    note: "Chatsworth lots often win here",
  },
  {
    label: "Funds the next chapter with cash",
    hold: false,
    sell: true,
    note: "When liquidity is the goal",
  },
  {
    label: "Ends carrying cost & upkeep",
    hold: false,
    sell: true,
    note: "Right after a life transition",
  },
  {
    label: "Can still be the smarter wealth move",
    hold: true,
    sell: true,
    note: "We run both before the sign goes up",
  },
];

/**
 * Hold vs Sell comparison — 21st.dev comparison section pattern.
 */
export function ComparisonHoldSell() {
  return (
    <section id="hold-vs-sell" className="bg-gradient-to-b from-[#F7F1E7] to-paper py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Hold vs sell
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium text-navy">
            Two paths.{" "}
            <em className="font-normal italic text-gold-deep">
              One honest worksheet.
            </em>
          </h2>
          <p className="mt-4 text-slateink">
            Families rarely need a cheerleader for listing. They need a clear
            comparison — especially when parents and adult children share the table.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-[#e3d8c7] bg-white shadow-gold"
        >
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-[#e3d8c7] bg-cream/60 text-xs font-bold uppercase tracking-[0.12em] text-slateink md:text-sm">
            <div className="p-4 md:p-5">Decision factor</div>
            <div className="border-l border-[#e3d8c7] p-4 text-center text-navy md:p-5">
              Hold / rent
            </div>
            <div className="border-l border-[#e3d8c7] p-4 text-center text-navy md:p-5">
              Sell
            </div>
          </div>
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-[#f0e9dc] last:border-0"
            >
              <div className="p-4 md:p-5">
                <p className="font-medium text-navy">{r.label}</p>
                <p className="mt-1 text-xs text-slateink/80">{r.note}</p>
              </div>
              <div className="flex items-center justify-center border-l border-[#f0e9dc] p-4">
                {r.hold ? (
                  <Check className="h-5 w-5 text-emerald-700" />
                ) : (
                  <X className="h-5 w-5 text-stone-400" />
                )}
              </div>
              <div className="flex items-center justify-center border-l border-[#f0e9dc] p-4">
                {r.sell ? (
                  <Check className="h-5 w-5 text-emerald-700" />
                ) : (
                  <X className="h-5 w-5 text-stone-400" />
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://kareemjamaltherealtor.com/seller-presentation"
            className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-sm font-semibold text-cream hover:bg-navy-mist"
          >
            Walk the seller strategy
          </a>
          <a
            href="https://kareemjamaltherealtor.com/91311/home-value"
            className="inline-flex min-h-11 items-center rounded-md border border-navy/25 px-5 text-sm font-semibold text-navy hover:bg-navy hover:text-cream"
          >
            Get an Equity Snapshot first
          </a>
        </div>
      </div>
    </section>
  );
}
