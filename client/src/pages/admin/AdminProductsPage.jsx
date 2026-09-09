import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Package, Check, ToggleLeft, ToggleRight, Sparkles, ExternalLink } from 'lucide-react';
import API from '../../services/api';
import { formatINR } from '../../utils/formatters';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: 10,
    availability: 'In Stock',
    asin: '',
    model: '',
    modelNumber: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadData = async () => {
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        API.get('/products?limit=100'),
        API.get('/categories'),
        API.get('/brands')
      ]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
      setBrands(bRes.data.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingId(p.id || p._id);
    setFormData({
      name: p.title || p.name || '',
      brand: typeof p.brand === 'object' ? p.brand?.name || '' : (p.brand || ''),
      category: typeof p.category === 'object' ? p.category?.slug || p.category?.name || '' : (p.category || ''),
      price: p.price ?? p.lowestPrice ?? '',
      originalPrice: p.originalPrice ?? p.highestPrice ?? '',
      stock: p.stock ?? 10,
      availability: p.availability || (p.isActive ? 'In Stock' : 'Out of Stock'),
      asin: p.asin || '',
      model: p.model || '',
      modelNumber: p.modelNumber || '',
      description: p.description || '',
      image: p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      isActive: p.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.name,
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: formData.price !== '' ? Number(formData.price) : null,
        originalPrice: formData.originalPrice !== '' ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock || 10),
        availability: formData.availability,
        asin: formData.asin,
        model: formData.model,
        modelNumber: formData.modelNumber,
        description: formData.description,
        image: formData.image,
        images: [formData.image],
        isActive: formData.isActive
      };

      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
      } else {
        await API.post('/products', payload);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await API.delete(`/products/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleToggleActive = async (p) => {
    const targetId = p.id || p._id;
    try {
      await API.put(`/products/${targetId}`, { isActive: !p.isActive });
      loadData();
    } catch (err) {
      alert('Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Product Catalog Management</h2>
          <p className="text-xs text-slate-400">Manage real store products, set prices, stock, & matching Amazon ASINs.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Product Name</th>
              <th className="py-3.5 px-4">Brand</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price (₹)</th>
              <th className="py-3.5 px-4">Stock Status</th>
              <th className="py-3.5 px-4">Matching ASIN</th>
              <th className="py-3.5 px-4">Active</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No products in catalog. Click "Add Product" to create your first database item.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const title = p.title || p.name || 'Product';
                const img = p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80';
                const brandName = p.brand?.name || (typeof p.brand === 'string' ? p.brand : '-');
                const catName = p.category?.name || (typeof p.category === 'string' ? p.category : '-');
                const priceVal = p.price ?? p.lowestPrice ?? 0;
                const pId = p.id || p._id;

                return (
                  <tr key={pId} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={img} alt={title} className="w-10 h-10 object-contain bg-slate-900 rounded-lg p-1 border border-slate-800 shrink-0" />
                      <div>
                        <span className="font-bold text-white line-clamp-1 max-w-xs block">{title}</span>
                        {p.modelNumber && <span className="text-[10px] text-slate-400">Model: {p.modelNumber}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">{brandName}</td>
                    <td className="py-3 px-4">{catName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{formatINR(priceVal)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        p.availability === 'Out of Stock' 
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800' 
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                      }`}>
                        {p.availability || (p.isActive ? 'In Stock' : 'Disabled')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-amber-400">
                      {p.asin || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Toggle Active Status"
                      >
                        {p.isActive !== false ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-600" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/compare/product/${pId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 inline-flex text-slate-400 hover:text-amber-400 transition-colors"
                        title="Compare Live with Amazon / Market"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pId)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {editingId ? 'Edit Product Details' : 'Add New Catalog Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apple iPhone 16 128 GB Ultramarine"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => {
                      const val = c.slug || c.name;
                      return <option key={c.id || c._id || c.name} value={val}>{c.name}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Brand *</label>
                  <select
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id || b._id || b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Store Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="65900"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Original M.R.P. (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="79900"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Stock Status</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-order">Pre-order</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Amazon ASIN (for 100% Match)</label>
                  <input
                    type="text"
                    value={formData.asin}
                    onChange={(e) => setFormData({ ...formData, asin: e.target.value })}
                    placeholder="B0DGJ7TGDR"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Model Name</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="iPhone 16"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Model Number</label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    placeholder="A3287"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product features, warranty and specifications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isActiveToggle" className="text-slate-300 font-bold">
                  Enable product in live catalog & comparison engine
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs rounded-xl shadow-lg mt-3 transition-colors cursor-pointer"
              >
                {editingId ? 'Save & Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
