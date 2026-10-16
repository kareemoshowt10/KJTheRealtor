import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BuyerFieldbook } from "@/components/buyer-fieldbook";

export const metadata: Metadata = {
  title: "Free Homebuyer Fieldbook | Plan Your Next Move",
  description:
    "Plan cash, compare homes against your priorities, track the buying process, and translate common terms. Free homebuyer tools by Kareem Jamal.",
  alternates: { canonical: "/buyer-fieldbook" },
  openGraph: {
    type: "website",
    url: "/buyer-fieldbook",
    title: "Free Homebuyer Fieldbook | Kareem Jamal",
    description:
      "A free, no-sign-up guide to planning cash, comparing homes, and navigating the steps to your next home.",
    siteName: "Kareem Jamal",
    images: [{
      url: "/assets/hero-buyers.jpg",
      width: 1200,
      height: 1200,
      alt: "A welcoming home interior for Kareem Jamal's Homebuyer Fieldbook",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Homebuyer Fieldbook | Kareem Jamal",
    description:
      "Plan cash, compare homes, and keep track of the buying process. Free to use, with no sign-up.",
    images: ["/assets/hero-buyers.jpg"],
  },
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
