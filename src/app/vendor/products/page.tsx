'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function VendorProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorId, setVendorId] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data: v } = await supabase.from('vendor_profiles').select('id').eq('user_id', user!.id).single();
      if (!v) return;
      setVendorId(v.id);

      const { data } = await supabase
        .from('products')
        .select('*, images:product_images(*), category:categories(name)')
        .eq('vendor_id', v.id)
        .order('created_at', { ascending: false });
      setProducts((data as unknown as Product[]) || []);
    }
    fetch();
  }, [user]);

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
    toast({ title: 'Product deleted', type: 'success' });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link href="/vendor/products/new" className="flex items-center gap-2 px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium hover:bg-[#e0621a]">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-[#F0F0F0] dark:border-[#222] overflow-x-auto">
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8 text-gray-400" />}
            title="No products yet"
            description="Add your first product to start selling"
            action={
              <Link href="/vendor/products/new" className="px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm">
                Add Product
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] dark:border-[#222] text-left text-[#86868B]">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = p.images?.find((i) => i.is_primary) || p.images?.[0];
                return (
                  <tr key={p.id} className="border-b border-[#F0F0F0] dark:border-[#222]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img src={img.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <p className="font-medium line-clamp-1">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#86868B]">{(p.category as unknown as { name: string })?.name || '-'}</td>
                    <td className="px-6 py-4">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={p.stock_quantity <= p.low_stock_threshold ? 'text-red-600 font-medium' : ''}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4"><Badge status={p.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/vendor/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
