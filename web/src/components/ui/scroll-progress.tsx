"use client";

import { useEffect, useState } from "react";

/** Top-edge scroll progress — 21st.dev scroll-area polish. */
export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setP(max > 0 ? doc.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-light"
      style={{ transform: `scaleX(${p})` }}
      aria-hidden
    />
  );
}
