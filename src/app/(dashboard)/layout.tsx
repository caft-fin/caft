import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardMobileNav } from "@/components/layout/DashboardMobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
