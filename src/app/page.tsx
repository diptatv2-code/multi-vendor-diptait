import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/ui/product-card';
import { HeroSlider } from '@/components/ui/hero-slider';
import { ArrowRight, Truck, Shield, Banknote, Headphones } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: SITE_NAME, description: 'Bangladesh\'s trusted multi-vendor marketplace' };

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: popular }, { data: newest }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, images:product_images(*), vendor:vendor_profiles(business_name)')
      .eq('status', 'approved').eq('is_active', true).order('total_sold', { ascending: false }).limit(10),
    supabase.from('products').select('*, images:product_images(*), vendor:vendor_profiles(business_name)')
      .eq('status', 'approved').eq('is_active', true).order('created_at', { ascending: false }).limit(10),
    supabase.from('categories').select('*').is('parent_id', null).eq('is_active', true).order('sort_order').limit(5),
  ]);

  function renderGrid(products: Record<string, unknown>[] | null, startPriority: boolean = false) {
    if (!products?.length) return <p className="text-center py-12 text-[#86868B]">No products yet.</p>;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {products.map((p, idx) => {
          const imgs = p.images as { url: string; is_primary: boolean }[] | undefined;
          const img = imgs?.find((i) => i.is_primary) || imgs?.[0];
          return (
            <ProductCard key={p.id as string} id={p.id as string} slug={p.slug as string}
              name={p.name as string} price={p.price as number} compareAtPrice={p.compare_at_price as number}
              imageUrl={img?.url} vendorName={(p.vendor as { business_name: string })?.business_name}
              rating={p.rating as number} ratingCount={p.rating_count as number} totalSold={p.total_sold as number}
              priority={startPriority && idx < 5} />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#111]">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 pt-6 pb-4">
          <HeroSlider />
        </section>

        {/* Category Banners */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Electronics', sub: 'Laptops, Phones & Gadgets', href: '/products?category=electronics',
                img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=300&fit=crop', color: 'from-black/60' },
              { title: 'Fashion', sub: 'Trending Styles for Everyone', href: '/products?category=fashion',
                img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=300&fit=crop', color: 'from-black/60' },
              { title: 'Home & Kitchen', sub: 'Appliances & Essentials', href: '/products?category=home-kitchen',
                img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=300&fit=crop', color: 'from-black/60' },
            ].map((b) => (
              <Link key={b.title} href={b.href} className="relative rounded-xl overflow-hidden group h-40 md:h-48 flex items-end">
                <img src={b.img} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className={`absolute inset-0 bg-gradient-to-t ${b.color} to-transparent`} />
                <div className="relative p-5 text-white">
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="text-sm text-white/80">{b.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">New Arrivals</h2>
            <Link href="/products?sort=newest" className="flex items-center gap-1 text-sm text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {renderGrid(newest, true)}
        </section>

        {/* Promo Banner */}
        <section className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/products?category=fashion" className="block relative rounded-xl overflow-hidden h-32 md:h-40 group">
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=300&fit=crop" alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1D1D1F]/80 to-transparent" />
            <div className="relative flex items-center h-full px-8 md:px-12">
              <div className="text-white">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70 mb-1">Limited Time</p>
                <h3 className="text-2xl md:text-3xl font-bold">Save up to 25% on Fashion</h3>
                <p className="text-sm text-white/80 mt-1">Shop the latest trends</p>
              </div>
            </div>
          </Link>
        </section>

        {/* Popular Products */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Popular Products</h2>
            <Link href="/products?sort=popular" className="flex items-center gap-1 text-sm text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {renderGrid(popular)}
        </section>

        {/* Trust Bar */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Nationwide Delivery', desc: 'Dhaka ৳70 | Outside ৳130' },
              { icon: Banknote, title: 'Cash on Delivery', desc: 'Pay when you receive' },
              { icon: Shield, title: 'Product Guarantee', desc: 'Verified vendors only' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#222] flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-[#1D1D1F] dark:text-[#F5F5F7]" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{f.title}</h3>
                  <p className="text-xs text-[#86868B] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
