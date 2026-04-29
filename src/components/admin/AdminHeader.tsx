'use client';

import { Search, Bell, HelpCircle, Settings } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-15rem)] h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-orange-500" />
          <input 
            className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all placeholder:text-gray-400 outline-none" 
            placeholder="Search management records, campaigns, analytics..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 text-gray-500 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-600 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2.5 text-gray-500 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all">
          <HelpCircle className="w-6 h-6" />
        </button>
        <button className="p-2.5 text-gray-500 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all">
          <Settings className="w-6 h-6" />
        </button>
        <div className="h-8 w-px bg-gray-100 mx-2"></div>
      </div>
    </header>
  );
}
