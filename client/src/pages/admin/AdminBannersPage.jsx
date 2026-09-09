import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image } from 'lucide-react';
import API from '../../services/api';

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/search');

  const loadBanners = async () => {
    try {
      const res = await API.get('/banners');
      setBanners(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      await API.post('/banners', { title, subtitle, imageUrl, linkUrl });
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      loadBanners();
    } catch (err) {
      alert('Failed to add banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete banner?')) return;
    try {
      await API.delete(`/banners/${id}`);
      loadBanners();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Homepage Banners CMS</h2>
        <p className="text-xs text-slate-400">Manage hero section carousel banners dynamically stored in MongoDB.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAddBanner} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm">Add New Banner</h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Banner Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Subtitle</label>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Image URL</label>
            <input type="text" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-emerald-600 font-bold text-white rounded-xl">Save Banner</button>
        </form>

        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {banners.map((b) => {
              const bId = b.id || b._id;
              return (
                <div key={bId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={b.imageUrl} alt={b.title} className="w-16 h-12 object-cover rounded-xl shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.title}</h4>
                      <span className="text-[10px] text-slate-400">{b.subtitle}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(bId)} className="text-slate-500 hover:text-rose-400 p-2 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBannersPage;
