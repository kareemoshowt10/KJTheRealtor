"use client";

import AnimatedTextCycle from "@/components/ui/animated-text-cycle";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden text-cream">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(5,12,28,0.9) 0%, rgba(5,15,32,0.55) 48%, rgba(5,15,32,0.28) 100%), url('/assets/home-is-personal-poster.jpg')",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-gold" />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            Kareem Jamal · Rodeo Realty Fine Estates
          </span>
        </div>

        <h1 className="max-w-3xl font-display text-[clamp(2.5rem,6.2vw,4.85rem)] font-medium leading-[1.02] tracking-[-0.035em]">
          Homeownership,{" "}
          <span className="block text-gold-light">
            <AnimatedTextCycle
              words={["explained.", "protected.", "planned.", "handed down."]}
              interval={3200}
              className="text-gold-light"
            />
          </span>
        </h1>

        <div className="mt-5 flex flex-wrap gap-2">
          {["Not sold", "Not gatekept", "Not rushed"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-gold/40 bg-navy/40 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-gold-light backdrop-blur"
            >
              {t}
            </span>
          ))}
        </div>

        <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-cream/88">
          You don&apos;t need a sales pitch. You need the real numbers and the
          honest trade-offs — kitchen-table patience for parents, adult children,
          and long-held homes. One personal reply. No drip campaign.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="https://kareemjamaltherealtor.com/buyer-presentation"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-gold px-6 text-sm font-semibold text-navy transition hover:bg-gold-light"
          >
            Buyer Strategy Session
          </a>
          <a
            href="https://kareemjamaltherealtor.com/91311/home-value"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-cream/45 px-6 text-sm font-semibold text-cream transition hover:border-gold hover:text-gold-light"
          >
            Equity Snapshot
          </a>
          <a
            href="#family-table"
            className="text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
          >
            For parents &amp; kids helping them →
          </a>
        </div>

        <p className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cream/55">
          Southern California · Rodeo Realty Fine Estates · CA DRE #01998956
        </p>
      </div>
    </section>
  );
}
