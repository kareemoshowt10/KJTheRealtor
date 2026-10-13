"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Carousel } from "@/components/ui/carousel";

const eras = [
  {
    era: "First peoples",
    year: "Before maps",
    title: "The pass before the pavement",
    body: "Village and trade sites lined the Santa Susana corridor — the natural gateway between the San Fernando and Simi valleys. The sandstone that makes Chatsworth famous made it habitable then: shelter, water pockets, and lookouts over the Valley floor.",
    kicker: "Place",
  },
  {
    era: "1861",
    year: "1861",
    title: "Blindfolded horses on the Devil’s Slide",
    body: "The first overland mail stage rolled through the pass. The descent was so steep they called it the Devil’s Slide. The wagon ruts are still cut into Santa Susana Pass State Historic Park. You can stand in them.",
    kicker: "Route",
  },
  {
    era: "1888",
    year: "1888",
    title: "A frontier town with an aristocrat’s name",
    body: "Homesteaders founded the town and borrowed its name from Chatsworth House in England. The Hill-Palmer cottage still stands at Homestead Acre — a one-room bridge from covered wagons to tract homes.",
    kicker: "Town",
  },
  {
    era: "1904",
    year: "1904",
    title: "The railroad conquers the pass",
    body: "When the line opened, Chatsworth became a real stop on the coast route. That same corridor is why you can board Metrolink or Amtrak here this morning — infrastructure this old doesn’t move, and neither does the value it anchors.",
    kicker: "Rail",
  },
  {
    era: "1912–60s",
    year: "Film era",
    title: "Hollywood’s favorite backlot",
    body: "Roughly 2,000 productions shot among the Garden of the Gods. When you hike at golden hour, you’re standing inside more movies than any studio lot on Earth.",
    kicker: "Screen",
  },
  {
    era: "Today",
    year: "Now",
    title: "The last horse town inside the city",
    body: "Horse-keeping zoning, real acreage, trails, and two rail lines. Not a museum — a working neighborhood holding what the rest of LA zoned away. That scarcity is the investment thesis.",
    kicker: "Scarcity",
  },
];

/**
 * Chatsworth origin story — six eras as a swipeable carousel.
 * The era list on desktop doubles as navigation; all text stays in the DOM.
 */
export function ChatsworthStory() {
  const [active, setActive] = useState(0);
  const [goTo, setGoTo] = useState<{ index: number; key: number }>();

  return (
    <section id="story" className="relative bg-paper py-14 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-8">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            The long story
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.85rem,4.5vw,3rem)] font-medium leading-tight text-navy">
            A thousand years before the first{" "}
            <em className="font-normal italic text-gold-deep">for-sale sign.</em>
          </h2>
          <p className="mt-5 border-l-2 border-gold pl-4 font-display text-lg italic leading-snug text-navy md:text-xl">
            Every era left something you can still{" "}
            <strong className="font-medium not-italic text-gold-deep">
              walk on, ride past, or own.
            </strong>
          </p>
          <p className="mt-5 text-sm leading-relaxed text-slateink md:text-[0.95rem]">
            Most agents will tell you what a neighborhood costs. Almost none can
            tell you what it <em>is</em>. Swipe through the eras — Chatsworth
            earned its character the long way.
          </p>

          <ol className="mt-8 hidden space-y-1.5 md:block" aria-label="Eras">
            {eras.map((e, i) => (
              <li key={e.era}>
                <button
                  type="button"
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => setGoTo({ index: i, key: Date.now() })}
                  className={cn(
                    "flex w-full min-h-10 items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition",
                    i === active
                      ? "bg-gold/15 font-semibold text-navy"
                      : "text-slateink hover:bg-navy/5"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      i === active ? "bg-gold" : "bg-navy/20"
                    )}
                  />
                  <span className="tabular-nums text-gold-deep">{e.year}</span>
                  <span className="truncate">{e.kicker}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="min-w-0 md:self-center">
          <Carousel
            label="Chatsworth through the eras"
            slideClassName="basis-[90%] md:basis-full"
            slideLabels={eras.map((e) => `${e.year}: ${e.title}`)}
            onIndexChange={setActive}
            goTo={goTo}
          >
            {eras.map((item, index) => (
              <article
                key={item.era}
                className="flex h-full w-full flex-col rounded-2xl border border-[#e3d8c7] bg-white p-5 shadow-sm md:p-7"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-[0.65rem] font-bold tabular-nums text-gold-light">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold-deep">
                    {item.kicker}
                  </span>
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {item.year}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[1.35rem] font-medium leading-snug text-navy md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-slateink md:text-base">
                  {item.body}
                </p>
              </article>
            ))}
          </Carousel>

          <p className="mt-6 text-center text-xs text-slateink/70 md:text-left">
            Scarcity is the thesis — zoning, lot size, rail, and open space the
            Valley stopped making.
          </p>
        </div>
      </div>
    </section>
  );
}
