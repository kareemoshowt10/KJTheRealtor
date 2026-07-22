"use client";

import { NumberTicker } from "@/components/ui/number-ticker";

const stats = [
  {
    value: 4,
    suffix: "",
    label: "Disciplines in one advisor",
    note: "Tax literacy · RE · Construction · Tech",
  },
  {
    value: 3,
    suffix: "",
    label: "Zip codes, one family story",
    note: "91311 · 91304 · 93063",
  },
  {
    value: 0,
    suffix: "",
    label: "Drip campaigns",
    note: "One personal reply. Permission-based only.",
    displayOverride: "0",
  },
  {
    value: 1,
    suffix: "",
    label: "Kitchen-table standard",
    note: "Patience first. Strategy second.",
  },
];

/**
 * Stats / KPI band — 21st.dev stats pattern with number ticker.
 */
export function StatsBand() {
  return (
    <section className="border-y border-gold/25 bg-navy py-14 text-cream md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
        {stats.map((s) => (
          <div key={s.label} className="border-l border-gold/35 pl-4">
            <p className="font-display text-4xl font-medium text-gold-light md:text-5xl">
              {s.displayOverride ? (
                s.displayOverride
              ) : (
                <NumberTicker value={s.value} suffix={s.suffix} />
              )}
            </p>
            <p className="mt-2 text-sm font-semibold text-cream">{s.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-cream/55">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
