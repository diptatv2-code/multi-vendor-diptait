'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { slugify } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

export default function VendorRegisterPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
  });

  function updateForm(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/vendor/register');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const slug = slugify(form.business_name) + '-' + Math.random().toString(36).slice(2, 6);

    const { error } = await supabase.from('vendor_profiles').insert({
      user_id: user.id,
      ...form,
      slug,
      email: form.email || user.email,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, type: 'error' });
      setLoading(false);
      return;
    }

    // Update user role to vendor
    await supabase.from('user_profiles').update({ role: 'vendor' }).eq('id', user.id);

    toast({ title: 'Application submitted!', description: 'Your vendor application is under review.', type: 'success' });
    router.push('/vendor');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Store className="w-8 h-8 text-[#F57224]" />
            <span className="text-2xl font-bold">{SITE_NAME}</span>
          </Link>
          <h1 className="text-2xl font-bold">Become a Vendor</h1>
          <p className="text-[#86868B] mt-1">Start selling your products on our marketplace</p>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-[#F0F0F0] dark:border-[#222] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Business Name *</label>
              <input type="text" value={form.business_name} onChange={(e) => updateForm('business_name', e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" placeholder="Your Store Name" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Business Description</label>
              <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" placeholder="Tell us about your business..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone *</label>
                <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Email</label>
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" placeholder={user?.email || ''} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Address</label>
              <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">State</label>
                <input type="text" value={form.state} onChange={(e) => updateForm('state', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Country</label>
                <input type="text" value={form.country} onChange={(e) => updateForm('country', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F57224]" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#F57224] text-white rounded-xl font-medium hover:bg-[#e0621a] disabled:opacity-50">
              {loading ? 'Submitting...' : <><span>Submit Application</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
