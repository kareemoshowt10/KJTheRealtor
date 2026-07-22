"use client";

import { useState } from "react";

const chips = [
  {
    label: "Pull this week’s comps",
    fill: "Please pull this week's actual comps for me — here's the pocket I'm watching: ",
  },
  {
    label: "Verify horse zoning",
    fill: "I found a listing marketed as horse property — can you verify the actual zoning before I get attached? Address: ",
  },
  {
    label: "What’s my home worth?",
    fill: "I own in or near 91311 and want your honest read on what my home is really worth right now.",
  },
  {
    label: "First-time buyer start",
    fill: "I'm a first-time buyer looking at Chatsworth. Where should I actually start?",
  },
];

export function ChatsworthConnect() {
  const [message, setMessage] = useState("");
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="connect" className="bg-navy py-16 text-cream md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            Start with a conversation
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight">
            Thinking about 91311? Talk to someone{" "}
            <em className="font-normal italic text-gold-light">who&apos;s from it.</em>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-cream/80">
            Buying into Chatsworth, selling a family home here, or weighing an
            equestrian property&apos;s real value — local read first, strategy second.
            One conversation, no follow-up campaign.
          </p>
          <div className="mt-8 space-y-1 border-t border-cream/15">
            <a
              href="tel:+18184027326"
              className="block border-b border-cream/15 py-3 font-display text-xl hover:text-gold-light"
            >
              (818) 402-7326
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/45">
                Call or text
              </span>
            </a>
            <a
              href="mailto:kjamal@rodeore.com"
              className="block border-b border-cream/15 py-3 font-display text-xl hover:text-gold-light"
            >
              kjamal@rodeore.com
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/45">
                Direct email
              </span>
            </a>
          </div>
        </div>

        <form
          action="https://formspree.io/f/xnjlgvlk"
          method="POST"
          className="rounded-2xl border border-gold/45 bg-paper p-6 text-navy shadow-2xl md:p-8"
        >
          <h3 className="font-display text-xl font-medium">The 91311 conversation</h3>
          <p className="mt-1 text-sm text-slateink">
            Takes 30 seconds. Replied to personally, usually same day.
          </p>

          <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-gold-deep">
            Common questions — tap to ask
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  setMessage(c.fill);
                  setActive(c.label);
                }}
                className={`rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition ${
                  active === c.label
                    ? "border-gold bg-gold text-navy"
                    : "border-gold/45 bg-gold/10 text-navy hover:bg-gold/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <input type="hidden" name="_subject" value="91311 hybrid Next page conversation" />
          <input type="hidden" name="zip_page" value="91311 — Chatsworth (hybrid)" />
          <input type="hidden" name="source" value="web hybrid /91311" />

          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Name
            <input
              required
              name="name"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Email
            <input
              required
              type="email"
              name="email"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Phone{" "}
            <span className="font-normal normal-case tracking-normal text-slateink/70">
              optional
            </span>
            <input
              type="tel"
              name="phone"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            What&apos;s on your mind in Chatsworth?
            <textarea
              name="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full resize-y rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
              placeholder="Buying, selling, horse property, timing…"
            />
          </label>
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-gold/40 bg-cream p-3 text-sm">
            <input
              required
              type="checkbox"
              name="consent"
              value="Yes — explicit permission granted"
              className="mt-0.5 h-5 w-5 accent-gold-deep"
            />
            <span>
              You have my explicit permission to reply once. No drip campaign, no
              list, ever.
            </span>
          </label>
          <button
            type="submit"
            className="mt-5 w-full rounded-md bg-gold py-3.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
          >
            Send it to Kareem
          </button>
          <p className="mt-3 text-center text-[0.72rem] text-slateink/70">
            Raised in Chatsworth &amp; West Hills · CA DRE #01998956
          </p>
        </form>
      </div>
    </section>
  );
}
