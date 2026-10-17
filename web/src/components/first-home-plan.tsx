"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { FirstHomeNextStep, nextSteps } from "@/components/first-home-next-step";

const ENDPOINT = "https://formspree.io/f/xnjlgvlk";
const resources = [
  { id: "action-guide", href: "/downloads/first-home-action-guide.pdf", title: "Your next step, on paper.", description: "12-page English/Spanish Action Guide. Type into the fields or print and write. Start on page 3.", link: "Download the Action Guide" },
  { id: "money-journal", href: "/downloads/first-home-money-journal.pdf", title: "A place for your real numbers.", description: "24-page English/Spanish Money & Home Journal. Made for handwriting. Start on page 2 and use the other tools as needed.", link: "Download the Money & Home Journal" },
];
const field = "mt-2 w-full rounded-lg border border-[#d8cbb7] bg-white p-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold";

function track(event: string, extra: Record<string, string> = {}) {
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, form_source: "first-home-plan", ...extra });
}

export function FirstHomePlan() {
  const [selected, setSelected] = useState("");
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const submitting = useRef(false);
  const es = language === "Español";

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const entry: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = q.get(key);
      if (value) entry[key] = value.slice(0, 150);
    }
    const keyword = q.get("keyword")?.toUpperCase();
    if (keyword && ["READY", "HOME", "PLAN"].includes(keyword)) entry.entry_keyword = keyword;
    setAttribution(entry);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current || status === "success") return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (String(data.get("_gotcha") || "").trim()) return;
    submitting.current = true;
    setStatus("sending");
    try {
      const result = await fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!result.ok) throw new Error("Submission was not accepted");
      setStatus("success");
      track("generate_lead", { campaign: "your-first-home-plan", entry_keyword: attribution.entry_keyword || "READY" });
    } catch {
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  return <>
    <FirstHomeNextStep selected={selected} es={es} onLanguage={setLanguage} onChoose={id => { setSelected(id); track("planning_topic_selected", { topic: id }); }} />
    <section className="bg-white px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">One question. One action. Your pace.</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">From an unknown to an action.</h2>
          <p className="mt-5 leading-relaxed text-slateink">Start on your own. Ask for help when it is useful. You choose whether buying, preparing longer, or continuing to rent fits your life.</p>
        </div>
        <ol className="mt-9 grid gap-5 md:grid-cols-3">
          {[
            ["01", "Name the goal.", "Write what a move would improve and the one thing that feels unclear."],
            ["02", "List what you know.", "Draft your monthly comfort budget and cash questions. Mark unknowns instead of guessing."],
            ["03", "Choose one next step.", "Give it an owner and a review date. Continue, adjust, get help, or pause."],
          ].map(([n, title, body]) => <li key={n} className="rounded-xl border border-[#e1d4c0] bg-white p-6"><span className="text-sm font-semibold text-gold-deep">{n}</span><h3 className="mt-4 font-display text-2xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-slateink">{body}</p></li>)}
        </ol>
      </div>
    </section>

    <section id="resources" className="scroll-mt-24 bg-[#f2ecdf] px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-4xl md:text-5xl">Your plan belongs to you.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-slateink">Keep these blank worksheets. Both languages appear together, with one shared answer space. No contact details are required to download.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {resources.map(r => <article key={r.id} className="flex flex-col rounded-xl border border-[#d8cbb7] bg-white p-7 md:p-9"><p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-deep">Free bilingual PDF</p><h3 className="mt-4 font-display text-3xl">{r.title}</h3><p className="my-5 leading-relaxed text-slateink">{r.description}</p><a download href={r.href} onClick={() => track("resource_download", { resource: r.id })} className="mt-auto rounded-lg bg-navy px-5 py-3 text-center font-semibold text-cream hover:bg-[#17345b]">{r.link}</a></article>)}
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slateink">Educational draft editions for review. Spanish materials are available; please confirm conversation-language or interpretation support with Kareem. Keep completed financial worksheets private. A lender uses its own secure process for loan documents.</p>
      </div>
    </section>

    <section id="planning" className="scroll-mt-24 bg-cream px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">When a conversation would help</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Your First Home Clarity Session.</h2>
          <p className="mt-5 leading-relaxed text-slateink">A free 15-minute conversation for renters thinking about buying in Chatsworth, Simi Valley, West Hills, and nearby communities. Bring one question. We’ll work toward one action you can actually take.</p>
          <ul className="mt-6 space-y-3 rounded-xl border border-[#d8cbb7] bg-white p-5 text-sm leading-relaxed">
            <li><strong>Your question:</strong> clarify what is keeping you stuck.</li>
            <li><strong>Your next step:</strong> choose an action and who will do it.</li>
            <li><strong>Your review date:</strong> agree when to check progress, if you want follow-up.</li>
          </ul>
          <p className="mt-5 leading-relaxed text-slateink">My construction experience helps you ask better questions about a home’s condition and potential. Your lender handles income, credit, loan terms, and approval.</p>
          <p className="mt-5 text-sm leading-relaxed text-slateink">We can start with an email reply. No need to pick a home or make a buying decision. Requesting a session does not book a time or add you to a marketing sequence.</p>
          <a className="mt-6 inline-block font-semibold text-navy underline underline-offset-4" href="tel:+18184027326">Call Kareem: (818) 402-7326</a>
        </div>
        <div className="rounded-2xl border border-[#d8cbb7] bg-white p-6 shadow-sm md:p-8">
          <label className="block text-sm font-semibold">Form language / Idioma del formulario<select value={language} onChange={e => setLanguage(e.target.value)} className={field}><option>English</option><option>Español</option></select></label>
          {status === "success" ? <div role="status" aria-live="polite" className="mt-6 rounded-xl bg-cream p-6" lang={es ? "es" : "en"}><h3 className="font-display text-3xl">{es ? "Tu solicitud fue recibida." : "Your request was received."}</h3><p className="mt-4 leading-relaxed">{es ? "Kareem responderá personalmente para hablar del siguiente paso. La cita aún no está confirmada. Para prepararte, anota tu mayor duda. Kareem puede ayudarte a elegir una acción, quién la hará y una fecha de revisión. Las guías siguen disponibles arriba." : "Kareem will reply personally about your next step. An appointment is not confirmed yet. To prepare, write down your biggest question. Kareem can help you choose one action, an owner, and a review date. The free guides remain available above."}</p></div> :
          <form onSubmit={submit} className="mt-6 space-y-5" lang={es ? "es" : "en"}>
            <input type="hidden" name="_subject" value="Your First Home Plan - planning request" />
            <input type="hidden" name="offer" value="First Home Clarity Session" />
            <input type="hidden" name="planning_topic" value={selected || "Not selected"} />
            <input type="hidden" name="suggested_next_step" value={nextSteps.find(p => p.id === selected)?.title[0] || "Clarify one question"} />
            <input type="hidden" name="source" value="first-home-plan" />
            <input type="hidden" name="campaign" value="your-first-home-plan" />
            <input type="hidden" name="entry_keyword" value={attribution.entry_keyword || "READY"} />
            <input type="hidden" name="form_language" value={language} />
            {Object.entries(attribution).filter(([key]) => key !== "entry_keyword").map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
            <div className="absolute -left-[9999px]" aria-hidden="true"><label>Leave empty<input name="_gotcha" tabIndex={-1} autoComplete="off" /></label></div>
            <label className="block text-sm font-semibold">{es ? "Tu nombre" : "Your name"}<input name="name" autoComplete="name" required maxLength={100} className={field} /></label>
            <label className="block text-sm font-semibold">{es ? "Correo electrónico" : "Email"}<input name="email" type="email" autoComplete="email" required maxLength={254} className={field} /></label>
            {selected ? <p className="rounded-lg bg-cream p-4 text-sm">{es ? "Tu tema: " : "Your topic: "}{nextSteps.find(p => p.id === selected)?.label[es ? 1 : 0]}</p> : null}
            <details className="rounded-lg border border-[#d8cbb7] p-4"><summary className="cursor-pointer text-sm font-semibold">{es ? "Agregar contexto (opcional)" : "Add context (optional)"}</summary><div className="mt-4 space-y-5">
            <label className="block text-sm font-semibold">{es ? "Teléfono (opcional)" : "Phone (optional)"}<input name="phone" type="tel" autoComplete="tel" maxLength={40} className={field} /></label>
            <label className="block text-sm font-semibold">{es ? "Ciudad o zona (opcional)" : "City or area (optional)"}<input name="target_city" autoComplete="address-level2" maxLength={120} className={field} /></label>
            <label className="block text-sm font-semibold">{es ? "Cuándo te gustaría mudarte" : "When would you like to move?"}<select name="move_window" className={field} defaultValue=""><option value="">{es ? "Elige una opción" : "Choose one"}</option>{["Just exploring", "Within 3 months", "3-6 months", "6-12 months", "More than a year", "Not sure"].map((v,i) => <option value={v} key={v}>{es ? ["Solo estoy explorando", "Dentro de 3 meses", "3-6 meses", "6-12 meses", "Más de un año", "No estoy seguro/a"][i] : v}</option>)}</select></label>
            <label className="block text-sm font-semibold">{es ? "Tu principal pregunta (opcional)" : "Your main question (optional)"}<textarea name="main_obstacle" maxLength={1500} rows={3} className={field} placeholder={es ? "Ahorro, pagos mensuales, ingresos o por dónde empezar…" : "Savings, monthly costs, income, or where to start…"} /></label>
            <label className="block text-sm font-semibold">{es ? "Idioma preferido para conversar" : "Preferred conversation language"}<select name="preferred_language" className={field} defaultValue=""><option value="">{es ? "Elige una opción" : "Choose one"}</option><option>English</option><option>Español</option><option value="Other">{es ? "Otro / apoyo de interpretación" : "Other / interpretation support"}</option></select></label>
            <label className="block text-sm font-semibold">{es ? "¿Ya trabajas con un agente?" : "Already working with an agent?"}<select name="existing_agent" className={field} defaultValue=""><option value="">{es ? "Elige una opción" : "Choose one"}</option><option value="No">{es ? "No" : "No"}</option><option value="Yes">{es ? "Sí" : "Yes"}</option><option value="Not sure">{es ? "No estoy seguro/a" : "Not sure"}</option></select></label>
            </div></details>
            <label className="flex gap-3 rounded-lg border border-[#d8cbb7] bg-cream p-4 text-sm leading-relaxed"><input name="consent" value="One personal reply requested. No automated marketing." type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[#a88632]" /><span>{es ? "Autorizo a Kareem a responder una vez por correo o por el teléfono indicado. No me inscribo en campañas de marketing." : "Kareem may reply once by email or the phone provided. I am not signing up for marketing messages."} <a href="/privacy" className="underline">{es ? "Privacidad" : "Privacy"}</a></span></label>
            {status === "error" ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{es ? "No pudimos confirmar el envío. Intenta de nuevo o llama al (818) 402-7326." : "We couldn’t confirm your request was sent. Please retry or call (818) 402-7326."}</p> : null}
            <button disabled={status === "sending"} type="submit" className="w-full rounded-lg bg-gold px-5 py-4 font-semibold text-navy hover:bg-gold-light disabled:cursor-wait disabled:opacity-60">{status === "sending" ? (es ? "Enviando…" : "Sending…") : (es ? "Pedir mi sesión gratuita" : "Request my free Clarity Session")}</button>
            <p className="text-center text-xs leading-relaxed text-slateink">{es ? "Sin obligación de comprar ni contratar. No envíes estados bancarios, números de cuenta ni documentos fiscales." : "No obligation to buy or hire. Don’t send bank statements, account numbers, or tax documents."}</p>
          </form>}
        </div>
      </div>
    </section>
    <section className="bg-white px-5 py-14 md:px-8">
      <div className="mx-auto max-w-3xl"><h2 className="font-display text-3xl">Before you take the next step.</h2>
        {[
          ["What if I am a year away from buying?", "You can still start. Choose one useful action now and a review date that fits your timeline."],
          ["Do I have to share my finances?", "No. Downloads and the next-step tool are open. The request form only requires your name, email, and permission for a reply. Keep financial documents private."],
          ["Will this tell me if I qualify for a loan?", "No. A lender must review your specific income, credit, cash, and loan options. Kareem helps you organize questions and plan a next step."],
          ["Why work with Kareem?", "Local real estate guidance plus construction experience: ask clearer questions about location, condition, and possible repairs before you choose a property. Inspections and specialist advice remain part of your due diligence."],
        ].map(([q,a]) => <details key={q} className="mt-4 border-b border-[#d8cbb7] py-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 leading-relaxed text-slateink">{a}</p></details>)}
        <p className="mt-7 text-sm leading-relaxed text-slateink">Ready for help? <a href="#planning" className="font-semibold underline underline-offset-4">Request your free Clarity Session.</a> Prefer to work privately? <a href="#resources" className="underline underline-offset-4">Keep the free guides.</a></p>
      </div>
    </section>
  </>;
}
