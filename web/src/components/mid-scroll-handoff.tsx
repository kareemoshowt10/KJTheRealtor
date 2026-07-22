"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

type Props = {
  formId?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
};

/**
 * Warm mid-page handoff — captures intent after social proof / method,
 * before FAQ friction, and drives scroll to the lead form.
 */
export function MidScrollHandoff({
  formId = "start",
  eyebrow = "Ready when you are",
  title = "One honest conversation. No follow-up campaign.",
  body = "Tell me what you're working toward — parents' home, Prop 19, buy/sell timing, or just \"what is this place worth.\" I reply personally, usually the same day.",
  ctaLabel = "Share what's on your mind",
}: Props) {
  const reduced = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-paper via-cream to-paper py-14 md:py-20">
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.15, 1] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div
        className="relative mx-auto max-w-3xl px-5 text-center md:px-8"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease }}
      >
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-medium leading-tight text-navy">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slateink md:text-base">
          {body}
        </p>

        <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={`#${formId}`}
            className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-md bg-gold px-7 text-sm font-semibold text-navy shadow-[0_10px_28px_-10px_rgba(201,168,76,0.7)] transition hover:bg-gold-light active:scale-[0.98]"
          >
            {!reduced && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
              />
            )}
            <span className="relative z-[1]">{ctaLabel}</span>
            <ArrowRight
              size={16}
              className="relative z-[1] transition group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="tel:+18184027326"
            className="text-sm font-semibold text-navy/70 underline-offset-4 transition hover:text-navy hover:underline"
          >
            Or call (818) 402-7326
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.72rem] font-medium text-slateink/75">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-gold-deep" />
            Explicit permission only
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Usually same-day reply
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            CA DRE #01998956
          </span>
        </div>
      </motion.div>
    </section>
  );
}
