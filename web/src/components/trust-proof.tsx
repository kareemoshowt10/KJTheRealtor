"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Shield,
} from "lucide-react";

const pillars = [
  {
    icon: MapPin,
    title: "From the zip codes I serve",
    body: "Raised in Chatsworth & West Hills. I chose East Simi for my own family. Local isn’t a slogan — it’s my map.",
  },
  {
    icon: HeartHandshake,
    title: "Kitchen-table first",
    body: "Parents, adult children, long-held homes. Patience before pressure. I’ll tell you when waiting is smarter.",
  },
  {
    icon: Shield,
    title: "Permission only",
    body: "One personal reply when you ask. No drip campaigns, no shared lists, no “just checking in” six months later.",
  },
  {
    icon: BadgeCheck,
    title: "Licensed & brokered properly",
    body: "California DRE #01998956 · Rodeo Realty Fine Estates · Equal Housing Opportunity.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Sprint 2 trust block — no stock faces, no invented quotes.
 * Real credentials + path to verified reviews / references.
 */
export function TrustProof() {
  const reduced = useReducedMotion();

  return (
    <section id="trust" className="bg-navy py-16 text-cream md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.95fr_1.05fr] md:items-center md:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease }}
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-gold/30 shadow-2xl md:mx-0">
            <Image
              src="/assets/kareem-jamal-headshot-2026-web.jpg"
              alt="Kareem Jamal, Rodeo Realty Fine Estates"
              fill
              className="object-cover object-top"
              sizes="(max-width:768px) 90vw, 380px"
              quality={78}
            />
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/70 to-transparent p-5 pt-16"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-xl text-cream">Kareem Jamal</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                Generational wealth realtor
              </p>
            </div>
          </div>
        </motion.div>

        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            Why families trust this table
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3.8vw,2.65rem)] font-medium leading-tight">
            Proof without{" "}
            <em className="font-normal italic text-gold-light">
              the fake polish.
            </em>
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/75 md:text-base">
            I don&apos;t put stock photos next to invented five-star quotes. Here
            is what is true — and how you can verify the rest when we talk.
          </p>

          <ul className="mt-8 space-y-5">
            {pillars.map((item, i) => (
              <motion.li
                key={item.title}
                className="flex gap-3.5"
                initial={reduced ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease }}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/35 bg-white/5 text-gold">
                  <item.icon size={18} />
                </span>
                <div>
                  <p className="font-semibold text-cream">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cream/70">
                    {item.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href="#start"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-gold px-6 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              Start a real conversation
            </a>
            <a
              href="https://www.google.com/search?q=Kareem+Jamal+Rodeo+Realty+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-cream/30 px-5 text-sm font-semibold text-cream transition hover:border-gold hover:text-gold-light"
            >
              <MessageCircle size={16} className="text-gold" />
              Google / public reviews
            </a>
          </div>
          <p className="mt-4 text-[0.72rem] leading-relaxed text-cream/50">
            Prefer a direct reference? Ask when we talk — I&apos;ll connect you
            with a family who sat at a similar kitchen table (with their
            permission).
          </p>
        </div>
      </div>
    </section>
  );
}
