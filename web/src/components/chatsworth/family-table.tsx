const paths = [
  {
    kicker: "Prop 19 · inheritance",
    title: "Will the low tax bill survive the handoff?",
    body: "Decades in 91311 can mean a huge gap between Prop 13 and market value. Prop 19 only protects that base if the next generation structures it correctly — plain English, no scare tactics.",
    href: "https://kareemjamaltherealtor.com/family-wealth-preservation",
    cta: "Family wealth guide →",
  },
  {
    kicker: "Hold vs sell",
    title: "Should we list — or keep this Chatsworth lot working?",
    body: "Big lots, ADU potential, horse facilities, RV demand — keep-as-rental math is often real here. I run sell and hold before anyone puts a sign on the street.",
    href: "https://kareemjamaltherealtor.com/seller-presentation",
    cta: "Seller strategy session →",
  },
  {
    kicker: "Equity Snapshot",
    title: "What is this 91311 home actually worth — carefully?",
    body: "Pocket-level read for Chatsworth owners: value range, zoning flags, and a clear next step. One personal reply. No drip campaign. I’ll say “do nothing yet” when that’s smartest.",
    href: "https://kareemjamaltherealtor.com/91311/home-value",
    cta: "Request a free snapshot →",
  },
];

export function ChatsworthFamilyTable() {
  return (
    <section
      id="family-table"
      className="border-y border-[#e3d8c7] bg-gradient-to-b from-paper to-[#F3EDE3] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            For parents &amp; the kids helping them · 91311
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium tracking-tight text-navy">
            Three kitchen-table decisions.{" "}
            <em className="font-normal italic text-gold-deep">No pressure.</em>
          </h2>
          <p className="mt-4 text-slateink">
            Long-held Chatsworth homes are often more than a listing — they&apos;re
            the family&apos;s main asset. Start with the decision that matches where
            you are.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {paths.map((p) => (
            <a
              key={p.href}
              href={p.href}
              className="group flex min-h-full flex-col gap-3 rounded-2xl border border-[#e3d8c7] bg-white p-6 shadow-gold transition hover:-translate-y-0.5 hover:border-gold/70"
            >
              <span className="text-[0.64rem] font-bold uppercase tracking-[0.12em] text-gold-deep">
                {p.kicker}
              </span>
              <h3 className="font-display text-xl font-medium leading-snug text-navy">
                {p.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-slateink">
                {p.body}
              </p>
              <span className="text-xs font-bold uppercase tracking-wide text-navy group-hover:text-gold-deep">
                {p.cta}
              </span>
            </a>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slateink">
          Adult children helping a parent in Chatsworth:{" "}
          <a href="#connect" className="font-semibold text-gold-deep hover:underline">
            tell me the situation
          </a>{" "}
          or call{" "}
          <a href="tel:+18184027326" className="font-semibold text-gold-deep">
            (818) 402-7326
          </a>
          . Living trusts:{" "}
          <a
            href="https://kareemjamaltherealtor.com/living-trust-guide"
            className="font-semibold text-gold-deep hover:underline"
          >
            read the guide
          </a>
          .
        </p>
      </div>
    </section>
  );
}
