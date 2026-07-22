"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const defaultLinks: NavLink[] = [
  { href: "/#family-table", label: "Families" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/#zips", label: "Zip codes" },
  { href: "/91311", label: "91311" },
  {
    href: "https://kareemjamaltherealtor.com/#library",
    label: "Library",
    external: true,
  },
];

export function SiteHeader({
  links = defaultLinks,
  ctaHref = "/#start",
  ctaLabel = "Start a conversation",
}: {
  links?: NavLink[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/25 bg-navy/95 text-cream backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative h-10 w-10 overflow-hidden rounded-lg border border-gold/35 bg-black">
            <Image
              src="/assets/jamal-real-estate-logo.png"
              alt=""
              width={40}
              height={40}
              className="object-cover"
            />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[1.05rem] text-cream">
              Kareem Jamal
            </span>
            <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-gold">
              Generational Wealth Realtor
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              className="text-sm font-medium text-cream/85 transition hover:text-gold-light"
            >
              {l.label}
            </a>
          ))}
          <a
            href={ctaHref}
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:bg-gold-light"
          >
            {ctaLabel}
          </a>
        </nav>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-cream/20 text-cream md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-gold/20 bg-navy md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="flex flex-col px-5 py-3">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              className="border-t border-cream/10 py-3 text-base text-cream/90"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={ctaHref}
            className="mb-2 mt-2 rounded-md bg-gold px-4 py-3 text-center text-sm font-semibold text-navy"
            onClick={() => setOpen(false)}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
