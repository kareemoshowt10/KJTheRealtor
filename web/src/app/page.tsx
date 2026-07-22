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

/**
 * Sprint 2 homepage: path selector + real trust (no stock faces) +
 * mobile hold-vs-sell. Keeps Sprint 1 speed/clarity.
 */
export default function HomePage() {
  return (
    <>
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
        <PathSelector />
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
      <SiteFooter note="Sprint 2 · human & trustworthy" />
    </>
  );
}
