export type CashPlan = {
  price: number;
  down: number;
  closing: number;
  deposit: number;
  credits: number;
  inspections: number;
  moving: number;
  reserves: number;
  available: number;
};

export const cashDefaults: CashPlan = {
  price: 650_000,
  down: 10,
  closing: 3,
  deposit: 0,
  credits: 0,
  inspections: 750,
  moving: 2_500,
  reserves: 15_000,
  available: 100_000,
};

export function calculateBuyerCash(plan: CashPlan) {
  const downPayment = (plan.price * plan.down) / 100;
  const closingCosts = (plan.price * plan.closing) / 100;
  const appliedCredits = Math.min(plan.credits, closingCosts);
  const settlement = Math.max(0, downPayment + closingCosts - appliedCredits);
  const remainingSettlement = Math.max(0, settlement - plan.deposit);
  const remaining = remainingSettlement + plan.inspections + plan.moving + plan.reserves;

  return {
    downPayment,
    closingCosts,
    appliedCredits,
    settlement,
    remainingSettlement,
    remaining,
    gap: plan.available - remaining,
  };
}

export const buyerPriorities = [
  "Monthly comfort",
  "Location & daily travel",
  "Layout & accessibility",
  "Condition & upkeep",
  "Long-term flexibility",
];

export type HomeRating = {
  name: string;
  ratings: number[];
  checked: boolean[];
  concern: boolean;
  notes: string;
};

export type BuyerFieldbookData = {
  version: 1;
  cash: CashPlan;
  weights: number[];
  homes: HomeRating[];
  completed: boolean[];
};

export const createEmptyHome = (): HomeRating => ({
  name: "",
  ratings: [0, 0, 0, 0, 0],
  checked: [false, false, false],
  concern: false,
  notes: "",
});

export const createBuyerFieldbook = (): BuyerFieldbookData => ({
  version: 1,
  cash: { ...cashDefaults },
  weights: [3, 3, 2, 3, 2],
  homes: [createEmptyHome(), createEmptyHome()],
  completed: Array(18).fill(false),
});

export function rateHome(home: HomeRating, weights: number[]) {
  if (home.ratings.some((rating) => rating === 0)) return null;
  const weighted = home.ratings.reduce(
    (total, rating, index) => total + rating * weights[index],
    0
  );
  return Math.round(weighted / (weights.reduce((sum, value) => sum + value, 0) * 5) * 100);
}

export const buyerChecklist = [
  {
    title: "Set your guardrails",
    items: [
      "Write a comfortable all-in monthly housing budget.",
      "Separate purchase cash from emergency reserves.",
      "List must-haves and reasons you would walk away.",
    ],
  },
  {
    title: "Build your team",
    items: [
      "Compare lender scenarios using the same assumptions.",
      "Discuss representation, services, fees, and agreement terms.",
      "Confirm financing status and document requests with your lender.",
    ],
  },
  {
    title: "Search with a plan",
    items: [
      "Compare homes against the same priorities.",
      "Investigate insurance availability and property-specific costs.",
      "Review condition, disclosures, and questions before an offer.",
    ],
  },
  {
    title: "Shape the offer",
    items: [
      "Review comparable sales and your walk-away number.",
      "Understand contingencies, deposit terms, and potential obligations.",
      "Put every contract deadline on your calendar with your agent.",
    ],
  },
  {
    title: "Verify before committing",
    items: [
      "Review inspection findings with qualified specialists.",
      "Review title, appraisal, insurance, and any HOA documents.",
      "Discuss unresolved risks before changing or removing protections.",
    ],
  },
  {
    title: "Close and settle in",
    items: [
      "Review final closing figures and complete the final walk-through.",
      "Independently verify wire instructions using a trusted known number.",
      "Confirm closing and possession, then save records and plan maintenance.",
    ],
  },
];

