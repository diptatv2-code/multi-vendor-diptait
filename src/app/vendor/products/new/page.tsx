'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { ImageUpload } from '@/components/ui/image-upload';
import { slugify } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    sku: '',
    stock_quantity: '0',
    low_stock_threshold: '5',
    category_id: '',
    weight: '',
    is_featured: false,
  });

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
      setCategories(data || []);
    }
    fetch();
  }, []);

  function updateForm(key: string, value: string | boolean) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const supabase = createClient();
    const { data: vendor } = await supabase.from('vendor_profiles').select('id').eq('user_id', user.id).single();
    if (!vendor) { toast({ title: 'Vendor profile not found', type: 'error' }); setLoading(false); return; }

    const slug = slugify(form.name) + '-' + Math.random().toString(36).slice(2, 6);

    const { data: product, error } = await supabase.from('products').insert({
      vendor_id: vendor.id,
      name: form.name,
      slug,
      description: form.description,
      short_description: form.short_description,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      sku: form.sku || null,
      stock_quantity: parseInt(form.stock_quantity),
      low_stock_threshold: parseInt(form.low_stock_threshold),
      category_id: form.category_id || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      is_featured: form.is_featured,
      status: 'pending',
    }).select().single();

    if (error || !product) {
      toast({ title: 'Error creating product', description: error?.message, type: 'error' });
      setLoading(false);
      return;
    }

    // Insert images
    if (images.length > 0) {
      await supabase.from('product_images').insert(
        images.map((url, i) => ({
          product_id: product.id,
          url,
          sort_order: i,
          is_primary: i === 0,
        }))
      );
    }

    toast({ title: 'Product created!', description: 'It will be reviewed by admin.', type: 'success' });
    router.push('/vendor/products');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} required
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <input type="text" value={form.short_description} onChange={(e) => updateForm('short_description', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Description</label>
            <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={5}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category_id} onChange={(e) => updateForm('category_id', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold">Images</h2>
          <ImageUpload value={images} onChange={setImages} bucket="products" folder="products" maxFiles={8} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($) *</label>
              <input type="number" value={form.price} onChange={(e) => updateForm('price', e.target.value)} required step="0.01" min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare at Price</label>
              <input type="number" value={form.compare_at_price} onChange={(e) => updateForm('compare_at_price', e.target.value)} step="0.01" min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost Price</label>
              <input type="number" value={form.cost_price} onChange={(e) => updateForm('cost_price', e.target.value)} step="0.01" min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => updateForm('sku', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input type="number" value={form.stock_quantity} onChange={(e) => updateForm('stock_quantity', e.target.value)} min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
              <input type="number" value={form.low_stock_threshold} onChange={(e) => updateForm('low_stock_threshold', e.target.value)} min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium hover:bg-[#e0621a] disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
