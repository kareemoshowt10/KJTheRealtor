"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock, MapPin, MessageSquareHeart } from "lucide-react";
import { LeadForm } from "@/components/lead-form";

const chips = [
  {
    label: "Pull this week's comps",
    fill: "Please pull this week's actual comps for me — here's the pocket I'm watching: ",
  },
  {
    label: "Verify horse zoning",
    fill: "I found a listing marketed as horse property — can you verify the actual zoning before I get attached? Address: ",
  },
  {
    label: "What's my home worth?",
    fill: "I own in or near 91311 and want your honest read on what my home is really worth right now.",
  },
  {
    label: "First-time buyer start",
    fill: "I'm a first-time buyer looking at Chatsworth. Where should I actually start?",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function ChatsworthConnect() {
  const reduced = useReducedMotion();

  return (
    <section
      id="connect"
      className="relative overflow-hidden bg-navy py-16 text-cream md:py-24"
    >
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
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
            Start with a conversation
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight">
            Thinking about 91311? Talk to someone{" "}
            <em className="font-normal italic text-gold-light">
              who&apos;s from it.
            </em>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-cream/80">
            Buying into Chatsworth, selling a family home here, or weighing an
            equestrian property&apos;s real value — local read first, strategy
            second. One conversation, no follow-up campaign.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              {
                icon: MapPin,
                text: "Raised in Chatsworth & West Hills",
              },
              {
                icon: MessageSquareHeart,
                text: "Personal reply — not a call center",
              },
              {
                icon: Lock,
                text: "Permission once. No drip list, ever",
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

          <div className="mt-8 space-y-1 border-t border-cream/15">
            <a
              href="tel:+18184027326"
              className="block border-b border-cream/15 py-3 font-display text-xl transition hover:text-gold-light"
            >
              (818) 402-7326
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/45">
                Call or text
              </span>
            </a>
            <a
              href="mailto:kjamal@rodeore.com"
              className="block border-b border-cream/15 py-3 font-display text-xl transition hover:text-gold-light"
            >
              kjamal@rodeore.com
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/45">
                Direct email
              </span>
            </a>
          </div>
        </motion.div>

        <LeadForm
          title="The 91311 conversation"
          subject="91311 hybrid conversation — kareemjamaltherealtor"
          source="web hybrid /91311"
          hiddenFields={{ zip_page: "91311 — Chatsworth (hybrid)" }}
          chips={chips}
          chipsLabel="Common questions — tap to ask"
          messageLabel="What's on your mind in Chatsworth?"
          messagePlaceholder="Buying, selling, horse property, timing…"
          showPhone
        />
      </div>
    </section>
  );
}
