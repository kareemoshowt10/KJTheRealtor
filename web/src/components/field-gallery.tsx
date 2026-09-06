import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";

/**
 * Brand photography of Kareem. These are real photographs of him, served from
 * /public rather than a third-party CDN.
 *
 * An earlier version of this section showed eight AI-generated images with alt
 * text describing scenes that never happened — including handing keys to a
 * family. On a licensed agent's site that reads as documentation of real
 * transactions, so it was removed entirely. Anything added here must be a real
 * photograph, and captions stay thematic: they describe how Kareem works, never
 * a particular client, listing, or closing.
 */
const frames = [
  {
    src: "/assets/kareem-doorway-portrait.jpg",
    width: 960,
    height: 1200,
    alt: "Kareem Jamal in a navy suit, stepping through an arched doorway into a sunlit room",
    eyebrow: "The walkthrough",
    line: "Reading a house the way a builder reads it.",
    priority: true,
  },
  {
    src: "/assets/kareem-table-portrait.jpg",
    width: 751,
    height: 1200,
    alt: "Kareem Jamal seated at a wooden table with document folders, facing the camera",
    eyebrow: "The conversation",
    line: "Everything on the table, before you decide.",
  },
];

export function FieldGallery() {
  return (
    <section
      id="in-the-field"
      aria-labelledby="in-the-field-heading"
      className="bg-navy py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-light">
            Across the West Valley
          </p>
          <h2
            id="in-the-field-heading"
            className="mt-3 font-display text-[clamp(1.9rem,4vw,3.2rem)] font-medium leading-tight text-cream"
          >
            How the work{" "}
            <em className="font-normal italic text-gold-light">
              actually goes.
            </em>
          </h2>
          <p className="mt-5 leading-relaxed text-cream/75">
            Walking the house first, then sitting down with the numbers and the
            paperwork in front of you &mdash; from Woodland Hills and Calabasas
            to Hidden Hills, Encino, West Hills, Chatsworth, and Simi Valley.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-14">
          {frames.map((frame) => (
            <Reveal key={frame.src}>
              <figure className="group relative m-0 overflow-hidden rounded-2xl bg-gradient-to-br from-navy-soft to-navy">
                <Image
                  src={frame.src}
                  alt={frame.alt}
                  width={frame.width}
                  height={frame.height}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={frame.priority}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#050F20]/90 via-[#050F20]/20 to-transparent"
                />
                <figcaption className="absolute inset-x-5 bottom-5">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-gold-light">
                    {frame.eyebrow}
                  </p>
                  <h3 className="mt-1 font-display text-[clamp(1.15rem,1.9vw,1.7rem)] font-medium leading-snug text-cream">
                    {frame.line}
                  </h3>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
