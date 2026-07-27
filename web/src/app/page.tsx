import type { Metadata } from "next";
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
          { href: "#method", label: "Method" },
          { href: "/91311", label: "91311" },
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
        <AskKareem />
        <ZipCards />
        <MethodTimeline />
        <FamilyTable />
        <Belief />
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
