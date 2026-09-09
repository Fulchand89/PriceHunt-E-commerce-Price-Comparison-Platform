import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Package, Grid, Award, Store, DollarSign, GitCompare,
  Users, Bell, BarChart3, Settings, ArrowLeft, LogOut, Menu, X, ShieldCheck, Tag,
  ExternalLink, Search, ChevronDown, UserCheck
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  const profileMenuRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsSidebarOpen(false);
  }, [location.pathname]);

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

  const handleAdminSearch = (e) => {
    if (e.key === 'Enter' && adminSearchQuery.trim()) {
      navigate(`/admin/products?q=${encodeURIComponent(adminSearchQuery.trim())}`);
      setAdminSearchQuery('');
    }
  };

  const currentPageTitle = location.pathname.split('/')[2]?.replace('-', ' ') || 'Dashboard';

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Desktop & Mobile Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Admin Sidebar Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <img 
              src="/pricehunt-icon.png" 
              alt="PriceHunt" 
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black tracking-tight text-white">PriceHunt</span>
              <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">Admin Console</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Back to Store at Bottom of Sidebar */}
        <div className="p-3.5 border-t border-slate-800 space-y-2 bg-slate-950/80">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 
            <span>Back to Storefront</span>
          </Link>

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-7 h-7 rounded-full border border-emerald-500/50 object-cover shrink-0"
              />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-white truncate max-w-[90px]">{user?.name}</span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">{user?.role}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer" 
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Professional Top Admin Navbar */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Admin</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-white font-bold capitalize text-sm sm:text-base truncate">
                {currentPageTitle}
              </span>
            </div>
          </div>

          {/* Center: Admin Quick Search */}
          <div className="hidden md:flex items-center relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search catalog... (Press Enter)"
              value={adminSearchQuery}
              onChange={(e) => setAdminSearchQuery(e.target.value)}
              onKeyDown={handleAdminSearch}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Right Action Icons & Profile Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Live Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Sync Active</span>
            </div>

            {/* Quick Switch: View Public Storefront */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all group"
              title="Open public website in a new tab"
            >
              <span className="hidden sm:inline">Live Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </Link>

            {/* Price Alerts Bell */}
            <Link
              to="/admin/price-alerts"
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
              title="Price Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
            </Link>

            {/* Admin Profile Dropdown Menu in Top Header */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(v => !v)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900 transition-all cursor-pointer"
                aria-label="Admin account menu"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/60"
                />
                <span className="hidden sm:block text-xs font-bold text-slate-200 max-w-[90px] truncate">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                      {user?.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/admin/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>System Settings</span>
                    </Link>

                    <Link
                      to="/"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-400" />
                      <span>Storefront Home</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
