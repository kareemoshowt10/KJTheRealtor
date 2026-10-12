"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Carousel } from "@/components/ui/carousel";

const pockets = [
  {
    id: "equestrian",
    pin: "EQ",
    tag: "The crown jewel",
    title: "Equestrian Chatsworth",
    signal: "Scarcity",
    body: "Horse-zoned foothill parcels with trail access. Scarcity pricing at its purest — verify zoning parcel by parcel, never by listing copy.",
    ask: "Verify horse zoning before you fall in love",
  },
  {
    id: "stoney",
    pin: "SP",
    tag: "The view play",
    title: "Stoney Point Foothills",
    signal: "Character",
    body: "Homes against the rock formations — character and views you can’t replicate at this price anywhere else in the Valley.",
    ask: "What do recent foothill sales actually clear at?",
  },
  {
    id: "indian-springs",
    pin: "IS",
    tag: "The polished option",
    title: "Indian Springs & newer builds",
    signal: "Move-up",
    body: "Master-planned polish for move-up buyers who want newer product without leaving the northwest Valley.",
    ask: "Compare HOA / build quality vs. older stock",
  },
  {
    id: "lake-manor",
    pin: "LM",
    tag: "The quiet flex",
    title: "Lake Manor adjacent",
    signal: "Privacy",
    body: "Semi-rural privacy near the Nature Preserve — acreage feel without full equestrian requirements.",
    ask: "Where does “quiet” still trade at a premium?",
  },
  {
    id: "transit",
    pin: "TC",
    tag: "The commuter arbitrage",
    title: "Near the Transportation Center",
    signal: "Entry",
    body: "Rail-adjacent pockets trade at a noise discount. For some Metrolink commuters, that discount is the entry.",
    ask: "Is the noise discount real money for you?",
  },
  {
    id: "south",
    pin: "SC",
    tag: "The foundation",
    title: "South Chatsworth",
    signal: "Steady",
    body: "Established single-family streets — the steady backbone. Cleanest first-home and long-hold profile in the zip.",
    ask: "Best first-home streets vs. long-hold streets",
  },
];

function PocketCard({
  pocket,
  index,
  active,
  total,
}: {
  pocket: (typeof pockets)[number];
  index: number;
  active: boolean;
  total: number;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full w-full flex-col rounded-2xl border p-6 transition-all duration-300 md:p-7",
        active
          ? "border-gold/70 bg-cream/[0.09] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(201,168,76,0.25)]"
          : "border-gold/20 bg-cream/[0.03] opacity-80"
      )}
      aria-current={active ? "true" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border text-[0.7rem] font-bold tracking-wide transition-colors",
              active
                ? "border-gold bg-gold text-navy"
                : "border-gold/40 text-gold-light"
            )}
          >
            {pocket.pin}
          </span>
          <span className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-gold-light">
            {pocket.tag}
          </span>
        </div>
        <span className="rounded-full border border-cream/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-cream/55">
          {pocket.signal}
        </span>
      </div>

      <h3 className="mt-5 font-display text-[1.55rem] leading-tight text-cream md:text-[1.75rem]">
        {pocket.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/70 md:text-[0.95rem]">
        {pocket.body}
      </p>

      <div className="mt-6 border-t border-cream/10 pt-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-gold/90">
          Local question
        </p>
        <p className="mt-1.5 text-sm text-cream/85">{pocket.ask}</p>
      </div>

      <p className="mt-5 text-[0.65rem] font-medium tabular-nums text-cream/40">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
    </article>
  );
}

function PinMap({
  active,
  onSelect,
  progress,
}: {
  active: number;
  onSelect: (i: number) => void;
  progress: MotionValue<number>;
}) {
  // Clamped, compositor-only transform — driven directly by the motion value
  // (no React state/re-render per scroll frame, no `width` layout thrash).
  const fill = useTransform(progress, (v) => Math.max(0, Math.min(1, v)));

  return (
    <div className="relative">
      <div className="absolute left-[1.125rem] right-[1.125rem] top-[1.15rem] h-px bg-cream/15 md:left-5 md:right-5" />
      <motion.div
        className="pointer-events-none absolute left-[1.125rem] right-[1.125rem] top-[1.15rem] h-px origin-left bg-gold md:left-5 md:right-5"
        style={{ scaleX: fill }}
        aria-hidden
      />

      <div
        className="relative flex items-start justify-between gap-1"
        role="tablist"
        aria-label="91311 pockets"
      >
        {pockets.map((p, i) => {
          const isActive = i === active;
          const isPast = i < active;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(i)}
              className="group flex min-w-0 flex-1 flex-col items-center gap-2 pt-0.5"
            >
              <span
                className={cn(
                  "relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border-2 text-[0.65rem] font-bold transition-all duration-300 md:h-10 md:w-10",
                  isActive
                    ? "scale-110 border-gold bg-gold text-navy shadow-[0_0_0_6px_rgba(201,168,76,0.22)]"
                    : isPast
                      ? "border-gold/70 bg-navy text-gold-light"
                      : "border-cream/25 bg-navy text-cream/45 group-hover:border-gold/50 group-hover:text-gold-light"
                )}
              >
                {isActive ? <MapPin size={14} strokeWidth={2.5} /> : p.pin}
              </span>
              <span
                className={cn(
                  "hidden max-w-[5.5rem] truncate text-center text-[0.62rem] font-semibold uppercase tracking-wide transition-colors sm:block",
                  isActive ? "text-gold-light" : "text-cream/40"
                )}
              >
                {p.title.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 91311 pocket map — one swipeable carousel on every device (the old
 * desktop scroll-jacked scrub is gone). The pin map doubles as navigation;
 * all six pockets stay in the DOM.
 */
export function ChatsworthPockets() {
  const [active, setActive] = useState(0);
  const [goTo, setGoTo] = useState<{ index: number; key: number }>();
  const progress = useSpring(0, { stiffness: 120, damping: 30 });

  useEffect(() => {
    progress.set(active / Math.max(1, pockets.length - 1));
  }, [active, progress]);

  return (
    <section id="pockets" className="bg-navy py-14 text-cream md:py-20">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            The pocket map
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.6rem)] font-medium leading-tight">
            Six Chatsworth markets.{" "}
            <em className="font-normal italic text-gold-light">One zip code.</em>
          </h2>
          <p className="mt-3 text-sm text-cream/70 md:text-base">
            Each pocket prices and appreciates differently. Structure
            doesn’t go stale. This week’s comps do — ask me for those.
          </p>
        </div>

        <div className="mt-8">
          <PinMap
            active={active}
            onSelect={(i) => setGoTo({ index: i, key: Date.now() })}
            progress={progress}
          />
        </div>

        <Carousel
          label="91311 pockets"
          tone="dark"
          className="mt-6"
          hideDots
          slideLabels={pockets.map((p) => p.title)}
          onIndexChange={setActive}
          goTo={goTo}
        >
          {pockets.map((p, i) => (
            <PocketCard
              key={p.id}
              pocket={p}
              index={i}
              active={i === active}
              total={pockets.length}
            />
          ))}
        </Carousel>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="#connect"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold-light"
          >
            Get this week’s numbers
          </a>
          <a
            href="https://kareemjamaltherealtor.com/91311/home-value"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-cream/40 px-6 text-sm font-semibold text-cream hover:border-gold hover:text-gold-light"
          >
            Already own here? Snapshot
          </a>
        </div>
      </div>
    </section>
  );
}
