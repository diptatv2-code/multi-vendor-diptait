'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CartItem } from '@/lib/types';

const CART_KEY = 'mv_cart';

interface LocalCartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
}

function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}

function setLocalCart(items: LocalCartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  itemsByVendor: Record<string, CartItem[]>;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<{ error: string | null }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  cartVersion: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartVersion, setCartVersion] = useState(0);
  const supabase = createClient();

  const bump = () => setCartVersion((v) => v + 1);

  const fetchCart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Merge local cart into DB
      const localItems = getLocalCart();
      if (localItems.length > 0) {
        for (const item of localItems) {
          const { data: existing } = await supabase
            .from('cart_items').select('id, quantity')
            .eq('user_id', user.id).eq('product_id', item.product_id)
            .is('variant_id', item.variant_id).single();
          if (existing) {
            await supabase.from('cart_items').update({ quantity: existing.quantity + item.quantity }).eq('id', existing.id);
          } else {
            await supabase.from('cart_items').insert({
              user_id: user.id, product_id: item.product_id,
              variant_id: item.variant_id, quantity: item.quantity,
            });
          }
        }
        setLocalCart([]);
      }

      const { data } = await supabase
        .from('cart_items')
        .select('*, product:products(*, images:product_images(*), vendor:vendor_profiles(business_name, slug)), variant:product_variants(*)')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      setItems(data || []);
    } else {
      const localItems = getLocalCart();
      if (localItems.length === 0) { setItems([]); setLoading(false); return; }

      const productIds = [...new Set(localItems.map((i) => i.product_id))];
      const { data: products } = await supabase
        .from('products')
        .select('*, images:product_images(*), vendor:vendor_profiles(business_name, slug)')
        .in('id', productIds);

      const productMap = new Map<string, Record<string, unknown>>();
      products?.forEach((p) => productMap.set(p.id, p));

      setItems(localItems.map((item) => ({
        ...item, user_id: '',
        product: productMap.get(item.product_id) as CartItem['product'],
        variant: undefined,
      })));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  async function addToCart(productId: string, quantity: number = 1, variantId?: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const existing = items.find((item) => item.product_id === productId && item.variant_id === (variantId || null));
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({
          user_id: user.id, product_id: productId, variant_id: variantId || null, quantity,
        });
      }
    } else {
      const localItems = getLocalCart();
      const idx = localItems.findIndex((item) => item.product_id === productId && item.variant_id === (variantId || null));
      if (idx >= 0) {
        localItems[idx].quantity += quantity;
      } else {
        localItems.push({
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          product_id: productId, variant_id: variantId || null, quantity,
          created_at: new Date().toISOString(),
        });
      }
      setLocalCart(localItems);
    }

    await fetchCart();
    bump();
    return { error: null };
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return removeItem(itemId);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    } else {
      const l = getLocalCart(); const item = l.find((i) => i.id === itemId);
      if (item) item.quantity = quantity; setLocalCart(l);
    }
    await fetchCart(); bump();
  }

  async function removeItem(itemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { await supabase.from('cart_items').delete().eq('id', itemId); }
    else { setLocalCart(getLocalCart().filter((i) => i.id !== itemId)); }
    await fetchCart(); bump();
  }

  async function clearCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { await supabase.from('cart_items').delete().eq('user_id', user.id); }
    setLocalCart([]); setItems([]); bump();
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const itemsByVendor = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const vendorId = item.product?.vendor_id || 'unknown';
    if (!acc[vendorId]) acc[vendorId] = [];
    acc[vendorId].push(item);
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{
      items, loading, totalItems, totalPrice, itemsByVendor,
      addToCart, updateQuantity, removeItem, clearCart, refresh: fetchCart, cartVersion,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
