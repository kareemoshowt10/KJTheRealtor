import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatsworthHero } from "@/components/chatsworth/hero";
import { ChatsworthLedger } from "@/components/chatsworth/ledger";
import { ChatsworthStory } from "@/components/chatsworth/story";
import { ChatsworthPockets } from "@/components/chatsworth/pockets";
import { ChatsworthFamilyTable } from "@/components/chatsworth/family-table";
import { ChatsworthOwners } from "@/components/chatsworth/owners";
import { ChatsworthConnect } from "@/components/chatsworth/connect";
import { ChatsworthFaq } from "@/components/chatsworth/faq";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ConversionSticky } from "@/components/conversion-sticky";

export const metadata: Metadata = {
  title: "91311 Chatsworth | The Zip Code I'm From",
  description:
    "Chatsworth 91311 — horse zoning, pocket map, Prop 19, and kitchen-table strategy from a Realtor who grew up here. Free Equity Snapshot for owners.",
  alternates: {
    canonical: "/91311",
  },
};

const navLinks = [
  { href: "#pockets", label: "Pockets" },
  { href: "#family-table", label: "Families" },
  { href: "#owners", label: "Owners" },
  { href: "/listings", label: "Listings" },
  { href: "/", label: "Home" },
];

export default function ChatsworthPage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader
        links={navLinks}
        ctaHref="#connect"
        ctaLabel="Talk 91311"
      />
      <main className="pb-28">
        <ChatsworthHero />
        <ChatsworthLedger />
        <section className="bg-[#f2ecdf] px-5 py-10">
          <a href="/ownership-lab" className="group mx-auto flex max-w-6xl flex-col justify-between gap-5 rounded-xl border border-[#c5ac7a] bg-white p-6 transition hover:shadow-lg md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">91311 · Free ownership tools</p>
              <h2 className="mt-2 font-display text-3xl text-navy">Wondering what buying or keeping a home really costs?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slateink">Use the Ownership Lab's illustrative calculator and decision guides before you commit.</p>
            </div>
            <span className="shrink-0 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-cream">Open the Ownership Lab →</span>
          </a>
        </section>
        <ChatsworthPockets />
        <ChatsworthStory />
        <ChatsworthFamilyTable />
        <ChatsworthOwners />
        <ChatsworthFaq />
        <ChatsworthConnect />
      </main>
      <FloatingDock formId="connect" formLabel="91311" />
      <ConversionSticky
        formId="connect"
        ctaLabel="Talk 91311 with me"
        hint="Local read · one personal reply · no drip"
      />
      <SiteFooter note="Chatsworth · 91311" />
    </>
  );
}
