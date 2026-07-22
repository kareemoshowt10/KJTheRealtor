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
  { href: "/", label: "Home" },
  {
    href: "https://kareemjamaltherealtor.com/91311",
    label: "Full guide",
    external: true,
  },
];

export default function ChatsworthPage() {
  return (
    <>
      <SiteHeader
        links={navLinks}
        ctaHref="#connect"
        ctaLabel="Talk 91311"
      />
      <main>
        <ChatsworthHero />
        <ChatsworthLedger />
        <ChatsworthStory />
        <ChatsworthPockets />
        <ChatsworthFamilyTable />
        <ChatsworthOwners />
        <ChatsworthConnect />
      </main>
      <SiteFooter note="Hybrid Next.js · 91311 Chatsworth" />
    </>
  );
}
