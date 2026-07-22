"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const ease = [0.22, 1, 0.36, 1] as const;

export function ChatsworthHero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.16]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const watermarkY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden text-cream"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={
          reduced
            ? {
                backgroundImage:
                  "linear-gradient(115deg, rgba(5,12,28,0.92) 0%, rgba(5,15,32,0.62) 50%, rgba(5,15,32,0.35) 100%), url('/assets/cliffside-sunset.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                scale: bgScale,
                y: bgY,
                backgroundImage:
                  "linear-gradient(115deg, rgba(5,12,28,0.92) 0%, rgba(5,15,32,0.62) 50%, rgba(5,15,32,0.35) 100%), url('/assets/cliffside-sunset.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
        }
      />

      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/3 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl"
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      )}

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
        className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-5 pb-20 pt-28 md:px-8 md:pb-24"
        style={reduced ? undefined : { opacity: contentOpacity }}
      >
        <motion.p
          className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
        >
          My Zip Codes · Chapter I of III · Where I&apos;m from
        </motion.p>
        <motion.p
          className="mt-4 font-display text-4xl font-medium tracking-tight text-gold md:text-5xl"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.22 }}
        >
          913<em className="text-gold-light">11</em>
        </motion.p>
        <motion.h1
          className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-medium leading-[1.05] tracking-tight"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.32 }}
        >
          Chatsworth. The Valley still keeps its{" "}
          <em className="font-normal italic text-gold-light">horses here.</em>
        </motion.h1>
        <motion.p
          className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-cream/88"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.48 }}
        >
          Stagecoach ruts you can stand in. The most-filmed rocks in Hollywood
          history. One of the last real horse-keeping corners inside Los
          Angeles. This is the zip I&apos;m from — history for the heart, numbers
          for the head.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.62 }}
        >
          <ShimmerButton href="#story">Scroll the story</ShimmerButton>
          <ShimmerButton
            variant="outline"
            href="https://kareemjamaltherealtor.com/91311/home-value"
          >
            Owners: Equity Snapshot
          </ShimmerButton>
          <a
            href="#connect"
            className="inline-flex min-h-12 items-center justify-center text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
          >
            Talk 91311 with me →
          </a>
        </motion.div>
        <motion.div
          className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cream/55"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <span>Est. 1888</span>
          <span className="text-gold">·</span>
          <span>Horse-keeping zoning</span>
          <span className="text-gold">·</span>
          <span>Santa Susana Pass</span>
          <span className="text-gold">·</span>
          <span>Metrolink &amp; Amtrak</span>
        </motion.div>
      </motion.div>

      {!reduced && (
        <motion.a
          href="#story"
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
        >
          <span>Story</span>
          <motion.span
            className="block h-8 w-px bg-gradient-to-b from-gold to-transparent"
            animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.a>
      )}
    </section>
  );
}
