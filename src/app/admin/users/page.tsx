'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Users, Ban, CheckCircle } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');

  async function fetchUsers() {
    const supabase = createClient();
    let query = supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    const { data } = await query;
    setUsers(data || []);
  }

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  async function toggleBan(userId: string, banned: boolean) {
    const supabase = createClient();
    await supabase.from('user_profiles').update({ is_banned: !banned }).eq('id', userId);
    toast({ title: banned ? 'User unbanned' : 'User banned', type: 'success' });
    fetchUsers();
  }

  const roles = ['all', 'customer', 'vendor', 'admin', 'delivery_partner'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              roleFilter === r ? 'bg-[#F57224] text-white' : 'bg-white dark:bg-[#111] border border-[#F0F0F0] dark:border-[#222] hover:bg-[#F5F5F7] dark:hover:bg-[#1A1A1A]'
            }`}
          >
            {r.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl border border-[#F0F0F0] dark:border-[#222] overflow-x-auto">
        {users.length === 0 ? (
          <EmptyState icon={<Users className="w-8 h-8 text-gray-400" />} title="No users found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0F0F0] dark:border-[#222] text-left text-[#86868B]">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#F0F0F0] dark:border-[#222]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-medium text-[#F57224]">
                        {getInitials(u.full_name || u.email)}
                      </div>
                      <div>
                        <p className="font-medium">{u.full_name || 'No name'}</p>
                        <p className="text-xs text-[#86868B]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge status={u.role} /></td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${u.is_banned ? 'text-red-600' : 'text-green-600'}`}>
                      {u.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#86868B]">{formatDate(u.created_at)}</td>
                  <td className="px-6 py-4">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleBan(u.id, u.is_banned)}
                        className={`p-1.5 rounded-lg ${u.is_banned ? 'hover:bg-green-50 text-green-600' : 'hover:bg-red-50 text-red-600'}`}
                        title={u.is_banned ? 'Unban' : 'Ban'}
                      >
                        {u.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    )}
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
