const eras = [
  {
    era: "1861",
    title: "Blindfolded horses on the Devil’s Slide",
    body: "The first overland mail stage rolled through the pass. The wagon ruts are still cut into Santa Susana Pass State Historic Park. You can stand in them.",
  },
  {
    era: "1888",
    title: "A frontier town with an aristocrat’s name",
    body: "Homesteaders founded the town and borrowed its name from Chatsworth House in England. The Hill-Palmer cottage still stands at Homestead Acre.",
  },
  {
    era: "1912–1960s",
    title: "Hollywood’s favorite backlot",
    body: "Roughly 2,000 productions shot among the Garden of the Gods. When you hike at golden hour, you’re standing inside more movies than any studio lot.",
  },
  {
    era: "Today",
    title: "The last horse town inside the city",
    body: "Horse-keeping zoning, real acreage, trails, and two rail lines. Not a museum — a working neighborhood holding what the rest of LA zoned away.",
  },
];

export function ChatsworthStory() {
  return (
    <section id="story" className="bg-paper py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[0.85fr_1.15fr] md:px-8">
        <div className="md:sticky md:top-24 md:self-start">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            The long story
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight text-navy">
            A thousand years before the first{" "}
            <em className="font-normal italic text-gold-deep">for-sale sign.</em>
          </h2>
          <p className="mt-5 border-l-2 border-gold pl-5 font-display text-xl italic leading-snug text-navy md:text-2xl">
            Every era left something you can still{" "}
            <strong className="font-medium not-italic text-gold-deep">
              walk on, ride past, or own.
            </strong>
          </p>
          <p className="mt-6 text-sm leading-relaxed text-slateink">
            Most agents will tell you what a neighborhood costs. Almost none can
            tell you what it <em>is</em>. Chatsworth earned its character the long
            way — and if you understand how, you understand why it holds value.
          </p>
        </div>
        <ol className="relative space-y-8 border-l border-gold/40 pl-6">
          {eras.map((e) => (
            <li key={e.era} className="relative">
              <span className="absolute -left-[1.9rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-gold-deep bg-paper" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                {e.era}
              </p>
              <h3 className="mt-1 font-display text-xl font-medium text-navy">
                {e.title}
              </h3>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-slateink">
                {e.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
