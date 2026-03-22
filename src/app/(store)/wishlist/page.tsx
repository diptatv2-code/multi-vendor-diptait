'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWishlist } from '@/hooks/use-wishlist';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Heart, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const { ids, remove } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); return; }
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, images:product_images(*), vendor:vendor_profiles(business_name)')
        .in('id', ids);
      setProducts((data as unknown as Product[]) || []);
    }
    fetch();
  }, [ids]);

  async function handleAddToCart(productId: string) {
    await addToCart(productId, 1);
    toast({ title: 'Added to cart!', type: 'success' });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({ids.length})</h1>

      {ids.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-gray-400" />}
          title="Your wishlist is empty"
          description="Save products you love for later"
          action={<Link href="/products" className="px-6 py-2 bg-[#F57224] text-white rounded-lg text-sm">Browse Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const img = product.images?.find((i) => i.is_primary) || product.images?.[0];
            return (
              <div key={product.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#F0F0F0] dark:border-[#222] group relative">
                <button onClick={() => { remove(product.id); toast({ title: 'Removed from wishlist', type: 'info' }); }}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-[#F5F5F7] dark:bg-[#1A1A1A] overflow-hidden">
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
                <div className="px-3 pb-3">
                  <button onClick={() => handleAddToCart(product.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-[#F57224] text-white text-xs font-semibold rounded-lg hover:bg-[#e0621a]">
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
