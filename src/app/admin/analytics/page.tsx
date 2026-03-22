'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { DashboardCardSkeleton } from '@/components/ui/skeleton';
import { TrendingUp, ShoppingCart, DollarSign, Users, Package, Store } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({});
  const [topVendors, setTopVendors] = useState<{ business_name: string; total_revenue: number; total_sales: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();

      const [orders, products, vendors, users] = await Promise.all([
        supabase.from('orders').select('status, total, commission_amount'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_profiles').select('business_name, total_revenue, total_sales').eq('status', 'approved').order('total_revenue', { ascending: false }).limit(10),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      ]);

      const orderData = orders.data || [];
      const totalRevenue = orderData.reduce((s, o) => s + Number(o.total), 0);
      const totalCommission = orderData.reduce((s, o) => s + Number(o.commission_amount), 0);

      const statusCounts: Record<string, number> = {};
      orderData.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

      setStats({
        totalRevenue,
        totalCommission,
        netVendorPayout: totalRevenue - totalCommission,
        totalOrders: orderData.length,
        totalProducts: products.count || 0,
        totalUsers: users.count || 0,
        avgOrderValue: orderData.length > 0 ? totalRevenue / orderData.length : 0,
      });
      setOrdersByStatus(statusCounts);
      setTopVendors(vendors.data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Analytics & Reports</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics & Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
          { label: 'Total Commission', value: formatPrice(stats.totalCommission), icon: TrendingUp, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Net Vendor Payout', value: formatPrice(stats.netVendorPayout), icon: DollarSign, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
          { label: 'Avg Order Value', value: formatPrice(stats.avgOrderValue), icon: ShoppingCart, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
        ].map((c) => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{c.label}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold">Orders by Status</h2>
          </div>
          <div className="p-6 space-y-3">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm capitalize">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${(count / (stats.totalOrders || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(ordersByStatus).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No orders data</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold">Top Vendors by Revenue</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {topVendors.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No vendor data</p>
            ) : (
              topVendors.map((v, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400 w-6">#{i + 1}</span>
                    <span className="text-sm font-medium">{v.business_name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPrice(v.total_revenue)}</p>
                    <p className="text-xs text-gray-500">{v.total_sales} sales</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
