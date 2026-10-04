"use client";

import { useState } from "react";
import { ArrowDown, ArrowUpRight, Car, Fuel, HeartHandshake, MapPin, Download, Printer } from "lucide-react";
import { blankOption, calculate, defaultSettings, type Factor, type Option, type Settings } from "@/lib/commute";
import styles from "./commute-check.module.css";

const factors: { key: Factor; title: string; low: string; high: string }[] = [
  { key: "driving", title: "Driving", low: "Draining", high: "Enjoyable" },
  { key: "fuel", title: "Vehicle & fuel", low: "Unmanageable", high: "Comfortable" },
  { key: "family", title: "Family support", low: "Much harder", high: "Works well" },
  { key: "access", title: "Everyday access", low: "Important gaps", high: "Needs met" },
];
const money = (n: number | null) => n === null ? "Add your numbers" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const number = (n: number | null, unit = "") => n === null ? "Add your numbers" : `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n)}${unit}`;

function Numeric({ label, value, onChange, suffix, min = 0, max, hint }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; min?: number; max?: number; hint?: string }) {
  return <label className={styles.field}><span>{label}</span><div className={styles.inputWrap}><input type="number" inputMode="decimal" min={min} max={max} step="any" value={value} onChange={e => onChange(e.target.value)} placeholder="—" />{suffix && <span>{suffix}</span>}</div>{hint && <small>{hint}</small>}</label>;
}

function Rating({ label, value, onChange, low, high }: { label: string; value: string; onChange: (v: string) => void; low: string; high: string }) {
  return <label className={styles.field}><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}><option value="">Not rated yet</option><option value="1">1 — {low}</option><option value="2">2 — Some difficulty</option><option value="3">3 — Workable tradeoff</option><option value="4">4 — Fits well</option><option value="5">5 — {high}</option></select><small>1 = {low.toLowerCase()} · 5 = {high.toLowerCase()}</small></label>;
}

