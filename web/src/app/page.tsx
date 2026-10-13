import Image from "next/image";
import { Carousel } from "@/components/ui/carousel";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { HomeSchema } from "@/components/home-schema";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { ZipCards } from "@/components/zip-cards";
import { Belief } from "@/components/belief";
import { FamilyTable } from "@/components/family-table";
import { StartCta } from "@/components/start-cta";
import { ComparisonHoldSell } from "@/components/comparison-hold-sell";
import { FaqSection } from "@/components/faq-section";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { FloatingDock } from "@/components/ui/floating-dock";
import { MethodTimeline } from "@/components/method-timeline";
import { ConversionSticky } from "@/components/conversion-sticky";
import { PathSelector } from "@/components/path-selector";
import { TrustProof } from "@/components/trust-proof";
import { ProblemNarrative } from "@/components/problem-narrative";
import { FieldGallery } from "@/components/field-gallery";
import { AskKareem } from "@/components/ask-kareem";

/**
 * Homepage: path selector + real trust (no stock faces) + mobile hold-vs-sell.
 */
export const metadata: Metadata = {
  // /91311 declared a canonical but the homepage did not.
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeSchema />
      <ScrollProgress />
      <SiteHeader
        links={[
          { href: "/buy", label: "Buy a Home" },
          { href: "#equity-snapshot", label: "Home value" },
          { href: "#start-here", label: "Start here" },
          { href: "/buyer-fieldbook", label: "Buyer Fieldbook" },
          { href: "/commute-check", label: "Commute Check" },
          { href: "#method", label: "Method" },
          { href: "/91311", label: "91311" },
          { href: "/listings", label: "Listings" },
        ]}
        ctaHref="#start"
        ctaLabel="Talk"
      />
      <main className="pb-28">
        <Hero />
        {/* Story arc: the villain (transaction-first system) → who it lands
            on → what Kareem does instead — then the visitor picks a path. */}
        <ProblemNarrative />
        <PathSelector />
        <section className="relative overflow-hidden bg-[#f2ecdf] px-5 py-14 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">Free planning tools</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">Make your next move clearer.</h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-slateink">Useful starting points for buying or selling. Explore privately, at your own pace. No sign-up required.</p>
            </div>
            <Carousel label="Free planning tools" className="mt-8" slideLabels={["Commute Check", "The Buyer Fieldbook", "The Seller Walkthrough"]}>
              <a href="/commute-check" className="group flex h-full min-h-56 flex-col overflow-hidden rounded-xl border border-[#c4ac7a] bg-navy p-6 text-cream transition hover:-translate-y-0.5 hover:shadow-lg">
<div className="relative -mx-6 -mt-6 mb-5 aspect-[16/6] overflow-hidden border-b border-gold/20 bg-navy-mist" aria-hidden="true">
                  <svg viewBox="0 0 320 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice"><path d="M20 130 C 90 120, 110 40, 180 60 S 280 40, 300 26" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeDasharray="6 7" /><circle cx="20" cy="130" r="7" fill="#C9A84C" /><circle cx="300" cy="26" r="7" fill="none" stroke="#C9A84C" strokeWidth="2.5" /></svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-light">For your next move</span>
                <h3 className="mt-3 font-display text-2xl font-medium">Is the farther home worth the drive?</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/80">Compare fuel, driving time, family support, and everyday access. A lower payment is only part of the story.</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-gold-light">Run your free comparison <ArrowRight size={16} aria-hidden="true" /></span>
              </a>
              <a href="/buyer-fieldbook" className="group flex h-full min-h-56 flex-col overflow-hidden rounded-xl border border-[#e1d4c0] bg-white p-6 transition hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-lg">
<div className="relative -mx-6 -mt-6 mb-5 aspect-[16/6] overflow-hidden">
                  <Image src="/assets/hero-buyers.jpg" alt="A sunlit living room with a view of the hills" fill sizes="(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 380px" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">For buyers</span>
                <h3 className="mt-3 font-display text-2xl font-medium text-navy">The Buyer Fieldbook</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slateink">Plan cash, compare homes against your priorities, track the process, and make sense of the language.</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-navy group-hover:text-gold-deep">Open the free guide <ArrowRight size={16} aria-hidden="true" /></span>
              </a>
              <a href="/seller-presentation" className="group flex h-full min-h-56 flex-col overflow-hidden rounded-xl border border-[#e1d4c0] bg-white p-6 transition hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-lg">
<div className="relative -mx-6 -mt-6 mb-5 aspect-[16/6] overflow-hidden">
                  <Image src="/assets/luxury-bathroom.jpg" alt="A bright, freshly prepared bathroom with a soaking tub" fill sizes="(max-width: 640px) 86vw, (max-width: 1024px) 50vw, 380px" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">For homeowners</span>
                <h3 className="mt-3 font-display text-2xl font-medium text-navy">The Seller Walkthrough</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slateink">Explore preparation, pricing, estimated costs, and the sale timeline before deciding whether to sell.</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-navy group-hover:text-gold-deep">See the seven-step guide <ArrowRight size={16} aria-hidden="true" /></span>
              </a>
            </Carousel>
          </div>
        </section>
        <AskKareem />
        <ZipCards />
        <MethodTimeline />
        <FamilyTable />
        <Belief />
        <FieldGallery />
        <ComparisonHoldSell />
        <TrustProof />
        <FaqSection />
        <StartCta />
      </main>
      <FloatingDock formId="start" formLabel="Talk" />
      <ConversionSticky
        formId="start"
        ctaLabel="Tell me what's going on"
        hint="One personal reply · no drip · usually same day"
      />
      <SiteFooter />
    </>
  );
}
