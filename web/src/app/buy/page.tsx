import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeadForm } from "@/components/lead-form";
import { ConversionSticky } from "@/components/conversion-sticky";
import { RealNumber } from "@/components/buy/real-number";
import { Journey } from "@/components/buy/journey";
import { Carousel } from "@/components/ui/carousel";

const title = "Buy a Home in the West Valley & Simi Valley | Get Your Real Number";
const description =
  "Buying in Chatsworth, Canoga Park, West Hills, Winnetka, or Simi Valley? Run your real monthly number, see all 10 steps from both sides of the table, and book a 20-minute buyer consult with Kareem Jamal, Rodeo Realty Fine Estates.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/buy" },
  openGraph: {
    type: "website",
    url: "https://kareemjamaltherealtor.com/buy",
    siteName: "Kareem Jamal",
    title,
    description,
    images: [
      {
        url: "/assets/buy-og.jpg",
        width: 1200,
        height: 630,
        alt: "Kareem Jamal — get your real number before you buy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/buy-og.jpg"],
  },
};

const areas: {
  name: string;
  zip: string;
  note: string;
  href: string | null;
  img?: string;
  imgAlt?: string;
}[] = [
  {
    name: "Chatsworth",
    zip: "91311",
    note: "Northwest corner of the Valley, up against the Santa Susana foothills. Includes horse-zoned pockets.",
    href: "/91311",
    img: "/assets/cliffside-sunset.jpg",
    imgAlt: "Sandstone boulders and a trail in the Chatsworth foothills at sunset",
  },
  {
    name: "Canoga Park",
    zip: "91303 · 91304",
    note: "West Valley, next to Warner Center.",
    href: null,
  },
  {
    name: "West Hills",
    zip: "91304 · 91307",
    note: "Southwest corner of the Valley, along the Simi Hills.",
    href: "/west-hills",
  },
  {
    name: "Winnetka",
    zip: "91306",
    note: "West Valley, between Canoga Park and Reseda.",
    href: null,
  },
  {
    name: "Simi Valley",
    zip: "93063 · 93065",
    note: "Ventura County, just over the pass on the 118.",
    href: "/93063",
  },
];

