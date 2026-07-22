"use client";

import { cn } from "@/lib/utils";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "gold" | "outline";
};

/**
 * High-attention CTA with shimmer sweep — hooks without needing hover on mobile
 * (shimmer loops gently; stronger on hover for pointer devices).
 */
export function ShimmerButton({
  className,
  variant = "gold",
  children,
  ...props
}: Props) {
  return (
    <a
      {...props}
      className={cn(
        "group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-md px-6 text-sm font-semibold transition active:scale-[0.98]",
        variant === "gold" &&
          "bg-gold text-navy shadow-[0_8px_28px_-8px_rgba(201,168,76,0.65)] hover:bg-gold-light",
        variant === "outline" &&
          "border border-cream/45 text-cream hover:border-gold hover:text-gold-light",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70",
          "animate-shimmer group-hover:via-white/50"
        )}
        aria-hidden
      />
      <span className="relative z-[1]">{children}</span>
    </a>
  );
}
