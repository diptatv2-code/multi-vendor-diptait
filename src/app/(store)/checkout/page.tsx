'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { useCart } from '@/hooks/use-cart';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { DELIVERY_ZONES } from '@/lib/constants';
import { Truck, Banknote } from 'lucide-react';
import type { Address } from '@/lib/types';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, itemsByVendor, clearCart } = useCart();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka');
  const [newAddress, setNewAddress] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: 'Dhaka', state: '', postal_code: '', country: 'Bangladesh',
  });
  const [showNewAddress, setShowNewAddress] = useState(false);

  const deliveryFee = DELIVERY_ZONES.find((z) => z.value === deliveryZone)?.fee || 70;
  const grandTotal = totalPrice + deliveryFee;

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

    // Validate address
    if (showNewAddress) {
      if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city) {
        toast({ title: 'Please fill in all required address fields', type: 'error' });
        return;
      }
    } else if (!selectedAddress) {
      toast({ title: 'Please select a delivery address', type: 'error' });
      return;
    }

    setPlacing(true);
    const supabase = createClient();

    let shippingAddress: Record<string, string> = {};

    if (showNewAddress) {
      const { data: addr } = await supabase.from('addresses').insert({
        user_id: user.id,
        label: 'Default',
        ...newAddress,
        is_default: addresses.length === 0,
      }).select().single();
      if (addr) shippingAddress = { ...newAddress, delivery_zone: deliveryZone };
    } else {
      const addr = addresses.find((a) => a.id === selectedAddress);
      if (addr) {
        shippingAddress = {
          full_name: addr.full_name, phone: addr.phone,
          address_line1: addr.address_line1, address_line2: addr.address_line2 || '',
          city: addr.city, state: addr.state, postal_code: addr.postal_code, country: addr.country,
          delivery_zone: deliveryZone,
        };
      }
    }

    // Split order per vendor
    const vendorCount = Object.keys(itemsByVendor).length;
    const perVendorDeliveryFee = Math.ceil(deliveryFee / vendorCount);

    for (const [vendorId, vendorItems] of Object.entries(itemsByVendor)) {
      const subtotal = vendorItems.reduce((s, item) => {
        const price = item.variant?.price || item.product?.price || 0;
        return s + price * item.quantity;
      }, 0);

      const { data: vendor } = await supabase.from('vendor_profiles').select('commission_rate, total_sales, total_revenue').eq('id', vendorId).single();
      const commissionRate = vendor?.commission_rate || 10;
      const commissionAmount = subtotal * (commissionRate / 100);

      const orderNumber = generateOrderNumber();
      const orderTotal = subtotal + perVendorDeliveryFee;

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user.id,
        vendor_id: vendorId,
        order_number: orderNumber,
        subtotal,
        shipping_fee: perVendorDeliveryFee,
        total: orderTotal,
        commission_amount: commissionAmount,
        shipping_address: shippingAddress,
        notes: 'Payment: Cash on Delivery (COD)',
      }).select().single();

      if (error || !order) {
        toast({ title: 'Error placing order', description: error?.message, type: 'error' });
        setPlacing(false);
        return;
      }

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

      await supabase.from('order_status_history').insert({
        order_id: order.id, status: 'pending', note: 'Order placed - Cash on Delivery', created_by: user.id,
      });

      for (const item of vendorItems) {
        await supabase.from('products').update({
          stock_quantity: Math.max(0, (item.product?.stock_quantity || 0) - item.quantity),
          total_sold: (item.product?.total_sold || 0) + item.quantity,
        }).eq('id', item.product_id);
      }

      await supabase.from('vendor_profiles').update({
        total_sales: (vendor?.total_sales || 0) + vendorItems.reduce((s, i) => s + i.quantity, 0),
        total_revenue: (vendor?.total_revenue || 0) + subtotal,
      }).eq('id', vendorId);
    }

    await clearCart();
    toast({ title: 'Order placed successfully!', description: 'You will pay cash on delivery.', type: 'success' });
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
            <h2 className="font-semibold mb-4">Delivery Address (ডেলিভারি ঠিকানা)</h2>

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
                  <input type="text" placeholder="Full Name / নাম *" value={newAddress.full_name} onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                  <input type="tel" placeholder="Phone / ফোন নম্বর *" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
                <input type="text" placeholder="Full Address / সম্পূর্ণ ঠিকানা *" value={newAddress.address_line1} onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })} required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                <input type="text" placeholder="Area / এলাকা (e.g., Dhanmondi, Mirpur)" value={newAddress.address_line2} onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="City / শহর *" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                  <input type="text" placeholder="District / জেলা" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                  <input type="text" placeholder="Postal Code / ডাক কোড" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                </div>
                {addresses.length > 0 && (
                  <button onClick={() => setShowNewAddress(false)} className="text-sm text-gray-500 hover:underline">Use existing address</button>
                )}
              </div>
            )}
          </div>

          {/* Delivery Zone */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold">Delivery Zone (ডেলিভারি জোন)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERY_ZONES.map((zone) => (
                <label key={zone.value} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${deliveryZone === zone.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="deliveryZone" checked={deliveryZone === zone.value} onChange={() => setDeliveryZone(zone.value)} />
                    <span className="text-sm font-medium">{zone.label}</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{formatPrice(zone.fee)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold">Payment Method (পেমেন্ট)</h2>
            </div>
            <label className="flex items-center gap-3 p-4 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800 cursor-pointer">
              <input type="radio" checked readOnly />
              <div>
                <p className="text-sm font-medium">Cash on Delivery (ক্যাশ অন ডেলিভারি)</p>
                <p className="text-xs text-gray-500">Pay when you receive your order</p>
              </div>
            </label>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-semibold mb-4">Order Items ({items.length})</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="flex-1">{item.product?.name} <span className="text-gray-400">x {item.quantity}</span></span>
                  <span className="font-medium">{formatPrice((item.variant?.price || item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Payment</span>
                <span>Cash on Delivery</span>
              </div>
              {Object.keys(itemsByVendor).length > 1 && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Vendors</span>
                  <span>{Object.keys(itemsByVendor).length} (separate orders)</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-indigo-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50">
              {placing ? 'Placing Order...' : 'Place Order (COD)'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">
              By placing this order, you agree to pay {formatPrice(grandTotal)} on delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
