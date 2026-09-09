import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Heart, Bell, Settings, ShieldCheck, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import WishlistPage from './WishlistPage';
import PriceAlertsPage from './PriceAlertsPage';

const UserDashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { alerts } = useSelector((state) => state.priceAlerts);

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* USER PROFILE HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-700">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
          />
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold">{user?.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
            <p className="text-slate-400 text-xs flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-300 block">Wishlist Saved</span>
            <span className="text-xl font-black text-emerald-400">{wishlistItems?.length || 0}</span>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-300 block">Active Alerts</span>
            <span className="text-xl font-black text-cyan-400">{alerts?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'wishlist', label: 'My Wishlist', icon: Heart },
          { id: 'alerts', label: 'Price Alerts', icon: Bell },
          { id: 'settings', label: 'Profile Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" /> Recent Wishlist Items
            </h3>
            <p className="text-xs text-slate-500">Quick view of saved products and live store lowest prices.</p>
            <div className="pt-2">
              <WishlistPage />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" /> Active Price Alerts
            </h3>
            <p className="text-xs text-slate-500">Track target price limits and notifications.</p>
            <div className="pt-2">
              <PriceAlertsPage />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && <WishlistPage />}
      {activeTab === 'alerts' && <PriceAlertsPage />}

      {activeTab === 'settings' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-2xl space-y-6">
          <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Profile Settings</h3>
          <div className="space-y-4 text-sm font-medium">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Email Address</label>
              <input
                type="email"
                defaultValue={user?.email}
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-4 py-2.5 cursor-not-allowed"
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md">
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboardPage;
