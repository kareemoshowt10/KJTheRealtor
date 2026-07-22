import Image from "next/image";

const zips = [
  {
    num: "01",
    code: "91311 · Chatsworth",
    title: "Where I'm from",
    body: "Price history, horse zoning honesty, and what I'd tell a friend buying here today.",
    href: "https://kareemjamaltherealtor.com/91311",
    img: "/assets/cliffside-sunset.jpg",
  },
  {
    num: "02",
    code: "93063 · East Simi Valley",
    title: "Where I chose home",
    body: "The zip I chose for my own family — same honest breakdown, no gloss.",
    href: "https://kareemjamaltherealtor.com/93063",
    img: "/assets/zip-home-warm-porch.jpg",
  },
  {
    num: "03",
    code: "91304 · West Hills",
    title: "Where I learned to build",
    body: "Construction costs, ADU potential, and the real numbers behind a renovation.",
    href: "https://kareemjamaltherealtor.com/91304",
    img: "/assets/zip-estate-twilight.jpg",
  },
];

export function ZipCards() {
  return (
    <section id="zips" className="bg-gradient-to-b from-paper to-[#F7F1E7] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Start here
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium text-navy">
            Three zip codes.{" "}
            <em className="font-normal italic text-gold-deep">One real story.</em>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {zips.map((z) => (
            <a
              key={z.href}
              href={z.href}
              className="group overflow-hidden rounded-2xl bg-navy text-cream shadow-lg transition hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={z.img}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
                <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-gold/45 bg-navy/70 font-display text-sm text-gold-light backdrop-blur">
                  {z.num}
                </span>
              </div>
              <div className="space-y-2 p-5">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gold">
                  {z.code}
                </p>
                <h3 className="font-display text-xl text-cream">{z.title}</h3>
                <p className="text-sm leading-relaxed text-cream/70">{z.body}</p>
                <p className="pt-2 text-xs font-bold uppercase tracking-wide text-gold-light">
                  Open free →
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
