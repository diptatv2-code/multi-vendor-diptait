'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from '@/components/theme-provider';
import { useCart } from '@/hooks/use-cart';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, LogOut,
  LayoutDashboard, Store, ChevronDown, Package, Home, Grid3X3,
  Smartphone, Shirt, UtensilsCrossed, Sparkles, Apple,
} from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: Smartphone },
  { name: 'Fashion', slug: 'fashion', icon: Shirt },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: UtensilsCrossed },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: Sparkles },
  { name: 'Groceries', slug: 'groceries', icon: Apple },
];

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { totalItems } = useCart();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <>
      <header className={`sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>
        {/* Top bar */}
        <div className="bg-[#F57224] text-white text-xs py-1.5">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <span>Free delivery on orders over ৳2000 | Cash on Delivery Available</span>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/vendor/register" className="hover:underline">Sell on {SITE_NAME}</Link>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-1 hover:underline">
                {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16 gap-4">
              {/* Mobile menu */}
              <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-[#F57224] flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-lg text-[#F57224]">MultiVendor</span>
                  <span className="text-xs text-gray-400 block -mt-1">by DIPTAIT</span>
                </div>
              </Link>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
                <div className="relative flex">
                  <input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 rounded-lg border-2 border-[#F57224] bg-gray-50 dark:bg-gray-800 focus:outline-none focus:bg-white dark:focus:bg-gray-700 text-sm"
                  />
                  <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-[#F57224] text-white rounded-r-lg hover:bg-[#e0621a] transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {user && (
                  <Link href="/wishlist" className="hidden sm:flex flex-col items-center p-2 hover:text-[#F57224] transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5">Wishlist</span>
                  </Link>
                )}

                <Link href="/cart" className="flex flex-col items-center p-2 hover:text-[#F57224] transition-colors relative">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-[#F57224] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                  <span className="text-[10px] mt-0.5">Cart</span>
                </Link>

                {user ? (
                  <div className="relative">
                    <button onClick={() => setUserMenu(!userMenu)} className="flex flex-col items-center p-2 hover:text-[#F57224] transition-colors">
                      <User className="w-5 h-5" />
                      <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
                        Account <ChevronDown className="w-2.5 h-2.5" />
                      </span>
                    </button>
                    {userMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 w-60 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <p className="font-semibold text-sm">{profile?.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                          </div>
                          {profile?.role === 'admin' && (
                            <Link href="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                              <LayoutDashboard className="w-4 h-4 text-[#F57224]" /> Admin Dashboard
                            </Link>
                          )}
                          {profile?.role === 'vendor' && (
                            <Link href="/vendor" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Store className="w-4 h-4 text-[#F57224]" /> Vendor Dashboard
                            </Link>
                          )}
                          <Link href="/orders" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Package className="w-4 h-4 text-gray-400" /> My Orders
                          </Link>
                          <Link href="/wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Heart className="w-4 h-4 text-gray-400" /> Wishlist
                          </Link>
                          <Link href="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            <User className="w-4 h-4 text-gray-400" /> My Profile
                          </Link>
                          <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                            <button onClick={signOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 w-full">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      Login
                    </Link>
                    <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-[#F57224] text-white rounded-lg hover:bg-[#e0621a]">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category bar */}
        <div className="bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-gray-800 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1">
              <Link href="/products" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F57224] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg">
                <Grid3X3 className="w-4 h-4" /> All Categories
              </Link>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-[#F57224] hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {mobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileMenu(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1e1e1e] z-50 overflow-y-auto lg:hidden animate-fade-in-up">
            <div className="p-4 bg-[#F57224] text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setMobileMenu(false)}><X className="w-5 h-5" /></button>
              </div>
              {/* Mobile search */}
              <form onSubmit={(e) => { handleSearch(e); setMobileMenu(false); }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 text-sm" />
                </div>
              </form>
            </div>
            <nav className="p-2">
              <Link href="/" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <Home className="w-5 h-5 text-[#F57224]" /> Home
              </Link>
              <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase mt-2">Categories</p>
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/products?category=${cat.slug}`} onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <cat.icon className="w-5 h-5 text-gray-400" /> {cat.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
              <Link href="/orders" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <Package className="w-5 h-5 text-gray-400" /> My Orders
              </Link>
              <Link href="/wishlist" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                <Heart className="w-5 h-5 text-gray-400" /> Wishlist
              </Link>
            </nav>
          </div>
        </>
      )}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-800 z-40 lg:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-1 text-gray-500 hover:text-[#F57224]">
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center gap-0.5 p-1 text-gray-500 hover:text-[#F57224]">
            <Grid3X3 className="w-5 h-5" />
            <span className="text-[10px]">Categories</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-0.5 p-1 text-gray-500 hover:text-[#F57224] relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 right-0 w-4 h-4 bg-[#F57224] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
            <span className="text-[10px]">Cart</span>
          </Link>
          <Link href={user ? '/profile' : '/login'} className="flex flex-col items-center gap-0.5 p-1 text-gray-500 hover:text-[#F57224]">
            <User className="w-5 h-5" />
            <span className="text-[10px]">Account</span>
          </Link>
        </div>
      </div>
    </>
  );
}
