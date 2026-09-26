"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

const DECISION_PILLARS = [
  {
    title: "Know what the numbers mean.",
    body: "Put nearby sales, likely costs, and your goals in the same picture. An online estimate can be a starting point, but it isn't the whole story.",
  },
  {
    title: "See more than one path.",
    body: "A sale may make sense. So might waiting, renting, or keeping a home in the family. Compare the trade-offs before choosing a direction.",
  },
  {
    title: "Decide at your pace.",
    body: "Start with the guides and tools here, then ask a question when you're ready. No email is required to explore the basics.",
  },
];

const STARTING_POINTS = [
  {
    who: "Longtime owners",
    cost: "compare the value of selling with the possibilities of staying or renting.",
  },
  {
    who: "Families inheriting a home",
    cost: "bring the property, tax, and family questions into one thoughtful plan.",
  },
  {
    who: "Adult children coordinating for parents",
    cost: "give everyone a clearer picture of the options and their costs.",
  },
  {
    who: "Buyers finding their footing",
    cost: "learn the process and the numbers before taking the next step.",
  },
];

export function ProblemNarrative() {
  return (
    <section id="the-problem" className="bg-navy py-16 text-cream md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            A better place to begin
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3.2rem)] font-medium leading-tight">
            The best move begins with a clear view.{" "}
            <em className="font-normal italic text-gold-light">
              Then it becomes your decision.
            </em>
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {DECISION_PILLARS.map((mark) => (
            <StaggerItem
              key={mark.title}
              className="rounded-xl border border-cream/10 bg-navy-mist/60 p-6"
            >
              <h3 className="font-display text-lg font-medium text-cream">
                {mark.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-cream/70">
                {mark.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-16 grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <Reveal>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Every path is personal
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-medium leading-tight">
              A plan for the home and the people around it.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              In the San Fernando Valley and Simi Valley, a home can carry a
              family&apos;s history as well as its equity. Start with what matters
              to you, then work through the practical questions together.
            </p>
          </Reveal>
          <Stagger className="grid gap-3">
            {STARTING_POINTS.map((row) => (
              <StaggerItem
                key={row.who}
                className="flex gap-4 rounded-lg border border-cream/10 bg-navy-mist/40 px-5 py-4"
              >
                <span className="mt-[0.42rem] h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                <p className="text-sm leading-relaxed text-cream/80">
                  <strong className="font-semibold text-cream">{row.who}</strong>{" "}
                  — {row.cost}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal className="mt-16 rounded-2xl border border-gold/30 bg-paper p-7 text-navy md:p-10">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            How we work together
          </p>
          <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-tight">
                Clarity first.{" "}
                <em className="font-normal italic text-gold-deep">
                  Your next step follows.
                </em>
              </h3>
              <ul className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-slateink">
                <li>
                  <strong className="font-semibold text-navy">Useful numbers, shown free.</strong>{" "}
                  An equity range from actual nearby sales, rent comps, and the
                  Prop 19 math laid out — no email gate in front of any of it.
                </li>
                <li>
                  <strong className="font-semibold text-navy">Both columns, every time.</strong>{" "}
                  Every option comes with its honest cost attached: the ADU with
                  its permit friction, the rental with its landlord reality, the
                  sale with its taxes.
                </li>
                <li>
                  <strong className="font-semibold text-navy">One personal reply.</strong>{" "}
                  Reach out and you get me, once, on your channel. If waiting
                  fits your goals, we can talk about that too.
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="#equity-snapshot"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-navy px-6 text-sm font-semibold text-cream transition hover:bg-navy-mist"
              >
                Start with your home&apos;s real range
              </a>
              <a
                href="#ask-kareem"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-navy/25 px-6 text-sm font-semibold text-navy transition hover:bg-navy hover:text-cream"
              >
                Or ask Kareem a question
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
