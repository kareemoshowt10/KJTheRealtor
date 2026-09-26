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
          { href: "#equity-snapshot", label: "Home value" },
          { href: "#start-here", label: "Start here" },
          { href: "/buyer-fieldbook", label: "Buyer Fieldbook" },
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
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">The free Buyer Fieldbook</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">Buying a home has a lot of moving parts.<br className="hidden md:block" /> Put your next step in focus.</h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-slateink">Plan cash, compare homes against your priorities, track the process, and make sense of the language. Start anywhere. No sign-up.</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-navy/75"><span>01 · Plan</span><span>02 · Compare</span><span>03 · Track</span><span>04 · Understand</span></div>
            </div>
            <a href="/buyer-fieldbook" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 font-semibold text-cream transition hover:bg-[#162d51]">Open the Buyer Fieldbook <ArrowRight size={17} aria-hidden="true" /></a>
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
