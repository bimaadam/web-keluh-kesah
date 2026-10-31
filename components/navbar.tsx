'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/isiform', label: 'Tulis' },
  { href: '/keluhkesah', label: 'Baca' },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="nb-row border-b border-rule">
      <div className="nb-margin" />
      <nav aria-label="Utama" className="nb-body flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-5">
        <Link href="/" className="font-serif text-xl font-medium italic tracking-tight">
          Keluh Kesah
        </Link>
        <ul className="flex items-baseline gap-5 text-sm font-medium">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className="stabilo px-0.5 underline-offset-4 hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href="https://saweria.co/bimrin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-0.5 text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Donasi <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
