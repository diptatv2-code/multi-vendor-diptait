'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Store, CheckCircle, XCircle, Ban } from 'lucide-react';
import type { VendorProfile } from '@/lib/types';

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  async function fetchVendors() {
    const supabase = createClient();
    let query = supabase.from('vendor_profiles').select('*, user_profile:user_profiles!vendor_profiles_user_id_fkey(*)').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setVendors((data as unknown as VendorProfile[]) || []);
    setLoading(false);
  }

  useEffect(() => { fetchVendors(); }, [filter]);

  async function updateStatus(vendorId: string, status: string, userId: string, newRole?: string) {
    const supabase = createClient();
    await supabase.from('vendor_profiles').update({ status }).eq('id', vendorId);
    if (newRole) {
      await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);
    }
    toast({ title: `Vendor ${status}`, type: 'success' });
    fetchVendors();
  }

  const filters = ['all', 'pending', 'approved', 'rejected', 'suspended'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Vendor Management</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              filter === f ? 'bg-[#F57224] text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        {vendors.length === 0 ? (
          <EmptyState icon={<Store className="w-8 h-8 text-gray-400" />} title="No vendors found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Commission</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {v.logo_url ? (
                        <img src={v.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <Store className="w-5 h-5 text-[#F57224]" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{v.business_name}</p>
                        <p className="text-xs text-gray-500">{v.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{v.user_profile?.full_name}</td>
                  <td className="px-6 py-4"><Badge status={v.status} /></td>
                  <td className="px-6 py-4">{v.commission_rate}%</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(v.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {v.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(v.id, 'approved', v.user_id, 'vendor')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(v.id, 'rejected', v.user_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {v.status === 'approved' && (
                        <button onClick={() => updateStatus(v.id, 'suspended', v.user_id)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600" title="Suspend">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {v.status === 'suspended' && (
                        <button onClick={() => updateStatus(v.id, 'approved', v.user_id, 'vendor')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Reactivate">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
