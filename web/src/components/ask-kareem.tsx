"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import {
  askKareemDisclosure,
  askKareemEntries,
  askKareemIntro,
  type AskKareemEntry,
} from "@/lib/ask-kareem";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * "Ask Kareem" — an interactive persona that showcases expertise without
 * pretending to be live AI. Visitors tap a real question; Kareem's
 * pre-approved answer plays out as a conversation. Every word ships in the
 * bundle (see lib/ask-kareem.ts), so nothing un-reviewed can ever be said
 * in his name, and the disclosure under the panel says exactly what this is.
 */
export function AskKareem() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<AskKareemEntry | null>(null);
  // How many of the active answer's paragraphs are visible (staged reveal).
  const [shown, setShown] = useState(0);
  const timerRef = useRef<number[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    for (const t of timerRef.current) window.clearTimeout(t);
    timerRef.current = [];
  };

  const ask = useCallback(
    (entry: AskKareemEntry) => {
      clearTimers();
      setActive(entry);
      if (reduced) {
        setShown(entry.answer.length);
        return;
      }
      setShown(0);
      // Paragraphs land one at a time, like someone actually answering.
      entry.answer.forEach((_, i) => {
        timerRef.current.push(
          window.setTimeout(() => setShown((n) => Math.max(n, i + 1)), 350 + i * 900)
        );
      });
    },
    [reduced]
  );

  useEffect(() => clearTimers, []);

  // Keep the newest bubble in view inside the panel (not the page).
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, active]);

  return (
    <section id="ask-kareem" className="bg-paper py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:items-start md:px-8">
        <Reveal>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Ask Kareem
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight text-navy">
            The questions people are{" "}
            <em className="font-normal italic text-gold-deep">
              afraid to waste a call on.
            </em>
          </h2>
          <p className="mt-4 leading-relaxed text-slateink">{askKareemIntro}</p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {askKareemEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => ask(entry)}
                aria-pressed={active?.id === entry.id}
                className={
                  active?.id === entry.id
                    ? "rounded-full bg-navy px-4 py-2.5 text-left text-[0.82rem] font-semibold text-cream"
                    : "rounded-full border border-navy/25 bg-white px-4 py-2.5 text-left text-[0.82rem] font-semibold text-navy transition hover:border-gold-deep hover:text-gold-deep"
                }
              >
                {entry.question}
              </button>
            ))}
          </div>

          <p className="mt-6 text-[0.7rem] leading-relaxed text-slateink/70">
            {askKareemDisclosure}
          </p>
        </Reveal>

        {/* Conversation panel */}
        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-2xl border border-navy/12 bg-white shadow-[0_24px_60px_-24px_rgba(5,12,28,0.35)]">
            <div className="flex items-center gap-3 border-b border-navy/10 bg-navy px-5 py-3.5">
              <span className="relative h-10 w-10 overflow-hidden rounded-full border border-gold/50">
                <Image
                  src="/assets/kareem-jamal-headshot-2026-thumb.jpg"
                  alt="Kareem Jamal"
                  fill
                  sizes="40px"
                  className="object-cover object-top"
                />
              </span>
              <div>
                <p className="text-sm font-semibold text-cream">Kareem Jamal</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold">
                  Rodeo Realty · CA DRE #01998956
                </p>
              </div>
            </div>

            <div
              ref={threadRef}
              className="flex max-h-[26rem] min-h-[18rem] flex-col gap-3 overflow-y-auto px-5 py-5"
              aria-live="polite"
            >
              {!active && (
                <p className="m-auto max-w-[26ch] text-center text-sm text-slateink/60">
                  Pick a question on the left and I&apos;ll give it to you straight.
                </p>
              )}

              {active && (
                <>
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-navy px-4 py-3 text-sm leading-relaxed text-cream">
                    {active.question}
                  </div>

                  <AnimatePresence initial={false}>
                    {active.answer.slice(0, shown).map((para, i) => (
                      <motion.div
                        key={`${active.id}-${i}`}
                        initial={reduced ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease }}
                        className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md bg-paper px-4 py-3 text-sm leading-relaxed text-navy"
                      >
                        {para}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {shown < active.answer.length && (
                    <div
                      className="mr-auto flex gap-1.5 rounded-2xl rounded-bl-md bg-paper px-4 py-3.5"
                      aria-hidden
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-navy/40"
                          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: dot * 0.18 }}
                        />
                      ))}
                    </div>
                  )}

                  {shown >= active.answer.length && active.more && (
                    <motion.a
                      href={active.more.href}
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="mr-auto mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:underline"
                    >
                      {active.more.label} →
                    </motion.a>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-navy/10 bg-paper/60 px-5 py-3.5">
              <a
                href="#start"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold-deep"
              >
                Have a question that&apos;s actually yours? Ask me for real →
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
