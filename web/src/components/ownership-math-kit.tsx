"use client";

import { useMemo, useState } from "react";
import { Calculator, Printer, RotateCcw } from "lucide-react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  help?: string;
};

function NumberField({
  label, value, onChange, min = 0, max, step = 1, suffix, help,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-navy">{label}</span>
      {help && <span className="mt-1 block text-xs leading-relaxed text-slateink">{help}</span>}
      <span className="mt-2 flex overflow-hidden rounded-lg border border-[#d6c9b5] bg-white focus-within:ring-2 focus-within:ring-gold/50">
        <input
          type="number"
          inputMode="decimal"
          className="w-full min-w-0 bg-transparent px-3 py-3 text-base text-navy outline-none"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber;
            if (!Number.isFinite(next)) return;
            onChange(Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.max(min, next)));
          }}
        />
        {suffix && <span className="flex items-center border-l border-[#d6c9b5] px-3 text-sm text-slateink">{suffix}</span>}
      </span>
    </label>
  );
}

export function OwnershipMathKit() {
  const [price, setPrice] = useState(850000);
  const [downPct, setDownPct] = useState(10);
  const [ratePct, setRatePct] = useState(6.5);
  const [years, setYears] = useState(30);
  const [taxPct, setTaxPct] = useState(1.2);
  const [insurance, setInsurance] = useState(200);
  const [hoa, setHoa] = useState(0);
  const [maintenancePct, setMaintenancePct] = useState(1);
  const [pmiPct, setPmiPct] = useState(0.5);
  const [closingPct, setClosingPct] = useState(2.5);
  const [emergency, setEmergency] = useState(15000);

  const result = useMemo(() => {
    const down = price * downPct / 100;
    const loan = Math.max(0, price - down);
    const periods = years * 12;
    const monthlyRate = ratePct / 1200;
    const principalInterest = loan === 0 ? 0 : monthlyRate === 0
      ? loan / periods
      : loan * monthlyRate / (1 - Math.pow(1 + monthlyRate, -periods));
    const taxes = price * taxPct / 1200;
    const reserve = price * maintenancePct / 1200;
    const mortgageInsurance = downPct >= 20 ? 0 : loan * pmiPct / 1200;
    const total = principalInterest + taxes + insurance + hoa + reserve + mortgageInsurance;
    const closing = price * closingPct / 100;
    return {
      down, loan, principalInterest, taxes, reserve, mortgageInsurance,
      total, closing, cashGoal: down + closing + emergency,
    };
  }, [price, downPct, ratePct, years, taxPct, insurance, hoa, maintenancePct, pmiPct, closingPct, emergency]);

  const reset = () => {
    setPrice(850000); setDownPct(10); setRatePct(6.5); setYears(30);
    setTaxPct(1.2); setInsurance(200); setHoa(0); setMaintenancePct(1);
    setPmiPct(0.5); setClosingPct(2.5); setEmergency(15000);
  };

  function printWorksheet() {
    try {
      const dataLayer = (window as Window & { dataLayer?: Record<string, unknown>[] }).dataLayer;
      dataLayer?.push({ event: "ownership_worksheet_print", resource: "buyer_math_kit", market: "91311" });
    } catch { /* tracking is non-essential */ }
    window.print();
  }

  return (
    <section id="ownership-math-kit" className="bg-[#f3eee4] px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">
              <Calculator size={16} aria-hidden="true" /> Free tool 01 · Buyer Math Kit
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-navy md:text-5xl">
              Understand the payment before the showing.
            </h2>
            <p className="mt-4 leading-relaxed text-slateink">
              Change the assumptions to explore a possible ownership budget. Your numbers stay in this browser; this tool does not submit them to Kareem.
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm font-semibold text-navy hover:bg-cream">
              <RotateCcw size={16} aria-hidden="true" /> Reset
            </button>
            <button type="button" onClick={printWorksheet} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-[#183653]">
              <Printer size={16} aria-hidden="true" /> Print / save PDF
            </button>
          </div>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-2xl border border-[#e2d6c4] bg-white p-5 shadow-sm md:p-7">
            <h3 className="font-display text-2xl text-navy">Your assumptions</h3>
            <p className="mt-2 text-sm text-slateink">The example values are hypothetical, not current lender quotes or verified 91311 market averages.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <NumberField label="Home price" value={price} onChange={setPrice} min={1000} step={10000} suffix="$" />
              <NumberField label="Down payment" value={downPct} onChange={setDownPct} min={0} max={100} step={1} suffix="%" />
              <NumberField label="Illustrative mortgage rate" value={ratePct} onChange={setRatePct} min={0} max={30} step={0.125} suffix="%" />
              <NumberField label="Loan term" value={years} onChange={setYears} min={1} max={40} step={1} suffix="years" />
              <NumberField label="Estimated annual property tax" value={taxPct} onChange={setTaxPct} min={0} max={10} step={0.05} suffix="%" />
              <NumberField label="Monthly homeowners insurance" value={insurance} onChange={setInsurance} min={0} step={25} suffix="$" />
              <NumberField label="Monthly HOA dues" value={hoa} onChange={setHoa} min={0} step={25} suffix="$" />
              <NumberField label="Annual maintenance reserve" value={maintenancePct} onChange={setMaintenancePct} min={0} max={20} step={0.25} suffix="% / yr" />
              <NumberField label="Illustrative mortgage insurance" value={pmiPct} onChange={setPmiPct} min={0} max={10} step={0.1} suffix="% / yr" help="Only applied when down payment is under 20%; actual loan rules vary." />
              <NumberField label="Estimated closing costs" value={closingPct} onChange={setClosingPct} min={0} max={20} step={0.25} suffix="%" />
              <NumberField label="Emergency savings to retain" value={emergency} onChange={setEmergency} min={0} step={1000} suffix="$" />
            </div>
          </div>
          <div className="rounded-2xl border border-gold/45 bg-navy p-6 text-cream md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Illustrative monthly cost</p>
            <p className="mt-3 font-display text-5xl font-medium tabular-nums md:text-6xl" aria-live="polite">{money.format(result.total)}</p>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">Estimated principal, interest, property tax, insurance, HOA, mortgage insurance, and a maintenance reserve.</p>
            <dl className="mt-8 space-y-3 border-t border-cream/20 pt-5 text-sm">
              {[
                ["Principal & interest", result.principalInterest],
                ["Property tax", result.taxes],
                ["Homeowners insurance", insurance],
                ["HOA", hoa],
                ["Mortgage insurance", result.mortgageInsurance],
                ["Maintenance reserve", result.reserve],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between gap-4">
                  <dt className="text-cream/75">{label}</dt>
                  <dd className="font-semibold tabular-nums">{money.format(Number(value))}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-7 rounded-xl border border-gold/40 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">Savings target to explore</p>
              <p className="mt-2 font-display text-3xl tabular-nums">{money.format(result.cashGoal)}</p>
              <p className="mt-2 text-xs leading-relaxed text-cream/75">Down payment {money.format(result.down)} + example closing costs {money.format(result.closing)} + emergency reserve {money.format(emergency)}.</p>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-cream/70">
              Not a quote or qualification result. The calculator does not include utilities, moving, special assessments, upfront repairs, financing fees outside the estimate, or tax advice. Get written insurance, tax, loan, and repair estimates before making an offer.
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-4xl text-sm leading-relaxed text-slateink">
          <strong>Decision rule:</strong> Compare this full cost with your take-home budget, existing debts, emergency savings, and likely ownership timeline. A financially comfortable rental can be a better choice than an unaffordable purchase.
        </p>
      </div>
    </section>
  );
}
