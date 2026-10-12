"use client";

import {
  Children,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

type Props = {
  /** Accessible name for the carousel region, e.g. "Buyer tools". */
  label: string;
  children: ReactNode;
  /**
   * Width of each slide. Defaults to one-and-a-peek on mobile, two on
   * tablet, three on desktop. Pass e.g. "basis-full" for one-up slides.
   */
  slideClassName?: string;
  /** Optional per-slide labels used for dots and screen readers. */
  slideLabels?: string[];
  /** Colour treatment for controls on light vs. navy backgrounds. */
  tone?: Tone;
  className?: string;
  /** Hide the dot row (arrows remain). */
  hideDots?: boolean;
  /** Called whenever the active (left-most fully visible) slide changes. */
  onIndexChange?: (index: number) => void;
  /** Request a scroll to a slide. Change `key` to repeat the same index. */
  goTo?: { index: number; key: number };
};

/**
 * Lightweight, dependency-free carousel.
 *
 * - Native horizontal scroll + CSS scroll-snap: touch swipe, trackpad and
 *   shift-wheel all work without JS.
 * - Prev/next arrows and dots appear only when the slides actually overflow,
 *   so on wide screens a 3-card set still reads as a plain row.
 * - Every slide is always rendered in the DOM (good for SEO and screen
 *   readers); nothing is hidden with aria-hidden or display:none.
 * - Arrow keys move one slide when the track has focus. No autoplay.
 * - Smooth scrolling is disabled under prefers-reduced-motion.
 */
export function Carousel({
  label,
  children,
  slideClassName = "basis-[86%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)]",
  slideLabels,
  tone = "light",
  className,
  hideDots = false,
  onIndexChange,
  goTo,
}: Props) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const id = useId();

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflowing(max > 4);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
    const items = Array.from(el.children) as HTMLElement[];
    const left = el.scrollLeft;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
      const d = Math.abs(item.offsetLeft - el.offsetLeft - pad - left);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    // At the far right, the last slide is "current" even if it can't snap to the left edge.
    if (left >= max - 4 && max > 4) best = items.length - 1;
    setIndex(best);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const scrollToIndex = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const target = el.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined;
    if (!target) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({
      left: target.offsetLeft - el.offsetLeft - pad,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, [count]);

  useEffect(() => {
    if (goTo) scrollToIndex(goTo.index);
  }, [goTo, scrollToIndex]);

  const step = (dir: 1 | -1) => scrollToIndex(index + dir);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      scrollToIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      scrollToIndex(count - 1);
    }
  };

  const dark = tone === "dark";
  const arrowClass = cn(
    "grid h-11 w-11 place-items-center rounded-full border transition disabled:cursor-default disabled:opacity-30",
    dark
      ? "border-cream/30 text-cream hover:border-gold hover:text-gold-light"
      : "border-navy/20 bg-white text-navy hover:border-gold-deep hover:text-gold-deep"
  );

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
    >
      <div
        ref={trackRef}
        role="group"
        id={id}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`${label} — use left and right arrow keys to move between slides`}
        className="carousel-track -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-gold/60 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}${slideLabels?.[i] ? `: ${slideLabels[i]}` : ""}`}
            className={cn("flex shrink-0 snap-start", slideClassName)}
          >
            <div className="w-full">{slide}</div>
          </div>
        ))}
      </div>

      {overflowing && (
        <div className="mt-5 flex items-center justify-between gap-4">
          {!hideDots ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to slide ${i + 1}${slideLabels?.[i] ? `: ${slideLabels[i]}` : ""}`}
                  aria-current={i === index ? "true" : undefined}
                  aria-controls={id}
                  className="grid h-6 min-w-6 place-items-center"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all",
                      i === index
                        ? "w-6 bg-gold"
                        : dark
                          ? "w-1.5 bg-cream/35"
                          : "w-1.5 bg-navy/20"
                    )}
                  />
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={!canPrev}
              aria-label="Previous slide"
              aria-controls={id}
              className={arrowClass}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={!canNext}
              aria-label="Next slide"
              aria-controls={id}
              className={arrowClass}
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
