import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchPriceAlerts, deletePriceAlert } from '../../redux/slices/priceAlertSlice';
import { formatINR } from '../../utils/formatters';

const PriceAlertsPage = () => {
  const dispatch = useDispatch();
  const { alerts, loading } = useSelector((state) => state.priceAlerts);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPriceAlerts());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to manage Price Alerts</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Set target prices for products and receive email notifications as soon as prices drop.
        </p>
        <Link
          to="/login"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg"
        >
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Price Drop Alerts</h1>
        <p className="text-sm text-slate-500 mt-1">We track prices 24/7 and alert you when prices reach your target threshold.</p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Active Price Alerts</h3>
          <p className="text-slate-500 text-sm">Search for any product and click "Set Price Alert" to begin tracking.</p>
          <Link to="/search" className="inline-block bg-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded-full">
            Find Products to Track
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const prod = alert.product || {};
            const title = prod.title || prod.name || 'Tracked Product';
            const img = prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=150&auto=format&fit=crop&q=80';
            const brandName = prod.brand?.name || (typeof prod.brand === 'string' ? prod.brand : 'Brand');
            const currentLowest = alert.currentLowestPrice || prod.lowestPrice || 0;
            const isMet = currentLowest <= alert.targetPrice;

            return (
              <div key={alert._id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 flex flex-col justify-between shadow-sm">
                <div className="flex gap-4">
                  <img
                    src={img}
                    alt={title}
                    className="w-16 h-16 object-contain bg-slate-50 rounded-xl p-1.5 border border-slate-100 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-600">{brandName}</span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                      <Link to={`/products/${prod._id}`}>{title}</Link>
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Target Price</span>
                    <p className="text-base font-black text-slate-900">{formatINR(alert.targetPrice)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Current Price</span>
                    <p className={`text-base font-black ${isMet ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {formatINR(currentLowest)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {isMet ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Target Reached!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Tracking Price...
                    </span>
                  )}

                  <button
                    onClick={() => dispatch(deletePriceAlert(alert._id))}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriceAlertsPage;
