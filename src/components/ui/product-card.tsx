'use client';

import Link from 'next/link';
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
  rating: number;
  ratingCount: number;
  totalSold?: number;
  priority?: boolean;
}

export function ProductCard({
  id, slug, name, price, compareAtPrice, imageUrl, vendorName, rating, ratingCount, totalSold, priority = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  const inWishlist = isInWishlist(id);

  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    await addToCart(id, 1);
    toast({ title: 'Added to cart!', type: 'success' });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    toggle(id);
    toast({ title: inWishlist ? 'Removed from wishlist' : 'Added to wishlist!', type: inWishlist ? 'info' : 'success' });
  }

  return (
    <Link href={`/products/${slug}`}
      className="product-card group bg-white dark:bg-[#1A1A1A] rounded-lg border border-transparent hover:border-[#F0F0F0] dark:hover:border-[#333] relative flex flex-col overflow-hidden">

      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-[#F57224] text-white text-[10px] font-bold px-2 py-0.5 rounded">
          -{discount}%
        </div>
      )}

      <button onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          inWishlist ? 'bg-red-50 text-red-500 dark:bg-red-900/30' : 'bg-white/80 dark:bg-[#222]/80 text-[#86868B] opacity-0 group-hover:opacity-100 hover:text-red-500'
        }`}>
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
      </button>

      {/* Image */}
      <div className="aspect-[4/5] bg-[#F5F5F7] dark:bg-[#1A1A1A] overflow-hidden flex items-center justify-center p-4">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading={priority ? 'eager' : 'lazy'}
            className="product-img max-w-full max-h-full object-contain transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'; }} />
        ) : (
          <ShoppingBag className="w-12 h-12 text-[#E8E8E8]" />
        )}
      </div>

      {/* Hover add to cart */}
      <div className="hover-action absolute bottom-[88px] left-3 right-3 z-10">
        <button onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-[#1D1D1F] hover:bg-[#333] text-white text-xs font-medium py-2.5 rounded-lg transition-colors">
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
      </div>

      {/* Info */}
      <div className="p-3 pt-2 flex-1 flex flex-col">
        <h3 className="text-[13px] font-normal line-clamp-2 mb-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] leading-snug min-h-[36px]">
          {name}
        </h3>

        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'fill-[#F5A623] text-[#F5A623]' : 'fill-[#E8E8E8] text-[#E8E8E8]'}`} />
            ))}
          </div>
          <span className="text-[11px] text-[#86868B]">({ratingCount})</span>
        </div>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sm font-semibold text-[#F57224]">{formatPrice(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-[#86868B] line-through">{formatPrice(compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
