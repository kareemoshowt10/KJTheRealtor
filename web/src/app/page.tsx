import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { ZipCards } from "@/components/zip-cards";
import { Belief } from "@/components/belief";
import { FamilyTable } from "@/components/family-table";
import { Testimonials } from "@/components/testimonials";
import { StartCta } from "@/components/start-cta";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ZipCards />
        <Belief />
        <FamilyTable />
        <Testimonials />
        <StartCta />
      </main>
      <SiteFooter note="Hybrid Next.js · homepage preview" />
    </>
  );
}
