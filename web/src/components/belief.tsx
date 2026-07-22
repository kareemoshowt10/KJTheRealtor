"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";

export function Belief() {
  return (
    <section className="bg-paper py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2 md:px-8">
        <Reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
          <Image
            src="/assets/kareem-with-seniors-kitchen.jpg"
            alt="Kareem Jamal at a kitchen table with longtime homeowners"
            fill
            className="object-cover object-[center_40%] transition duration-700 hover:scale-105"
            sizes="(max-width:768px) 100vw, 50vw"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            How families experience me
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3.2rem)] font-medium leading-tight text-navy">
            The patience of family.{" "}
            <em className="font-normal italic text-gold-deep">
              The skill of a strategist.
            </em>
          </h2>
          <p className="mt-5 leading-relaxed text-slateink">
            The clients who hire me most often want someone they can trust like
            family — patient enough to sit at the kitchen table, sharp enough to
            protect a lifetime of equity. Grandparents, parents, and the adult
            children helping them decide. I treat that trust like inheritance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="https://kareemjamaltherealtor.com/seller-presentation"
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-sm font-semibold text-cream hover:bg-navy-mist"
            >
              Seller strategy
            </a>
            <a
              href="#start"
              className="inline-flex min-h-11 items-center rounded-md border border-navy/30 px-5 text-sm font-semibold text-navy hover:bg-navy hover:text-cream"
            >
              Tell me about your family&apos;s home
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
