import React, { useEffect, useState } from 'react';
import { DollarSign, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import API from '../../services/api';
import { formatINR } from '../../utils/formatters';

const AdminPricesPage = () => {
  const [prices, setPrices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDelivery, setEditDelivery] = useState('');

  const loadPrices = async () => {
    try {
      const res = await API.get('/admin/prices');
      setPrices(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const handleSavePrice = async (id) => {
    try {
      await API.put(`/admin/prices/${id}`, {
        price: Number(editPrice),
        deliveryCharge: Number(editDelivery)
      });
      setEditingId(null);
      loadPrices();
    } catch (err) {
      alert('Update price failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this price listing?')) return;
    try {
      await API.delete(`/admin/prices/${id}`);
      loadPrices();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Price Listings Management</h2>
        <p className="text-xs text-slate-400">View and adjust store-specific product prices, delivery charges, and final costs.</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Store</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4">Delivery (₹)</th>
                <th className="py-3.5 px-4">Final Price (₹)</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No price listings found.
                  </td>
                </tr>
              ) : (
                prices.map((item) => {
                  const pId = item.id || item._id;
                  const isEditing = editingId === pId;
                  const prodName = item.product?.title || item.product?.name || item.title || 'Product';
                  const storeName = item.store?.name || item.provider || item.seller || 'Store';
                  const finalPriceVal = item.finalPrice ?? ((item.price || 0) + (item.shippingCost || item.deliveryCharge || 0));
                  const deliveryVal = item.deliveryCharge ?? item.shippingCost ?? 0;

                  return (
                    <tr key={pId} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                        {prodName}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">{storeName}</span>
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                        ) : (
                          formatINR(item.price)
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDelivery}
                            onChange={(e) => setEditDelivery(e.target.value)}
                            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                        ) : (
                          deliveryVal === 0 ? 'FREE' : formatINR(deliveryVal)
                        )}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400">
                        {formatINR(finalPriceVal)}
                      </td>
                      <td className="py-3 px-4">
                        {item.discountPercentage > 0 ? `${item.discountPercentage}% OFF` : (item.discount > 0 ? `${item.discount}% OFF` : '-')}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isEditing ? (
                          <button onClick={() => handleSavePrice(pId)} className="bg-emerald-600 px-3 py-1 rounded text-white font-bold cursor-pointer">
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(pId);
                              setEditPrice(item.price);
                              setEditDelivery(deliveryVal);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                            title="Edit Price"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(pId)} className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer" title="Delete Price">
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
      </div>
    </div>
  );
};

export default AdminPricesPage;
