'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { formatPrice, formatDate } from '@/lib/utils';
import { DashboardCardSkeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart, DollarSign, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import type { VendorProfile, Order } from '@/lib/types';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data: v } = await supabase.from('vendor_profiles').select('*').eq('user_id', user!.id).single();
      if (!v) { setLoading(false); return; }
      setVendor(v);

      const [products, orders, pending] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('vendor_id', v.id),
        supabase.from('orders').select('*, customer:user_profiles!orders_user_id_fkey(full_name)').eq('vendor_id', v.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('vendor_id', v.id).eq('status', 'pending'),
      ]);

      setProductCount(products.count || 0);
      setRecentOrders((orders.data as unknown as Order[]) || []);
      setPendingOrderCount(pending.count || 0);
      setLoading(false);
    }
    fetch();
  }, [user]);

  if (!user) return <div className="py-10 text-center">Loading...</div>;

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-[#86868B] mb-4">No vendor profile found</p>
        <Link href="/vendor/register" className="px-6 py-2 bg-[#F57224] text-white rounded-lg">Register as Vendor</Link>
      </div>
    );
  }

  if (vendor.status === 'pending') {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Application Under Review</h2>
        <p className="text-[#86868B]">Your vendor application is being reviewed. You&apos;ll be notified once approved.</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Revenue', value: formatPrice(vendor.total_revenue), icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Sales', value: vendor.total_sales, icon: TrendingUp, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Products', value: productCount, icon: Package, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Pending Orders', value: pendingOrderCount, icon: ShoppingCart, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Rating', value: `${vendor.rating.toFixed(1)} (${vendor.rating_count})`, icon: Star, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-[#111] rounded-xl p-5 border border-[#F0F0F0] dark:border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#86868B]">{c.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.color}`}>
                <c.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-[#F0F0F0] dark:border-[#222]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] dark:border-[#222]">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/vendor/orders" className="text-sm text-[#F57224] hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] dark:border-[#222] text-left text-[#86868B]">
                <th className="px-6 py-3 font-medium">Order #</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#86868B]">No orders yet</td></tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-[#F0F0F0] dark:border-[#222]">
                    <td className="px-6 py-3 font-medium">{o.order_number}</td>
                    <td className="px-6 py-3">{(o.customer as unknown as { full_name: string })?.full_name}</td>
                    <td className="px-6 py-3">{formatPrice(o.total)}</td>
                    <td className="px-6 py-3"><Badge status={o.status} /></td>
                    <td className="px-6 py-3 text-[#86868B]">{formatDate(o.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
