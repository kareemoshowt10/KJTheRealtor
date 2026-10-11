/**
 * "Your real number" math for /buy.
 *
 * Every default here is an editable placeholder, not a market claim. The UI
 * labels them that way. Lenders set their own limits; the debt-to-income
 * target is the buyer's own comfort setting, not a qualification rule.
 */
export type BuyerNumbers = {
  price: number;
  downPct: number;
  ratePct: number;
  years: number;
  taxPct: number;
  insuranceYear: number;
  hoaMonth: number;
  /** Only applied when down payment is under 20%. Placeholder annual % of loan. */
  pmiPct: number;
  incomeYear: number;
  debtsMonth: number;
  /** Buyer's chosen ceiling for total monthly debt ÷ gross monthly income. */
  dtiTargetPct: number;
};

export const buyerNumberDefaults: BuyerNumbers = {
  price: 750_000,
  downPct: 10,
  ratePct: 6.5,
  years: 30,
  taxPct: 1.2,
  insuranceYear: 2_400,
  hoaMonth: 0,
  pmiPct: 0.5,
  incomeYear: 160_000,
  debtsMonth: 600,
  dtiTargetPct: 40,
};

const clamp = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

/** Standard amortized principal + interest payment. */
export function principalAndInterest(loan: number, ratePct: number, years: number) {
  const n = Math.round(clamp(years, 1, 40) * 12);
  const r = clamp(ratePct, 0, 25) / 100 / 12;
  if (loan <= 0) return 0;
  if (r === 0) return loan / n;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

export function calculateBuyerNumbers(input: BuyerNumbers) {
  const price = clamp(input.price, 0, 50_000_000);
  const downPct = clamp(input.downPct, 0, 100);
  const downPayment = (price * downPct) / 100;
  const loan = Math.max(0, price - downPayment);

  const pi = principalAndInterest(loan, input.ratePct, input.years);
  const tax = (price * clamp(input.taxPct, 0, 5)) / 100 / 12;
  const insurance = clamp(input.insuranceYear, 0, 1_000_000) / 12;
  const hoa = clamp(input.hoaMonth, 0, 100_000);
  const pmi = downPct < 20 ? (loan * clamp(input.pmiPct, 0, 5)) / 100 / 12 : 0;
  const housing = pi + tax + insurance + hoa + pmi;

  const grossMonth = clamp(input.incomeYear, 0, 100_000_000) / 12;
  const debts = clamp(input.debtsMonth, 0, 10_000_000);
  const dti = grossMonth > 0 ? ((housing + debts) / grossMonth) * 100 : null;
  const ceiling = (grossMonth * clamp(input.dtiTargetPct, 0, 100)) / 100;
  const room = ceiling - debts - housing;

  return {
    downPayment,
    loan,
    pi,
    tax,
    insurance,
    hoa,
    pmi,
    housing,
    dti,
    /** Positive = under your chosen ceiling by this much per month. */
    room,
    withinTarget: dti !== null && dti <= input.dtiTargetPct,
  };
}
