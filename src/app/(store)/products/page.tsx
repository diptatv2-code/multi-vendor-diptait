'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { StarRating } from '@/components/ui/star-rating';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';
import { ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import type { Product, Category } from '@/lib/types';

export default function ProductsPage() {
  return <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({length:9}).map((_,i)=><ProductCardSkeleton key={i}/>)}</div></div>}><ProductsContent /></Suspense>;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const supabase = createClient();

      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('*').is('parent_id', null).eq('is_active', true).order('name');
      setCategories(cats || []);

      // Build product query
      let query = supabase
        .from('products')
        .select('*, images:product_images(*), vendor:vendor_profiles(business_name, slug), category:categories(name, slug)', { count: 'exact' })
        .eq('status', 'approved')
        .eq('is_active', true);

      if (search) query = query.ilike('name', `%${search}%`);
      if (category) query = query.eq('category.slug', category);
      if (minPrice) query = query.gte('price', parseFloat(minPrice));
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

      if (sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (sort === 'price_desc') query = query.order('price', { ascending: false });
      else if (sort === 'rating') query = query.order('rating', { ascending: false });
      else if (sort === 'popular') query = query.order('total_sold', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const from = (page - 1) * ITEMS_PER_PAGE;
      query = query.range(from, from + ITEMS_PER_PAGE - 1);

      const { data, count } = await query;
      setProducts((data as unknown as Product[]) || []);
      setTotalCount(count || 0);
      setLoading(false);
    }
    fetch();
  }, [search, category, sort, page, minPrice, maxPrice]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.push(`/products?${params.toString()}`);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{search ? `Results for "${search}"` : 'All Products'}</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} products found</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4 overflow-y-auto' : 'hidden'} lg:block lg:relative lg:w-64 lg:shrink-0`}>
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-2">Category</h3>
              <div className="space-y-1">
                <button onClick={() => updateParam('category', '')}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${!category ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  All Categories
                </button>
                {categories.map((c) => (
                  <button key={c.id} onClick={() => updateParam('category', c.slug)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm ${category === c.slug ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-2">Price Range</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam('min', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
                <span className="text-gray-400">-</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam('max', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm" />
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-2">Sort By</h3>
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState icon={<ShoppingBag className="w-8 h-8 text-gray-400" />} title="No products found" description="Try adjusting your filters" />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => {
                  const img = product.images?.find((i) => i.is_primary) || product.images?.[0];
                  return (
                    <Link key={product.id} href={`/products/${product.slug}`}
                      className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        {img ? (
                          <img src={img.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-12 h-12 text-gray-300" /></div>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <p className="text-xs text-gray-500 mb-1">{(product.vendor as unknown as { business_name: string })?.business_name}</p>
                        <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
                        <StarRating rating={product.rating} showCount count={product.rating_count} />
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateParam('page', String(p))} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
