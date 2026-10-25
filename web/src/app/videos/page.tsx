import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Video = {
  slug: string;
  title: string;
  description: string;
  duration: string; // display
  iso: string; // ISO 8601 duration for schema
  note?: string;
};

const videos: Video[] = [
  {
    slug: "first-home-step-by-step",
    title: "How to buy your first home, step by step",
    description:
      "The three phases, from getting ready and pre-approved to the search, the offer, and escrow.",
    duration: "3:14",
    iso: "PT3M14S",
  },
  {
    slug: "escrow-money-mistakes",
    title: "3 money mistakes that kill a loan in escrow",
    description:
      "New credit, untraceable deposits, and job or pay changes your lender can catch before funding.",
    duration: "0:56",
    iso: "PT56S",
  },
  {
    slug: "real-cost-of-owning",
    title: "The real cost of owning a home",
    description:
      "Eight monthly costs beyond the loan payment, from property tax and insurance to maintenance.",
    duration: "1:00",
    iso: "PT1M",
  },
  {
    slug: "inherited-home-tax-basis",
    title: "Inherited home: maximize your tax basis",
    description:
      "How stepped-up basis, improvements vs. repairs, and fix-up choices can change your net when you sell.",
    duration: "1:17",
    iso: "PT1M17S",
    note: "Not tax or legal advice. Talk with a CPA or tax attorney about your situation.",
  },
];

const title = "Homebuying Video Library | Realtor Explainers";
const description =
  "Short explainer videos from Kareem Jamal (Rodeo Realty, CA DRE #01998956): buying your first home, escrow money mistakes, the real cost of owning, and inherited-home tax basis.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/videos" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Homeownership, explained in short videos",
    description,
    url: "/videos",
    type: "website",
    images: [{ url: "/videos/first-home-step-by-step-poster.jpg", width: 720, height: 1280 }],
  },
  twitter: { card: "summary_large_image", title, description },
};

const SITE = "https://kareemjamaltherealtor.com";

const schema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Kareem Jamal video library",
  itemListElement: videos.map((v, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "VideoObject",
      name: v.title,
      description: v.description,
      thumbnailUrl: `${SITE}/videos/${v.slug}-poster.jpg`,
      contentUrl: `${SITE}/videos/${v.slug}.mp4`,
      uploadDate: "2026-10-23",
      duration: v.iso,
    },
  })),
};

export default function VideosPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Home" },
          { href: "#library", label: "Videos" },
          { href: "/homeowners", label: "Homeowners" },
          { href: "/inherited-home-guide", label: "Inherited home" },
        ]}
        ctaHref="/#start"
        ctaLabel="Talk"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main>
        <section className="bg-navy text-cream">
          <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Video library
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.08] md:text-6xl">
              Homeownership, explained in a few minutes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/85">
              Short, plain-English explainers for buyers, homeowners, and families.
              Press play on any card. Every video plays right here on the page.
            </p>
          </div>
        </section>

        <section id="library" className="bg-paper py-14 text-navy md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
            {videos.map((v) => (
              <article
                key={v.slug}
                id={v.slug}
                className="flex flex-col overflow-hidden rounded-xl border border-gold/25 bg-white shadow-gold"
              >
                <div className="relative aspect-[9/16] w-full bg-black">
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={`/videos/${v.slug}.mp4`}
                    poster={`/videos/${v.slug}-poster.jpg`}
                    controls
                    playsInline
                    preload="none"
                    aria-label={v.title}
                  />
                  <span className="pointer-events-none absolute right-2 top-2 rounded bg-navy/85 px-2 py-0.5 text-xs font-semibold text-cream">
                    {v.duration}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-lg leading-snug">{v.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slateink">{v.description}</p>
                  {v.note && (
                    <p className="mt-3 rounded-md border border-gold/40 bg-cream px-3 py-2 text-xs font-semibold text-gold-deep">
                      {v.note}
                    </p>
                  )}
                  <p className="mt-auto pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {v.duration} · Vertical video
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-navy text-cream">
          <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
            <h2 className="font-display text-3xl font-medium md:text-4xl">
              Want to talk through your situation?
            </h2>
            <p className="mt-4 max-w-2xl text-cream/85">
              Videos cover the basics. A conversation covers your numbers. Pick the
              next step that fits.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#start" className="rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition hover:bg-gold-light">
                Start a conversation
              </Link>
              <Link href="/first-home-plan" className="rounded-lg border border-gold/50 px-6 py-3 font-semibold text-cream transition hover:border-gold">
                First home plan
              </Link>
              <Link href="/homeowners" className="rounded-lg border border-gold/50 px-6 py-3 font-semibold text-cream transition hover:border-gold">
                Homeowner resources
              </Link>
              <Link href="/inherited-home-guide" className="rounded-lg border border-gold/50 px-6 py-3 font-semibold text-cream transition hover:border-gold">
                Inherited home guide
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter note="Educational videos. Not legal, tax, financial, or lending advice." />
    </>
  );
}
