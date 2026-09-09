import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Grid } from 'lucide-react';
import API from '../../services/api';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/categories/${editingId}`, { name, description, image });
      } else {
        await API.post('/categories', { name, description, image });
      }
      setName('');
      setDescription('');
      setImage('');
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleStartEdit = (c) => {
    setEditingId(c.id || c._id);
    setName(c.name || '');
    setDescription(c.description || '');
    setImage(c.image || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      loadCategories();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Category Management</h2>
          <p className="text-xs text-slate-400">Manage e-commerce categories and image assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSaveCategory} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs h-fit">
          <h3 className="font-bold text-white text-sm">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smart Wearables"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl transition-colors cursor-pointer">
              {editingId ? 'Update Category' : 'Save Category'}
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
            {categories.map((c) => {
              const catId = c.id || c._id;
              const img = c.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&auto=format&fit=crop&q=80';
              return (
                <div key={catId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={img} alt={c.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.name}</h4>
                      <span className="text-[10px] text-emerald-400">{c.productCount || 0} Products</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleStartEdit(c)} className="text-slate-400 hover:text-emerald-400 p-2 cursor-pointer" title="Edit">
                      ✎
                    </button>
                    <button onClick={() => handleDelete(catId)} className="text-slate-400 hover:text-rose-400 p-2 cursor-pointer" title="Delete">
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

export default AdminCategoriesPage;
