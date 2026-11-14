import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Building2, Calculator, ClipboardCheck,
  Compass, HeartHandshake, MapPin, ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OwnershipMathKit } from "@/components/ownership-math-kit";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "91311 Ownership Lab | Free Real Estate Math & Guides",
  description: "Free Chatsworth 91311 homeownership tools: calculate possible housing costs, plan your first home, evaluate selling, and understand inherited-property decisions. No sign-up required.",
  alternates: { canonical: "/ownership-lab" },
  openGraph: {
    title: "The Ownership Lab | Understand the Numbers Before the Decision",
    description: "Free, practical tools for buying, selling, and holding property in and around Chatsworth 91311.",
    url: "/ownership-lab",
    type: "website",
  },
};

const resources = [
  {
    number: "01",
    name: "Buyer Math Kit",
    audience: "Buyers and renters",
    problem: "What would owning actually cost each month?",
    benefit: "Estimate your payment, ongoing costs, and upfront cash target.",
    href: "#ownership-math-kit",
    action: "Use the calculator",
    icon: Calculator,
  },
  {
    number: "02",
    name: "First Home Plan",
    audience: "Future buyers",
    problem: "What do I need to work on before I buy?",
    benefit: "Find your biggest unknown and map a practical next step.",
    href: "/first-home-plan",
    action: "Build my plan",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    name: "Seller Walkthrough",
    audience: "Homeowners",
    problem: "What does selling involve beyond the list price?",
    benefit: "Walk through preparation, pricing, costs, and the sale process.",
    href: "/seller-presentation",
    action: "Explore seller options",
    icon: Building2,
  },
  {
    number: "04",
    name: "Inherited Home Guide",
    audience: "Families",
    problem: "Should our family keep, sell, or prepare the home?",
    benefit: "Organize the property, people, costs, and professional questions.",
    href: "/inherited-home-guide",
    action: "Read the family guide",
    icon: HeartHandshake,
  },
  {
    number: "05",
    name: "91311 Field Guide",
    audience: "Chatsworth buyers and owners",
    problem: "How do Chatsworth's different areas compare?",
    benefit: "Explore local history, pocket differences, lot questions, and trade-offs.",
    href: "/91311",
    action: "Explore Chatsworth",
    icon: MapPin,
  },
  {
    number: "06",
    name: "Commute Check",
    audience: "Relocating households",
    problem: "Is a lower-priced home worth the longer commute?",
    benefit: "Compare travel, fuel, support systems, and day-to-day time.",
    href: "/commute-check",
    action: "Run a comparison",
    icon: Compass,
  },
];

const checklist = [
  ["Monthly reality", "Mortgage payment, property tax, insurance, HOA, and maintenance all belong in the same calculation."],
  ["Cash after closing", "Protect an emergency buffer rather than putting every dollar into the down payment."],
  ["Property-specific risk", "Check insurance, permits, zoning, disclosures, inspections, and likely repairs for the actual parcel."],
  ["Time horizon", "Consider whether moving, refinancing, or changing household needs could affect the ownership plan."],
  ["The alternative", "Compare ownership with renting, waiting, selling, or holding without assuming one always wins."],
];

