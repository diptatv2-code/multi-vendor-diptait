'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { useCart } from '@/hooks/use-cart';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, itemsByVendor, clearCart } = useCart();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', country: 'US',
  });
  const [showNewAddress, setShowNewAddress] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false });
      setAddresses(data || []);
      const def = data?.find((a) => a.is_default);
      if (def) setSelectedAddress(def.id);
      else if (!data?.length) setShowNewAddress(true);
    }
    fetch();
  }, [user]);

  async function handlePlaceOrder() {
    if (!user) return;
    if (!selectedAddress && !showNewAddress) {
      toast({ title: 'Please select an address', type: 'error' });
      return;
    }

    setPlacing(true);
    const supabase = createClient();

    let shippingAddress: Record<string, string> = {};

    if (showNewAddress) {
      // Save new address
      const { data: addr } = await supabase.from('addresses').insert({
        user_id: user.id,
        label: 'Default',
        ...newAddress,
        is_default: addresses.length === 0,
      }).select().single();
      if (addr) shippingAddress = newAddress;
    } else {
      const addr = addresses.find((a) => a.id === selectedAddress);
      if (addr) {
        shippingAddress = {
          full_name: addr.full_name, phone: addr.phone,
          address_line1: addr.address_line1, address_line2: addr.address_line2 || '',
          city: addr.city, state: addr.state, postal_code: addr.postal_code, country: addr.country,
        };
      }
    }

    // Create one order per vendor
    for (const [vendorId, vendorItems] of Object.entries(itemsByVendor)) {
      const subtotal = vendorItems.reduce((s, item) => {
        const price = item.variant?.price || item.product?.price || 0;
        return s + price * item.quantity;
      }, 0);

      // Get vendor commission rate
      const { data: vendor } = await supabase.from('vendor_profiles').select('commission_rate').eq('id', vendorId).single();
      const commissionRate = vendor?.commission_rate || 10;
      const commissionAmount = subtotal * (commissionRate / 100);

      const orderNumber = generateOrderNumber();

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user.id,
        vendor_id: vendorId,
        order_number: orderNumber,
        subtotal,
        total: subtotal,
        commission_amount: commissionAmount,
        shipping_address: shippingAddress,
      }).select().single();

      if (error || !order) {
        toast({ title: 'Error placing order', description: error?.message, type: 'error' });
        setPlacing(false);
        return;
      }

      // Insert order items
      await supabase.from('order_items').insert(
        vendorItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product?.name || '',
          variant_name: item.variant?.name || null,
          price: item.variant?.price || item.product?.price || 0,
          quantity: item.quantity,
          total: (item.variant?.price || item.product?.price || 0) * item.quantity,
        }))
      );

      // Add status history
      await supabase.from('order_status_history').insert({
        order_id: order.id,
        status: 'pending',
        note: 'Order placed',
        created_by: user.id,
      });

      // Update product stock
      for (const item of vendorItems) {
        await supabase.from('products').update({
          stock_quantity: Math.max(0, (item.product?.stock_quantity || 0) - item.quantity),
          total_sold: (item.product?.total_sold || 0) + item.quantity,
        }).eq('id', item.product_id);
      }

      // Update vendor stats
      await supabase.from('vendor_profiles').update({
        total_sales: (vendor as Record<string, number>)?.total_sales || 0 + vendorItems.reduce((s, i) => s + i.quantity, 0),
        total_revenue: (vendor as Record<string, number>)?.total_revenue || 0 + subtotal,
      }).eq('id', vendorId);
    }

    await clearCart();
    toast({ title: 'Order placed successfully!', type: 'success' });
    router.push('/orders');
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <button onClick={() => router.push('/products')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-semibold mb-4">Shipping Address</h2>

            {addresses.length > 0 && !showNewAddress && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer ${selectedAddress === addr.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                    <div>
                      <p className="font-medium text-sm">{addr.full_name}</p>
                      <p className="text-sm text-gray-500">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                      <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.postal_code}</p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                <button onClick={() => setShowNewAddress(true)} className="text-sm text-indigo-600 font-medium hover:underline">
                  + Add new address
                </button>
              </div>
            )}

            {showNewAddress && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Full Name *" value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                  <input type="tel" placeholder="Phone *" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
                <input type="text" placeholder="Address Line 1 *" value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                <input type="text" placeholder="Address Line 2" value={newAddress.address_line2} onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input type="text" placeholder="City *" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                  <input type="text" placeholder="State *" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                  <input type="text" placeholder="ZIP *" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                  <input type="text" placeholder="Country" value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
                {addresses.length > 0 && (
                  <button onClick={() => setShowNewAddress(false)} className="text-sm text-gray-500 hover:underline">Use existing address</button>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product?.name} x {item.quantity}</span>
                  <span>{formatPrice((item.variant?.price || item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Vendors</span>
                <span>{Object.keys(itemsByVendor).length} (separate orders)</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
