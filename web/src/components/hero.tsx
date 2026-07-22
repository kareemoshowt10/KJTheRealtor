"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 48]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0.35]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden text-cream"
    >
      {/* Ken Burns + parallax background */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={
          reduced
            ? {
                backgroundImage:
                  "linear-gradient(105deg, rgba(5,12,28,0.9) 0%, rgba(5,15,32,0.55) 48%, rgba(5,15,32,0.28) 100%), url('/assets/home-is-personal-poster.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                y: bgY,
                scale: bgScale,
                backgroundImage:
                  "linear-gradient(105deg, rgba(5,12,28,0.9) 0%, rgba(5,15,32,0.55) 48%, rgba(5,15,32,0.28) 100%), url('/assets/home-is-personal-poster.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
        }
      />

      {/* Ambient gold orbs */}
      {!reduced && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
            animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.12, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
            animate={{ opacity: [0.15, 0.4, 0.15], scale: [1.05, 1, 1.05] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </>
      )}

      <motion.div
        className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-5 pb-20 pt-28 md:px-8 md:pb-24 md:pt-32"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          className="mb-5 flex items-center gap-3"
          initial={reduced ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.05 }}
        >
          <motion.span
            className="h-px origin-left bg-gold"
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
            style={{ width: 40 }}
          />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            Kareem Jamal · Rodeo Realty Fine Estates
          </span>
        </motion.div>

        <motion.h1
          className="max-w-3xl font-display text-[clamp(2.5rem,6.2vw,4.85rem)] font-medium leading-[1.02] tracking-[-0.035em]"
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.18 }}
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

        <motion.div
          className="mt-5 flex flex-wrap gap-2"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.08, delayChildren: 0.42 },
            },
          }}
        >
          {["Not sold", "Not gatekept", "Not rushed"].map((t) => (
            <motion.span
              key={t}
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.94 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.4, ease },
                },
              }}
              className="rounded-full border border-gold/40 bg-navy/40 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-gold-light backdrop-blur"
            >
              {t}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-cream/88"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.55 }}
        >
          You don&apos;t need a sales pitch. You need the real numbers and the
          honest trade-offs — kitchen-table patience for parents, adult children,
          and long-held homes. One personal reply. No drip campaign.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.68 }}
        >
          <ShimmerButton href="https://kareemjamaltherealtor.com/buyer-presentation">
            Buyer Strategy Session
          </ShimmerButton>
          <ShimmerButton
            variant="outline"
            href="https://kareemjamaltherealtor.com/91311/home-value"
          >
            Equity Snapshot
          </ShimmerButton>
          <a
            href="#family-table"
            className="text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
          >
            For parents &amp; kids helping them →
          </a>
        </motion.div>

        <motion.p
          className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cream/55"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          Southern California · Rodeo Realty Fine Estates · CA DRE #01998956
        </motion.p>
      </motion.div>

      {/* Scroll cue */}
      {!reduced && (
        <motion.a
          href="#zips"
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          aria-label="Scroll to zip codes"
        >
          <span>Scroll</span>
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
