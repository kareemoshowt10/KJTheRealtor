"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  buyerNumberDefaults,
  calculateBuyerNumbers,
  type BuyerNumbers,
} from "@/lib/buyer-numbers";

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

type Field = {
  key: keyof BuyerNumbers;
  label: string;
  hint: string;
  prefix?: string;
  suffix?: string;
  step?: number;
};

const homeFields: Field[] = [
  { key: "price", label: "Home price", hint: "A scenario, not a valuation.", prefix: "$", step: 5000 },
  { key: "downPct", label: "Down payment", hint: "Percent of the price.", suffix: "%", step: 0.5 },
  { key: "ratePct", label: "Interest rate", hint: "Example only. Use the rate your lender quotes you.", suffix: "%", step: 0.125 },
  { key: "years", label: "Loan term", hint: "Years.", suffix: "yrs", step: 5 },
  { key: "taxPct", label: "Property tax rate", hint: "California's base is 1% plus local assessments. Check the parcel's actual tax bill.", suffix: "%", step: 0.05 },
  { key: "insuranceYear", label: "Homeowners insurance", hint: "Per year. Get a real quote early — it varies a lot by property.", prefix: "$", step: 100 },
  { key: "hoaMonth", label: "HOA dues", hint: "Per month. Zero if none.", prefix: "$", step: 25 },
  { key: "pmiPct", label: "Mortgage insurance", hint: "Annual % of the loan, only under 20% down. Placeholder — your lender sets this.", suffix: "%", step: 0.05 },
];

const incomeFields: Field[] = [
  { key: "incomeYear", label: "Household income", hint: "Gross, per year, before taxes.", prefix: "$", step: 1000 },
  { key: "debtsMonth", label: "Monthly debt payments", hint: "Car, student loans, card minimums. Not rent.", prefix: "$", step: 50 },
  { key: "dtiTargetPct", label: "Your comfort ceiling", hint: "Total debt ÷ gross income. Your setting — lenders apply their own limits.", suffix: "%", step: 1 },
];

function NumberField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: number;
  onChange: (v: number) => void;
}) {
  const id = `rn-${field.key}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        {field.label}
      </label>
      <div className="mt-1.5 flex items-center rounded-md border border-[#e3d8c7] bg-white focus-within:border-gold-deep focus-within:ring-2 focus-within:ring-gold/35">
        {field.prefix && <span className="pl-3 text-sm text-slateink">{field.prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={field.step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full bg-transparent px-3 py-2.5 text-base text-navy outline-none"
          aria-describedby={`${id}-hint`}
        />
        {field.suffix && <span className="pr-3 text-sm text-slateink">{field.suffix}</span>}
      </div>
      <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-slateink/80">
        {field.hint}
      </p>
    </div>
  );
}

export function RealNumber() {
  const [v, setV] = useState<BuyerNumbers>(buyerNumberDefaults);
  const r = useMemo(() => calculateBuyerNumbers(v), [v]);
  const set = (key: keyof BuyerNumbers) => (n: number) => setV((c) => ({ ...c, [key]: n }));

  const sendToForm = () => {
    const message = `I ran my numbers on /buy: about ${usd(v.price)} with ${v.downPct}% down, an estimated ${usd(r.housing)}/month all-in. I'd like a 20-minute consult to pressure-test that number.`;
    window.dispatchEvent(new CustomEvent("kj:lead-message", { detail: { message } }));
    document.getElementById("consult")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const rows: [string, number][] = [
    ["Principal & interest", r.pi],
    ["Property tax", r.tax],
    ["Insurance", r.insurance],
    ["HOA", r.hoa],
    ["Mortgage insurance", r.pmi],
  ];

  return (
    <section id="numbers" className="scroll-mt-20 bg-paper px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">Step one · your real number</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight md:text-5xl">
          The list price isn&apos;t your number. The monthly payment is.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-slateink">
          Plug in your own figures. Everything stays in your browser — nothing is sent anywhere unless
          you choose to send it to me.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-8">
            <fieldset className="rounded-xl border border-navy/15 bg-white p-5 md:p-7">
              <legend className="px-2 font-display text-xl text-navy">The home</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                {homeFields.map((f) => (
                  <NumberField key={f.key} field={f} value={v[f.key]} onChange={set(f.key)} />
                ))}
              </div>
            </fieldset>
            <fieldset className="rounded-xl border border-navy/15 bg-white p-5 md:p-7">
              <legend className="px-2 font-display text-xl text-navy">Your side of the math</legend>
              <div className="grid gap-5 sm:grid-cols-3">
                {incomeFields.map((f) => (
                  <NumberField key={f.key} field={f} value={v[f.key]} onChange={set(f.key)} />
                ))}
              </div>
            </fieldset>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-live="polite">
            <div className="rounded-xl bg-navy p-6 text-cream md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-light">Estimated monthly, all-in</p>
              <p className="mt-2 font-display text-5xl font-medium">{usd(r.housing)}</p>
              <dl className="mt-6 space-y-2 border-t border-cream/15 pt-5 text-sm">
                {rows.map(([label, n]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-cream/70">{label}</dt>
                    <dd className="font-semibold tabular-nums">{usd(n)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-cream/15 pt-3">
                  <dt className="text-cream/70">Down payment</dt>
                  <dd className="font-semibold tabular-nums">{usd(r.downPayment)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-cream/70">Loan amount</dt>
                  <dd className="font-semibold tabular-nums">{usd(r.loan)}</dd>
                </div>
              </dl>
              <div className="mt-6 rounded-lg border border-cream/15 p-4 text-sm">
                {r.dti === null ? (
                  <p className="text-cream/75">Add your income to see how this payment fits.</p>
                ) : (
                  <>
                    <p className="font-semibold">
                      Debt-to-income: {r.dti.toFixed(1)}%{" "}
                      <span className="font-normal text-cream/70">(your ceiling: {v.dtiTargetPct}%)</span>
                    </p>
                    <p className="mt-1 text-cream/75">
                      {r.withinTarget
                        ? `About ${usd(r.room)}/month under the ceiling you set.`
                        : `About ${usd(-r.room)}/month over the ceiling you set.`}
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={sendToForm}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-semibold text-navy transition hover:bg-gold-light"
              >
                Pressure-test this with me <ArrowRight size={16} aria-hidden />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slateink">
              Estimate only, for education. Not a loan offer, pre-approval, or lending advice. Your
              lender&apos;s Loan Estimate is the number that counts. Want the full cash-to-close picture?{" "}
              <a href="/buyer-fieldbook" className="font-semibold underline decoration-gold underline-offset-4">
                Open the Buyer Fieldbook
              </a>
              .
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
