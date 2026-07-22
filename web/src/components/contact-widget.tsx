"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMSPREE = "https://formspree.io/f/xnjlgvlk";
const TEL = "+18184027326";
const STORAGE_KEY = "kj_chat_widget_seen_v1";
const OPEN_DELAY_MS = 1100;

type Status = "idle" | "sending" | "ok" | "err";

/**
 * Chat-with-Kareem widget — front-and-center on first visit,
 * then a floating avatar for return traffic.
 * Port of production contact-widget.js, brand-aligned for hybrid.
 */
export function ContactWidget() {
  const reduced = useReducedMotion();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sentName, setSentName] = useState("");

  useEffect(() => {
    setMounted(true);
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* private mode */
    }

    if (!seen) {
      setFirstVisit(true);
      const t = window.setTimeout(() => {
        setOpen(true);
      }, OPEN_DELAY_MS);
      return () => window.clearTimeout(t);
    }
  }, []);

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setFirstVisit(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    markSeen();
  }, [markSeen]);

  const openPanel = useCallback(() => {
    setOpen(true);
    setStatus((s) => (s === "ok" ? "ok" : "idle"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || status === "ok") return;

    const n = name.trim();
    const digits = phone.replace(/\D/g, "");
    if (!n) {
      setStatus("err");
      setErrorMsg("Please add your name.");
      return;
    }
    if (digits.length < 10) {
      setStatus("err");
      setErrorMsg("Please add a valid phone number.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("name", n);
    fd.append("phone", phone.trim());
    if (message.trim()) fd.append("message", message.trim());
    fd.append("_subject", "Hybrid chat-widget lead");
    fd.append("source", "web hybrid chat widget");
    fd.append("goal", "Floating Chat Widget");
    fd.append("page", typeof window !== "undefined" ? window.location.pathname : "/");
    fd.append("_gotcha", "");

    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("bad");
      setSentName(n.split(" ")[0] || n);
      setStatus("ok");
      markSeen();
      try {
        const w = window as Window & { dataLayer?: Record<string, unknown>[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({
          event: "generate_lead",
          form_id: "chat-widget",
          form_source: "hybrid chat widget",
        });
      } catch {
        /* ignore */
      }
    } catch {
      setStatus("err");
      setErrorMsg(
        "Couldn’t send — please call or text (818) 402-7326."
      );
    }
  }

  if (!mounted) return null;

  const panel = (
    <div
      role="dialog"
      aria-modal={firstVisit && open ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        "overflow-hidden rounded-2xl border border-gold/40 bg-paper text-navy shadow-[0_28px_70px_-12px_rgba(5,12,28,0.45)]",
        firstVisit && open
          ? "w-full max-w-md"
          : "w-[min(340px,calc(100vw-1.5rem))]"
      )}
    >
      <div className="flex items-center gap-3 bg-gradient-to-br from-navy to-navy-mist px-4 py-3.5 text-cream">
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-gold/60">
          <Image
            src="/assets/kareem-jamal-headshot-2026-thumb.jpg"
            alt=""
            fill
            className="object-cover object-[50%_18%]"
            sizes="44px"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p id={titleId} className="font-semibold leading-tight">
            Kareem Jamal
          </p>
          <p className="text-[0.72rem] text-cream/75">
            Replies personally · usually same day
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          className="grid h-9 w-9 place-items-center rounded-lg text-cream/80 transition hover:bg-white/10 hover:text-cream"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 md:p-5">
        {status === "ok" ? (
          <div className="py-4 text-center" role="status">
            <p className="font-display text-xl text-navy">
              Got it{sentName ? `, ${sentName}` : ""}!
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slateink">
              I&apos;ll reach out personally — usually the same day. No drip
              list.
            </p>
            <a
              href={`tel:${TEL}`}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 text-sm font-semibold text-cream"
            >
              <Phone size={15} />
              Call now instead
            </a>
            <button
              type="button"
              onClick={close}
              className="mt-3 block w-full text-sm font-semibold text-gold-deep hover:underline"
            >
              Continue browsing
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-slateink">
              Hi 👋 Tell me what you&apos;re after and the best number to reach
              you — I&apos;ll text you back personally.
            </p>
            <form className="mt-4 space-y-2.5" onSubmit={onSubmit} noValidate>
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name*"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#e3d8c7] bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
              />
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone number*"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#e3d8c7] bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
              />
              <textarea
                name="message"
                rows={2}
                placeholder="Buying, selling, or just exploring? (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-y rounded-xl border border-[#e3d8c7] bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-full bg-gradient-to-r from-gold to-gold-deep py-3 text-sm font-bold text-navy shadow-[0_8px_22px_-6px_rgba(201,168,76,0.55)] transition hover:from-gold-light hover:to-gold disabled:opacity-70"
              >
                {status === "sending" ? "Sending…" : "Send to Kareem"}
              </button>
            </form>
            {status === "err" && errorMsg && (
              <p className="mt-2 text-center text-sm text-red-700" role="alert">
                {errorMsg}
              </p>
            )}
            <p className="mt-3 text-center text-[0.78rem] text-slateink/70">
              or{" "}
              <a href={`tel:${TEL}`} className="font-bold text-gold-deep">
                call
              </a>{" "}
              ·{" "}
              <a href={`sms:${TEL}`} className="font-bold text-gold-deep">
                text
              </a>{" "}
              (818) 402-7326
            </p>
            <p className="mt-2 text-center text-[0.65rem] text-slateink/50">
              Explicit reply only · CA DRE #01998956 ·{" "}
              <a href="/privacy" className="underline">
                Privacy
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* First-visit: front-and-center modal */}
      <AnimatePresence>
        {open && firstVisit && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-navy/55 backdrop-blur-[2px]"
              aria-label="Dismiss chat"
              onClick={close}
            />
            <motion.div
              className="relative z-[1] w-full max-w-md"
              initial={
                reduced ? false : { opacity: 0, y: 28, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {panel}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return visits / after dismiss: floating corner panel */}
      <AnimatePresence>
        {open && !firstVisit && (
          <motion.div
            className="fixed bottom-[5.5rem] right-4 z-[90] md:bottom-28 md:right-6"
            initial={reduced ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher avatar — always after first dismiss, or when panel closed */}
      {(!open || !firstVisit) && (
        <motion.button
          type="button"
          onClick={() => (open ? close() : openPanel())}
          aria-label={open ? "Close chat with Kareem" : "Chat with Kareem"}
          aria-expanded={open}
          initial={reduced ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: firstVisit ? 0 : 0.4, duration: 0.4 }}
          className={cn(
            "fixed z-[95] h-[62px] w-[62px] overflow-visible rounded-full border-0 bg-navy p-0 shadow-[0_10px_30px_rgba(5,12,28,0.35),0_0_0_3px_rgba(201,168,76,0.55)] transition hover:scale-105 active:scale-95",
            "right-4 bottom-[5.25rem] md:right-6 md:bottom-24",
            open && !firstVisit && "ring-2 ring-gold ring-offset-2 ring-offset-paper"
          )}
        >
          <span className="relative block h-full w-full overflow-hidden rounded-full">
            <Image
              src="/assets/kareem-jamal-headshot-2026-thumb.jpg"
              alt=""
              fill
              className="object-cover object-[50%_18%]"
              sizes="62px"
            />
          </span>
          <span
            className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-[2.5px] border-white bg-emerald-500"
            aria-hidden
          />
          <span className="pointer-events-none absolute right-[70px] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-cream opacity-0 shadow-lg transition group-hover:opacity-100 md:block">
            Chat with Kareem
          </span>
        </motion.button>
      )}
    </>
  );
}
