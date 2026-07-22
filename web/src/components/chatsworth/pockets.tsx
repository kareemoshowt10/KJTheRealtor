"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "relative flex h-full w-[min(85vw,22rem)] shrink-0 flex-col rounded-2xl border p-6 transition-all duration-300 md:w-[min(70vw,26rem)] md:p-7",
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
  const [fill, setFill] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    setFill(Math.max(0, Math.min(1, v)));
  });

  return (
    <div className="relative">
      <div className="absolute left-[1.125rem] right-[1.125rem] top-[1.15rem] h-px bg-cream/15 md:left-5 md:right-5" />
      <div
        className="pointer-events-none absolute left-[1.125rem] top-[1.15rem] h-px bg-gold transition-[width] duration-150 ease-out md:left-5"
        style={{
          width: `calc((100% - 2.25rem) * ${fill})`,
        }}
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

/** Horizontal scrub driven by vertical scroll (desktop wow). */
function PocketScrub() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // Parent is the overflow-hidden viewport; travel = content past the first screen
    const parent = track.parentElement;
    const viewW = parent?.clientWidth ?? window.innerWidth;
    const max = Math.max(0, track.scrollWidth - viewW);
    setTravel(max);
  }, []);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" && track
        ? new ResizeObserver(() => measure())
        : null;
    if (track && ro) ro.observe(track);
    window.addEventListener("resize", measure);
    // Remeasure after fonts/layout settle
    const t = window.setTimeout(measure, 120);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
      window.clearTimeout(t);
    };
  }, [measure]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  const x = useTransform(smooth, [0, 1], [0, -travel]);

  useMotionValueEvent(smooth, "change", (v) => {
    const i = Math.round(v * (pockets.length - 1));
    setActive(Math.max(0, Math.min(pockets.length - 1, i)));
  });

  const scrollToIndex = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const height = el.offsetHeight - window.innerHeight;
    const t = pockets.length <= 1 ? 0 : i / (pockets.length - 1);
    window.scrollTo({
      top: top + height * t,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  // Tall enough to scrub through all cards
  const scrubHeight = `${Math.max(220, 100 + pockets.length * 55)}svh`;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: scrubHeight }}
    >
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden border-y border-cream/10 bg-navy md:top-16">
        <div className="mx-auto w-full max-w-6xl shrink-0 px-5 pb-3 pt-6 md:px-8 md:pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
                The pocket map · scroll to scrub
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.6rem)] font-medium leading-tight">
                Six Chatsworth markets.{" "}
                <em className="font-normal italic text-gold-light">
                  One zip code.
                </em>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous pocket"
                onClick={() => scrollToIndex(Math.max(0, active - 1))}
                disabled={active === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition hover:border-gold hover:text-gold-light disabled:opacity-30"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next pocket"
                onClick={() =>
                  scrollToIndex(Math.min(pockets.length - 1, active + 1))
                }
                disabled={active === pockets.length - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream transition hover:border-gold hover:text-gold-light disabled:opacity-30"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-6 md:mt-8">
            <PinMap
              active={active}
              onSelect={scrollToIndex}
              progress={smooth}
            />
          </div>

          <p className="mt-4 text-sm text-cream/60 md:max-w-lg">
            <span className="font-medium text-gold-light">
              {pockets[active].title}
            </span>
            <span className="text-cream/35"> · </span>
            {pockets[active].tag}
          </p>
        </div>

        <div className="relative min-h-0 flex-1">
          {/* Edge fades */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-navy to-transparent md:w-16"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-navy to-transparent md:w-16"
          />

          <div className="flex h-full items-stretch overflow-hidden pb-8 pt-2">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex h-full items-stretch gap-4 pl-5 will-change-transform md:gap-5 md:pl-8"
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
              {/* Trailing spacer so last card can center-ish */}
              <div className="w-[12vw] shrink-0 md:w-[18vw]" aria-hidden />
            </motion.div>
          </div>
        </div>

        {/* Bottom progress + CTAs */}
        <div className="mx-auto flex w-full max-w-6xl shrink-0 flex-col gap-4 px-5 pb-6 pt-1 md:flex-row md:items-center md:justify-between md:px-8 md:pb-8">
          <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-cream/10">
            <motion.div
              className="h-full origin-left rounded-full bg-gold"
              style={{ scaleX: smooth }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="#connect"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-5 text-sm font-semibold text-navy transition hover:bg-gold-light"
            >
              Get this week’s numbers
            </a>
            <a
              href="https://kareemjamaltherealtor.com/91311/home-value"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-cream/35 px-5 text-sm font-semibold text-cream transition hover:border-gold hover:text-gold-light"
            >
              Already own? Snapshot
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Touch-first horizontal carousel (mobile / reduced motion). */
function PocketCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const dummyProgress = useSpring(0, { stiffness: 120, damping: 30 });

  useEffect(() => {
    dummyProgress.set(active / Math.max(1, pockets.length - 1));
  }, [active, dummyProgress]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-pocket]"));
      if (!cards.length) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const c = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    const card = el?.querySelectorAll<HTMLElement>("[data-pocket]")[i];
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - 20,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-navy py-14 text-cream md:py-20">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            The pocket map · swipe
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.6rem)] font-medium leading-tight">
            Six Chatsworth markets.{" "}
            <em className="font-normal italic text-gold-light">
              One zip code.
            </em>
          </h2>
          <p className="mt-3 text-sm text-cream/70 md:text-base">
            Swipe the map — each pocket prices and appreciates differently.
            Structure doesn’t go stale. This week’s comps do.
          </p>
        </div>

        <div className="mt-8">
          <PinMap
            active={active}
            onSelect={scrollToIndex}
            progress={dummyProgress}
          />
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 scrollbar-none md:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {pockets.map((p, i) => (
          <div key={p.id} data-pocket className="snap-center">
            <PocketCard
              pocket={p}
              index={i}
              active={i === active}
              total={pockets.length}
            />
          </div>
        ))}
        <div className="w-4 shrink-0" aria-hidden />
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-3 px-5 sm:flex-row md:px-8">
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
  );
}

/**
 * 91311 pocket map — vertical-scroll drives horizontal scrub on desktop;
 * swipe carousel on mobile / reduced-motion.
 */
export function ChatsworthPockets() {
  const reduced = useReducedMotion();
  const [isCoarse, setIsCoarse] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    const mqNarrow = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsCoarse(mqCoarse.matches);
      setNarrow(mqNarrow.matches);
    };
    update();
    mqCoarse.addEventListener("change", update);
    mqNarrow.addEventListener("change", update);
    return () => {
      mqCoarse.removeEventListener("change", update);
      mqNarrow.removeEventListener("change", update);
    };
  }, []);

  // Mobile / touch / reduced: swipe carousel (more usable)
  // Desktop pointer: sticky vertical→horizontal scrub (wow)
  const useScrub = !reduced && !isCoarse && !narrow;

  return (
    <section id="pockets" className="bg-navy text-cream">
      {/* Intro only for scrub mode (carousel has its own) */}
      {useScrub && (
        <div className="mx-auto max-w-6xl px-5 pb-2 pt-16 md:px-8 md:pt-24">
          <p className="max-w-2xl text-cream/75">
            Chatsworth isn’t one market — it’s six pockets that price and
            appreciate differently. Scroll to walk the map. Structure doesn’t go
            stale. This week’s comps do — ask me for those.
          </p>
        </div>
      )}
      {useScrub ? <PocketScrub /> : <PocketCarousel />}
    </section>
  );
}
