'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DollarSign, Save } from 'lucide-react';
import type { Commission, VendorProfile, Category } from '@/lib/types';

export default function AdminCommissionsPage() {
  const [defaultRate, setDefaultRate] = useState(10);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendorRates, setVendorRates] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const [{ data: commissions }, { data: vendorData }, { data: catData }] = await Promise.all([
        supabase.from('commissions').select('*'),
        supabase.from('vendor_profiles').select('*').eq('status', 'approved'),
        supabase.from('categories').select('*').is('parent_id', null),
      ]);

      const defaultComm = commissions?.find((c) => c.is_default);
      if (defaultComm) setDefaultRate(defaultComm.rate);

      setVendors(vendorData || []);
      setCategories(catData || []);

      const rates: Record<string, number> = {};
      vendorData?.forEach((v) => { rates[v.id] = v.commission_rate; });
      setVendorRates(rates);
    }
    fetch();
  }, []);

  async function saveDefaultRate() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('commissions').update({ rate: defaultRate }).eq('is_default', true);
    await supabase.from('site_settings').update({ value: String(defaultRate) }).eq('key', 'default_commission_rate');
    toast({ title: 'Default commission updated', type: 'success' });
    setSaving(false);
  }

  async function saveVendorRate(vendorId: string) {
    const supabase = createClient();
    await supabase.from('vendor_profiles').update({ commission_rate: vendorRates[vendorId] }).eq('id', vendorId);
    toast({ title: 'Vendor commission updated', type: 'success' });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Commission Settings</h1>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold">Default Commission Rate</h2>
              <p className="text-sm text-gray-500">Applied to all vendors unless overridden</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-32">
              <input
                type="number"
                value={defaultRate}
                onChange={(e) => setDefaultRate(Number(e.target.value))}
                min={0}
                max={100}
                step={0.5}
                className="w-full px-4 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
            <button onClick={saveDefaultRate} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold">Per-Vendor Commission Rates</h2>
          </div>
          {vendors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No approved vendors</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {vendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium">{v.business_name}</p>
                    <p className="text-xs text-gray-500">Current: {v.commission_rate}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-24">
                      <input
                        type="number"
                        value={vendorRates[v.id] ?? v.commission_rate}
                        onChange={(e) => setVendorRates({ ...vendorRates, [v.id]: Number(e.target.value) })}
                        min={0}
                        max={100}
                        step={0.5}
                        className="w-full px-3 py-1.5 pr-7 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                    </div>
                    <button onClick={() => saveVendorRate(v.id)} className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 hover:bg-indigo-200">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
