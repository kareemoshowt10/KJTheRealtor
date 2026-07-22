const items = [
  {
    k: "1861",
    v: "First overland mail stage crossed the Santa Susana Pass — Chatsworth was LA’s front door before Hollywood existed.",
  },
  {
    k: "2,000+",
    v: "Films and TV episodes shot on the Iverson Movie Ranch — the most-filmed movie ranch in motion-picture history.",
  },
  {
    k: "1904",
    v: "Rail tunnel through the pass opened — the same corridor that makes Chatsworth a two-rail commuter town today.",
  },
  {
    k: "K",
    v: "Horse-keeping zoning — scarce, grandfathered, and Los Angeles isn’t making more of it. Verify parcel by parcel.",
  },
];

export function ChatsworthLedger() {
  return (
    <section className="border-b border-[#e3d8c7] bg-cream py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        {items.map((item) => (
          <div key={item.k} className="border-l-2 border-gold pl-4">
            <p className="font-display text-3xl font-medium tabular-nums text-navy md:text-4xl">
              {item.k}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slateink">{item.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
