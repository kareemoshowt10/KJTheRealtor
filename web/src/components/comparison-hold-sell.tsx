"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

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

type Tab = "hold" | "sell" | "both";

/**
 * Sprint 2 hold vs sell — desktop table + mobile stacked / tabbed UI
 * for 55+ readability.
 */
export function ComparisonHoldSell() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("both");

  return (
    <section
      id="hold-vs-sell"
      className="bg-gradient-to-b from-[#F7F1E7] to-paper py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Hold vs sell · educational framework
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium text-navy">
            Two paths.{" "}
            <em className="font-normal italic text-gold-deep">
              One honest worksheet.
            </em>
          </h2>
          <p className="mt-4 text-slateink">
            Families rarely need a cheerleader for listing. They need a clear
            comparison — especially when parents and adult children share the
            table.
          </p>
        </div>

        {/* —— Mobile: tabs + stacked cards —— */}
        <div className="md:hidden">
          <div
            className="flex rounded-xl border border-[#e3d8c7] bg-white p-1"
            role="tablist"
            aria-label="Hold or sell view"
          >
            {(
              [
                { id: "both" as const, label: "Both" },
                { id: "hold" as const, label: "Hold / rent" },
                { id: "sell" as const, label: "Sell" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition",
                  tab === t.id
                    ? "bg-navy text-cream shadow-sm"
                    : "text-slateink hover:text-navy"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <ul className="mt-4 space-y-3">
            {rows.map((r, i) => {
              if (tab === "hold" && !r.hold) return null;
              if (tab === "sell" && !r.sell) return null;

              return (
                <motion.li
                  key={r.label}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="rounded-2xl border border-[#e3d8c7] bg-white p-4 shadow-sm"
                >
                  <p className="font-medium leading-snug text-navy">{r.label}</p>
                  <p className="mt-1 text-xs text-slateink/80">{r.note}</p>

                  {tab === "both" ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <PathBadge active={r.hold} label="Hold / rent" />
                      <PathBadge active={r.sell} label="Sell" />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <PathBadge
                        active={tab === "hold" ? r.hold : r.sell}
                        label={tab === "hold" ? "Fits hold / rent" : "Fits sell"}
                        wide
                      />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* —— Desktop: full comparison table —— */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden overflow-hidden rounded-2xl border border-[#e3d8c7] bg-white shadow-gold md:block"
        >
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-[#e3d8c7] bg-cream/60 text-sm font-bold uppercase tracking-[0.12em] text-slateink">
            <div className="p-5">Decision factor</div>
            <div className="border-l border-[#e3d8c7] p-5 text-center text-navy">
              Hold / rent
            </div>
            <div className="border-l border-[#e3d8c7] p-5 text-center text-navy">
              Sell
            </div>
          </div>
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-[#f0e9dc] last:border-0"
            >
              <div className="p-5">
                <p className="font-medium text-navy">{r.label}</p>
                <p className="mt-1 text-xs text-slateink/80">{r.note}</p>
              </div>
              <div className="flex items-center justify-center border-l border-[#f0e9dc] p-5">
                {r.hold ? (
                  <Check className="h-5 w-5 text-emerald-700" aria-label="Yes" />
                ) : (
                  <X className="h-5 w-5 text-stone-400" aria-label="No" />
                )}
              </div>
              <div className="flex items-center justify-center border-l border-[#f0e9dc] p-5">
                {r.sell ? (
                  <Check className="h-5 w-5 text-emerald-700" aria-label="Yes" />
                ) : (
                  <X className="h-5 w-5 text-stone-400" aria-label="No" />
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <a
            href="#start"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-navy px-5 text-sm font-semibold text-cream hover:bg-navy-mist"
          >
            Run both paths with me
          </a>
          <a
            href="https://kareemjamaltherealtor.com/91311/home-value"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-navy/25 px-5 text-sm font-semibold text-navy hover:bg-navy hover:text-cream"
          >
            Get an Equity Snapshot first
          </a>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-[0.72rem] leading-relaxed text-slateink/65">
          Framework only — not a recommendation to hold or sell. Prop 13/19,
          rental math, and liquidity needs depend on your facts; confirm with
          licensed tax, legal, and real estate professionals.
        </p>
      </div>
    </section>
  );
}

function PathBadge({
  active,
  label,
  wide,
}: {
  active: boolean;
  label: string;
  wide?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold",
        wide && "w-full justify-center",
        active
          ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
          : "bg-stone-50 text-stone-500 ring-1 ring-stone-200"
      )}
    >
      {active ? <Check size={14} /> : <X size={14} />}
      {label}
    </span>
  );
}
