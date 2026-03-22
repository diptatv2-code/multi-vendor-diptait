import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { StarRating } from '@/components/ui/star-rating';
import { ArrowRight, Store, ShoppingBag, Truck, Shield } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: `Home | ${SITE_NAME}` };

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: featured }, { data: categories }, { data: topVendors }] = await Promise.all([
    supabase
      .from('products')
      .select('*, images:product_images(*), vendor:vendor_profiles(business_name, slug)')
      .eq('status', 'approved')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(8),
    supabase.from('categories').select('*').is('parent_id', null).eq('is_active', true).order('sort_order').limit(8),
    supabase.from('vendor_profiles').select('*').eq('status', 'approved').order('rating', { ascending: false }).limit(6),
  ]);

  // If no featured, get latest approved products
  let products = featured || [];
  if (products.length === 0) {
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), vendor:vendor_profiles(business_name, slug)')
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8);
    products = data || [];
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Shop from Multiple Vendors<br />in One Place</h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Discover thousands of products from trusted vendors. Best prices, fast delivery, and secure checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-8 py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Browse Products
            </Link>
            <Link href="/vendor/register" className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 transition-colors border border-indigo-400">
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShoppingBag, title: 'Wide Selection', desc: 'Products from multiple vendors' },
            { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable shipping' },
            { icon: Shield, title: 'Secure Payment', desc: 'Safe checkout process' },
            { icon: Store, title: 'Trusted Vendors', desc: 'Verified seller network' },
          ].map((f) => (
            <div key={f.title} className="text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {(categories?.length || 0) > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/products" className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-12 h-12 rounded-lg object-cover mb-2" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2">
                    <ShoppingBag className="w-6 h-6 text-indigo-500" />
                  </div>
                )}
                <span className="text-sm font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{featured?.length ? 'Featured Products' : 'Latest Products'}</h2>
          <Link href="/products" className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No products yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: Record<string, unknown>) => {
              const imgs = product.images as { url: string; is_primary: boolean }[] | undefined;
              const primaryImg = imgs?.find((i) => i.is_primary) || imgs?.[0];
              const vendor = product.vendor as { business_name: string } | undefined;
              return (
                <Link key={product.id as string} href={`/products/${product.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {primaryImg ? (
                      <img src={primaryImg.url} alt={product.name as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{vendor?.business_name}</p>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name as string}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={product.rating as number} showCount count={product.rating_count as number} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price as number)}</span>
                      {(product.compare_at_price as number) > (product.price as number) ? (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_at_price as number)}</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Top Vendors */}
      {(topVendors?.length || 0) > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Top Vendors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {topVendors?.map((v) => (
              <div key={v.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
                {v.logo_url ? (
                  <img src={v.logo_url} alt={v.business_name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3">
                    <Store className="w-7 h-7 text-indigo-600" />
                  </div>
                )}
                <p className="font-medium text-sm">{v.business_name}</p>
                <StarRating rating={v.rating} showCount count={v.rating_count} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
