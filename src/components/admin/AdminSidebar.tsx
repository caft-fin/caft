'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { LayoutDashboard, BarChart3, Users, Mail, User, Settings } from 'lucide-react';
import Image from 'next/image';

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useStore(state => state.user);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Management', path: '/admin/management', icon: Users },
    { name: 'Emails', path: '/admin/emails', icon: Mail },
    { name: 'Profile', path: '/admin/profile', icon: User },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r border-gray-100 bg-white flex flex-col z-50">
      <div className="p-8">
        <h1 className="text-xl font-black text-orange-600 tracking-tight font-headline-md">CAFT Financial</h1>
        <p className="text-[10px] font-label-md text-gray-400 uppercase tracking-[0.2em] mt-1">Admin Portal</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600 font-bold active-nav-bg'
                  : 'text-gray-500 hover:text-orange-600 font-medium'
              }`}
            >
              <IconComponent className="w-[22px] h-[22px]" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <Image 
            alt="Admin Profile" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-50" 
            src={user?.avatarUrl || "https://ui-avatars.com/api/?name=Admin"} 
            width={40}
            height={40}
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-on-surface truncate">{user?.name || 'Alex Rivera'}</p>
            <p className="text-[11px] text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
