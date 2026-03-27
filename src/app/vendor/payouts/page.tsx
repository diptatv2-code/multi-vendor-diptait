'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, formatDate } from '@/lib/utils';
import { DollarSign } from 'lucide-react';
import type { Payout, VendorProfile } from '@/lib/types';

export default function VendorPayoutsPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data: v } = await supabase.from('vendor_profiles').select('*').eq('user_id', user!.id).single();
      if (!v) return;
      setVendor(v);

      const { data } = await supabase.from('payouts').select('*').eq('vendor_id', v.id).order('created_at', { ascending: false });
      setPayouts(data || []);
    }
    fetch();
  }, [user]);

  if (!user) return <div className="py-10 text-center">Loading...</div>;

  const totalPaid = payouts.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payouts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#111] rounded-xl p-5 border border-[#F0F0F0] dark:border-[#222]">
          <p className="text-xs text-[#86868B] mb-1">Total Revenue</p>
          <p className="text-xl font-bold">{formatPrice(vendor?.total_revenue || 0)}</p>
        </div>
        <div className="bg-white dark:bg-[#111] rounded-xl p-5 border border-[#F0F0F0] dark:border-[#222]">
          <p className="text-xs text-[#86868B] mb-1">Total Paid</p>
          <p className="text-xl font-bold text-green-600">{formatPrice(totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-[#111] rounded-xl p-5 border border-[#F0F0F0] dark:border-[#222]">
          <p className="text-xs text-[#86868B] mb-1">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{formatPrice(totalPending)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-[#F0F0F0] dark:border-[#222] overflow-x-auto">
        {payouts.length === 0 ? (
          <EmptyState icon={<DollarSign className="w-8 h-8 text-gray-400" />} title="No payouts yet" description="Your payout history will appear here" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] dark:border-[#222] text-left text-[#86868B]">
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-[#F0F0F0] dark:border-[#222]">
                  <td className="px-6 py-3">{formatDate(p.period_start)} - {formatDate(p.period_end)}</td>
                  <td className="px-6 py-3 font-medium">{formatPrice(p.amount)}</td>
                  <td className="px-6 py-3">{p.method || 'N/A'}</td>
                  <td className="px-6 py-3"><Badge status={p.status} /></td>
                  <td className="px-6 py-3 text-[#86868B]">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
