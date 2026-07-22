import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Kareem Jamal | Homeownership, Explained — Hybrid Preview",
  description:
    "Kitchen-table real estate strategy for Southern California families. Prop 19, equity, and honest trade-offs — free before you ever call an agent.",
  icons: { icon: "/assets/favicon-jamal.png" },
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
      </body>
    </html>
  );
}
