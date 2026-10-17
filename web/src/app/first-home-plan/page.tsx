import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FirstHomePlan } from "@/components/first-home-plan";

export const metadata: Metadata = {
  title: "Your First Home Plan | Start While You Rent",
  description: "A free English/Spanish homebuying journal, fillable action guide, and an optional planning conversation with Kareem Jamal. Start before you feel ready.",
  alternates: { canonical: "/first-home-plan" },
  openGraph: { title: "Rent for now. Plan what comes next.", description: "Your First Home Plan: free bilingual worksheets and one useful next step.", url: "/first-home-plan", type: "website", images: ["/assets/kareem-doorway-portrait.jpg"] },
};

export default function FirstHomePlanPage() {
  return <>
    <SiteHeader links={[{ href: "/", label: "Home" }, { href: "#resources", label: "Free resources" }, { href: "/buyer-fieldbook", label: "Buyer Fieldbook" }]} ctaHref="#planning" ctaLabel="Plan with Kareem" />
    <main>
      <section className="overflow-hidden bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_0.8fr] md:items-center md:px-8 md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Your First Home Plan</p>
            <h1 className="mt-5 max-w-2xl font-display text-5xl font-medium leading-[1.08] md:text-7xl">Rent for now.<br />Plan what comes next.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">You don’t have to be ready to buy to start. Find the questions to ask, write down what fits your life, and choose one useful next step.</p>
            <a href="#resources" className="mt-8 inline-block rounded-lg bg-gold px-6 py-4 font-semibold text-navy transition hover:bg-gold-light">Start with the free guide</a>
            <p className="mt-4 text-sm text-cream/70">English + Español · No email needed to download</p>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[10rem] border border-gold/35">
            <Image src="/assets/kareem-doorway-portrait.jpg" alt="Kareem Jamal welcoming you to a home" fill priority sizes="(max-width: 768px) 90vw, 380px" className="object-cover" />
          </div>
        </div>
      </section>
      <FirstHomePlan />
    </main>
    <SiteFooter note="From my real estate family to yours." />
  </>;
}
