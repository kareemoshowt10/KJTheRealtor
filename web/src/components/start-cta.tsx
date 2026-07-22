export function StartCta() {
  return (
    <section
      id="start"
      className="bg-navy py-16 text-cream md:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
            When you&apos;re ready
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-medium leading-tight">
            The library is free.{" "}
            <em className="font-normal italic text-gold-light">
              So is the first conversation.
            </em>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-cream/80">
            Tell me what you&apos;re working toward. One personal reply from me —
            a real starting strategy, not a sales script.
          </p>
          <div className="mt-8 space-y-2 text-sm">
            <a href="tel:+18184027326" className="block font-display text-xl text-cream hover:text-gold-light">
              (818) 402-7326
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/50">
                Call or text
              </span>
            </a>
            <a
              href="mailto:kjamal@rodeore.com"
              className="block font-display text-xl text-cream hover:text-gold-light"
            >
              kjamal@rodeore.com
              <span className="mt-0.5 block font-sans text-xs font-semibold uppercase tracking-wider text-cream/50">
                Direct email
              </span>
            </a>
          </div>
        </div>

        <form
          action="https://formspree.io/f/xnjlgvlk"
          method="POST"
          className="rounded-2xl border border-gold/50 bg-paper p-6 text-navy shadow-2xl md:p-8"
        >
          <h3 className="font-display text-xl font-medium">Kitchen-table start</h3>
          <p className="mt-1 text-sm text-slateink">
            Takes 30 seconds. Replied to personally, usually same day.
          </p>
          <input type="hidden" name="_subject" value="Hybrid Next homepage lead — kareemjamaltherealtor" />
          <input type="hidden" name="source" value="web hybrid homepage" />
          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Name
            <input
              required
              name="name"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            Email
            <input
              required
              type="email"
              name="email"
              className="mt-1.5 w-full rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slateink">
            What&apos;s on your mind? <span className="font-normal normal-case tracking-normal text-slateink/70">(optional)</span>
            <textarea
              name="message"
              rows={3}
              className="mt-1.5 w-full resize-y rounded-md border border-[#e3d8c7] bg-white px-3 py-2.5 text-base text-navy outline-none focus:border-gold-deep focus:ring-2 focus:ring-gold/30"
              placeholder="Parents' home, Prop 19, buy/sell timing…"
            />
          </label>
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-gold/40 bg-cream p-3 text-sm">
            <input
              required
              type="checkbox"
              name="consent"
              value="Yes — explicit permission granted"
              className="mt-0.5 h-5 w-5 accent-gold-deep"
            />
            <span>
              You have my explicit permission to reply once. No drip campaign, no list, ever.
            </span>
          </label>
          <button
            type="submit"
            className="mt-5 w-full rounded-md bg-gold py-3.5 text-sm font-semibold text-navy transition hover:bg-gold-light"
          >
            Send it to Kareem
          </button>
          <p className="mt-3 text-center text-[0.72rem] text-slateink/70">
            CA DRE #01998956 · Raised in Chatsworth &amp; West Hills
          </p>
        </form>
      </div>
    </section>
  );
}
