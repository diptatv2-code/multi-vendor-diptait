'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { ORDER_STATUSES } from '@/lib/constants';
import type { Order } from '@/lib/types';

export default function VendorOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  async function fetchOrders() {
    if (!user) return;
    const supabase = createClient();
    const { data: v } = await supabase.from('vendor_profiles').select('id').eq('user_id', user.id).single();
    if (!v) return;

    let query = supabase
      .from('orders')
      .select('*, customer:user_profiles!orders_user_id_fkey(full_name, email), items:order_items(*, product:products(name))')
      .eq('vendor_id', v.id)
      .order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setOrders((data as unknown as Order[]) || []);
  }

  useEffect(() => { fetchOrders(); }, [user, filter]);

  async function updateOrderStatus() {
    if (!selectedOrder || !newStatus) return;
    const supabase = createClient();
    await supabase.from('orders').update({ status: newStatus }).eq('id', selectedOrder.id);
    await supabase.from('order_status_history').insert({
      order_id: selectedOrder.id,
      status: newStatus,
      note: statusNote || null,
      created_by: user?.id,
    });
    toast({ title: 'Order status updated', type: 'success' });
    setSelectedOrder(null);
    setNewStatus('');
    setStatusNote('');
    fetchOrders();
  }

  const filters = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-[#F57224] text-white' : 'bg-white dark:bg-[#111] border border-[#F0F0F0] dark:border-[#222] hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-[#F0F0F0] dark:border-[#222] overflow-x-auto">
        {orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="w-8 h-8 text-gray-400" />} title="No orders found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] dark:border-[#222] text-left text-[#86868B]">
                <th className="px-6 py-3 font-medium">Order #</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[#F0F0F0] dark:border-[#222]">
                  <td className="px-6 py-3 font-medium">{o.order_number}</td>
                  <td className="px-6 py-3">{(o.customer as unknown as { full_name: string })?.full_name}</td>
                  <td className="px-6 py-3">{o.items?.length || 0}</td>
                  <td className="px-6 py-3">{formatPrice(o.total)}</td>
                  <td className="px-6 py-3"><Badge status={o.status} /></td>
                  <td className="px-6 py-3 text-[#86868B]">{formatDate(o.created_at)}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => { setSelectedOrder(o); setNewStatus(o.status); }}
                      className="text-[#F57224] text-sm hover:underline">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.order_number}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{(item as unknown as { product: { name: string } }).product?.name} x {item.quantity}</span>
                  <span>{formatPrice(item.total)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Update Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <input type="text" value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">Cancel</button>
              <button onClick={updateOrderStatus} className="px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium">Update Status</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
