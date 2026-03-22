'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, DollarSign,
  Star, Store, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/products', label: 'Products', icon: Package },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/vendor/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/vendor/reviews', label: 'Reviews', icon: Star },
  { href: '/vendor/shop', label: 'Shop Profile', icon: Store },
  { href: '/vendor/settings', label: 'Settings', icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-[#111] border-r border-[#F0F0F0] dark:border-[#222] min-h-screen transition-all duration-200 hidden lg:block`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[#F0F0F0] dark:border-[#222]">
        {!collapsed && <span className="font-bold text-[#F57224]">Vendor Panel</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="p-2 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/vendor' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#F5F5F7] text-[#1D1D1F] dark:bg-[#222] dark:text-white'
                  : 'text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
