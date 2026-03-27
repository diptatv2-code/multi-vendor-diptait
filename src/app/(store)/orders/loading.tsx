import { Skeleton, TableRowSkeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F0F0F0] dark:border-[#222]">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
