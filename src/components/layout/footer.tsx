import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#1D1D1F] text-[#86868B] mt-16 pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold text-white tracking-tight">Multi<span className="text-[#F57224]">Vendor</span></span>
            <p className="text-sm mt-3 leading-relaxed">Bangladesh&apos;s trusted multi-vendor marketplace. Shop from verified vendors with Cash on Delivery.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=groceries" className="hover:text-white transition-colors">Groceries</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Account</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link href="/vendor/register" className="hover:text-white transition-colors">Sell with Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li>Cash on Delivery</li>
              <li>Dhaka: ৳70 | Outside: ৳130</li>
              <li>Free on ৳2,000+</li>
              <li>support@diptait.com.bd</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[#333] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>&copy; {new Date().getFullYear()} MultiVendor by DIPTAIT. All rights reserved.</span>
          <span>Powered by <span className="text-[#F57224]">DIPTAIT</span></span>
        </div>
      </div>
    </footer>
  );
}
