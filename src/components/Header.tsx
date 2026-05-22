'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Calendar, Home, ArrowRight } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const links = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Reserva', href: '/reserva', icon: Calendar },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 transition px-6 py-4 flex items-center justify-between relative">
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-9 w-9 bg-slate-900 group-hover:bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm transition-all duration-300">
            H
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-950">HOTELFLOW</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Links & PMS Access */}
      <div className="flex items-center space-x-3">
        {/* Mobile Navigation Links */}
        <nav className="flex md:hidden items-center space-x-1 mr-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`p-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
                title={link.name}
              >
                <link.icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>

        <Link
          href="/reception"
          className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-4 py-2.5 rounded-xl transition-all border border-indigo-100"
        >
          <span>Acceso PMS</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
