"use client";

/**
 * Appointment booker — the client half of Ch.22.
 *
 * Three things this UI has to get right, all of them consequences of the fact
 * that slot availability is a snapshot and not a reservation:
 *
 *  1. The idempotency key is minted ONCE per booking attempt and reused across
 *     retries. Minting it per-request would defeat the entire purpose.
 *  2. A 409 "slot_taken" is a normal outcome, not an error. Someone else got
 *     there first. Refresh the grid, keep the visitor's details, apologise
 *     briefly, let them pick again — never dump them back to an empty form.
 *  3. Time first, contact details second. Picking a time is a low-commitment
 *     act that makes the visitor feel they've already started; asking for a
 *     phone number before they've seen availability is why booking forms
 *     get abandoned.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type SlotTime = { id: string; time: string; kind: string; starts_at: string };
type SlotDay = { label: string; times: SlotTime[] };

type Props = {
  title?: string;
  subtitle?: string;
  topics?: string[];
  className?: string;
};

function newKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `k_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  }
}

/** Attribution written by track.js, if it has loaded. */
function attribution(): Record<string, string> {
  try {
    const w = window as unknown as {
      kjAttribution?: {
        last?: Record<string, string>;
        first?: Record<string, string>;
      };
      kjFunnel?: { visitorId: string; sessionId: string };
    };
    return {
      lead_source: w.kjAttribution?.last?.lead_source || "",
      first_touch_source: w.kjAttribution?.first?.lead_source || "",
      utm_campaign: w.kjAttribution?.last?.utm_campaign || "",
      landing_page: w.kjAttribution?.first?.landing_page || "",
      visitor_id: w.kjFunnel?.visitorId || "",
      session_id: w.kjFunnel?.sessionId || "",
    };
  } catch {
    return {};
  }
}

function emit(event: string, props?: Record<string, unknown>) {
  try {
    (
      window as unknown as {
        kjFunnel?: { track: (e: string, p?: Record<string, unknown>) => void };
      }
    ).kjFunnel?.track(event, props);
  } catch {
    /* analytics must never break the booking */
  }
}

