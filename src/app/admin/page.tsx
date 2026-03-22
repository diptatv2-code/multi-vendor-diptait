'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDate } from '@/lib/utils';
import { DashboardCardSkeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, Package, ShoppingCart, DollarSign, Store, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/lib/types';

interface Stats {
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  pendingProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const [vendors, pendingVendors, products, pendingProducts, orders, users] = await Promise.all([
        supabase.from('vendor_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      ]);

      const { data: revenueData } = await supabase.from('orders').select('total').in('status', ['delivered', 'shipped', 'processing', 'confirmed']);
      const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      const { data: recent } = await supabase
        .from('orders')
        .select('*, vendor:vendor_profiles(business_name), customer:user_profiles!orders_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalVendors: vendors.count || 0,
        pendingVendors: pendingVendors.count || 0,
        totalProducts: products.count || 0,
        pendingProducts: pendingProducts.count || 0,
        totalOrders: orders.count || 0,
        totalRevenue,
        totalUsers: users.count || 0,
      });
      setRecentOrders((recent as Order[]) || []);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <DashboardCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats!.totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Orders', value: stats!.totalOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Products', value: stats!.totalProducts, icon: Package, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', sub: `${stats!.pendingProducts} pending` },
    { label: 'Total Vendors', value: stats!.totalVendors, icon: Store, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', sub: `${stats!.pendingVendors} pending` },
    { label: 'Total Users', value: stats!.totalUsers, icon: Users, color: 'text-[#F57224] bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Avg Order Value', value: stats!.totalOrders > 0 ? formatPrice(stats!.totalRevenue / stats!.totalOrders) : '$0', icon: TrendingUp, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            {card.sub && <p className="text-xs text-yellow-600 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#F57224] hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders yet</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3 font-medium">{order.order_number}</td>
                    <td className="px-6 py-3">{(order.customer as unknown as { full_name: string })?.full_name || 'N/A'}</td>
                    <td className="px-6 py-3">{(order.vendor as unknown as { business_name: string })?.business_name || 'N/A'}</td>
                    <td className="px-6 py-3">{formatPrice(order.total)}</td>
                    <td className="px-6 py-3"><Badge status={order.status} /></td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(order.created_at)}</td>
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
