"use client";

import { Phone, MessageCircle, Calculator } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Floating action dock — entrance + soft pulse on primary CTA.
 */
export function FloatingDock() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gold/40 bg-navy/95 p-1.5 text-cream shadow-2xl backdrop-blur-md md:bottom-8"
    >
      <a
        href="tel:+18184027326"
        className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 active:scale-95"
        aria-label="Call Kareem"
      >
        <Phone size={16} className="text-gold" />
        <span className="hidden sm:inline">Call</span>
      </a>
      <a
        href="sms:+18184027326"
        className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 active:scale-95"
        aria-label="Text Kareem"
      >
        <MessageCircle size={16} className="text-gold" />
        <span className="hidden sm:inline">Text</span>
      </a>
      <a
        href="https://kareemjamaltherealtor.com/91311/home-value"
        className="relative flex min-h-11 items-center gap-2 overflow-hidden rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-light active:scale-95"
      >
        {!reduced && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-gold-light/40"
            animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.12, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <Calculator size={16} className="relative z-[1]" />
        <span className="relative z-[1]">Equity Snapshot</span>
      </a>
    </motion.div>
  );
}
