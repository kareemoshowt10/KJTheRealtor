const pockets = [
  {
    tag: "The crown jewel",
    title: "Equestrian Chatsworth",
    body: "Horse-zoned foothill parcels with trail access. Scarcity pricing at its purest — verify zoning parcel by parcel, never by listing copy.",
  },
  {
    tag: "The view play",
    title: "Stoney Point Foothills",
    body: "Homes against the rock formations — character and views you can’t replicate at this price anywhere else in the Valley.",
  },
  {
    tag: "The polished option",
    title: "Indian Springs & newer builds",
    body: "Master-planned polish for move-up buyers who want newer product without leaving the northwest Valley.",
  },
  {
    tag: "The quiet flex",
    title: "Lake Manor adjacent",
    body: "Semi-rural privacy near the Nature Preserve — acreage feel without full equestrian requirements.",
  },
  {
    tag: "The commuter arbitrage",
    title: "Near the Transportation Center",
    body: "Rail-adjacent pockets trade at a noise discount. For some Metrolink commuters, that discount is the entry.",
  },
  {
    tag: "The foundation",
    title: "South Chatsworth",
    body: "Established single-family streets — the steady backbone. Cleanest first-home and long-hold profile in the zip.",
  },
];

export function ChatsworthPockets() {
  return (
    <section id="pockets" className="bg-navy py-16 text-cream md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            The analytics
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight">
            How to read the 91311 market{" "}
            <em className="font-normal italic text-gold-light">like a local.</em>
          </h2>
          <p className="mt-4 text-cream/75">
            Chatsworth isn’t one market — it’s six pockets that price and
            appreciate differently. Structure doesn’t go stale. This week’s comps
            do — ask me for those.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pockets.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl border border-gold/25 bg-cream/[0.03] p-5 transition hover:border-gold/55 hover:bg-cream/[0.06]"
            >
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-gold-light">
                {p.tag}
              </p>
              <h3 className="mt-2 font-display text-xl text-cream">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{p.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#connect"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-gold px-6 text-sm font-semibold text-navy hover:bg-gold-light"
          >
            Get this week’s numbers
          </a>
          <a
            href="https://kareemjamaltherealtor.com/91311/home-value"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-cream/40 px-6 text-sm font-semibold text-cream hover:border-gold hover:text-gold-light"
          >
            Already own here? Snapshot
          </a>
        </div>
      </div>
    </section>
  );
}
