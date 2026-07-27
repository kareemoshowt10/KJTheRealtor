"use client";

import * as React from "react";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

/** useLayoutEffect warns during SSR; fall back to useEffect on the server. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function AnimatedTextCycle({
  words,
  interval = 5000,
  className = "",
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Width is reserved for the LONGEST word and never animated. Animating width
  // forces a layout pass every frame and reflows everything below the heading
  // (the hero's Equity Snapshot card), so the box is sized once instead.
  const [reservedWidth, setReservedWidth] = useState<number | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const measure = useCallback(() => {
    const node = measureRef.current;
    if (!node) return;
    let max = 0;
    for (const child of Array.from(node.children)) {
      max = Math.max(max, child.getBoundingClientRect().width);
    }
    // Sub-pixel guard so the last glyph never clips mid-animation.
    if (max > 0) setReservedWidth(Math.ceil(max) + 2);
  }, []);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, words, className]);

  // Re-measure whenever the rendered text box can change size: webfont swap,
  // viewport resize, or a media-query font-size change. Observing the measure
  // node itself catches all three; a window resize listener misses font swaps
  // and responsive type changes that don't coincide with a resize event.
  useEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    for (const child of Array.from(node.children)) observer.observe(child);

    document.fonts?.ready.then(schedule).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure, words]);

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, words.length, reduced]);

  // Transform + opacity only — compositor work, no layout.
  const variants = {
    hidden: { y: "-0.45em", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: {
      y: "0.45em",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" as const },
    },
  };

  if (reduced) {
    return <span className={cn("font-display italic", className)}>{words[0]}</span>;
  }

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0"
        style={{ visibility: "hidden", whiteSpace: "nowrap" }}
      >
        {words.map((word, i) => (
          <span key={i} className={cn("font-display italic", className)}>
            {word}
          </span>
        ))}
      </div>

      <span
        className="relative inline-block"
        style={{ width: reservedWidth ? `${reservedWidth}px` : undefined }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={currentIndex}
            className={cn("inline-block font-display italic", className)}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ whiteSpace: "nowrap" }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}
