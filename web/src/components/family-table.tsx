import Link from "next/link";

const paths = [
  {
    kicker: "Prop 19 · inheritance",
    title: "Will the low tax bill survive the handoff?",
    body: "Long-held homes can face a brutal reassessment if the next generation doesn’t structure Prop 19 correctly. Plain English on what keeps the base — and what loses it.",
    href: "https://kareemjamaltherealtor.com/family-wealth-preservation",
    cta: "Family wealth guide →",
  },
  {
    kicker: "Hold vs sell",
    title: "Should we list — or keep this as the family asset?",
    body: "Sometimes selling funds the next chapter. Sometimes renting or adding a unit protects more wealth. I run both versions before anyone puts a sign in the yard.",
    href: "https://kareemjamaltherealtor.com/seller-presentation",
    cta: "Seller strategy session →",
  },
  {
    kicker: "Equity Snapshot",
    title: "What is this home actually worth — carefully?",
    body: "Not a portal guess. A pocket-level read for Chatsworth and nearby long-held homes — value range, owner flags, and a clear next step.",
    href: "https://kareemjamaltherealtor.com/91311/home-value",
    cta: "Request a free snapshot →",
  },
];

export function FamilyTable() {
  return (
    <section
      id="family-table"
      className="border-y border-[#e3d8c7] bg-gradient-to-b from-paper to-[#F3EDE3] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            For parents &amp; the kids helping them
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium tracking-tight text-navy">
            Three kitchen-table decisions.{" "}
            <em className="font-normal italic text-gold-deep">No pressure.</em>
          </h2>
          <p className="mt-4 text-slateink">
            Most families don&apos;t need another listing pitch. They need someone
            patient enough to sit with sell, keep, and transfer — and honest
            enough to say when waiting is smarter.
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
          Adult children: start here or{" "}
          <Link href="#start" className="font-semibold text-gold-deep underline-offset-2 hover:underline">
            tell me the situation
          </Link>{" "}
          — call or text{" "}
          <a href="tel:+18184027326" className="font-semibold text-gold-deep">
            (818) 402-7326
          </a>
          .
        </p>
      </div>
    </section>
  );
}
