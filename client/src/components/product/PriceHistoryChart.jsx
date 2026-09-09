import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatINR, formatDate } from '../../utils/formatters';

const PriceHistoryChart = ({ priceHistory, historyRange, setHistoryRange, lowestPrice, highestPrice }) => {
  const chartData = (priceHistory?.data || []).map((item) => ({
    date: formatDate(item.date || item.recordedAt),
    price: item.price || item.totalCost || item.finalPrice,
    provider: item.provider || 'Store'
  }));

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Price History Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Historical price trend analytics to help you decide the best time to buy.</p>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
          {[
            { label: '7D', value: '7d' },
            { label: '30D', value: '30d' },
            { label: '3M', value: '3m' },
            { label: '6M', value: '6m' },
            { label: '1Y', value: '1y' }
          ].map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setHistoryRange(r.value)}
              className={`text-[11px] font-bold uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all ${
                historyRange === r.value ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
        <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-0.5 sm:space-y-1">
          <span className="font-bold uppercase text-[10px] sm:text-xs text-slate-400">Current Price</span>
          <p className="text-base sm:text-lg font-black text-slate-900">{formatINR(lowestPrice)}</p>
        </div>
        <div className="bg-emerald-50/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-200/80 space-y-0.5 sm:space-y-1">
          <span className="font-bold uppercase text-[10px] sm:text-xs text-emerald-700">Lowest Recorded</span>
          <p className="text-base sm:text-lg font-black text-emerald-700">{formatINR(priceHistory?.stats?.lowest || lowestPrice)}</p>
        </div>
        <div className="bg-rose-50/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-rose-200/80 space-y-0.5 sm:space-y-1">
          <span className="font-bold uppercase text-[10px] sm:text-xs text-rose-700">Highest Recorded</span>
          <p className="text-base sm:text-lg font-black text-rose-700">{formatINR(priceHistory?.stats?.highest || highestPrice)}</p>
        </div>
        <div className="bg-blue-50/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-200/80 space-y-0.5 sm:space-y-1">
          <span className="font-bold uppercase text-[10px] sm:text-xs text-blue-700">Average Price</span>
          <p className="text-base sm:text-lg font-black text-blue-700">{formatINR(priceHistory?.stats?.average || lowestPrice)}</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-60 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              formatter={(value) => [formatINR(value), 'Price']}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 4, fill: '#059669' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