export function CommuteCheck() {
  const [options, setOptions] = useState<Option[]>([blankOption("Option A"), blankOption("Option B")]);
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings, weights: { ...defaultSettings.weights } });
  const [enjoyment, setEnjoyment] = useState("");
  const [familyNotes, setFamilyNotes] = useState("");
  const [accessNotes, setAccessNotes] = useState("");
  const [example, setExample] = useState(false);
  const [feedback, setFeedback] = useState("");
  const results = options.map(o => calculate(o, settings));
  const update = (i: number, key: keyof Option, value: string) => setOptions(prev => prev.map((o, j) => i === j ? { ...o, [key]: value } : o));
  const setting = (key: keyof Settings, value: string | boolean) => setSettings(prev => ({ ...prev, [key]: value }));
  const rate = (i: number, key: Factor, value: string) => setOptions(prev => prev.map((o, j) => i === j ? { ...o, ratings: { ...o.ratings, [key]: value } } : o));
  const name = (i: number) => options[i].name.trim() || `Option ${i === 0 ? "A" : "B"}`;
  const difference = (key: "monthlyTotal" | "fuel" | "highFuel" | "annualHours") => results[0][key] === null || results[1][key] === null ? null : results[0][key]! - results[1][key]!;
  const net = difference("monthlyTotal");
  const extraHours = difference("annualHours");
  const bothFit = results.every(r => r.fit !== null);
  const mustHaves = results.some(r => r.failed.length || r.pending.length);
  const deltaFit = bothFit ? results[0].fit! - results[1].fit! : null;
  const fitLead = deltaFit === null || Math.abs(deltaFit) < 0.2 ? null : deltaFit > 0 ? 0 : 1;
  const lowerHighGas = settings.gas !== "" && settings.highGas !== "" && Number(settings.highGas) < Number(settings.gas);
  const lowerHighElectricity = settings.electricity !== "" && settings.highElectricity !== "" && Number(settings.highElectricity) < Number(settings.electricity);

  function loadExample() {
    setOptions([
      { ...blankOption("Palmdale (example)"), miles: "50", minutes: "65", busyMinutes: "90", days: "3", housing: "2900", other: "150", efficiency: "30", ratings: { driving: "3", fuel: "4", family: "2", access: "3" }, support: "unknown", essentials: "unknown" },
      { ...blankOption("Sylmar (example)"), miles: "15", minutes: "25", busyMinutes: "40", days: "3", housing: "3600", other: "50", efficiency: "30", ratings: { driving: "4", fuel: "5", family: "5", access: "4" }, support: "unknown", essentials: "unknown" },
    ]);
    setSettings({ ...defaultSettings, weeks: "48", gas: "5", highGas: "7", weights: { driving: "3", fuel: "3", family: "5", access: "3" } });
    setEnjoyment("3"); setExample(true); setFeedback("");
  }

  function reset() {
    setOptions([blankOption("Option A"), blankOption("Option B")]); setSettings({ ...defaultSettings, weights: { ...defaultSettings.weights } });
    setEnjoyment(""); setFamilyNotes(""); setAccessNotes(""); setExample(false); setFeedback("Cleared. Start a new comparison.");
  }

  function summary() {
    return ["MY COMMUTE & COMMUNITY COMPARISON", "Kareem Jamal | kareemjamaltherealtor.com/commute-check", example ? "Started from an illustrative example. Values need verification." : "Personal estimates, not a purchase recommendation.", `Driving enjoyment: ${enjoyment || "unanswered"}/5`, `Working weeks/year: ${settings.weeks || "unanswered"}`, `Gas: $${settings.gas || "unanswered"}/gal; high-price gas: $${settings.highGas || "unanswered"}/gal`, `Electricity: $${settings.electricity || "unanswered"}/kWh; high-price electricity: $${settings.highElectricity || "unanswered"}/kWh`, `Limits: busy one-way drive ${settings.maxMinutes || "not set"} min; stress fuel ${settings.maxFuel || "not set"} dollars/month`, ...options.flatMap((o, i) => ["", name(i), `One-way: ${o.miles || "unanswered"} miles, ${o.minutes || "unanswered"} min typical, ${o.busyMinutes || "unanswered"} min busy; ${o.days || "unanswered"} days/week`, `Vehicle: ${o.mode}; efficiency: ${o.efficiency || "unanswered"} ${o.mode === "gas" ? "MPG" : "kWh/100 miles"}`, `Housing/month: ${money(o.housing === "" ? null : Number(o.housing))}; other monthly costs: ${money(o.other === "" ? 0 : Number(o.other))}`, `Fuel/month: ${money(results[i].fuel)}; high-price fuel: ${money(results[i].highFuel)}`, `Commute/year: ${number(results[i].annualMiles, " mi")}; ${number(results[i].annualHours, " hours")}`, `Monthly housing + fuel + entered other costs: ${money(results[i].monthlyTotal)}`, ...factors.map(f => `${f.title}: ${o.ratings[f.key] || "unrated"}/5; importance ${settings.weights[f.key]}/5`), `Weighted personal fit: ${results[i].fit === null ? "incomplete" : results[i].fit!.toFixed(1) + "/5"}`, `Family support: ${o.support}; required: ${settings.requireFamily}`, `Essential destinations: ${o.essentials}; required: ${settings.requireAccess}`, `Must-haves to resolve: ${[...results[i].failed, ...results[i].pending].join("; ") || "none flagged (only selected checks assessed)"}`]), "", `Family/support notes: ${familyNotes || "not entered"}`, `Essential destination notes: ${accessNotes || "not entered"}`, "Verify actual weekday routes, school assignment/enrollment, and provider services/insurance before deciding.", "Fuel estimates cover the commute entered; add partner commutes, errands, maintenance, tolls, parking and replacement help separately.", "Rodeo Realty Fine Estates | CA DRE #01998956 | Equal Housing Opportunity"].join("\n");
  }

  function download() {
    const url = URL.createObjectURL(new Blob([summary()], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "my-commute-comparison.txt"; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setFeedback("Your comparison was downloaded.");
  }

  async function shareLink() {
    try { await navigator.clipboard.writeText("https://kareemjamaltherealtor.com/commute-check"); setFeedback("Tool link copied. Your answers are not in the link."); }
    catch { setFeedback("Share this link: https://kareemjamaltherealtor.com/commute-check"); }
  }

  const pairs = (render: (o: Option, i: number) => React.ReactNode) => <div className={styles.pair}>{options.map((o, i) => <div className={styles.option} key={i}><p className={styles.optionLabel}><span>{i === 0 ? "A" : "B"}</span>{name(i)}</p>{render(o, i)}</div>)}</div>;
  const ratingPair = (key: Factor) => { const f = factors.find(f => f.key === key)!; return pairs((o, i) => <Rating label={`${name(i)} ${f.title.toLowerCase()} fit`} value={o.ratings[key]} onChange={v => rate(i, key, v)} low={f.low} high={f.high} />); };

  return <main className={styles.main} id="commute-check">
    <div className={styles.intro}>
      <p className={styles.eyebrow}>Free Move Map · Commute & community</p>
      <h1>Is the farther home<br className={styles.desktopBreak} /> worth the drive?</h1>
      <p className={styles.lede}>A lower payment is one part of the decision. Compare the drive, the fuel bill, the people you rely on, and the places you need.</p>
      <div className={styles.topActions}><span>Free · No sign-up · Your answers stay on this page</span><a href="#comparison">See your comparison <ArrowDown size={15} /></a></div>
    </div>
    <div className={styles.workspace}>
      <div className={styles.inputs}>
        <section className={styles.setup} aria-labelledby="setup-title">
          <div className={styles.sectionTop}><h2 id="setup-title">Two homes. Your actual week.</h2><button type="button" className={styles.textButton} onClick={loadExample}>Try a sample</button></div>
          <p className={styles.help}>Palmdale versus Sylmar, or any two locations. Use the same work destination. Start with one commuter; include other household travel in “other costs.”</p>
          {example && <p className={styles.example}>Illustrative example only. These are invented payments and routes, not current market data. Replace every value with your own.</p>}
          <div className={styles.pair}>{options.map((o, i) => <label className={styles.field} key={i}><span>Option {i === 0 ? "A" : "B"} location</span><input value={o.name} maxLength={80} onChange={e => update(i, "name", e.target.value)} placeholder={i === 0 ? "e.g. Palmdale" : "e.g. Sylmar"} /></label>)}</div>
          <Numeric label="Working weeks per year" value={settings.weeks} onChange={v => setting("weeks", v)} min={1} max={52} suffix="weeks" hint="Subtract vacations and weeks you will not commute." />
        </section>

        <section className={styles.card} aria-labelledby="driving-title">
          <div className={styles.cardTitle}><span className={styles.step}>01</span><Car size={22} /><h2 id="driving-title">Do you enjoy the drive?</h2></div>
          <p className={styles.help}>Think weekday traffic, after a long day. An efficient car saves fuel; it does not give you the hours back.</p>
          <Rating label="How much do you generally enjoy driving?" value={enjoyment} onChange={setEnjoyment} low="I dread it" high="I look forward to it" />
          {pairs((o, i) => <>
            <Numeric label={`${name(i)} one-way miles`} value={o.miles} onChange={v => update(i, "miles", v)} suffix="mi" />
            <Numeric label={`${name(i)} typical one-way time`} value={o.minutes} onChange={v => update(i, "minutes", v)} suffix="min" />
            <Numeric label={`${name(i)} busy-day one-way time`} value={o.busyMinutes} onChange={v => update(i, "busyMinutes", v)} suffix="min" />
            <Numeric label={`${name(i)} commute days per week`} value={o.days} onChange={v => update(i, "days", v)} max={7} suffix="days" />
          </>)}
          <div className={styles.callout}>Test both directions at your real departure times. Then rate how each route would feel several days a week.</div>
          {ratingPair("driving")}
          <Numeric label="My longest acceptable busy-day one-way drive (optional)" value={settings.maxMinutes} onChange={v => setting("maxMinutes", v)} suffix="min" />
        </section>

        <section className={styles.card} aria-labelledby="fuel-title">
          <div className={styles.cardTitle}><span className={styles.step}>02</span><Fuel size={22} /><h2 id="fuel-title">Will the vehicle make it affordable?</h2></div>
          <p className={styles.help}>Use your actual commuting MPG or electricity use. Test a higher energy price before calling the extra miles a savings.</p>
          {pairs((o, i) => <>
            <label className={styles.field}><span>{name(i)} vehicle</span><select value={o.mode} onChange={e => { update(i, "mode", e.target.value); update(i, "efficiency", ""); }}><option value="gas">Gas / hybrid</option><option value="electric">Electric</option></select></label>
            <Numeric label={`${name(i)} ${o.mode === "gas" ? "actual fuel economy" : "electricity consumption"}`} value={o.efficiency} onChange={v => update(i, "efficiency", v)} min={0.1} suffix={o.mode === "gas" ? "MPG" : "kWh/100 mi"} />
          </>)}
          {options.some(o => o.mode === "gas") && <div className={styles.pair}><Numeric label="Gas price to test" value={settings.gas} onChange={v => setting("gas", v)} suffix="$/gal" /><Numeric label="High gas price to test" value={settings.highGas} onChange={v => setting("highGas", v)} suffix="$/gal" /></div>}
          {options.some(o => o.mode === "electric") && <div className={styles.pair}><Numeric label="Blended electricity price" value={settings.electricity} onChange={v => setting("electricity", v)} suffix="$/kWh" hint="Include home/public charging mix and charging losses in consumption." /><Numeric label="High electricity price to test" value={settings.highElectricity} onChange={v => setting("highElectricity", v)} suffix="$/kWh" /></div>}
          {(options.some(o => o.mode === "gas") && lowerHighGas || options.some(o => o.mode === "electric") && lowerHighElectricity) && <p className={styles.example}>Your high-price scenario is below the usual price. Set it at least as high as the usual price to check a price spike.</p>}
          {pairs((o, i) => <div className={styles.fuelReadout}><span>Estimated commute fuel / month</span><strong>{money(results[i].fuel)}</strong><small>At the high price: {money(results[i].highFuel)}</small></div>)}
          <p className={styles.help}>After seeing the bill above, how comfortable is each option?</p>
          {ratingPair("fuel")}
          <Numeric label="My monthly commute fuel limit at the high price (optional)" value={settings.maxFuel} onChange={v => setting("maxFuel", v)} suffix="$" />
        </section>

        <section className={styles.card} aria-labelledby="family-title">
          <div className={styles.cardTitle}><span className={styles.step}>03</span><HeartHandshake size={22} /><h2 id="family-title">What is being close worth?</h2></div>
          <p className={styles.help}>Think pickup help, childcare, rides, caregiving, meals, and emergencies. If your family is spread out and you are independent, proximity may matter less.</p>
          <label className={styles.field}><span>Who do I rely on, how often, and what changes with this move?</span><textarea rows={3} maxLength={1500} value={familyNotes} onChange={e => setFamilyNotes(e.target.value)} placeholder="e.g. My sister handles pickup twice a week. Could that still work?" /></label>
          {ratingPair("family")}
          <label className={styles.check}><input type="checkbox" checked={settings.requireFamily} onChange={e => setting("requireFamily", e.target.checked)} />Keeping the support I depend on is a must-have.</label>
          {settings.requireFamily && pairs((o, i) => <label className={styles.field}><span>{name(i)}: is that support workable?</span><select value={o.support} onChange={e => update(i, "support", e.target.value)}><option value="unknown">Still need to confirm</option><option value="yes">Yes, confirmed with the people involved</option><option value="no">No, the needed support would not work</option></select></label>)}
          <div className={styles.callout}>Local help has value even when no one sends a bill. Add any expected replacement costs below; also consider reliability and time.</div>
        </section>

        <section className={styles.card} aria-labelledby="access-title">
          <div className={styles.cardTitle}><span className={styles.step}>04</span><MapPin size={22} /><h2 id="access-title">Does everyday life still work?</h2></div>
          <p className={styles.help}>List the specific hospital, provider, school or program, pharmacy, and other destinations you need. Compare each home to your requirements.</p>
          <label className={styles.field}><span>Required destinations and the travel time I can accept</span><textarea rows={3} maxLength={1500} value={accessNotes} onChange={e => setAccessNotes(e.target.value)} placeholder="e.g. My current specialist within 30 minutes; school pickup before 5." /></label>
          {ratingPair("access")}
          <label className={styles.check}><input type="checkbox" checked={settings.requireAccess} onChange={e => setting("requireAccess", e.target.checked)} />Access to my required destinations is a must-have.</label>
          {settings.requireAccess && pairs((o, i) => <label className={styles.field}><span>{name(i)}: do the required destinations work?</span><select value={o.essentials} onChange={e => update(i, "essentials", e.target.value)}><option value="unknown">Still need to verify</option><option value="yes">Yes, checked for this address</option><option value="no">No, an essential need would not be met</option></select></label>)}
          <div className={styles.callout}>Check school assignment, programs and enrollment with the district. Check provider services, insurance and availability directly. Nearby does not always mean available.</div>
        </section>

        <section className={styles.card} aria-labelledby="payment-title">
          <h2 id="payment-title">Put the payment beside the life.</h2>
          <p className={styles.help}>Optional, but useful: compare all-in monthly housing costs using actual quotes. Include principal, interest, property taxes, insurance, HOA and mortgage insurance when applicable.</p>
          {pairs((o, i) => <><Numeric label={`${name(i)} all-in monthly housing`} value={o.housing} onChange={v => update(i, "housing", v)} suffix="$" /><Numeric label={`${name(i)} other monthly costs (optional)`} value={o.other} onChange={v => update(i, "other", v)} suffix="$" hint="Maintenance, tolls, parking, other travel or replacement family help. Blank counts as $0." /></>)}
          <h3 className={styles.subTitle}>What matters most to you?</h3><p className={styles.help}>Give each factor an importance from 1 (less) to 5 (most). This weights your personal fit ratings.</p>
          <div className={styles.weightGrid}>{factors.map(f => <label className={styles.field} key={f.key}><span>{f.title} importance</span><select value={settings.weights[f.key]} onChange={e => setSettings(prev => ({ ...prev, weights: { ...prev.weights, [f.key]: e.target.value } }))}>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}{n === 1 ? " — less" : n === 5 ? " — most" : ""}</option>)}</select></label>)}</div>
        </section>
      </div>

      <aside className={styles.results} id="comparison" aria-labelledby="results-title">
        <div className={styles.resultHeading}><p className={styles.eyebrow}>Your Move Map</p><h2 id="results-title">The payment.<br />The drive. The life.</h2><p>Updates as you enter your numbers.</p></div>
        <div className={styles.resultBody}>
          <div className={styles.resultColumns}>{options.map((o, i) => <div key={i}><p className={styles.resultName}>{name(i)}</p><strong className={styles.fit}>{results[i].fit === null ? "—" : results[i].fit!.toFixed(1)}<small>/ 5</small></strong><span className={styles.resultCaption}>{results[i].fit === null ? "Rate all four factors" : "Your weighted personal fit"}</span></div>)}</div>
          <p className={styles.fitMeaning}>{mustHaves ? "Resolve the must-haves below before relying on a fit score." : fitLead !== null ? `${name(fitLead)} fits your stated priorities more closely. Check the costs and real routes before deciding.` : bothFit ? "Your fit scores are close. Focus on the tradeoffs and test the real routes." : "Your priorities shape the comparison. Neither location gets a built-in advantage."}</p>
          <div className={styles.tableWrap}><table className={styles.table}><caption className={styles.srOnly}>Estimated commute and monthly costs for both locations</caption><thead><tr><th scope="col">Your estimates</th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody>
            <tr><th scope="row">Fuel / month</th>{results.map((r, i) => <td key={i}>{money(r.fuel)}</td>)}</tr>
            <tr><th scope="row">Fuel at high price</th>{results.map((r, i) => <td key={i}>{money(r.highFuel)}</td>)}</tr>
            <tr><th scope="row">Driving hours / year</th>{results.map((r, i) => <td key={i}>{number(r.annualHours)}</td>)}</tr>
            <tr><th scope="row">Commute miles / year</th>{results.map((r, i) => <td key={i}>{number(r.annualMiles)}</td>)}</tr>
            <tr className={styles.total}><th scope="row">Housing + fuel + other / month</th>{results.map((r, i) => <td key={i}>{money(r.monthlyTotal)}</td>)}</tr>
          </tbody></table></div>
          <p className={styles.small}>Fuel covers only the commute entered. Totals include only the other costs you add. Your time is shown separately.</p>
          <div className={styles.takeaway}><h3>What the tradeoff looks like</h3><p>{net === null ? "Add housing, route and vehicle numbers to see the monthly difference." : Math.abs(net) < 0.5 ? "These monthly costs are about even using the numbers entered." : `${name(net < 0 ? 0 : 1)} costs about ${money(Math.abs(net))} less per month using the costs entered.`}</p><p>{extraHours === null ? "Add both commute times to compare the hours." : Math.abs(extraHours) < 0.1 ? "The estimated annual driving time is the same." : `${name(extraHours > 0 ? 0 : 1)} adds about ${number(Math.abs(extraHours))} driving hours per year (${number(Math.abs(extraHours) / 12)} per month).`}</p></div>
          <div className={styles.mustHaves}><h3>Your must-haves</h3>{results.map((r, i) => <div key={i}><h4>{name(i)}</h4>{r.failed.map(t => <p className={styles.failed} key={t}>Needs a solution: {t}</p>)}{r.pending.map(t => <p className={styles.pending} key={t}>Still to verify: {t}</p>)}{!r.failed.length && !r.pending.length && <p className={styles.small}>No issue flagged by the checks you selected.</p>}</div>)}<p className={styles.small}>A higher score cannot replace a must-have. Add limits and required support or destinations to check them.</p></div>
          <details className={styles.method}><summary>How the estimates work</summary><p>Annual miles = one-way miles × 2 × days/week × working weeks. Annual hours = typical one-way minutes × 2 × days/week × working weeks ÷ 60.</p><p>Monthly gas = annual miles ÷ MPG × $/gallon ÷ 12. Electric = annual miles × kWh/100 miles ÷ 100 × $/kWh ÷ 12.</p><p>Personal fit = sum of each rating × its importance, divided by total importance. It reflects your answers; it is not a scientific prediction or a recommendation to buy.</p></details>
          <div className={styles.resultActions}><button type="button" onClick={download}><Download size={17} /> Save my answers</button><button type="button" onClick={() => window.print()}><Printer size={17} /> Print comparison</button><a href="/downloads/commute-and-community-worksheet.pdf" download><Download size={17} /> Blank worksheet PDF</a><button type="button" onClick={shareLink}>Copy tool link</button><button type="button" className={styles.reset} onClick={reset}>Clear & start over</button></div>
          <p role="status" className={styles.small}>{feedback}</p>
          <p className={styles.small}>Your inputs are not saved or sent automatically. Save your answers before leaving or refreshing this page.</p>
        </div>
      </aside>
    </div>

    <section className={styles.printSnapshot} aria-label="Printable filled comparison">
      <h2>My Commute & Community Move Map</h2>
      <p>Kareem Jamal · Rodeo Realty Fine Estates · CA DRE #01998956</p>
      <p>{example ? "Started from an illustrative example. Verify every value." : "Personal estimates. Verify the routes and costs before deciding."}</p>
      <p>Driving enjoyment: {enjoyment || "Unanswered"}/5 · Working weeks/year: {settings.weeks || "Unanswered"}</p>
      <p>Gas normal/high: ${settings.gas || "—"} / ${settings.highGas || "—"} per gallon · Electricity normal/high: ${settings.electricity || "—"} / ${settings.highElectricity || "—"} per kWh</p>
      <p>Selected limits: one-way busy drive {settings.maxMinutes || "Not set"} minutes · High-price fuel ${settings.maxFuel || "Not set"}/month</p>
      <div className={styles.pair}>{options.map((o, i) => <section key={i} className={styles.printOption}>
        <h3>{i === 0 ? "A" : "B"} · {name(i)}</h3>
        <p>One-way: {o.miles || "—"} mi · {o.minutes || "—"} min usual · {o.busyMinutes || "—"} min busy<br />Commute: {o.days || "—"} days/week · {o.mode === "gas" ? `${o.efficiency || "—"} MPG` : `${o.efficiency || "—"} kWh/100 mi`}</p>
        <p>Housing: {money(o.housing === "" ? null : Number(o.housing))}/month<br />Other costs entered: {money(o.other === "" ? 0 : Number(o.other))}/month</p>
        <table className={styles.table}><caption>Calculated estimates</caption><tbody><tr><th>Fuel / month</th><td>{money(results[i].fuel)}</td></tr><tr><th>High-price fuel</th><td>{money(results[i].highFuel)}</td></tr><tr><th>Driving hours / year</th><td>{number(results[i].annualHours)}</td></tr><tr><th>Commute miles / year</th><td>{number(results[i].annualMiles)}</td></tr><tr><th>Monthly housing + fuel + other</th><td>{money(results[i].monthlyTotal)}</td></tr></tbody></table>
        <p>{factors.map(f => `${f.title}: ${o.ratings[f.key] || "Unrated"}/5 (importance ${settings.weights[f.key]})`).join(" · ")}</p>
        <p><strong>Weighted personal fit: {results[i].fit === null ? "Incomplete" : results[i].fit!.toFixed(1) + " / 5"}</strong></p>
        <p>Family support: {settings.requireFamily ? o.support : "Not selected as a must-have"}<br />Essential destinations: {settings.requireAccess ? o.essentials : "Not selected as a must-have"}</p>
        <p><strong>Must-haves:</strong> {[...results[i].failed, ...results[i].pending].join(" ") || "No issue flagged by the selected checks."}</p>
      </section>)}</div>
      <h3>My family support notes</h3><p className={styles.printNotes}>{familyNotes || "Not entered."}</p>
      <h3>My required destinations</h3><p className={styles.printNotes}>{accessNotes || "Not entered."}</p>
      <p>Fuel covers only the commute entered. Monthly totals include only the other costs entered; driving time is separate. Personal fit reflects your ratings and weights. A higher fit cannot replace an unresolved must-have.</p>
      <p>Next: test actual weekday routes; confirm school assignment and enrollment with the district; check provider services, insurance and availability. Then ask Kareem to review both paths: (818) 402-7326 · kjamal@rodeore.com · kareemjamaltherealtor.com/commute-check</p>
    </section>

    <section className={styles.review} id="review">
      <div><p className={styles.eyebrow}>When you want a second set of eyes</p><h2>Bring the comparison.<br />We’ll check both paths.</h2><p>I can help you compare actual homes, pressure-test the payment, and identify what still needs checking. Whether your move is soon or months away, start with what your life needs.</p></div>
      <div className={styles.reviewActions}><button type="button" onClick={() => { window.location.href = `mailto:kjamal@rodeore.com?subject=${encodeURIComponent("Help me review my commute comparison")}&body=${encodeURIComponent("Hi Kareem, I would like help reviewing these two options. Please reply to this inquiry.\n\n" + summary())}`; }}>Email my comparison to Kareem <ArrowUpRight size={18} /></button><p>Opens your email app with your answers. Review them before sending. One personal reply; no automatic mailing list.</p><p>If the draft does not open, save your answers and email them to <a href="mailto:kjamal@rodeore.com">kjamal@rodeore.com</a>.</p><a href="tel:+18184027326">Or call (818) 402-7326</a></div>
    </section>
    <p className={styles.footerNote}>Personal planning estimates only. Verify commute conditions, property costs, and address-specific services. Rodeo Realty Fine Estates · CA DRE #01998956 · Equal Housing Opportunity.</p>
  </main>;
}
