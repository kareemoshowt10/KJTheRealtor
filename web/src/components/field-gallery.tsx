import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";

const CDN =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3EneKRD1u0CoNc1EfRiQbcJPhFX";

/**
 * On-location brand photography. These are commissioned brand images of
 * Kareem, not documentation of specific listings or clients, so the captions
 * stay thematic rather than claiming particular transactions.
 */
const frames = [
  {
    src: `${CDN}/hf_20260831_035321_fbd5b07b-6802-442e-a274-e2412c832e7e.png`,
    alt: "Kareem Jamal in a navy suit looking out the floor-to-ceiling windows of a modern great room at golden hour",
    eyebrow: "The walkthrough",
    line: "Reading a house the way a builder reads it.",
    span: "md:col-span-7",
    sizes: "(max-width: 768px) 100vw, 640px",
    priority: true,
  },
  {
    src: `${CDN}/hf_20260831_034933_032552cb-5e0e-43e2-b97c-289ed167934a.png`,
    alt: "Low-key editorial portrait of Kareem Jamal seated in a wood-panelled study",
    eyebrow: "The long game",
    line: "Thirty years, not thirty days.",
    span: "md:col-span-5 md:row-span-2",
    sizes: "(max-width: 768px) 100vw, 460px",
  },
  {
    src: `${CDN}/hf_20260831_034933_9bc5045b-e5e8-410a-9a99-e319b68afd6f.png`,
    alt: "Kareem Jamal walking up the stone driveway of a Mediterranean estate at blue hour",
    eyebrow: "Arrival",
    line: "Every showing starts before the door.",
    span: "md:col-span-4",
    sizes: "(max-width: 768px) 100vw, 380px",
  },
  {
    src: `${CDN}/hf_20260831_034933_8f2ba1ba-d6a3-4ebc-9cac-40e532647591.png`,
    alt: "Kareem Jamal at a hillside terrace railing overlooking San Fernando Valley lights at twilight",
    eyebrow: "The valley",
    line: "Home ground.",
    span: "md:col-span-3",
    sizes: "(max-width: 768px) 100vw, 300px",
  },
  {
    src: `${CDN}/hf_20260831_034933_46e7ca17-b132-472b-8a7a-f265cbe46e42.png`,
    alt: "Kareem Jamal reviewing architectural plans at a marble kitchen island",
    eyebrow: "The math",
    line: "Plans, permits, and honest numbers.",
    span: "md:col-span-4",
    sizes: "(max-width: 768px) 100vw, 380px",
  },
  {
    src: `${CDN}/hf_20260831_034933_dd92b7be-9606-4907-aa80-f325cbf9363c.png`,
    alt: "Kareem Jamal beside an infinity pool at night with a warmly lit estate behind him",
    eyebrow: "Fine estates",
    line: "The top of the market, handled quietly.",
    span: "md:col-span-4",
    sizes: "(max-width: 768px) 100vw, 380px",
  },
  {
    src: `${CDN}/hf_20260831_034933_c00a1c61-512a-4c8f-bc38-ab040b65962b.png`,
    alt: "Kareem Jamal in shirtsleeves inspecting a partially renovated home interior",
    eyebrow: "Value-add",
    line: "What a room could become.",
    span: "md:col-span-4",
    sizes: "(max-width: 768px) 100vw, 380px",
  },
  {
    src: `${CDN}/hf_20260831_034933_43c9e6da-948d-4724-8305-f47d3618c8ce.png`,
    alt: "Kareem Jamal handing house keys to a family at the front door of a craftsman home in golden light",
    eyebrow: "The part that matters",
    line: "Keys in a family's hand — and equity that stays there.",
    span: "md:col-span-12",
    sizes: "100vw",
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
            Where the work{" "}
            <em className="font-normal italic text-gold-light">
              actually happens.
            </em>
          </h2>
          <p className="mt-5 leading-relaxed text-cream/75">
            Not behind a desk. In the great rooms and the driveways, on the
            terraces at dusk and in the half-finished rooms where a
            builder&rsquo;s eye earns its keep &mdash; from Woodland Hills and
            Calabasas to Hidden Hills, Encino, West Hills, Chatsworth, and Simi
            Valley.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-14 md:auto-rows-[clamp(220px,24vw,340px)] md:grid-cols-12">
          {frames.map((frame, i) => (
            <Reveal
              key={frame.src}
              delay={Math.min(i * 0.05, 0.25)}
              className={`group relative min-h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-navy-soft to-navy ${frame.span}`}
            >
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                sizes={frame.sizes}
                quality={72}
                priority={frame.priority}
                className="object-cover transition duration-700 group-hover:scale-[1.035]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#050F20]/90 via-[#050F20]/20 to-transparent"
              />
              <div className="absolute inset-x-5 bottom-5">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-gold-light">
                  {frame.eyebrow}
                </p>
                <h3 className="mt-1 font-display text-[clamp(1.15rem,1.9vw,1.7rem)] font-medium leading-snug text-cream">
                  {frame.line}
                </h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
