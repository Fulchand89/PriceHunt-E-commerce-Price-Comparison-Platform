import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import API from '../../services/api';

const AdminBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadBrands = async () => {
    try {
      const res = await API.get('/brands');
      setBrands(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/brands/${editingId}`, { name, logo, description });
      } else {
        await API.post('/brands', { name, logo, description });
      }
      setName('');
      setLogo('');
      setDescription('');
      setEditingId(null);
      loadBrands();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleStartEdit = (b) => {
    setEditingId(b.id || b._id);
    setName(b.name || '');
    setLogo(b.logo || '');
    setDescription(b.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setLogo('');
    setDescription('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete brand?')) return;
    try {
      await API.delete(`/brands/${id}`);
      loadBrands();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Brand Management</h2>
          <p className="text-xs text-slate-400">Manage supported manufacturer brands and logos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSaveBrand} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs h-fit">
          <h3 className="font-bold text-white text-sm">{editingId ? 'Edit Brand' : 'Add New Brand'}</h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OnePlus"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://logo.clearbit.com/oneplus.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Slogan / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Never Settle"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl transition-colors cursor-pointer">
              {editingId ? 'Update Brand' : 'Save Brand'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {brands.map((b) => {
              const brandId = b.id || b._id;
              const logoUrl = b.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80';
              return (
                <div key={brandId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center shrink-0">
                      <img src={logoUrl} alt={b.name} className="max-h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.name}</h4>
                      <span className="text-[10px] text-slate-400">{b.description || 'Verified'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleStartEdit(b)} className="text-slate-400 hover:text-emerald-400 p-2 cursor-pointer" title="Edit">
                      ✎
                    </button>
                    <button onClick={() => handleDelete(brandId)} className="text-slate-400 hover:text-rose-400 p-2 cursor-pointer" title="Delete">
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

export default AdminBrandsPage;
