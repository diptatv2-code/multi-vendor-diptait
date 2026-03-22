'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
}

export function ProductCard({
  slug, name, price, compareAtPrice, imageUrl, vendorName, rating, ratingCount, totalSold,
}: ProductCardProps) {
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${slug}`}
      className="product-card group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 relative flex flex-col">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-[#F57224] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
          -{discount}%
        </div>
      )}

      {/* Wishlist */}
      <button className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <Heart className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="product-img w-full h-full object-cover transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-200" />
          </div>
        )}
        {/* Add to Cart overlay */}
        <div className="cart-overlay absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-center gap-2 text-white text-xs font-medium">
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        {vendorName && (
          <p className="text-[11px] text-gray-400 mb-1 truncate">{vendorName}</p>
        )}
        <h3 className="text-sm font-medium line-clamp-2 mb-2 flex-1 text-gray-800 dark:text-gray-200 leading-snug">
          {name}
        </h3>

        {/* Rating */}
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

        {/* Price */}
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
