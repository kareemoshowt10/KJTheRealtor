"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

type Props = {
  formId?: string;
  ctaLabel?: string;
  hint?: string;
};

/**
 * Mid-scroll primary conversion surface.
 * Mobile hierarchy: Call (icon) + one gold Talk CTA. No competing third action.
 */
export function ConversionSticky({
  formId = "start",
  ctaLabel = "Tell me what's going on",
  hint = "One personal reply · no drip · usually same day",
}: Props) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById(formId);

    const update = () => {
      const scrollPct =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      let formInView = false;
      if (form) {
        const r = form.getBoundingClientRect();
        formInView = r.top < window.innerHeight * 0.72 && r.bottom > 80;
      }

      // Appear earlier (22%) so mobile always has a clear path after hero
      setVisible(scrollPct > 0.22 && scrollPct < 0.96 && !formInView);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [formId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:px-4"
        >
          <div className="pointer-events-auto flex w-full max-w-lg items-center gap-2 rounded-2xl border border-gold/45 bg-navy/95 p-2 shadow-[0_16px_48px_-12px_rgba(5,12,28,0.65)] backdrop-blur-md sm:p-2.5">
            <a
              href="tel:+18184027326"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cream/15 bg-white/5 text-gold transition hover:bg-white/10 active:scale-95"
              aria-label="Call Kareem at 818-402-7326"
            >
              <Phone size={18} />
            </a>

            <div className="min-w-0 flex-1">
              <a
                href={`#${formId}`}
                className="group relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gold px-4 text-sm font-semibold text-navy shadow-[0_8px_24px_-8px_rgba(201,168,76,0.7)] transition hover:bg-gold-light active:scale-[0.98]"
              >
                {!reduced && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                    initial={{ x: "-120%" }}
                    animate={{ x: "220%" }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      repeatDelay: 2.2,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <span className="relative z-[1] truncate">{ctaLabel}</span>
                <ArrowRight
                  size={16}
                  className="relative z-[1] shrink-0 transition group-hover:translate-x-0.5"
                />
              </a>
              <p className="mt-1 hidden text-center text-[0.65rem] text-cream/55 sm:block">
                {hint}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
