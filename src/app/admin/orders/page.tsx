'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import type { Order } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      let query = supabase
        .from('orders')
        .select('*, vendor:vendor_profiles(business_name), customer:user_profiles!orders_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (filter !== 'all') query = query.eq('status', filter);
      const { data } = await query;
      setOrders((data as unknown as Order[]) || []);
      setLoading(false);
    }
    fetch();
  }, [filter]);

  const filters = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Monitoring</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        {orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="w-8 h-8 text-gray-400" />} title="No orders found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Order #</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Commission</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-6 py-4 font-medium">{o.order_number}</td>
                  <td className="px-6 py-4">{(o.customer as unknown as { full_name: string })?.full_name}</td>
                  <td className="px-6 py-4">{(o.vendor as unknown as { business_name: string })?.business_name}</td>
                  <td className="px-6 py-4">{formatPrice(o.total)}</td>
                  <td className="px-6 py-4 text-green-600">{formatPrice(o.commission_amount)}</td>
                  <td className="px-6 py-4"><Badge status={o.status} /></td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
