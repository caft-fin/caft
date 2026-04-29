import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
