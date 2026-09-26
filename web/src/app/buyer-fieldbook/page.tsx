import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BuyerFieldbook } from "@/components/buyer-fieldbook";

export const metadata: Metadata = {
  title: "Free Homebuyer Fieldbook | Plan Your Next Move",
  description:
    "Plan cash, compare homes against your priorities, track the buying process, and translate common terms. Free homebuyer tools by Kareem Jamal.",
  alternates: { canonical: "/buyer-fieldbook" },
};

export default function BuyerFieldbookPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "#fieldbook", label: "Buyer tools" },
          { href: "#buyer-contact", label: "Ask Kareem" },
          { href: "/", label: "Home" },
        ]}
        ctaHref="#buyer-contact"
        ctaLabel="Talk through a move"
      />
      <BuyerFieldbook />
      <SiteFooter note="A clearer plan for your next home" />
    </>
  );
}
