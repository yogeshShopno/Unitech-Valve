'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navLinks = [
  { name: 'Dashboard', href: '/' },
  { name: 'Quotations', href: '/quotations' },
  { name: 'Clients', href: '/clients' },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center px-6 py-3 w-full bg-primary text-white font-headline font-medium uppercase tracking-wider sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-white tracking-tighter">Industrial Ledger</span>
        <nav className="hidden md:flex gap-6 text-sm">
          {/* {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-white border-b-2 border-white pb-1" : "text-primary-container hover:text-white"
                )}
              >
                {link.name}
              </Link>
            );
          })} */}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* <div className="relative flex items-center bg-white/10 px-3 py-1.5">
          <Search className="w-4 h-4 mr-2" />
          <input
            type="text"
            className="bg-transparent border-none focus:ring-0 text-xs placeholder:text-white/50 w-48 uppercase outline-none"
            placeholder="SEARCH CLIENTS..."
          />
        </div>
        <Link 
          href="/quotations/new"
          className="bg-primary-dim hover:bg-primary-container hover:text-primary px-4 py-1.5 text-xs font-bold transition-colors"
        >
          Create Quotation
        </Link> */}
        {/* <div className="w-8 h-8 relative overflow-hidden">
          <Image
            src="https://picsum.photos/seed/manager/100/100"
            alt="User profile"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div> */}
      </div>
    </header>
  );
}