const consentText = (
  <>
    Yes, Kareem Jamal (Rodeo Realty Fine Estates, CA DRE #01998956) may contact me about buying a
    home by email, and by phone call or text at the number I provided. Consent isn&apos;t a
    condition of any purchase or service. Message and data rates may apply; reply STOP to opt out of
    texts. I won&apos;t be added to a mailing list.{" "}
    <a href="/privacy" className="underline underline-offset-2">
      Privacy
    </a>
  </>
);

export default function BuyPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "#numbers", label: "Your number" },
          { href: "#journey", label: "The 10 steps" },
          { href: "#areas", label: "Areas" },
          { href: "/buyer-fieldbook", label: "Fieldbook" },
          { href: "/", label: "Home" },
        ]}
        ctaHref="#consult"
        ctaLabel="Book a consult"
      />
      <main className="pb-28">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy px-5 py-16 text-cream md:py-24">
          <div
            className="pointer-events-none absolute -right-40 -top-52 h-[36rem] w-[36rem] rounded-full border border-gold/20"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
                Chatsworth · Canoga Park · West Hills · Winnetka · Simi Valley
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-medium leading-[1.04] tracking-tight md:text-7xl">
                Ready to buy?
                <br />
                <em className="font-normal text-gold-light">Start with your real number.</em>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">
                Not the list price. Not what an app says you &ldquo;can afford.&rdquo; The monthly
                payment you can actually live with — and a clear plan to get there. Twenty minutes,
                straight answers, no pressure.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="#consult"
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold-light"
                >
                  Book a 20-minute buyer consult <ArrowRight size={17} aria-hidden />
                </a>
                <a
                  href="#numbers"
                  className="text-sm font-semibold text-cream/85 underline decoration-gold/60 underline-offset-4 hover:text-gold-light"
                >
                  Or run your numbers first
                </a>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[18rem] md:max-w-sm">
              <div className="overflow-hidden rounded-2xl border border-gold/30">
                <Image
                  src="/assets/kareem-table-portrait.jpg"
                  alt="Kareem Jamal at a meeting table"
                  width={751}
                  height={1200}
                  priority
                  sizes="(min-width: 768px) 384px, 90vw"
                  className="h-auto w-full object-cover"
                />
              </div>
              <p className="mt-3 text-center text-xs text-cream/60">
                Kareem Jamal · Rodeo Realty Fine Estates · CA DRE #01998956
              </p>
            </div>
          </div>
        </section>

        {/* What the consult is */}
        <section className="bg-paper px-5 py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">This is for you if</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight">
                You&apos;re done browsing. You want a plan.
              </h2>
              <ul className="mt-6 space-y-3 text-slateink">
                {[
                  "You want to buy in the next few months, not someday.",
                  "You want to know the real monthly cost before you tour.",
                  "You want every step explained before you sign anything.",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check size={20} className="mt-0.5 shrink-0 text-gold-deep" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-navy/15 bg-white p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">In 20 minutes, you&apos;ll leave with</p>
              <ol className="mt-5 space-y-4">
                {[
                  ["Your real number", "A monthly payment range built from your figures, not a guess."],
                  ["Your next three moves", "What to line up with a lender, and what to fix first."],
                  ["Where to look", "Which areas and home types fit that number."],
                ].map(([h, b], idx) => (
                  <li key={h} className="flex gap-4">
                    <span className="font-display text-2xl text-gold-deep">0{idx + 1}</span>
                    <span>
                      <span className="block font-semibold text-navy">{h}</span>
                      <span className="block text-sm leading-relaxed text-slateink">{b}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-sm text-slateink">
                No obligation. If it isn&apos;t a fit, you still keep the plan.
              </p>
            </div>
          </div>
        </section>

        <RealNumber />
        <Journey />

        {/* Areas */}
        <section id="areas" className="scroll-mt-20 bg-paper px-5 py-16 md:py-20 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">Where I work</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
              The West Valley and Simi Valley.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slateink">
              Prices change street by street here. Ask me for current numbers on the exact area
              you&apos;re considering — I&apos;ll pull recent sales, not citywide averages.
            </p>
            <Carousel label="Areas I work in" className="mt-10" slideClassName="basis-[86%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(20%-0.8rem)]" slideLabels={areas.map((a) => a.name)}>
              {areas.map((a) => (
                <a
                  key={a.name}
                  href={a.href ?? "#consult"}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy/15 bg-white transition hover:border-gold/70 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/7] overflow-hidden bg-navy lg:hidden">
                    {a.img ? (
                      <Image
                        src={a.img}
                        alt={a.imgAlt ?? ""}
                        fill
                        sizes="(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 360px"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center" aria-hidden>
                        <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full border border-gold/25" />
                        <span className="font-display text-3xl text-cream/90">{a.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gold-deep">{a.zip}</p>
                    <h3 className="mt-2 font-display text-2xl text-navy">{a.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slateink">{a.note}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-navy">
                      {a.href ? "Area guide" : "Ask about this area"} <ArrowRight size={14} aria-hidden />
                    </span>
                  </div>
                </a>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Free roadmap */}
        <section className="bg-[#f2ecdf] px-5 py-16 md:py-20 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">Free roadmap · no sign-up</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight">
              Not ready to talk? Take the tools.
            </h2>
            <Carousel
              label="Free buyer tools"
              className="mt-8"
              slideClassName="basis-[86%] md:basis-[calc(50%-0.5rem)]"
              slideLabels={["The Buyer Fieldbook", "Commute Check"]}
            >
              <a
                href="/buyer-fieldbook"
                className="group flex h-full min-h-48 flex-col overflow-hidden rounded-xl border border-[#c4ac7a] bg-navy text-cream transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[16/5] overflow-hidden lg:hidden">
                  <Image
                    src="/assets/hero-buyers.jpg"
                    alt="A sunlit living room with a view of the hills"
                    fill
                    sizes="(max-width: 768px) 86vw, 540px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-light">Your buying roadmap</span>
                <h3 className="mt-3 font-display text-2xl font-medium">The Buyer Fieldbook</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/80">
                  Plan your cash to close, compare homes against your priorities, check off the 18
                  planning steps, and look up the jargon.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-gold-light">
                  Open the Fieldbook <ArrowRight size={16} aria-hidden />
                </span>
                </div>
              </a>
              <a
                href="/commute-check"
                className="group flex h-full min-h-48 flex-col rounded-xl border border-[#e1d4c0] bg-white p-6 transition hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">Before you stretch for distance</span>
                <h3 className="mt-3 font-display text-2xl font-medium text-navy">Commute Check</h3>
                <p className="mt-2 text-sm leading-relaxed text-slateink">
                  Is the farther, cheaper home really cheaper? Compare fuel, drive time, and everyday
                  access side by side.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-navy group-hover:text-gold-deep">
                  Run the comparison <ArrowRight size={16} aria-hidden />
                </span>
              </a>
            </Carousel>
          </div>
        </section>

        {/* Consult / lead form */}
        <section id="consult" className="scroll-mt-20 bg-navy px-5 py-16 text-cream md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Book your 20-minute buyer consult</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
                Get your real number. Then decide.
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-cream/80">
                Tell me where you are and when works. I&apos;ll reach out personally to set a time —
                phone or video, your call.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-cream/85">
                {[
                  "Your monthly number, from your figures.",
                  "What to bring to a lender — and what to ask them.",
                  "An honest read on timing and where to look.",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check size={18} className="shrink-0 text-gold-light" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t border-cream/20 pt-5 text-sm text-cream/65">
                Prefer to call or text?{" "}
                <a href="tel:+18184027326" className="font-semibold text-cream underline decoration-gold underline-offset-4">
                  (818) 402-7326
                </a>
                <br />
                Kareem Jamal · Rodeo Realty Fine Estates · CA DRE #01998956
              </p>
            </div>
            <LeadForm
              title="Request your consult"
              subtitle="Takes 30 seconds. I read every one myself."
              subject="Buyer consult request (/buy) — Kareem Jamal"
              source="web hybrid /buy"
              hiddenFields={{ funnel: "buy-now buyer consult" }}
              chips={[
                { label: "Buying in 0–3 months", fill: "I'd like to buy in the next 0–3 months. Best times for a 20-minute call: " },
                { label: "3–6 months", fill: "I'm planning to buy in 3–6 months. Best times for a 20-minute call: " },
                { label: "First home", fill: "This would be my first home. I'd like a 20-minute consult to get my real number. Best times: " },
                { label: "Selling to buy", fill: "I need to sell my current home to buy the next one. Best times for a call: " },
              ]}
              chipsLabel="Where you are — tap one"
              messageLabel="Timing, area, and best times to call"
              messagePlaceholder="e.g. 3 months, West Hills or Simi, weekday evenings"
              showPhone
              consentText={consentText}
              consentValue="Yes — consent to contact by email, phone call, or text about buying a home (/buy)"
              submitLabel="Request my 20-minute consult"
            />
          </div>
        </section>
      </main>
      <ConversionSticky
        formId="consult"
        ctaLabel="Book a 20-minute consult"
        hint="Your real number · one personal reply"
      />
      <SiteFooter note="Buying in the West Valley & Simi Valley" />
    </>
  );
}
