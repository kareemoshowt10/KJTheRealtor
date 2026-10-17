"use client";

export const nextSteps = [
  { id: "cash", label: ["How much cash do I need?", "¿Cuánto dinero necesito?"], title: ["Make a cash-to-close question list.", "Prepara tus preguntas sobre el dinero para el cierre."], steps: [
    ["Write down what you could use for a purchase without using your emergency cushion.", "Anota lo que podrías usar para comprar sin tocar tu fondo de emergencia."],
    ["Ask a lender for an itemized estimate: down payment, closing costs, prepaid expenses, and any required reserves.", "Pide a un prestamista un cálculo detallado: enganche, costos de cierre, gastos prepagados y reservas requeridas."],
    ["Ask which assistance programs may apply and what their terms are. Set a date to review the estimate.", "Pregunta qué programas de ayuda podrían aplicar y cuáles son sus condiciones. Fija una fecha para revisar el cálculo."]
  ] },
  { id: "monthly", label: ["What monthly cost fits my life?", "¿Qué gasto mensual se ajusta a mi vida?"], title: ["Start with your comfort budget.", "Empieza con un presupuesto cómodo para ti."], steps: [
    ["Review a normal month of spending. Write a housing amount that still leaves room for savings and everyday life.", "Revisa un mes normal de gastos. Anota una cantidad para vivienda que deje espacio para ahorrar y vivir."],
    ["List costs beyond the loan: taxes, insurance, HOA if applicable, utilities, and maintenance.", "Incluye gastos además del préstamo: impuestos, seguro, asociación si aplica, servicios y mantenimiento."],
    ["Bring that budget to a lender. Ask for an itemized payment estimate instead of starting with the maximum loan amount.", "Lleva ese presupuesto a un prestamista. Pide un cálculo detallado del pago en vez de empezar con el préstamo máximo."]
  ] },
  { id: "income", label: ["Is my work history enough?", "¿Es suficiente mi historial laboral?"], title: ["Map your income story.", "Organiza tu historial de ingresos."], steps: [
    ["Privately list your recent jobs or self-employment, dates, income types, and any gaps.", "Anota en privado tus empleos o trabajo independiente, fechas, tipos de ingreso y períodos sin trabajar."],
    ["Ask a lender how your specific history would be documented. A job change or self-employment needs an individual review.", "Pregunta a un prestamista cómo documentar tu historial específico. Un cambio de trabajo o el trabajo independiente necesita revisión individual."],
    ["Use the lender’s secure process for documents. Do not send pay stubs, tax returns, or account numbers through this form.", "Usa el proceso seguro del prestamista para documentos. No envíes recibos de pago, declaraciones de impuestos ni números de cuenta por este formulario."]
  ] },
  { id: "credit", label: ["Where do I start with credit?", "¿Por dónde empiezo con mi crédito?"], title: ["Start with what your report actually says.", "Empieza con lo que dice tu informe."], steps: [
    ["Use the official AnnualCreditReport.com site to review your reports privately.", "Usa el sitio oficial AnnualCreditReport.com para revisar tus informes en privado."],
    ["Write down questions or entries you do not recognize. Use the reporting company’s dispute process for possible errors.", "Anota preguntas o datos que no reconozcas. Usa el proceso de disputa de la compañía para posibles errores."],
    ["Ask a lender what matters for your situation before changing accounts or applying for new credit.", "Pregunta a un prestamista qué importa en tu caso antes de cambiar cuentas o solicitar crédito nuevo."]
  ] },
  { id: "timing", label: ["Should I keep renting for now?", "¿Debería seguir rentando por ahora?"], title: ["Compare your next year of life.", "Compara tu próximo año de vida."], steps: [
    ["Write your lease end date, likely move costs, and how long you expect to stay in the area.", "Anota cuándo termina tu contrato, los posibles gastos de mudanza y cuánto tiempo esperas quedarte en la zona."],
    ["List what flexibility is worth to you and what owning would change, including maintenance responsibilities.", "Anota cuánto valoras la flexibilidad y qué cambiaría al comprar, incluyendo el mantenimiento."],
    ["Choose a date to revisit the decision. Renting while you prepare can be a deliberate part of your plan.", "Elige una fecha para revisar la decisión. Rentar mientras te preparas puede ser parte de tu plan."]
  ] },
  { id: "start", label: ["I am not sure where to start.", "No sé por dónde empezar."], title: ["Turn one worry into one question.", "Convierte una preocupación en una pregunta."], steps: [
    ["Finish this sentence: A home of my own would help me ___.", "Completa esta frase: Tener mi propia casa me ayudaría a ___."],
    ["Choose the biggest unknown: cash, monthly cost, income, credit, or timing. You do not need every answer today.", "Elige tu mayor duda: dinero, gasto mensual, ingresos, crédito o tiempo. No necesitas todas las respuestas hoy."],
    ["Start on page 3 of the Action Guide. Choose one action, an owner, and a date to review it.", "Empieza en la página 3 de la Guía de Acción. Elige una acción, quién la hará y una fecha para revisarla."]
  ] }
] as const;

