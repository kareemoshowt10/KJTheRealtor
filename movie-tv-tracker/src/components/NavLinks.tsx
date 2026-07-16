'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/search', label: 'Search' },
  { href: '/discover', label: 'Discover' },
  { href: '/feed', label: 'Feed' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/lists', label: 'Lists' },
  { href: '/people', label: 'People' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-2 py-1 transition-colors ${
              active ? 'bg-accent/15 text-accent' : 'text-zinc-300 hover:text-accent'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
