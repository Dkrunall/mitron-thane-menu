'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavLink {
  href: string;
  label: string;
}

export function AdminNavBar({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="-mx-3 sm:-mx-6 mt-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar px-3 sm:px-6 py-1">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap rounded-xl px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
              isActive
                ? 'border border-[#ff6830]/60 bg-[#ff6830]/15 text-[#ff8a3d] shadow-[0_0_16px_rgba(230,64,26,0.25)]'
                : 'border border-white/[0.08] bg-[#121215]/80 text-zinc-400 hover:border-white/20 hover:bg-[#18181c] hover:text-zinc-100'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
