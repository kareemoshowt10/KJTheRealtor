"use client";

import { motion } from "motion/react";
import {
  TestimonialsColumn,
  type Testimonial,
} from "@/components/ui/testimonials-columns-1";

const testimonials: Testimonial[] = [
  {
    text: "He sat with my parents for almost two hours and never rushed them. Explained Prop 19 in plain English so we could make a plan.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces",
    name: "Elena M.",
    role: "Adult daughter · West Valley",
  },
  {
    text: "We thought we had to sell. Kareem showed keep-as-rental math first — and only then how he’d list it. That honesty is rare.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces",
    name: "Robert & Diane H.",
    role: "Longtime 91311 owners",
  },
  {
    text: "Every agent wanted the listing yesterday. Kareem said we could wait. We sold when we were ready.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=80&h=80&fit=crop&crop=faces",
    name: "Margaret S.",
    role: "Seller · family estate",
  },
  {
    text: "He treats my mom like family — patient, clear, never talking down. Strategy was sharp; kindness is what I’ll remember.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
    name: "James T.",
    role: "Son coordinating a move",
  },
  {
    text: "His Equity Snapshot walked us through the pocket, not a national algorithm.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces",
    name: "Patricia L.",
    role: "Simi Valley homeowner",
  },
  {
    text: "Tax, construction, and family politics in one meeting — without a hard sell.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
    name: "David K.",
    role: "Multi-gen household",
  },
  {
    text: "Felt like a sharp nephew who also knows real estate — trusts, timing, what to protect.",
    image:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&h=80&fit=crop&crop=faces",
    name: "Carolyn W.",
    role: "Move-up seller · 70s",
  },
  {
    text: "One personal reply. No drip campaign. He said that on the website and meant it.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=faces",
    name: "Nina R.",
    role: "Adult child · Encino",
  },
  {
    text: "He knows Chatsworth like someone who grew up there — because he did.",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=faces",
    name: "Michael P.",
    role: "Buyer · equestrian pocket",
  },
];

const first = testimonials.slice(0, 3);
const second = testimonials.slice(3, 6);
const third = testimonials.slice(6, 9);

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[540px] flex-col items-center"
        >
          <div className="rounded-full border border-[#e3d8c7] bg-white px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-slateink">
            Kitchen-table voices
          </div>
          <h2 className="mt-4 text-center font-display text-[clamp(1.9rem,4vw,3rem)] font-medium tracking-tight text-navy">
            Situations families bring{" "}
            <em className="font-normal italic text-gold-deep">
              to the table.
            </em>
          </h2>
          <p className="mt-4 text-center text-slateink">
            Composite scenarios drawn from common multi-gen, Prop 19, and
            long-held-home conversations — not individual verified reviews.
          </p>
        </motion.div>

        <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <TestimonialsColumn testimonials={first} duration={15} />
          <TestimonialsColumn
            testimonials={second}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={third}
            className="hidden lg:block"
            duration={17}
          />
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-[0.72rem] leading-relaxed text-slateink/70">
          Illustrative composites for education only. Names and photos are not
          real client identities. For verified reviews, ask for current Google
          or brokerage references when we talk.{" "}
          <a
            href="#start"
            className="font-semibold text-gold-deep hover:underline"
          >
            Start a conversation →
          </a>
        </p>
      </div>
    </section>
  );
}
