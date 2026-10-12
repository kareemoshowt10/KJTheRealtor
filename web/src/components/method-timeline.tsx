"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Carousel } from "@/components/ui/carousel";

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

/**
 * Generational Wealth Method™ — four decisions as a swipeable carousel.
 * The step list on the left doubles as carousel navigation; every step's
 * text stays in the DOM.
 */
export function MethodTimeline() {
  const [active, setActive] = useState(0);
  const [goTo, setGoTo] = useState<{ index: number; key: number }>();

  return (
    <section
      id="method"
      className="relative bg-gradient-to-b from-paper via-[#F7F1E7] to-paper py-14 md:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-8">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            The Method
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

          <ol className="mt-8 hidden space-y-1.5 md:block" aria-label="Method steps">
            {steps.map((s, i) => (
              <li key={s.num}>
                <button
                  type="button"
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => setGoTo({ index: i, key: Date.now() })}
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
                      i === active ? "bg-gold text-navy" : "bg-navy/10 text-navy/50"
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

        <div className="min-w-0 md:self-center">
          <Carousel
            label="The four method decisions"
            slideClassName="basis-[90%] md:basis-full"
            slideLabels={steps.map((s) => s.title)}
            onIndexChange={setActive}
            goTo={goTo}
          >
            {steps.map((item) => (
              <article
                key={item.num}
                className="flex h-full w-full flex-col rounded-2xl border border-[#e3d8c7] bg-white p-5 shadow-sm md:p-7"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-display text-xs text-gold-light">
                    {item.num}
                  </span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold-deep">
                    {item.kicker}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[1.5rem] font-medium text-navy md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-snug text-navy md:text-base">
                  The decision: {item.decision}
                </p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-slateink md:text-base">
                  {item.body}
                </p>
                <p className="mt-auto rounded-lg bg-cream px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-gold-deep md:text-[0.7rem]">
                  {item.output}
                </p>
              </article>
            ))}
          </Carousel>

          <div className="mt-6 space-y-3 text-center md:text-left">
            <p className="text-xs text-slateink/70">
              The rule: if a property doesn&apos;t support at least three of your
              four answers, it may be attractive — but it&apos;s probably not your
              move.
            </p>
            <a
              href="#start"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-5 text-sm font-semibold text-cream hover:bg-navy-mist"
            >
              Build my Move Map with Kareem
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
