'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase.from('site_settings').select('*');
      const map: Record<string, string> = {};
      data?.forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
    }
    fetch();
  }, []);

  function updateSetting(key: string, value: string) {
    setSettings({ ...settings, [key]: value });
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    toast({ title: 'Settings saved', type: 'success' });
    setSaving(false);
  }

  const fields = [
    { key: 'site_name', label: 'Site Name', type: 'text' },
    { key: 'site_description', label: 'Site Description', type: 'textarea' },
    { key: 'currency', label: 'Currency Code', type: 'text' },
    { key: 'currency_symbol', label: 'Currency Symbol', type: 'text' },
    { key: 'default_commission_rate', label: 'Default Commission Rate (%)', type: 'number' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-1.5">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={settings[field.key] || ''}
                onChange={(e) => updateSetting(field.key, e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <input
                type={field.type}
                value={settings[field.key] || ''}
                onChange={(e) => updateSetting(field.key, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-md"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
