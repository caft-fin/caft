'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BarChart3, Database, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/apiClient';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useStore(state => state.logout);
  const isMobileMenuOpen = useStore(state => state.isMobileMenuOpen);
  const setMobileMenuOpen = useStore(state => state.setMobileMenuOpen);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Management', href: '/dashboard/management', icon: Database },

    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore API errors — still clear local state
    }
    logout();
    router.replace('/');
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 flex flex-col h-screen w-64 bg-white border-r border-gray-100 shadow-xl space-y-2 py-6 z-[60] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              onClick={() => setMobileMenuOpen(false)}
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
        <Link href="#" className="flex items-center gap-3 text-gray-600 px-4 py-3 hover:bg-gray-50 hover:translate-x-1 transition-all duration-300 font-button">
          <HelpCircle className="w-5 h-5" />
          Support
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-600 px-4 py-3 hover:bg-red-50 hover:text-red-600 hover:translate-x-1 transition-all duration-300 font-button w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
