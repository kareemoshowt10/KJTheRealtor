const cards = [
  {
    tag: "The land is the asset",
    title: "Your lot probably supports a second unit",
    body: "Chatsworth’s big-lot, horse-zoned parcels are exactly the terrain California’s ADU rules were written for. The back half of a 91311 lot is often an unbuilt asset.",
    href: "https://kareemjamaltherealtor.com/house-hacking",
    link: "ADU math →",
  },
  {
    tag: "The tax trap",
    title: "A decades-held home needs a Prop 19 plan",
    body: "The longer your family has held here, the wider the gap between Prop 13 and market value. Plan the handoff before the assessor’s letter arrives.",
    href: "https://kareemjamaltherealtor.com/family-wealth-preservation",
    link: "Start here →",
  },
  {
    tag: "Keep it in the family",
    title: "The ranch deserves a living trust",
    body: "Probate splits estates bluntly — which is how horse property gets sold to divide proceeds. A trust is how land actually stays in the family.",
    href: "https://kareemjamaltherealtor.com/living-trust-guide",
    link: "Why I recommend one →",
  },
  {
    tag: "The third option",
    title: "Moving up? Maybe don’t sell this one",
    body: "Land-rich pockets are where keep-the-first-home-as-a-rental math genuinely works. I’ll run both versions — including where selling wins.",
    href: "#connect",
    link: "Ask me to run the numbers →",
  },
];

export function ChatsworthOwners() {
  return (
    <section id="owners" className="bg-cream py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Already own here?
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium text-navy">
            The 91311 owner&apos;s{" "}
            <em className="font-normal italic text-gold-deep">playbook.</em>
          </h2>
          <p className="mt-4 text-slateink">
            Most of what&apos;s written about Chatsworth is for people trying to get
            in. These moves are for families who already hold the land.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <article
              key={c.title}
              className="rounded-2xl border border-[#e3d8c7] bg-white p-6 shadow-sm transition hover:border-gold/60"
            >
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.14em] text-gold-deep">
                {c.tag}
              </p>
              <h3 className="mt-2 font-display text-xl text-navy">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slateink">{c.body}</p>
              <a
                href={c.href}
                className="mt-4 inline-block text-sm font-semibold text-gold-deep hover:underline"
              >
                {c.link}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
