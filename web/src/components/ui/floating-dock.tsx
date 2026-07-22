"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  formId?: string;
  formLabel?: string;
};

/**
 * Early-scroll chrome only. Mid-page ConversionSticky owns the primary CTA.
 * Mobile: one gold Talk + Call. Desktop: Call · Text · Talk.
 */
export function FloatingDock({
  formId = "start",
  formLabel = "Talk",
}: Props) {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(true);

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

      // Hide once sticky convert owns mid-scroll, or form is visible
      const stickyOwns = scrollPct > 0.22 && scrollPct < 0.96 && !formInView;
      setShow(!stickyOwns && !formInView && scrollPct < 0.22);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [formId]);

  if (!show) return null;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.9, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gold/40 bg-navy/95 p-1.5 text-cream shadow-2xl backdrop-blur-md md:bottom-8"
    >
      <a
        href="tel:+18184027326"
        className="flex min-h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10 active:scale-95 sm:w-auto sm:gap-2 sm:px-4"
        aria-label="Call Kareem"
      >
        <Phone size={16} className="text-gold" />
        <span className="hidden sm:inline text-sm font-semibold">Call</span>
      </a>
      <a
        href="sms:+18184027326"
        className="hidden min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition hover:bg-white/10 active:scale-95 sm:flex"
        aria-label="Text Kareem"
      >
        <MessageCircle size={16} className="text-gold" />
        Text
      </a>
      <a
        href={`#${formId}`}
        className="relative flex min-h-11 items-center gap-2 overflow-hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-light active:scale-95"
      >
        {!reduced && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-gold-light/35"
            animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className="relative z-[1]">{formLabel}</span>
      </a>
    </motion.div>
  );
}
