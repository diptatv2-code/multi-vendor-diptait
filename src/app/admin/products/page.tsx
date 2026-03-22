'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Package, CheckCircle, XCircle, Eye } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select('*, vendor:vendor_profiles(business_name), category:categories(name), images:product_images(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setProducts((data as unknown as Product[]) || []);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, [filter]);

  async function updateStatus(productId: string, status: string) {
    const supabase = createClient();
    await supabase.from('products').update({ status }).eq('id', productId);
    toast({ title: `Product ${status}`, type: 'success' });
    fetchProducts();
  }

  const filters = ['all', 'pending', 'approved', 'rejected', 'draft'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Product Moderation</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              filter === f ? 'bg-[#F57224] text-white' : 'bg-white dark:bg-[#111] border border-[#F0F0F0] dark:border-[#222] hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-[#F0F0F0] dark:border-[#222] overflow-x-auto">
        {products.length === 0 ? (
          <EmptyState icon={<Package className="w-8 h-8 text-gray-400" />} title="No products found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] dark:border-[#222] text-left text-[#86868B]">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const primaryImage = p.images?.find((img) => img.is_primary) || p.images?.[0];
                return (
                  <tr key={p.id} className="border-b border-[#F0F0F0] dark:border-[#222]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {primaryImage ? (
                          <img src={primaryImage.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-[#86868B]">SKU: {p.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{(p.vendor as unknown as { business_name: string })?.business_name}</td>
                    <td className="px-6 py-4">{(p.category as unknown as { name: string })?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4">{p.stock_quantity}</td>
                    <td className="px-6 py-4"><Badge status={p.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(p.id, 'approved')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateStatus(p.id, 'rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <a href={`/products/${p.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]" title="View">
                          <Eye className="w-4 h-4" />
                        </a>
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
