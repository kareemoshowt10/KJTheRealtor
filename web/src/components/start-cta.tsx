"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock, MessageSquareHeart, Sparkles } from "lucide-react";
import { LeadForm } from "@/components/lead-form";

const chips = [
  {
    label: "Parents' home",
    fill: "We're figuring out what to do with my parents' home — hold, sell, or transfer. Need a clear starting read.",
  },
  {
    label: "Prop 19 / transfer",
    fill: "I have questions about Prop 19 and whether a transfer actually makes sense for our family.",
  },
  {
    label: "What's it worth?",
    fill: "I want an honest read on what my home is really worth right now — not a high-ball listing pitch.",
  },
  {
    label: "Buy & sell timing",
    fill: "We're weighing buy/sell timing in the Valley. Need a kitchen-table strategy, not pressure.",
  },
  {
    label: "Just exploring",
    fill: "Not ready to decide anything yet — just want a grounded conversation about options.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function StartCta() {
  const reduced = useReducedMotion();

  return (
    <section
      id="start"
      className="relative overflow-hidden bg-navy py-16 text-cream md:py-24"
    >
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-gold/15 blur-3xl"
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease }}
        >
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            When you&apos;re ready
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight">
            The library is free.{" "}
            <em className="font-normal italic text-gold-light">
              So is the first conversation.
            </em>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-cream/80">
            Tell me what you&apos;re working toward. One personal reply from me —
            a real starting strategy, not a sales script.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              {
                icon: MessageSquareHeart,
                text: "Replied to by me — not a team inbox",
              },
              {
                icon: Lock,
                text: "One reply only. No drip, no list, ever",
              },
              {
                icon: Sparkles,
                text: "Usually same day on weekdays",
              },
            ].map((item, i) => (
              <motion.li
                key={item.text}
                className="flex items-start gap-3 text-sm text-cream/75"
                initial={reduced ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease }}
              >
                <item.icon
                  size={18}
                  className="mt-0.5 shrink-0 text-gold"
                  aria-hidden
                />
                {item.text}
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 space-y-2 text-sm">
            <a
              href="tel:+18184027326"
              className="block font-display text-xl text-cream transition hover:text-gold-light"
            >
              (818) 402-7326
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/50">
                Call or text
              </span>
            </a>
            <a
              href="mailto:kjamal@rodeore.com"
              className="block font-display text-xl text-cream transition hover:text-gold-light"
            >
              kjamal@rodeore.com
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/50">
                Direct email
              </span>
            </a>
          </div>
        </motion.div>

        <LeadForm
          title="Kitchen-table start"
          subject="Website lead — kareemjamaltherealtor (hybrid)"
          source="web hybrid homepage"
          chips={chips}
          showPhone
          enablePathPrefill
        />
      </div>
    </section>
  );
}
