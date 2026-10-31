'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotebookRow, focusRing, stabilo } from './notebook';

const links = [
  { href: '/isiform', label: 'Tulis' },
  { href: '/keluhkesah', label: 'Baca' },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <NotebookRow as="header" className="border-b border-rule">
      <nav aria-label="Utama" className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-5">
        <Link href="/" className={`font-serif text-xl font-medium tracking-tight italic ${focusRing}`}>
          Keluh Kesah
        </Link>
        <ul className="flex items-baseline gap-5 text-sm font-medium">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className={`px-0.5 underline-offset-4 hover:underline aria-[current=page]:bg-size-[100%_85%] aria-[current=page]:text-on-highlight ${stabilo} ${focusRing}`}
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
              className={`px-0.5 text-muted underline-offset-4 hover:text-ink hover:underline ${focusRing}`}
            >
              Donasi <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </nav>
    </NotebookRow>
  );
};

export default Navbar;
