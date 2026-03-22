'use client';

import { VendorSidebar } from '@/components/layout/vendor-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useAuth } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { usePathname } from 'next/navigation';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();

  // Allow register page without vendor role
  if (pathname === '/vendor/register') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (profile?.role !== 'vendor' && profile?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Access denied. Vendor only.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <VendorSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
