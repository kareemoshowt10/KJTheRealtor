"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Check, Download, Printer, Upload } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import styles from "@/components/buyer-fieldbook.module.css";
import {
  buyerChecklist,
  buyerPriorities,
  buyerTerms,
  calculateBuyerCash,
  createBuyerFieldbook,
  createEmptyHome,
  rateHome,
  restoreBuyerFieldbook,
  type BuyerFieldbookData,
  type HomeRating,
} from "@/lib/buyer-fieldbook";

const tools = ["Plan your cash", "Compare homes", "Track your steps", "Know the language"];
const currency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

export function BuyerFieldbook() {
  const [data, setData] = useState<BuyerFieldbookData>(createBuyerFieldbook);
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [changed, setChanged] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cash = calculateBuyerCash(data.cash);
  const checkedCount = data.completed.filter(Boolean).length;
  const allSteps = buyerChecklist.flatMap((group) => group.items);
  const nextStep = allSteps.find((_, index) => !data.completed[index]);

  const updateHome = (index: number, changes: Partial<HomeRating>) => {
    setData((current) => ({ ...current, homes: current.homes.map((home, i) => i === index ? { ...home, ...changes } : home) }));
    setChanged(true);
  };

  const saveCopy = () => {
    const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "my-homebuyer-fieldbook.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setChanged(false);
    setStatus("A saved copy was requested. Keep that file private. You can reopen it here later.");
  };

  const openCopy = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 250_000) throw new Error("Choose a Fieldbook file smaller than 250 KB.");
      const restored = restoreBuyerFieldbook(JSON.parse(await file.text()));
      if (changed && !window.confirm("Replace your unsaved Fieldbook with this saved copy?")) return;
      setData(restored);
      setChanged(false);
      setStatus("Saved copy opened. Its details stayed on this device.");
    } catch (error) {
      setStatus(error instanceof SyntaxError ? "That file could not be read. Choose a saved Fieldbook JSON file." : error instanceof Error ? error.message : "Unable to open that file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const prepareQuestion = () => {
    const compared = data.homes.filter((home) => home.name.trim()).length;
    const message = `I am using Kareem's Homebuyer Fieldbook. I would like help with ${tools[selected].toLowerCase()}. I have checked ${checkedCount} of 18 planning steps${compared ? ` and started comparing ${compared} home${compared === 1 ? "" : "s"}` : ""}. ${nextStep ? `My next unchecked step is: ${nextStep}` : "I would like to review the next move."} Please help me make a plan for my situation.`;
    window.dispatchEvent(new CustomEvent("kj:lead-message", { detail: { message } }));
    document.getElementById("buyer-contact")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <main className={`${styles.page} min-h-screen bg-paper text-navy`}>
      <a href="#fieldbook" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-navy focus:p-4 focus:text-cream">Skip to the homebuyer tools</a>
      <section className="relative overflow-hidden bg-navy px-5 py-16 text-cream md:py-24">
        <div className="pointer-events-none absolute -right-36 -top-48 h-[36rem] w-[36rem] rounded-full border border-gold/20" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-light">First home · Next home · Your home</p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-medium leading-[1.04] tracking-tight md:text-7xl">Make the move.<br /><em className="font-normal text-gold-light">Keep your bearings.</em></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">A free working notebook for the decisions between “maybe” and moving day. Use as much or as little as you need. No sign-up.</p>
            <a href="#fieldbook" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-gold px-5 py-3 font-semibold text-navy hover:bg-gold-light">Open my Buyer Fieldbook <ArrowDown size={17} /></a>
            <p className="mt-4 text-sm text-cream/55">For first-time buyers, growing households, relocations, and the next chapter.</p>
          </div>
          <div className="border-l border-gold/35 pl-6 md:pl-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Four clear places to start</p>
            {tools.map((tool, index) => <a key={tool} href="#fieldbook" onClick={() => setSelected(index)} className="flex items-center gap-4 border-b border-cream/15 py-4 text-base text-cream/90 hover:text-gold-light"><span className="font-display text-2xl text-gold">0{index + 1}</span>{tool}<ArrowRight size={15} className="ml-auto" /></a>)}
          </div>
        </div>
      </section>

      <section id="fieldbook" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 md:px-8 md:py-20">
        <div className="mb-8 flex flex-col gap-6 border-b border-navy/15 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-deep">Your private workspace</p><h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">Clarity, one decision at a time.</h2><p className="mt-3 max-w-2xl leading-relaxed text-slateink">Your work stays in this browser tab. Save a copy before you close or leave this page.</p></div>
          <div className={`${styles.saveControls} flex flex-wrap gap-2 print:hidden`}>
            <button type="button" onClick={saveCopy} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-navy/90"><Download size={16} /> Save a copy</button>
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy/25 px-4 py-2 text-sm font-semibold hover:bg-muted"><Upload size={16} /> Open saved copy</button>
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy/25 px-4 py-2 text-sm font-semibold hover:bg-muted"><Printer size={16} /> Print / PDF</button>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => void openCopy(event.target.files?.[0])} aria-label="Open a saved Buyer Fieldbook file" />
          </div>
        </div>
        {status && <p role="status" className="mb-5 border-l-4 border-gold bg-muted px-4 py-3 text-sm">{status}</p>}
        {changed && <p className="mb-4 text-sm font-medium text-gold-deep">Changes to your Fieldbook need a saved copy.</p>}

        <nav aria-label="Buyer Fieldbook tools" className="mb-7 grid grid-cols-2 overflow-hidden rounded-lg border border-navy/15 bg-cream md:grid-cols-4 print:hidden">
          {tools.map((tool, index) => <button key={tool} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`min-h-[4.5rem] border-b border-r border-navy/10 px-3 py-3 text-left text-sm font-semibold transition md:border-b-0 ${selected === index ? "bg-navy text-cream" : "hover:bg-muted"}`}><span className={`mr-2 font-display text-lg ${selected === index ? "text-gold-light" : "text-gold-deep"}`}>0{index + 1}</span>{tool}</button>)}
        </nav>

        <section hidden={selected !== 0} className={styles.toolPanel} aria-labelledby="cash-plan-title">
          <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">01 / Know your cash</p><h3 id="cash-plan-title" className="mt-2 font-display text-3xl md:text-4xl">The price is only part of the plan.</h3><p className="mt-3 text-slateink">These are editable examples. Replace them with your own estimates.</p><Link href="/wealth-tools" className="mt-2 inline-block text-sm font-semibold underline decoration-gold underline-offset-4">Explore more planning tools</Link></div>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              {([
                ["price", "Purchase price", "Planning scenario, not a valuation."],
                ["down", "Down payment %", "Set to 100 for a cash purchase."],
                ["closing", "Closing cost estimate %", "Placeholder, not a quote. Replace with an itemized estimate."],
                ["credits", "Permitted closing credits", "Confirm with your lender and settlement provider."],
                ["deposit", "Deposit already paid", "Counts toward settlement; not added twice."],
                ["inspections", "Future inspections & specialists", "Include only costs not already paid."],
                ["moving", "Moving & immediate work", "Avoid counting the same expense twice."],
                ["reserves", "Cash to keep after the move", "Your chosen cushion, not a lender requirement."],
                ["available", "Cash available now", "Exclude the deposit already paid and inaccessible funds."],
              ] as const).map(([key, label, note]) => <div key={key} className="block text-sm font-semibold"><label htmlFor={`buyer-cash-${key}`}>{label}</label><div className="mt-2 flex items-center rounded-md border border-navy/20 bg-white focus-within:ring-2 focus-within:ring-gold"><span aria-hidden="true" className="pl-3 text-slateink">{key === "down" || key === "closing" ? "%" : "$"}</span><input id={`buyer-cash-${key}`} type="number" min="0" max={key === "down" || key === "closing" ? 100 : 100_000_000} step={key === "down" || key === "closing" ? 0.1 : 1} aria-describedby={`buyer-cash-${key}-hint`} value={data.cash[key]} onChange={(event) => { const number = Math.min(key === "down" || key === "closing" ? 100 : 100_000_000, Math.max(0, Number(event.target.value) || 0)); setData((current) => ({ ...current, cash: { ...current.cash, [key]: number } })); setChanged(true); }} className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-3 text-base outline-none" /></div><span id={`buyer-cash-${key}-hint`} className="mt-1 block text-xs font-normal leading-relaxed text-slateink">{note}</span></div>)}
            </div>
            <aside aria-label="Estimated cash plan" className={`${styles.cashSummary} h-fit rounded-lg bg-navy p-6 text-cream md:p-8`}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Estimated cash needed from now</p><p className="mt-3 font-display text-5xl font-medium">{currency(cash.remaining)}</p><p className="mt-2 text-sm leading-relaxed text-cream/65">Includes your chosen cushion. Not loan approval or an affordability finding.</p>
              <dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt>Down payment</dt><dd>{currency(cash.downPayment)}</dd></div><div className="flex justify-between gap-4"><dt>Estimated closing costs</dt><dd>{currency(cash.closingCosts)}</dd></div><div className="flex justify-between gap-4"><dt>Credits used toward costs</dt><dd>−{currency(cash.appliedCredits)}</dd></div><div className="flex justify-between gap-4"><dt>Deposit already paid</dt><dd>−{currency(Math.min(data.cash.deposit, cash.settlement))}</dd></div><div className="flex justify-between gap-4 border-y border-cream/20 py-3 font-semibold"><dt>Still due at settlement</dt><dd>{currency(cash.remainingSettlement)}</dd></div><div className="flex justify-between gap-4"><dt>Future inspections & move</dt><dd>{currency(data.cash.inspections + data.cash.moving)}</dd></div><div className="flex justify-between gap-4"><dt>Cash to keep</dt><dd>{currency(data.cash.reserves)}</dd></div></dl>
              <div className="mt-6 rounded-md border border-cream/20 bg-cream/5 p-4"><strong className="text-gold-light">{currency(Math.abs(cash.gap))} {cash.gap < 0 ? "planning gap" : "above this estimate"}</strong><p className="mt-2 text-xs leading-relaxed text-cream/70">Recheck your assumptions with a lender. Credits are limited. This tool does not estimate every cost.</p></div>
              {data.cash.credits > cash.closingCosts && <p className="mt-4 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">Credits above estimated closing costs are not applied here. Ask your lender what is permitted.</p>}
              {data.cash.deposit > cash.settlement && <p className="mt-4 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">Your deposit is larger than this estimate of settlement funds. Confirm how escrow will handle the difference.</p>}
            </aside>
          </div>
          <p className="mt-7 border-t border-navy/10 pt-5 text-xs leading-relaxed text-slateink">Planning only. Closing costs may include lender fees, taxes, prepaid insurance, escrow deposits, and agreed representation costs. Get an itemized estimate from your lender or settlement provider.</p>
        </section>

        <section hidden={selected !== 1} className={styles.toolPanel} aria-labelledby="compare-title">
          <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">02 / Compare what matters</p><h3 id="compare-title" className="mt-2 font-display text-3xl md:text-4xl">Let your priorities do the talking.</h3><p className="mt-3 text-slateink">Set importance once. Rate each home the same way. Unknowns stay visible.</p></div>
          <fieldset className="mb-7 grid gap-4 rounded-lg border border-gold/40 bg-cream p-5 sm:grid-cols-2 lg:grid-cols-5"><legend className="px-2 font-semibold">How important is each priority to you?</legend>{buyerPriorities.map((priority, index) => <label key={priority} className="text-sm">{priority}<select value={data.weights[index]} onChange={(event) => { setData((current) => ({ ...current, weights: current.weights.map((weight, i) => i === index ? Number(event.target.value) : weight) })); setChanged(true); }} className="mt-2 w-full rounded-md border border-navy/20 bg-white p-2.5"><option value={1}>1 · Matters</option><option value={2}>2 · Important</option><option value={3}>3 · Essential</option></select></label>)}</fieldset>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.homes.map((home, homeIndex) => {
            const score = rateHome(home, data.weights);
            return <article key={homeIndex} className="rounded-lg border border-navy/15 bg-white p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">Home 0{homeIndex + 1}</p><label className="mt-4 block text-sm font-semibold">Give this home a nickname<input maxLength={100} value={home.name} onChange={(event) => updateHome(homeIndex, { name: event.target.value })} placeholder={homeIndex === 0 ? "The sunny kitchen" : "Close to my commute"} className="mt-2 w-full rounded-md border border-navy/20 px-3 py-3" /></label><div className="my-5 flex items-center gap-3 border-y border-navy/10 py-4"><strong className="font-display text-4xl text-gold-deep">{score === null ? "—" : `${score}%`}</strong><span className="max-w-28 text-xs text-slateink">{score === null ? "Rate all five to see fit" : "Your weighted fit"}</span></div>{buyerPriorities.map((priority, index) => <label key={priority} className="mb-3 block text-xs font-semibold">{priority}<select aria-label={`Home 0${homeIndex + 1}, ${priority} rating`} value={home.ratings[index]} onChange={(event) => updateHome(homeIndex, { ratings: home.ratings.map((value, i) => i === index ? Number(event.target.value) : value) })} className="mt-1.5 w-full rounded-md border border-navy/20 bg-white px-3 py-2.5 text-sm"><option value={0}>Not yet rated</option><option value={1}>1 · Poor fit</option><option value={2}>2 · Compromise</option><option value={3}>3 · Works</option><option value={4}>4 · Strong fit</option><option value={5}>5 · Ideal fit</option></select></label>)}<fieldset className="mt-6 border-t border-navy/10 pt-4"><legend className="text-sm font-semibold">Evidence checked</legend>{["All-in monthly cost", "Insurance availability & cost", "Condition & specialist findings"].map((label, index) => <label key={label} className="mt-3 flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" checked={home.checked[index]} onChange={(event) => updateHome(homeIndex, { checked: home.checked.map((value, i) => i === index ? event.target.checked : value) })} className="mt-0.5 accent-navy" />{label}</label>)}</fieldset><label className="mt-4 flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" checked={home.concern} onChange={(event) => updateHome(homeIndex, { concern: event.target.checked })} className="mt-0.5 accent-navy" />A must-have or walk-away concern remains</label><p role="status" className={`mt-3 rounded-md p-3 text-xs leading-relaxed ${home.concern ? "bg-amber-50 text-amber-950" : "bg-muted text-slateink"}`}>{home.concern ? "Pause and resolve the concern. A high score does not override your boundaries." : home.checked.every(Boolean) ? "Checks marked complete. Confirm details with your team." : "Open questions remain. This score is not a buying recommendation."}</p><label className="mt-4 block text-sm font-semibold">What should we ask or verify?<textarea rows={3} maxLength={1000} value={home.notes} onChange={(event) => updateHome(homeIndex, { notes: event.target.value })} className="mt-2 w-full rounded-md border border-navy/20 p-3 text-sm" /></label></article>;
          })}</div>
          {data.homes.length < 3 && <button type="button" onClick={() => { setData((current) => ({ ...current, homes: [...current.homes, createEmptyHome()] })); setChanged(true); }} className="mt-5 min-h-11 rounded-md border border-navy/25 px-4 py-2 text-sm font-semibold hover:bg-muted">Add a third home</button>}
          <p className="mt-6 border-t border-navy/10 pt-5 text-xs leading-relaxed text-slateink">Fit is calculated from your ratings and weights. It is not an appraisal, safety assessment, area ranking, or substitute for professional due diligence.</p>
        </section>

        <section id="buying-steps" hidden={selected !== 2} className={`${styles.toolPanel} scroll-mt-24`} aria-labelledby="steps-title">
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">03 / One clear next step</p><h3 id="steps-title" className="mt-2 font-display text-3xl md:text-4xl">A little less to keep in your head.</h3><p className="mt-3 text-slateink">Your actual contract and local requirements set your deadlines.</p></div><div className="min-w-40"><strong className="font-display text-3xl">{checkedCount}<span className="text-slateink"> / 18</span></strong><p className="text-xs">steps checked</p><progress max={18} value={checkedCount} aria-label="Buyer checklist progress" className="mt-2 w-full accent-gold" /></div></div>
          <div className="mb-6 rounded-lg bg-navy p-5 text-cream"><span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-light">Next unchecked step</span><p className="mt-2 font-semibold leading-relaxed">{nextStep || "Your checklist is complete. Review open questions with your team."}</p></div>
          <div className="grid gap-4 md:grid-cols-2">{buyerChecklist.map((group, groupIndex) => <fieldset key={group.title} className="rounded-lg border border-navy/15 bg-white p-5"><legend className="px-2 font-display text-xl"><span className="mr-2 text-gold-deep">0{groupIndex + 1}</span>{group.title}</legend>{group.items.map((item, itemIndex) => { const index = groupIndex * 3 + itemIndex; return <label key={item} className="mt-4 flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" checked={data.completed[index]} onChange={(event) => { setData((current) => ({ ...current, completed: current.completed.map((value, i) => i === index ? event.target.checked : value) })); setChanged(true); }} className="mt-1 accent-navy" /><span className={data.completed[index] ? "text-slateink line-through" : ""}>{item}</span></label>; })}</fieldset>)}</div>
        </section>

        <section id="buyer-terms" hidden={selected !== 3} className={`${styles.toolPanel} scroll-mt-24`} aria-labelledby="terms-title">
          <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">04 / No jargon required</p><h3 id="terms-title" className="mt-2 font-display text-3xl md:text-4xl">Know the words. Ask better questions.</h3><p className="mt-3 text-slateink">Plain-English starting points to use with your team.</p></div><label className="block min-w-64 text-sm font-semibold">Find a term<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="deposit, credit, appraisal…" className="mt-2 w-full rounded-md border border-navy/20 bg-white px-3 py-3" /></label></div>
          <div className="grid gap-4 md:grid-cols-2">{buyerTerms.filter((term) => term.join(" ").toLowerCase().includes(query.toLowerCase())).map(([name, meaning, question]) => <article key={name} className="rounded-lg border border-navy/15 bg-white p-5 md:p-6"><BookOpen size={20} className="text-gold-deep" aria-hidden="true" /><h4 className="mt-3 font-display text-2xl">{name}</h4><p className="mt-2 text-sm leading-relaxed text-slateink">{meaning}</p><div className="mt-4 bg-paper p-4"><span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-gold-deep">Ask your team</span><p className="mt-2 text-sm leading-relaxed">“{question}”</p></div></article>)}</div>
          {!buyerTerms.some((term) => term.join(" ").toLowerCase().includes(query.toLowerCase())) && <p>No matching term yet. Try another word.</p>}
          <p className="mt-6 text-xs leading-relaxed text-slateink">General educational explanations. Programs, contracts, and local requirements differ. Start with the <a href="https://www.consumerfinance.gov/owning-a-home/" target="_blank" rel="noreferrer" className="underline">CFPB’s homebuying resources</a> and confirm details with qualified professionals.</p>
        </section>

        <section className={`${styles.contactPrompt} mt-10 grid gap-5 rounded-xl border border-gold/40 bg-[#f2ecdf] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-9 print:hidden`}><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">Tools help you get oriented.</p><h3 className="mt-2 font-display text-3xl">A person can help with your situation.</h3><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slateink">Ask Kareem to make sense of a number, a comparison, or the next step. Only a short progress summary is prepared for the form. Dollar amounts, home names, and your private notes stay out unless you add them.</p></div><button type="button" onClick={prepareQuestion} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-navy px-5 py-3 font-semibold text-cream hover:bg-navy/90">Prepare my question <ArrowRight size={17} /></button></section>
      </section>

      <section id="buyer-contact" className="scroll-mt-20 bg-navy px-5 py-16 text-cream md:py-24 print:hidden"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Your homebuying plan</p><h2 className="mt-3 font-display text-4xl md:text-5xl">Your next chapter starts with a good question.</h2><p className="mt-5 max-w-lg leading-relaxed text-cream/75">First home, more room, new city, or a buy-and-sell at once. Start with what is important to you.</p><ul className="mt-7 space-y-3 text-sm text-cream/80">{["Clarify the decision in front of you.", "Identify questions for your lender and team.", "Outline a practical next move."].map((item) => <li key={item} className="flex gap-3"><Check size={18} className="shrink-0 text-gold-light" />{item}</li>)}</ul><p className="mt-8 border-t border-cream/20 pt-5 text-sm text-cream/60">Kareem Jamal · Rodeo Realty Fine Estates<br />CA DRE #01998956</p></div><LeadForm title="The first conversation" subtitle="One personal reply. No mailing list." subject="Buyer Fieldbook question — Kareem Jamal" source="web hybrid /buyer-fieldbook" chips={[{label:"First home",fill:"I am considering buying my first home. I would like a clear starting plan."},{label:"Moving up",fill:"I am thinking about moving up to another home. I would like to talk through timing and trade-offs."},{label:"Relocation",fill:"I am planning a move to Southern California. I would like help understanding the homebuying process and local areas."},{label:"Buying and selling",fill:"I may need to sell a home and buy another. I would like a coordinated plan."}]} chipsLabel="Common starting points — tap to add yours" messageLabel="What would help you decide?" messagePlaceholder="Question, timing, area you are considering…" showPhone /></div></section>
    </main>
  );
}
