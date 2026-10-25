"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { addLeadAttribution } from "@/lib/lead-attribution";

// Same Formspree endpoint as every other lead form on the site.
const ENDPOINT = "https://formspree.io/f/xnjlgvlk";
const PDF = "/downloads/inherited-home-basis-worksheet.pdf";
const SMS = "sms:+18184027326?body=" + encodeURIComponent("Hi Kareem, I downloaded the Inherited Home Basis Worksheet. Can we set up a 15-minute call about the house?");
const roles = [
  { id: "heir", label: "Heir" },
  { id: "executor", label: "Executor / trustee" },
  { id: "co-owner", label: "Co-owner" },
];
const field = "mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-[#f4efe4] placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]";

function track(event: string, extra: Record<string, string> = {}) {
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, form_source: "inherited-home-worksheet", ...extra });
}

export function InheritedWorksheetForm() {
  const [role, setRole] = useState("heir");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [keyword, setKeyword] = useState("");
  const submitting = useRef(false);
  const dl = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("keyword")?.toUpperCase();
    if (k === "INHERIT") setKeyword(k);
  }, []);

  useEffect(() => {
    if (status === "success") dl.current?.click();
  }, [status]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current || status === "success") return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (String(data.get("_gotcha") || "").trim()) return;
    addLeadAttribution(data);
    submitting.current = true;
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("not accepted");
      setStatus("success");
      track("generate_lead", { campaign: "inherited-home-worksheet", role, ...(keyword ? { entry_keyword: keyword } : {}) });
    } catch {
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success") {
    return <div role="status" aria-live="polite" className="text-[#f4efe4]">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">You&rsquo;re in</p>
      <h3 className="mt-3 font-display text-4xl leading-tight">Your worksheet is downloading.</h3>
      <p className="mt-4 leading-relaxed text-white/70">Didn&rsquo;t start? Use the button. Print it, fill in what you know, and mark what you don&rsquo;t.</p>
      <a ref={dl} href={PDF} download onClick={() => track("resource_download", { resource: "inherited-home-basis-worksheet" })} className="mt-6 flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#B8902F] via-[#F3D98B] to-[#C9A23E] px-6 py-4 font-semibold text-black shadow-[0_10px_30px_rgba(212,175,55,0.25)]">
        Download the worksheet (PDF)
      </a>
      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="font-display text-2xl">Next step: walk the numbers with me.</p>
        <p className="mt-2 text-sm leading-relaxed text-white/65">Fifteen minutes. You tell me about the house, I tell you what each option would realistically sell for in your area. No obligation.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a href={SMS} onClick={() => track("booking_click", { channel: "sms" })} className="flex-1 rounded-lg border border-[#D4AF37] px-5 py-3 text-center font-semibold text-[#F3D98B] hover:bg-[#D4AF37]/10">Text to book a 15-min call</a>
          <a href="tel:+18184027326" onClick={() => track("booking_click", { channel: "phone" })} className="flex-1 rounded-lg border border-white/20 px-5 py-3 text-center font-semibold text-white/85 hover:border-white/40">Call (818) 402-7326</a>
        </div>
      </div>
    </div>;
  }

  return <form onSubmit={submit} className="space-y-5 text-[#f4efe4]" noValidate={false}>
    <input type="hidden" name="_subject" value="Inherited Home Basis Worksheet - new download" />
    <input type="hidden" name="offer" value="Inherited Home Basis Worksheet (PDF)" />
    <input type="hidden" name="form_source" value="inherited-home-worksheet" />
    {keyword ? <input type="hidden" name="entry_keyword" value={keyword} /> : null}
    <input type="hidden" name="role" value={role} />
    <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    <fieldset>
      <legend className="text-sm font-semibold text-white/80">Are you:</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {roles.map(r => <button type="button" key={r.id} aria-pressed={role === r.id} onClick={() => setRole(r.id)}
          className={`rounded-lg border px-2 py-3 text-sm font-semibold transition ${role === r.id ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#F3D98B]" : "border-white/15 text-white/70 hover:border-white/35"}`}>{r.label}</button>)}
      </div>
    </fieldset>
    <label className="block text-sm font-semibold text-white/80">First name<input required name="name" autoComplete="given-name" className={field} placeholder="Your name" /></label>
    <label className="block text-sm font-semibold text-white/80">Email<input required type="email" name="email" autoComplete="email" className={field} placeholder="you@email.com" /></label>
    <label className="block text-sm font-semibold text-white/80">Phone <span className="font-normal text-white/45">(optional)</span><input type="tel" name="phone" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} className={field} placeholder="(818) 555-0123" /></label>
    {phone.trim() ? <label className="flex gap-3 text-xs leading-relaxed text-white/60"><input type="checkbox" name="sms_consent" value="yes" className="mt-0.5 accent-[#D4AF37]" />Yes, Kareem may call or text me at this number about my inherited property. Msg &amp; data rates may apply. Reply STOP to opt out.</label> : null}
    <button type="submit" disabled={status === "sending"} className="w-full rounded-lg bg-gradient-to-r from-[#B8902F] via-[#F3D98B] to-[#C9A23E] px-6 py-4 text-base font-bold text-black shadow-[0_10px_30px_rgba(212,175,55,0.25)] transition hover:brightness-105 disabled:opacity-60">
      {status === "sending" ? "Sending…" : "Send me the worksheet"}
    </button>
    {status === "error" ? <p role="alert" className="text-sm text-[#E5484D]">That didn&rsquo;t go through. Try again, or text me at (818) 402-7326 and I&rsquo;ll send it directly.</p> : null}
    <p className="text-[11px] leading-relaxed text-white/45">By submitting, you agree that Kareem Jamal (Rodeo Realty) may email you the worksheet and a few short follow-ups about selling or keeping an inherited home. Unsubscribe anytime. Phone and text contact only if you check the box above. Consent is not a condition of any service. See the <a href="/privacy" className="underline">privacy policy</a>.</p>
  </form>;
}
