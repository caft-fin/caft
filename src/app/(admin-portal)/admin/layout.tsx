'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      if (!isAuthenticated) {
        sessionStorage.setItem('caft_post_login_redirect', window.location.pathname);
        router.replace('/admin/login');
      } else if (user?.role !== 'ADMIN' && !user?.isSuperAdmin) {
        // Kick out non-admins
        router.replace('/dashboard');
      }
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || (user?.role !== 'ADMIN' && !user?.isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FB]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FB] min-h-screen text-on-background font-body-md flex">
      <AdminSidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <AdminHeader />
        {/* Main Content Canvas */}
        <main className="pt-20 pb-12 px-8 w-full max-w-container-max mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
