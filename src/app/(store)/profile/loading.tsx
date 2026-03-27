import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
