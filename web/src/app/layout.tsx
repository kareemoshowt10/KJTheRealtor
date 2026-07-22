import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ContactWidget } from "@/components/contact-widget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://kareemjamaltherealtor.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kareem Jamal | Homeownership, Explained",
    template: "%s | Kareem Jamal",
  },
  description:
    "Kitchen-table real estate strategy for Southern California families. Prop 19, equity, and honest trade-offs — free before you ever hire an agent. Rodeo Realty Fine Estates · CA DRE #01998956.",
  applicationName: "Kareem Jamal Realtor",
  authors: [{ name: "Kareem Jamal", url: siteUrl }],
  creator: "Kareem Jamal",
  icons: { icon: "/assets/favicon-jamal.png" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Kareem Jamal",
    title: "Kareem Jamal | Homeownership, Explained",
    description:
      "Kitchen-table real estate strategy for Southern California families. One personal reply. No drip campaign.",
    images: [
      {
        url: "/assets/home-is-personal-poster.jpg",
        width: 1200,
        height: 630,
        alt: "Kareem Jamal — kitchen-table real estate strategy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kareem Jamal | Homeownership, Explained",
    description:
      "Kitchen-table strategy for Southern California families. CA DRE #01998956.",
    images: ["/assets/home-is-personal-poster.jpg"],
  },
  // Live on production domain — indexable. Set ALLOW_INDEX=false only for staging.
  robots:
    process.env.ALLOW_INDEX === "false"
      ? { index: false, follow: true }
      : { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} font-sans`}>
        {children}
        {/* First-visit chat opens front-and-center; then floating avatar site-wide */}
        <ContactWidget />
      </body>
    </html>
  );
}
