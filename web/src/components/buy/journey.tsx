"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, BookOpen, MessageCircleQuestion } from "lucide-react";
import { buyerJourney } from "@/lib/buyer-journey";
import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const num = (n: number) => String(n + 1).padStart(2, "0");

/**
 * The 10 steps as a one-up carousel. Every step's text is rendered in the
 * DOM (previously only the selected step was), and the numbered chips act as
 * the carousel's labelled "dots".
 */
export function Journey() {
  const [active, setActive] = useState(0);
  const [goTo, setGoTo] = useState<{ index: number; key: number }>();
  const total = buyerJourney.length;

  return (
    <section id="journey" className="scroll-mt-20 bg-[#f2ecdf] px-5 py-16 md:py-20 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">The whole process, both sides</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
          Ten steps. What you live through — and what I&apos;m doing behind the scenes.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-slateink">
          Swipe or tap through. Every buyer is somewhere on this list. Find your step, then tell me
          where you are.
        </p>

        <nav aria-label="Jump to a buying step" className="-mx-5 mt-8 overflow-x-auto px-5 md:mx-0 md:px-0 lg:mt-6">
          <ol className="flex min-w-max gap-2 md:grid md:min-w-0 md:grid-cols-5 lg:grid-cols-10">
            {buyerJourney.map((s, idx) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setGoTo({ index: idx, key: Date.now() })}
                  aria-current={idx === active ? "step" : undefined}
                  className={cn(
                    "flex h-full w-full flex-col items-start rounded-lg border px-3 py-2 text-left text-xs font-semibold transition",
                    idx === active
                      ? "border-navy bg-navy text-cream"
                      : "border-navy/15 bg-white text-navy hover:border-gold"
                  )}
                >
                  <span className={cn("font-display text-base", idx === active ? "text-gold-light" : "text-gold-deep")}>
                    {num(idx)}
                  </span>
                  <span className="mt-0.5 whitespace-nowrap md:whitespace-normal">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <Carousel
          label="The 10 home-buying steps"
          className="mt-6"
          slideClassName="basis-full"
          slideLabels={buyerJourney.map((s) => s.title)}
          hideDots
          onIndexChange={setActive}
          goTo={goTo}
        >
          {buyerJourney.map((step, i) => (
            <article key={step.title} className="h-full rounded-2xl border border-navy/10 bg-paper p-5 md:p-6">
              <header className="flex items-baseline gap-4">
                <span className="font-display text-4xl text-gold-deep md:text-4xl">{num(i)}</span>
                <h3 className="font-display text-2xl font-medium text-navy md:text-3xl">{step.title}</h3>
                <span className="ml-auto text-sm text-slateink">
                  {i + 1} / {total}
                </span>
              </header>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-navy/15 bg-white p-5">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slateink">You — the buyer</p>
                  <h4 className="mt-2 font-display text-xl text-navy">{step.you.headline}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slateink lg:text-[0.95rem]">{step.you.body}</p>
                  <ul className="mt-3 space-y-1 text-sm text-navy">
                    {step.you.points.map((p) => (
                      <li key={p} className="flex gap-2"><span aria-hidden className="text-gold-deep">—</span>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-navy p-5 text-cream">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold-light">Behind the scenes — me</p>
                  <h4 className="mt-2 font-display text-xl">{step.me.headline}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-cream/80 lg:text-[0.95rem]">{step.me.body}</p>
                  <ul className="mt-3 space-y-1 text-sm text-cream/90">
                    {step.me.points.map((p) => (
                      <li key={p} className="flex gap-2"><span aria-hidden className="text-gold-light">—</span>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-navy/15 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <AlertTriangle size={16} className="text-gold-deep" aria-hidden /> Red flags
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slateink">
                    {step.redFlags.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-navy/15 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <MessageCircleQuestion size={16} className="text-gold-deep" aria-hidden /> Ask your agent
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slateink">
                    {step.ask.map((q) => <li key={q}>&ldquo;{q}&rdquo;</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border border-navy/15 bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <BookOpen size={16} className="text-gold-deep" aria-hidden /> Plain English
                  </p>
                  <dl className="mt-2 space-y-2 text-sm leading-relaxed">
                    {step.terms.map(([t, d]) => (
                      <div key={t}>
                        <dt className="font-semibold text-navy">{t}</dt>
                        <dd className="text-slateink">{d}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <a
                href="#consult"
                onClick={() => {
                  const message = `I'm at step ${num(i)} — ${step.title}. Here's where I am:`;
                  window.dispatchEvent(new CustomEvent("kj:lead-message", { detail: { message } }));
                }}
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline decoration-gold underline-offset-4"
              >
                This is where I am <ArrowRight size={16} aria-hidden />
              </a>
            </article>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