export function FirstHomeNextStep({ selected, es, onChoose, onLanguage }: { selected: string; es: boolean; onChoose: (id: string) => void; onLanguage: (value: string) => void }) {
  const plan = nextSteps.find(p => p.id === selected);
  const lang = es ? 1 : 0;
  function save() {
    if (!plan) return;
    const text = ["YOUR FIRST HOME PLAN | KAREEM JAMAL", plan.title[lang], ...plan.steps.map((s,i) => `${i + 1}. ${s[lang]}`), es ? "Quién lo hará: ______  Fecha de revisión: ______" : "Owner: ______  Review date: ______", "https://kareemjamaltherealtor.com/first-home-plan", es ? "Herramienta educativa. No es una aprobación de préstamo." : "Educational planning tool. Not a loan approval."].join("\n\n");
    const url = URL.createObjectURL(new Blob([text], {type:"text/plain;charset=utf-8"}));
    const link = document.createElement("a"); link.href = url; link.download = `first-home-next-step-${plan.id}-${es ? "es" : "en"}.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section id="next-step" className="scroll-mt-24 bg-cream px-5 py-14 md:px-8 md:py-20" lang={es ? "es" : "en"}>
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-deep">{es ? "Un pequeño paso hoy" : "A small win today"}</p><h2 className="mt-3 font-display text-4xl md:text-5xl">{es ? "¿Qué te mantiene rentando?" : "What is keeping you renting?"}</h2><p className="mt-4 leading-relaxed text-slateink">{es ? "Elige tu mayor duda. Recibe una lista de pasos que puedes guardar sin compartir tus datos." : "Pick your biggest unknown. Get a next-step checklist you can save without sharing your contact details."}</p></div>
        <label className="text-sm font-semibold">Language / Idioma<select value={es ? "Español" : "English"} onChange={e => onLanguage(e.target.value)} className="mt-2 block rounded-lg border border-[#d8cbb7] bg-white p-3"><option>English</option><option>Español</option></select></label>
      </div>
      <fieldset className="mt-8"><legend className="sr-only">{es ? "Elige tu mayor duda" : "Choose your biggest unknown"}</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{nextSteps.map(p => <label key={p.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-5 text-sm font-semibold ${selected === p.id ? "border-navy bg-navy text-cream" : "border-[#d8cbb7] bg-white text-navy"}`}><input className="h-5 w-5 shrink-0 accent-[#a88632]" type="radio" name="planning_topic" value={p.id} checked={selected === p.id} onChange={() => onChoose(p.id)} />{p.label[lang]}</label>)}</div></fieldset>
      {plan ? <div className="mt-7 rounded-2xl border border-gold/60 bg-white p-6 md:p-9" role="region" aria-label={es ? "Tu siguiente paso" : "Your next step"} aria-live="polite"><p className="text-xs font-bold uppercase tracking-widest text-gold-deep">{es ? "Tu punto de partida" : "Your starting point"}</p><h3 className="mt-3 font-display text-3xl">{plan.title[lang]}</h3><ol className="mt-5 list-decimal space-y-3 pl-5 leading-relaxed text-slateink">{plan.steps.map(s=><li key={s[0]}>{s[lang]}</li>)}</ol><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={save} className="rounded-lg border border-navy px-5 py-3 font-semibold">{es ? "Guardar mis pasos" : "Save my next step"}</button><a href="#planning" className="rounded-lg bg-gold px-5 py-3 font-semibold text-navy">{es ? "Quiero ayuda con este paso" : "Help me with this step"}</a></div><p className="mt-4 text-sm text-slateink">{es ? "Herramienta educativa. No evalúa tu elegibilidad ni aprueba un préstamo." : "A planning prompt, not a readiness score or loan approval."}</p></div> : null}
    </div>
  </section>;
}
