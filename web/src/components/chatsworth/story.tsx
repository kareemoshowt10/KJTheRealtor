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

const eras = [
  {
    era: "First peoples",
    year: "Before maps",
    title: "The pass before the pavement",
    body: "Village and trade sites lined the Santa Susana corridor — the natural gateway between the San Fernando and Simi valleys. The sandstone that makes Chatsworth famous made it habitable then: shelter, water pockets, and lookouts over the Valley floor.",
    kicker: "Place",
  },
  {
    era: "1861",
    year: "1861",
    title: "Blindfolded horses on the Devil’s Slide",
    body: "The first overland mail stage rolled through the pass. The descent was so steep they called it the Devil’s Slide. The wagon ruts are still cut into Santa Susana Pass State Historic Park. You can stand in them.",
    kicker: "Route",
  },
  {
    era: "1888",
    year: "1888",
    title: "A frontier town with an aristocrat’s name",
    body: "Homesteaders founded the town and borrowed its name from Chatsworth House in England. The Hill-Palmer cottage still stands at Homestead Acre — a one-room bridge from covered wagons to tract homes.",
    kicker: "Town",
  },
  {
    era: "1904",
    year: "1904",
    title: "The railroad conquers the pass",
    body: "When the line opened, Chatsworth became a real stop on the coast route. That same corridor is why you can board Metrolink or Amtrak here this morning — infrastructure this old doesn’t move, and neither does the value it anchors.",
    kicker: "Rail",
  },
  {
    era: "1912–60s",
    year: "Film era",
    title: "Hollywood’s favorite backlot",
    body: "Roughly 2,000 productions shot among the Garden of the Gods. When you hike at golden hour, you’re standing inside more movies than any studio lot on Earth.",
    kicker: "Screen",
  },
  {
    era: "Today",
    year: "Now",
    title: "The last horse town inside the city",
    body: "Horse-keeping zoning, real acreage, trails, and two rail lines. Not a museum — a working neighborhood holding what the rest of LA zoned away. That scarcity is the investment thesis.",
    kicker: "Scarcity",
  },
];

function TimelineStep({
  item,
  index,
  active,
  onActive,
  reduced,
}: {
  item: (typeof eras)[number];
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
        /* mobile: tall steps so scroll progress feels intentional */
        "min-h-[58svh] py-8 md:min-h-0 md:py-10"
      )}
    >
      {/* Node */}
      <span
        className={cn(
          "absolute left-0 top-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-paper transition-colors duration-300 md:top-11",
          active
            ? "border-gold bg-gold text-navy shadow-[0_0_0_6px_rgba(201,168,76,0.2)]"
            : "border-gold/50 text-gold-deep"
        )}
        aria-hidden
      >
        <span className="text-[0.65rem] font-bold tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </span>

      <article
        className={cn(
          "rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 md:p-6",
          active
            ? "border-gold/70 shadow-gold"
            : "border-[#e3d8c7] opacity-90"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold-deep">
            {item.kicker}
          </span>
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
            {item.year}
          </span>
        </div>
        <h3 className="mt-3 font-display text-[1.35rem] font-medium leading-snug text-navy md:text-2xl">
          {item.title}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-slateink md:text-base">
          {item.body}
        </p>
      </article>
    </motion.li>
  );
}

/**
 * Scroll-driven Chatsworth origin timeline — mobile-first.
 * Progress line + sticky chapter chrome; reduced-motion falls back to static.
 */
export function ChatsworthStory() {
  const sectionRef = useRef<HTMLElement>(null);
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
      id="story"
      ref={sectionRef}
      className="relative bg-paper pb-8 pt-14 md:pb-24 md:pt-20"
    >
      {/* Mobile sticky chapter indicator */}
      <div className="sticky top-[3.25rem] z-30 border-b border-gold/20 bg-paper/95 px-4 py-2.5 backdrop-blur-md md:top-20 md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-gold-deep">
              Chapter {String(active + 1).padStart(2, "0")} · {eras[active].year}
            </p>
            <p className="truncate font-display text-sm font-medium text-navy">
              {eras[active].title}
            </p>
          </div>
          <div className="flex shrink-0 gap-1" aria-hidden>
            {eras.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === active ? "bg-gold" : "bg-navy/15"
                )}
              />
            ))}
          </div>
        </div>
        {/* thin progress under sticky bar */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-navy/5">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-light"
            style={{ scaleX: reduced ? 1 : lineScale }}
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-8">
        {/* Intro / desktop sticky rail */}
        <div className="md:sticky md:top-28 md:self-start">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            The long story · scroll
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.85rem,4.5vw,3rem)] font-medium leading-tight text-navy">
            A thousand years before the first{" "}
            <em className="font-normal italic text-gold-deep">for-sale sign.</em>
          </h2>
          <p className="mt-5 border-l-2 border-gold pl-4 font-display text-lg italic leading-snug text-navy md:text-xl">
            Every era left something you can still{" "}
            <strong className="font-medium not-italic text-gold-deep">
              walk on, ride past, or own.
            </strong>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-slateink md:text-[0.95rem]">
            Most agents will tell you what a neighborhood costs. Almost none can
            tell you what it <em>is</em>. Scroll the timeline — Chatsworth earned
            its character the long way.
          </p>

          {/* Desktop active chapter + scrub list */}
          <div className="mt-8 hidden md:block">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gold-deep">
              Now reading
            </p>
            <p className="mt-1 font-display text-xl text-navy">
              {eras[active].year} — {eras[active].title}
            </p>
            <ol className="mt-5 space-y-1.5">
              {eras.map((e, i) => (
                <li key={e.era}>
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
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition",
                      i === active
                        ? "bg-gold/15 font-semibold text-navy"
                        : "text-slateink hover:bg-navy/5"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        i === active ? "bg-gold" : "bg-navy/20"
                      )}
                    />
                    <span className="tabular-nums text-gold-deep">{e.year}</span>
                    <span className="truncate">{e.kicker}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Scroll track */}
        <div className="relative">
          {/* Vertical progress line */}
          <div
            className="absolute bottom-8 left-0 top-8 w-px -translate-x-0 bg-navy/10 md:left-0"
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
            {eras.map((item, index) => (
              <TimelineStep
                key={item.era}
                item={item}
                index={index}
                active={active === index}
                onActive={setActive}
                reduced={!!reduced}
              />
            ))}
          </ol>

          <p className="mt-2 pb-6 text-center text-xs text-slateink/70 md:text-left md:pl-12">
            Scarcity is the thesis — zoning, lot size, rail, and open space the
            Valley stopped making.
          </p>
        </div>
      </div>
    </section>
  );
}
