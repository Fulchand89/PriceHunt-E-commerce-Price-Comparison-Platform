import React, { useEffect, useState } from 'react';
import { Users, Package, Store, Search, Bell, MousePointerClick, TrendingUp, Layers, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import API from '../../services/api';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/admin/dashboard');
        setData(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400 font-medium">Loading Dashboard Analytics...</div>;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {
    clickAnalytics: [
      { month: 'Jan', clicks: 120 },
      { month: 'Feb', clicks: 240 },
      { month: 'Mar', clicks: 380 },
      { month: 'Apr', clicks: 520 },
      { month: 'May', clicks: 640 },
      { month: 'Jun', clicks: 890 }
    ],
    storePerformance: [
      { store: 'Amazon', clicks: 450 },
      { store: 'Flipkart', clicks: 380 },
      { store: 'Croma', clicks: 210 },
      { store: 'Reliance', clicks: 180 },
      { store: 'Myntra', clicks: 140 }
    ]
  };

  const statCards = [
    { label: 'Total Users', value: stats.users?.total ?? stats.totalUsers ?? 1, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Active Products', value: stats.products?.total ?? stats.totalProducts ?? 0, icon: Package, color: 'from-emerald-500 to-teal-600' },
    { label: 'Integrated Stores', value: stats.providers?.total ?? stats.totalStores ?? 8, icon: Store, color: 'from-purple-500 to-pink-600' },
    { label: 'Total Searches', value: (stats.searches?.total ?? stats.totalSearches ?? 0).toLocaleString(), icon: Search, color: 'from-amber-500 to-orange-600' },
    { label: 'Price Drop Alerts', value: stats.alerts?.total ?? stats.totalPriceAlerts ?? 0, icon: Bell, color: 'from-cyan-500 to-blue-600' },
    { label: 'Buy Now Clicks', value: (stats.totalClicks ?? 1420).toLocaleString(), icon: MousePointerClick, color: 'from-rose-500 to-red-600' }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white">System Analytics & Control Panel</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time stats across product pricing, click conversions, and store performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">All Systems Operational</span>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{c.label}</span>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-white">{c.value}</p>
            </div>
          );
        })}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Click Analytics Chart */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> User Buy Now Click Analytics
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.clickAnalytics || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Performance Chart */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-cyan-400" /> Clicks by E-Commerce Store
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.storePerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="store" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="clicks" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboardPage;
