'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/cart-provider';
import { useWishlist } from '@/hooks/use-wishlist';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  vendorName?: string;
  priority?: boolean;
  rating: number;
  ratingCount: number;
  totalSold?: number;
}

export function ProductCard({
  id, slug, name, price, compareAtPrice, imageUrl, vendorName, rating, ratingCount, totalSold, priority = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const inWishlist = isInWishlist(id);

  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await addToCart(id, 1);
    if (result.error) {
      toast({ title: 'Error', description: result.error, type: 'error' });
    } else {
      toast({ title: 'Added to cart!', type: 'success' });
    }
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
    toast({ title: inWishlist ? 'Removed from wishlist' : 'Added to wishlist!', type: inWishlist ? 'info' : 'success' });
  }

  return (
    <Link href={`/products/${slug}`}
      className="product-card group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 relative flex flex-col">
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-[#F57224] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
          -{discount}%
        </div>
      )}

      <button onClick={handleWishlist}
        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
          inWishlist ? 'bg-red-50 text-red-500' : 'bg-white/90 dark:bg-gray-800/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
        }`}>
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
      </button>

      <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={300} height={300} priority={priority}
            className="product-img w-full h-full object-cover transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-200" />
          </div>
        )}
        {/* Add to Cart overlay - visible on hover (desktop), always on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/60 to-transparent md:cart-overlay md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <button onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-[#F57224] hover:bg-[#e0621a] text-white text-xs font-semibold py-2 rounded-lg transition-colors">
            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col">
        {vendorName && (
          <p className="text-[11px] text-gray-400 mb-1 truncate">{vendorName}</p>
        )}
        <h3 className="text-sm font-medium line-clamp-2 mb-2 flex-1 text-gray-800 dark:text-gray-200 leading-snug">
          {name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'}`} />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">({ratingCount})</span>
          {totalSold !== undefined && totalSold > 0 && (
            <span className="text-[11px] text-gray-400 ml-auto">{totalSold} sold</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#F57224]">{formatPrice(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
