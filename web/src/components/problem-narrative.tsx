"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

/**
 * Villain → who it hits → the turn.
 *
 * The villain is the transaction-first system, never a person or group:
 * portal algorithms guessing at equity, incentives that pay on closing
 * rather than on good decisions, and answers gatekept behind signup walls.
 * The visitor is the protagonist of this story — pressured by that system,
 * not pitied. Keep every line something Kareem could defend to a client's
 * face, and keep DRE/fair-housing rails on: life situations only, no
 * demographic targeting, no guarantees.
 */

const VILLAIN_MARKS = [
  {
    title: "Your equity gets guessed at.",
    body: "A national algorithm prices the largest asset your family owns without ever seeing the street. The number looks official. It's a guess with a confident font.",
  },
  {
    title: "The incentives pay on the close.",
    body: "Most of this industry earns nothing for telling you to wait, refinance, or keep the house. So guess which advice is rare — even when it's right.",
  },
  {
    title: "The real answers sit behind gates.",
    body: "What's it actually worth? What would it rent for? What does Prop 19 do to the kids' tax bill? Basic questions — locked behind “enter your email to find out.”",
  },
];

const AFFECTED = [
  {
    who: "Longtime owners",
    cost: "deciding hold-vs-sell on a portal number, with decades of equity riding on a guess.",
  },
  {
    who: "Families inheriting a home",
    cost: "learning after the fact what the 2021 Prop 19 changes did to the property-tax bill.",
  },
  {
    who: "Adult children coordinating for parents",
    cost: "trying to referee a family decision with no neutral numbers on the table.",
  },
  {
    who: "Anyone who just wants a straight answer",
    cost: "trading their phone number for it, then dodging the drip campaign for months.",
  },
];

export function ProblemNarrative() {
  return (
    <section id="the-problem" className="bg-navy py-16 text-cream md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {/* Beat 1 — the villain, named */}
        <Reveal className="max-w-3xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            The problem
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3.2rem)] font-medium leading-tight">
            Real estate is built to close transactions.{" "}
            <em className="font-normal italic text-gold-light">
              Not to help your family decide.
            </em>
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {VILLAIN_MARKS.map((mark) => (
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

        {/* Beat 2 — who pays for it */}
        <div className="mt-16 grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <Reveal>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Who it lands on
            </p>
            <h3 className="mt-3 font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-medium leading-tight">
              The families in the middle of a real decision.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              Not speculators. Not flippers. The San Fernando Valley and Simi
              Valley families holding a home that carries both their equity and
              their story — trying to make one good decision with bad inputs.
            </p>
          </Reveal>
          <Stagger className="grid gap-3">
            {AFFECTED.map((row) => (
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

        {/* Beat 3 — the turn: what Kareem does about it */}
        <Reveal className="mt-16 rounded-2xl border border-gold/30 bg-paper p-7 text-navy md:p-10">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            What I do instead
          </p>
          <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-tight">
                I explain the decision.{" "}
                <em className="font-normal italic text-gold-deep">
                  The transaction is optional.
                </em>
              </h3>
              <ul className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-slateink">
                <li>
                  <strong className="font-semibold text-navy">Real numbers, shown free.</strong>{" "}
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
                  Reach out and you get me, once, on your channel — not a drip
                  campaign. If waiting is your best move, that&apos;s the advice.
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
                Or ask me the hard questions first
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
