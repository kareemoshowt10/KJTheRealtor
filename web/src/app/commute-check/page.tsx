import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CommuteCheck } from "@/components/commute-check";

export const metadata: Metadata = {
  title: "Is the Farther Home Worth the Drive? | Free Commute Check",
  description: "Compare two homes using driving enjoyment, fuel costs, family support, and access to schools and care. Your numbers, your priorities. Free, with no sign-up.",
  alternates: { canonical: "/commute-check" },
  openGraph: { title: "Is the farther home worth the drive?", description: "A free commute and community worksheet from Kareem Jamal. Compare the payment, the drive, and the life around it.", url: "/commute-check", type: "website", images: ["/assets/home-is-personal-poster.jpg"] },
  twitter: { card: "summary_large_image", title: "Is the farther home worth the drive?", description: "Compare two homes on fuel, driving, family support, and everyday access.", images: ["/assets/home-is-personal-poster.jpg"] },
};

export default function CommuteCheckPage() {
  return <>
    <SiteHeader links={[{ href: "/", label: "Home" }, { href: "/buyer-fieldbook", label: "Buyer Fieldbook" }, { href: "#comparison", label: "Your comparison" }]} ctaHref="#review" ctaLabel="Ask Kareem" />
    <CommuteCheck />
    <SiteFooter note="A home should fit your life, as well as your payment." />
  </>;
}
