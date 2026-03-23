'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { useCart } from '@/components/cart-provider';
import { StarRating } from '@/components/ui/star-rating';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate, getInitials } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Heart, Minus, Plus, Store, Package, Check } from 'lucide-react';
import Link from 'next/link';
import type { Product, Review } from '@/lib/types';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      const productSlug = Array.isArray(slug) ? slug[0] : slug;

      // Fetch product separately from joins to avoid RLS join failures
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlug)
        .eq('status', 'approved')
        .single();

      if (productError || !productData) {
        setLoading(false);
        return;
      }

      // Fetch images separately
      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productData.id)
        .order('sort_order');

      // Fetch vendor separately
      const { data: vendorData } = await supabase
        .from('vendor_profiles')
        .select('id, business_name, slug, logo_url, rating, rating_count')
        .eq('id', productData.vendor_id)
        .single();

      // Fetch category separately
      const { data: categoryData } = productData.category_id
        ? await supabase.from('categories').select('name, slug').eq('id', productData.category_id).single()
        : { data: null };

      // Fetch variants
      const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id)
        .order('sort_order');

      const fullProduct = {
        ...productData,
        images: images || [],
        vendor: vendorData,
        category: categoryData,
        variants: variants || [],
      };

      setProduct(fullProduct as unknown as Product);

      // Fetch reviews
      const { data: revs } = await supabase
        .from('reviews')
        .select('*, user:user_profiles(full_name)')
        .eq('product_id', productData.id)
        .order('created_at', { ascending: false });
      setReviews((revs as unknown as Review[]) || []);

      // Check wishlist for logged-in users
      if (user) {
        const { data: wl } = await supabase.from('wishlists').select('id').eq('product_id', productData.id).eq('user_id', user.id).maybeSingle();
        setInWishlist(!!wl);
      }

      setLoading(false);
    }
    fetchProduct();
  }, [slug, user]);

  async function handleAddToCart() {
    setAdding(true);
    const result = await addToCart(product!.id, quantity);
    if (result.error) {
      toast({ title: 'Error', description: result.error, type: 'error' });
    } else {
      toast({ title: 'Added to cart', type: 'success' });
    }
    setAdding(false);
  }

  async function toggleWishlist() {
    if (!user) { toast({ title: 'Please login first', type: 'info' }); return; }
    const supabase = createClient();
    if (inWishlist) {
      await supabase.from('wishlists').delete().eq('product_id', product!.id).eq('user_id', user.id);
      setInWishlist(false);
      toast({ title: 'Removed from wishlist', type: 'info' });
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product!.id });
      setInWishlist(true);
      toast({ title: 'Added to wishlist', type: 'success' });
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: product!.id,
      rating: reviewRating,
      title: reviewTitle || null,
      comment: reviewComment || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, type: 'error' });
    } else {
      toast({ title: 'Review submitted', type: 'success' });
      setShowReviewForm(false);
      // Refresh reviews
      const { data: revs } = await supabase
        .from('reviews')
        .select('*, user:user_profiles!reviews_user_id_fkey(full_name)')
        .eq('product_id', product!.id)
        .order('created_at', { ascending: false });
      setReviews((revs as unknown as Review[]) || []);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Product not found</div>;
  }

  const images = product.images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const vendor = product.vendor as unknown as { id: string; business_name: string; slug: string; logo_url: string | null; rating: number; rating_count: number };
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F5F7] dark:bg-[#1A1A1A] mb-4 group/zoom cursor-crosshair relative">
            {images[selectedImage] ? (
              <img src={images[selectedImage].url} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 group-hover/zoom:scale-150 origin-center"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f5f5f5/999?text=Product+Image'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-gray-300" /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === selectedImage ? 'border-[#F57224] ring-2 ring-[#F57224]/20' : 'border-[#F0F0F0] dark:border-[#333] hover:border-[#F57224]'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/f5f5f5/999?text=Image'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 mb-1">{(product.category as unknown as { name: string })?.name}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="md" showCount count={product.rating_count} />
            <span className="text-sm text-gray-500">{product.total_sold} sold</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-[#F57224]">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.compare_at_price!)}</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">-{discount}%</span>
              </>
            )}
          </div>

          {product.short_description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">{product.short_description}</p>
          )}

          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className={`flex items-center gap-1 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock_quantity > 0 ? <><Check className="w-4 h-4" /> In Stock ({product.stock_quantity})</> : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[#F0F0F0] dark:border-[#333] rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-l-lg">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[48px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart} disabled={adding || product.stock_quantity < 1}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F57224] text-white rounded-xl font-medium hover:bg-[#e0621a] disabled:opacity-50">
              <ShoppingCart className="w-5 h-5" />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={toggleWishlist}
              className={`p-3 rounded-xl border ${inWishlist ? 'bg-red-50 border-red-200 text-red-600' : 'border-[#F0F0F0] dark:border-[#333] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : ''}`} />
            </button>
          </div>

          {/* Vendor Info */}
          <div className="flex items-center gap-3 p-4 bg-[#F5F5F7] dark:bg-[#1A1A1A] rounded-xl">
            {vendor?.logo_url ? (
              <img src={vendor.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Store className="w-5 h-5 text-[#F57224]" />
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{vendor?.business_name}</p>
              <StarRating rating={vendor?.rating || 0} showCount count={vendor?.rating_count || 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] p-6">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Reviews ({reviews.length})</h2>
          {user && (
            <button onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium hover:bg-[#e0621a]">
              Write a Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] p-6 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3}
                className="w-full px-4 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium">Submit Review</button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-medium text-[#F57224]">
                      {getInitials((r.user as unknown as { full_name: string })?.full_name || 'U')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{(r.user as unknown as { full_name: string })?.full_name}</p>
                      <StarRating rating={r.rating} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(r.created_at)}</span>
                </div>
                {r.title && <p className="font-medium mt-2">{r.title}</p>}
                {r.comment && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
