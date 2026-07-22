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
      <SiteFooter note="91311 Chatsworth · Sprint 1" />
    </>
  );
}
