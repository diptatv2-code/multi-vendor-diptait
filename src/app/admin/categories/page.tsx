'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchCategories() {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setCategories(data || []);
  }

  useEffect(() => { fetchCategories(); }, []);

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setParentId('');
    setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParentId(cat.parent_id || '');
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const slug = slugify(name);

    if (editing) {
      await supabase.from('categories').update({ name, slug, description, parent_id: parentId || null }).eq('id', editing.id);
      toast({ title: 'Category updated', type: 'success' });
    } else {
      await supabase.from('categories').insert({ name, slug, description, parent_id: parentId || null });
      toast({ title: 'Category created', type: 'success' });
    }

    setShowModal(false);
    setLoading(false);
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    const supabase = createClient();
    await supabase.from('categories').delete().eq('id', id);
    toast({ title: 'Category deleted', type: 'success' });
    fetchCategories();
  }

  const parentCategories = categories.filter((c) => !c.parent_id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium hover:bg-[#e0621a]">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        {categories.length === 0 ? (
          <EmptyState icon={<Tag className="w-8 h-8 text-gray-400" />} title="No categories yet" description="Create your first category to organize products" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Parent</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-6 py-4 font-medium">{cat.parent_id ? `\u00A0\u00A0\u00A0\u2514 ${cat.name}` : cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4 text-gray-500">{categories.find((c) => c.id === cat.parent_id)?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${cat.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]">
              <option value="">None (Top Level)</option>
              {parentCategories.filter((c) => c.id !== editing?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium hover:bg-[#e0621a] disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
