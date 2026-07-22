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
import { Marquee } from "@/components/ui/marquee";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { FloatingDock } from "@/components/ui/floating-dock";

export const metadata: Metadata = {
  title: "91311 Chatsworth | The Zip Code I'm From | Kareem Jamal",
  description:
    "Chatsworth 91311 — horse zoning, pocket map, Prop 19, and kitchen-table strategy from a Realtor who grew up here. Free Equity Snapshot for owners.",
  alternates: {
    canonical: "https://kareemjamaltherealtor.com/91311",
  },
};

const navLinks = [
  { href: "#story", label: "Story" },
  { href: "#pockets", label: "Pockets" },
  { href: "#family-table", label: "Families" },
  { href: "#owners", label: "Owners" },
  { href: "#faq", label: "FAQ" },
  { href: "/", label: "Home" },
];

const localTags = [
  "Stoney Point",
  "Garden of the Gods",
  "Horse-keeping zoning",
  "Santa Susana Pass",
  "Homestead Acre",
  "Metrolink & Amtrak",
  "Equestrian trails",
  "South Chatsworth",
  "Indian Springs",
  "Lake Manor",
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
      <main className="pb-24">
        <ChatsworthHero />
        <Marquee items={localTags} speed="slow" />
        <ChatsworthLedger />
        <ChatsworthStory />
        <ChatsworthPockets />
        <ChatsworthFamilyTable />
        <ChatsworthOwners />
        <ChatsworthFaq />
        <ChatsworthConnect />
      </main>
      <FloatingDock />
      <SiteFooter note="Hybrid Next.js · 91311 Chatsworth" />
    </>
  );
}
