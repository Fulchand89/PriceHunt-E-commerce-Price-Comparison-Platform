import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';
import { formatINR } from '../../utils/formatters';

const AdminPriceAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await API.get('/price-alerts');
        setAlerts(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">System Price Drop Alerts</h2>
        <p className="text-xs text-slate-400">View user-configured price alerts and notification triggers.</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-8">No price alerts registered.</div>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => {
              const alertId = a.id || a._id;
              const prodName = a.product?.title || a.product?.name || a.productName || 'Product';
              return (
                <div key={alertId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{prodName}</h4>
                    <span className="text-slate-400">Target Price Threshold: <strong className="text-emerald-400">{formatINR(a.targetPrice)}</strong></span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                    Active Tracking
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPriceAlertsPage;
