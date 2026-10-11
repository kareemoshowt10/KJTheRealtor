"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, MessageCircleQuestion } from "lucide-react";
import { buyerJourney } from "@/lib/buyer-journey";
import { cn } from "@/lib/utils";

export function Journey() {
  const [i, setI] = useState(0);
  const step = buyerJourney[i];
  const total = buyerJourney.length;
  const num = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <section id="journey" className="scroll-mt-20 bg-[#f2ecdf] px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">The whole process, both sides</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
          Ten steps. What you live through — and what I&apos;m doing behind the scenes.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-slateink">
          Read as much or as little as you need. Every buyer is somewhere on this list. Find your step,
          then tell me where you are.
        </p>

        <nav aria-label="Buying steps" className="mt-10 -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <ol className="flex min-w-max gap-2 md:grid md:min-w-0 md:grid-cols-5 lg:grid-cols-10">
            {buyerJourney.map((s, idx) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setI(idx)}
                  aria-current={idx === i ? "step" : undefined}
                  className={cn(
                    "flex h-full w-full flex-col items-start rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition",
                    idx === i
                      ? "border-navy bg-navy text-cream"
                      : "border-navy/15 bg-white text-navy hover:border-gold"
                  )}
                >
                  <span className={cn("font-display text-base", idx === i ? "text-gold-light" : "text-gold-deep")}>
                    {num(idx)}
                  </span>
                  <span className="mt-0.5 whitespace-nowrap md:whitespace-normal">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <article className="mt-8" aria-live="polite">
          <header className="flex items-baseline gap-4">
            <span className="font-display text-5xl text-gold-deep">{num(i)}</span>
            <h3 className="font-display text-3xl font-medium text-navy md:text-4xl">{step.title}</h3>
            <span className="ml-auto text-sm text-slateink">
              {i + 1} / {total}
            </span>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-navy/15 bg-white p-6 md:p-7">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slateink">You — the buyer</p>
              <h4 className="mt-3 font-display text-2xl text-navy">{step.you.headline}</h4>
              <p className="mt-3 leading-relaxed text-slateink">{step.you.body}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-navy">
                {step.you.points.map((p) => (
                  <li key={p} className="flex gap-2"><span aria-hidden className="text-gold-deep">—</span>{p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-navy p-6 text-cream md:p-7">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold-light">Behind the scenes — me</p>
              <h4 className="mt-3 font-display text-2xl">{step.me.headline}</h4>
              <p className="mt-3 leading-relaxed text-cream/80">{step.me.body}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-cream/90">
                {step.me.points.map((p) => (
                  <li key={p} className="flex gap-2"><span aria-hidden className="text-gold-light">—</span>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-navy/15 bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                <AlertTriangle size={16} className="text-gold-deep" aria-hidden /> Red flags
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slateink">
                {step.redFlags.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-navy/15 bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                <MessageCircleQuestion size={16} className="text-gold-deep" aria-hidden /> Ask your agent
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slateink">
                {step.ask.map((q) => <li key={q}>&ldquo;{q}&rdquo;</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-navy/15 bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                <BookOpen size={16} className="text-gold-deep" aria-hidden /> Plain English
              </p>
              <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                {step.terms.map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-semibold text-navy">{t}</dt>
                    <dd className="text-slateink">{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setI((n) => Math.max(0, n - 1))}
              disabled={i === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy/25 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40"
            >
              <ArrowLeft size={16} aria-hidden /> Previous
            </button>
            <button
              type="button"
              onClick={() => setI((n) => Math.min(total - 1, n + 1))}
              disabled={i === total - 1}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy/25 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40"
            >
              Next step <ArrowRight size={16} aria-hidden />
            </button>
            <a
              href="#consult"
              onClick={() => {
                const message = `I'm at step ${num(i)} — ${step.title}. Here's where I am:`;
                window.dispatchEvent(new CustomEvent("kj:lead-message", { detail: { message } }));
              }}
              className="ml-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline decoration-gold underline-offset-4"
            >
              This is where I am <ArrowRight size={16} aria-hidden />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
