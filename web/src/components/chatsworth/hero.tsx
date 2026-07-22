"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { HvsWidget } from "@/components/hvs-widget";

const ease = [0.22, 1, 0.36, 1] as const;

export function ChatsworthHero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const watermarkY = useTransform(scrollYProgress, [0, 1], [0, -32]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden text-cream"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduced ? undefined : { scale: bgScale, y: bgY }}
      >
        <Image
          src="/assets/cliffside-sunset.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={72}
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[rgba(5,12,28,0.93)] via-[rgba(5,15,32,0.68)] to-[rgba(5,15,32,0.38)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/25"
          aria-hidden
        />
      </motion.div>

      <motion.span
        className="pointer-events-none absolute right-[-4%] top-[18%] select-none font-display text-[clamp(8rem,28vw,18rem)] font-medium leading-none text-cream/[0.07]"
        aria-hidden
        style={reduced ? undefined : { y: watermarkY }}
        initial={reduced ? false : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease, delay: 0.2 }}
      >
        91311
      </motion.span>

      <motion.div
        className="relative z-10 mx-auto grid max-w-6xl gap-8 px-5 pb-16 pt-24 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-10 md:px-8 md:pb-24"
        style={reduced ? undefined : { opacity: contentOpacity }}
      >
        <div>
          <motion.div
            className="mb-5 flex items-center gap-3.5"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.08 }}
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 md:h-14 md:w-14">
              <Image
                src="/assets/kareem-jamal-headshot-2026-web.jpg"
                alt="Kareem Jamal"
                fill
                priority
                sizes="56px"
                quality={80}
                className="object-cover object-top"
              />
            </span>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
                Chapter I · Where I&apos;m from
              </p>
              <p className="mt-0.5 text-sm text-cream/70">
                Kareem Jamal · raised in Chatsworth
              </p>
            </div>
          </motion.div>

          <motion.p
            className="font-display text-4xl font-medium tracking-tight text-gold md:text-5xl"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.18 }}
          >
            913<em className="text-gold-light">11</em>
          </motion.p>
          <motion.h1
            className="mt-2 max-w-3xl font-display text-[clamp(2.2rem,5.2vw,3.9rem)] font-medium leading-[1.06] tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.28 }}
          >
            Chatsworth. The Valley still keeps its{" "}
            <em className="font-normal italic text-gold-light">horses here.</em>
          </motion.h1>
          <motion.p
            className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-cream/88"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.4 }}
          >
            Horse zoning, pocket pricing, and family-home strategy from someone
            who grew up here — history for the heart, numbers for the head.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.5 }}
          >
            <ShimmerButton href="#connect" className="w-full sm:w-auto sm:min-w-[13rem]">
              Talk 91311 with me
            </ShimmerButton>
            <a
              href="#pockets"
              className="text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
            >
              Walk the pocket map
            </a>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cream/50"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <span>Horse-keeping zoning</span>
            <span className="text-gold">·</span>
            <span>Santa Susana Pass</span>
            <span className="text-gold">·</span>
            <span>Metrolink &amp; Amtrak</span>
          </motion.div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.4 }}
        >
          <HvsWidget
            id="equity-snapshot-91311"
            compact
            heading="Own in 91311?"
            subheading="Enter your Chatsworth address for a free Equity Snapshot."
          />
        </motion.div>
      </motion.div>

      {!reduced && (
        <motion.a
          href="#pockets"
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span>Map</span>
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
