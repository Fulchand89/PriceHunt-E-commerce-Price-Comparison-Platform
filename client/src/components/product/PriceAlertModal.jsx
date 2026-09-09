import React from 'react';
import { Bell, X } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const PriceAlertModal = ({ isOpen, onClose, lowestPrice, targetPrice, setTargetPrice, handleCreateAlertSubmit, alertSuccessMsg }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-6 relative text-xs animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Set Target Price Alert</h3>
            <p className="text-slate-500 text-[11px] sm:text-xs">Get notified via email &amp; app when price drops to your target.</p>
          </div>
        </div>

        {alertSuccessMsg ? (
          <div className="p-4 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-2xl text-center border border-emerald-200">
            {alertSuccessMsg}
          </div>
        ) : (
          <form onSubmit={handleCreateAlertSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <label className="font-bold uppercase text-slate-400 text-[10px] block mb-0.5">Current Lowest Price</label>
              <p className="text-xl font-black text-emerald-600">{formatINR(lowestPrice)}</p>
            </div>

            <div>
              <label className="font-bold uppercase text-slate-500 text-[10px] block mb-1.5">Your Target Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 59999"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-semibold text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all touch-target"
            >
              Create Price Alert
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PriceAlertModal;
