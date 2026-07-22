import { SiteHeader } from "@/components/site-header";
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
      <footer className="border-t border-navy/10 bg-navy py-10 text-cream/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {new Date().getFullYear()} Kareem Jamal · CA DRE #01998956 · Hybrid
            Next.js preview
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://kareemjamaltherealtor.com/"
              className="text-gold-light hover:underline"
            >
              Current production site →
            </a>
            <a
              href="https://kareemjamaltherealtor.com/91311"
              className="hover:text-gold-light"
            >
              91311 Chatsworth
            </a>
            <a
              href="https://kareemjamaltherealtor.com/#library"
              className="hover:text-gold-light"
            >
              Full library
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
