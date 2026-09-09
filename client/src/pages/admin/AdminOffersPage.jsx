import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, Ticket } from 'lucide-react';
import API from '../../services/api';

const AdminOffersPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [store, setStore] = useState('Amazon');
  const [discount, setDiscount] = useState('10% OFF');
  const [description, setDescription] = useState('');

  const loadCoupons = async () => {
    try {
      const res = await API.get('/coupons');
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await API.post('/offers', {
        title,
        code,
        store,
        discount,
        discountValue: discount,
        description,
        isActive: true
      });
      setTitle('');
      setCode('');
      setDiscount('10% OFF');
      setDescription('');
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create offer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon offer?')) return;
    try {
      await API.delete(`/offers/${id}`);
      loadCoupons();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Coupons & Bank Offers Management</h2>
        <p className="text-xs text-slate-400">Create & manage promotional discount codes and bank partner cashback offers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD COUPON FORM */}
        <form onSubmit={handleAddCoupon} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs h-fit">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Ticket className="w-4 h-4 text-emerald-400" /> Add New Coupon / Bank Offer
          </h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Offer Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HDFC Credit Card 10% Instant Discount"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Promo Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="HDFC10"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500 uppercase"
              />
            </div>
            <div>
              <label className="text-slate-400 font-bold block mb-1">Store *</label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Croma">Croma</option>
                <option value="Myntra">Myntra</option>
                <option value="Reliance Digital">Reliance Digital</option>
                <option value="All Stores">All Stores</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Discount Tag</label>
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="10% OFF up to ₹1,500"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Description / Terms</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Applicable on minimum order of ₹10,000 on credit card EMI..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl transition-colors cursor-pointer">
            Save Coupon
          </button>
        </form>

        {/* COUPONS LIST */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 py-8 text-xs">
                No active promo coupons. Add your first promo code above.
              </div>
            ) : (
              coupons.map((c) => {
                const cId = c.id || c._id;
                const storeName = typeof c.store === 'object' ? c.store?.name : (c.store || 'Store');
                return (
                  <div key={cId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs relative flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-extrabold text-emerald-400 bg-slate-950 border border-emerald-900/50 px-2.5 py-1 rounded">
                          {c.code}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase">{storeName}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{c.title}</h4>
                      <p className="text-slate-400 text-[11px] line-clamp-2">{c.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-amber-400">{c.discountValue || c.discount || 'DEAL'}</span>
                      <button onClick={() => handleDelete(cId)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer">
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

export default AdminOffersPage;
