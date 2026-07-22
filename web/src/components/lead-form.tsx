"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PATH_STORAGE_KEY,
  pathPrefills,
  type LeadPath,
} from "@/components/path-selector";

export type LeadChip = {
  label: string;
  fill: string;
};

type Props = {
  title: string;
  subtitle?: string;
  subject: string;
  source: string;
  /** Extra hidden fields e.g. zip_page */
  hiddenFields?: Record<string, string>;
  chips?: LeadChip[];
  chipsLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  showPhone?: boolean;
  className?: string;
  /** Optional content above chips (trust note etc.) */
  headerExtra?: ReactNode;
  /** Apply path-selector prefill when user arrives from Start here */
  enablePathPrefill?: boolean;
};

const FORMSPREE = "https://formspree.io/f/xnjlgvlk";

const fieldClass =
  "mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none transition-shadow duration-200 focus:border-gold-deep focus:ring-2 focus:ring-gold/35 focus:shadow-[0_0_0_4px_rgba(201,168,76,0.12)]";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Launch-ready lead form: honeypot, consent, AJAX submit, success/error states,
 * Formspree + privacy link. Same endpoint as production static site.
 */
export function LeadForm({
  title,
  subtitle = "Takes 30 seconds. Replied to personally, usually same day.",
  subject,
  source,
  hiddenFields,
  chips,
  chipsLabel = "Common starts — tap to fill",
  messageLabel = "What's on your mind?",
  messagePlaceholder = "Parents' home, Prop 19, buy/sell timing…",
  showPhone = false,
  className,
  headerExtra,
  enablePathPrefill = false,
}: Props) {
  const reduced = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const formInView = useInView(formRef, { amount: 0.35, once: false });

  const [message, setMessage] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [leadPath, setLeadPath] = useState<LeadPath | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const applyPath = (path: LeadPath) => {
    const pref = pathPrefills[path];
    if (!pref) return;
    setLeadPath(path);
    setMessage(pref.fill);
    setActive(pref.chip);
  };

  useEffect(() => {
    if (!enablePathPrefill) return;

    const read = () => {
      try {
        const raw = sessionStorage.getItem(PATH_STORAGE_KEY) as LeadPath | null;
        if (raw && pathPrefills[raw]) applyPath(raw);
      } catch {
        /* ignore */
      }
    };

    read();

    const onPath = (e: Event) => {
      const path = (e as CustomEvent<{ path: LeadPath }>).detail?.path;
      if (path && pathPrefills[path]) applyPath(path);
    };

    window.addEventListener("kj:lead-path", onPath);
    return () => window.removeEventListener("kj:lead-path", onPath);
  }, [enablePathPrefill]);

  const filledCount =
    (name.trim() ? 1 : 0) + (email.trim() ? 1 : 0) + (consent ? 1 : 0);
  const progress = filledCount / 3;
  const pulseSubmit =
    formInView && progress < 1 && !reduced && status === "idle";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending" || status === "success") return;

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot — bots fill this; humans never see it
    if (String(fd.get("_gotcha") || "").trim()) {
      setStatus("success");
      return;
    }

    if (!consent) {
      setErrorMsg("Please check the permission box so I can reply once.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        // Optional analytics hook for GTM later
        try {
          const w = window as Window & {
            dataLayer?: Record<string, unknown>[];
          };
          w.dataLayer = w.dataLayer || [];
          w.dataLayer.push({
            event: "generate_lead",
            form_source: source,
            topic_chip: active || undefined,
            lead_path: leadPath || undefined,
          });
        } catch {
          /* ignore */
        }
      } else {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
    } catch {
      setStatus("error");
      setErrorMsg(
        "Something went wrong sending that. Please call or text (818) 402-7326, or email kjamal@rodeore.com."
      );
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative rounded-2xl border border-gold/50 bg-paper p-8 text-center text-navy shadow-2xl md:p-10",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
          <Check size={28} strokeWidth={2.5} />
        </div>
        <h3 className="mt-5 font-display text-2xl font-medium">Got it.</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slateink">
          Your note is in my inbox. I reply personally — usually the same day on
          weekdays. No drip sequence, no shared list.
        </p>
        <p className="mt-6 text-sm text-slateink">
          Urgent?{" "}
          <a
            href="tel:+18184027326"
            className="font-semibold text-navy underline-offset-2 hover:underline"
          >
            (818) 402-7326
          </a>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      ref={formRef}
      onSubmit={onSubmit}
      initial={reduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease, delay: 0.06 }}
      className={cn(
        "relative rounded-2xl border border-gold/50 bg-paper p-6 text-navy shadow-2xl md:p-8",
        className
      )}
      noValidate
    >
      {!reduced && formInView && status === "idle" && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl"
          style={{
            boxShadow:
              "0 0 0 1px rgba(201,168,76,0.35), 0 0 40px -8px rgba(201,168,76,0.45)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-medium">{title}</h3>
            <p className="mt-1 text-sm text-slateink">{subtitle}</p>
          </div>
          <div
            className="relative flex h-10 w-10 shrink-0 items-center justify-center"
            aria-hidden
          >
            <svg className="absolute inset-0 h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#e3d8c7"
                strokeWidth="2.5"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={97.4}
                initial={false}
                animate={{ strokeDashoffset: 97.4 * (1 - progress) }}
                transition={{ duration: 0.4, ease }}
              />
            </svg>
            {progress === 1 ? (
              <Check size={16} className="text-gold-deep" />
            ) : (
              <span className="text-[0.65rem] font-bold text-gold-deep">
                {filledCount}/3
              </span>
            )}
          </div>
        </div>

        {headerExtra}

        {chips && chips.length > 0 && (
          <>
            <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-gold-deep">
              {chipsLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {chips.map((c, i) => (
                <motion.button
                  key={c.label}
                  type="button"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.35 }}
                  whileTap={reduced ? undefined : { scale: 0.96 }}
                  onClick={() => {
                    setMessage(c.fill);
                    setActive(c.label);
                    const ta = formRef.current?.querySelector(
                      "textarea[name=message]"
                    ) as HTMLTextAreaElement | null;
                    ta?.focus();
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition",
                    active === c.label
                      ? "border-gold bg-gold text-navy shadow-sm"
                      : "border-gold/45 bg-gold/10 text-navy hover:bg-gold/20"
                  )}
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
          </>
        )}

        <input type="hidden" name="_subject" value={subject} />
        <input type="hidden" name="source" value={source} />
        {active && <input type="hidden" name="topic_chip" value={active} />}
        {leadPath && (
          <input
            type="hidden"
            name="lead_path"
            value={pathPrefills[leadPath].label}
          />
        )}
        {hiddenFields &&
          Object.entries(hiddenFields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}

        {/* Formspree honeypot */}
        <input
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slateink">
          Name
          <input
            required
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            className={cn(fieldClass, focused === "name" && "border-gold-deep")}
            autoComplete="name"
          />
        </label>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
          Email
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            className={cn(fieldClass, focused === "email" && "border-gold-deep")}
            autoComplete="email"
          />
        </label>
        {showPhone && (
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Phone{" "}
            <span className="font-normal normal-case tracking-normal text-slateink/70">
              optional — only if you prefer a call/text reply
            </span>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocused("phone")}
              onBlur={() => setFocused(null)}
              className={cn(
                fieldClass,
                focused === "phone" && "border-gold-deep"
              )}
              autoComplete="tel"
            />
          </label>
        )}
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
          {messageLabel}{" "}
          <span className="font-normal normal-case tracking-normal text-slateink/70">
            (optional)
          </span>
          <textarea
            name="message"
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (active) setActive(null);
            }}
            onFocus={() => setFocused("message")}
            onBlur={() => setFocused(null)}
            className={cn(
              fieldClass,
              "resize-y",
              focused === "message" && "border-gold-deep"
            )}
            placeholder={messagePlaceholder}
          />
        </label>

        <motion.label
          className={cn(
            "mt-4 flex items-start gap-3 rounded-lg border p-3 text-sm transition",
            consent ? "border-gold bg-gold/15" : "border-gold/40 bg-cream"
          )}
          whileTap={reduced ? undefined : { scale: 0.995 }}
        >
          <input
            required
            type="checkbox"
            name="consent"
            value="Yes — explicit permission granted for one personal reply"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-gold-deep"
          />
          <span>
            You have my explicit permission to{" "}
            <strong>reply once</strong> to this inquiry (email
            {showPhone ? " or phone if provided" : ""}). No drip campaign, no
            shared list, ever.{" "}
            <a href="/privacy" className="underline underline-offset-2">
              Privacy
            </a>
          </span>
        </motion.label>

        {status === "error" && errorMsg && (
          <p
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            role="alert"
          >
            {errorMsg}
          </p>
        )}

        <div className="relative mt-5">
          <AnimatePresence>
            {pulseSubmit && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-md bg-gold/50"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0.35, 0], scale: [1, 1.06] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={status === "sending"}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-gold py-3.5 text-sm font-semibold text-navy shadow-[0_10px_28px_-10px_rgba(201,168,76,0.65)] transition hover:bg-gold-light active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
          >
            {!reduced && status === "idle" && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
              />
            )}
            <span className="relative z-[1] inline-flex items-center gap-2">
              {status === "sending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Send it to Kareem"
              )}
            </span>
          </button>
        </div>

        <p className="mt-3 text-center text-[0.72rem] leading-relaxed text-slateink/70">
          CA DRE #01998956 · Rodeo Realty Fine Estates · Equal Housing Opportunity
          <br />
          Not legal, tax, or lending advice — educational conversation only.
        </p>
      </div>
    </motion.form>
  );
}
