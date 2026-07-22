"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    num: "01",
    title: "Position",
    decision: "Does this home improve your life without weakening your next move?",
    body: "We define what this move must improve: monthly comfort, commute, schools, space, care needs, or long-term equity — before emotion takes the wheel.",
    output: "You receive: a one-page Move Map",
    kicker: "Life + money",
  },
  {
    num: "02",
    title: "Protect",
    decision: "What must be true for this deal to remain a smart deal?",
    body: "We set the walk-away number, contingency strategy, repair priorities, and negotiation limits in writing — so pressure never rewrites the plan at the kitchen table.",
    output: "You receive: written Offer Guardrails",
    kicker: "Boundaries",
  },
  {
    num: "03",
    title: "Compound",
    decision: "Will this property create flexibility or consume it?",
    body: "We model how equity, payment, ownership timeline, and future options work together after closing — not only on closing day.",
    output: "You receive: a 3-horizon Equity Plan",
    kicker: "After close",
  },
  {
    num: "04",
    title: "Transfer",
    decision: "Could your family understand and act on your plan without guessing?",
    body: "We identify ownership, records, family conversations, and licensed advisors needed to make the asset easier to manage — and eventually pass on.",
    output: "You receive: a Family Handoff Checklist",
    kicker: "Next generation",
  },
];

function MethodStep({
  item,
  index,
  active,
  onActive,
  reduced,
}: {
  item: (typeof steps)[number];
  index: number;
  active: boolean;
  onActive: (i: number) => void;
  reduced: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, {
    margin: "-35% 0px -40% 0px",
    amount: 0.35,
  });

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <motion.li
      ref={ref}
      initial={reduced ? false : { opacity: 0.35, y: 28 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.45, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative scroll-mt-28 pl-10 md:pl-12",
        "min-h-[56svh] py-8 md:min-h-0 md:py-10"
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-paper font-display text-xs font-medium transition-colors duration-300 md:top-11",
          active
            ? "border-gold bg-gold text-navy shadow-[0_0_0_6px_rgba(201,168,76,0.2)]"
            : "border-gold/50 text-gold-deep"
        )}
        aria-hidden
      >
        {item.num}
      </span>

      <article
        className={cn(
          "rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 md:p-6",
          active ? "border-gold/70 shadow-gold" : "border-[#e3d8c7] opacity-90"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold-deep">
            {item.kicker}
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-navy/45">
            Step {item.num}
          </span>
        </div>
        <h3 className="mt-3 font-display text-[1.5rem] font-medium text-navy md:text-2xl">
          {item.title}
        </h3>
        <p className="mt-3 text-sm font-medium leading-snug text-navy md:text-[0.95rem]">
          The decision: {item.decision}
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-slateink md:text-base">
          {item.body}
        </p>
        <p className="mt-4 rounded-lg bg-cream px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-gold-deep md:text-[0.7rem]">
          {item.output}
        </p>
      </article>
    </motion.li>
  );
}

/**
 * Generational Wealth Method™ — mobile-first scroll-driven timeline
 * (same pattern as Chatsworth story).
 */
export function MethodTimeline() {
  const listRef = useRef<HTMLOListElement | null>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.7", "end 0.35"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.35,
  });

  const lineScale = useTransform(smooth, [0, 1], [0.02, 1]);

  return (
    <section
      id="method"
      className="relative bg-gradient-to-b from-paper via-[#F7F1E7] to-paper pb-8 pt-14 md:pb-24 md:pt-20"
    >
      {/* Mobile sticky step chrome */}
      <div className="sticky top-[3.25rem] z-30 border-b border-gold/20 bg-paper/95 px-4 py-2.5 backdrop-blur-md md:top-20 md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-gold-deep">
              Method {steps[active].num} · {steps[active].kicker}
            </p>
            <p className="truncate font-display text-sm font-medium text-navy">
              {steps[active].title}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-4 rounded-full transition-colors",
                  i === active ? "bg-gold" : "bg-navy/15"
                )}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-navy/5">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-light"
            style={{ scaleX: reduced ? 1 : lineScale }}
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-8">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            The Method · scroll
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.85rem,4.5vw,3rem)] font-medium leading-tight text-navy">
            The Generational Wealth Method
            <sup className="ml-0.5 text-[0.45em] text-gold-deep">™</sup>
          </h2>
          <p className="mt-5 border-l-2 border-gold pl-4 font-display text-lg italic leading-snug text-navy md:text-xl">
            Four decisions most transactions skip —{" "}
            <strong className="font-medium not-italic text-gold-deep">
              before emotion takes over.
            </strong>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-slateink md:text-[0.95rem]">
            Before I recommend a home, price, or offer, we answer these in order.
            You leave with a plan you can see, use, and revisit — especially when
            parents and adult children share the table.
          </p>

          <div className="mt-8 hidden md:block">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gold-deep">
              Now reading
            </p>
            <p className="mt-1 font-display text-xl text-navy">
              {steps[active].num} — {steps[active].title}
            </p>
            <ol className="mt-5 space-y-1.5">
              {steps.map((s, i) => (
                <li key={s.num}>
                  <button
                    type="button"
                    onClick={() => {
                      const el = listRef.current?.children[i] as
                        | HTMLElement
                        | undefined;
                      el?.scrollIntoView({
                        behavior: reduced ? "auto" : "smooth",
                        block: "center",
                      });
                    }}
                    className={cn(
                      "flex w-full min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition",
                      i === active
                        ? "bg-gold/15 font-semibold text-navy"
                        : "text-slateink hover:bg-navy/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold",
                        i === active
                          ? "bg-gold text-navy"
                          : "bg-navy/10 text-navy/50"
                      )}
                    >
                      {s.num}
                    </span>
                    <span>{s.title}</span>
                    <span className="ml-auto truncate text-xs text-slateink/70">
                      {s.kicker}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <a
            href="#start"
            className="mt-8 hidden text-sm font-semibold text-gold-deep hover:underline md:inline-flex"
          >
            Start with a conversation →
          </a>
        </div>

        <div className="relative">
          <div
            className="absolute bottom-8 left-0 top-8 w-px bg-navy/10"
            aria-hidden
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full w-full origin-top bg-gradient-to-b from-gold-deep via-gold to-gold-light"
                style={{ scaleY: reduced ? 1 : lineScale }}
              />
            </div>
          </div>

          <ol ref={listRef} className="relative">
            {steps.map((item, index) => (
              <MethodStep
                key={item.num}
                item={item}
                index={index}
                active={active === index}
                onActive={setActive}
                reduced={!!reduced}
              />
            ))}
          </ol>

          <div className="mt-2 space-y-3 pb-6 pl-0 text-center md:pl-12 md:text-left">
            <p className="text-xs text-slateink/70">
              The rule: if a property doesn&apos;t support at least three of your
              four answers, it may be attractive — but it&apos;s probably not your
              move.
            </p>
            <a
              href="#start"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-5 text-sm font-semibold text-cream hover:bg-navy-mist md:hidden"
            >
              Build my Move Map with Kareem
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
