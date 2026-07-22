"use client";

import Script from "next/script";
import { createElement, useState } from "react";
import { cn } from "@/lib/utils";

const HVS_SCRIPT =
  "https://cdn.jsdelivr.net/npm/@percy.ai/hvs-autocomplete@latest/dist/umd/index.bundled.min.js";

const HVS_API_KEY = "1524493427152846";
const HVS_USERNAME = "kjamal@rodeore.com";

type Props = {
  className?: string;
  /** Compact = tighter padding for hero embed */
  compact?: boolean;
  heading?: string;
  subheading?: string;
  id?: string;
};

/**
 * Percy.ai Home Value Snapshot address autocomplete.
 * Script loads once; web component renders after load.
 */
export function HvsWidget({
  className,
  compact = false,
  heading = "What's your home worth?",
  subheading = "Enter your address for a free Equity Snapshot — honest range, not a portal guess.",
  id = "equity-snapshot",
}: Props) {
  const [ready, setReady] = useState(false);

  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl border border-gold/50 bg-paper text-navy shadow-[0_20px_50px_-16px_rgba(5,12,28,0.45)]",
        compact ? "p-4 md:p-5" : "p-5 md:p-6",
        className
      )}
    >
      <Script
        src={HVS_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
        onReady={() => setReady(true)}
      />

      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
        Free Equity Snapshot
      </p>
      <h2
        className={cn(
          "mt-1.5 font-display font-medium leading-tight text-navy",
          compact ? "text-xl md:text-2xl" : "text-2xl md:text-[1.65rem]"
        )}
      >
        {heading}
      </h2>
      {subheading && (
        <p className="mt-1.5 text-sm leading-relaxed text-slateink">
          {subheading}
        </p>
      )}

      <div
        className={cn(
          "mt-4 min-h-[52px]",
          !ready && "rounded-xl border border-dashed border-gold/35 bg-cream/80"
        )}
      >
        {!ready && (
          <p className="px-3 py-3.5 text-sm text-slateink/70">
            Loading address search…
          </p>
        )}
        {/* Percy HVS web component — attributes match vendor embed */}
        {createElement("hvs-widget", {
          apikey: HVS_API_KEY,
          placeholder: "Enter your Address",
          "no-result-message": "No Results",
          username: HVS_USERNAME,
          "new-window": "true",
          style: {
            display: ready ? "block" : "none",
            width: "100%",
          },
        })}
      </div>

      <p className="mt-3 text-[0.68rem] leading-relaxed text-slateink/65">
        Opens in a new window · Kareem Jamal · Rodeo Realty · CA DRE #01998956 ·
        Educational estimate only — not an appraisal.
      </p>
    </div>
  );
}

/** Site-wide script preload helper if widget appears on multiple pages without the card. */
export function HvsScript() {
  return <Script src={HVS_SCRIPT} strategy="afterInteractive" />;
}
