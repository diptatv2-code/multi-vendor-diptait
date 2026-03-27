import { DashboardCardSkeleton } from '@/components/ui/skeleton';

export default function VendorLoading() {
  return (
    <div>
      <div className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
