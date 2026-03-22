'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import type { Wishlist } from '@/lib/types';

export default function WishlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Wishlist[]>([]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('wishlists')
        .select('*, product:products(*, images:product_images(*), vendor:vendor_profiles(business_name))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setItems((data as unknown as Wishlist[]) || []);
    }
    fetch();
  }, [user]);

  async function removeFromWishlist(id: string) {
    const supabase = createClient();
    await supabase.from('wishlists').delete().eq('id', id);
    setItems(items.filter((i) => i.id !== id));
    toast({ title: 'Removed from wishlist', type: 'info' });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-gray-400" />}
          title="Your wishlist is empty"
          description="Save products you love for later"
          action={<Link href="/products" className="px-6 py-2 bg-[#F57224] text-white rounded-lg text-sm">Browse Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const img = product.images?.find((i) => i.is_primary) || product.images?.[0];
            return (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 group relative">
                <button onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {img ? (
                      <img src={img.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-12 h-12 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500">{(product.vendor as unknown as { business_name: string })?.business_name}</p>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
                    <span className="text-lg font-bold text-[#F57224]">{formatPrice(product.price)}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
