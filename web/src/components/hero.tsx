"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { HvsWidget } from "@/components/hvs-widget";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Sprint 1 hero: optimized LCP image (next/image + priority),
 * face above the fold, one primary CTA → #start.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden text-cream"
    >
      {/* LCP: real Image, not CSS background — Next optimizes AVIF/WebP + sizes */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduced ? undefined : { y: bgY, scale: bgScale }}
      >
        <Image
          src="/assets/home-is-personal-poster.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={72}
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[rgba(5,12,28,0.94)] via-[rgba(5,15,32,0.72)] to-[rgba(5,15,32,0.4)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30"
          aria-hidden
        />
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-24 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-10 md:px-8 md:pb-24 md:pt-28"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div>
          {/* Face + identity — friendly above the fold */}
          <motion.div
            className="mb-6 flex items-center gap-3.5"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 shadow-[0_0_0_3px_rgba(201,168,76,0.15)] md:h-16 md:w-16">
              <Image
                src="/assets/kareem-jamal-headshot-2026-web.jpg"
                alt="Kareem Jamal"
                fill
                priority
                sizes="64px"
                quality={80}
                className="object-cover object-top"
              />
            </span>
            <div>
              <p className="font-display text-lg leading-tight text-cream md:text-xl">
                Kareem Jamal
              </p>
              <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-gold">
                Rodeo Realty · CA DRE #01998956
              </p>
              <p className="mt-0.5 text-xs text-cream/65">
                Raised in Chatsworth &amp; West Hills
              </p>
            </div>
          </motion.div>

          <motion.h1
            className="max-w-3xl font-display text-[clamp(2.35rem,5.8vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.03em]"
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.12 }}
          >
            Homeownership,{" "}
            <span className="block text-gold-light">
              <AnimatedTextCycle
                words={["explained.", "protected.", "planned.", "handed down."]}
                interval={3200}
                className="text-gold-light"
              />
            </span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-cream/88 md:text-[1.08rem]"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.28 }}
          >
            Kitchen-table patience for parents, adult children, and long-held
            homes — with the numbers to match. One personal reply. No drip.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.4 }}
          >
            <ShimmerButton href="#start" className="w-full sm:w-auto sm:min-w-[14rem]">
              Tell me what&apos;s going on
            </ShimmerButton>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <a
                href="tel:+18184027326"
                className="font-semibold text-cream/90 underline-offset-4 hover:text-gold-light hover:underline"
              >
                Call (818) 402-7326
              </a>
              <span className="hidden text-cream/30 sm:inline" aria-hidden>
                ·
              </span>
              <a
                href="#start-here"
                className="font-semibold text-gold-light underline-offset-4 hover:underline"
              >
                Not sure? Pick your path
              </a>
            </div>
          </motion.div>

          <motion.p
            className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cream/50"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            Not sold · Not gatekept · Not rushed
          </motion.p>
        </div>

        {/* Percy HVS — front-and-center on first paint */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.35 }}
          className="w-full"
        >
          <HvsWidget
            compact
            heading="What's your home worth?"
            subheading="Type your address — free Equity Snapshot from Kareem."
          />
        </motion.div>
      </motion.div>

      {!reduced && (
        <motion.a
          href="#zips"
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          aria-label="Scroll to zip codes"
        >
          <span>Scroll</span>
          <motion.span
            className="block h-7 w-px bg-gradient-to-b from-gold to-transparent"
            animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.a>
      )}
    </section>
  );
}
