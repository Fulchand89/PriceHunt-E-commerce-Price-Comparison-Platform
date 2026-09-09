import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Store, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import API from '../../services/api';

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [logo, setLogo] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadStores = async () => {
    try {
      const res = await API.get('/stores');
      setStores(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleSaveStore = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/stores/${editingId}`, { name, websiteUrl, affiliateUrl, logo });
      } else {
        await API.post('/stores', { name, websiteUrl, affiliateUrl, logo });
      }
      setName('');
      setWebsiteUrl('');
      setAffiliateUrl('');
      setLogo('');
      setEditingId(null);
      loadStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleStartEdit = (s) => {
    setEditingId(s.id || s._id);
    setName(s.name || '');
    setWebsiteUrl(s.websiteUrl || '');
    setAffiliateUrl(s.affiliateUrl || '');
    setLogo(s.logo || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setWebsiteUrl('');
    setAffiliateUrl('');
    setLogo('');
  };

  const handleToggleStatus = async (store) => {
    const sId = store.id || store._id;
    try {
      await API.put(`/stores/${sId}`, { status: !store.status, isActive: !store.status });
      loadStores();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete store integration?')) return;
    try {
      await API.delete(`/stores/${id}`);
      loadStores();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">E-Commerce Store Management</h2>
          <p className="text-xs text-slate-400">Configure supported stores, website URLs, and affiliate parameter templates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSaveStore} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs h-fit">
          <h3 className="font-bold text-white text-sm">{editingId ? 'Edit Store' : 'Add New Store Integration'}</h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nykaa"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Website URL *</label>
            <input
              type="text"
              required
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://www.nykaa.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Affiliate Template URL</label>
            <input
              type="text"
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://www.nykaa.com/?aff=pricehunt"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://logo.clearbit.com/nykaa.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl transition-colors cursor-pointer">
              {editingId ? 'Update Store' : 'Save Store'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stores.map((s) => {
              const storeId = s.id || s._id;
              return (
                <div key={storeId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center shrink-0">
                      {s.logo ? (
                        <img src={s.logo} alt={s.name} className="max-h-full object-contain" />
                      ) : (
                        <span className="font-bold text-slate-800 text-sm">{s.name ? s.name[0] : 'S'}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      {s.websiteUrl && (
                        <a href={s.websiteUrl} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1">
                          Visit Store <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleStartEdit(s)} className="text-slate-400 hover:text-emerald-400 p-1 cursor-pointer" title="Edit">
                      ✎
                    </button>
                    <button onClick={() => handleToggleStatus(s)} className="text-slate-400 hover:text-emerald-400 cursor-pointer" title="Toggle Status">
                      {s.status !== false ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                    </button>
                    <button onClick={() => handleDelete(storeId)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStoresPage;