export function AppointmentBooker({
  title = "Book a 30-minute conversation",
  subtitle = "Pick a time that works. No pitch — just your questions, answered.",
  topics = [
    "Selling in the next 6 months",
    "Buying / first purchase",
    "Parents' home & Prop 19",
    "Investment or house hacking",
    "Just exploring",
  ],
  className,
}: Props) {
  const [days, setDays] = useState<SlotDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const [slot, setSlot] = useState<SlotTime | null>(null);
  const [dayLabel, setDayLabel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState<{ when: string } | null>(null);

  // Minted once per attempt. Reset only after a booking succeeds or the
  // visitor picks a different slot — a retry of the SAME attempt must reuse it.
  const idemKey = useRef(newKey());

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/slots?days=14", { cache: "no-store" });
      const data = await res.json();
      if (!data.configured || !data.days?.length) {
        setUnavailable(true);
        setDays([]);
      } else {
        setUnavailable(false);
        setDays(data.days as SlotDay[]);
      }
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  function pick(day: SlotDay, t: SlotTime) {
    setSlot(t);
    setDayLabel(day.label);
    idemKey.current = newKey(); // new attempt
    setStatus("idle");
    setMessage("");
    emit("booking_slot_selected", { slot_id: t.id, when: `${day.label} ${t.time}` });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot || status === "sending") return;

    if (phone.replace(/\D/g, "").length < 10) {
      setStatus("error");
      setMessage("Please add a phone number I can reach you on.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idemKey.current,
        },
        body: JSON.stringify({
          slot_id: slot.id,
          name,
          phone,
          email,
          topic,
          notes,
          idempotency_key: idemKey.current,
          page_path: location.pathname,
          ...attribution(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setConfirmed({ when: data.when || `${dayLabel} at ${slot.time}` });
        setStatus("done");
        emit("appointment_booked", { slot_id: slot.id, booking_id: data.booking_id });
        return;
      }

      // Lost the race. Normal, not exceptional — recover in place.
      if (res.status === 409) {
        emit("booking_slot_taken", { slot_id: slot.id });
        setSlot(null);
        setStatus("error");
        setMessage("That time was just booked by someone else — here's what's still open.");
        await loadSlots();
        return;
      }

      if (res.status === 429) {
        setStatus("error");
        setMessage("That's a few attempts in a row — give it a minute, or just call (818) 402-7326.");
        return;
      }

      throw new Error(data.error || "failed");
    } catch {
      setStatus("error");
      setMessage(
        "Couldn't confirm that booking. Please call or text (818) 402-7326 and I'll lock it in."
      );
    }
  }

  // ---- confirmed -----------------------------------------------------------
  if (status === "done" && confirmed) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-gold/50 bg-paper p-8 text-center text-navy shadow-2xl md:p-10",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
          <Check size={28} strokeWidth={2.5} />
        </div>
        <h3 className="mt-5 font-display text-2xl font-medium">You&apos;re on my calendar.</h3>
        <p className="mt-3 font-semibold">{confirmed.when}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slateink">
          I&apos;ll call you at {phone}. If something changes, text me at{" "}
          <a href="sms:+18184027326" className="font-semibold underline underline-offset-2">
            (818) 402-7326
          </a>
          .
        </p>
      </div>
    );
  }

  // ---- no inventory --------------------------------------------------------
  if (!loading && unavailable) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-gold/50 bg-paper p-8 text-navy shadow-2xl",
          className
        )}
      >
        <h3 className="font-display text-xl font-medium">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slateink">
          My online calendar isn&apos;t showing openings right now. Call or text{" "}
          <a href="tel:+18184027326" className="font-semibold text-navy underline underline-offset-2">
            (818) 402-7326
          </a>{" "}
          and we&apos;ll find a time directly.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-gold/50 bg-paper p-6 text-navy shadow-2xl md:p-8",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CalendarDays size={22} className="mt-0.5 shrink-0 text-gold-deep" />
        <div>
          <h3 className="font-display text-xl font-medium">{title}</h3>
          <p className="mt-1 text-sm text-slateink">{subtitle}</p>
        </div>
      </div>

      {message && (
        <p
          className={cn(
            "mt-4 rounded-md border px-3 py-2 text-sm",
            status === "error"
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-gold/40 bg-gold/10"
          )}
          role="alert"
        >
          {message}
        </p>
      )}

      {/* Step 1 — pick a time */}
      {!slot && (
        <div className="mt-5">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-slateink">
              <Loader2 size={16} className="animate-spin" /> Loading openings…
            </p>
          ) : (
            <div className="space-y-4">
              {days.map((day) => (
                <div key={day.label}>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-gold-deep">
                    {day.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {day.times.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => pick(day, t)}
                        className="rounded-full border border-gold/45 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold transition hover:bg-gold/25 active:scale-[0.97]"
                      >
                        {t.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2 — who are you */}
      {slot && (
        <form onSubmit={submit} className="mt-5" noValidate>
          <div className="flex items-center justify-between rounded-lg border border-gold/45 bg-gold/15 px-3 py-2.5 text-sm">
            <span className="font-semibold">
              {dayLabel} · {slot.time}
            </span>
            <button
              type="button"
              onClick={() => {
                setSlot(null);
                setStatus("idle");
                setMessage("");
              }}
              className="text-xs font-semibold underline underline-offset-2"
            >
              change
            </button>
          </div>

          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/35"
            />
          </label>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Phone
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="(818) 000-0000"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/35"
            />
          </label>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Email{" "}
            <span className="font-normal normal-case tracking-normal text-slateink/70">
              (optional)
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/35"
            />
          </label>

          <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-gold-deep">
            What&apos;s this about?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t === topic ? "" : t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  topic === t
                    ? "border-gold bg-gold text-navy shadow-sm"
                    : "border-gold/45 bg-gold/10 text-navy hover:bg-gold/20"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Anything I should know first?{" "}
            <span className="font-normal normal-case tracking-normal text-slateink/70">
              (optional)
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full resize-y rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/35"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3.5 text-sm font-semibold text-navy shadow-[0_10px_28px_-10px_rgba(201,168,76,0.65)] transition hover:bg-gold-light active:scale-[0.99] disabled:cursor-wait disabled:opacity-80"
          >
            {status === "sending" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Confirming…
              </>
            ) : (
              "Confirm this time"
            )}
          </button>

          <p className="mt-3 text-center text-[0.72rem] leading-relaxed text-slateink/70">
            CA DRE #01998956 · Rodeo Realty Fine Estates · Equal Housing Opportunity
          </p>
        </form>
      )}
    </div>
  );
}
