"use client";

import { motion } from "framer-motion";
import {
  Scale,
  Home,
  Hammer,
  Cpu,
  HeartHandshake,
  BookOpen,
} from "lucide-react";

const tiles = [
  {
    icon: Scale,
    title: "Tax strategy",
    body: "1031, Prop 19, cost-seg, and handoff math — structured so your family keeps more.",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    icon: Home,
    title: "Real estate discipline",
    body: "Pricing, negotiation, and timing that protect equity on both sides of the table.",
    className: "md:col-span-1",
  },
  {
    icon: Hammer,
    title: "Builder’s eye",
    body: "ADUs, value-add, and what a lot can become — not just what it is today.",
    className: "md:col-span-1",
  },
  {
    icon: Cpu,
    title: "Early signal tech",
    body: "Data and automation that surface the right opportunity before it’s obvious.",
    className: "md:col-span-1",
  },
  {
    icon: HeartHandshake,
    title: "Kitchen-table pace",
    body: "Seniors and adult children get patience first. Strategy second. No drip campaigns.",
    className: "md:col-span-2 bg-navy text-cream border-gold/30 [&_p]:text-cream/75 [&_h3]:text-cream [&_svg]:text-gold",
  },
  {
    icon: BookOpen,
    title: "Ungated library",
    body: "Strategy sessions, guides, and calculators stay free — use them with me or without me.",
    className: "md:col-span-1",
  },
];

/**
 * Bento feature grid — 21st.dev bento / features pattern.
 */
export function BentoFeatures() {
  return (
    <section id="method-bento" className="bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            How I work
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium text-navy">
            Four disciplines.{" "}
            <em className="font-normal italic text-gold-deep">
              One kitchen table.
            </em>
          </h2>
          <p className="mt-4 text-slateink">
            Most agents open doors. I combine tax, real estate, construction, and
            technology so families can decide with clarity — not pressure.
          </p>
        </div>

        <div className="grid auto-rows-[minmax(140px,auto)] gap-3 md:grid-cols-3">
          {tiles.map((t, i) => (
            <motion.article
              key={t.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className={`rounded-2xl border border-[#e3d8c7] bg-white p-6 shadow-sm ${t.className}`}
            >
              <t.icon className="mb-4 h-6 w-6 text-gold-deep" strokeWidth={1.75} />
              <h3 className="font-display text-xl font-medium text-navy">
                {t.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slateink">{t.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
