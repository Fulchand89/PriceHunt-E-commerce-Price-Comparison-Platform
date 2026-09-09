import React, { useEffect, useState } from 'react';
import { Trash2, UserCheck, Plus, Star } from 'lucide-react';
import API from '../../services/api';

const AdminSellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [name, setName] = useState('');
  const [store, setStore] = useState('Appario Retail Private Ltd');
  const [rating, setRating] = useState('4.8');
  const [reviewCount, setReviewCount] = useState('14500');

  const loadSellers = async () => {
    try {
      const res = await API.get('/sellers');
      setSellers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      await API.post('/sellers', {
        name,
        store,
        rating: Number(rating),
        reviewCount: Number(reviewCount),
        isActive: true
      });
      setName('');
      setRating('4.8');
      setReviewCount('14500');
      loadSellers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add seller');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete seller record?')) return;
    try {
      await API.delete(`/sellers/${id}`);
      loadSellers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Store Merchant & Seller Accounts</h2>
        <p className="text-xs text-slate-400">View and manage merchant sellers, store affiliations, and seller trust ratings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAddSeller} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs h-fit">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" /> Add Verified Seller
          </h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Seller / Merchant Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appario Retail Private Ltd"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Associated Store</label>
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Amazon / Flipkart"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Rating (★)</label>
              <input
                type="number"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-bold block mb-1">Total Reviews</label>
              <input
                type="number"
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl transition-colors cursor-pointer">
            Save Seller
          </button>
        </form>

        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sellers.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 py-8 text-xs">
                No merchant sellers added yet. Add a seller above.
              </div>
            ) : (
              sellers.map((s) => {
                const sId = s.id || s._id;
                const storeName = typeof s.store === 'object' ? s.store?.name : (s.store || 'Verified Store');
                return (
                  <div key={sId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      <span className="text-emerald-400 font-semibold block">{storeName}</span>
                      <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
                        ★ {s.rating || 4.5} <span className="text-slate-500">({(s.reviewCount || 0).toLocaleString()} reviews)</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-emerald-500/30">
                        Verified
                      </span>
                      <button onClick={() => handleDelete(sId)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSellersPage;
