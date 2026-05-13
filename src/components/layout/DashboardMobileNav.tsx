'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Database, GraduationCap, Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function DashboardMobileNav() {
  const pathname = usePathname();
  const setMobileMenuOpen = useStore(state => state.setMobileMenuOpen);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Manage', href: '/dashboard/management', icon: Database },
    { name: 'Learning', href: '/dashboard/learning', icon: GraduationCap },
    { name: 'More', href: '#', icon: Menu, isButton: true },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 border-t rounded-t-2xl border-gray-200 bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(255,149,0,0.1)] flex justify-around items-center px-4 py-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;
        if (item.isButton) {
          return (
            <button
              key={item.name}
              onClick={() => setMobileMenuOpen(true)}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 active:scale-90 duration-150 text-gray-400 hover:text-orange-500 transition-all`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{item.name}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center rounded-xl px-3 py-1 active:scale-90 duration-150 ${
              isActive
                ? 'text-orange-600 bg-orange-100/50'
                : 'text-gray-400 hover:text-orange-500 transition-all'
            }`}
          >
            <IconComponent className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
