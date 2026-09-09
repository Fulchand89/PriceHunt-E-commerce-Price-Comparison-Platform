import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Package, Grid, Award, Store, DollarSign, GitCompare,
  Users, Bell, BarChart3, Settings, ArrowLeft, LogOut, Menu, X, ShieldAlert, Tag
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Grid },
    { label: 'Brands', path: '/admin/brands', icon: Award },
    { label: 'Stores', path: '/admin/stores', icon: Store },
    { label: 'Sellers', path: '/admin/sellers', icon: Users },
    { label: 'Prices', path: '/admin/prices', icon: DollarSign },
    { label: 'Offers & Coupons', path: '/admin/offers', icon: Tag },
    { label: 'Banners CMS', path: '/admin/banners', icon: LayoutDashboard },
    { label: 'Blog CMS', path: '/admin/blog', icon: BarChart3 },
    { label: 'FAQs CMS', path: '/admin/faqs', icon: Bell },
    { label: 'Product Matching', path: '/admin/product-matching', icon: GitCompare },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Price Alerts', path: '/admin/price-alerts', icon: Bell },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Admin Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg">
              🛡️
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white">PriceHunt</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Admin Console</span>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Back to Store */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>

          <div className="flex items-center justify-between pt-2 px-2">
            <div className="flex items-center gap-2.5">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full border border-emerald-500 object-cover"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white truncate max-w-[100px]">{user?.name}</span>
                <span className="text-[10px] text-slate-400 uppercase">{user?.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1.5" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Admin Body */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white capitalize">
              {location.pathname.split('/')[2]?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Price Synchronization Active
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
