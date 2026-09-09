import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

const AdminSettingsPage = () => {
  const [threshold, setThreshold] = useState(80);
  const [cronInterval, setCronInterval] = useState('6');
  const [siteName, setSiteName] = useState('PriceHunt');
  const [currency, setCurrency] = useState('INR');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await API.get('/admin/settings');
        const s = res.data.data || res.data || {};
        if (s.threshold) setThreshold(s.threshold);
        if (s.cronInterval) setCronInterval(s.cronInterval);
        if (s.siteName) setSiteName(s.siteName);
        if (s.currency) setCurrency(s.currency);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put('/admin/settings', {
        threshold: Number(threshold),
        cronInterval,
        siteName,
        currency
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white">System & Platform Settings</h2>
        <p className="text-xs text-slate-400">Configure matching score thresholds, platform branding, and price update frequencies.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
        {savedSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" /> Platform settings saved successfully!
          </div>
        )}

        <div>
          <label className="text-slate-400 font-bold block mb-1">Platform Name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-slate-400 font-bold block mb-1">Currency Symbol / Code</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-bold"
          />
        </div>

        <div>
          <label className="text-slate-400 font-bold block mb-1">Product Match Confidence Threshold (%)</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Product match score percentage required to group store listings automatically.
          </p>
        </div>

        <div>
          <label className="text-slate-400 font-bold block mb-1">Price Sync Cron Job Frequency</label>
          <select
            value={cronInterval}
            onChange={(e) => setCronInterval(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="1">Every 1 Hour</option>
            <option value="6">Every 6 Hours (Default)</option>
            <option value="12">Every 12 Hours</option>
            <option value="24">Daily</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
