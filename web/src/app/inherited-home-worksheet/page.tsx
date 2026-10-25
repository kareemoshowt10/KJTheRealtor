import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InheritedWorksheetForm } from "@/components/inherited-worksheet-form";

const title = "Inherited Home Basis Worksheet | Free PDF";
const description = "Inherited a house? Get the free worksheet: date-of-death value, improvements vs. repairs, selling costs, estimated gain, and a 4-option net-cash comparison. From Kareem Jamal, Rodeo Realty.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/inherited-home-worksheet" },
  openGraph: { title: "You inherited a house. Run the numbers before you renovate.", description, url: "/inherited-home-worksheet", type: "website", images: [{ url: "/assets/inherited-worksheet-og.jpg", width: 1200, height: 630, alt: "Inherited Home Basis Worksheet by Kareem Jamal" }] },
  twitter: { card: "summary_large_image", title: "Inherited Home Basis Worksheet", description, images: ["/assets/inherited-worksheet-og.jpg"] },
};

const takeaways = [
  { n: "01", h: "Your basis usually steps up.", b: "For inherited property, basis is generally the fair market value on the date of death. A date-of-death appraisal is the number everything else hangs on.", s: "IRC §1014 · IRS Pub 551 · Pub 523" },
  { n: "02", h: "Improvements count. Repairs generally don’t.", b: "New flooring or landscaping can add to basis. Paint and fixing leaks are generally repairs. Keep every receipt and log them separately.", s: "IRS Pub 551 · Pub 523" },
  { n: "03", h: "Compare net cash, not sale price.", b: "Fix-up and months of taxes, insurance and loan payments come out of your pocket. In my example, the fully renovated house netted the least.", s: "Example numbers only" },
];

export default function InheritedWorksheetPage() {
  return <div className="min-h-screen bg-[#050505] text-[#f4efe4] selection:bg-[#D4AF37]/30">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <Link href="/" className="flex items-center gap-3" aria-label="Kareem Jamal home">
        <Image src="/assets/jamal-logo-icon-512.png" alt="" width={40} height={40} className="rounded-md" />
        <span className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-white/70 sm:block">Kareem G. Jamal · Rodeo Realty</span>
      </Link>
      <a href="#get" className="rounded-full border border-[#D4AF37]/60 px-4 py-2 text-sm font-semibold text-[#F3D98B] hover:bg-[#D4AF37]/10">Get the worksheet</a>
    </header>

    <main>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[640px] w-[640px] rounded-full border border-dashed border-[#D4AF37]/25" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-32 h-[420px] w-[420px] rounded-full border border-[#D4AF37]/15" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_10%,rgba(212,175,55,0.14),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:pt-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#D4AF37]">Free worksheet · Inherited property</p>
            <h1 className="mt-5 font-display text-5xl font-medium leading-[1.02] md:text-7xl">You inherited a house.<br /><em className="bg-gradient-to-r from-[#B8902F] via-[#F3D98B] to-[#C9A23E] bg-clip-text not-italic text-transparent">Run the numbers</em> before you renovate.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">Stepped-up basis, improvements vs. repairs, selling costs, and a four-option net-cash comparison. On paper. Bring it to your CPA. Bring it to me.</p>
            <div className="mt-8 flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-br from-[#8C6A1E] via-[#F3D98B] to-[#A07C2A] p-[3px]">
                <Image src="/assets/kareem-jamal-headshot-2026-web.jpg" alt="Kareem Jamal" width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover" priority />
              </div>
              <div>
                <p className="font-display text-xl">Kareem G. Jamal</p>
                <p className="text-sm italic text-[#D4AF37]">The Family You Choose</p>
                <p className="text-xs text-white/50">Realtor® · Rodeo Realty · West SFV &amp; Simi Valley</p>
              </div>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-[auto_1fr] items-center gap-6">
              <div className="relative aspect-[9/16] w-44 overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:w-52">
                <video className="absolute inset-0 h-full w-full object-cover" src="/videos/inherited-home-tax-basis.mp4" poster="/videos/inherited-home-tax-basis-poster.jpg" controls playsInline preload="none" aria-label="Inherited home: maximize your tax basis (video)" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Watch · 1:17</p>
                <p className="mt-2 font-display text-2xl leading-snug">Why the fully fixed house isn&rsquo;t always the winner.</p>
                <p className="mt-2 text-sm text-white/55">Example numbers. Not tax or legal advice.</p>
              </div>
            </div>
          </div>

          <div id="get" className="scroll-mt-6 rounded-2xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#14110a] to-[#0a0a0a] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] md:p-8 lg:sticky lg:top-6">
            <div className="mb-6 flex items-center gap-4 border-b border-white/10 pb-5">
              <div className="flex h-16 w-12 flex-col justify-between rounded-sm border border-[#D4AF37]/60 bg-[#050505] p-1.5" aria-hidden>
                <span className="block h-1 w-full bg-[#D4AF37]" /><span className="block h-0.5 w-3/4 bg-white/30" /><span className="block h-0.5 w-full bg-white/20" /><span className="block h-0.5 w-2/3 bg-white/20" />
              </div>
              <div>
                <p className="font-display text-2xl leading-tight">Inherited Home Basis Worksheet</p>
                <p className="text-sm text-white/55">4-page PDF · Instant download · Free</p>
              </div>
            </div>
            <InheritedWorksheetForm />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#080807]">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#D4AF37]">Three things to know first</p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            {takeaways.map(t => <article key={t.n} className="bg-[#080807] p-7">
              <p className="font-display text-4xl text-[#D4AF37]">{t.n}</p>
              <h2 className="mt-4 font-display text-2xl leading-snug">{t.h}</h2>
              <p className="mt-3 leading-relaxed text-white/65">{t.b}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">{t.s}</p>
            </article>)}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-display text-3xl">What&rsquo;s inside the worksheet</p>
              <p className="mt-3 max-w-2xl leading-relaxed text-white/65">Date-of-death value and appraisal · Capital improvements vs. repairs log · Selling costs · Estimated gain calculation · As-is / cleanout / cosmetic / full reno comparison · Questions to bring your CPA.</p>
            </div>
            <a href="#get" className="rounded-lg bg-gradient-to-r from-[#B8902F] via-[#F3D98B] to-[#C9A23E] px-6 py-4 text-center font-bold text-black">Get the free worksheet</a>
          </div>
          <p className="mt-10 text-sm leading-relaxed text-white/55">Still standing in the house, not sure where to start? <Link href="/inherited-home-guide" className="font-semibold text-[#F3D98B] underline underline-offset-4">Read the inherited home guide</Link> for the clean-out and family side.</p>
        </div>
      </section>
    </main>

    <footer className="border-t border-white/10 px-5 py-10 text-xs leading-relaxed text-white/45 md:px-8">
      <div className="mx-auto max-w-6xl space-y-3">
        <p><strong className="text-white/70">General information only. Not tax, legal, or financial advice.</strong> Based on IRS Publications 551, 523 and 544 and IRC §1014. Example numbers are illustrative; no outcome is guaranteed. Talk to a CPA or tax attorney about your situation.</p>
        <p>Kareem Jamal · Rodeo Realty · DRE #01998956 · Equal Housing Opportunity · <a href="tel:+18184027326" className="underline">(818) 402-7326</a> · <Link href="/privacy" className="underline">Privacy</Link></p>
      </div>
    </footer>
  </div>;
}
