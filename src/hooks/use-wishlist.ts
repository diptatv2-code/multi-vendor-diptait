'use client';

import { useState, useEffect, useCallback } from 'react';

const WISHLIST_KEY = 'mv_wishlist';

function getStoredWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

function setStoredWishlist(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event('wishlist-change'));
}

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  const sync = useCallback(() => {
    setIds(getStoredWishlist());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('wishlist-change', sync);
    return () => window.removeEventListener('wishlist-change', sync);
  }, [sync]);

  function isInWishlist(productId: string) {
    return ids.includes(productId);
  }

  function toggle(productId: string) {
    const current = getStoredWishlist();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    setStoredWishlist(next);
    setIds(next);
  }

  function remove(productId: string) {
    const next = getStoredWishlist().filter((id) => id !== productId);
    setStoredWishlist(next);
    setIds(next);
  }

  return { ids, isInWishlist, toggle, remove, count: ids.length };
}
