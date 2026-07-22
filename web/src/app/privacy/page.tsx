import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy | Kareem Jamal",
  description:
    "How Kareem Jamal (Rodeo Realty Fine Estates) handles contact information from website inquiries. Permission-based replies only.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Home" },
          { href: "/91311", label: "91311" },
          { href: "/#start", label: "Contact" },
        ]}
        ctaHref="/#start"
        ctaLabel="Start a conversation"
      />
      <main className="bg-paper py-14 text-navy md:py-20">
        <article className="mx-auto max-w-2xl px-5 md:px-8">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
            Privacy
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-medium leading-tight">
            How your information is used
          </h1>
          <p className="mt-3 text-sm text-slateink">
            Last updated: July 22, 2026
          </p>

          <div className="mt-10 space-y-8 text-[0.95rem] leading-relaxed text-slateink">
            <section>
              <h2 className="font-display text-xl text-navy">Who we are</h2>
              <p className="mt-2">
                This site is operated by <strong>Kareem Jamal</strong>, a licensed
                California real estate salesperson with{" "}
                <strong>Rodeo Realty Fine Estates</strong> (CA DRE #01998956).
                Contact:{" "}
                <a className="text-navy underline" href="mailto:kjamal@rodeore.com">
                  kjamal@rodeore.com
                </a>
                ,{" "}
                <a className="text-navy underline" href="tel:+18184027326">
                  (818) 402-7326
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy">
                What we collect
              </h2>
              <p className="mt-2">
                When you use a contact form, you may provide: name, email, phone
                (optional), message content, topic chips you select, and technical
                metadata (page URL, source label, approximate time of submission).
                Forms are processed by our form provider (Formspree) and delivered
                to Kareem&apos;s business inbox.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy">
                How we use it
              </h2>
              <p className="mt-2">
                We use your information only to respond to the inquiry you
                submitted — typically <strong>one personal reply</strong> on the
                channel you chose (email, and phone/text only if you provided a
                number and asked for a call/text). We do{" "}
                <strong>not</strong> sell your data, add you to a marketing drip,
                or share lists with third-party lead buyers.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy">
                Legal basis &amp; permission
              </h2>
              <p className="mt-2">
                Contact forms require an explicit permission checkbox before
                submit. That permission is limited to replying to your request.
                California residents may have additional rights under the CCPA/CPRA
                regarding access or deletion of personal information we hold from
                web inquiries — email{" "}
                <a className="text-navy underline" href="mailto:kjamal@rodeore.com">
                  kjamal@rodeore.com
                </a>{" "}
                with the subject line “Privacy request.”
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy">
                Cookies &amp; analytics
              </h2>
              <p className="mt-2">
                This hybrid site may use essential hosting cookies (e.g. Vercel)
                and, if configured, privacy-conscious analytics or tag managers to
                understand page performance. We do not use advertising retargeting
                pixels by default on these pages. If third-party tools are added
                later, this notice will be updated.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy">
                How long we keep it
              </h2>
              <p className="mt-2">
                Inquiry records are retained as long as needed to complete the
                conversation and meet ordinary business/recordkeeping needs, then
                deleted or archived according to brokerage practice. Reply “stop”
                or “unsubscribe” to any message and we will not continue contact
                for that inquiry.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy">Not professional advice</h2>
              <p className="mt-2">
                Educational content on this site (including Prop 19, hold-vs-sell,
                zoning, and equity topics) is general information, not legal, tax,
                financial, or lending advice. Real estate representation begins
                only under a written agency agreement with the appropriate
                brokerage.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy">Contact</h2>
              <p className="mt-2">
                Privacy questions:{" "}
                <a className="text-navy underline" href="mailto:kjamal@rodeore.com">
                  kjamal@rodeore.com
                </a>
                . Equal Housing Opportunity.
              </p>
            </section>
          </div>

          <p className="mt-12">
            <Link
              href="/#start"
              className="text-sm font-semibold text-gold-deep hover:underline"
            >
              ← Back to conversation form
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter note="Privacy policy" />
    </>
  );
}
