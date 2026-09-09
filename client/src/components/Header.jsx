import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Heart, Bell, User, LogOut, Shield, ChevronDown, Menu, X,
  Tag, TrendingDown, Layers, ShoppingBag, Smartphone, Download,
  Scale, Search
} from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import { logout } from '../redux/slices/authSlice';

const Header = ({ onOpenDownloadModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { categories } = useSelector((state) => state.categories);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setIsCategoriesOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Track window scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const isHomeActive = location.pathname === '/';
  const isCategoriesActive = location.pathname === '/categories' || location.search.includes('category=');
  const isDealsActive = location.pathname.startsWith('/deals');
  const isCompareActive = location.pathname.startsWith('/compare');

  return (
    <header
      className={`sticky top-0 z-40 bg-slate-100 backdrop-blur-md border-b border-slate-200/90 text-slate-800 transition-all duration-200 ${isScrolled ? 'shadow-md shadow-slate-900/5' : 'shadow-xs'
        }`}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* TOP ROW: [PRICEHUNT LOGO] [Home  Categories  Deals  Compare] [👤 Login / Profile] */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">

          {/* Left: Official Brand Logo */}
          <Link to="/" className="flex items-center group shrink-0 select-none">
            <img
              src="/pricehunt-logo.png"
              alt="PriceHunt"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Center: Navigation Links (Home, Categories, Deals, Compare) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold">
            {/* Home */}
            <Link
              to="/"
              className={`transition-colors py-1 ${isHomeActive ? 'text-emerald-600 font-extrabold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-600'
                }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 transition-colors py-2 cursor-pointer font-semibold ${isCategoriesActive ? 'text-emerald-600 font-extrabold' : 'text-slate-600 hover:text-emerald-600'
                  }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 mb-1 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Top Categories</span>
                  </div>
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat._id || cat.id || cat.slug}
                      to={`/search?category=${encodeURIComponent(cat.slug || cat.name)}`}
                      className="flex items-center justify-between px-4 py-2 hover:bg-emerald-50/70 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition-colors"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-emerald-700 rounded-full shrink-0">
                        {cat.productCount || 0}
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2 px-4">
                    <Link to="/categories" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-between group">
                      <span>View All Categories</span>
                      <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Deals */}
            <Link
              to="/deals"
              className={`flex items-center gap-1.5 transition-colors py-1 ${isDealsActive ? 'text-emerald-600 font-extrabold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-600'
                }`}
            >
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Deals</span>
            </Link>

            {/* Compare */}
            <Link
              to="/compare"
              className={`flex items-center gap-1.5 transition-colors py-1 ${isCompareActive ? 'text-emerald-600 font-extrabold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-600'
                }`}
            >
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Compare</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Live
              </span>
            </Link>
          </nav>

          {/* Right Action Icons & 👤 Login / Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              title="My Wishlist"
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors relative"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems?.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Price Alerts Icon */}
            <Link
              to="/alerts"
              title="Price Alerts"
              className="hidden sm:flex p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
            </Link>

            {/* 👤 Login / User Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative shrink-0" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(v => !v)}
                  aria-label="User profile menu"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 hover:border-emerald-500/60 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-xs"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user?.name || 'Profile'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                  />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        {user?.role} Account
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>User Dashboard</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>My Wishlist</span>
                      </Link>

                      <Link
                        to="/alerts"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Price Alerts</span>
                      </Link>

                      {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Shield className="w-4 h-4 text-emerald-600" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold transition-all shadow-xs"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Hamburger (< md) */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
            </button>

          </div>
        </div>

        {/* BOTTOM ROW: [ 🔍 Search products, brands & categories... ] */}
        <div className="pb-3.5 pt-1 flex justify-center w-full">
          <div className="w-full max-w-2xl sm:max-w-3xl">
            <SearchAutocomplete
              placeholder="Search products, brands & categories..."
            />
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Slide-in panel */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 overflow-y-auto">

            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <img
                  src="/pricehunt-logo.png"
                  alt="PriceHunt"
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User card if logged in */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50/60 border-b border-emerald-100">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-0.5 text-[8.5px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    {user?.role} Account
                  </span>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">

              {/* Main Navigation */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-1.5">
                  Navigation
                </span>
                <div className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${isHomeActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Home</span>
                  </Link>

                  <Link
                    to="/categories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${isCategoriesActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Categories</span>
                  </Link>

                  <Link
                    to="/deals"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${isDealsActive ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span>Deals</span>
                  </Link>

                  <Link
                    to="/compare"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${isCompareActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      <span>Compare</span>
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-600 text-white rounded-full">
                      Live
                    </span>
                  </Link>
                </div>
              </div>

              {/* Saved & Alerts */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-1.5">
                  Saved & Tracking
                </span>
                <div className="space-y-1">
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Wishlist</span>
                    </span>
                    {wishlistItems?.length > 0 && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/alerts"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Price Alerts</span>
                  </Link>
                </div>
              </div>

              {/* Admin Console (if applicable) */}
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 px-3 block mb-1.5">
                    Administration
                  </span>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Admin Console</span>
                  </Link>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDownloadModal();
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-all cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Get Mobile App</span>
                </span>
                <Download className="w-4 h-4" />
              </button>

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
