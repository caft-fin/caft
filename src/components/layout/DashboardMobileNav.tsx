'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, User, Menu } from 'lucide-react';

export function DashboardMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'More', href: '#', icon: Menu },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 border-t rounded-t-2xl border-gray-200 bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(255,149,0,0.1)] flex justify-around items-center px-4 py-2 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;
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
