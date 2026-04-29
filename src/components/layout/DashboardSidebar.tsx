'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Database, User, Settings, Plus, HelpCircle, LogOut } from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Management', href: '/dashboard/management', icon: Database },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 border-r sticky left-0 top-0 bg-white border-gray-100 shadow-xl shadow-orange-900/5 space-y-2 py-6 z-40">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <h1 className="text-lg font-extrabold text-orange-600 font-headline-sm leading-none">CAFT Financial</h1>
          </Link>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all duration-300 font-button ${
                isActive
                  ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:translate-x-1'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 mt-auto space-y-1">
        <button className="w-full mb-4 bg-gradient-to-r from-primary-container to-secondary-container text-white py-3 rounded-xl font-button shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
          <Plus className="w-4 h-4" />
          New Transaction
        </button>
        <Link href="#" className="flex items-center gap-3 text-gray-600 px-4 py-3 hover:bg-gray-50 hover:translate-x-1 transition-all duration-300 font-button">
          <HelpCircle className="w-5 h-5" />
          Support
        </Link>
        <Link href="/" className="flex items-center gap-3 text-gray-600 px-4 py-3 hover:bg-gray-50 hover:translate-x-1 transition-all duration-300 font-button">
          <LogOut className="w-5 h-5" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
