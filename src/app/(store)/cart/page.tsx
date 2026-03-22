'use client';

import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/components/auth-provider';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Trash2, Store } from 'lucide-react';

export default function CartPage() {
  const { user } = useAuth();
  const { items, loading, updateQuantity, removeItem, totalPrice, itemsByVendor } = useCart();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-gray-400" />}
          title="Your cart is empty"
          description="Browse products and add them to your cart"
          action={<Link href="/products" className="px-6 py-2 bg-[#F57224] text-white rounded-lg text-sm">Browse Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(itemsByVendor).map(([vendorId, vendorItems]) => {
            const vendorName = (vendorItems[0]?.product?.vendor as unknown as { business_name: string })?.business_name || 'Unknown Vendor';
            return (
              <div key={vendorId} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{vendorName}</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {vendorItems.map((item) => {
                    const price = item.variant?.price || item.product?.price || 0;
                    const img = item.product?.images?.find((i) => i.is_primary) || item.product?.images?.[0];
                    return (
                      <div key={item.id} className="flex gap-4 p-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                          {img ? <img src={img.url} alt="" className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.product?.slug}`} className="font-medium text-sm hover:text-[#F57224] line-clamp-2">
                            {item.product?.name}
                          </Link>
                          {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}</p>}
                          <p className="font-bold text-[#F57224] mt-1">{formatPrice(price)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="text-gray-500">From ৳70</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[#F57224]">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            {user ? (
              <Link href="/checkout"
                className="block w-full text-center py-3 bg-[#F57224] text-white rounded-xl font-medium hover:bg-[#e0621a]">
                Proceed to Checkout
              </Link>
            ) : (
              <Link href="/login?redirect=/checkout"
                className="block w-full text-center py-3 bg-[#F57224] text-white rounded-xl font-medium hover:bg-[#e0621a]">
                Login to Checkout
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
