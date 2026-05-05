'use client';

import { useStore } from '@/store/useStore';
import { Menu, Search, Bell, HelpCircle } from 'lucide-react';
import Image from 'next/image';

export function DashboardHeader() {
  const user = useStore(state => state.user);
  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDRAqVpnM2SgRG47Xn9-wEBcer1EsvX7h1vK1YkXuIsfX73wCL22npGIvJAf1qvzbCxqlFg595DuxLk1_Uq_AShET13upSn_ODbQHzTFykDeiW_c6wgQaUk2YRzB-yTQ5vOrvrX_BQztHShteuQApCiz5p0iGyDzYW0FPXJvOyYRVqgtUtdrKF3OTN1FjrTGKuzgR_SbJyghIhI9whkXMSjTg-FcGo-R2D6jSY142Qkx9EzoBox-WPkXYBBjZQKzr9-yhC7YOoQd38";

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm shadow-orange-500/5 px-6 py-3 h-16 flex justify-between items-center w-full">
      <div className="flex items-center gap-4 lg:hidden">
        <Menu className="text-orange-600 w-6 h-6" />
        <span className="text-xl font-bold tracking-tight text-orange-600 font-headline-sm">CAFT</span>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button className="p-2 rounded-full hover:bg-orange-50/50 text-gray-500 transition-colors active:scale-95">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">{user?.name || 'User'}</p>
            <p className="text-[10px] text-orange-500 font-label-md uppercase tracking-wider">{user?.membershipLevel || 'Premium Member'}</p>
          </div>
          <Image 
            alt="User profile avatar" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover" 
            src={user?.avatarUrl || defaultAvatar}
            width={40}
            height={40}
            unoptimized
          />
        </div>
      </div>
    </header>
  );
}
