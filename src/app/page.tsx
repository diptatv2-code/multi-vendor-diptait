import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/ui/product-card';
import { HeroSlider } from '@/components/ui/hero-slider';
import { StarRating } from '@/components/ui/star-rating';
import {
  ArrowRight, Store, Smartphone, Shirt, UtensilsCrossed, Sparkles, Apple,
  Truck, Shield, Banknote, Clock, Zap,
} from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'Bangladesh\'s trusted multi-vendor marketplace',
};

const categoryIcons: Record<string, typeof Smartphone> = {
  electronics: Smartphone,
  fashion: Shirt,
  'home-kitchen': UtensilsCrossed,
  'beauty-health': Sparkles,
  groceries: Apple,
};

const categoryColors: Record<string, string> = {
  electronics: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30',
  fashion: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30',
  'home-kitchen': 'bg-amber-50 text-amber-600 dark:bg-amber-900/30',
  'beauty-health': 'bg-rose-50 text-rose-600 dark:bg-rose-900/30',
  groceries: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30',
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: topVendors }, { data: flashDeals }] = await Promise.all([
    supabase.from('products').select('*, images:product_images(*), vendor:vendor_profiles(business_name)')
      .eq('status', 'approved').eq('is_active', true).order('total_sold', { ascending: false }).limit(8),
    supabase.from('categories').select('*').is('parent_id', null).eq('is_active', true).order('sort_order').limit(5),
    supabase.from('vendor_profiles').select('*').eq('status', 'approved').order('rating', { ascending: false }).limit(6),
    supabase.from('products').select('*, images:product_images(*), vendor:vendor_profiles(business_name)')
      .eq('status', 'approved').eq('is_active', true).not('compare_at_price', 'is', null)
      .order('created_at', { ascending: false }).limit(6),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-[#f5f5f5] dark:bg-[#121212]">

        {/* Hero Banners */}
        <section className="max-w-7xl mx-auto px-4 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <HeroSlider />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex-1 rounded-2xl overflow-hidden relative min-h-[140px]">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C3CE1]/90 to-[#6C3CE1]/60" />
                <div className="relative p-6 text-white flex flex-col justify-center h-full">
                  <Truck className="w-8 h-8 mb-2" />
                  <h3 className="text-lg font-bold">Fast Delivery</h3>
                  <p className="text-sm text-white/80">Dhaka ৳70 | Outside ৳130</p>
                </div>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden relative min-h-[140px]">
                <img src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=500&h=300&fit=crop" alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00b894]/90 to-[#00b894]/60" />
                <div className="relative p-6 text-white flex flex-col justify-center h-full">
                  <Banknote className="w-8 h-8 mb-2" />
                  <h3 className="text-lg font-bold">Cash on Delivery</h3>
                  <p className="text-sm text-white/80">Pay when you receive</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        {(categories?.length || 0) > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center overflow-x-auto no-scrollbar gap-3 pb-2">
              {categories?.map((cat) => {
                const Icon = categoryIcons[cat.slug] || Smartphone;
                const color = categoryColors[cat.slug] || 'bg-gray-50 text-gray-600';
                return (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`}
                    className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-[#F57224] hover:shadow-md transition-all shrink-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Flash Deals */}
        {(flashDeals?.length || 0) > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#F57224] to-[#ff9a5c]">
                <div className="flex items-center gap-3 text-white">
                  <Zap className="w-6 h-6" />
                  <h2 className="text-lg font-bold">Flash Deals</h2>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4" />
                  <div className="flex items-center gap-1 text-sm font-mono font-bold">
                    <span className="bg-white/20 rounded px-1.5 py-0.5">23</span>:
                    <span className="bg-white/20 rounded px-1.5 py-0.5">59</span>:
                    <span className="bg-white/20 rounded px-1.5 py-0.5">59</span>
                  </div>
                </div>
              </div>
              <div className="flex overflow-x-auto no-scrollbar gap-4 p-4">
                {flashDeals?.map((p: Record<string, unknown>) => {
                  const imgs = p.images as { url: string; is_primary: boolean }[] | undefined;
                  const img = imgs?.find((i) => i.is_primary) || imgs?.[0];
                  const vendor = p.vendor as { business_name: string } | undefined;
                  return (
                    <div key={p.id as string} className="shrink-0 w-44">
                      <ProductCard
                        id={p.id as string}
                        slug={p.slug as string}
                        name={p.name as string}
                        price={p.price as number}
                        compareAtPrice={p.compare_at_price as number}
                        imageUrl={img?.url}
                        vendorName={vendor?.business_name}
                        rating={p.rating as number}
                        ratingCount={p.rating_count as number}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Popular Products */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Popular Products</h2>
            <Link href="/products" className="flex items-center gap-1 text-[#F57224] text-sm font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {(products?.length || 0) === 0 ? (
            <div className="text-center py-16 text-gray-500">No products yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.map((p: Record<string, unknown>) => {
                const imgs = p.images as { url: string; is_primary: boolean }[] | undefined;
                const img = imgs?.find((i) => i.is_primary) || imgs?.[0];
                const vendor = p.vendor as { business_name: string } | undefined;
                return (
                  <ProductCard
                    key={p.id as string}
                    id={p.id as string}
                    slug={p.slug as string}
                    name={p.name as string}
                    price={p.price as number}
                    compareAtPrice={p.compare_at_price as number}
                    imageUrl={img?.url}
                    vendorName={vendor?.business_name}
                    rating={p.rating as number}
                    ratingCount={p.rating_count as number}
                    totalSold={p.total_sold as number}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Trust bar */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Nationwide Delivery', desc: 'Dhaka ৳70 | Outside ৳130', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' },
              { icon: Banknote, title: 'Cash on Delivery', desc: 'Pay when you receive', color: 'bg-green-50 text-green-600 dark:bg-green-900/30' },
              { icon: Shield, title: 'Secure Shopping', desc: 'Verified vendors only', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' },
              { icon: Clock, title: '24/7 Support', desc: 'Always here to help', color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Vendors */}
        {(topVendors?.length || 0) > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Top Vendors</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topVendors?.map((v) => (
                <div key={v.id} className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 p-5 text-center hover:shadow-lg hover:border-[#F57224] transition-all cursor-pointer">
                  {v.logo_url ? (
                    <img src={v.logo_url} alt={v.business_name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-gray-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F57224] to-[#ff9a5c] flex items-center justify-center mx-auto mb-3">
                      <Store className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <p className="font-semibold text-sm mb-1">{v.business_name}</p>
                  <div className="flex justify-center">
                    <StarRating rating={v.rating} showCount count={v.rating_count} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
