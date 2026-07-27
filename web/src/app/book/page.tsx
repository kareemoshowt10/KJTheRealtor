import type { Metadata } from "next";
import { AppointmentBooker } from "@/components/appointment-booker";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Book a conversation",
  description:
    "Pick a 30-minute slot with Kareem Jamal. No pitch — bring your questions about buying, selling, Prop 19, or holding a family home. CA DRE #01998956.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-cream pb-24 pt-28 md:pt-32">
        <div className="mx-auto max-w-2xl px-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Kitchen-table conversation
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium leading-tight text-navy md:text-4xl">
            Thirty minutes, your questions, no pitch.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slateink">
            Most people who sit down with me aren&apos;t ready to buy or sell for
            months — sometimes years. That&apos;s fine. The conversation is free
            and it stays a conversation until you decide otherwise.
          </p>

          <AppointmentBooker className="mt-10" />

          <p className="mt-8 text-center text-sm text-slateink">
            Prefer to skip the calendar?{" "}
            <a
              href="tel:+18184027326"
              className="font-semibold text-navy underline underline-offset-2"
            >
              Call (818) 402-7326
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
