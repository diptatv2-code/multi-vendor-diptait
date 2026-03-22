'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { ShoppingCart, Package } from 'lucide-react';
import type { Order, OrderStatusHistory } from '@/lib/types';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, vendor:vendor_profiles(business_name), items:order_items(*, product:products(name, slug, images:product_images(*)))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setOrders((data as unknown as Order[]) || []);
    }
    fetch();
  }, [user]);

  async function viewOrder(order: Order) {
    setSelectedOrder(order);
    const supabase = createClient();
    const { data } = await supabase.from('order_status_history').select('*').eq('order_id', order.id).order('created_at', { ascending: false });
    setStatusHistory(data || []);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-gray-400" />}
          title="No orders yet"
          description="Your order history will appear here"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold">{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {(order.vendor as unknown as { business_name: string })?.business_name} &middot; {formatDate(order.created_at)}
                  </p>
                </div>
                <Badge status={order.status} />
              </div>

              <div className="space-y-2 mb-4">
                {order.items?.slice(0, 3).map((item) => {
                  const img = (item.product as unknown as { images: { url: string; is_primary: boolean }[] })?.images?.find((i) => i.is_primary) || (item.product as unknown as { images: { url: string }[] })?.images?.[0];
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {img ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-3 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} &middot; {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  );
                })}
                {(order.items?.length || 0) > 3 && (
                  <p className="text-xs text-gray-500">+{(order.items?.length || 0) - 3} more items</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0] dark:border-[#222]">
                <span className="font-bold">{formatPrice(order.total)}</span>
                <button onClick={() => viewOrder(order)} className="text-sm text-[#F57224] font-medium hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.order_number}`} maxWidth="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge status={selectedOrder.status} />
              <span className="text-sm text-gray-500">{formatDateTime(selectedOrder.created_at)}</span>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-2">Items</h3>
              <div className="space-y-2 text-sm">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product_name} x {item.quantity}</span>
                    <span>{formatPrice(item.total)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#F0F0F0] dark:border-[#333] flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-2">Shipping Address</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{selectedOrder.shipping_address?.full_name}</p>
                <p>{selectedOrder.shipping_address?.address_line1}</p>
                <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postal_code}</p>
              </div>
            </div>

            {statusHistory.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2">Status History</h3>
                <div className="space-y-2">
                  {statusHistory.map((sh) => (
                    <div key={sh.id} className="flex items-center gap-3 text-sm">
                      <Badge status={sh.status} />
                      <span className="text-gray-500">{formatDateTime(sh.created_at)}</span>
                      {sh.note && <span className="text-gray-400">- {sh.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