export const buyerTerms = [
  ["Preapproval", "A lender’s conditional assessment based on information reviewed. It is not a final loan commitment or a promise that a particular home qualifies.", "What still needs to be verified, and when does this expire?"],
  ["All-in monthly payment", "A planning total that includes principal and interest, property taxes, insurance, possible mortgage insurance, HOA dues, and other property-specific costs. Budget separately for repairs and utilities.", "Which costs are missing from this estimate?"],
  ["Loan Estimate", "A standardized lender disclosure describing estimated loan terms and costs. Compare offers for the same scenario and check each lender’s assumptions and rate-lock status.", "What can change before closing?"],
  ["APR", "Annual percentage rate reflects the interest rate plus certain loan costs. Consider it alongside payment, fees, and how long you expect to keep the loan.", "Are these APRs based on comparable loan terms?"],
  ["Earnest-money deposit", "Money deposited under the purchase contract. It generally counts toward what you owe at closing. Refund rights and risk depend on the contract and whether deadlines are met.", "When is it due, who holds it, and when could it be at risk?"],
  ["Contingency", "A contract condition that may give a way to cancel or seek changes if stated requirements are not met. The wording, deadlines, and notice rules matter.", "What protection does this give me, and what happens if I remove it?"],
  ["Inspection", "An assessment of property condition within an inspector’s scope. It is not a guarantee that every issue will be found. Some concerns need a specialist.", "What was not inspected, and what needs a specialist?"],
  ["Appraisal", "An opinion of value prepared for a specific purpose, often for the lender. It is different from an inspection and does not certify a home’s condition.", "What are my options if value is below the purchase price?"],
  ["Seller credit", "An agreed contribution toward permitted buyer costs. Loan rules and the contract limit how credits can be used. A credit is not unrestricted cash back.", "Has my lender confirmed this credit is allowed and usable?"],
  ["Title & escrow", "Title work examines ownership and recorded interests. Escrow coordinates funds and documents under agreed instructions. Roles and practices vary by location.", "Are there ownership, lien, easement, or instruction issues to resolve?"],
  ["Closing Disclosure", "A final loan disclosure showing loan terms, payments, and closing costs for many mortgages. Compare it with your Loan Estimate and ask your lender about changes.", "Can you walk me through every material change?"],
  ["Buyer representation", "An agreement describing an agent’s role, services, term, and compensation. Read the actual terms and discuss cost and obligations before signing.", "Who pays what, what is negotiable, and how can this agreement end?"],
];

export function restoreBuyerFieldbook(input: unknown): BuyerFieldbookData {
  const invalid = (): never => {
    throw new Error("That is not a compatible Buyer Fieldbook file. Your current work is unchanged.");
  };
  if (!input || typeof input !== "object" || Array.isArray(input)) return invalid();
  const value = input as Record<string, unknown>;
  if (value.version !== 1 || !value.cash || typeof value.cash !== "object") return invalid();

  const cash = {} as CashPlan;
  for (const key of Object.keys(cashDefaults) as (keyof CashPlan)[]) {
    const entry = (value.cash as Record<string, unknown>)[key];
    if (typeof entry !== "number" || !Number.isFinite(entry) || entry < 0 || entry > (key === "down" || key === "closing" ? 100 : 100_000_000)) return invalid();
    cash[key] = entry;
  }
  if (!Array.isArray(value.weights) || value.weights.length !== 5 || !value.weights.every((item) => Number.isInteger(item) && item >= 1 && item <= 3)) return invalid();
  if (!Array.isArray(value.completed) || value.completed.length !== 18 || !value.completed.every((item) => typeof item === "boolean")) return invalid();
  if (!Array.isArray(value.homes) || value.homes.length < 1 || value.homes.length > 3) return invalid();

  const homes = value.homes.map((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return invalid();
    const home = item as Record<string, unknown>;
    if (typeof home.name !== "string" || home.name.length > 100 || typeof home.notes !== "string" || home.notes.length > 1000 || typeof home.concern !== "boolean") return invalid();
    if (!Array.isArray(home.ratings) || home.ratings.length !== 5 || !home.ratings.every((rating) => Number.isInteger(rating) && rating >= 0 && rating <= 5)) return invalid();
    if (!Array.isArray(home.checked) || home.checked.length !== 3 || !home.checked.every((checked) => typeof checked === "boolean")) return invalid();
    return { name: home.name, notes: home.notes, concern: home.concern, ratings: [...home.ratings], checked: [...home.checked] };
  });

  return { version: 1, cash, weights: [...value.weights] as number[], completed: [...value.completed] as boolean[], homes };
}