export default function OwnershipLabPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Home" },
          { href: "#tools", label: "Free tools" },
          { href: "#ownership-math-kit", label: "Buyer math" },
          { href: "/91311", label: "91311" },
          { href: "#ask", label: "Ask Kareem" },
        ]}
        ctaHref="#ask"
        ctaLabel="Ask a question"
      />
      <main>
        <section className="relative overflow-hidden bg-navy px-5 py-16 text-cream md:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-44 h-[30rem] w-[30rem] rounded-full border border-gold/30 opacity-50" />
          <div aria-hidden="true" className="pointer-events-none absolute right-8 top-4 h-[24rem] w-[24rem] rounded-full border border-gold/20 opacity-50" />
          <div className="relative mx-auto max-w-6xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
              <BookOpen size={16} aria-hidden="true" /> The Ownership Standard · 91311
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-medium leading-[1.07] md:text-7xl">
              Own the decision <em className="font-normal text-gold-light">before</em> you own the home.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream/85">
              Real estate feels less intimidating when you understand how the numbers work. These free tools help you explore buying, selling, and keeping a home in Chatsworth and nearby communities.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#ownership-math-kit" className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 font-semibold text-navy transition hover:bg-gold-light">
                Calculate the real cost <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#tools" className="inline-flex items-center gap-2 rounded-lg border border-cream/35 px-5 py-3 font-semibold text-cream transition hover:bg-cream/10">
                Browse free resources
              </a>
            </div>
            <p className="mt-5 text-sm text-cream/70">No account · No email gate · No obligation to buy or sell</p>
          </div>
        </section>

        <section id="tools" className="bg-paper px-5 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">Choose the question you're actually asking</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-navy md:text-5xl">A free tool for each decision.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slateink">
              Good guidance starts by listening. Pick your situation, use a resource, and decide whether you want to talk. The tools remain free either way.
            </p>
            <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={resource.number}
                    href={resource.href}
                    className="group flex min-h-[19rem] flex-col rounded-2xl border border-[#dfd2bd] bg-white p-6 transition hover:-translate-y-1 hover:border-gold/70 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2ecdf] text-navy">
                        <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                      </span>
                      <span className="font-display text-2xl text-[#b3a58e]">{resource.number}</span>
                    </div>
                    <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-gold-deep">{resource.audience}</p>
                    <h3 className="mt-2 font-display text-2xl text-navy">{resource.name}</h3>
                    <p className="mt-3 font-semibold text-navy">{resource.problem}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slateink">{resource.benefit}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-navy transition group-hover:gap-3">
                      {resource.action} <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <OwnershipMathKit />

        <section id="ownership-checklist" className="bg-paper px-5 py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">Free tool 02 · Ownership check</p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-navy">Five questions before the offer.</h2>
              <p className="mt-5 leading-relaxed text-slateink">Property is a serious commitment. The best move is the one that survives an honest look at the trade-offs.</p>
              <Link href="/buyer-fieldbook" className="mt-7 inline-flex items-center gap-2 font-semibold text-navy underline decoration-gold underline-offset-4">
                Open the complete Buyer Fieldbook <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="space-y-3">
              {checklist.map(([title, description], index) => (
                <article key={title} className="flex gap-4 rounded-xl border border-[#e2d6c4] bg-white p-5">
                  <span className="font-display text-2xl text-gold-deep">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-semibold text-navy">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slateink">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#e8e0d0] px-5 py-12">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">
                <ShieldCheck size={16} aria-hidden="true" /> Local knowledge, responsibly presented
              </p>
              <h2 className="mt-3 font-display text-3xl text-navy">Chatsworth is more than a ZIP-code average.</h2>
              <p className="mt-3 text-sm leading-relaxed text-slateink">Zoning, condition, location, taxes, insurance, and comparable sales matter. Our 91311 field guide explains local differences; request current comparable sales rather than relying on an old market snapshot.</p>
            </div>
            <Link href="/91311" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-5 py-3 font-semibold text-cream hover:bg-[#183653]">
              Explore the 91311 guide <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section id="ask" className="bg-navy px-5 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
            <div className="text-cream">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">A real conversation, when you want one</p>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight md:text-5xl">Questions cost nothing. Mistakes cost thousands.</h2>
              <p className="mt-5 leading-relaxed text-cream/80">
                Tell me which part of the math, market, or process you're trying to understand. I'll start with your question—not a sales pitch.
              </p>
              <p className="mt-5 text-sm text-cream/70">One personal reply with permission. No automatic marketing sequence or newsletter signup.</p>
            </div>
            <LeadForm
              title="What's your ownership question?"
              subtitle="Tell me what matters to you. One personal reply; no drip list."
              subject="Ownership Lab · 91311 question"
              source="ownership-lab"
              chipsLabel="Choose a starting point"
              chips={[
                { label: "Understand my payment", fill: "I used the Buyer Math Kit and would like to understand the costs of ownership for my situation." },
                { label: "Planning my first home", fill: "I'm preparing to buy my first home and have a question about the right next step." },
                { label: "Sell or keep?", fill: "I'm deciding whether to sell or keep a home and want to understand both options." },
                { label: "Inherited family home", fill: "Our family is working through an inherited or aging home and could use a starting plan." },
                { label: "91311 market question", fill: "I'd like to understand a specific property or market question in Chatsworth 91311." },
              ]}
              messageLabel="Your question (optional)"
              messagePlaceholder="What's the main decision you're trying to make?"
              hiddenFields={{ resource_context: "ownership_lab_v1", market_interest: "91311" }}
              showPhone
            />
          </div>
        </section>
      </main>
      <SiteFooter note="The Ownership Lab · Educational tools, no pressure" />
    </>
  );
}
