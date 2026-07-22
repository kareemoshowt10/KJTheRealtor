export function ChatsworthHero() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden text-cream">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(5,12,28,0.92) 0%, rgba(5,15,32,0.62) 50%, rgba(5,15,32,0.35) 100%), url('/assets/cliffside-sunset.jpg')",
        }}
      />
      <span
        className="pointer-events-none absolute right-[-4%] top-[18%] select-none font-display text-[clamp(8rem,28vw,18rem)] font-medium leading-none text-cream/[0.06]"
        aria-hidden
      >
        91311
      </span>
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold">
          My Zip Codes · Chapter I of III · Where I&apos;m from
        </p>
        <p className="mt-4 font-display text-4xl font-medium tracking-tight text-gold md:text-5xl">
          913<em className="text-gold-light">11</em>
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-medium leading-[1.05] tracking-tight">
          Chatsworth. The Valley still keeps its{" "}
          <em className="font-normal italic text-gold-light">horses here.</em>
        </h1>
        <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-cream/88">
          Stagecoach ruts you can stand in. The most-filmed rocks in Hollywood
          history. One of the last real horse-keeping corners inside Los
          Angeles. This is the zip I&apos;m from — history for the heart, numbers
          for the head.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="#story"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-gold px-6 text-sm font-semibold text-navy transition hover:bg-gold-light"
          >
            Scroll the story
          </a>
          <a
            href="https://kareemjamaltherealtor.com/91311/home-value"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-cream/45 px-6 text-sm font-semibold text-cream transition hover:border-gold hover:text-gold-light"
          >
            Owners: Equity Snapshot
          </a>
          <a
            href="#connect"
            className="inline-flex min-h-12 items-center justify-center text-sm font-semibold text-gold-light underline-offset-4 hover:underline"
          >
            Talk 91311 with me →
          </a>
        </div>
        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cream/55">
          <span>Est. 1888</span>
          <span className="text-gold">·</span>
          <span>Horse-keeping zoning</span>
          <span className="text-gold">·</span>
          <span>Santa Susana Pass</span>
          <span className="text-gold">·</span>
          <span>Metrolink &amp; Amtrak</span>
        </div>
      </div>
    </section>
  );
}
