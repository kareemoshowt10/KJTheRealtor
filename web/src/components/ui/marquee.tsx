"use client";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
  speed?: "slow" | "normal" | "fast";
  reverse?: boolean;
};

/**
 * Infinite horizontal marquee — 21st.dev "Marquee" pattern.
 */
export function Marquee({
  items,
  className,
  speed = "normal",
  reverse = false,
}: MarqueeProps) {
  const duration =
    speed === "slow" ? "50s" : speed === "fast" ? "22s" : "35s";
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-gold/20 bg-navy text-cream",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-navy to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-navy to-transparent md:w-28" />
      <div
        className={cn(
          "flex w-max gap-10 py-4 will-change-transform",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
        style={{ animationDuration: duration }}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-10 text-sm font-semibold uppercase tracking-[0.16em] text-cream/80"
          >
            <span className="text-gold">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
