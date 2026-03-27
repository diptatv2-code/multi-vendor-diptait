'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth-provider';
import { toast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import type { Address } from '@/lib/types';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', country: 'US',
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false });
      setAddresses(data || []);
    }
    fetch();
  }, [user]);

  if (!user || !profile) return <div className="py-10 text-center">Loading...</div>;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from('user_profiles').update({ full_name: fullName, phone }).eq('id', user!.id);
    await refreshProfile();
    toast({ title: 'Profile updated', type: 'success' });
    setSaving(false);
  }

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data } = await supabase.from('addresses').insert({
      user_id: user!.id,
      ...newAddr,
      is_default: addresses.length === 0,
    }).select().single();
    if (data) setAddresses([...addresses, data]);
    setShowAddAddress(false);
    setNewAddr({ label: 'Home', full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'US' });
    toast({ title: 'Address added', type: 'success' });
  }

  async function deleteAddress(id: string) {
    const supabase = createClient();
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(addresses.filter((a) => a.id !== id));
    toast({ title: 'Address removed', type: 'success' });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="space-y-6">
        <form onSubmit={saveProfile} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] p-6 space-y-4">
          <h2 className="font-semibold">Personal Information</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] dark:focus:ring-[#555]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={profile?.email || ''} disabled
              className="w-full px-4 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-gray-100 dark:bg-gray-800 text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] dark:focus:ring-[#555]" />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium hover:bg-[#e0621a] disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#F0F0F0] dark:border-[#222] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Saved Addresses</h2>
            <button onClick={() => setShowAddAddress(true)} className="flex items-center gap-1 text-sm text-[#F57224] font-medium">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {addresses.length === 0 && !showAddAddress && (
            <p className="text-sm text-gray-500">No saved addresses</p>
          )}

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between p-4 rounded-lg border border-[#F0F0F0] dark:border-[#333]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{addr.label}</span>
                    {addr.is_default && <span className="text-xs bg-orange-100 text-[#e0621a] px-2 py-0.5 rounded">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{addr.full_name}</p>
                  <p className="text-sm text-gray-500">{addr.address_line1}, {addr.city}, {addr.state} {addr.postal_code}</p>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                </div>
                <button onClick={() => deleteAddress(addr.id)} className="p-1 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showAddAddress && (
            <form onSubmit={addAddress} className="mt-4 space-y-3 p-4 border border-[#F0F0F0] dark:border-[#333] rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Label (e.g., Home)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
                <input type="text" placeholder="Full Name *" value={newAddr.full_name} onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })} required
                  className="px-3 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
              </div>
              <input type="tel" placeholder="Phone *" value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} required
                className="w-full px-3 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
              <input type="text" placeholder="Address *" value={newAddr.address_line1} onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })} required
                className="w-full px-3 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="City *" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required
                  className="px-3 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
                <input type="text" placeholder="State *" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} required
                  className="px-3 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
                <input type="text" placeholder="ZIP *" value={newAddr.postal_code} onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })} required
                  className="px-3 py-2 rounded-lg border border-[#F0F0F0] dark:border-[#333] bg-[#F5F5F7] dark:bg-[#1A1A1A] text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-[#F57224] text-white rounded-lg text-sm font-medium">Save Address</button>
                <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 border border-[#F0F0F0] dark:border-[#333] rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
