'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon, LogOut, Home, Bell, Menu } from 'lucide-react';
import { useState } from 'react';

export function DashboardHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-[#111] border-b border-[#F0F0F0] dark:border-[#222] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A] lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link href="/" className="p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]" title="Go to storefront">
          <Home className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 pl-2 ml-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-[#F57224] text-white flex items-center justify-center text-sm font-medium">
            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{profile?.full_name}</p>
            <p className="text-xs text-[#86868B] capitalize">{profile?.role}</p>
          </div>
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A] text-red-500" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
