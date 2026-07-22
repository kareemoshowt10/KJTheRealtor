"use client";

import { useReducedMotion, motion } from "framer-motion";
import { ArrowRight, Home, KeyRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type LeadPath = "owner" | "family" | "buyer";

export const PATH_STORAGE_KEY = "kj_lead_path";

export const pathPrefills: Record<
  LeadPath,
  { chip: string; fill: string; label: string }
> = {
  owner: {
    label: "I own here",
    chip: "What's it worth?",
    fill: "I own in the West Valley and want an honest read on value, timing, and whether holding or selling is smarter right now.",
  },
  family: {
    label: "Helping parents",
    chip: "Parents' home",
    fill: "I'm helping my parents with a long-held home — hold, sell, Prop 19 / transfer, or next steps. Need a clear, patient starting read.",
  },
  buyer: {
    label: "Buying (esp. 91311)",
    chip: "Buy & sell timing",
    fill: "I'm looking to buy in Chatsworth / the northwest Valley. Want a local, numbers-first start — not a listing blast.",
  },
};

const paths: {
  id: LeadPath;
  icon: typeof Home;
  title: string;
  body: string;
  proof: string;
}[] = [
  {
    id: "owner",
    icon: Home,
    title: "I own a home here",
    body: "Worth, timing, hold vs sell, or a quiet Equity Snapshot — without a listing pitch.",
    proof: "Pocket-level read · not a portal guess",
  },
  {
    id: "family",
    icon: Users,
    title: "I'm helping my parents",
    body: "Prop 19, siblings, sell vs keep, and how to decide without rushing the people you love.",
    proof: "Kitchen-table pace · plain English",
  },
  {
    id: "buyer",
    icon: KeyRound,
    title: "I'm buying (or exploring)",
    body: "Chatsworth, West Hills, East Simi — local map first, strategy second. Especially 91311.",
    proof: "Raised here · zoning honesty",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Persist path so the lead form can pre-fill the right chip/message. */
export function selectLeadPath(path: LeadPath) {
  try {
    sessionStorage.setItem(PATH_STORAGE_KEY, path);
    window.dispatchEvent(
      new CustomEvent("kj:lead-path", { detail: { path } })
    );
  } catch {
    /* private mode */
  }
}

/**
 * Sprint 2 — path selector. One tap answers “who is this for?”
 * and hands a warm start into the conversation form.
 */
export function PathSelector() {
  const reduced = useReducedMotion();

  return (
    <section
      id="start-here"
      className="border-b border-[#e3d8c7] bg-paper py-12 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Start here · 10 seconds
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-medium text-navy">
            Which seat are you in?
          </h2>
          <p className="mt-2 text-sm text-slateink md:text-base">
            Pick one. I&apos;ll meet you there — no pressure, no drip list.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {paths.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.a
                key={p.id}
                href="#start"
                onClick={() => selectLeadPath(p.id)}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.45, ease }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                className={cn(
                  "group flex flex-col rounded-2xl border border-[#e3d8c7] bg-white p-5 shadow-sm transition",
                  "hover:border-gold/60 hover:shadow-gold active:border-gold"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy transition group-hover:bg-gold/20 group-hover:text-gold-deep">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-lg font-medium text-navy">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slateink">
                  {p.body}
                </p>
                <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-gold-deep">
                  {p.proof}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition group-hover:text-gold-deep">
                  Continue
                  <ArrowRight
                    size={15}
                    className="transition group-hover:translate-x-0.5"
                  />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
