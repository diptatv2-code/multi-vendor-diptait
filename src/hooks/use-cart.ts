'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CartItem } from '@/lib/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          *,
          images:product_images(*),
          vendor:vendor_profiles(business_name, slug)
        ),
        variant:product_variants(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function addToCart(productId: string, quantity: number = 1, variantId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Please login to add items to cart' };

    const existing = items.find(
      (item) => item.product_id === productId && item.variant_id === (variantId || null)
    );

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: productId,
        variant_id: variantId || null,
        quantity,
      });
      if (error) return { error: error.message };
    }

    await fetchCart();
    return { error: null };
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return removeItem(itemId);

    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  }

  async function removeItem(itemId: string) {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await fetchCart();
  }

  async function clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Group items by vendor
  const itemsByVendor = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const vendorId = item.product?.vendor_id || 'unknown';
    if (!acc[vendorId]) acc[vendorId] = [];
    acc[vendorId].push(item);
    return acc;
  }, {});

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    itemsByVendor,
    refresh: fetchCart,
  };
}
