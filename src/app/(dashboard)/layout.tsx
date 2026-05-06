'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardMobileNav } from "@/components/layout/DashboardMobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage before checking auth
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [hydrated, isAuthenticated]);

  // Show nothing while hydrating to prevent flash of content
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <div className="flex-1">
          {children}
        </div>
        <DashboardMobileNav />
      </main>
    </div>
  );
}
