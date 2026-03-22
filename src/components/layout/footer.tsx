import Link from 'next/link';
import { Store, Phone, Mail, MapPin } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-[#212121] text-gray-300 mt-auto pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#F57224] flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Bangladesh&apos;s trusted multi-vendor marketplace. Shop from verified vendors with Cash on Delivery.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +880 1700-000000</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@diptait.com.bd</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Dhaka, Bangladesh</p>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-[#F57224] transition-colors">All Products</Link></li>
              <li><Link href="/orders" className="hover:text-[#F57224] transition-colors">Track Order</Link></li>
              <li><Link href="/cart" className="hover:text-[#F57224] transition-colors">Shopping Cart</Link></li>
              <li><span className="text-gray-500">Return Policy</span></li>
              <li><span className="text-gray-500">FAQ</span></li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h3 className="font-semibold text-white mb-4">My Account</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/profile" className="hover:text-[#F57224] transition-colors">My Profile</Link></li>
              <li><Link href="/orders" className="hover:text-[#F57224] transition-colors">Order History</Link></li>
              <li><Link href="/wishlist" className="hover:text-[#F57224] transition-colors">Wishlist</Link></li>
              <li><Link href="/vendor/register" className="hover:text-[#F57224] transition-colors">Become a Vendor</Link></li>
            </ul>
          </div>

          {/* Payment & Delivery */}
          <div>
            <h3 className="font-semibold text-white mb-4">Payment & Delivery</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                <span className="text-lg">💵</span>
                <div>
                  <p className="font-medium text-white text-xs">Cash on Delivery</p>
                  <p className="text-gray-500 text-[10px]">Pay when you receive</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2">
                <span className="text-lg">🚚</span>
                <div>
                  <p className="font-medium text-white text-xs">Delivery Charges</p>
                  <p className="text-gray-500 text-[10px]">Dhaka: ৳70 | Outside: ৳130</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Powered by <span className="text-[#F57224] font-medium">DIPTAIT</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
