"use client";

import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

/**
 * Demo data for a React/shadcn app.
 * On the live static site (index.html), the same pattern is implemented in
 * vanilla HTML/CSS under #testimonials with brand-aligned copy.
 *
 * Replace with verified Google reviews before treating as production social proof.
 */
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
    text: "His Equity Snapshot walked us through the pocket, not a national algorithm. We finally understood real buyer value.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces",
    name: "Patricia L.",
    role: "Simi Valley homeowner",
  },
  {
    text: "Tax, construction, and family politics in one meeting — without a hard sell. We hired him the next morning.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
    name: "David K.",
    role: "Multi-gen household",
  },
  {
    text: "Nobody walked us through the family-wealth side before. Felt like a sharp nephew who also knows real estate.",
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
    text: "He knows Chatsworth like someone who grew up there — because he did. Horse-zoning honesty alone was worth the call.",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=faces",
    name: "Michael P.",
    role: "Buyer · equestrian pocket",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function Testimonials() {
  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg">Testimonials</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
            What families say at the kitchen table
          </h2>
          <p className="text-center mt-5 opacity-75">
            Patient strategy for parents, adult children, and long-held homes.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
