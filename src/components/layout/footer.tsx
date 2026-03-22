import Link from 'next/link';
import { Store } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Store className="w-6 h-6 text-indigo-600" />
              <span className="font-bold">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your one-stop multi-vendor marketplace. Shop from thousands of vendors in one place.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/products" className="hover:text-gray-900 dark:hover:text-white">All Products</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-gray-900 dark:hover:text-white">Featured</Link></li>
              <li><Link href="/vendors" className="hover:text-gray-900 dark:hover:text-white">Vendors</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/profile" className="hover:text-gray-900 dark:hover:text-white">My Profile</Link></li>
              <li><Link href="/orders" className="hover:text-gray-900 dark:hover:text-white">Orders</Link></li>
              <li><Link href="/wishlist" className="hover:text-gray-900 dark:hover:text-white">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Sell</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/vendor/register" className="hover:text-gray-900 dark:hover:text-white">Become a Vendor</Link></li>
              <li><Link href="/vendor" className="hover:text-gray-900 dark:hover:text-white">Vendor Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {SITE_NAME}. Powered by DIPTAIT.
        </div>
      </div>
    </footer>
  );
}
