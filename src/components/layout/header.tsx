'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from '@/components/theme-provider';
import { useCart } from '@/components/cart-provider';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, LogOut,
  LayoutDashboard, Store, ChevronDown, Package, Home,
} from 'lucide-react';

const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Beauty', slug: 'beauty-health' },
  { name: 'Groceries', slug: 'groceries' },
];

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { totalItems, cartVersion } = useCart();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [badgePop, setBadgePop] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 5);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (cartVersion > 0) { setBadgePop(true); const t = setTimeout(() => setBadgePop(false), 300); return () => clearTimeout(t); }
  }, [cartVersion]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
  }

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white dark:bg-[#111] transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-6">
            <button onClick={() => setMobileMenu(true)} className="lg:hidden p-2 -ml-2"><Menu className="w-5 h-5" /></button>

            <Link href="/" className="shrink-0 flex items-center gap-2">
              <div>
                <span className="text-xl font-bold tracking-tight">Multi<span className="text-[#F57224]">Vendor</span></span>
                <span className="block text-[9px] text-[#86868B] leading-none -mt-0.5">by DIPTAIT</span>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-full border border-[#E8E8E8] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] focus:outline-none focus:border-[#1D1D1F] dark:focus:border-[#555] text-sm transition-colors" />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[#E8E8E8] dark:hover:bg-[#333]">
                  <Search className="w-4 h-4 text-[#86868B]" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#222]">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link href="/wishlist" className="p-2.5 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#222] hidden sm:flex">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="p-2.5 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#222] relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#F57224] text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 transition-transform ${badgePop ? 'scale-125' : 'scale-100'}`}>
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenu(!userMenu)} className="p-2.5 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#222]">
                    <User className="w-5 h-5" />
                  </button>
                  {userMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-lg border border-[#F0F0F0] dark:border-[#333] py-1 z-20">
                        <div className="px-4 py-3 border-b border-[#F0F0F0] dark:border-[#333]">
                          <p className="font-medium text-sm">{profile?.full_name}</p>
                          <p className="text-xs text-[#86868B] truncate">{profile?.email}</p>
                        </div>
                        {profile?.role === 'admin' && (
                          <Link href="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F5F5F7] dark:hover:bg-[#222]">
                            <LayoutDashboard className="w-4 h-4 text-[#86868B]" /> Admin Dashboard
                          </Link>
                        )}
                        {profile?.role === 'vendor' && (
                          <Link href="/vendor" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F5F5F7] dark:hover:bg-[#222]">
                            <Store className="w-4 h-4 text-[#86868B]" /> Vendor Dashboard
                          </Link>
                        )}
                        <Link href="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F5F5F7] dark:hover:bg-[#222]">
                          <Package className="w-4 h-4 text-[#86868B]" /> My Orders
                        </Link>
                        <Link href="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F5F5F7] dark:hover:bg-[#222]">
                          <User className="w-4 h-4 text-[#86868B]" /> Profile
                        </Link>
                        <div className="border-t border-[#F0F0F0] dark:border-[#333] mt-1 pt-1">
                          <button onClick={signOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-[#F5F5F7] dark:hover:bg-[#222] w-full">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="px-5 py-2 text-sm font-medium bg-[#1D1D1F] text-white rounded-full hover:bg-[#333] ml-1">Sign In</Link>
              )}
            </div>
          </div>
        </div>

        {/* Category nav */}
        <div className="border-t border-[#F0F0F0] dark:border-[#222] hidden lg:block">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-8 h-11 text-sm">
              <Link href="/products" className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium hover:text-[#F57224] transition-colors">All Products</Link>
              {categories.map((c) => (
                <Link key={c.slug} href={`/products?category=${c.slug}`} className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">{c.name}</Link>
              ))}
              <Link href="/vendor/register" className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors ml-auto">Sell on MultiVendor</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setMobileMenu(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#111] z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0] dark:border-[#222]">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileMenu(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { handleSearch(e); setMobileMenu(false); }} className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E8E8E8] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
              </div>
            </form>
            <nav className="px-2 pb-4">
              <Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]"><Home className="w-5 h-5 text-[#86868B]" /> Home</Link>
              {categories.map((c) => (
                <Link key={c.slug} href={`/products?category=${c.slug}`} onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]">{c.name}</Link>
              ))}
              <div className="border-t border-[#F0F0F0] dark:border-[#222] my-2" />
              <Link href="/orders" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]"><Package className="w-5 h-5 text-[#86868B]" /> My Orders</Link>
              <Link href="/wishlist" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]"><Heart className="w-5 h-5 text-[#86868B]" /> Wishlist</Link>
            </nav>
          </div>
        </>
      )}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111] border-t border-[#F0F0F0] dark:border-[#222] z-40 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { href: '/', icon: Home, label: 'Home' },
            { href: '/products', icon: Search, label: 'Browse' },
            { href: '/cart', icon: ShoppingCart, label: 'Cart' },
            { href: user ? '/profile' : '/login', icon: User, label: 'Account' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 p-1.5 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white relative">
              <item.icon className="w-5 h-5" />
              {item.label === 'Cart' && totalItems > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[#F57224] text-white text-[9px] rounded-full flex items-center justify-center font-bold">{totalItems}</span>
              )}
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
