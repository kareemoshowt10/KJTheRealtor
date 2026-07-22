import Link from "next/link";

export function SiteFooter({
  note = "Kitchen-table real estate strategy",
}: {
  note?: string;
}) {
  return (
    <footer className="border-t border-gold/25 bg-[#081630] py-10 text-cream/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg text-cream">Kareem Jamal</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed">
            Raised in Chatsworth &amp; West Hills. Kitchen-table strategy for
            Southern California families.
          </p>
          <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold">
            Rodeo Realty Fine Estates · CA DRE #01998956
          </p>
          <p className="mt-2 text-[0.7rem] text-cream/50">
            Equal Housing Opportunity
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold">
              Zip codes
            </p>
            <Link href="/91311" className="block py-1 hover:text-gold-light">
              91311 · Chatsworth
            </Link>
            <a
              href="https://kareemjamaltherealtor.com/93063"
              className="block py-1 hover:text-gold-light"
            >
              93063 · East Simi
            </a>
            <a
              href="https://kareemjamaltherealtor.com/91304"
              className="block py-1 hover:text-gold-light"
            >
              91304 · West Hills
            </a>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold">
              Families
            </p>
            <a
              href="https://kareemjamaltherealtor.com/family-wealth-preservation"
              className="block py-1 hover:text-gold-light"
            >
              Prop 19 · wealth
            </a>
            <a
              href="https://kareemjamaltherealtor.com/living-trust-guide"
              className="block py-1 hover:text-gold-light"
            >
              Living trust
            </a>
            <a
              href="https://kareemjamaltherealtor.com/91311/home-value"
              className="block py-1 hover:text-gold-light"
            >
              Equity Snapshot
            </a>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold">
              Direct
            </p>
            <a href="tel:+18184027326" className="block py-1 hover:text-gold-light">
              (818) 402-7326
            </a>
            <a
              href="mailto:kjamal@rodeore.com"
              className="block py-1 hover:text-gold-light"
            >
              kjamal@rodeore.com
            </a>
            <Link href="/privacy" className="block py-1 hover:text-gold-light">
              Privacy
            </Link>
            <a
              href="https://kareemjamaltherealtor.com/"
              className="block py-1 text-gold-light hover:underline"
            >
              Full site library →
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl space-y-2 border-t border-cream/10 px-5 pt-5 text-xs leading-relaxed text-cream/45 md:px-8">
        <p>
          © {new Date().getFullYear()} Kareem Jamal · Rodeo Realty Fine Estates ·
          CA DRE #01998956 · Equal Housing Opportunity
        </p>
        <p>
          Educational content only — not legal, tax, financial, or lending advice.
          Agency representation begins under a written agreement with the
          brokerage. Zoning, Prop 19, and market examples are general; verify
          parcel-level facts with licensed professionals.
        </p>
        <p className="text-cream/35">{note}</p>
      </div>
    </footer>
  );
}
