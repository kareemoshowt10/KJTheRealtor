import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { ZipCards } from "@/components/zip-cards";
import { Belief } from "@/components/belief";
import { FamilyTable } from "@/components/family-table";
import { Testimonials } from "@/components/testimonials";
import { StartCta } from "@/components/start-cta";
import { Marquee } from "@/components/ui/marquee";
import { BentoFeatures } from "@/components/bento-features";
import { StatsBand } from "@/components/stats-band";
import { ComparisonHoldSell } from "@/components/comparison-hold-sell";
import { FaqSection } from "@/components/faq-section";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { FloatingDock } from "@/components/ui/floating-dock";

const areas = [
  "Chatsworth 91311",
  "East Simi Valley 93063",
  "West Hills 91304",
  "Woodland Hills",
  "Calabasas",
  "Hidden Hills",
  "Encino",
  "Canoga Park",
  "Porter Ranch",
  "San Fernando Valley",
];

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader
        links={[
          { href: "#method-bento", label: "How I work" },
          { href: "#family-table", label: "Families" },
          { href: "#hold-vs-sell", label: "Hold vs sell" },
          { href: "#testimonials", label: "Stories" },
          { href: "#faq", label: "FAQ" },
          { href: "/91311", label: "91311" },
        ]}
      />
      <main className="pb-24">
        <Hero />
        <Marquee items={areas} speed="slow" />
        <StatsBand />
        <ZipCards />
        <BentoFeatures />
        <Belief />
        <FamilyTable />
        <ComparisonHoldSell />
        <Testimonials />
        <FaqSection />
        <StartCta />
      </main>
      <FloatingDock />
      <SiteFooter note="Hybrid Next.js · 21st.dev-inspired upgrades" />
    </>
  );
}
