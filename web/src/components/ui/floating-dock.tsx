"use client";

import { Phone, MessageCircle, Calculator } from "lucide-react";

/**
 * Mobile/desktop floating action dock — 21st.dev dock-inspired.
 */
export function FloatingDock() {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gold/40 bg-navy/95 p-1.5 text-cream shadow-2xl backdrop-blur-md md:bottom-8">
      <a
        href="tel:+18184027326"
        className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
        aria-label="Call Kareem"
      >
        <Phone size={16} className="text-gold" />
        <span className="hidden sm:inline">Call</span>
      </a>
      <a
        href="sms:+18184027326"
        className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
        aria-label="Text Kareem"
      >
        <MessageCircle size={16} className="text-gold" />
        <span className="hidden sm:inline">Text</span>
      </a>
      <a
        href="https://kareemjamaltherealtor.com/91311/home-value"
        className="flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
      >
        <Calculator size={16} />
        <span>Equity Snapshot</span>
      </a>
    </div>
  );
}
