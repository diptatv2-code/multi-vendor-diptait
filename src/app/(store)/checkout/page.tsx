'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/hooks/use-cart';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { DELIVERY_ZONES } from '@/lib/constants';
import { Truck, Banknote, CheckCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice, itemsByVendor, clearCart } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka');
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', address: '', city: 'Dhaka', district: '', area: '',
  });

  const deliveryFee = DELIVERY_ZONES.find((z) => z.value === deliveryZone)?.fee || 70;
  const grandTotal = totalPrice + deliveryFee;

  function updateForm(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function handlePlaceOrder() {
    if (!form.full_name || !form.phone || !form.address || !form.city) {
      toast({ title: 'Please fill in all required fields', type: 'error' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Your cart is empty', type: 'error' });
      return;
    }

    setPlacing(true);
    const supabase = createClient();

    // Check if user is already logged in
    let { data: { user } } = await supabase.auth.getUser();

    // If not logged in, auto-create account or sign in
    if (!user) {
      const email = form.email || `${form.phone.replace(/\D/g, '')}@guest.multivendor.bd`;
      const password = form.phone.replace(/\D/g, '');

      // Try sign up first
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: form.full_name, role: 'customer' },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        // If user exists, try sign in
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) {
            toast({ title: 'Account exists with different password', description: 'Please login first or use a different phone/email', type: 'error' });
            setPlacing(false);
            return;
          }
          user = signInData.user;
        } else {
          toast({ title: 'Error creating account', description: signUpError.message, type: 'error' });
          setPlacing(false);
          return;
        }
      } else {
        user = signUpData.user;
        // Auto-confirm by signing in immediately (works if email confirmation is disabled)
        if (!user) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          user = signInData.user;
        }
      }
    }

    if (!user) {
      toast({ title: 'Could not create account. Please try again.', type: 'error' });
      setPlacing(false);
      return;
    }

    // Update profile name/phone if needed
    await supabase.from('user_profiles').update({
      full_name: form.full_name,
      phone: form.phone,
    }).eq('id', user.id);

    // Save address
    const shippingAddress = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      area: form.area,
      city: form.city,
      district: form.district,
      delivery_zone: deliveryZone,
    };

    // Save to addresses table
    await supabase.from('addresses').insert({
      user_id: user.id,
      label: 'Default',
      full_name: form.full_name,
      phone: form.phone,
      address_line1: form.address,
      address_line2: form.area,
      city: form.city,
      state: form.district,
      postal_code: '',
      country: 'Bangladesh',
      is_default: true,
    });

    // Create orders per vendor
    const vendorCount = Object.keys(itemsByVendor).length;
    const perVendorDeliveryFee = Math.ceil(deliveryFee / vendorCount);
    const orderNumbers: string[] = [];

    for (const [vendorId, vendorItems] of Object.entries(itemsByVendor)) {
      const subtotal = vendorItems.reduce((s, item) => {
        const price = item.variant?.price || item.product?.price || 0;
        return s + price * item.quantity;
      }, 0);

      const { data: vendor } = await supabase.from('vendor_profiles').select('commission_rate, total_sales, total_revenue').eq('id', vendorId).single();
      const commissionRate = vendor?.commission_rate || 10;
      const commissionAmount = subtotal * (commissionRate / 100);
      const orderNumber = generateOrderNumber();
      orderNumbers.push(orderNumber);

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user.id,
        vendor_id: vendorId,
        order_number: orderNumber,
        subtotal,
        shipping_fee: perVendorDeliveryFee,
        total: subtotal + perVendorDeliveryFee,
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

      if (vendor) {
        await supabase.from('vendor_profiles').update({
          total_sales: (vendor.total_sales || 0) + vendorItems.reduce((s, i) => s + i.quantity, 0),
          total_revenue: (vendor.total_revenue || 0) + subtotal,
        }).eq('id', vendorId);
      }
    }

    // Sync localStorage cart items to DB then clear
    for (const item of items) {
      if (item.id.startsWith('local_')) {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        });
      }
    }

    await clearCart();
    toast({ title: 'Order placed successfully!', description: `Order: ${orderNumbers.join(', ')}`, type: 'success' });
    router.push('/orders');
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4 text-lg">Your cart is empty</p>
        <Link href="/products" className="px-6 py-2.5 bg-[#F57224] text-white rounded-lg font-medium inline-block hover:bg-[#e0621a]">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-semibold mb-4">Your Details (আপনার তথ্য)</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name / নাম *</label>
                  <input type="text" value={form.full_name} onChange={(e) => updateForm('full_name', e.target.value)} required placeholder="আপনার নাম"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone / ফোন *</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} required placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email (optional)</label>
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Address / ঠিকানা *</label>
                <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} required placeholder="বাড়ি নম্বর, রোড, এলাকা"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Area / এলাকা</label>
                  <input type="text" value={form.area} onChange={(e) => updateForm('area', e.target.value)} placeholder="e.g., Dhanmondi"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">City / শহর *</label>
                  <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)} required placeholder="Dhaka"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">District / জেলা</label>
                  <input type="text" value={form.district} onChange={(e) => updateForm('district', e.target.value)} placeholder="Dhaka"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Zone */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-[#F57224]" />
              <h2 className="font-semibold">Delivery Zone (ডেলিভারি জোন)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERY_ZONES.map((zone) => (
                <label key={zone.value} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${deliveryZone === zone.value ? 'border-[#F57224] bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="deliveryZone" checked={deliveryZone === zone.value} onChange={() => setDeliveryZone(zone.value)} className="accent-[#F57224]" />
                    <span className="text-sm font-medium">{zone.label}</span>
                  </div>
                  <span className="text-sm font-bold text-[#F57224]">{formatPrice(zone.fee)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold">Payment (পেমেন্ট)</h2>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-green-300 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Cash on Delivery (ক্যাশ অন ডেলিভারি)</p>
                <p className="text-xs text-gray-500">Pay {formatPrice(grandTotal)} when you receive your order</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-semibold mb-4">Order Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item) => {
                const img = item.product?.images?.find((i) => i.is_primary) || item.product?.images?.[0];
                const price = item.variant?.price || item.product?.price || 0;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {img && <img src={(img as unknown as {url:string}).url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product?.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[#F57224] shrink-0">{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
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
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-[#F57224]">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing}
              className="w-full py-3 bg-[#F57224] text-white rounded-xl font-semibold hover:bg-[#e0621a] disabled:opacity-50 transition-colors">
              {placing ? 'Placing Order...' : `Place Order - ${formatPrice(grandTotal)}`}
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-3">
              No account needed. We&apos;ll auto-create one for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
